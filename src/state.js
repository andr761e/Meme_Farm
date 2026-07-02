import { TOWERS, TOWER_BY_ID, TOWER_COST_SCALE } from "./data/towers.js";
import { UPGRADES, UPGRADE_BY_ID } from "./data/upgrades.js";
import {
  ALGORITHM_RESEARCH_PROJECTS,
  ALGORITHM_RESEARCH_PROJECT_BY_ID,
  BAD_IDEA_BUTTON,
  BAD_IDEA_CONSEQUENCE_BY_ID,
  MEME_LAB_BOOST_BY_ID
} from "./data/memeLab.js";
import { PRESTIGE_MAX_LEVEL, PRESTIGE_TIER_BY_LEVEL, PRESTIGE_TIERS } from "./data/prestige.js";
import { TERMS_OF_SERVICE_EVENT_BY_ID } from "./data/termsOfService.js";
import { formatNumber } from "./utils/format.js";

export { PRESTIGE_MAX_LEVEL, PRESTIGE_TIERS };

export const SAVE_VERSION = 2;
export const PRESTIGE_STAT_LEVELS = [0, ...PRESTIGE_TIERS.map((tier) => tier.level)];
export const VISUAL_TAKEOVER_DEFAULTS = {
  botnet: true,
  discordMod: true,
  memeLord: true,
  rickrollLoop: true,
  realityGlitcher: true,
  cursedTikTok: true,
  algorithm: true
};
export const DESKTOP_COMPANION_DEFAULTS = {
  enabled: true,
  trayStatus: true,
  taskbarFlash: true,
  offlineReports: true,
  titleMischief: true
};
export const DEFAULT_DESKTOP_WINDOW_PRESET_ID = "1280x720";
export const DESKTOP_WINDOW_PRESETS = [
  { id: "fullscreen", label: "Fullscreen", fullscreen: true },
  { id: "1152x648", label: "1152 x 648", width: 1152, height: 648 },
  { id: "1280x720", label: "1280 x 720", width: 1280, height: 720 },
  { id: "1366x768", label: "1366 x 768", width: 1366, height: 768 },
  { id: "1440x810", label: "1440 x 810", width: 1440, height: 810 },
  { id: "1600x900", label: "1600 x 900", width: 1600, height: 900 },
  { id: "1920x1080", label: "1920 x 1080", width: 1920, height: 1080 }
];
export const DESKTOP_WINDOW_DEFAULTS = {
  sizePreset: DEFAULT_DESKTOP_WINDOW_PRESET_ID
};

export const gameState = createDefaultState();

export function createDefaultState() {
  return {
    saveVersion: SAVE_VERSION,
    likes: 0,
    totalLikesEver: 0,
    subscribers: 0,
    totalSubscribersEver: 0,
    playTimeSeconds: 0,
    totalClicks: 0,
    totalLikesFromClicks: 0,
    totalLikesSpent: 0,
    prestige: createDefaultPrestigeState(),
    leaderboardRecords: createDefaultLeaderboardRecords(),
    achievements: {},
    lab: {
      activeBoosts: {},
      activeObscureBoosts: {},
      activeConsequences: {},
      lastBadIdeaOutcome: null,
      totalBoostsPurchased: 0,
      boostPurchaseCounts: {},
      badIdeaPresses: 0,
      badIdeaOutcomeCounts: {},
      badIdeaDryStreak: 0,
      queuedBoostId: null,
      subscribersSpent: 0,
      research: {},
      researchSubscribersSpent: 0
    },
    towers: Object.fromEntries(TOWERS.map((tower) => [tower.id, createDefaultTowerState()])),
    upgrades: Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, createDefaultUpgradeState()])),
    stats: {
      createdAt: Date.now(),
      lastSaveTime: Date.now(),
      resetCount: 0,
      offlineLikesEarned: 0,
      bestLikesPerSecond: 0,
      bestClickPower: 1,
      superSubscribersCollected: 0,
      acceptedTerms: {}
    },
    settings: {
      musicMuted: false,
      sfxMuted: false,
      musicVolume: 1,
      sfxVolume: 1,
      visualTakeovers: { ...VISUAL_TAKEOVER_DEFAULTS },
      desktopCompanion: { ...DESKTOP_COMPANION_DEFAULTS },
      desktopWindow: { ...DESKTOP_WINDOW_DEFAULTS }
    }
  };
}

export function createDefaultTowerState() {
  return {
    amount: 0,
    totalProduced: 0
  };
}

export function createDefaultUpgradeState() {
  return {
    level: 0
  };
}

export function createDefaultPrestigeState() {
  return {
    level: 0,
    viralResets: 0,
    lastWentViralAt: 0,
    runStats: createDefaultPrestigeRunStatsByLevel()
  };
}

export function createDefaultPrestigeRunStatsByLevel() {
  return Object.fromEntries(
    PRESTIGE_STAT_LEVELS.map((level) => [level, createDefaultPrestigeRunStats(level)])
  );
}

export function createDefaultPrestigeRunStats(level = 0) {
  const normalizedLevel = normalizePrestigeLevel(level);

  return {
    level: normalizedLevel,
    likes: 0,
    totalLikesEver: 0,
    leaderboardLikesRecord: 0,
    progressionTitle: getProgressionTitle({ totalLikesEver: 0 }),
    likesPerSecond: 0,
    clickPower: 1,
    offlineCapacity: 0,
    subscribers: 0,
    totalSubscribersEver: 0,
    towersOwned: 0,
    totalClicks: 0,
    totalLikesSpent: 0,
    totalLikesFromClicks: 0,
    playTimeSeconds: 0,
    superSubscribersCollected: 0,
    acceptedTerms: {},
    capturedAt: 0,
    hasData: false
  };
}

export function createDefaultLeaderboardRecords() {
  return {
    totalLikesEver: 0,
    highestLps: 0,
    totalTowersOwned: 0,
    milestonesUnlocked: 0,
    totalClicks: 0,
    highestClickPower: 1,
    subscribersCollected: 0,
    prestigeLevel: 0
  };
}

export function replaceGameState(nextState) {
  for (const key of Object.keys(gameState)) {
    delete gameState[key];
  }

  Object.assign(gameState, nextState);
}

export function resetGameState() {
  const resetCount = (gameState.stats?.resetCount ?? 0) + 1;
  const nextState = createDefaultState();
  nextState.stats.resetCount = resetCount;
  replaceGameState(nextState);
}

export function getPrestigeLevel(state) {
  return normalizePrestigeLevel(state.prestige?.level);
}

export function getPrestigeTier(stateOrLevel) {
  const level = typeof stateOrLevel === "number"
    ? stateOrLevel
    : getPrestigeLevel(stateOrLevel);
  return PRESTIGE_TIER_BY_LEVEL[level] ?? null;
}

export function getPrestigeTowerLpsMultiplier(stateOrLevel) {
  return getPrestigeTier(stateOrLevel)?.towerLpsMultiplier ?? 1;
}

export function getPrestigeClickPowerMultiplier(stateOrLevel) {
  return getPrestigeTier(stateOrLevel)?.clickPowerMultiplier ?? 1;
}

export function getNextPrestigeTier(state) {
  return PRESTIGE_TIER_BY_LEVEL[getPrestigeLevel(state) + 1] ?? null;
}

export function getFinalTower() {
  return TOWERS[TOWERS.length - 1] ?? null;
}

export function hasFinalTower(state) {
  const finalTower = getFinalTower();
  return Boolean(finalTower && getTowerAmount(state, finalTower.id) >= 1);
}

export function canGoViral(state) {
  return getPrestigeLevel(state) < PRESTIGE_MAX_LEVEL && hasFinalTower(state);
}

export function getCurrentPrestigeRunStats(state, capturedAt = 0) {
  const likesPerSecond = getLikesPerSecond(state);
  const clickPower = getClickPower(state);
  const totalLikesEver = clampNumber(state.totalLikesEver);

  return {
    level: getPrestigeLevel(state),
    likes: clampNumber(state.likes),
    totalLikesEver,
    leaderboardLikesRecord: Math.max(clampNumber(state.leaderboardRecords?.totalLikesEver), totalLikesEver),
    progressionTitle: getProgressionTitle(state),
    likesPerSecond,
    clickPower,
    offlineCapacity: getOfflineProductionCapacity(state),
    subscribers: clampNumber(state.subscribers),
    totalSubscribersEver: clampNumber(state.totalSubscribersEver),
    towersOwned: getTotalTowersOwned(state),
    totalClicks: clampNumber(state.totalClicks),
    totalLikesSpent: clampNumber(state.totalLikesSpent),
    totalLikesFromClicks: clampNumber(state.totalLikesFromClicks),
    playTimeSeconds: clampNumber(state.playTimeSeconds),
    superSubscribersCollected: clampNumber(state.stats?.superSubscribersCollected),
    acceptedTerms: sanitizeAcceptedTermsSnapshot(state.stats?.acceptedTerms),
    capturedAt,
    hasData: true
  };
}

export function getPrestigeRunStats(state, level) {
  const normalizedLevel = normalizePrestigeLevel(level);

  if (normalizedLevel === getPrestigeLevel(state)) {
    return getCurrentPrestigeRunStats(state);
  }

  return sanitizePrestigeRunStats(
    state.prestige?.runStats?.[normalizedLevel],
    createDefaultPrestigeRunStats(normalizedLevel)
  );
}

export function getLifetimePrestigeStats(state) {
  const snapshots = PRESTIGE_STAT_LEVELS.map((level) => getPrestigeRunStats(state, level));
  const activeSnapshots = snapshots.filter((snapshot) => snapshot.hasData);
  const totalLikesEver = Math.max(
    activeSnapshots.reduce((sum, snapshot) => sum + snapshot.totalLikesEver, 0),
    clampNumber(state.leaderboardRecords?.totalLikesEver)
  );
  const totalSubscribersEver = Math.max(
    activeSnapshots.reduce((sum, snapshot) => sum + snapshot.totalSubscribersEver, 0),
    clampNumber(state.leaderboardRecords?.subscribersCollected)
  );
  const totalClicks = Math.max(
    activeSnapshots.reduce((sum, snapshot) => sum + snapshot.totalClicks, 0),
    clampNumber(state.leaderboardRecords?.totalClicks)
  );
  const acceptedTerms = Object.assign({}, ...activeSnapshots.map((snapshot) => snapshot.acceptedTerms));

  return {
    level: getPrestigeLevel(state),
    likes: clampNumber(state.likes),
    totalLikesEver,
    leaderboardLikesRecord: Math.max(clampNumber(state.leaderboardRecords?.totalLikesEver), totalLikesEver),
    progressionTitle: getProgressionTitle({ totalLikesEver }),
    likesPerSecond: Math.max(
      clampNumber(state.leaderboardRecords?.highestLps),
      ...activeSnapshots.map((snapshot) => snapshot.likesPerSecond)
    ),
    clickPower: Math.max(
      Math.max(1, clampNumber(state.leaderboardRecords?.highestClickPower, 1)),
      ...activeSnapshots.map((snapshot) => snapshot.clickPower)
    ),
    offlineCapacity: Math.max(0, ...activeSnapshots.map((snapshot) => snapshot.offlineCapacity)),
    subscribers: clampNumber(state.subscribers),
    totalSubscribersEver,
    towersOwned: Math.max(
      clampNumber(state.leaderboardRecords?.totalTowersOwned),
      ...activeSnapshots.map((snapshot) => snapshot.towersOwned)
    ),
    totalClicks,
    totalLikesSpent: activeSnapshots.reduce((sum, snapshot) => sum + snapshot.totalLikesSpent, 0),
    totalLikesFromClicks: activeSnapshots.reduce((sum, snapshot) => sum + snapshot.totalLikesFromClicks, 0),
    playTimeSeconds: activeSnapshots.reduce((sum, snapshot) => sum + snapshot.playTimeSeconds, 0),
    superSubscribersCollected: activeSnapshots.reduce((sum, snapshot) => sum + snapshot.superSubscribersCollected, 0),
    acceptedTerms,
    capturedAt: Math.max(0, ...activeSnapshots.map((snapshot) => snapshot.capturedAt)),
    hasData: activeSnapshots.length > 0
  };
}

export function sanitizePrestigeRunStatsByLevel(value) {
  const source = value && typeof value === "object" ? value : {};
  const defaults = createDefaultPrestigeRunStatsByLevel();

  return Object.fromEntries(
    PRESTIGE_STAT_LEVELS.map((level) => [
      level,
      sanitizePrestigeRunStats(source[level], defaults[level])
    ])
  );
}

export function sanitizePrestigeRunStats(value, fallback = createDefaultPrestigeRunStats(0)) {
  const defaultStats = typeof fallback === "number"
    ? createDefaultPrestigeRunStats(fallback)
    : fallback;
  const source = value && typeof value === "object" ? value : {};
  const level = normalizePrestigeLevel(source.level ?? defaultStats.level);

  return {
    level,
    likes: clampNumber(source.likes, defaultStats.likes),
    totalLikesEver: clampNumber(source.totalLikesEver, defaultStats.totalLikesEver),
    leaderboardLikesRecord: clampNumber(source.leaderboardLikesRecord, defaultStats.leaderboardLikesRecord),
    progressionTitle: String(source.progressionTitle ?? defaultStats.progressionTitle),
    likesPerSecond: clampNumber(source.likesPerSecond, defaultStats.likesPerSecond),
    clickPower: Math.max(1, clampNumber(source.clickPower, defaultStats.clickPower)),
    offlineCapacity: clampNumber(source.offlineCapacity, defaultStats.offlineCapacity),
    subscribers: clampNumber(source.subscribers, defaultStats.subscribers),
    totalSubscribersEver: clampNumber(source.totalSubscribersEver, defaultStats.totalSubscribersEver),
    towersOwned: clampNumber(source.towersOwned, defaultStats.towersOwned),
    totalClicks: clampNumber(source.totalClicks, defaultStats.totalClicks),
    totalLikesSpent: clampNumber(source.totalLikesSpent, defaultStats.totalLikesSpent),
    totalLikesFromClicks: clampNumber(source.totalLikesFromClicks, defaultStats.totalLikesFromClicks),
    playTimeSeconds: clampNumber(source.playTimeSeconds, defaultStats.playTimeSeconds),
    superSubscribersCollected: clampNumber(source.superSubscribersCollected, defaultStats.superSubscribersCollected),
    acceptedTerms: sanitizeAcceptedTermsSnapshot(source.acceptedTerms ?? defaultStats.acceptedTerms),
    capturedAt: clampNumber(source.capturedAt, defaultStats.capturedAt),
    hasData: Boolean(source.hasData ?? defaultStats.hasData)
  };
}

export function goViral(state, now = Date.now()) {
  const nextTier = getNextPrestigeTier(state);
  const finalTower = getFinalTower();
  const currentLevel = getPrestigeLevel(state);

  if (!nextTier) {
    return { ok: false, reason: "maxed" };
  }

  if (!finalTower || getTowerAmount(state, finalTower.id) < 1) {
    return { ok: false, reason: "locked", finalTower };
  }

  updateLeaderboardRecords(state);

  const preservedSettings = clonePlainObject(state.settings);
  const preservedRecords = {
    ...createDefaultLeaderboardRecords(),
    ...(state.leaderboardRecords ?? {})
  };
  const previousPrestige = state.prestige ?? createDefaultPrestigeState();
  const preservedResearch = clonePlainObject(state.lab?.research ?? {});
  const preservedResearchSubscribersSpent = clampNumber(state.lab?.researchSubscribersSpent);
  const subscriberRetention = getAlgorithmResearchEffectValue(state, "prestigeSubscriberRetention", 0);
  const retainedSubscribers = Math.floor(clampNumber(state.subscribers) * subscriberRetention);
  const preservedRunStats = sanitizePrestigeRunStatsByLevel(previousPrestige.runStats);
  preservedRunStats[currentLevel] = getCurrentPrestigeRunStats(state, now);
  const nextState = createDefaultState();

  nextState.settings = preservedSettings;
  nextState.subscribers = retainedSubscribers;
  nextState.totalSubscribersEver = retainedSubscribers;
  nextState.lab.research = preservedResearch;
  nextState.lab.researchSubscribersSpent = preservedResearchSubscribersSpent;
  nextState.leaderboardRecords = {
    ...preservedRecords,
    prestigeLevel: Math.max(preservedRecords.prestigeLevel ?? 0, nextTier.level)
  };
  nextState.prestige = {
    level: nextTier.level,
    viralResets: (previousPrestige.viralResets ?? getPrestigeLevel(state)) + 1,
    lastWentViralAt: now,
    runStats: preservedRunStats
  };

  for (const key of Object.keys(state)) {
    delete state[key];
  }

  Object.assign(state, nextState);

  return {
    ok: true,
    tier: nextTier,
    level: nextTier.level,
    towerLpsMultiplier: getPrestigeTowerLpsMultiplier(nextTier.level),
    clickPowerMultiplier: getPrestigeClickPowerMultiplier(nextTier.level),
    finalTower
  };
}

export function getTowerAmount(state, towerId) {
  return state.towers[towerId]?.amount ?? 0;
}

export function getUpgradeLevel(state, upgradeId) {
  return state.upgrades[upgradeId]?.level ?? 0;
}

export function getTowerCost(state, towerId) {
  const tower = TOWER_BY_ID[towerId];
  const amount = getTowerAmount(state, towerId);

  if (!tower) {
    return Infinity;
  }

  return Math.floor(tower.baseCost * Math.pow(tower.costScale ?? TOWER_COST_SCALE, amount));
}

export function getTowerPurchaseQuote(state, towerId, requestedAmount = 1) {
  const tower = TOWER_BY_ID[towerId];

  if (!tower) {
    return { amount: 0, cost: Infinity };
  }

  const currentAmount = getTowerAmount(state, towerId);
  const costScale = tower.costScale ?? TOWER_COST_SCALE;
  const buyMax = requestedAmount === "max";
  const targetAmount = buyMax
    ? Infinity
    : Math.max(1, Math.floor(clampNumber(requestedAmount, 1)));
  const budget = buyMax ? clampNumber(state.likes) : Infinity;
  let amount = 0;
  let cost = 0;

  while (amount < targetAmount) {
    const nextCost = Math.floor(tower.baseCost * Math.pow(costScale, currentAmount + amount));

    if (!Number.isFinite(nextCost) || (buyMax && nextCost > budget - cost)) {
      break;
    }

    cost += nextCost;
    amount += 1;
  }

  return { amount, cost };
}

export function getUpgradeCost(state, upgradeId) {
  const upgrade = UPGRADE_BY_ID[upgradeId];
  const level = getUpgradeLevel(state, upgradeId);

  if (!upgrade || isUpgradeMaxed(state, upgrade)) {
    return Infinity;
  }

  if (Array.isArray(upgrade.tierCosts) && Number.isFinite(upgrade.tierCosts[level])) {
    return Math.floor(upgrade.tierCosts[level]);
  }

  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale ?? 2, level));
}

export function hasUpgradeLevelCap(upgrade) {
  return Number.isFinite(upgrade?.maxLevel);
}

export function isUpgradeMaxed(state, upgrade) {
  return hasUpgradeLevelCap(upgrade) && getUpgradeLevel(state, upgrade.id) >= upgrade.maxLevel;
}

export function isRepeatableUpgrade(upgrade) {
  return upgrade?.type === "clickPower" || upgrade?.type === "offlineProductionCapacity";
}

export function shouldShowUpgradeInShop(state, upgrade) {
  if (!isUpgradeUnlocked(state, upgrade)) {
    return false;
  }

  return isRepeatableUpgrade(upgrade) || !isUpgradeMaxed(state, upgrade);
}

export function getTotalTowersOwned(state) {
  return Object.values(state.towers).reduce((sum, tower) => sum + (tower.amount ?? 0), 0);
}

export function getUnlockedAchievementCount(state) {
  return Object.values(state.achievements ?? {}).filter(Boolean).length;
}

export function getTowerMultiplier(state, towerId) {
  return UPGRADES.reduce((multiplier, upgrade) => {
    if (upgrade.effect?.towerId !== towerId) {
      return multiplier;
    }

    const level = getUpgradeLevel(state, upgrade.id);

    if (level <= 0) {
      return multiplier;
    }

    if (upgrade.type === "towerMultiplier") {
      return multiplier * Math.pow(upgrade.effect.multiplier, level);
    }

    if (upgrade.type === "towerAmountSynergy") {
      const sourceAmount = upgrade.effect.countsAllOtherTowers
        ? TOWERS.reduce((sum, tower) => tower.id === upgrade.effect.towerId ? sum : sum + getTowerAmount(state, tower.id), 0)
        : getTowerAmount(state, upgrade.effect.sourceTowerId);
      const rawMultiplier = 1 + sourceAmount * upgrade.effect.multiplierPerSource * level;
      const maxMultiplier = upgrade.effect.maxMultiplier;
      return multiplier * (Number.isFinite(maxMultiplier) ? Math.min(maxMultiplier, rawMultiplier) : rawMultiplier);
    }

    return multiplier;
  }, 1);
}

export function getGlobalLpsMultiplier(state) {
  return UPGRADES.reduce((multiplier, upgrade) => {
    if (upgrade.type !== "globalLpsMultiplier") {
      return multiplier;
    }

    const level = getUpgradeLevel(state, upgrade.id);
    return multiplier * Math.pow(upgrade.effect.multiplier, level);
  }, 1);
}

export function getTowerEffectiveLps(state, towerId) {
  const tower = TOWER_BY_ID[towerId];
  const amount = getTowerAmount(state, towerId);

  if (!tower || amount <= 0) {
    return 0;
  }

  return tower.lps
    * amount
    * getTowerMultiplier(state, towerId)
    * getGlobalLpsMultiplier(state)
    * getPrestigeTowerLpsMultiplier(state);
}

export function getLikesPerSecond(state, now = Date.now()) {
  const baseLps = getTowerLikesPerSecond(state);
  return baseLps * getLabBoostMultipliers(state, now).lps * getObscureLpsBoostMultiplier(state, now);
}

export function getTowerLikesPerSecond(state) {
  return TOWERS.reduce((sum, tower) => sum + getTowerEffectiveLps(state, tower.id), 0);
}

export function getClickPower(state) {
  const clickEffect = UPGRADES.reduce((effect, upgrade) => {
    if (upgrade.type !== "clickPower") {
      return effect;
    }

    const level = getUpgradeLevel(state, upgrade.id);
    const towerLpsShare = Math.min(
      upgrade.effect.maxTowerLpsShare ?? Infinity,
      level * (upgrade.effect.towerLpsSharePerLevel ?? 0)
    );
    return {
      flatMultiplier: effect.flatMultiplier * Math.pow(upgrade.effect.multiplier, level),
      towerLpsShare: effect.towerLpsShare + towerLpsShare
    };
  }, { flatMultiplier: 1, towerLpsShare: 0 });

  const flatPower = clickEffect.flatMultiplier * getPrestigeClickPowerMultiplier(state);
  const towerPower = getTowerLikesPerSecond(state) * clickEffect.towerLpsShare;
  return (flatPower + towerPower) * getLabBoostMultipliers(state).click;
}

export function getActiveLabBoosts(state, now = Date.now()) {
  const activeBoosts = state.lab?.activeBoosts ?? {};
  return Object.entries(activeBoosts)
    .map(([id, active]) => {
      const boost = MEME_LAB_BOOST_BY_ID[id];
      const expiresAt = Number(active?.expiresAt);
      const remainingSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));

      if (!boost || remainingSeconds <= 0) {
        return null;
      }

      return {
        ...boost,
        expiresAt,
        remainingSeconds
      };
    })
    .filter(Boolean);
}

export function hasActiveLabProgramBoost(state, programId, now = Date.now()) {
  return getActiveLabBoosts(state, now).some((boost) => boost.programId === programId);
}

export function getLabBoostMultipliers(state, now = Date.now()) {
  return getActiveLabBoosts(state, now).reduce(
    (multipliers, boost) => ({
      lps: multipliers.lps * (boost.lpsMultiplier ?? 1),
      click: multipliers.click * (boost.clickMultiplier ?? 1)
    }),
    { lps: 1, click: 1 }
  );
}

export function getActiveObscureLpsBoosts(state, now = Date.now()) {
  const activeBoosts = state.lab?.activeObscureBoosts ?? {};

  return Object.entries(activeBoosts)
    .map(([id, active]) => {
      const upgrade = UPGRADE_BY_ID[id];
      const expiresAt = Number(active?.expiresAt);
      const multiplier = Number(active?.multiplier);
      const remainingSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));

      if (!upgrade || upgrade.type !== "randomLpsBoost" || !Number.isFinite(multiplier) || multiplier <= 1 || remainingSeconds <= 0) {
        return null;
      }

      return {
        id,
        name: upgrade.displayName,
        multiplier,
        expiresAt,
        remainingSeconds
      };
    })
    .filter(Boolean);
}

export function getObscureLpsBoostMultiplier(state, now = Date.now()) {
  return getActiveObscureLpsBoosts(state, now).reduce(
    (multiplier, boost) => multiplier * boost.multiplier,
    1
  );
}

export function updateLeaderboardRecords(state) {
  state.stats ??= {};
  state.leaderboardRecords ??= createDefaultLeaderboardRecords();

  const previousBestLps = state.stats.bestLikesPerSecond ?? 0;
  const previousBestClickPower = state.stats.bestClickPower ?? 1;
  const currentLps = getLikesPerSecond(state);
  const currentClickPower = getClickPower(state);
  const nextBestLps = Math.max(previousBestLps, currentLps);
  const nextBestClickPower = Math.max(previousBestClickPower, currentClickPower);
  const previousRecords = { ...state.leaderboardRecords };

  state.stats.bestLikesPerSecond = nextBestLps;
  state.stats.bestClickPower = nextBestClickPower;

  state.leaderboardRecords.totalLikesEver = Math.max(state.leaderboardRecords.totalLikesEver ?? 0, state.totalLikesEver ?? 0);
  state.leaderboardRecords.highestLps = Math.max(state.leaderboardRecords.highestLps ?? 0, nextBestLps);
  state.leaderboardRecords.totalTowersOwned = Math.max(state.leaderboardRecords.totalTowersOwned ?? 0, getTotalTowersOwned(state));
  state.leaderboardRecords.milestonesUnlocked = Math.max(state.leaderboardRecords.milestonesUnlocked ?? 0, getUnlockedAchievementCount(state));
  state.leaderboardRecords.totalClicks = Math.max(state.leaderboardRecords.totalClicks ?? 0, state.totalClicks ?? 0);
  state.leaderboardRecords.highestClickPower = Math.max(state.leaderboardRecords.highestClickPower ?? 1, nextBestClickPower);
  state.leaderboardRecords.subscribersCollected = Math.max(state.leaderboardRecords.subscribersCollected ?? 0, state.totalSubscribersEver ?? 0);
  state.leaderboardRecords.prestigeLevel = Math.max(state.leaderboardRecords.prestigeLevel ?? 0, getPrestigeLevel(state));

  return nextBestLps !== previousBestLps ||
    nextBestClickPower !== previousBestClickPower ||
    Object.keys(state.leaderboardRecords).some((key) => state.leaderboardRecords[key] !== previousRecords[key]);
}

export function getSubscriberSpawnMultiplier(state) {
  return UPGRADES.reduce((multiplier, upgrade) => {
    if (upgrade.type !== "subscriberBonus") {
      return multiplier;
    }

    const level = getUpgradeLevel(state, upgrade.id);
    return multiplier * Math.pow(upgrade.effect.spawnMultiplier, level);
  }, 1);
}

export function getFakeSubscriberConversion(state) {
  const upgradeConversion = UPGRADES.reduce(
    (conversion, upgrade) => {
      if (upgrade.type !== "subscriberFakeConversion" || getUpgradeLevel(state, upgrade.id) <= 0) {
        return conversion;
      }

      return {
        chance: conversion.chance + (upgrade.effect.conversionChance ?? 0),
        amount: Math.max(conversion.amount, upgrade.effect.amount ?? 1)
      };
    },
    { chance: 0, amount: 1 }
  );

  return {
    ...upgradeConversion,
    chance: Math.min(1, upgradeConversion.chance + getAlgorithmResearchEffectValue(state, "fakeSubscriberConversion", 0))
  };
}

export function getSubscriberAutoCollector(state) {
  return UPGRADES.reduce(
    (collector, upgrade) => {
      if (upgrade.type !== "subscriberAutoCollector" || getUpgradeLevel(state, upgrade.id) <= 0) {
        return collector;
      }

      return {
        chance: collector.chance + (upgrade.effect.autoCollectChance ?? 0),
        maxPerRaid: Math.max(collector.maxPerRaid, upgrade.effect.maxPerRaid ?? 1),
        delayMinMs: Math.min(collector.delayMinMs, upgrade.effect.delayMinMs ?? collector.delayMinMs),
        delayMaxMs: Math.max(collector.delayMaxMs, upgrade.effect.delayMaxMs ?? collector.delayMaxMs)
      };
    },
    { chance: 0, maxPerRaid: 0, delayMinMs: 900, delayMaxMs: 2500 }
  );
}

export function getOfflineProductionCapacity(state) {
  return UPGRADES.reduce((capacity, upgrade) => {
    if (upgrade.type !== "offlineProductionCapacity") {
      return capacity;
    }

    const level = getUpgradeLevel(state, upgrade.id);
    const nextCapacity = level * upgrade.effect.capacityPerLevel;
    return Math.min(upgrade.effect.maxCapacity, capacity + nextCapacity);
  }, 0);
}

export function getOfflineProductionMaxSeconds() {
  return UPGRADES.reduce((maxSeconds, upgrade) => {
    if (upgrade.type !== "offlineProductionCapacity") {
      return maxSeconds;
    }

    return Math.max(maxSeconds, upgrade.effect.maxOfflineSeconds ?? 0);
  }, 0);
}

export function isTowerUnlocked(state, tower) {
  if (getTowerAmount(state, tower.id) > 0) {
    return true;
  }

  const towerIndex = TOWERS.findIndex((item) => item.id === tower.id);
  if (towerIndex > 0) {
    const previousTower = TOWERS[towerIndex - 1];
    if (getTowerAmount(state, previousTower.id) < 1) {
      return false;
    }
  }

  return isUnlockSatisfied(state, tower.unlockAt);
}

export function isUpgradeUnlocked(state, upgrade) {
  if (getUpgradeLevel(state, upgrade.id) > 0) {
    return true;
  }

  return isUnlockSatisfied(state, upgrade.unlockAt, { ignoreTotalLikesEver: true });
}

export function isUnlockSatisfied(state, unlockAt = {}, options = {}) {
  if (!options.ignoreTotalLikesEver && (unlockAt.totalLikesEver ?? 0) > state.totalLikesEver) {
    return false;
  }

  if ((unlockAt.totalSubscribersEver ?? 0) > state.totalSubscribersEver) {
    return false;
  }

  if ((unlockAt.towersOwned ?? 0) > getTotalTowersOwned(state)) {
    return false;
  }

  if (unlockAt.towerId && getTowerAmount(state, unlockAt.towerId) < (unlockAt.amount ?? 1)) {
    return false;
  }

  if (Array.isArray(unlockAt.towerRequirements)) {
    for (const requirement of unlockAt.towerRequirements) {
      if (requirement?.towerId && getTowerAmount(state, requirement.towerId) < (requirement.amount ?? 1)) {
        return false;
      }
    }
  }

  if (unlockAt.upgradeId && getUpgradeLevel(state, unlockAt.upgradeId) < (unlockAt.level ?? 1)) {
    return false;
  }

  return true;
}

export function getNextLockedTower(state) {
  return TOWERS.find((tower) => !isTowerUnlocked(state, tower)) ?? null;
}

export function addLikes(state, amount) {
  const value = clampNumber(amount);

  if (value <= 0) {
    return 0;
  }

  state.likes += value;
  state.totalLikesEver += value;
  return value;
}

export function clickMemeButton(state) {
  const gain = getClickPower(state);
  addLikes(state, gain);
  state.totalClicks += 1;
  state.totalLikesFromClicks += gain;
  return gain;
}

export function purchaseTower(state, towerId, requestedAmount = 1) {
  const tower = TOWER_BY_ID[towerId];

  if (!tower || !isTowerUnlocked(state, tower)) {
    return { ok: false, reason: "locked" };
  }

  const quote = getTowerPurchaseQuote(state, towerId, requestedAmount);
  const cost = quote.cost;

  if (quote.amount <= 0 || state.likes < cost) {
    const nextCost = getTowerCost(state, towerId);
    const missing = requestedAmount === "max"
      ? Math.max(0, nextCost - state.likes)
      : Math.max(0, cost - state.likes);
    return { ok: false, reason: "need-more", missing };
  }

  state.likes -= cost;
  state.totalLikesSpent += cost;
  awardTower(state, towerId, quote.amount);
  return { ok: true, cost, amount: quote.amount };
}

export function hasAcceptedTermsOfService(state, eventId) {
  return Boolean(TERMS_OF_SERVICE_EVENT_BY_ID[eventId] && state.stats?.acceptedTerms?.[eventId]);
}

export function acceptTermsOfService(state, eventId) {
  if (!TERMS_OF_SERVICE_EVENT_BY_ID[eventId]) {
    return false;
  }

  state.stats ??= {};
  state.stats.acceptedTerms ??= {};
  state.stats.acceptedTerms[eventId] = Date.now();
  return true;
}

export function awardTower(state, towerId, amount = 1) {
  if (!TOWER_BY_ID[towerId]) {
    return { ok: false, reason: "unknown-tower" };
  }

  const value = Math.max(1, Math.floor(clampNumber(amount, 1)));
  state.towers[towerId] ??= createDefaultTowerState();
  state.towers[towerId].amount += value;
  return { ok: true, amount: value };
}

export function purchaseUpgrade(state, upgradeId) {
  const upgrade = UPGRADE_BY_ID[upgradeId];

  if (!upgrade || !isUpgradeUnlocked(state, upgrade)) {
    return { ok: false, reason: "locked" };
  }

  if (isUpgradeMaxed(state, upgrade)) {
    return { ok: false, reason: "maxed" };
  }

  const cost = getUpgradeCost(state, upgradeId);

  if (state.likes < cost) {
    return { ok: false, reason: "need-more", missing: cost - state.likes };
  }

  state.likes -= cost;
  state.totalLikesSpent += cost;
  state.upgrades[upgradeId] ??= createDefaultUpgradeState();
  state.upgrades[upgradeId].level += 1;
  return { ok: true, cost, upgrade };
}

export function purchaseLabBoost(state, boostId, now = Date.now()) {
  const boost = MEME_LAB_BOOST_BY_ID[boostId];

  if (!boost) {
    return { ok: false, reason: "unknown" };
  }

  pruneExpiredLabBoosts(state, now);

  const hasActiveBoost = hasActiveLabProgramBoost(state, boost.programId, now);
  const canQueue = hasAlgorithmResearch(state, "scheduled_bribe");

  if (hasActiveBoost && (!canQueue || state.lab?.queuedBoostId)) {
    return { ok: false, reason: state.lab?.queuedBoostId ? "queue-full" : "active" };
  }

  const subscriberCost = getLabBoostSubscriberCost(state, boost);

  if (state.subscribers < subscriberCost) {
    return { ok: false, reason: "need-more", missing: subscriberCost - state.subscribers };
  }

  state.subscribers -= subscriberCost;
  state.lab ??= {};
  state.lab.activeBoosts ??= {};
  state.lab.boostPurchaseCounts ??= {};
  state.lab.totalBoostsPurchased = (state.lab.totalBoostsPurchased ?? 0) + 1;
  state.lab.boostPurchaseCounts[boostId] = (state.lab.boostPurchaseCounts[boostId] ?? 0) + 1;
  state.lab.subscribersSpent = (state.lab.subscribersSpent ?? 0) + subscriberCost;

  if (hasActiveBoost) {
    state.lab.queuedBoostId = boostId;
    return { ok: true, cost: subscriberCost, boost, queued: true };
  }

  activateLabBoost(state, boost, now);

  return { ok: true, cost: subscriberCost, boost, queued: false };
}

export function purchaseAlgorithmResearch(state, projectId, now = Date.now()) {
  const project = ALGORITHM_RESEARCH_PROJECT_BY_ID[projectId];

  if (!project) {
    return { ok: false, reason: "unknown" };
  }

  if (hasAlgorithmResearch(state, projectId)) {
    return { ok: false, reason: "owned" };
  }

  if (project.requires && !hasAlgorithmResearch(state, project.requires)) {
    return { ok: false, reason: "prerequisite", prerequisite: ALGORITHM_RESEARCH_PROJECT_BY_ID[project.requires] };
  }

  if (state.subscribers < project.subscriberCost) {
    return { ok: false, reason: "need-more", missing: project.subscriberCost - state.subscribers };
  }

  state.subscribers -= project.subscriberCost;
  state.lab ??= {};
  state.lab.research ??= {};
  state.lab.research[projectId] = { purchasedAt: now };
  state.lab.researchSubscribersSpent = (state.lab.researchSubscribersSpent ?? 0) + project.subscriberCost;
  state.lab.subscribersSpent = (state.lab.subscribersSpent ?? 0) + project.subscriberCost;

  return { ok: true, cost: project.subscriberCost, project };
}

export function hasAlgorithmResearch(state, projectId) {
  return Boolean(ALGORITHM_RESEARCH_PROJECT_BY_ID[projectId] && state.lab?.research?.[projectId]);
}

export function getAlgorithmResearchCount(state) {
  return ALGORITHM_RESEARCH_PROJECTS.reduce(
    (count, project) => count + (hasAlgorithmResearch(state, project.id) ? 1 : 0),
    0
  );
}

export function getAlgorithmResearchEffectValue(state, effectType, fallback = 0) {
  const project = ALGORITHM_RESEARCH_PROJECTS.find(
    (item) => item.effect?.type === effectType && hasAlgorithmResearch(state, item.id)
  );
  return project?.effect?.value ?? fallback;
}

export function getLabBoostSubscriberCost(state, boostOrId) {
  const boost = typeof boostOrId === "string" ? MEME_LAB_BOOST_BY_ID[boostOrId] : boostOrId;
  const multiplier = getAlgorithmResearchEffectValue(state, "bribeCostMultiplier", 1);
  return boost ? Math.max(1, Math.ceil(boost.subscriberCost * multiplier)) : Infinity;
}

export function getLabBoostDuration(state, boostOrId) {
  const boost = typeof boostOrId === "string" ? MEME_LAB_BOOST_BY_ID[boostOrId] : boostOrId;
  const multiplier = getAlgorithmResearchEffectValue(state, "bribeDurationMultiplier", 1);
  return boost ? Math.max(1, Math.round(boost.durationSeconds * multiplier)) : 0;
}

export function getMissedSubscriberRecoveryChance(state) {
  return getAlgorithmResearchEffectValue(state, "missedSubscriberRecovery", 0);
}

export function pressBadIdeaButton(state, now = Date.now(), rng = Math.random) {
  const cost = BAD_IDEA_BUTTON.subscriberCost;

  if (state.subscribers < cost) {
    return { ok: false, reason: "need-more", missing: cost - state.subscribers };
  }

  state.subscribers -= cost;
  state.lab ??= {};
  state.lab.activeBoosts ??= {};
  state.lab.badIdeaOutcomeCounts ??= {};
  state.lab.badIdeaPresses = (state.lab.badIdeaPresses ?? 0) + 1;
  state.lab.subscribersSpent = (state.lab.subscribersSpent ?? 0) + cost;

  const random = normalizeRandomSource(rng);
  const pityThreshold = getAlgorithmResearchEffectValue(state, "badIdeaPityThreshold", Infinity);
  const positiveOutcomes = BAD_IDEA_BUTTON.outcomes.filter(isPositiveBadIdeaOutcome);
  const guaranteedPositive = (state.lab.badIdeaDryStreak ?? 0) >= pityThreshold;
  const outcome = chooseWeightedOutcome(guaranteedPositive ? positiveOutcomes : BAD_IDEA_BUTTON.outcomes, random);
  const result = applyBadIdeaOutcome(state, outcome, random);
  const consequence = startBadIdeaConsequence(state, outcome.consequence, now);
  const message = consequence
    ? `${result.message} Aftermath: ${consequence.title} for ${consequence.durationSeconds}s.`
    : result.message;
  const lastOutcome = {
    id: outcome.id,
    name: outcome.name,
    message,
    consequenceId: consequence?.id ?? null,
    createdAt: now
  };

  state.lab.lastBadIdeaOutcome = lastOutcome;
  state.lab.badIdeaOutcomeCounts[outcome.id] = (state.lab.badIdeaOutcomeCounts[outcome.id] ?? 0) + 1;
  state.lab.badIdeaDryStreak = isPositiveBadIdeaOutcome(outcome)
    ? 0
    : (state.lab.badIdeaDryStreak ?? 0) + 1;

  return {
    ok: true,
    cost,
    outcome,
    result,
    consequence,
    message
  };
}

export function getActiveBadIdeaConsequences(state, now = Date.now()) {
  const activeConsequences = state.lab?.activeConsequences ?? {};
  return Object.entries(activeConsequences)
    .map(([id, active]) => {
      const consequence = BAD_IDEA_CONSEQUENCE_BY_ID[id];
      const expiresAt = Number(active?.expiresAt);
      const remainingSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));

      if (!consequence || remainingSeconds <= 0) {
        return null;
      }

      return {
        ...consequence,
        expiresAt,
        remainingSeconds
      };
    })
    .filter(Boolean);
}

export function hasActiveBadIdeaConsequence(state, consequenceId, now = Date.now()) {
  return getActiveBadIdeaConsequences(state, now).some((consequence) => consequence.id === consequenceId);
}

export function pruneExpiredLabBoosts(state, now = Date.now()) {
  const activeBoosts = state.lab?.activeBoosts;

  if (!activeBoosts) {
    return false;
  }

  let changed = false;

  for (const [id, active] of Object.entries(activeBoosts)) {
    const boost = MEME_LAB_BOOST_BY_ID[id];
    const expiresAt = Number(active?.expiresAt);

    if (!boost || !Number.isFinite(expiresAt) || expiresAt <= now) {
      delete activeBoosts[id];
      changed = true;
    }
  }

  if (Object.keys(activeBoosts).length === 0 && state.lab?.queuedBoostId) {
    const queuedBoost = MEME_LAB_BOOST_BY_ID[state.lab.queuedBoostId];
    state.lab.queuedBoostId = null;
    if (queuedBoost && hasAlgorithmResearch(state, "scheduled_bribe")) {
      activateLabBoost(state, queuedBoost, now);
      changed = true;
    }
  }

  return changed;
}

export function pruneExpiredObscureLpsBoosts(state, now = Date.now()) {
  const activeBoosts = state.lab?.activeObscureBoosts;

  if (!activeBoosts) {
    return false;
  }

  let changed = false;

  for (const [id, active] of Object.entries(activeBoosts)) {
    const upgrade = UPGRADE_BY_ID[id];
    const expiresAt = Number(active?.expiresAt);
    const multiplier = Number(active?.multiplier);

    if (!upgrade || upgrade.type !== "randomLpsBoost" || !Number.isFinite(expiresAt) || expiresAt <= now || !Number.isFinite(multiplier) || multiplier <= 1) {
      delete activeBoosts[id];
      changed = true;
    }
  }

  return changed;
}

export function maybeTriggerObscureLpsBoosts(state, now = Date.now(), rng = Math.random) {
  pruneExpiredObscureLpsBoosts(state, now);
  const random = normalizeRandomSource(rng);
  const triggered = [];
  state.lab ??= {};
  state.lab.activeObscureBoosts ??= {};

  for (const upgrade of UPGRADES) {
    if (upgrade.type !== "randomLpsBoost" || getUpgradeLevel(state, upgrade.id) <= 0 || state.lab.activeObscureBoosts[upgrade.id]) {
      continue;
    }

    const chance = Math.max(0, Number(upgrade.effect?.triggerChancePerSecond) || 0);

    if (random() >= chance) {
      continue;
    }

    const multipliers = Array.isArray(upgrade.effect?.multipliers)
      ? upgrade.effect.multipliers.filter((multiplier) => Number(multiplier) > 1)
      : [];
    const multiplier = multipliers[Math.floor(random() * multipliers.length)] ?? 2;
    const durationSeconds = Math.max(1, Number(upgrade.effect?.durationSeconds) || 15);

    state.lab.activeObscureBoosts[upgrade.id] = {
      multiplier,
      expiresAt: now + durationSeconds * 1000
    };
    triggered.push({
      id: upgrade.id,
      name: upgrade.displayName,
      multiplier,
      durationSeconds
    });
  }

  return triggered;
}

export function collectSubscriber(state, amount = 1) {
  const value = Math.max(1, Math.floor(clampNumber(amount, 1)));
  state.subscribers += value;
  state.totalSubscribersEver += value;
  return value;
}

export function tickProduction(state, deltaSeconds) {
  const delta = Math.max(0, clampNumber(deltaSeconds));
  state.playTimeSeconds += delta;
  return applyProduction(state, delta);
}

function applyProduction(state, deltaSeconds) {
  const labMultipliers = getLabBoostMultipliers(state);
  const obscureLpsMultiplier = getObscureLpsBoostMultiplier(state);
  const temporaryLpsMultiplier = labMultipliers.lps * obscureLpsMultiplier;
  const lps = getLikesPerSecond(state);
  const gained = lps * deltaSeconds;

  if (gained <= 0) {
    return 0;
  }

  addLikes(state, gained);

  for (const tower of TOWERS) {
    const produced = getTowerEffectiveLps(state, tower.id) * temporaryLpsMultiplier * deltaSeconds;
    state.towers[tower.id].totalProduced += produced;
  }

  return gained;
}

export function applyOfflineProgress(state, lastSaveTime, now = Date.now()) {
  const savedAt = Number(lastSaveTime);

  if (!Number.isFinite(savedAt) || savedAt <= 0 || now <= savedAt) {
    return { secondsAway: 0, productionSeconds: 0, likesEarned: 0 };
  }

  const secondsAway = Math.floor((now - savedAt) / 1000);
  const maxOfflineSeconds = getOfflineProductionMaxSeconds();
  const cappedSeconds = Math.min(secondsAway, maxOfflineSeconds);
  const capacity = getOfflineProductionCapacity(state);
  const effectiveSeconds = cappedSeconds * capacity;
  const likesEarned = applyProduction(state, effectiveSeconds);

  if (likesEarned > 0) {
    state.stats.offlineLikesEarned = likesEarned;
  }

  return {
    secondsAway,
    productionSeconds: cappedSeconds,
    likesEarned,
    capacity,
    maxOfflineSeconds
  };
}

export function pruneExpiredBadIdeaConsequences(state, now = Date.now()) {
  const activeConsequences = state.lab?.activeConsequences;

  if (!activeConsequences) {
    return false;
  }

  let changed = false;

  for (const [id, active] of Object.entries(activeConsequences)) {
    const consequence = BAD_IDEA_CONSEQUENCE_BY_ID[id];
    const expiresAt = Number(active?.expiresAt);

    if (!consequence || !Number.isFinite(expiresAt) || expiresAt <= now) {
      delete activeConsequences[id];
      changed = true;
    }
  }

  return changed;
}

export function unlockAchievement(state, achievementId) {
  if (state.achievements[achievementId]) {
    return false;
  }

  state.achievements[achievementId] = {
    unlockedAt: Date.now()
  };

  return true;
}

export function getProgressionTitle(state) {
  const total = state.totalLikesEver;

  if (total >= 1000000000) return "Algorithmic Overlord";
  if (total >= 10000000) return "Viral Monarchy";
  if (total >= 1000000) return "Clout Industrialist";
  if (total >= 100000) return "Main Character Arc";
  if (total >= 10000) return "Certified Poster";
  if (total >= 1000) return "Freshly Fried";
  if (total >= 100) return "Group Chat Menace";
  return "Dank Basement";
}

export const APOCALYPSE_ERAS = [
  {
    id: "basement_posting",
    className: "era-basement-posting",
    title: "Basement Posting",
    label: "Basement Posting",
    description: "One button, one questionable post, and the fragile belief that this can stay normal.",
    clickVerb: "posted",
    popupSuffix: "fresh post",
    unlockHint: "Default stage"
  },
  {
    id: "bot_economy",
    className: "era-bot-economy",
    title: "Bot Economy",
    label: "Bot Economy",
    description: "The accounts look real enough. Engagement starts arriving with identical profile pictures.",
    clickVerb: "boosted",
    popupSuffix: "bot applause",
    unlockHint: "Botnet era"
  },
  {
    id: "algorithm_takeover",
    className: "era-algorithm-takeover",
    title: "Algorithm Takeover",
    label: "Algorithm Takeover",
    description: "The feed is no longer recommending your memes. It is negotiating with them.",
    clickVerb: "fed",
    popupSuffix: "feed breach",
    unlockHint: "AI Meme Generator era"
  },
  {
    id: "reality_corruption",
    className: "era-reality-corruption",
    title: "Reality Corruption",
    label: "Reality Corruption",
    description: "The posts have escaped the screen. Reality is now rendering with comment-section physics.",
    clickVerb: "glitched",
    popupSuffix: "reality leak",
    unlockHint: "Reality Glitcher era"
  },
  {
    id: "multiverse_collapse",
    className: "era-multiverse-collapse",
    title: "Multiverse Collapse",
    label: "Multiverse Collapse",
    description: "Every timeline is farming the same meme and the UI is pretending this is manageable.",
    clickVerb: "crossposted",
    popupSuffix: "timeline fracture",
    unlockHint: "Meme Multiverse era"
  }
];

export function getApocalypseEra(state) {
  if (isMajorTowerOnline(state, "meme_multiverse_server") || isMajorTowerOnline(state, "the_algorithm")) {
    return APOCALYPSE_ERAS[4];
  }

  if (isMajorTowerOnline(state, "reality_glitcher")) {
    return APOCALYPSE_ERAS[3];
  }

  if (isMajorTowerOnline(state, "ai_meme_generator")) {
    return APOCALYPSE_ERAS[2];
  }

  if (isMajorTowerOnline(state, "botnet") || isMajorTowerOnline(state, "doomscroller")) {
    return APOCALYPSE_ERAS[1];
  }

  return APOCALYPSE_ERAS[0];
}

function isMajorTowerOnline(state, towerId) {
  const tower = TOWER_BY_ID[towerId];
  return Boolean(tower && (getTowerAmount(state, towerId) > 0 || isTowerUnlocked(state, tower)));
}

function clampNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function normalizePrestigeLevel(value) {
  return Math.max(0, Math.min(PRESTIGE_MAX_LEVEL, Math.floor(Number(value) || 0)));
}

function clonePlainObject(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function sanitizeAcceptedTermsSnapshot(acceptedTerms) {
  if (!acceptedTerms || typeof acceptedTerms !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(acceptedTerms)
      .filter(([id, value]) => TERMS_OF_SERVICE_EVENT_BY_ID[id] && value)
      .map(([id, value]) => [id, clampNumber(value, Date.now())])
  );
}

function applyBadIdeaOutcome(state, outcome, random) {
  if (outcome.type === "awardRandomTower") {
    const tower = pickRandomTower(state, outcome.towerPool, random);
    const amount = outcome.amount ?? 1;
    awardTower(state, tower.id, amount);
    return {
      label: `+${amount} ${tower.displayName}`,
      message: `${outcome.name}: +${formatNumber(amount)} ${tower.displayName}.`
    };
  }

  if (outcome.type === "addLikesFromLps") {
    const likes = Math.max(outcome.minimumLikes ?? 0, getLikesPerSecond(state) * (outcome.seconds ?? 0));
    const gained = addLikes(state, likes);
    return {
      label: `+${formatNumber(gained)} Likes`,
      message: `${outcome.name}: +${formatNumber(gained)} Likes.`
    };
  }

  if (outcome.type === "addLikesFromClicks") {
    const clicks = Math.max(0, Math.floor(clampNumber(outcome.clicks)));
    const likes = getClickPower(state) * clicks;
    const gained = addLikes(state, likes);
    return {
      label: `+${formatNumber(gained)} Likes`,
      message: `${outcome.name}: +${formatNumber(gained)} Likes.`
    };
  }

  if (outcome.type === "addSubscribers") {
    const amount = Math.max(0, Math.floor(clampNumber(outcome.amount)));
    state.subscribers += amount;
    state.totalSubscribersEver += amount;
    return {
      label: `+${formatNumber(amount)} Subscribers`,
      message: `${outcome.name}: +${formatNumber(amount)} Subscribers.`
    };
  }

  if (outcome.type === "loseLikesFromLps") {
    const availableLikes = Math.max(0, clampNumber(state.likes));
    const lossMultiplier = getAlgorithmResearchEffectValue(state, "badIdeaLossMultiplier", 1);
    const rawAmount = getLikesPerSecond(state) * Math.max(0, clampNumber(outcome.seconds)) * lossMultiplier;
    const amount = Math.min(availableLikes, rawAmount);
    state.likes = Math.max(0, availableLikes - amount);
    return {
      label: `-${formatNumber(amount)} Likes`,
      message: amount > 0
        ? `${outcome.name}: -${formatNumber(amount)} Likes.`
        : `${outcome.name}: the invoice found no Likes to collect.`
    };
  }

  if (outcome.type === "loseSubscribers") {
    const availableSubscribers = Math.max(0, Math.floor(clampNumber(state.subscribers)));
    const lossMultiplier = getAlgorithmResearchEffectValue(state, "badIdeaLossMultiplier", 1);
    const amount = Math.min(availableSubscribers, Math.max(0, Math.ceil(clampNumber(outcome.amount) * lossMultiplier)));
    state.subscribers = Math.max(0, availableSubscribers - amount);
    return {
      label: `-${formatNumber(amount)} Subscribers`,
      message: amount > 0
        ? `${outcome.name}: -${formatNumber(amount)} Subscribers.`
        : `${outcome.name}: nobody extra was left to disappoint.`
    };
  }

  return {
    label: "No reward",
    message: `${outcome.name}: no reward. The button remains deeply pleased with itself.`
  };
}

function activateLabBoost(state, boost, now) {
  state.lab ??= {};
  state.lab.activeBoosts ??= {};
  state.lab.activeBoosts[boost.id] = {
    expiresAt: now + getLabBoostDuration(state, boost) * 1000
  };
}

function isPositiveBadIdeaOutcome(outcome) {
  return ["awardRandomTower", "addLikesFromLps", "addLikesFromClicks", "addSubscribers"].includes(outcome?.type);
}

function startBadIdeaConsequence(state, consequence, now) {
  if (!consequence || !BAD_IDEA_CONSEQUENCE_BY_ID[consequence.id]) {
    return null;
  }

  state.lab ??= {};
  state.lab.activeConsequences ??= {};
  state.lab.activeConsequences[consequence.id] = {
    expiresAt: now + consequence.durationSeconds * 1000
  };

  return {
    ...consequence,
    expiresAt: state.lab.activeConsequences[consequence.id].expiresAt
  };
}

function chooseWeightedOutcome(outcomes, random) {
  const totalWeight = outcomes.reduce((sum, outcome) => sum + (outcome.weight ?? 0), 0);
  let roll = random() * totalWeight;

  for (const outcome of outcomes) {
    roll -= outcome.weight ?? 0;
    if (roll <= 0) {
      return outcome;
    }
  }

  return outcomes[outcomes.length - 1];
}

function pickRandomTower(state, towerPool, random) {
  const towers = towerPool === "starter"
    ? TOWERS.slice(0, 5)
    : TOWERS.filter((tower) => isTowerUnlocked(state, tower));
  const pool = towers.length > 0 ? towers : TOWERS.slice(0, 1);
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool[index];
}

function normalizeRandomSource(rng) {
  if (typeof rng === "function") {
    return () => clampRoll(rng());
  }

  return () => clampRoll(rng);
}

function clampRoll(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(0.999999, Math.max(0, number));
}
