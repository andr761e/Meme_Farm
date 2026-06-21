const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

  const towersModule = await importModule("src/data/towers.js");
  const upgradesModule = await importModule("src/data/upgrades.js");
  const achievementsModule = await importModule("src/data/achievements.js");
  const memeLabModule = await importModule("src/data/memeLab.js");
  const leaderboardsModule = await importModule("src/leaderboards.js");
  const stateModule = await importModule("src/state.js");
  const saveModule = await importModule("src/save.js");

  assertUniqueIds(towersModule.TOWERS, "tower");
  assertUniqueIds(upgradesModule.UPGRADES, "upgrade");
  assertUniqueIds(achievementsModule.ACHIEVEMENTS, "achievement");
  assertUniqueIds(memeLabModule.MEME_LAB_BOOSTS, "meme lab boost");
  assertUniqueIds(memeLabModule.BAD_IDEA_BUTTON.outcomes, "bad idea outcome");
  assertUniqueIds(leaderboardsModule.LEADERBOARD_METRICS, "leaderboard metric");
  assertAssetsExist(towersModule.TOWERS, "tower");
  assertAssetsExist(upgradesModule.UPGRADES, "upgrade");

  const expectedMetrics = [
    "total_likes_ever",
    "highest_lps",
    "total_towers_owned",
    "milestones_unlocked",
    "total_clicks",
    "highest_click_power",
    "subscribers_collected"
  ];
  const metricIds = new Set(leaderboardsModule.LEADERBOARD_METRICS.map((metric) => metric.id));
  for (const metricId of expectedMetrics) {
    if (!metricIds.has(metricId)) {
      throw new Error(`Missing leaderboard metric: ${metricId}`);
    }
  }

  if (metricIds.has("fastest_1m_likes")) {
    throw new Error("Fastest 1M Likes should not be included as a leaderboard metric.");
  }

  if (achievementsModule.ACHIEVEMENTS.length < towersModule.TOWERS.length + 30) {
    throw new Error("Expected a long milestone list with tower achievements and broader goals.");
  }

  const achievementIds = new Set(achievementsModule.ACHIEVEMENTS.map((achievement) => achievement.id));
  const towerAmountThresholds = [10, 25, 50, 100];
  const legacyOverclockUpgrades = upgradesModule.UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock");

  if (legacyOverclockUpgrades.length < 5) {
    throw new Error("Expected several late-game Legacy Overclock upgrades for weaker towers.");
  }

  for (const tower of towersModule.TOWERS) {
    const expectedId = `tower_${tower.id}_first`;
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing first-purchase milestone for tower: ${tower.id}`);
    }

    for (const amount of towerAmountThresholds) {
      const expectedAmountId = `tower_${tower.id}_${amount}`;
      if (!achievementIds.has(expectedAmountId)) {
        throw new Error(`Missing tower amount milestone for ${tower.id} at ${amount}.`);
      }
    }

    const expectedTierFiveId = `upgrade_${tower.id}_double_5`;
    if (!achievementIds.has(expectedTierFiveId)) {
      throw new Error(`Missing level 5 upgrade milestone for tower: ${tower.id}`);
    }

    const expectedCrossfeedId = `upgrade_${tower.id}_crossfeed`;
    if (!achievementIds.has(expectedCrossfeedId)) {
      throw new Error(`Missing crossfeed milestone for tower: ${tower.id}`);
    }
  }

  for (const expectedId of ["tower_swirling_like_button_250", "tower_swirling_like_button_500", "tower_swirling_like_button_1000"]) {
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing iconic Like Button amount milestone: ${expectedId}`);
    }
  }

  for (const upgrade of legacyOverclockUpgrades) {
    const expectedLegacyMilestoneId = `upgrade_${upgrade.id}`;
    if (!achievementIds.has(expectedLegacyMilestoneId)) {
      throw new Error(`Missing Legacy Overclock milestone: ${expectedLegacyMilestoneId}`);
    }
  }

  for (const expectedId of [
    "tower_level_5_first",
    "tower_level_5_10",
    "tower_level_5_all",
    "crossfeed_first",
    "crossfeed_10",
    "crossfeed_all",
    "legacy_overclock_first",
    "legacy_overclock_5",
    "legacy_overclock_all"
  ]) {
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing aggregate upgrade milestone: ${expectedId}`);
    }
  }

  const tierFiveMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "upgrade_swirling_like_button_double_5");
  const crossfeedMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "upgrade_swirling_like_button_crossfeed");
  const towerAmountMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "tower_swirling_like_button_100");
  const legacyOverclockMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "upgrade_shitposter_intern_legacy_overclock");
  const milestoneState = stateModule.createDefaultState();
  milestoneState.towers.swirling_like_button.amount = 100;
  milestoneState.upgrades.swirling_like_button_double_5.level = 1;
  milestoneState.upgrades.swirling_like_button_crossfeed_shitposter_intern.level = 1;
  milestoneState.upgrades.shitposter_intern_legacy_overclock.level = 1;
  if (
    !tierFiveMilestone.isUnlocked(milestoneState) ||
    !crossfeedMilestone.isUnlocked(milestoneState) ||
    !towerAmountMilestone.isUnlocked(milestoneState) ||
    !legacyOverclockMilestone.isUnlocked(milestoneState)
  ) {
    throw new Error("Expected upgrade milestones to unlock from their matching upgrade purchases.");
  }

  const firstFive = towersModule.TOWERS.slice(0, 5);
  if (firstFive.some((tower) => tower.unlockAt?.totalLikesEver !== 0)) {
    throw new Error("The first five towers should be visible at the start.");
  }

  if (towersModule.TOWERS[0].baseCost < 50 || towersModule.TOWERS[0].costScale < 1.2) {
    throw new Error("Expected tower starting costs and cost scaling to be much steeper than the original economy.");
  }

  if (upgradesModule.UPGRADES[0].id !== "power_click" || upgradesModule.UPGRADES[1].id !== "offline_capacity") {
    throw new Error("Click Boost and Offline Production Capacity should always be the first upgrades.");
  }

  if (upgradesModule.UPGRADES[0].unlockAt?.totalLikesEver || upgradesModule.UPGRADES[1].unlockAt?.totalLikesEver) {
    throw new Error("Core repeatable upgrades should be visible from the start.");
  }

  const towerUpgradeCounts = new Map();
  const towerSynergyCounts = new Map();
  const legacyOverclockCounts = new Map();
  for (const upgrade of upgradesModule.UPGRADES) {
    if (upgrade.category === "standardTowerDouble") {
      if (upgrade.type !== "towerMultiplier") {
        throw new Error(`Expected standard tower double to be a tower multiplier: ${upgrade.id}`);
      }

      towerUpgradeCounts.set(upgrade.effect.towerId, (towerUpgradeCounts.get(upgrade.effect.towerId) ?? 0) + 1);
      if (upgrade.maxLevel !== 1 || !upgrade.unlockAt?.towerId || !upgrade.unlockAt?.totalLikesEver) {
        throw new Error("Tower LPS upgrades should be one-time purchases gated by tower ownership and total likes.");
      }

      const tierMatch = upgrade.id.match(/_double_(\d+)$/);
      const tier = tierMatch ? Number(tierMatch[1]) : 0;
      if (tier > 1 && upgrade.unlockAt.upgradeId !== `${upgrade.effect.towerId}_double_${tier - 1}`) {
        throw new Error(`Expected tier ${tier} upgrade to require the previous tier: ${upgrade.id}`);
      }
    }

    if (upgrade.category === "legacyOverclock") {
      legacyOverclockCounts.set(upgrade.effect.towerId, (legacyOverclockCounts.get(upgrade.effect.towerId) ?? 0) + 1);
      if (
        upgrade.type !== "towerMultiplier" ||
        upgrade.maxLevel !== 1 ||
        upgrade.effect.multiplier !== 1000 ||
        upgrade.unlockAt?.upgradeId !== `${upgrade.effect.towerId}_double_5` ||
        (upgrade.unlockAt?.amount ?? 0) < 25
      ) {
        throw new Error(`Legacy Overclock should be a one-time x1000 late-game tower revival: ${upgrade.id}`);
      }
    }

    if (upgrade.type === "towerAmountSynergy") {
      towerSynergyCounts.set(upgrade.effect.towerId, (towerSynergyCounts.get(upgrade.effect.towerId) ?? 0) + 1);
      if (upgrade.maxLevel !== 1 || !upgrade.effect.sourceTowerId || !upgrade.effect.multiplierPerSource) {
        throw new Error("Tower synergy upgrades should be one-time cross-tower multipliers.");
      }
    }
  }

  for (const tower of towersModule.TOWERS) {
    if (towerUpgradeCounts.get(tower.id) !== 5) {
      throw new Error(`Expected five one-time double LPS upgrades for tower: ${tower.id}`);
    }

    if (towerSynergyCounts.get(tower.id) !== 1) {
      throw new Error(`Expected one crossfeed synergy upgrade for tower: ${tower.id}`);
    }
  }

  for (const tower of towersModule.TOWERS.slice(0, 10)) {
    if (legacyOverclockCounts.get(tower.id) !== 1) {
      throw new Error(`Expected one late-game Legacy Overclock for early tower: ${tower.id}`);
    }
  }

  const state = stateModule.createDefaultState();
  stateModule.addLikes(state, stateModule.getTowerCost(state, "swirling_like_button"));
  const purchase = stateModule.purchaseTower(state, "swirling_like_button");
  if (!purchase.ok) {
    throw new Error("Expected the first tower to be purchasable after saving enough likes.");
  }

  if (stateModule.getLikesPerSecond(state) <= 0) {
    throw new Error("Expected tower purchase to increase LPS.");
  }

  const firstDoubleUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_double_1");
  const secondDoubleUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_double_2");
  const gatedUpgradeState = stateModule.createDefaultState();
  gatedUpgradeState.towers.swirling_like_button.amount = 1;
  gatedUpgradeState.totalLikesEver = secondDoubleUpgrade.unlockAt.totalLikesEver;
  if (stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to stay locked until tier 1 is bought.");
  }

  gatedUpgradeState.upgrades.swirling_like_button_double_1.level = 1;
  if (!stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || !stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to unlock after tier 1 is bought.");
  }

  const doubleState = stateModule.createDefaultState();
  doubleState.towers.swirling_like_button.amount = 1;
  doubleState.totalLikesEver = firstDoubleUpgrade.unlockAt.totalLikesEver;
  doubleState.likes = stateModule.getUpgradeCost(doubleState, firstDoubleUpgrade.id);
  const baseSwirlLps = stateModule.getTowerEffectiveLps(doubleState, "swirling_like_button");
  const doublePurchase = stateModule.purchaseUpgrade(doubleState, firstDoubleUpgrade.id);
  if (!doublePurchase.ok || stateModule.getTowerEffectiveLps(doubleState, "swirling_like_button") !== baseSwirlLps * 2) {
    throw new Error("Expected one-time tower double upgrade to double that tower's LPS.");
  }

  if (stateModule.shouldShowUpgradeInShop(doubleState, firstDoubleUpgrade)) {
    throw new Error("Expected bought one-time upgrades to disappear from the upgrade shop.");
  }

  doubleState.upgrades.offline_capacity.level = 10;
  if (!stateModule.shouldShowUpgradeInShop(doubleState, upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "offline_capacity"))) {
    throw new Error("Expected Offline Production Capacity to remain visible even when maxed.");
  }

  const firstSynergyUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_crossfeed_shitposter_intern");
  const synergyState = stateModule.createDefaultState();
  synergyState.towers.swirling_like_button.amount = 1;
  synergyState.towers.shitposter_intern.amount = 20;
  synergyState.totalLikesEver = firstSynergyUpgrade.unlockAt.totalLikesEver;
  synergyState.likes = stateModule.getUpgradeCost(synergyState, firstSynergyUpgrade.id);
  const baseSynergyLps = stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button");
  const synergyPurchase = stateModule.purchaseUpgrade(synergyState, firstSynergyUpgrade.id);
  const expectedSynergyMultiplier = 1 + synergyState.towers.shitposter_intern.amount * firstSynergyUpgrade.effect.multiplierPerSource;
  if (!synergyPurchase.ok || stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button") !== baseSynergyLps * expectedSynergyMultiplier) {
    throw new Error("Expected crossfeed upgrade to scale one tower from another tower's owned amount.");
  }

  const legacyUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "shitposter_intern_legacy_overclock");
  const legacyState = stateModule.createDefaultState();
  legacyState.towers.shitposter_intern.amount = 25;
  legacyState.upgrades.shitposter_intern_double_5.level = 1;
  legacyState.totalLikesEver = legacyUpgrade.unlockAt.totalLikesEver;
  legacyState.likes = stateModule.getUpgradeCost(legacyState, legacyUpgrade.id);
  const baseLegacyLps = stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern");
  const legacyPurchase = stateModule.purchaseUpgrade(legacyState, legacyUpgrade.id);
  if (!legacyPurchase.ok || stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern") !== baseLegacyLps * 1000) {
    throw new Error("Expected Legacy Overclock to multiply a weaker tower's LPS by x1000.");
  }

  if (!stateModule.updateLeaderboardRecords(state)) {
    throw new Error("Expected leaderboard records to update after tower purchase.");
  }

  if (stateModule.getOfflineProductionCapacity(state) !== 0) {
    throw new Error("Expected default offline production capacity to start at 0%.");
  }

  const offlineNone = stateModule.applyOfflineProgress(state, 1000, 101000);
  if (offlineNone.likesEarned !== 0) {
    throw new Error("Expected no offline production before buying offline capacity upgrades.");
  }

  state.upgrades.offline_capacity.level = 10;
  if (stateModule.getOfflineProductionCapacity(state) !== 0.5) {
    throw new Error("Expected max offline production capacity to be 50%.");
  }

  const offlineUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "offline_capacity");
  if (!offlineUpgrade || offlineUpgrade.effect.capacityPerLevel !== 0.05 || offlineUpgrade.effect.maxCapacity !== 0.5) {
    throw new Error("Offline capacity upgrade should add 5% per level and cap at 50%.");
  }

  const offlineHalf = stateModule.applyOfflineProgress(state, 101000, 201000);
  if (offlineHalf.likesEarned <= 0 || offlineHalf.likesEarned > stateModule.getLikesPerSecond(state) * 100 * 0.5) {
    throw new Error("Expected offline production to be scaled by offline capacity.");
  }

  const labState = stateModule.createDefaultState();
  labState.subscribers = 10;
  labState.upgrades.power_click.level = 1;
  const baseClickPower = stateModule.getClickPower(labState);
  const labStart = Date.now();
  const labPurchase = stateModule.purchaseLabBoost(labState, "ten_x_heatwave", labStart);
  if (!labPurchase.ok || labState.subscribers !== 0) {
    throw new Error("Expected Algorithm Bribe boost to spend subscribers.");
  }

  if (stateModule.getClickPower(labState) !== baseClickPower * 10) {
    throw new Error("Expected active Algorithm Bribe boost to multiply click power.");
  }

  const serializedLab = saveModule.serializeState(labState);
  if (!serializedLab.lab?.activeBoosts?.ten_x_heatwave) {
    throw new Error("Expected active Meme Lab boosts to be saved.");
  }

  if (!stateModule.pruneExpiredLabBoosts(labState, labStart + 47000) || stateModule.getActiveLabBoosts(labState, labStart + 47000).length !== 0) {
    throw new Error("Expected expired Meme Lab boosts to be pruned.");
  }

  if (memeLabModule.BAD_IDEA_BUTTON.outcomes.some((outcome) => /tower.*lps|lps.*tower|towerMultiplier/i.test(outcome.type))) {
    throw new Error("Bad Idea Button should not include tower LPS doubling outcomes.");
  }

  const badIdeaState = stateModule.createDefaultState();
  badIdeaState.subscribers = 20;
  const badIdeaResult = stateModule.pressBadIdeaButton(badIdeaState, Date.now(), () => 0);
  if (!badIdeaResult.ok || badIdeaState.subscribers !== 8) {
    throw new Error("Expected Bad Idea Button to spend subscribers.");
  }

  if (badIdeaState.towers.swirling_like_button.amount !== 5) {
    throw new Error("Expected deterministic Bad Idea Button outcome to award 5 random unlocked towers.");
  }

  const serializedBadIdea = saveModule.serializeState(badIdeaState);
  if (serializedBadIdea.lab?.lastBadIdeaOutcome?.id !== "random_tower_shipment") {
    throw new Error("Expected Bad Idea Button last outcome to be saved.");
  }

  const leaderboardRows = leaderboardsModule.getLeaderboardRows(state, {
    scope: "friends",
    metricId: "total_likes_ever"
  });
  if (!leaderboardRows.some((row) => row.isPlayer)) {
    throw new Error("Expected leaderboard rows to include the local player.");
  }

  const migrated = saveModule.mergeSaveData({
    totalLikes: 1234,
    totalSubscribers: 4,
    playerTowers: {
      tikTok_zoomer: { amount: 2, totalProduced: 99 }
    },
    playerUpgrades: {
      power_click: { currentLevel: 2 }
    }
  });

  if (migrated.likes !== 1234 || migrated.subscribers !== 4) {
    throw new Error("Legacy scalar save migration failed.");
  }

  if (migrated.towers.tiktok_zoomer.amount !== 2) {
    throw new Error("Legacy tower key migration failed.");
  }

  if (migrated.upgrades.power_click.level !== 2) {
    throw new Error("Legacy upgrade migration failed.");
  }

  const uncapped = stateModule.createDefaultState();
  uncapped.totalLikesEver = 1000;
  uncapped.likes = 1e12;
  uncapped.upgrades.power_click.level = 12;
  const uncappedPurchase = stateModule.purchaseUpgrade(uncapped, "power_click");

  if (!uncappedPurchase.ok || uncapped.upgrades.power_click.level !== 13) {
    throw new Error("Expected Click Boost to remain purchasable past level 12.");
  }

  console.log("Meme Farm smoke check passed.");
}

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function assertUniqueIds(items, label) {
  const seen = new Set();

  for (const item of items) {
    if (!item.id) {
      throw new Error(`Missing ${label} id.`);
    }

    if (seen.has(item.id)) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }

    seen.add(item.id);
  }
}

function assertAssetsExist(items, label) {
  for (const item of items) {
    if (!item.image) {
      throw new Error(`Missing image for ${label}: ${item.id}`);
    }

    const filePath = path.resolve(root, "src", item.image);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing image asset for ${label} ${item.id}: ${item.image}`);
    }
  }
}
