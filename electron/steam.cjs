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
const STEAM_ACHIEVEMENT_API_NAMES = new Set([
  "MF_ACH_FIRST_CLICK",
  "MF_ACH_FIRST_TOWER",
  "MF_ACH_FIRST_SUBSCRIBER",
  "MF_ACH_LIKES_10K",
  "MF_ACH_FIRST_FIVE_TOWERS",
  "MF_ACH_LIKES_1M",
  "MF_ACH_TOWERS_100",
  "MF_ACH_LPS_1K",
  "MF_ACH_SUBSCRIBERS_1K",
  "MF_ACH_UPGRADE_LEVELS_25",
  "MF_ACH_TOWER_LEVEL_5_FIRST",
  "MF_ACH_FIRST_ALGORITHM_BRIBE",
  "MF_ACH_FIRST_BAD_IDEA",
  "MF_ACH_FIRST_CROSSFEED",
  "MF_ACH_FIRST_LEGACY_OVERCLOCK",
  "MF_ACH_LIKES_100M",
  "MF_ACH_TOWERS_500",
  "MF_ACH_LPS_1M",
  "MF_ACH_UPGRADE_LEVELS_100",
  "MF_ACH_ALL_ALGORITHM_BRIBES",
  "MF_ACH_PRESTIGE_1",
  "MF_ACH_LIKES_1B",
  "MF_ACH_ALL_TOWERS",
  "MF_ACH_CROSSFEEDS_10",
  "MF_ACH_LEGACY_OVERCLOCKS_5",
  "MF_ACH_PRESTIGE_2",
  "MF_ACH_ALL_TOWERS_LEVEL_5",
  "MF_ACH_ALL_CROSSFEEDS",
  "MF_ACH_ALL_LEGACY_OVERCLOCKS",
  "MF_ACH_PRESTIGE_3",
  "MF_ACH_ALL_MILESTONES"
]);
const STEAM_STAT_API_NAMES = new Set([
  "MF_STAT_TOTAL_LIKES",
  "MF_STAT_TOTAL_TOWERS",
  "MF_STAT_PEAK_LPS",
  "MF_STAT_SUBSCRIBERS",
  "MF_STAT_UPGRADE_LEVELS",
  "MF_STAT_STARTER_TOWERS",
  "MF_STAT_DISTINCT_TOWERS",
  "MF_STAT_LEVEL_5_TOWERS",
  "MF_STAT_BRIBE_TYPES",
  "MF_STAT_CROSSFEEDS",
  "MF_STAT_LEGACY_OVERCLOCKS",
  "MF_STAT_PRESTIGE_LEVEL",
  "MF_STAT_MILESTONES_UNLOCKED"
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
  const pendingAchievementNames = new Set();
  const unlockedAchievementNames = new Set();
  const pendingStatValues = new Map();
  const storedStatValues = new Map();
  let availableAchievementNames = null;
  let achievementSyncPromise = null;
  let statSyncPromise = null;

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
    ipcMain.handle("meme-farm-steam:sync-achievements", (_event, apiNames) => syncAchievements(apiNames));
    ipcMain.handle("meme-farm-steam:sync-stats", (_event, stats) => syncStats(stats));
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

  async function syncAchievements(apiNames) {
    if (!initialized) {
      return { available: false, synced: 0, message: initializationError };
    }

    for (const apiName of Array.isArray(apiNames) ? apiNames : []) {
      const normalizedName = String(apiName ?? "");
      if (STEAM_ACHIEVEMENT_API_NAMES.has(normalizedName)) {
        pendingAchievementNames.add(normalizedName);
      }
    }

    if (pendingAchievementNames.size === 0) {
      return { available: true, synced: 0, missing: [], failed: [] };
    }

    if (!achievementSyncPromise) {
      achievementSyncPromise = drainAchievementQueue().finally(() => {
        achievementSyncPromise = null;
      });
    }

    return achievementSyncPromise;
  }

  async function syncStats(stats) {
    if (!initialized) {
      return { available: false, synced: 0, message: initializationError };
    }

    for (const stat of Array.isArray(stats) ? stats : []) {
      const apiName = String(stat?.apiName ?? "");
      if (!STEAM_STAT_API_NAMES.has(apiName)) {
        continue;
      }
      const value = clampInt32(stat?.value);
      pendingStatValues.set(apiName, Math.max(value, pendingStatValues.get(apiName) ?? 0));
    }

    if (pendingStatValues.size === 0) {
      return { available: true, synced: 0, missing: [], failed: [] };
    }

    if (!statSyncPromise) {
      statSyncPromise = drainStatQueue().finally(() => {
        statSyncPromise = null;
      });
    }

    return statSyncPromise;
  }

  async function drainStatQueue() {
    const missing = [];
    const failed = [];
    let synced = 0;

    while (pendingStatValues.size > 0) {
      const requestedStats = [...pendingStatValues.entries()];
      pendingStatValues.clear();

      for (const [apiName, requestedValue] of requestedStats) {
        let storedValue = storedStatValues.get(apiName);
        if (storedValue === undefined) {
          try {
            const steamStat = await steam.stats.getStatInt(apiName);
            if (!steamStat) {
              missing.push(apiName);
              continue;
            }
            storedValue = clampInt32(steamStat.value);
            storedStatValues.set(apiName, storedValue);
          } catch (error) {
            failed.push(apiName);
            console.warn(`[Steam] Could not read stat ${apiName}.`, error);
            continue;
          }
        }

        const nextValue = Math.max(storedValue, requestedValue);
        if (nextValue <= storedValue) {
          continue;
        }

        try {
          const updated = await steam.stats.setStatInt(apiName, nextValue);
          if (updated) {
            storedStatValues.set(apiName, nextValue);
            synced += 1;
          } else {
            failed.push(apiName);
          }
        } catch (error) {
          failed.push(apiName);
          console.warn(`[Steam] Stat sync failed for ${apiName}.`, error);
        }
      }
    }

    if (missing.length > 0) {
      console.warn(`[Steam] Published stat definitions not found: ${missing.join(", ")}`);
    }

    return { available: true, synced, missing, failed };
  }

  async function drainAchievementQueue() {
    const missing = [];
    const failed = [];
    let synced = 0;

    if (!availableAchievementNames) {
      try {
        const steamAchievements = await steam.achievements.getAllAchievements();
        if (steamAchievements.length === 0) {
          return {
            available: false,
            synced: 0,
            missing: [],
            failed: [...pendingAchievementNames],
            message: "Steam returned no published achievement definitions."
          };
        }
        availableAchievementNames = new Set(steamAchievements.map((achievement) => achievement.apiName));
        for (const achievement of steamAchievements) {
          if (achievement.unlocked) {
            unlockedAchievementNames.add(achievement.apiName);
          }
        }
      } catch (error) {
        console.warn("[Steam] Could not read achievement status.", error);
        return {
          available: false,
          synced: 0,
          missing: [],
          failed: [...pendingAchievementNames],
          message: "Steam achievement status could not be loaded."
        };
      }
    }

    while (pendingAchievementNames.size > 0) {
      const requestedNames = [...pendingAchievementNames];
      pendingAchievementNames.clear();

      for (const apiName of requestedNames) {
        if (!availableAchievementNames.has(apiName)) {
          missing.push(apiName);
          continue;
        }
        if (unlockedAchievementNames.has(apiName)) {
          continue;
        }

        try {
          const unlocked = await steam.achievements.unlockAchievement(apiName);
          if (unlocked) {
            unlockedAchievementNames.add(apiName);
            synced += 1;
          } else {
            failed.push(apiName);
          }
        } catch (error) {
          failed.push(apiName);
          console.warn(`[Steam] Achievement unlock failed for ${apiName}.`, error);
        }
      }
    }

    if (missing.length > 0) {
      console.warn(`[Steam] Published achievement definitions not found: ${missing.join(", ")}`);
    }

    return { available: true, synced, missing, failed };
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
  STEAM_ACHIEVEMENT_API_NAMES,
  STEAM_STAT_API_NAMES,
  STEAM_LEADERBOARD_NAMES,
  SCORE_DETAIL_SCHEMA_VERSION,
  SCORE_SIGNIFICAND_SCALE,
  SCORE_BUCKET_SIZE,
  createSteamIntegration,
  encodeLeaderboardValue,
  normalizeDownloadedDetails
};
