import { TOWERS, TOWER_BY_ID } from "./data/towers.js";
import { UPGRADES, UPGRADE_BY_ID } from "./data/upgrades.js";
import { BAD_IDEA_BUTTON, MEME_LAB_BOOST_BY_ID } from "./data/memeLab.js";

export const SAVE_VERSION = 1;

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
    achievements: {},
    lab: {
      activeBoosts: {},
      lastBadIdeaOutcome: null
    },
    towers: Object.fromEntries(TOWERS.map((tower) => [tower.id, createDefaultTowerState()])),
    upgrades: Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, createDefaultUpgradeState()])),
    stats: {
      createdAt: Date.now(),
      lastSaveTime: Date.now(),
      resetCount: 0,
      offlineLikesEarned: 0,
      bestLikesPerSecond: 0,
      bestClickPower: 1
    },
    settings: {
      muted: false
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

  return Math.floor(tower.baseCost * Math.pow(tower.costScale ?? 1.15, amount));
}

export function getUpgradeCost(state, upgradeId) {
  const upgrade = UPGRADE_BY_ID[upgradeId];
  const level = getUpgradeLevel(state, upgradeId);

  if (!upgrade || isUpgradeMaxed(state, upgrade)) {
    return Infinity;
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
      const sourceAmount = getTowerAmount(state, upgrade.effect.sourceTowerId);
      const rawMultiplier = 1 + sourceAmount * upgrade.effect.multiplierPerSource * level;
      return multiplier * Math.min(upgrade.effect.maxMultiplier, rawMultiplier);
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

  return tower.lps * amount * getTowerMultiplier(state, towerId) * getGlobalLpsMultiplier(state);
}

export function getLikesPerSecond(state) {
  const baseLps = TOWERS.reduce((sum, tower) => sum + getTowerEffectiveLps(state, tower.id), 0);
  return baseLps * getLabBoostMultipliers(state).lps;
}

export function getClickPower(state) {
  const basePower = UPGRADES.reduce((power, upgrade) => {
    if (upgrade.type !== "clickPower") {
      return power;
    }

    const level = getUpgradeLevel(state, upgrade.id);
    return power * Math.pow(upgrade.effect.multiplier, level);
  }, 1);

  return basePower * getLabBoostMultipliers(state).click;
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

export function getLabBoostMultipliers(state, now = Date.now()) {
  return getActiveLabBoosts(state, now).reduce(
    (multipliers, boost) => ({
      lps: multipliers.lps * (boost.lpsMultiplier ?? 1),
      click: multipliers.click * (boost.clickMultiplier ?? 1)
    }),
    { lps: 1, click: 1 }
  );
}

export function updateLeaderboardRecords(state) {
  state.stats ??= {};

  const previousBestLps = state.stats.bestLikesPerSecond ?? 0;
  const previousBestClickPower = state.stats.bestClickPower ?? 1;
  const nextBestLps = Math.max(previousBestLps, getLikesPerSecond(state));
  const nextBestClickPower = Math.max(previousBestClickPower, getClickPower(state));

  state.stats.bestLikesPerSecond = nextBestLps;
  state.stats.bestClickPower = nextBestClickPower;

  return nextBestLps !== previousBestLps || nextBestClickPower !== previousBestClickPower;
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

export function isTowerUnlocked(state, tower) {
  if (getTowerAmount(state, tower.id) > 0) {
    return true;
  }

  return isUnlockSatisfied(state, tower.unlockAt);
}

export function isUpgradeUnlocked(state, upgrade) {
  if (getUpgradeLevel(state, upgrade.id) > 0) {
    return true;
  }

  return isUnlockSatisfied(state, upgrade.unlockAt);
}

export function isUnlockSatisfied(state, unlockAt = {}) {
  if ((unlockAt.totalLikesEver ?? 0) > state.totalLikesEver) {
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

export function purchaseTower(state, towerId) {
  const tower = TOWER_BY_ID[towerId];

  if (!tower || !isTowerUnlocked(state, tower)) {
    return { ok: false, reason: "locked" };
  }

  const cost = getTowerCost(state, towerId);

  if (state.likes < cost) {
    return { ok: false, reason: "need-more", missing: cost - state.likes };
  }

  state.likes -= cost;
  state.totalLikesSpent += cost;
  awardTower(state, towerId, 1);
  return { ok: true, cost };
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
  return { ok: true, cost };
}

export function purchaseLabBoost(state, boostId, now = Date.now()) {
  const boost = MEME_LAB_BOOST_BY_ID[boostId];

  if (!boost) {
    return { ok: false, reason: "unknown" };
  }

  pruneExpiredLabBoosts(state, now);

  if (state.lab?.activeBoosts?.[boostId]) {
    return { ok: false, reason: "active" };
  }

  if (state.subscribers < boost.subscriberCost) {
    return { ok: false, reason: "need-more", missing: boost.subscriberCost - state.subscribers };
  }

  state.subscribers -= boost.subscriberCost;
  state.lab ??= {};
  state.lab.activeBoosts ??= {};
  state.lab.activeBoosts[boostId] = {
    expiresAt: now + boost.durationSeconds * 1000
  };

  return { ok: true, cost: boost.subscriberCost, boost };
}

export function pressBadIdeaButton(state, now = Date.now(), rng = Math.random) {
  const cost = BAD_IDEA_BUTTON.subscriberCost;

  if (state.subscribers < cost) {
    return { ok: false, reason: "need-more", missing: cost - state.subscribers };
  }

  state.subscribers -= cost;
  state.lab ??= {};
  state.lab.activeBoosts ??= {};

  const random = normalizeRandomSource(rng);
  const outcome = chooseWeightedOutcome(BAD_IDEA_BUTTON.outcomes, random);
  const result = applyBadIdeaOutcome(state, outcome, random);
  const lastOutcome = {
    id: outcome.id,
    name: outcome.name,
    message: result.message,
    createdAt: now
  };

  state.lab.lastBadIdeaOutcome = lastOutcome;

  return {
    ok: true,
    cost,
    outcome,
    result,
    message: result.message
  };
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

  return changed;
}

export function collectSubscriber(state) {
  state.subscribers += 1;
  state.totalSubscribersEver += 1;
}

export function tickProduction(state, deltaSeconds) {
  const delta = Math.max(0, clampNumber(deltaSeconds));
  state.playTimeSeconds += delta;
  return applyProduction(state, delta);
}

function applyProduction(state, deltaSeconds) {
  const labMultipliers = getLabBoostMultipliers(state);
  const lps = getLikesPerSecond(state);
  const gained = lps * deltaSeconds;

  if (gained <= 0) {
    return 0;
  }

  addLikes(state, gained);

  for (const tower of TOWERS) {
    const produced = getTowerEffectiveLps(state, tower.id) * labMultipliers.lps * deltaSeconds;
    state.towers[tower.id].totalProduced += produced;
  }

  return gained;
}

export function applyOfflineProgress(state, lastSaveTime, now = Date.now()) {
  const savedAt = Number(lastSaveTime);

  if (!Number.isFinite(savedAt) || savedAt <= 0 || now <= savedAt) {
    return { secondsAway: 0, likesEarned: 0 };
  }

  const secondsAway = Math.floor((now - savedAt) / 1000);
  const cappedSeconds = Math.min(secondsAway, 60 * 60 * 24 * 7);
  const capacity = getOfflineProductionCapacity(state);
  const effectiveSeconds = cappedSeconds * capacity;
  const likesEarned = applyProduction(state, effectiveSeconds);

  if (likesEarned > 0) {
    state.stats.offlineLikesEarned = likesEarned;
  }

  return { secondsAway: cappedSeconds, likesEarned, capacity };
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

function clampNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function applyBadIdeaOutcome(state, outcome, random) {
  if (outcome.type === "awardRandomTower") {
    const tower = pickRandomTower(state, outcome.towerPool, random);
    const amount = outcome.amount ?? 1;
    awardTower(state, tower.id, amount);
    return {
      label: `+${amount} ${tower.displayName}`,
      message: `${outcome.name}: +${formatInlineNumber(amount)} ${tower.displayName}.`
    };
  }

  if (outcome.type === "addLikesFromLps") {
    const likes = Math.max(outcome.minimumLikes ?? 0, getLikesPerSecond(state) * (outcome.seconds ?? 0));
    const gained = addLikes(state, likes);
    return {
      label: `+${formatInlineNumber(gained)} Likes`,
      message: `${outcome.name}: +${formatInlineNumber(gained)} Likes.`
    };
  }

  if (outcome.type === "addLikesFromClicks") {
    const likes = getClickPower(state) * (outcome.clicks ?? 0);
    const gained = addLikes(state, likes);
    return {
      label: `+${formatInlineNumber(gained)} Likes`,
      message: `${outcome.name}: +${formatInlineNumber(gained)} Likes.`
    };
  }

  if (outcome.type === "addSubscribers") {
    const amount = Math.max(0, Math.floor(clampNumber(outcome.amount)));
    state.subscribers += amount;
    state.totalSubscribersEver += amount;
    return {
      label: `+${formatInlineNumber(amount)} Subscribers`,
      message: `${outcome.name}: +${formatInlineNumber(amount)} Subscribers.`
    };
  }

  if (outcome.type === "loseLikesFromLps") {
    const amount = Math.min(state.likes, getLikesPerSecond(state) * (outcome.seconds ?? 0));
    state.likes -= amount;
    return {
      label: `-${formatInlineNumber(amount)} Likes`,
      message: amount > 0
        ? `${outcome.name}: -${formatInlineNumber(amount)} Likes.`
        : `${outcome.name}: the invoice found no Likes to collect.`
    };
  }

  if (outcome.type === "loseSubscribers") {
    const amount = Math.min(state.subscribers, Math.max(0, Math.floor(clampNumber(outcome.amount))));
    state.subscribers -= amount;
    return {
      label: `-${formatInlineNumber(amount)} Subscribers`,
      message: amount > 0
        ? `${outcome.name}: -${formatInlineNumber(amount)} Subscribers.`
        : `${outcome.name}: nobody extra was left to disappoint.`
    };
  }

  return {
    label: "No reward",
    message: `${outcome.name}: no reward. The button remains deeply pleased with itself.`
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

function formatInlineNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  if (number >= 1000000) {
    return number.toExponential(2).replace("+", "");
  }

  return Math.round(number).toLocaleString("en-US");
}
