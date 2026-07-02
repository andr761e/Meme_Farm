import {
  LEADERBOARD_METRICS,
  getLeaderboardMetric,
  getLeaderboardMetricValue
} from "./leaderboards.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import { TOWERS } from "./data/towers.js";
import { UPGRADES } from "./data/upgrades.js";
import { MEME_LAB_BOOSTS } from "./data/memeLab.js";
import {
  getLikesPerSecond,
  getPrestigeLevel,
  getTotalTowersOwned,
  getTowerAmount,
  getUnlockedAchievementCount,
  getUpgradeLevel
} from "./state.js";

const LEADERBOARD_CACHE_MS = 60000;
const SCORE_DETAIL_SCHEMA_VERSION = 1;
const PACKED_SCORE_DETAIL_SCHEMA_BASE = 100;
const SCORE_SIGNIFICAND_SCALE = 100000000;
const SCORE_BUCKET_SIZE = 6000000;
const SCORE_BUCKET_MAX = SCORE_BUCKET_SIZE - 1;
const SCORE_SYNC_DELAY_MS = 1500;
const STAT_SYNC_DELAY_MS = 60000;
const LEGACY_OVERCLOCK_COUNT = UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock").length;
const ALL_MILESTONES_COUNT = ACHIEVEMENTS.length;

export const STEAM_ACHIEVEMENTS = Object.freeze([
  { milestoneId: "first_click", apiName: "MF_ACH_FIRST_CLICK" },
  { milestoneId: "first_tower", apiName: "MF_ACH_FIRST_TOWER" },
  { milestoneId: "first_subscriber", apiName: "MF_ACH_FIRST_SUBSCRIBER" },
  { milestoneId: "likes_10000", apiName: "MF_ACH_LIKES_10K" },
  { milestoneId: "first_five_towers", apiName: "MF_ACH_FIRST_FIVE_TOWERS" },
  { milestoneId: "likes_1000000", apiName: "MF_ACH_LIKES_1M" },
  { milestoneId: "towers_100", apiName: "MF_ACH_TOWERS_100" },
  { milestoneId: "lps_1000", apiName: "MF_ACH_LPS_1K" },
  { milestoneId: "subscribers_1000", apiName: "MF_ACH_SUBSCRIBERS_1K" },
  { milestoneId: "upgrade_levels_25", apiName: "MF_ACH_UPGRADE_LEVELS_25" },
  { milestoneId: "tower_level_5_first", apiName: "MF_ACH_TOWER_LEVEL_5_FIRST" },
  { milestoneId: "meme_lab_first_bribe", apiName: "MF_ACH_FIRST_ALGORITHM_BRIBE" },
  { milestoneId: "bad_idea_first_press", apiName: "MF_ACH_FIRST_BAD_IDEA" },
  { milestoneId: "crossfeed_first", apiName: "MF_ACH_FIRST_CROSSFEED" },
  { milestoneId: "legacy_overclock_first", apiName: "MF_ACH_FIRST_LEGACY_OVERCLOCK" },
  { milestoneId: "likes_100000000", apiName: "MF_ACH_LIKES_100M" },
  { milestoneId: "towers_500", apiName: "MF_ACH_TOWERS_500" },
  { milestoneId: "lps_1000000", apiName: "MF_ACH_LPS_1M" },
  { milestoneId: "upgrade_levels_100", apiName: "MF_ACH_UPGRADE_LEVELS_100" },
  { milestoneId: "meme_lab_all_bribes", apiName: "MF_ACH_ALL_ALGORITHM_BRIBES" },
  { milestoneId: "prestige_1", apiName: "MF_ACH_PRESTIGE_1" },
  { milestoneId: "likes_1000000000", apiName: "MF_ACH_LIKES_1B" },
  { milestoneId: "all_towers_first", apiName: "MF_ACH_ALL_TOWERS" },
  { milestoneId: "crossfeed_10", apiName: "MF_ACH_CROSSFEEDS_10" },
  { milestoneId: "legacy_overclock_5", apiName: "MF_ACH_LEGACY_OVERCLOCKS_5" },
  { milestoneId: "prestige_2", apiName: "MF_ACH_PRESTIGE_2" },
  { milestoneId: "tower_level_5_all", apiName: "MF_ACH_ALL_TOWERS_LEVEL_5" },
  { milestoneId: "crossfeed_all", apiName: "MF_ACH_ALL_CROSSFEEDS" },
  { milestoneId: "legacy_overclock_all", apiName: "MF_ACH_ALL_LEGACY_OVERCLOCKS" },
  { milestoneId: "prestige_3", apiName: "MF_ACH_PRESTIGE_3" },
  {
    apiName: "MF_ACH_ALL_MILESTONES",
    isEarned: (state) => getUnlockedAchievementCount(state) >= ALL_MILESTONES_COUNT
  }
]);

export const STEAM_STATS = Object.freeze([
  { apiName: "MF_STAT_TOTAL_LIKES", max: 1000000000 },
  { apiName: "MF_STAT_TOTAL_TOWERS", max: 500 },
  { apiName: "MF_STAT_PEAK_LPS", max: 1000000 },
  { apiName: "MF_STAT_SUBSCRIBERS", max: 1000 },
  { apiName: "MF_STAT_UPGRADE_LEVELS", max: 100 },
  { apiName: "MF_STAT_STARTER_TOWERS", max: 5 },
  { apiName: "MF_STAT_DISTINCT_TOWERS", max: TOWERS.length },
  { apiName: "MF_STAT_LEVEL_5_TOWERS", max: TOWERS.length },
  { apiName: "MF_STAT_BRIBE_TYPES", max: MEME_LAB_BOOSTS.length },
  { apiName: "MF_STAT_CROSSFEEDS", max: TOWERS.length },
  { apiName: "MF_STAT_LEGACY_OVERCLOCKS", max: LEGACY_OVERCLOCK_COUNT },
  { apiName: "MF_STAT_PRESTIGE_LEVEL", max: 3 },
  { apiName: "MF_STAT_MILESTONES_UNLOCKED", max: ALL_MILESTONES_COUNT }
]);

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
let statSyncTimer = null;
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
      void syncSteamStartupProgress(latestSyncState);
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

export function queueSteamStatSync(state, { immediate = false } = {}) {
  latestSyncState = state;
  if (!steamStatus.available || !state) {
    return;
  }

  if (immediate) {
    window.clearTimeout(statSyncTimer);
    statSyncTimer = null;
    void submitSteamStats();
    return;
  }

  if (statSyncTimer) {
    return;
  }
  statSyncTimer = window.setTimeout(() => {
    statSyncTimer = null;
    void submitSteamStats();
  }, STAT_SYNC_DELAY_MS);
}

export function getSteamStatValues(state) {
  const achievements = state?.achievements ?? {};
  const records = state?.leaderboardRecords ?? {};
  const totalUpgradeLevels = Object.values(state?.upgrades ?? {})
    .reduce((sum, upgrade) => sum + Math.max(0, Number(upgrade?.level) || 0), 0);
  const starterTowers = TOWERS.slice(0, 5)
    .filter((tower) => getTowerAmount(state, tower.id) >= 1).length;
  const distinctTowers = TOWERS
    .filter((tower) => getTowerAmount(state, tower.id) >= 1).length;
  const levelFiveTowers = TOWERS
    .filter((tower) => getUpgradeLevel(state, `${tower.id}_double_5`) >= 1).length;
  const bribeTypes = MEME_LAB_BOOSTS
    .filter((boost) => (state?.lab?.boostPurchaseCounts?.[boost.id] ?? 0) >= 1).length;
  const crossfeeds = UPGRADES
    .filter((upgrade) => upgrade.type === "towerAmountSynergy" && getUpgradeLevel(state, upgrade.id) >= 1).length;
  const legacyOverclocks = UPGRADES
    .filter((upgrade) => upgrade.category === "legacyOverclock" && getUpgradeLevel(state, upgrade.id) >= 1).length;

  const values = {
    MF_STAT_TOTAL_LIKES: Math.max(Number(state?.totalLikesEver) || 0, Number(records.totalLikesEver) || 0, achievementFloor(achievements, [["likes_1000000000", 1000000000], ["likes_100000000", 100000000], ["likes_1000000", 1000000], ["likes_10000", 10000]])),
    MF_STAT_TOTAL_TOWERS: Math.max(getTotalTowersOwned(state), Number(records.totalTowersOwned) || 0, achievementFloor(achievements, [["towers_500", 500], ["towers_100", 100]])),
    MF_STAT_PEAK_LPS: Math.max(getLikesPerSecond(state), Number(records.highestLps) || 0, achievementFloor(achievements, [["lps_1000000", 1000000], ["lps_1000", 1000]])),
    MF_STAT_SUBSCRIBERS: Math.max(Number(state?.totalSubscribersEver) || 0, Number(records.subscribersCollected) || 0, achievementFloor(achievements, [["subscribers_1000", 1000]])),
    MF_STAT_UPGRADE_LEVELS: Math.max(totalUpgradeLevels, achievementFloor(achievements, [["upgrade_levels_100", 100], ["upgrade_levels_25", 25]])),
    MF_STAT_STARTER_TOWERS: Math.max(starterTowers, achievementFloor(achievements, [["first_five_towers", 5]])),
    MF_STAT_DISTINCT_TOWERS: Math.max(distinctTowers, achievementFloor(achievements, [["all_towers_first", TOWERS.length]])),
    MF_STAT_LEVEL_5_TOWERS: Math.max(levelFiveTowers, achievementFloor(achievements, [["tower_level_5_all", TOWERS.length], ["tower_level_5_10", 10], ["tower_level_5_first", 1]])),
    MF_STAT_BRIBE_TYPES: Math.max(bribeTypes, achievementFloor(achievements, [["meme_lab_all_bribes", MEME_LAB_BOOSTS.length], ["meme_lab_first_bribe", 1]])),
    MF_STAT_CROSSFEEDS: Math.max(crossfeeds, achievementFloor(achievements, [["crossfeed_all", TOWERS.length], ["crossfeed_10", 10], ["crossfeed_first", 1]])),
    MF_STAT_LEGACY_OVERCLOCKS: Math.max(legacyOverclocks, achievementFloor(achievements, [["legacy_overclock_all", LEGACY_OVERCLOCK_COUNT], ["legacy_overclock_5", 5], ["legacy_overclock_first", 1]])),
    MF_STAT_PRESTIGE_LEVEL: Math.max(getPrestigeLevel(state), Number(records.prestigeLevel) || 0, achievementFloor(achievements, [["prestige_3", 3], ["prestige_2", 2], ["prestige_1", 1]])),
    MF_STAT_MILESTONES_UNLOCKED: Math.max(getUnlockedAchievementCount(state), Number(records.milestonesUnlocked) || 0)
  };

  return STEAM_STATS.map(({ apiName, max }) => ({
    apiName,
    value: Math.min(max, Math.max(0, Math.floor(Number(values[apiName]) || 0)))
  }));
}

async function submitSteamStats() {
  const bridge = getSteamBridge();
  if (!bridge?.syncStats || !latestSyncState || !steamStatus.available) {
    return;
  }

  try {
    const result = await bridge.syncStats(getSteamStatValues(latestSyncState));
    if (result?.missing?.length > 0) {
      console.warn(`Steam stat definitions are missing: ${result.missing.join(", ")}`);
    }
  } catch (error) {
    console.warn("Steam progress-stat sync failed.", error);
  }
}

async function syncSteamStartupProgress(state) {
  await syncSteamAchievements(state);
  await submitSteamStats();
}

function achievementFloor(achievements, thresholds) {
  for (const [milestoneId, value] of thresholds) {
    if (achievements?.[milestoneId]) {
      return value;
    }
  }
  return 0;
}

export async function syncSteamAchievements(state) {
  const bridge = getSteamBridge();
  if (!steamStatus.available || !bridge?.syncAchievements || !state) {
    return { available: false, synced: 0 };
  }

  const apiNames = getEarnedSteamAchievementApiNames(state);
  if (apiNames.length === 0) {
    return { available: true, synced: 0 };
  }

  try {
    const result = await bridge.syncAchievements(apiNames);
    if (result?.missing?.length > 0) {
      console.warn(`Steam achievement definitions are missing: ${result.missing.join(", ")}`);
    }
    return result;
  } catch (error) {
    console.warn("Steam achievement sync failed.", error);
    return { available: false, synced: 0 };
  }
}

export function getEarnedSteamAchievementApiNames(state) {
  return STEAM_ACHIEVEMENTS
    .filter(({ milestoneId, isEarned }) => (
      typeof isEarned === "function"
        ? isEarned(state)
        : Boolean(state?.achievements?.[milestoneId])
    ))
    .map(({ apiName }) => apiName);
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
