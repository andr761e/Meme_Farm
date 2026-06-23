import { TOWERS } from "./data/towers.js";
import { UPGRADES } from "./data/upgrades.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import { BAD_IDEA_CONSEQUENCE_BY_ID, BAD_IDEA_OUTCOME_BY_ID, MEME_LAB_BOOST_BY_ID } from "./data/memeLab.js";
import {
  DESKTOP_COMPANION_DEFAULTS,
  DESKTOP_WINDOW_DEFAULTS,
  DESKTOP_WINDOW_PRESETS,
  SAVE_VERSION,
  VISUAL_TAKEOVER_DEFAULTS,
  createDefaultState
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
      bestClickPower: safeNumber(state.stats?.bestClickPower, 1)
    },
    settings: {
      muted: Boolean(state.settings?.muted),
      volume: clamp01(state.settings?.volume, 1),
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
  next.achievements = sanitizeAchievements(source.achievements);
  next.lab = sanitizeLabState(source.lab);
  next.stats = {
    createdAt: safeNumber(source.stats?.createdAt ?? source.createdAt, Date.now()),
    lastSaveTime: safeNumber(source.stats?.lastSaveTime ?? source.lastSaveTime, Date.now()),
    resetCount: safeNumber(source.stats?.resetCount ?? source.resetCount),
    offlineLikesEarned: safeNumber(source.stats?.offlineLikesEarned),
    bestLikesPerSecond: safeNumber(source.stats?.bestLikesPerSecond),
    bestClickPower: safeNumber(source.stats?.bestClickPower, 1)
  };
  next.settings = {
    muted: Boolean(source.settings?.muted),
    volume: clamp01(source.settings?.volume, 1),
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

function sanitizeLabState(lab) {
  const activeBoosts = lab?.activeBoosts && typeof lab.activeBoosts === "object"
    ? lab.activeBoosts
    : {};
  const activeConsequences = lab?.activeConsequences && typeof lab.activeConsequences === "object"
    ? lab.activeConsequences
    : {};

  return {
    activeBoosts: Object.fromEntries(
      Object.entries(activeBoosts)
        .map(([id, active]) => [id, { expiresAt: safeNumber(active?.expiresAt) }])
        .filter(([id, active]) => MEME_LAB_BOOST_BY_ID[id] && active.expiresAt > 0)
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
    subscribersSpent: safeNumber(lab?.subscribersSpent)
  };
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

    if (!saved) {
      continue;
    }

    next.towers[tower.id] = {
      amount: Math.floor(safeNumber(saved.amount)),
      totalProduced: safeNumber(saved.totalProduced)
    };
  }
}

function mergeUpgradeState(next, savedUpgrades) {
  for (const upgrade of UPGRADES) {
    const saved = findSavedEntry(savedUpgrades, [upgrade.id]);

    if (!saved) {
      continue;
    }

    const level = saved.level ?? saved.currentLevel ?? saved.baseLevel;
    const sanitizedLevel = Math.floor(safeNumber(level));
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
  return Object.fromEntries(
    Object.entries(achievements).filter(([id, value]) => validIds.has(id) && Boolean(value))
  );
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
