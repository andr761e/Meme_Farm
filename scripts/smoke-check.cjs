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
  const formatModule = await importModule("src/utils/format.js");

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

  if (leaderboardsModule.LEADERBOARD_METRICS.some((metric) => !/^MF_[A-Z0-9_]+$/.test(metric.steamName ?? ""))) {
    throw new Error("Every leaderboard metric should define a Steam-ready leaderboard name.");
  }

  if (
    formatModule.formatNumber(1123456) !== "1.1M" ||
    formatModule.formatNumber(1e18) !== "1Qi" ||
    formatModule.formatNumber(1e66) !== "1UVg" ||
    formatModule.formatNumber(2.718e78) !== "2.7QiVg" ||
    formatModule.formatNumber(1e306) !== "1UCe" ||
    formatModule.formatLongScaleNumber(1123456) !== "1.123 Million" ||
    formatModule.formatLongScaleNumber(1e18) !== "1 Quintillion" ||
    formatModule.formatLongScaleNumber(1e78) !== "1 Quinvigintillion" ||
    formatModule.formatFullNumber(1123456) !== "1,123,456"
  ) {
    throw new Error("Expected compact shop numbers and long main-counter number scales to format correctly.");
  }

  if (achievementsModule.ACHIEVEMENTS.length < towersModule.TOWERS.length + 30) {
    throw new Error("Expected a long milestone list with tower achievements and broader goals.");
  }

  const achievementIds = new Set(achievementsModule.ACHIEVEMENTS.map((achievement) => achievement.id));
  const towerAmountThresholds = [10, 25, 50, 100];
  const legacyOverclockUpgrades = upgradesModule.UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock");
  const subscriberSpawnUpgrades = upgradesModule.UPGRADES
    .filter((upgrade) => upgrade.category === "subscriberSpawn")
    .sort((first, second) => Number(first.id.match(/_(\d+)$/)?.[1] ?? 0) - Number(second.id.match(/_(\d+)$/)?.[1] ?? 0));

  if (legacyOverclockUpgrades.length < 5) {
    throw new Error("Expected several late-game Legacy Overclock upgrades for weaker towers.");
  }

  if (!achievementIds.has("subscriber_spawn_all_5")) {
    throw new Error("Missing all-tiers Subscriber Spawn upgrade milestone.");
  }

  for (const expectedId of ["click_boost_5", "click_boost_10", "click_boost_25", "click_boost_50", "click_boost_75", "click_boost_100", "click_boost_150"]) {
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing Click Boost level milestone: ${expectedId}`);
    }
  }

  for (const boost of memeLabModule.MEME_LAB_BOOSTS) {
    const expectedBoostMilestoneId = `meme_lab_boost_${boost.id}`;
    if (!achievementIds.has(expectedBoostMilestoneId)) {
      throw new Error(`Missing Algorithm Bribe milestone: ${expectedBoostMilestoneId}`);
    }
  }

  for (const outcome of memeLabModule.BAD_IDEA_BUTTON.outcomes.filter((item) => item.type !== "nothing")) {
    const expectedOutcomeMilestoneId = `bad_idea_outcome_${outcome.id}`;
    if (!achievementIds.has(expectedOutcomeMilestoneId)) {
      throw new Error(`Missing Bad Idea outcome milestone: ${expectedOutcomeMilestoneId}`);
    }
  }

  for (const expectedId of [
    "meme_lab_first_bribe",
    "meme_lab_10_bribes",
    "meme_lab_50_bribes",
    "meme_lab_all_bribes",
    "bad_idea_first_press",
    "bad_idea_10_presses",
    "bad_idea_50_presses",
    "bad_idea_every_outcome",
    "meme_lab_250_subscribers_spent",
    "meme_lab_1000_subscribers_spent"
  ]) {
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing Meme Lab aggregate milestone: ${expectedId}`);
    }
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
  const clickBoostMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "click_boost_100");
  const labBoostMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "meme_lab_boost_ten_x_heatwave");
  const badIdeaMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "bad_idea_first_press");
  const subscriberSpawnMilestone = achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "subscriber_spawn_all_5");
  const milestoneState = stateModule.createDefaultState();
  milestoneState.towers.swirling_like_button.amount = 100;
  milestoneState.upgrades.swirling_like_button_double_5.level = 1;
  milestoneState.upgrades.swirling_like_button_crossfeed_shitposter_intern.level = 1;
  milestoneState.upgrades.shitposter_intern_legacy_overclock.level = 1;
  milestoneState.upgrades.power_click.level = 100;
  for (const upgrade of subscriberSpawnUpgrades) {
    milestoneState.upgrades[upgrade.id].level = 1;
  }
  milestoneState.lab.totalBoostsPurchased = 1;
  milestoneState.lab.boostPurchaseCounts.ten_x_heatwave = 1;
  milestoneState.lab.badIdeaPresses = 1;
  if (
    !tierFiveMilestone.isUnlocked(milestoneState) ||
    !crossfeedMilestone.isUnlocked(milestoneState) ||
    !towerAmountMilestone.isUnlocked(milestoneState) ||
    !legacyOverclockMilestone.isUnlocked(milestoneState) ||
    !clickBoostMilestone.isUnlocked(milestoneState) ||
    !labBoostMilestone.isUnlocked(milestoneState) ||
    !badIdeaMilestone.isUnlocked(milestoneState) ||
    !subscriberSpawnMilestone.isUnlocked(milestoneState)
  ) {
    throw new Error("Expected upgrade milestones to unlock from their matching upgrade purchases.");
  }

  const firstFive = towersModule.TOWERS.slice(0, 5);
  if (firstFive.some((tower) => tower.unlockAt?.totalLikesEver !== 0)) {
    throw new Error("The first five towers should be visible at the start.");
  }

  if (
    towersModule.TOWERS[0].baseCost !== 10 ||
    towersModule.TOWERS[1].baseCost !== 100 ||
    towersModule.TOWERS.some((tower) => tower.costScale !== towersModule.TOWER_COST_SCALE)
  ) {
    throw new Error("Expected tower starting costs to match data and all towers to use the shared cost scale.");
  }

  if (upgradesModule.UPGRADES[0].id !== "power_click" || upgradesModule.UPGRADES[1].id !== "offline_capacity") {
    throw new Error("Click Boost and 48 Hour Offline Production Capacity should always be the first upgrades.");
  }

  if (upgradesModule.UPGRADES[0].costScale !== 2.55) {
    throw new Error("Click Boost price scaling should stay at the intended 2.55x repeat-purchase curve.");
  }

  const expectedOfflineTierCosts = [
    50000,
    250000,
    1250000,
    6000000,
    30000000,
    150000000,
    750000000,
    4000000000,
    20000000000,
    100000000000
  ];

  if (
    upgradesModule.UPGRADES[1].baseCost !== expectedOfflineTierCosts[0] ||
    JSON.stringify(upgradesModule.UPGRADES[1].tierCosts) !== JSON.stringify(expectedOfflineTierCosts)
  ) {
    throw new Error("48 Hour Offline Production Capacity should use the recommended hardcoded tier costs.");
  }

  if (subscriberSpawnUpgrades.length !== 5) {
    throw new Error("Expected exactly five one-time Subscriber Spawn upgrade tiers.");
  }

  const expectedSubscriberSpawnCosts = [
    250000,
    10000000,
    500000000,
    25000000000,
    1500000000000
  ];

  for (let index = 0; index < subscriberSpawnUpgrades.length; index += 1) {
    const upgrade = subscriberSpawnUpgrades[index];
    const tier = index + 1;

    if (
      upgrade.id !== `subscriber_spawn_${tier}` ||
      upgrade.type !== "subscriberBonus" ||
      upgrade.maxLevel !== 1 ||
      upgrade.costScale !== 1 ||
      upgrade.baseCost !== expectedSubscriberSpawnCosts[index] ||
      !upgrade.effect.spawnMultiplier ||
      !upgrade.unlockAt?.totalLikesEver
    ) {
      throw new Error(`Subscriber Spawn tier ${tier} should be a one-time subscriberBonus upgrade.`);
    }

    if (tier > 1 && upgrade.unlockAt.upgradeId !== `subscriber_spawn_${tier - 1}`) {
      throw new Error(`Subscriber Spawn tier ${tier} should require the previous tier.`);
    }

  }

  if (upgradesModule.UPGRADES[0].unlockAt?.totalLikesEver || upgradesModule.UPGRADES[1].unlockAt?.totalLikesEver) {
    throw new Error("Core repeatable upgrades should be visible from the start.");
  }

  const towerUpgradeCounts = new Map();
  const towerSynergyCounts = new Map();
  const legacyOverclockCounts = new Map();
  const expectedLegacyMultipliers = new Map([
    ["swirling_like_button", 1000],
    ["shitposter_intern", 720],
    ["outdated_meme_reposter", 510],
    ["edgy_teen", 370],
    ["botnet", 265],
    ["doomscroller", 190],
    ["meme_subreddit", 135],
    ["discord_mod", 100],
    ["tiktok_zoomer", 70],
    ["meme_lord", 50]
  ]);
  const expectedLegacyCostRatios = new Map([
    ["swirling_like_button", 0.67],
    ["shitposter_intern", 0.77],
    ["outdated_meme_reposter", 0.88],
    ["edgy_teen", 1.02],
    ["botnet", 1.17],
    ["doomscroller", 1.35],
    ["meme_subreddit", 1.55],
    ["discord_mod", 1.78],
    ["tiktok_zoomer", 2.05],
    ["meme_lord", 2.36]
  ]);
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
      const tierFiveUpgrade = upgradesModule.UPGRADES.find((item) => item.id === `${upgrade.effect.towerId}_double_5`);
      const expectedBaseCost = Math.ceil(tierFiveUpgrade.baseCost * expectedLegacyCostRatios.get(upgrade.effect.towerId));
      if (
        upgrade.type !== "towerMultiplier" ||
        upgrade.maxLevel !== 1 ||
        upgrade.effect.multiplier !== expectedLegacyMultipliers.get(upgrade.effect.towerId) ||
        upgrade.baseCost !== expectedBaseCost ||
        upgrade.unlockAt?.totalLikesEver !== expectedBaseCost ||
        upgrade.unlockAt?.upgradeId !== `${upgrade.effect.towerId}_double_5` ||
        (upgrade.unlockAt?.amount ?? 0) < 25
      ) {
        throw new Error(`Legacy Overclock should use the recommended multiplier and Tier 5 cost ratio: ${upgrade.id}`);
      }
    }

    if (upgrade.type === "towerAmountSynergy") {
      towerSynergyCounts.set(upgrade.effect.towerId, (towerSynergyCounts.get(upgrade.effect.towerId) ?? 0) + 1);
      const towerIndex = towersModule.TOWERS.findIndex((item) => item.id === upgrade.effect.towerId);
      const tower = towersModule.TOWERS[towerIndex];
      const progress = towersModule.TOWERS.length > 1 ? towerIndex / (towersModule.TOWERS.length - 1) : 0;
      const expectedCostMultiplier = 5000 * Math.pow(1000 / 5000, progress);
      const expectedBaseCost = Math.ceil(tower.baseCost * expectedCostMultiplier);
      const expectedUnlock = Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, expectedBaseCost * 2));
      const targetRequirement = upgrade.unlockAt?.towerRequirements?.find((requirement) => requirement.towerId === upgrade.effect.towerId);
      const sourceRequirement = upgrade.unlockAt?.towerRequirements?.find((requirement) => requirement.towerId === upgrade.effect.sourceTowerId);
      if (
        upgrade.maxLevel !== 1 ||
        !upgrade.effect.sourceTowerId ||
        !upgrade.effect.multiplierPerSource ||
        upgrade.effect.maxMultiplier !== 10 ||
        upgrade.baseCost !== expectedBaseCost ||
        upgrade.unlockAt?.amount !== 10 ||
        upgrade.unlockAt?.totalLikesEver !== expectedUnlock ||
        targetRequirement?.amount !== 10 ||
        sourceRequirement?.amount !== 40
      ) {
        throw new Error("Tower synergy upgrades should use geometric cost scaling and target/source tower visibility gates.");
      }
    }
  }

  const expectedStandardTowerMultipliers = [
    [25, 500, 12000, 350000, 12000000],
    [24.7, 477, 11113, 313876, 10430000],
    [24.4, 455, 10291, 281480, 9060000],
    [24, 434, 9530, 252428, 7870000],
    [23.7, 414, 8826, 226374, 6840000],
    [23.4, 395, 8173, 203010, 5940000],
    [23.1, 377, 7569, 182057, 5160000],
    [22.8, 360, 7009, 163266, 4490000],
    [22.5, 343, 6491, 146415, 3900000],
    [22.2, 328, 6011, 131303, 3390000],
    [21.9, 313, 5567, 117751, 2940000],
    [21.6, 298, 5155, 105598, 2560000],
    [21.4, 285, 4774, 94699, 2220000],
    [21.1, 271, 4421, 84925, 1930000],
    [20.8, 259, 4094, 76160, 1680000],
    [20.5, 247, 3791, 68299, 1460000],
    [20.3, 236, 3511, 61250, 1270000],
    [20, 225, 3251, 54928, 1100000],
    [19.7, 215, 3011, 49259, 956362],
    [19.5, 205, 2788, 44175, 830981],
    [19.2, 195, 2582, 39615, 722038],
    [19, 186, 2391, 35527, 627378],
    [18.7, 178, 2214, 31860, 545127],
    [18.5, 170, 2051, 28572, 473660],
    [18.3, 162, 1899, 25623, 411563],
    [18, 155, 1759, 22978, 357606],
    [17.8, 147, 1629, 20606, 310723],
    [17.6, 141, 1508, 18480, 269987],
    [17.3, 134, 1397, 16572, 234591],
    [17.1, 128, 1293, 14862, 203836],
    [16.9, 122, 1198, 13328, 177113],
    [16.7, 117, 1109, 11952, 153893],
    [16.4, 111, 1027, 10719, 133717],
    [16.2, 106, 951, 9612, 116187],
    [16, 101, 881, 8620, 100954],
    [15.8, 96.5, 816, 7731, 87719],
    [15.6, 92.1, 756, 6933, 76219],
    [15.4, 87.9, 700, 6217, 66227],
    [15.2, 83.8, 648, 5575, 57544],
    [15, 80, 600, 5000, 50000]
  ];
  const expectedStandardTowerUnlocks = [
    { amount: 10, costRatio: 0.75 },
    { amount: 20, costRatio: 1 },
    { amount: 30, costRatio: 1.5 },
    { amount: 40, costRatio: 2.5 },
    { amount: 50, costRatio: 4 }
  ];

  for (const [towerIndex, tower] of towersModule.TOWERS.entries()) {
    if (towerUpgradeCounts.get(tower.id) !== 5) {
      throw new Error(`Expected five one-time double LPS upgrades for tower: ${tower.id}`);
    }

    const towerDoubleUpgrades = upgradesModule.UPGRADES
      .filter((upgrade) => upgrade.category === "standardTowerDouble" && upgrade.effect.towerId === tower.id)
      .sort((first, second) => Number(first.id.match(/_double_(\d+)$/)?.[1] ?? 0) - Number(second.id.match(/_double_(\d+)$/)?.[1] ?? 0));
    const expectedMultipliers = expectedStandardTowerMultipliers[towerIndex];

    for (const [tierIndex, expectedMultiplier] of expectedMultipliers.entries()) {
      const upgrade = towerDoubleUpgrades[tierIndex];
      const expectedUnlockRequirement = expectedStandardTowerUnlocks[tierIndex];
      const expectedBaseCost = Math.ceil(tower.baseCost * expectedMultiplier);
      const expectedUnlock = Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, expectedBaseCost * expectedUnlockRequirement.costRatio));

      if (
        upgrade.baseCost !== expectedBaseCost ||
        upgrade.unlockAt.amount !== expectedUnlockRequirement.amount ||
        upgrade.unlockAt.totalLikesEver !== expectedUnlock
      ) {
        throw new Error(`Expected recommended standard upgrade economy for ${tower.id} tier ${tierIndex + 1}.`);
      }
    }

    if (towerDoubleUpgrades[0].baseCost < tower.baseCost * 10) {
      throw new Error(`Expected first double upgrade to cost much more than its tower: ${tower.id}`);
    }
    for (let index = 1; index < towerDoubleUpgrades.length; index += 1) {
      if (towerDoubleUpgrades[index].baseCost <= towerDoubleUpgrades[index - 1].baseCost) {
        throw new Error(`Expected tower double upgrade costs to increase by tier: ${tower.id}`);
      }
    }

    if (towerSynergyCounts.get(tower.id) !== 1) {
      throw new Error(`Expected one crossfeed synergy upgrade for tower: ${tower.id}`);
    }
  }

  const firstTowerTierFive = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === `${towersModule.TOWERS[0].id}_double_5`);
  const lastTower = towersModule.TOWERS[towersModule.TOWERS.length - 1];
  const lastTowerTierFive = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === `${lastTower.id}_double_5`);
  if (
    !firstTowerTierFive ||
    !lastTowerTierFive ||
    lastTowerTierFive.baseCost / lastTower.baseCost >= firstTowerTierFive.baseCost / towersModule.TOWERS[0].baseCost
  ) {
    throw new Error("Expected late tower double upgrades to use lower relative multipliers than starter tower upgrades.");
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

  const subscriberSpawnState = stateModule.createDefaultState();
  const baseSubscriberSpawnMultiplier = stateModule.getSubscriberSpawnMultiplier(subscriberSpawnState);
  let expectedSubscriberSpawnMultiplier = baseSubscriberSpawnMultiplier;
  for (const upgrade of subscriberSpawnUpgrades) {
    subscriberSpawnState.upgrades[upgrade.id].level = 1;
    expectedSubscriberSpawnMultiplier *= upgrade.effect.spawnMultiplier;
  }
  if (stateModule.getSubscriberSpawnMultiplier(subscriberSpawnState) !== expectedSubscriberSpawnMultiplier) {
    throw new Error("Expected Subscriber Spawn upgrades to multiply subscriber spawn frequency.");
  }

  const subscriberCollectState = stateModule.createDefaultState();
  if (
    stateModule.collectSubscriber(subscriberCollectState, 3) !== 3 ||
    subscriberCollectState.subscribers !== 3 ||
    subscriberCollectState.totalSubscribersEver !== 3
  ) {
    throw new Error("Expected subscriber collection to support raid-sized subscriber rewards.");
  }

  const firstDoubleUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_double_1");
  const secondDoubleUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_double_2");
  const gatedUpgradeState = stateModule.createDefaultState();
  gatedUpgradeState.towers.swirling_like_button.amount = secondDoubleUpgrade.unlockAt.amount;
  gatedUpgradeState.totalLikesEver = secondDoubleUpgrade.unlockAt.totalLikesEver;
  if (stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to stay locked until tier 1 is bought.");
  }

  gatedUpgradeState.upgrades.swirling_like_button_double_1.level = 1;
  if (!stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || !stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to unlock after tier 1 is bought.");
  }

  const amountGatedState = stateModule.createDefaultState();
  amountGatedState.towers.swirling_like_button.amount = secondDoubleUpgrade.unlockAt.amount - 1;
  amountGatedState.totalLikesEver = secondDoubleUpgrade.unlockAt.totalLikesEver;
  amountGatedState.upgrades.swirling_like_button_double_1.level = 1;
  if (stateModule.isUpgradeUnlocked(amountGatedState, secondDoubleUpgrade) || stateModule.shouldShowUpgradeInShop(amountGatedState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to require the tier-specific tower amount.");
  }

  const doubleState = stateModule.createDefaultState();
  doubleState.towers.swirling_like_button.amount = firstDoubleUpgrade.unlockAt.amount;
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
    throw new Error("Expected 48 Hour Offline Production Capacity to remain visible even when maxed.");
  }

  const firstSynergyUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "swirling_like_button_crossfeed_shitposter_intern");
  const synergyState = stateModule.createDefaultState();
  synergyState.towers.swirling_like_button.amount = 10;
  synergyState.towers.shitposter_intern.amount = 1000;
  synergyState.totalLikesEver = firstSynergyUpgrade.unlockAt.totalLikesEver;
  synergyState.likes = stateModule.getUpgradeCost(synergyState, firstSynergyUpgrade.id);
  const baseSynergyLps = stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button");
  const synergyPurchase = stateModule.purchaseUpgrade(synergyState, firstSynergyUpgrade.id);
  const expectedSynergyMultiplier = firstSynergyUpgrade.effect.maxMultiplier;
  if (!synergyPurchase.ok || stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button") !== baseSynergyLps * expectedSynergyMultiplier) {
    throw new Error("Expected crossfeed upgrade to scale one tower from another tower's owned amount, capped at x10.");
  }

  const sourceGatedSynergyState = stateModule.createDefaultState();
  sourceGatedSynergyState.towers.swirling_like_button.amount = 10;
  sourceGatedSynergyState.towers.shitposter_intern.amount = 39;
  sourceGatedSynergyState.totalLikesEver = firstSynergyUpgrade.unlockAt.totalLikesEver;
  sourceGatedSynergyState.likes = stateModule.getUpgradeCost(sourceGatedSynergyState, firstSynergyUpgrade.id);
  if (stateModule.isUpgradeUnlocked(sourceGatedSynergyState, firstSynergyUpgrade) || stateModule.shouldShowUpgradeInShop(sourceGatedSynergyState, firstSynergyUpgrade)) {
    throw new Error("Expected crossfeed upgrade to require 40 owned source towers before becoming visible.");
  }

  const legacyUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "shitposter_intern_legacy_overclock");
  const legacyState = stateModule.createDefaultState();
  legacyState.towers.shitposter_intern.amount = 25;
  legacyState.upgrades.shitposter_intern_double_5.level = 1;
  legacyState.totalLikesEver = legacyUpgrade.unlockAt.totalLikesEver;
  legacyState.likes = stateModule.getUpgradeCost(legacyState, legacyUpgrade.id);
  const baseLegacyLps = stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern");
  const legacyPurchase = stateModule.purchaseUpgrade(legacyState, legacyUpgrade.id);
  if (
    !legacyPurchase.ok ||
    legacyPurchase.upgrade?.id !== legacyUpgrade.id ||
    legacyPurchase.upgrade?.category !== "legacyOverclock" ||
    stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern") !== baseLegacyLps * 720
  ) {
    throw new Error("Expected Legacy Overclock to multiply a weaker tower's LPS by its recommended multiplier.");
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
  const offlineCostState = stateModule.createDefaultState();
  for (let level = 0; level < expectedOfflineTierCosts.length; level += 1) {
    offlineCostState.upgrades.offline_capacity.level = level;
    if (stateModule.getUpgradeCost(offlineCostState, "offline_capacity") !== expectedOfflineTierCosts[level]) {
      throw new Error(`Expected Offline Production Capacity tier ${level + 1} to use the hardcoded cost.`);
    }
  }

  if (
    !offlineUpgrade ||
    offlineUpgrade.displayName !== "48 Hour Offline Production Capacity" ||
    offlineUpgrade.effect.capacityPerLevel !== 0.05 ||
    offlineUpgrade.effect.maxCapacity !== 0.5 ||
    offlineUpgrade.effect.maxOfflineSeconds !== 60 * 60 * 48
  ) {
    throw new Error("48 Hour Offline Production Capacity should add 5% per level, cap at 50%, and stop after 48 hours.");
  }

  const offlineHalf = stateModule.applyOfflineProgress(state, 101000, 201000);
  if (offlineHalf.likesEarned <= 0 || offlineHalf.likesEarned > stateModule.getLikesPerSecond(state) * 100 * 0.5) {
    throw new Error("Expected offline production to be scaled by offline capacity.");
  }

  const cappedOfflineState = stateModule.createDefaultState();
  cappedOfflineState.towers.swirling_like_button.amount = 1;
  cappedOfflineState.upgrades.offline_capacity.level = 10;
  const seventyTwoHours = 60 * 60 * 72;
  const fortyEightHours = 60 * 60 * 48;
  const cappedOffline = stateModule.applyOfflineProgress(cappedOfflineState, 1000, 1000 + seventyTwoHours * 1000);
  const expectedCappedLikes = stateModule.getLikesPerSecond(cappedOfflineState) * fortyEightHours * 0.5;
  if (
    cappedOffline.secondsAway !== seventyTwoHours ||
    cappedOffline.productionSeconds !== fortyEightHours ||
    cappedOffline.likesEarned !== expectedCappedLikes
  ) {
    throw new Error("Expected offline production to pay only the first 48 hours away.");
  }

  const labState = stateModule.createDefaultState();
  labState.subscribers = 60;
  labState.upgrades.power_click.level = 1;
  const baseClickPower = stateModule.getClickPower(labState);
  const labStart = Date.now();
  const labPurchase = stateModule.purchaseLabBoost(labState, "ten_x_heatwave", labStart);
  if (!labPurchase.ok || labState.subscribers !== 0) {
    throw new Error("Expected Algorithm Bribe boost to spend subscribers.");
  }

  if (
    labState.lab.totalBoostsPurchased !== 1 ||
    labState.lab.boostPurchaseCounts.ten_x_heatwave !== 1 ||
    labState.lab.subscribersSpent !== 60
  ) {
    throw new Error("Expected Algorithm Bribe purchases to be tracked for milestones.");
  }

  if (stateModule.getClickPower(labState) !== baseClickPower * 10) {
    throw new Error("Expected active Algorithm Bribe boost to multiply click power.");
  }

  labState.subscribers = 200;
  const blockedBribe = stateModule.purchaseLabBoost(labState, "front_page_hijack", labStart + 1000);
  if (blockedBribe.ok || blockedBribe.reason !== "active" || labState.subscribers !== 200) {
    throw new Error("Expected Algorithm Bribe to block buying another bribe while one is active.");
  }

  const laterBribe = stateModule.purchaseLabBoost(labState, "front_page_hijack", labStart + 47000);
  if (!laterBribe.ok) {
    throw new Error("Expected Algorithm Bribe purchases to work again after the active bribe expires.");
  }

  if (labState.lab.totalBoostsPurchased !== 2 || labState.lab.boostPurchaseCounts.front_page_hijack !== 1) {
    throw new Error("Expected each Algorithm Bribe type purchase to be counted.");
  }

  const serializedLab = saveModule.serializeState(labState);
  if (
    !serializedLab.lab?.activeBoosts?.front_page_hijack ||
    serializedLab.lab.totalBoostsPurchased !== 2 ||
    serializedLab.lab.boostPurchaseCounts.ten_x_heatwave !== 1
  ) {
    throw new Error("Expected active Meme Lab boosts to be saved.");
  }

  if (!stateModule.pruneExpiredLabBoosts(labState, labStart + 230000) || stateModule.getActiveLabBoosts(labState, labStart + 230000).length !== 0) {
    throw new Error("Expected expired Meme Lab boosts to be pruned.");
  }

  if (memeLabModule.BAD_IDEA_BUTTON.outcomes.some((outcome) => /tower.*lps|lps.*tower|towerMultiplier/i.test(outcome.type))) {
    throw new Error("Bad Idea Button should not include tower LPS doubling outcomes.");
  }

  const badIdeaWeightsTotal = memeLabModule.BAD_IDEA_BUTTON.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  const randomTowerShipment = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "random_tower_shipment");
  const starterPackMisdelivery = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "starter_pack_misdelivery");
  const clickbaitSprint = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "clickbait_sprint");
  if (
    badIdeaWeightsTotal !== 100 ||
    randomTowerShipment?.weight !== 1 ||
    starterPackMisdelivery?.weight !== 1 ||
    clickbaitSprint?.clicks !== 1000
  ) {
    throw new Error("Expected rare Bad Idea tower outcomes and a 1,000-click Clickbait Sprint.");
  }

  const badIdeaState = stateModule.createDefaultState();
  badIdeaState.subscribers = 100;
  const badIdeaResult = stateModule.pressBadIdeaButton(badIdeaState, Date.now(), () => 0);
  if (!badIdeaResult.ok || badIdeaState.subscribers !== 20) {
    throw new Error("Expected Bad Idea Button to spend subscribers.");
  }

  if (badIdeaState.towers.swirling_like_button.amount !== 5) {
    throw new Error("Expected deterministic Bad Idea Button outcome to award 5 random unlocked towers.");
  }

  if (
    badIdeaState.lab.badIdeaPresses !== 1 ||
    badIdeaState.lab.badIdeaOutcomeCounts.random_tower_shipment !== 1 ||
    badIdeaState.lab.subscribersSpent !== 80
  ) {
    throw new Error("Expected Bad Idea Button presses and outcomes to be tracked for milestones.");
  }

  const serializedBadIdea = saveModule.serializeState(badIdeaState);
  if (
    serializedBadIdea.lab?.lastBadIdeaOutcome?.id !== "random_tower_shipment" ||
    serializedBadIdea.lab.badIdeaPresses !== 1 ||
    serializedBadIdea.lab.badIdeaOutcomeCounts.random_tower_shipment !== 1
  ) {
    throw new Error("Expected Bad Idea Button last outcome to be saved.");
  }

  const clickbaitState = stateModule.createDefaultState();
  clickbaitState.subscribers = 100;
  clickbaitState.upgrades.power_click.level = 2;
  const clickbaitPower = stateModule.getClickPower(clickbaitState);
  const clickbaitResult = stateModule.pressBadIdeaButton(clickbaitState, Date.now(), () => 0.31);
  const expectedClickbaitLikes = clickbaitPower * clickbaitSprint.clicks;
  if (
    !clickbaitResult.ok ||
    clickbaitResult.outcome.id !== "clickbait_sprint" ||
    clickbaitState.likes !== expectedClickbaitLikes ||
    clickbaitState.totalLikesEver !== expectedClickbaitLikes ||
    clickbaitState.totalClicks !== 0 ||
    clickbaitState.totalLikesFromClicks !== 0
  ) {
    throw new Error("Expected Clickbait Sprint to pay 1,000 clicks worth of Likes without increasing manual click stats.");
  }

  const brandDealState = stateModule.createDefaultState();
  brandDealState.subscribers = 100;
  brandDealState.likes = 3;
  brandDealState.towers.swirling_like_button.amount = 1000;
  const brandDealResult = stateModule.pressBadIdeaButton(brandDealState, Date.now(), () => 0.75);
  if (!brandDealResult.ok || brandDealResult.outcome.id !== "brand_deal_invoice" || brandDealState.likes < 0) {
    throw new Error("Expected Brand Deal Invoice to never make Likes negative.");
  }

  const apologyState = stateModule.createDefaultState();
  apologyState.subscribers = 80;
  const apologyResult = stateModule.pressBadIdeaButton(apologyState, Date.now(), () => 0.9);
  if (!apologyResult.ok || apologyResult.outcome.id !== "awkward_apology_video" || apologyState.subscribers < 0) {
    throw new Error("Expected Awkward Apology Video to never make Subscribers negative.");
  }

  const originalPlatform = globalThis.memeFarmPlatform;
  let platformSaveRaw = null;
  try {
    globalThis.memeFarmPlatform = {
      save: {
        load() {
          return platformSaveRaw;
        },
        write(value) {
          platformSaveRaw = String(value);
          return true;
        },
        clear() {
          platformSaveRaw = null;
          return true;
        }
      }
    };

    const platformSaveState = stateModule.createDefaultState();
    platformSaveState.likes = 777;
    platformSaveState.totalLikesEver = 777;
    if (!saveModule.saveGame(platformSaveState)) {
      throw new Error("Expected platform save bridge to accept save writes.");
    }

    const platformLoad = saveModule.loadGame();
    if (!platformLoad.loaded || platformLoad.state.likes !== 777) {
      throw new Error("Expected platform save bridge to load saved progress.");
    }

    saveModule.clearSave();
    if (platformSaveRaw !== null) {
      throw new Error("Expected platform save bridge to clear saved progress.");
    }
  } finally {
    if (originalPlatform === undefined) {
      delete globalThis.memeFarmPlatform;
    } else {
      globalThis.memeFarmPlatform = originalPlatform;
    }
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

  if (
    migrated.settings.desktopCompanion.trayStatus !== true ||
    "nativeNotifications" in migrated.settings.desktopCompanion
  ) {
    throw new Error("Expected desktop companion settings to migrate with safe defaults.");
  }

  const desktopSettingsSave = saveModule.mergeSaveData({
    settings: {
      desktopCompanion: {
        enabled: false,
        taskbarFlash: false,
        nativeNotifications: true,
        removedDesktopOption: true
      }
    }
  });

  if (
    desktopSettingsSave.settings.desktopCompanion.enabled !== false ||
    desktopSettingsSave.settings.desktopCompanion.taskbarFlash !== false ||
    "nativeNotifications" in desktopSettingsSave.settings.desktopCompanion ||
    "removedDesktopOption" in desktopSettingsSave.settings.desktopCompanion
  ) {
    throw new Error("Expected desktop companion settings to persist active toggles and ignore removed options.");
  }

  const desktopWindowSave = saveModule.mergeSaveData({
    settings: {
      desktopWindow: {
        sizePreset: "1280x720"
      }
    }
  });
  const invalidDesktopWindowSave = saveModule.mergeSaveData({
    settings: {
      desktopWindow: {
        sizePreset: "1024x576"
      }
    }
  });

  if (
    desktopWindowSave.settings.desktopWindow.sizePreset !== "1280x720" ||
    invalidDesktopWindowSave.settings.desktopWindow.sizePreset !== stateModule.DESKTOP_WINDOW_DEFAULTS.sizePreset
  ) {
    throw new Error("Expected desktop window size presets to save only known fixed sizes.");
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
