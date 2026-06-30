import {
  LEADERBOARD_METRICS,
  getLeaderboardMetric,
  getLeaderboardMetricValue
} from "./leaderboards.js";
import { getPrestigeLevel } from "./state.js";

const LEADERBOARD_CACHE_MS = 60000;
const SCORE_DETAIL_SCHEMA_VERSION = 1;
const PACKED_SCORE_DETAIL_SCHEMA_BASE = 100;
const SCORE_SIGNIFICAND_SCALE = 100000000;
const SCORE_BUCKET_SIZE = 6000000;
const SCORE_BUCKET_MAX = SCORE_BUCKET_SIZE - 1;
const SCORE_SYNC_DELAY_MS = 1500;

let steamStatus = {
  checked: false,
  available: false,
  appId: 0,
  steamId: "",
  personaName: "",
  message: "Checking Steam connection..."
};
let updateHandler = null;
let latestSyncState = null;
let syncTimer = null;
let removeLeaderboardListener = null;
const leaderboardCache = new Map();
const leaderboardRequests = new Map();

export async function initializeSteamIntegration({ state, onUpdate } = {}) {
  updateHandler = typeof onUpdate === "function" ? onUpdate : null;
  latestSyncState = state ?? null;
  const bridge = getSteamBridge();

  if (!bridge?.getStatus) {
    steamStatus = {
      ...steamStatus,
      checked: true,
      message: "Steam is unavailable in the browser build."
    };
    return steamStatus;
  }

  removeLeaderboardListener?.();
  removeLeaderboardListener = bridge.onLeaderboardUpdated?.(({ name } = {}) => {
    invalidateLeaderboard(name);
    updateHandler?.();
  }) ?? null;

  try {
    const result = await bridge.getStatus();
    steamStatus = {
      checked: true,
      available: Boolean(result?.available),
      appId: Number(result?.appId) || 0,
      steamId: String(result?.steamId ?? ""),
      personaName: String(result?.personaName ?? ""),
      message: String(result?.message ?? (result?.available ? "Connected to Steam" : "Steam unavailable"))
    };

    if (steamStatus.available && latestSyncState) {
      queueSteamLeaderboardSync(latestSyncState, { immediate: true });
    }
  } catch (error) {
    steamStatus = {
      ...steamStatus,
      checked: true,
      available: false,
      message: error instanceof Error ? error.message : "Steam initialization failed."
    };
  }

  updateHandler?.();
  return steamStatus;
}

export function queueSteamLeaderboardSync(state, { immediate = false } = {}) {
  latestSyncState = state;
  if (!steamStatus.available || !state) {
    return;
  }

  window.clearTimeout(syncTimer);
  if (immediate) {
    syncTimer = null;
    void submitLeaderboardScores();
    return;
  }

  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void submitLeaderboardScores();
  }, SCORE_SYNC_DELAY_MS);
}

export function getSteamLeaderboardView(state, { metricId, scope } = {}) {
  if (!steamStatus.available) {
    return null;
  }

  const metric = getLeaderboardMetric(metricId);
  const normalizedScope = scope === "friends" ? "friends" : "global";
  const cacheKey = getCacheKey(metric.steamName, normalizedScope);
  const cached = leaderboardCache.get(cacheKey);
  const now = Date.now();

  if ((!cached || cached.expiresAt <= now) && !leaderboardRequests.has(cacheKey)) {
    void requestLeaderboard(state, metric, normalizedScope, cacheKey);
  }

  return cached?.view ?? {
    source: "steam",
    loading: true,
    message: "Loading live Steam rankings...",
    rows: []
  };
}

export function getSteamStatus() {
  return { ...steamStatus };
}

export function decodeSteamLeaderboardValue(details, fallbackScore = 0) {
  if (
    !Array.isArray(details) ||
    !hasSupportedDetailSchema(details[0]) ||
    !Number.isFinite(details[1]) ||
    !Number.isFinite(details[2])
  ) {
    return decodeSteamRankScore(fallbackScore);
  }

  const exponent = Math.max(0, Math.min(308, Math.floor(details[1])));
  const significand = Math.max(0, Math.floor(details[2])) / SCORE_SIGNIFICAND_SCALE;
  const value = significand * (10 ** exponent);
  return Number.isFinite(value) ? Math.max(0, value) : Number.MAX_VALUE;
}

export function decodeSteamRankScore(score) {
  const normalizedScore = Math.max(0, Math.floor(Number(score) || 0));
  if (normalizedScore <= 0) {
    return 0;
  }

  const zeroBasedScore = normalizedScore - 1;
  const exponent = Math.min(308, Math.max(0, Math.floor(zeroBasedScore / SCORE_BUCKET_SIZE)));
  const rankWithinExponent = zeroBasedScore % SCORE_BUCKET_SIZE;
  const significand = 1 + ((rankWithinExponent / SCORE_BUCKET_MAX) * 9);
  const value = significand * (10 ** exponent);
  return Number.isFinite(value) ? value : Number.MAX_VALUE;
}

async function submitLeaderboardScores() {
  const bridge = getSteamBridge();
  const state = latestSyncState;
  if (!bridge?.queueScores || !state || !steamStatus.available) {
    return;
  }

  const prestigeLevel = getPrestigeLevel(state);
  const scores = LEADERBOARD_METRICS.map((metric) => ({
    name: metric.steamName,
    value: getLeaderboardMetricValue(state, metric.id),
    prestigeLevel
  }));

  try {
    await bridge.queueScores(scores);
  } catch (error) {
    console.warn("Steam leaderboard sync could not be queued.", error);
  }
}

async function requestLeaderboard(state, metric, scope, cacheKey) {
  const bridge = getSteamBridge();
  if (!bridge?.getLeaderboard) {
    return;
  }

  const request = bridge.getLeaderboard({ name: metric.steamName, scope })
    .then((result) => {
      if (!result?.available) {
        leaderboardCache.set(cacheKey, {
          expiresAt: Date.now() + LEADERBOARD_CACHE_MS,
          view: {
            source: "local",
            loading: false,
            message: String(result?.message ?? "Steam leaderboard unavailable."),
            rows: []
          }
        });
        return;
      }

      let rows = (Array.isArray(result.entries) ? result.entries : []).map((entry) => ({
        id: `steam-${entry.steamId}`,
        steamId: String(entry.steamId ?? ""),
        name: String(entry.name ?? "Steam User"),
        score: decodeSteamLeaderboardValue(entry.details, entry.score),
        prestigeLevel: decodePrestigeLevel(entry.details),
        rank: Number(entry.globalRank) || null,
        isPlayer: String(entry.steamId ?? "") === String(result.steamId ?? "")
      }));

      if (!rows.some((row) => row.isPlayer)) {
        rows.push({
          id: "steam-you-pending",
          steamId: String(result.steamId ?? ""),
          name: String(result.personaName ?? steamStatus.personaName ?? "You"),
          score: getLeaderboardMetricValue(state, metric.id),
          prestigeLevel: getPrestigeLevel(state),
          rank: null,
          isPlayer: true
        });
      }

      if (scope === "friends") {
        rows = rows
          .sort((first, second) => second.score - first.score)
          .map((row, index) => ({ ...row, rank: index + 1 }));
      }

      leaderboardCache.set(cacheKey, {
        expiresAt: Date.now() + LEADERBOARD_CACHE_MS,
        view: {
          source: "steam",
          loading: false,
          message: "Live Steam leaderboard",
          rows
        }
      });
    })
    .catch((error) => {
      leaderboardCache.set(cacheKey, {
        expiresAt: Date.now() + LEADERBOARD_CACHE_MS,
        view: {
          source: "local",
          loading: false,
          message: error instanceof Error ? error.message : "Steam leaderboard unavailable.",
          rows: []
        }
      });
    })
    .finally(() => {
      leaderboardRequests.delete(cacheKey);
      updateHandler?.();
    });

  leaderboardRequests.set(cacheKey, request);
  await request;
}

function decodePrestigeLevel(details) {
  if (!Array.isArray(details)) {
    return 0;
  }

  const schema = Math.floor(Number(details[0]) || 0);
  if (schema >= PACKED_SCORE_DETAIL_SCHEMA_BASE && schema < PACKED_SCORE_DETAIL_SCHEMA_BASE + 100) {
    return schema - PACKED_SCORE_DETAIL_SCHEMA_BASE;
  }
  if (schema === SCORE_DETAIL_SCHEMA_VERSION) {
    return Math.max(0, Math.floor(Number(details[3]) || 0));
  }
  return 0;
}

function hasSupportedDetailSchema(value) {
  const schema = Math.floor(Number(value) || 0);
  return schema === SCORE_DETAIL_SCHEMA_VERSION ||
    (schema >= PACKED_SCORE_DETAIL_SCHEMA_BASE && schema < PACKED_SCORE_DETAIL_SCHEMA_BASE + 100);
}

function invalidateLeaderboard(name) {
  for (const key of leaderboardCache.keys()) {
    if (!name || key.startsWith(`${name}:`)) {
      leaderboardCache.delete(key);
    }
  }
}

function getCacheKey(name, scope) {
  return `${name}:${scope}`;
}

function getSteamBridge() {
  return globalThis.memeFarmPlatform?.steam ?? null;
}
