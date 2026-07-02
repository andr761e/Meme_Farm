import { TOWERS } from "./data/towers.js";
import { UPGRADES } from "./data/upgrades.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import {
  ALGORITHM_RESEARCH_PROJECT_BY_ID,
  BAD_IDEA_CONSEQUENCE_BY_ID,
  BAD_IDEA_OUTCOME_BY_ID,
  MEME_LAB_BOOST_BY_ID
} from "./data/memeLab.js";
import { TERMS_OF_SERVICE_EVENT_BY_ID } from "./data/termsOfService.js";
import {
  DESKTOP_COMPANION_DEFAULTS,
  DESKTOP_WINDOW_DEFAULTS,
  DESKTOP_WINDOW_PRESETS,
  PRESTIGE_MAX_LEVEL,
  SAVE_VERSION,
  VISUAL_TAKEOVER_DEFAULTS,
  createDefaultLeaderboardRecords,
  createDefaultPrestigeState,
  createDefaultState,
  sanitizePrestigeRunStatsByLevel
} from "./state.js";

export const SAVE_KEY = "memeFarmSave";

export function saveGame(state, storage = getStorage()) {
  if (!storage) {
    return false;
  }

  const payload = serializeState(state);
  payload.stats.lastSaveTime = Date.now();
  state.stats.lastSaveTime = payload.stats.lastSaveTime;

  try {
    storage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn("Meme Farm save could not be written.", error);
    return false;
  }
}

export function loadGame(storage = getStorage()) {
  if (!storage) {
    return { loaded: false, state: createDefaultState(), lastSaveTime: null };
  }

  const raw = storage.getItem(SAVE_KEY);

  if (!raw) {
    return { loaded: false, state: createDefaultState(), lastSaveTime: null };
  }

  try {
    const data = JSON.parse(raw);
    const state = mergeSaveData(data);
    return {
      loaded: true,
      state,
      lastSaveTime: data?.stats?.lastSaveTime ?? data?.lastSaveTime ?? null
    };
  } catch (error) {
    console.warn("Meme Farm save could not be loaded. Starting a clean save.", error);
    return { loaded: false, state: createDefaultState(), lastSaveTime: null, corrupt: true };
  }
}

export function clearSave(storage = getStorage()) {
  try {
    storage?.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn("Meme Farm save could not be cleared.", error);
  }
}

export function serializeState(state) {
  return {
    saveVersion: SAVE_VERSION,
    likes: safeNumber(state.likes),
    totalLikesEver: safeNumber(state.totalLikesEver),
    subscribers: safeNumber(state.subscribers),
    totalSubscribersEver: safeNumber(state.totalSubscribersEver),
    playTimeSeconds: safeNumber(state.playTimeSeconds),
    totalClicks: safeNumber(state.totalClicks),
    totalLikesFromClicks: safeNumber(state.totalLikesFromClicks),
    totalLikesSpent: safeNumber(state.totalLikesSpent),
    prestige: sanitizePrestigeState(state.prestige),
    leaderboardRecords: sanitizeLeaderboardRecords(state.leaderboardRecords),
    achievements: sanitizeAchievements(state.achievements),
    lab: sanitizeLabState(state.lab),
    towers: Object.fromEntries(
      TOWERS.map((tower) => [
        tower.id,
        {
          amount: safeNumber(state.towers?.[tower.id]?.amount),
          totalProduced: safeNumber(state.towers?.[tower.id]?.totalProduced)
        }
      ])
    ),
    upgrades: Object.fromEntries(
      UPGRADES.map((upgrade) => [
        upgrade.id,
        {
          level: safeNumber(state.upgrades?.[upgrade.id]?.level)
        }
      ])
    ),
    stats: {
      createdAt: safeNumber(state.stats?.createdAt, Date.now()),
      lastSaveTime: safeNumber(state.stats?.lastSaveTime, Date.now()),
      resetCount: safeNumber(state.stats?.resetCount),
      offlineLikesEarned: safeNumber(state.stats?.offlineLikesEarned),
      bestLikesPerSecond: safeNumber(state.stats?.bestLikesPerSecond),
      bestClickPower: safeNumber(state.stats?.bestClickPower, 1),
      superSubscribersCollected: safeNumber(state.stats?.superSubscribersCollected),
      acceptedTerms: sanitizeAcceptedTerms(state.stats?.acceptedTerms)
    },
    settings: {
      musicMuted: Boolean(state.settings?.musicMuted),
      sfxMuted: Boolean(state.settings?.sfxMuted),
      musicVolume: clamp01(state.settings?.musicVolume, 1),
      sfxVolume: clamp01(state.settings?.sfxVolume, 1),
      visualTakeovers: sanitizeVisualTakeovers(state.settings?.visualTakeovers),
      desktopCompanion: sanitizeDesktopCompanionSettings(state.settings?.desktopCompanion),
      desktopWindow: sanitizeDesktopWindowSettings(state.settings?.desktopWindow)
    }
  };
}

export function mergeSaveData(data) {
  const next = createDefaultState();
  const source = data && typeof data === "object" ? data : {};

  next.likes = safeNumber(source.likes ?? source.totalLikes);
  next.totalLikesEver = safeNumber(source.totalLikesEver, next.likes);
  next.subscribers = safeNumber(source.subscribers ?? source.totalSubscribers);
  next.totalSubscribersEver = safeNumber(source.totalSubscribersEver, next.subscribers);
  next.playTimeSeconds = safeNumber(source.playTimeSeconds);
  next.totalClicks = safeNumber(source.totalClicks);
  next.totalLikesFromClicks = safeNumber(source.totalLikesFromClicks);
  next.totalLikesSpent = safeNumber(source.totalLikesSpent);
  next.prestige = sanitizePrestigeState(source.prestige);
  next.leaderboardRecords = sanitizeLeaderboardRecords(source.leaderboardRecords);
  next.achievements = sanitizeAchievements(source.achievements);
  next.lab = sanitizeLabState(source.lab);
  next.stats = {
    createdAt: safeNumber(source.stats?.createdAt ?? source.createdAt, Date.now()),
    lastSaveTime: safeNumber(source.stats?.lastSaveTime ?? source.lastSaveTime, Date.now()),
    resetCount: safeNumber(source.stats?.resetCount ?? source.resetCount),
    offlineLikesEarned: safeNumber(source.stats?.offlineLikesEarned),
    bestLikesPerSecond: safeNumber(source.stats?.bestLikesPerSecond),
    bestClickPower: safeNumber(source.stats?.bestClickPower, 1),
    superSubscribersCollected: safeNumber(source.stats?.superSubscribersCollected),
    acceptedTerms: sanitizeAcceptedTerms(source.stats?.acceptedTerms)
  };
  const legacyMuted = Boolean(source.settings?.muted);
  const legacyVolume = clamp01(source.settings?.volume, 1);
  next.settings = {
    musicMuted: Boolean(source.settings?.musicMuted ?? legacyMuted),
    sfxMuted: Boolean(source.settings?.sfxMuted ?? legacyMuted),
    musicVolume: clamp01(source.settings?.musicVolume, legacyVolume),
    sfxVolume: clamp01(source.settings?.sfxVolume, legacyVolume),
    visualTakeovers: sanitizeVisualTakeovers(source.settings?.visualTakeovers),
    desktopCompanion: sanitizeDesktopCompanionSettings(source.settings?.desktopCompanion),
    desktopWindow: sanitizeDesktopWindowSettings(source.settings?.desktopWindow)
  };

  mergeTowerState(next, source.towers ?? source.playerTowers ?? {});
  mergeUpgradeState(next, source.upgrades ?? source.playerUpgrades ?? {});

  return next;
}

function sanitizeVisualTakeovers(value) {
  const keys = Object.keys(VISUAL_TAKEOVER_DEFAULTS);

  if (value === false) {
    return Object.fromEntries(keys.map((key) => [key, false]));
  }

  if (!value || typeof value !== "object") {
    return { ...VISUAL_TAKEOVER_DEFAULTS };
  }

  return Object.fromEntries(keys.map((key) => [key, value[key] !== false]));
}

function sanitizeDesktopCompanionSettings(value) {
  const defaults = DESKTOP_COMPANION_DEFAULTS;
  const keys = Object.keys(defaults);

  if (value === false) {
    return Object.fromEntries(keys.map((key) => [key, false]));
  }

  if (!value || typeof value !== "object") {
    return { ...defaults };
  }

  return Object.fromEntries(keys.map((key) => [key, Boolean(value[key] ?? defaults[key])]));
}

function sanitizeDesktopWindowSettings(value) {
  const presetIds = new Set(DESKTOP_WINDOW_PRESETS.map((preset) => preset.id));
  const sizePreset = typeof value?.sizePreset === "string" && presetIds.has(value.sizePreset)
    ? value.sizePreset
    : DESKTOP_WINDOW_DEFAULTS.sizePreset;

  return { sizePreset };
}

function sanitizePrestigeState(value) {
  const defaults = createDefaultPrestigeState();
  const level = Math.max(0, Math.min(PRESTIGE_MAX_LEVEL, Math.floor(safeNumber(value?.level))));

  return {
    level,
    viralResets: Math.max(level, safeNumber(value?.viralResets)),
    lastWentViralAt: safeNumber(value?.lastWentViralAt),
    runStats: sanitizePrestigeRunStatsByLevel(value?.runStats ?? defaults.runStats)
  };
}

function sanitizeLeaderboardRecords(value) {
  const defaults = createDefaultLeaderboardRecords();

  return {
    totalLikesEver: safeNumber(value?.totalLikesEver, defaults.totalLikesEver),
    highestLps: safeNumber(value?.highestLps, defaults.highestLps),
    totalTowersOwned: safeNumber(value?.totalTowersOwned, defaults.totalTowersOwned),
    milestonesUnlocked: safeNumber(value?.milestonesUnlocked, defaults.milestonesUnlocked),
    totalClicks: safeNumber(value?.totalClicks, defaults.totalClicks),
    highestClickPower: safeNumber(value?.highestClickPower, defaults.highestClickPower),
    subscribersCollected: safeNumber(value?.subscribersCollected, defaults.subscribersCollected),
    prestigeLevel: Math.max(0, Math.min(PRESTIGE_MAX_LEVEL, Math.floor(safeNumber(value?.prestigeLevel, defaults.prestigeLevel))))
  };
}

function sanitizeLabState(lab) {
  const activeBoosts = lab?.activeBoosts && typeof lab.activeBoosts === "object"
    ? lab.activeBoosts
    : {};
  const activeObscureBoosts = lab?.activeObscureBoosts && typeof lab.activeObscureBoosts === "object"
    ? lab.activeObscureBoosts
    : {};
  const activeConsequences = lab?.activeConsequences && typeof lab.activeConsequences === "object"
    ? lab.activeConsequences
    : {};
  const obscureBoostUpgradeIds = new Set(UPGRADES
    .filter((upgrade) => upgrade.type === "randomLpsBoost")
    .map((upgrade) => upgrade.id));

  return {
    activeBoosts: Object.fromEntries(
      Object.entries(activeBoosts)
        .map(([id, active]) => [id, { expiresAt: safeNumber(active?.expiresAt) }])
        .filter(([id, active]) => MEME_LAB_BOOST_BY_ID[id] && active.expiresAt > 0)
    ),
    activeObscureBoosts: Object.fromEntries(
      Object.entries(activeObscureBoosts)
        .map(([id, active]) => [id, {
          multiplier: safeNumber(active?.multiplier),
          expiresAt: safeNumber(active?.expiresAt)
        }])
        .filter(([id, active]) => obscureBoostUpgradeIds.has(id) && active.multiplier > 1 && active.expiresAt > 0)
    ),
    activeConsequences: Object.fromEntries(
      Object.entries(activeConsequences)
        .map(([id, active]) => [id, { expiresAt: safeNumber(active?.expiresAt) }])
        .filter(([id, active]) => BAD_IDEA_CONSEQUENCE_BY_ID[id] && active.expiresAt > 0)
    ),
    lastBadIdeaOutcome: sanitizeBadIdeaOutcome(lab?.lastBadIdeaOutcome),
    totalBoostsPurchased: safeNumber(lab?.totalBoostsPurchased),
    boostPurchaseCounts: sanitizeIdCounts(lab?.boostPurchaseCounts, MEME_LAB_BOOST_BY_ID),
    badIdeaPresses: safeNumber(lab?.badIdeaPresses),
    badIdeaOutcomeCounts: sanitizeIdCounts(lab?.badIdeaOutcomeCounts, BAD_IDEA_OUTCOME_BY_ID),
    badIdeaDryStreak: safeNumber(lab?.badIdeaDryStreak),
    queuedBoostId: MEME_LAB_BOOST_BY_ID[lab?.queuedBoostId] ? lab.queuedBoostId : null,
    subscribersSpent: safeNumber(lab?.subscribersSpent),
    research: sanitizeAlgorithmResearch(lab?.research),
    researchSubscribersSpent: safeNumber(lab?.researchSubscribersSpent)
  };
}

function sanitizeAlgorithmResearch(research) {
  if (!research || typeof research !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(research)
      .filter(([id, value]) => ALGORITHM_RESEARCH_PROJECT_BY_ID[id] && value)
      .map(([id, value]) => [id, { purchasedAt: safeNumber(value?.purchasedAt) }])
  );
}

function sanitizeIdCounts(counts, validIdsByKey) {
  if (!counts || typeof counts !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(counts)
      .filter(([id]) => validIdsByKey[id])
      .map(([id, value]) => [id, safeNumber(value)])
      .filter(([, value]) => value > 0)
  );
}

function sanitizeAcceptedTerms(acceptedTerms) {
  if (!acceptedTerms || typeof acceptedTerms !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(acceptedTerms)
      .filter(([id, value]) => TERMS_OF_SERVICE_EVENT_BY_ID[id] && value)
      .map(([id, value]) => [id, safeNumber(value, Date.now())])
  );
}

function sanitizeBadIdeaOutcome(outcome) {
  if (!outcome || typeof outcome !== "object" || !BAD_IDEA_OUTCOME_BY_ID[outcome.id]) {
    return null;
  }

  return {
    id: outcome.id,
    name: String(outcome.name ?? BAD_IDEA_OUTCOME_BY_ID[outcome.id].name),
    message: String(outcome.message ?? ""),
    consequenceId: outcome.consequenceId && BAD_IDEA_CONSEQUENCE_BY_ID[outcome.consequenceId]
      ? outcome.consequenceId
      : null,
    createdAt: safeNumber(outcome.createdAt)
  };
}

function mergeTowerState(next, savedTowers) {
  for (const tower of TOWERS) {
    const saved = findSavedEntry(savedTowers, [tower.id, ...(tower.legacyIds ?? [])]);
    const retired = (tower.retiredIds ?? [])
      .map((id) => savedTowers?.[id])
      .filter(Boolean);

    if (!saved && retired.length === 0) {
      continue;
    }

    next.towers[tower.id] = {
      amount: Math.floor(safeNumber(saved?.amount) + retired.reduce((sum, entry) => sum + safeNumber(entry.amount), 0)),
      totalProduced: safeNumber(saved?.totalProduced) + retired.reduce((sum, entry) => sum + safeNumber(entry.totalProduced), 0)
    };
  }
}

function mergeUpgradeState(next, savedUpgrades) {
  for (const upgrade of UPGRADES) {
    const savedEntries = [upgrade.id, ...(upgrade.legacyIds ?? [])]
      .map((id) => savedUpgrades?.[id])
      .filter(Boolean);

    if (savedEntries.length === 0) {
      continue;
    }

    const sanitizedLevel = Math.max(...savedEntries.map((saved) => (
      Math.floor(safeNumber(saved.level ?? saved.currentLevel ?? saved.baseLevel))
    )));
    next.upgrades[upgrade.id] = {
      level: Number.isFinite(upgrade.maxLevel)
        ? Math.min(upgrade.maxLevel, sanitizedLevel)
        : sanitizedLevel
    };
  }
}

function sanitizeAchievements(achievements) {
  if (!achievements || typeof achievements !== "object") {
    return {};
  }

  const validIds = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
  const sanitized = Object.fromEntries(
    Object.entries(achievements).filter(([id, value]) => validIds.has(id) && Boolean(value))
  );

  for (const tower of TOWERS) {
    for (const retiredId of tower.retiredIds ?? []) {
      migrateAchievement(achievements, sanitized, validIds, `tower_${retiredId}_first`, `tower_${tower.id}_first`);
      for (const amount of [10, 25, 50, 100]) {
        migrateAchievement(achievements, sanitized, validIds, `tower_${retiredId}_${amount}`, `tower_${tower.id}_${amount}`);
      }
      migrateAchievement(achievements, sanitized, validIds, `upgrade_${retiredId}_double_5`, `upgrade_${tower.id}_double_5`);
      migrateAchievement(achievements, sanitized, validIds, `upgrade_${retiredId}_crossfeed`, `upgrade_${tower.id}_crossfeed`);
    }
  }

  return sanitized;
}

function migrateAchievement(source, target, validIds, oldId, newId) {
  if (source[oldId] && validIds.has(newId) && !target[newId]) {
    target[newId] = source[oldId];
  }
}

function findSavedEntry(collection, ids) {
  if (!collection || typeof collection !== "object") {
    return null;
  }

  for (const id of ids) {
    if (collection[id]) {
      return collection[id];
    }
  }

  return null;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function clamp01(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
}

function getStorage() {
  const platformSave = globalThis.memeFarmPlatform?.save;
  if (platformSave) {
    return {
      getItem(key) {
        return key === SAVE_KEY ? platformSave.load() : null;
      },
      setItem(key, value) {
        if (key === SAVE_KEY && !platformSave.write(value)) {
          throw new Error("Platform save write failed.");
        }
      },
      removeItem(key) {
        if (key === SAVE_KEY) {
          platformSave.clear();
        }
      }
    };
  }

  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
