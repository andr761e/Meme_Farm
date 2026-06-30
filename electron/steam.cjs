const path = require("node:path");

const STEAM_APP_ID = 4906780;
const STEAM_LEADERBOARD_NAMES = new Set([
  "MF_LIFETIME_LIKES",
  "MF_PEAK_LPS",
  "MF_TOWERS_OWNED",
  "MF_MILESTONES_UNLOCKED",
  "MF_MEME_BUTTON_CLICKS",
  "MF_PEAK_CLICK_POWER",
  "MF_SUBSCRIBERS_COLLECTED"
]);
const SCORE_DETAIL_SCHEMA_VERSION = 1;
const SCORE_SIGNIFICAND_SCALE = 100000000;
const SCORE_BUCKET_SIZE = 6000000;
const SCORE_BUCKET_MAX = SCORE_BUCKET_SIZE - 1;
const SCORE_MAX_EXPONENT = 308;
const UPLOAD_LIMIT = 10;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const PACKED_SCORE_DETAIL_SCHEMA_BASE = 100;

function createSteamIntegration({ app, ipcMain, getWindows }) {
  let steam = null;
  let steamTypes = null;
  let callbackTimer = null;
  let retryTimer = null;
  let drainPromise = null;
  let initialized = false;
  let restartRequested = false;
  let initializationError = "Steam has not been initialized.";
  const leaderboardHandles = new Map();
  const pendingUploads = new Map();
  const highestQueuedValues = new Map();
  const uploadHistory = [];

  function initialize() {
    try {
      const steamworksModule = require("steamworks-ffi-node");
      const SteamworksSDK = steamworksModule.default ?? steamworksModule.SteamworksSDK;
      steamTypes = steamworksModule;
      steam = SteamworksSDK.getInstance();
      steam.setSdkPath(getSteamSdkPath(app));

      if (app.isPackaged && steam.restartAppIfNecessary(STEAM_APP_ID)) {
        restartRequested = true;
        initializationError = "Steam is restarting Meme Farm through the Steam client.";
        return { restartRequested: true };
      }

      initialized = steam.init({ appId: STEAM_APP_ID });
      if (!initialized) {
        initializationError = "Steam could not initialize. Start Steam and sign in with an account that owns Meme Farm.";
        return { restartRequested: false };
      }

      initializationError = "";
      callbackTimer = setInterval(() => {
        try {
          steam.runCallbacks();
        } catch (error) {
          console.warn("Steam callback processing failed.", error);
        }
      }, 500);
      callbackTimer.unref?.();

      console.log(`[Steam] Connected to App ${STEAM_APP_ID} as ${getPersonaName()}.`);
      return { restartRequested: false };
    } catch (error) {
      initialized = false;
      initializationError = error instanceof Error ? error.message : String(error);
      console.warn("[Steam] Integration unavailable; Meme Farm will use its local fallback.", error);
      return { restartRequested: false };
    }
  }

  function installIpc() {
    ipcMain.handle("meme-farm-steam:status", () => getStatus());
    ipcMain.handle("meme-farm-steam:queue-scores", (_event, scores) => queueScores(scores));
    ipcMain.handle("meme-farm-steam:get-leaderboard", (_event, request) => getLeaderboard(request));
  }

  function getStatus() {
    const status = initialized ? steam.getStatus() : null;
    return {
      available: Boolean(initialized && status?.initialized),
      appId: STEAM_APP_ID,
      steamId: status?.steamId ?? "",
      personaName: initialized ? getPersonaName() : "",
      restartRequested,
      message: initialized ? "Connected to Steam" : initializationError
    };
  }

  function queueScores(scores) {
    if (!initialized) {
      return { queued: 0, available: false, message: initializationError };
    }

    let queued = 0;
    const safeScores = Array.isArray(scores) ? scores : [];

    for (const item of safeScores) {
      const name = String(item?.name ?? "");
      if (!STEAM_LEADERBOARD_NAMES.has(name)) {
        continue;
      }

      const value = normalizeLeaderboardValue(item?.value);
      if (value <= 0 || value <= (highestQueuedValues.get(name) ?? -1)) {
        continue;
      }

      const encoded = encodeLeaderboardValue(value, item?.prestigeLevel);
      highestQueuedValues.set(name, value);
      pendingUploads.set(name, { name, value, ...encoded });
      queued += 1;
    }

    if (queued > 0) {
      void drainUploadQueue();
    }

    return { queued, available: true };
  }

  async function drainUploadQueue() {
    if (drainPromise || !initialized) {
      return drainPromise;
    }

    drainPromise = (async () => {
      while (pendingUploads.size > 0 && initialized) {
        pruneUploadHistory();
        if (uploadHistory.length >= UPLOAD_LIMIT) {
          scheduleUploadRetry();
          break;
        }

        const [name, pending] = pendingUploads.entries().next().value;
        pendingUploads.delete(name);
        const leaderboard = await findLeaderboard(name);

        if (!leaderboard) {
          continue;
        }

        uploadHistory.push(Date.now());
        try {
          const result = await steam.leaderboards.uploadScore(
            leaderboard.handle,
            pending.score,
            steamTypes.LeaderboardUploadScoreMethod.KeepBest,
            pending.details
          );

          if (!result?.success) {
            console.warn(`[Steam] Score upload failed for ${name}.`);
            continue;
          }

          notifyLeaderboardUpdated(name);
        } catch (error) {
          console.warn(`[Steam] Score upload failed for ${name}.`, error);
        }
      }
    })().finally(() => {
      drainPromise = null;
      if (pendingUploads.size > 0) {
        pruneUploadHistory();
        if (uploadHistory.length < UPLOAD_LIMIT) {
          void drainUploadQueue();
        }
      }
    });

    return drainPromise;
  }

  function pruneUploadHistory() {
    const cutoff = Date.now() - UPLOAD_WINDOW_MS;
    while (uploadHistory.length > 0 && uploadHistory[0] <= cutoff) {
      uploadHistory.shift();
    }
  }

  function scheduleUploadRetry() {
    if (retryTimer || uploadHistory.length === 0) {
      return;
    }

    const delay = Math.max(1000, (uploadHistory[0] + UPLOAD_WINDOW_MS) - Date.now() + 250);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void drainUploadQueue();
    }, delay);
    retryTimer.unref?.();
  }

  async function getLeaderboard(request) {
    if (!initialized) {
      return { available: false, message: initializationError, entries: [] };
    }

    const name = String(request?.name ?? "");
    const scope = request?.scope === "friends" ? "friends" : "global";
    if (!STEAM_LEADERBOARD_NAMES.has(name)) {
      return { available: false, message: "Unknown Steam leaderboard.", entries: [] };
    }

    const leaderboard = await findLeaderboard(name);
    if (!leaderboard) {
      return {
        available: false,
        missing: true,
        message: `${name} has not been created or published in Steamworks yet.`,
        entries: []
      };
    }

    try {
      let entries;
      if (scope === "friends") {
        entries = await steam.leaderboards.downloadLeaderboardEntries(
          leaderboard.handle,
          steamTypes.LeaderboardDataRequest.Friends,
          0,
          0
        );
      } else {
        const topEntries = await steam.leaderboards.downloadLeaderboardEntries(
          leaderboard.handle,
          steamTypes.LeaderboardDataRequest.Global,
          1,
          10
        );
        const nearbyEntries = await steam.leaderboards.downloadLeaderboardEntries(
          leaderboard.handle,
          steamTypes.LeaderboardDataRequest.GlobalAroundUser,
          -2,
          2
        );
        entries = mergeLeaderboardEntries(topEntries, nearbyEntries);
      }

      return {
        available: true,
        name,
        scope,
        steamId: steam.getStatus().steamId,
        personaName: getPersonaName(),
        entries: entries.slice(0, 30).map((entry) => ({
          steamId: entry.steamId,
          name: getEntryPersonaName(entry.steamId),
          globalRank: entry.globalRank,
          score: entry.score,
          details: normalizeDownloadedDetails(entry.details)
        }))
      };
    } catch (error) {
      console.warn(`[Steam] Could not download ${name}.`, error);
      return { available: false, message: `Steam could not download ${name}.`, entries: [] };
    }
  }

  async function findLeaderboard(name) {
    if (leaderboardHandles.has(name)) {
      return leaderboardHandles.get(name);
    }

    const request = steam.leaderboards.findLeaderboard(name).catch((error) => {
      console.warn(`[Steam] Could not find leaderboard ${name}.`, error);
      return null;
    });
    leaderboardHandles.set(name, request);
    return request;
  }

  function getEntryPersonaName(steamId) {
    const status = steam.getStatus();
    if (steamId === status.steamId) {
      return getPersonaName();
    }

    try {
      return steam.friends.getFriendPersonaName(steamId) || `Steam User ${steamId.slice(-6)}`;
    } catch {
      return `Steam User ${steamId.slice(-6)}`;
    }
  }

  function getPersonaName() {
    try {
      return steam?.friends.getPersonaName() || "You";
    } catch {
      return "You";
    }
  }

  function notifyLeaderboardUpdated(name) {
    for (const window of getWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send("meme-farm-steam:leaderboard-updated", { name });
      }
    }
  }

  function shutdown() {
    if (callbackTimer) {
      clearInterval(callbackTimer);
      callbackTimer = null;
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (!steam || !initialized) {
      return;
    }

    initialized = false;
    try {
      steam.shutdown();
    } catch (error) {
      console.warn("[Steam] Shutdown failed.", error);
    }
  }

  return {
    initialize,
    installIpc,
    shutdown
  };
}

function getSteamSdkPath(app) {
  return app.isPackaged
    ? path.join(process.resourcesPath, "steamworks_sdk")
    : path.join(__dirname, "..", "steamworks_sdk");
}

function encodeLeaderboardValue(value, prestigeLevel = 0) {
  const normalizedValue = normalizeLeaderboardValue(value);
  const safePrestigeLevel = Math.min(99, Math.max(0, clampInt32(prestigeLevel)));
  const packedSchema = PACKED_SCORE_DETAIL_SCHEMA_BASE + safePrestigeLevel;
  if (normalizedValue <= 0) {
    return {
      score: 0,
      details: [packedSchema, 0, 0, 0]
    };
  }

  const exponent = Math.min(SCORE_MAX_EXPONENT, Math.max(0, Math.floor(Math.log10(normalizedValue))));
  const power = 10 ** exponent;
  const normalizedSignificand = Math.min(9.99999999, Math.max(1, normalizedValue / power));
  const significand = Math.min(999999999, Math.floor(normalizedSignificand * SCORE_SIGNIFICAND_SCALE));
  const rankWithinExponent = Math.min(
    SCORE_BUCKET_MAX,
    Math.max(0, Math.floor(((normalizedSignificand - 1) / 9) * SCORE_BUCKET_MAX))
  );

  return {
    score: 1 + (exponent * SCORE_BUCKET_SIZE) + rankWithinExponent,
    details: [packedSchema, exponent, significand, 0]
  };
}

function normalizeDownloadedDetails(details) {
  if (!Array.isArray(details)) {
    return [];
  }
  if (details.every((item) => Number.isFinite(item))) {
    return details.map((item) => Math.floor(item));
  }

  for (let index = details.length - 1; index >= 0; index -= 1) {
    const item = details[index];
    if (!item || typeof item !== "object") {
      continue;
    }

    const values = Object.entries(item)
      .filter(([key, value]) => /^\d+$/.test(key) && Number.isFinite(value))
      .sort(([first], [second]) => Number(first) - Number(second))
      .map(([, value]) => Math.floor(value));
    if (values.length > 0) {
      return values;
    }
  }

  return [];
}

function normalizeLeaderboardValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return number === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : 0;
  }
  return Math.max(0, Math.floor(number));
}

function clampInt32(value) {
  const number = Math.floor(Number(value) || 0);
  return Math.min(2147483647, Math.max(-2147483648, number));
}

function mergeLeaderboardEntries(...groups) {
  const bySteamId = new Map();
  for (const entry of groups.flat()) {
    const existing = bySteamId.get(entry.steamId);
    if (!existing || entry.globalRank < existing.globalRank) {
      bySteamId.set(entry.steamId, entry);
    }
  }
  return [...bySteamId.values()].sort((first, second) => first.globalRank - second.globalRank);
}

module.exports = {
  STEAM_APP_ID,
  STEAM_LEADERBOARD_NAMES,
  SCORE_DETAIL_SCHEMA_VERSION,
  SCORE_SIGNIFICAND_SCALE,
  SCORE_BUCKET_SIZE,
  createSteamIntegration,
  encodeLeaderboardValue,
  normalizeDownloadedDetails
};
