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
  const uiSource = fs.readFileSync(path.join(root, "src", "ui.js"), "utf8");
  const styleSource = fs.readFileSync(path.join(root, "src", "style.css"), "utf8");

  if (!uiSource.includes("const ORBITER_VISUAL_CAP = 180")) {
    throw new Error("Expected the takeover performance pass to preserve all 180 orbiters.");
  }
  if (
    uiSource.includes("shop-name-letter") ||
    uiSource.includes("cursor.style.left") ||
    uiSource.includes("orbiters[index].style.left") ||
    !uiSource.includes("VISUAL_ANIMATION_INTERVAL_SECONDS = 1 / 30") ||
    !uiSource.includes("TAKEOVER_REDUCED_LOAD_THRESHOLD = 4") ||
    !styleSource.includes(".tower-card.is-takeover-visible")
  ) {
    throw new Error("Expected takeover visuals to use the reduced animation workload.");
  }

  const towersModule = await importModule("src/data/towers.js");
  const upgradesModule = await importModule("src/data/upgrades.js");
  const achievementsModule = await importModule("src/data/achievements.js");
  const memeLabModule = await importModule("src/data/memeLab.js");
  const leaderboardsModule = await importModule("src/leaderboards.js");
  const steamModule = await importModule("src/steam.js");
  const stateModule = await importModule("src/state.js");
  const saveModule = await importModule("src/save.js");
  const audioModule = await importModule("src/audio.js");
  const formatModule = await importModule("src/utils/format.js");
  const steamElectronModule = require(path.join(root, "electron", "steam.cjs"));

  assertUniqueIds(towersModule.TOWERS, "tower");
  assertUniqueIds(upgradesModule.UPGRADES, "upgrade");
  assertUniqueIds(achievementsModule.ACHIEVEMENTS, "achievement");
  assertUniqueIds(memeLabModule.MEME_LAB_BOOSTS, "meme lab boost");
  assertUniqueIds(memeLabModule.BAD_IDEA_BUTTON.outcomes, "bad idea outcome");
  assertUniqueIds(memeLabModule.ALGORITHM_RESEARCH_PROJECTS, "algorithm research project");
  assertUniqueIds(leaderboardsModule.LEADERBOARD_METRICS, "leaderboard metric");
  assertAssetsExist(towersModule.TOWERS, "tower");
  assertAssetsExist(upgradesModule.UPGRADES, "upgrade");
  assertAssetsExist(stateModule.PRESTIGE_TIERS, "prestige");

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

  const rendererLeaderboardNames = new Set(leaderboardsModule.LEADERBOARD_METRICS.map((metric) => metric.steamName));
  if (
    rendererLeaderboardNames.size !== steamElectronModule.STEAM_LEADERBOARD_NAMES.size ||
    [...rendererLeaderboardNames].some((name) => !steamElectronModule.STEAM_LEADERBOARD_NAMES.has(name))
  ) {
    throw new Error("Electron and renderer Steam leaderboard names must stay in sync.");
  }

  const expectedSteamAchievementMilestones = new Set([
    "first_click",
    "first_tower",
    "first_subscriber",
    "likes_10000",
    "first_five_towers",
    "likes_1000000",
    "towers_100",
    "lps_1000",
    "subscribers_1000",
    "upgrade_levels_25",
    "tower_level_5_first",
    "meme_lab_first_bribe",
    "bad_idea_first_press",
    "crossfeed_first",
    "legacy_overclock_first",
    "likes_100000000",
    "towers_500",
    "lps_1000000",
    "upgrade_levels_100",
    "meme_lab_all_bribes",
    "prestige_1",
    "likes_1000000000",
    "all_towers_first",
    "crossfeed_10",
    "legacy_overclock_5",
    "prestige_2",
    "tower_level_5_all",
    "crossfeed_all",
    "legacy_overclock_all",
    "prestige_3"
  ]);
  const expectedSteamOnlyAchievements = new Set([
    "MF_ACH_ALL_MILESTONES"
  ]);
  const rendererAchievementNames = new Set(steamModule.STEAM_ACHIEVEMENTS.map(({ apiName }) => apiName));
  const rendererAchievementMilestones = new Set(
    steamModule.STEAM_ACHIEVEMENTS
      .map(({ milestoneId }) => milestoneId)
      .filter(Boolean)
  );
  if (
    rendererAchievementNames.size !== steamElectronModule.STEAM_ACHIEVEMENT_API_NAMES.size ||
    [...rendererAchievementNames].some((name) => !steamElectronModule.STEAM_ACHIEVEMENT_API_NAMES.has(name))
  ) {
    throw new Error("Electron and renderer Steam achievement names must stay in sync.");
  }
  if (
    rendererAchievementMilestones.size !== expectedSteamAchievementMilestones.size ||
    [...expectedSteamAchievementMilestones].some((id) => !rendererAchievementMilestones.has(id))
  ) {
    throw new Error("The published Steam achievement set must map all selected milestones.");
  }
  if ([...expectedSteamOnlyAchievements].some((apiName) => !rendererAchievementNames.has(apiName))) {
    throw new Error("The published Steam achievement set must include the Steam-only capstone achievements.");
  }
  const catalogAchievementIds = new Set(achievementsModule.ACHIEVEMENTS.map(({ id }) => id));
  if (
    steamModule.STEAM_ACHIEVEMENTS.some(({ milestoneId, apiName }) => (
      (milestoneId && !catalogAchievementIds.has(milestoneId)) || !/^MF_ACH_[A-Z0-9_]+$/.test(apiName)
    ))
  ) {
    throw new Error("Every Steam achievement must map a real milestone to a Steam-ready API name.");
  }

  const rendererStatNames = new Set(steamModule.STEAM_STATS.map(({ apiName }) => apiName));
  if (
    steamModule.STEAM_STATS.length !== 13 ||
    rendererStatNames.size !== 13 ||
    rendererStatNames.size !== steamElectronModule.STEAM_STAT_API_NAMES.size ||
    [...rendererStatNames].some((name) => !steamElectronModule.STEAM_STAT_API_NAMES.has(name))
  ) {
    throw new Error("Electron and renderer Steam progress-stat names must stay in sync.");
  }

  const progressState = stateModule.createDefaultState();
  progressState.leaderboardRecords.totalLikesEver = 1e20;
  progressState.leaderboardRecords.totalTowersOwned = 999;
  progressState.leaderboardRecords.highestLps = 2e6;
  progressState.leaderboardRecords.subscribersCollected = 5000;
  progressState.achievements.upgrade_levels_100 = { unlockedAt: Date.now() };
  progressState.achievements.first_five_towers = { unlockedAt: Date.now() };
  progressState.achievements.all_towers_first = { unlockedAt: Date.now() };
  progressState.achievements.tower_level_5_all = { unlockedAt: Date.now() };
  progressState.achievements.meme_lab_all_bribes = { unlockedAt: Date.now() };
  progressState.achievements.crossfeed_all = { unlockedAt: Date.now() };
  progressState.achievements.legacy_overclock_all = { unlockedAt: Date.now() };
  progressState.achievements.prestige_3 = { unlockedAt: Date.now() };
  progressState.leaderboardRecords.milestonesUnlocked = achievementsModule.ACHIEVEMENTS.length + 20;
  const progressValues = Object.fromEntries(
    steamModule.getSteamStatValues(progressState).map(({ apiName, value }) => [apiName, value])
  );
  const expectedProgressValues = {
    MF_STAT_TOTAL_LIKES: 1000000000,
    MF_STAT_TOTAL_TOWERS: 500,
    MF_STAT_PEAK_LPS: 1000000,
    MF_STAT_SUBSCRIBERS: 1000,
    MF_STAT_UPGRADE_LEVELS: 100,
    MF_STAT_STARTER_TOWERS: 5,
    MF_STAT_DISTINCT_TOWERS: towersModule.TOWERS.length,
    MF_STAT_LEVEL_5_TOWERS: towersModule.TOWERS.length,
    MF_STAT_BRIBE_TYPES: memeLabModule.MEME_LAB_BOOSTS.length,
    MF_STAT_CROSSFEEDS: towersModule.TOWERS.length,
    MF_STAT_LEGACY_OVERCLOCKS: upgradesModule.UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock").length,
    MF_STAT_PRESTIGE_LEVEL: 3,
    MF_STAT_MILESTONES_UNLOCKED: achievementsModule.ACHIEVEMENTS.length
  };
  if (Object.entries(expectedProgressValues).some(([apiName, value]) => progressValues[apiName] !== value)) {
    throw new Error("Steam progress stats should preserve milestone floors and clamp to published maxima.");
  }

  const capstoneState = stateModule.createDefaultState();
  for (const achievement of achievementsModule.ACHIEVEMENTS) {
    capstoneState.achievements[achievement.id] = { unlockedAt: Date.now() };
  }
  const earnedCapstoneApiNames = new Set(steamModule.getEarnedSteamAchievementApiNames(capstoneState));
  if (!earnedCapstoneApiNames.has("MF_ACH_ALL_MILESTONES")) {
    throw new Error("The all-milestones Steam capstone should unlock when every in-game milestone is earned.");
  }

  let previousSteamScore = -1;
  for (const value of [0, 1, 10, 999, 1e6, 2147483647, 1e18, 1e45, 1e306, Number.MAX_VALUE]) {
    const encoded = steamElectronModule.encodeLeaderboardValue(value, 3);
    const decoded = steamModule.decodeSteamLeaderboardValue(encoded.details, encoded.score);
    const bindingShapedDetails = [
      {},
      { 0: encoded.details[0] },
      { 0: encoded.details[0], 1: encoded.details[1] },
      { 0: encoded.details[0], 1: encoded.details[1], 2: encoded.details[2] }
    ];
    const normalizedDetails = steamElectronModule.normalizeDownloadedDetails(bindingShapedDetails);
    const decodedNormalizedDetails = steamModule.decodeSteamLeaderboardValue(normalizedDetails, encoded.score);
    const decodedRankScore = steamModule.decodeSteamRankScore(encoded.score);
    if (
      encoded.score < previousSteamScore ||
      encoded.score > 2147483647 ||
      encoded.details.some((item) => item < -2147483648 || item > 2147483647) ||
      (value > 0 && Math.abs(decoded - value) / value > 1e-7) ||
      (value > 0 && Math.abs(decodedNormalizedDetails - value) / value > 1e-7) ||
      (value > 0 && Math.abs(decodedRankScore - value) / value > 2e-6)
    ) {
      throw new Error(`Steam leaderboard encoding failed for ${value}.`);
    }
    previousSteamScore = encoded.score;
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

  for (const upgrade of upgradesModule.UPGRADES.filter((item) => item.category === "obscure")) {
    const expectedObscureMilestoneId = `upgrade_${upgrade.id}`;
    if (!achievementIds.has(expectedObscureMilestoneId)) {
      throw new Error(`Missing Obscure upgrade milestone: ${expectedObscureMilestoneId}`);
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

  for (const expectedId of ["prestige_1", "prestige_2", "prestige_3"]) {
    if (!achievementIds.has(expectedId)) {
      throw new Error(`Missing Go Viral prestige milestone: ${expectedId}`);
    }
  }

  const prestigeMilestones = new Map(achievementsModule.ACHIEVEMENTS
    .filter((achievement) => achievement.id.startsWith("prestige_"))
    .map((achievement) => [achievement.id, achievement]));
  const prestigeThreeState = stateModule.createDefaultState();
  prestigeThreeState.prestige.level = 3;
  if (
    prestigeMilestones.get("prestige_1").isUnlocked(prestigeThreeState) ||
    prestigeMilestones.get("prestige_2").isUnlocked(prestigeThreeState) ||
    !prestigeMilestones.get("prestige_3").isUnlocked(prestigeThreeState)
  ) {
    throw new Error("Expected a fresh Prestige 3 run to unlock only the Prestige 3 entry milestone.");
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

  const expectedTowerEconomy = [
    ["swirling_like_button", 0.25, 10],
    ["shitposter_intern", 2.5, 116],
    ["outdated_meme_reposter", 25, 1340],
    ["edgy_teen", 125, 7730],
    ["botnet", 625, 44700],
    ["doomscroller", 3125, 258000],
    ["meme_subreddit", 15625, 1490000],
    ["discord_mod", 78125, 8630000],
    ["tiktok_zoomer", 390625, 49900000],
    ["meme_lord", 1953125, 289000000],
    ["ai_meme_generator", 9765625, 1.67e9],
    ["internet_historian", 48828125, 9.64e9],
    ["cursed_content_forge", 244140625, 5.57e10],
    ["elons_meme_brainchip", 1220703125, 3.22e11],
    ["meme_multiverse_server", 6103515625, 1.86e12],
    ["boomer_facebook_group", 30517578125, 1.08e13],
    ["irony_engine", 152587890625, 6.23e13],
    ["fourchan_core_reactor", 762939453125, 3.6e14],
    ["eternal_rickroll_loop", 3814697265625, 2.08e15],
    ["wojak_factory", 19073486328125, 1.2e16],
    ["copium_refinery", 95367431640625, 6.95e16],
    ["nft_cemetery", 476837158203125, 4.02e17],
    ["cringe_singularity", 2384185791015625, 2.32e18],
    ["ceo_of_memes", 11920928955078125, 1.34e19],
    ["reality_glitcher", 59604644775390625, 7.77e19],
    ["sigma_godfather", 298023223876953125, 4.49e20],
    ["chrono_poster", 1490116119384765625, 2.6e21],
    ["memeconomist", 7450580596923828125, 1.5e22],
    ["zuckerbot_9000", 37252902984619140625, 8.68e22],
    ["meme_pope", 186264514923095703125, 5.02e23],
    ["ai_thinks_its_funny", 9.313225746154785e20, 2.9e24],
    ["the_algorithm", 4.656612873077393e21, 1.68e25]
  ];
  if (
    towersModule.TOWERS.length !== expectedTowerEconomy.length ||
    towersModule.TOWERS.some((tower, index) => (
      tower.id !== expectedTowerEconomy[index][0] ||
      tower.lps !== expectedTowerEconomy[index][1] ||
      tower.baseCost !== expectedTowerEconomy[index][2] ||
      tower.unlockAt?.totalLikesEver !== 0
    ))
  ) {
    throw new Error("Expected the recommended 32-tower LPS and base-cost progression.");
  }

  const migratedRosterSave = saveModule.mergeSaveData({
    saveVersion: 1,
    towers: {
      cursed_content_forge: { amount: 2, totalProduced: 10 },
      viral_singularity: { amount: 3, totalProduced: 20 },
      meme_pope: { amount: 1, totalProduced: 5 },
      forbidden_archivist: { amount: 2, totalProduced: 15 },
      cursed_tiktok_cultist: { amount: 3, totalProduced: 25 }
    },
    upgrades: {
      viral_singularity_double_5: { level: 1 },
      viral_singularity_crossfeed_internet_historian: { level: 1 }
    },
    achievements: {
      tower_viral_singularity_first: { unlockedAt: 1 },
      upgrade_viral_singularity_double_5: { unlockedAt: 2 },
      upgrade_viral_singularity_crossfeed: { unlockedAt: 3 }
    }
  });
  if (
    stateModule.SAVE_VERSION !== 2 ||
    migratedRosterSave.towers.cursed_content_forge.amount !== 5 ||
    migratedRosterSave.towers.cursed_content_forge.totalProduced !== 30 ||
    migratedRosterSave.towers.meme_pope.amount !== 6 ||
    migratedRosterSave.towers.meme_pope.totalProduced !== 45 ||
    migratedRosterSave.upgrades.cursed_content_forge_double_5.level !== 1 ||
    migratedRosterSave.upgrades.cursed_content_forge_crossfeed_internet_historian.level !== 1 ||
    !migratedRosterSave.achievements.tower_cursed_content_forge_first ||
    !migratedRosterSave.achievements.upgrade_cursed_content_forge_double_5 ||
    !migratedRosterSave.achievements.upgrade_cursed_content_forge_crossfeed
  ) {
    throw new Error("Expected retired towers, upgrades, and milestones to migrate into the 32-tower roster.");
  }

  if (
    towersModule.TOWERS[0].baseCost !== 10 ||
    towersModule.TOWERS[1].baseCost !== 116 ||
    towersModule.TOWERS.some((tower) => tower.costScale !== towersModule.TOWER_COST_SCALE)
  ) {
    throw new Error("Expected tower starting costs to match data and all towers to use the shared cost scale.");
  }

  if (upgradesModule.UPGRADES[0].id !== "power_click" || upgradesModule.UPGRADES[1].id !== "offline_capacity") {
    throw new Error("Click Boost and 48 Hour Offline Production Capacity should always be the first upgrades.");
  }

  if (upgradesModule.UPGRADES[0].costScale !== 2.2) {
    throw new Error("Click Boost price scaling should stay at the intended 2.20x repeat-purchase curve.");
  }

  if (
    upgradesModule.UPGRADES[0].effect.towerLpsSharePerLevel !== 0.005 ||
    upgradesModule.UPGRADES[0].effect.maxTowerLpsShare !== 0.05
  ) {
    throw new Error("Click Boost should add 0.5% tower LPS per level and cap that share at 5% per click.");
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
  const expectedLegacyMultiplier = 100;
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
        throw new Error(`Expected standard tower upgrade to be a tower multiplier: ${upgrade.id}`);
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
        upgrade.effect.multiplier !== expectedLegacyMultiplier ||
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
      const expectedCostMultiplier = 30 * Math.pow(15 / 30, progress);
      const expectedBaseCost = Math.ceil(tower.baseCost * expectedCostMultiplier);
      const expectedUnlock = Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, expectedBaseCost * 2));
      const targetRequirement = upgrade.unlockAt?.towerRequirements?.find((requirement) => requirement.towerId === upgrade.effect.towerId);
      const sourceRequirement = upgrade.unlockAt?.towerRequirements?.find((requirement) => requirement.towerId === upgrade.effect.sourceTowerId);
      const isLikeButtonCrossfeed = upgrade.effect.towerId === "swirling_like_button";
      if (
        upgrade.maxLevel !== 1 ||
        !upgrade.effect.sourceTowerId ||
        !upgrade.effect.multiplierPerSource ||
        (isLikeButtonCrossfeed ? upgrade.effect.maxMultiplier !== null || upgrade.effect.countsAllOtherTowers !== true : upgrade.effect.maxMultiplier !== 10) ||
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

  const expectedStandardTowerUnlocks = [
    { amount: 10, costRatio: 0.75 },
    { amount: 20, costRatio: 1 },
    { amount: 30, costRatio: 1.5 },
    { amount: 40, costRatio: 2.5 },
    { amount: 50, costRatio: 4 }
  ];

  for (const [towerIndex, tower] of towersModule.TOWERS.entries()) {
    if (towerUpgradeCounts.get(tower.id) !== 5) {
      throw new Error(`Expected five one-time LPS multiplier upgrades for tower: ${tower.id}`);
    }

    const towerDoubleUpgrades = upgradesModule.UPGRADES
      .filter((upgrade) => upgrade.category === "standardTowerDouble" && upgrade.effect.towerId === tower.id)
      .sort((first, second) => Number(first.id.match(/_double_(\d+)$/)?.[1] ?? 0) - Number(second.id.match(/_double_(\d+)$/)?.[1] ?? 0));
    const progress = towersModule.TOWERS.length > 1 ? towerIndex / (towersModule.TOWERS.length - 1) : 0;
    const expectedMultipliers = [
      [22.5, 13.5],
      [390, 62.4],
      [7440, 372],
      [161000, 2300],
      [3840000, 16000]
    ].map(([first, last]) => first * Math.pow(last / first, progress));

    for (const [tierIndex, expectedMultiplier] of expectedMultipliers.entries()) {
      const upgrade = towerDoubleUpgrades[tierIndex];
      const expectedProductionMultiplier = [2, 3, 4, 5, 6][tierIndex];
      const expectedUnlockRequirement = expectedStandardTowerUnlocks[tierIndex];
      const expectedBaseCost = Math.ceil(tower.baseCost * expectedMultiplier);
      const expectedUnlock = Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, expectedBaseCost * expectedUnlockRequirement.costRatio));

      if (
        upgrade.baseCost !== expectedBaseCost ||
        upgrade.effect.multiplier !== expectedProductionMultiplier ||
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

  const bulkState = stateModule.createDefaultState();
  const bulkQuote = stateModule.getTowerPurchaseQuote(bulkState, "swirling_like_button", 10);
  bulkState.likes = bulkQuote.cost;
  const bulkPurchase = stateModule.purchaseTower(bulkState, "swirling_like_button", 10);
  if (!bulkPurchase.ok || bulkPurchase.amount !== 10 || stateModule.getTowerAmount(bulkState, "swirling_like_button") !== 10 || bulkState.likes !== 0) {
    throw new Error("Expected a fixed bulk tower purchase to buy and charge for all requested towers.");
  }

  const maxState = stateModule.createDefaultState();
  const twentyFiveQuote = stateModule.getTowerPurchaseQuote(maxState, "swirling_like_button", 25);
  maxState.likes = twentyFiveQuote.cost;
  const maxQuote = stateModule.getTowerPurchaseQuote(maxState, "swirling_like_button", "max");
  const maxPurchase = stateModule.purchaseTower(maxState, "swirling_like_button", "max");
  if (!maxPurchase.ok || maxQuote.amount !== 25 || maxPurchase.amount !== 25 || stateModule.getTowerAmount(maxState, "swirling_like_button") !== 25) {
    throw new Error("Expected Buy Max to purchase the exact affordable tower amount.");
  }

  if (achievementsModule.ACHIEVEMENTS.some((achievement) => !achievement.category)) {
    throw new Error("Expected every milestone to have a navigation category.");
  }

  const clickProgress = achievementsModule.getAchievementProgress(
    achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "clicks_100"),
    { ...stateModule.createDefaultState(), totalClicks: 42 }
  );
  if (clickProgress?.current !== 42 || clickProgress?.target !== 100) {
    throw new Error("Expected milestone progress to expose live current and target values.");
  }

  const towerProgressState = stateModule.createDefaultState();
  towerProgressState.towers.swirling_like_button.amount = 25;
  const towerProgress = achievementsModule.getAchievementProgress(
    achievementsModule.ACHIEVEMENTS.find((achievement) => achievement.id === "tower_swirling_like_button_50"),
    towerProgressState
  );
  if (towerProgress?.current !== 25 || towerProgress?.target !== 50) {
    throw new Error("Expected generated tower milestones to expose quantity progress.");
  }

  for (const [level, expectedMultiplier] of [[0, 1], [1, 2], [2, 4], [3, 8]]) {
    const prestigeMultiplierState = stateModule.createDefaultState();
    prestigeMultiplierState.prestige.level = level;
    prestigeMultiplierState.towers.swirling_like_button.amount = 1;
    const expectedLps = towersModule.TOWERS[0].lps * expectedMultiplier;
    if (
      stateModule.getPrestigeTowerLpsMultiplier(prestigeMultiplierState) !== expectedMultiplier ||
      stateModule.getPrestigeClickPowerMultiplier(prestigeMultiplierState) !== expectedMultiplier ||
      Math.abs(stateModule.getTowerEffectiveLps(prestigeMultiplierState, "swirling_like_button") - expectedLps) > Number.EPSILON ||
      stateModule.getClickPower(prestigeMultiplierState) !== expectedMultiplier
    ) {
      throw new Error(`Expected Prestige ${level} to apply permanent x${expectedMultiplier} tower LPS and flat click multipliers.`);
    }
  }

  const hybridClickState = stateModule.createDefaultState();
  hybridClickState.prestige.level = 3;
  hybridClickState.towers.swirling_like_button.amount = 100;
  hybridClickState.upgrades.power_click.level = 3;
  const hybridTowerLps = stateModule.getTowerLikesPerSecond(hybridClickState);
  const expectedHybridClickPower = (8 * Math.pow(2, 3)) + (hybridTowerLps * 0.015);
  if (Math.abs(stateModule.getClickPower(hybridClickState) - expectedHybridClickPower) > 1e-9) {
    throw new Error("Expected Click Boost to combine prestige-scaled flat power with a growing share of tower LPS.");
  }

  hybridClickState.upgrades.power_click.level = 12;
  const expectedCappedClickPower = (8 * Math.pow(2, 12)) + (hybridTowerLps * 0.05);
  if (Math.abs(stateModule.getClickPower(hybridClickState) - expectedCappedClickPower) > 1e-9) {
    throw new Error("Expected Click Boost's tower LPS contribution to cap at 5% per click.");
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
  gatedUpgradeState.totalLikesEver = 0;
  if (stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to stay locked until tier 1 is bought.");
  }

  gatedUpgradeState.upgrades.swirling_like_button_double_1.level = 1;
  if (!stateModule.isUpgradeUnlocked(gatedUpgradeState, secondDoubleUpgrade) || !stateModule.shouldShowUpgradeInShop(gatedUpgradeState, secondDoubleUpgrade)) {
    throw new Error("Expected tier 2 tower upgrade to unlock after tier 1 is bought, regardless of lifetime likes.");
  }

  const amountGatedState = stateModule.createDefaultState();
  amountGatedState.towers.swirling_like_button.amount = secondDoubleUpgrade.unlockAt.amount - 1;
  amountGatedState.totalLikesEver = 0;
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
    throw new Error("Expected the first standard tower upgrade to double that tower's LPS.");
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
  synergyState.totalLikesEver = 0;
  synergyState.likes = stateModule.getUpgradeCost(synergyState, firstSynergyUpgrade.id);
  const baseSynergyLps = stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button");
  const synergyPurchase = stateModule.purchaseUpgrade(synergyState, firstSynergyUpgrade.id);
  const expectedSynergyMultiplier = 1 + synergyState.towers.shitposter_intern.amount * firstSynergyUpgrade.effect.multiplierPerSource;
  if (!synergyPurchase.ok || stateModule.getTowerEffectiveLps(synergyState, "swirling_like_button") !== baseSynergyLps * expectedSynergyMultiplier) {
    throw new Error("Expected Like Button crossfeed upgrade to scale from every other tower owned with no cap.");
  }

  const sourceGatedSynergyState = stateModule.createDefaultState();
  sourceGatedSynergyState.towers.swirling_like_button.amount = 10;
  sourceGatedSynergyState.towers.shitposter_intern.amount = 39;
  sourceGatedSynergyState.totalLikesEver = firstSynergyUpgrade.unlockAt.totalLikesEver;
  sourceGatedSynergyState.likes = stateModule.getUpgradeCost(sourceGatedSynergyState, firstSynergyUpgrade.id);
  if (stateModule.isUpgradeUnlocked(sourceGatedSynergyState, firstSynergyUpgrade) || stateModule.shouldShowUpgradeInShop(sourceGatedSynergyState, firstSynergyUpgrade)) {
    throw new Error("Expected crossfeed upgrade to require 40 owned source towers before becoming visible.");
  }

  const doomscrollUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "doomscroll_surge");
  const doomscrollState = stateModule.createDefaultState();
  doomscrollState.towers.doomscroller.amount = 1;
  doomscrollState.likes = stateModule.getUpgradeCost(doomscrollState, doomscrollUpgrade.id);
  const doomscrollPurchase = stateModule.purchaseUpgrade(doomscrollState, doomscrollUpgrade.id);
  if (!doomscrollPurchase.ok || doomscrollPurchase.upgrade?.type !== "randomLpsBoost") {
    throw new Error("Expected Doomscroller obscure upgrade to be buyable after owning a Doomscroller.");
  }

  const baseDoomscrollLps = stateModule.getLikesPerSecond(doomscrollState);
  const triggeredDoomscrollBoosts = stateModule.maybeTriggerObscureLpsBoosts(doomscrollState, 1000, () => 0);
  if (
    triggeredDoomscrollBoosts.length !== 1 ||
    triggeredDoomscrollBoosts[0].multiplier !== 2 ||
    stateModule.getLikesPerSecond(doomscrollState, 1000) !== baseDoomscrollLps * 2 ||
    stateModule.getActiveObscureLpsBoosts(doomscrollState, 1000)[0]?.remainingSeconds !== 15
  ) {
    throw new Error("Expected Doomscroller obscure upgrade to trigger a timed random LPS boost.");
  }

  const serializedDoomscroll = saveModule.serializeState(doomscrollState);
  if (serializedDoomscroll.lab.activeObscureBoosts.doomscroll_surge?.multiplier !== 2) {
    throw new Error("Expected active Doomscroller obscure boost to be saved.");
  }

  if (!stateModule.pruneExpiredObscureLpsBoosts(doomscrollState, 16000) || stateModule.getActiveObscureLpsBoosts(doomscrollState, 16000).length !== 0) {
    throw new Error("Expected expired Doomscroller obscure boost to be pruned.");
  }

  const legacyUpgrade = upgradesModule.UPGRADES.find((upgrade) => upgrade.id === "shitposter_intern_legacy_overclock");
  const legacyState = stateModule.createDefaultState();
  legacyState.towers.shitposter_intern.amount = 25;
  legacyState.upgrades.shitposter_intern_double_5.level = 1;
  legacyState.totalLikesEver = 0;
  legacyState.likes = stateModule.getUpgradeCost(legacyState, legacyUpgrade.id);
  const baseLegacyLps = stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern");
  const legacyPurchase = stateModule.purchaseUpgrade(legacyState, legacyUpgrade.id);
  if (
    !legacyPurchase.ok ||
    legacyPurchase.upgrade?.id !== legacyUpgrade.id ||
    legacyPurchase.upgrade?.category !== "legacyOverclock" ||
    stateModule.getTowerEffectiveLps(legacyState, "shitposter_intern") !== baseLegacyLps * 100
  ) {
    throw new Error("Expected every Legacy Overclock to multiply its tower's LPS by 100.");
  }

  if (!stateModule.updateLeaderboardRecords(state)) {
    throw new Error("Expected leaderboard records to update after tower purchase.");
  }

  const prestigeState = stateModule.createDefaultState();
  const prestigeFinalTower = towersModule.TOWERS[towersModule.TOWERS.length - 1];
  prestigeState.likes = 123456789;
  prestigeState.totalLikesEver = 987654321;
  prestigeState.totalClicks = 4321;
  prestigeState.totalSubscribersEver = 222;
  prestigeState.totalLikesSpent = 7654321;
  prestigeState.totalLikesFromClicks = 1234;
  prestigeState.playTimeSeconds = 456;
  prestigeState.stats.acceptedTerms.personalized_reality_agreement = 111;
  prestigeState.achievements.likes_100 = true;
  prestigeState.towers[prestigeFinalTower.id].amount = 1;
  prestigeState.towers.swirling_like_button.amount = 42;
  prestigeState.upgrades.power_click.level = 4;

  if (!stateModule.hasFinalTower(prestigeState)) {
    throw new Error("Expected final tower ownership to be detectable before Go Viral.");
  }

  if (!stateModule.canGoViral(prestigeState)) {
    throw new Error("Expected Go Viral prestige to unlock after buying the final tower.");
  }

  const prestigeResult = stateModule.goViral(prestigeState, 12345);
  if (
    !prestigeResult.ok ||
    prestigeResult.towerLpsMultiplier !== 2 ||
    prestigeResult.clickPowerMultiplier !== 2 ||
    prestigeState.prestige.level !== 1 ||
    prestigeState.likes !== 0 ||
    prestigeState.totalLikesEver !== 0 ||
    prestigeState.totalClicks !== 0 ||
    prestigeState.totalSubscribersEver !== 0 ||
    prestigeState.towers[prestigeFinalTower.id].amount !== 0 ||
    prestigeState.upgrades.power_click.level !== 0 ||
    prestigeState.leaderboardRecords.totalLikesEver !== 987654321 ||
    prestigeState.leaderboardRecords.totalClicks !== 4321 ||
    prestigeState.leaderboardRecords.subscribersCollected !== 222 ||
    prestigeState.leaderboardRecords.prestigeLevel !== 1
  ) {
    throw new Error("Expected Go Viral prestige to reset local progress while preserving leaderboard records and the public pin.");
  }

  const archivedPrestigeZero = stateModule.getPrestigeRunStats(prestigeState, 0);
  const lifetimePrestigeStats = stateModule.getLifetimePrestigeStats(prestigeState);
  if (
    !archivedPrestigeZero.hasData ||
    archivedPrestigeZero.totalLikesEver !== 987654321 ||
    archivedPrestigeZero.totalClicks !== 4321 ||
    archivedPrestigeZero.totalLikesSpent !== 7654321 ||
    archivedPrestigeZero.totalLikesFromClicks !== 1234 ||
    archivedPrestigeZero.playTimeSeconds !== 456 ||
    archivedPrestigeZero.acceptedTerms.personalized_reality_agreement !== 111 ||
    lifetimePrestigeStats.totalLikesEver !== 987654321 ||
    lifetimePrestigeStats.totalClicks !== 4321 ||
    lifetimePrestigeStats.totalSubscribersEver !== 222
  ) {
    throw new Error("Expected Go Viral to archive Prestige 0 stats and expose lifetime stat totals after reset.");
  }

  const serializedPrestigeState = saveModule.serializeState(prestigeState);
  const migratedPrestigeState = saveModule.mergeSaveData(serializedPrestigeState);
  if (stateModule.getPrestigeRunStats(migratedPrestigeState, 0).totalLikesEver !== 987654321) {
    throw new Error("Expected per-prestige stats to survive save serialization.");
  }

  if (stateModule.canGoViral(prestigeState)) {
    throw new Error("Expected Go Viral prestige to require rebuying the final tower after a reset.");
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

  const researchState = stateModule.createDefaultState();
  researchState.subscribers = 10000;
  const blockedResearch = stateModule.purchaseAlgorithmResearch(researchState, "audience_memory", labStart);
  if (blockedResearch.ok || blockedResearch.reason !== "prerequisite") {
    throw new Error("Expected Algorithm Research branches to unlock in order.");
  }

  for (const project of memeLabModule.ALGORITHM_RESEARCH_PROJECTS) {
    const purchase = stateModule.purchaseAlgorithmResearch(researchState, project.id, labStart);
    if (!purchase.ok) {
      throw new Error(`Expected Algorithm Research purchase to succeed: ${project.id}`);
    }
  }

  if (
    stateModule.getAlgorithmResearchCount(researchState) !== memeLabModule.ALGORITHM_RESEARCH_PROJECTS.length ||
    stateModule.getFakeSubscriberConversion(researchState).chance !== 0.08 ||
    stateModule.getMissedSubscriberRecoveryChance(researchState) !== 0.2
  ) {
    throw new Error("Expected permanent Algorithm Research effects to become active.");
  }

  const serializedResearch = saveModule.serializeState(researchState);
  const migratedResearch = saveModule.mergeSaveData(serializedResearch);
  if (
    stateModule.getAlgorithmResearchCount(migratedResearch) !== memeLabModule.ALGORITHM_RESEARCH_PROJECTS.length ||
    migratedResearch.lab.researchSubscribersSpent !== 2850
  ) {
    throw new Error("Expected Algorithm Research purchases and spending to survive save migration.");
  }

  const researchedBribeState = stateModule.createDefaultState();
  researchedBribeState.subscribers = 2000;
  for (const projectId of ["negotiated_rates", "contract_extension", "scheduled_bribe"]) {
    stateModule.purchaseAlgorithmResearch(researchedBribeState, projectId, labStart);
  }
  const researchedBribe = stateModule.purchaseLabBoost(researchedBribeState, "ten_x_heatwave", labStart);
  const queuedBribe = stateModule.purchaseLabBoost(researchedBribeState, "front_page_hijack", labStart + 1000);
  if (
    !researchedBribe.ok || researchedBribe.cost !== 54 ||
    !queuedBribe.ok || !queuedBribe.queued || queuedBribe.cost !== 99 ||
    researchedBribeState.lab.queuedBoostId !== "front_page_hijack" ||
    researchedBribeState.lab.activeBoosts.ten_x_heatwave.expiresAt !== labStart + 54000
  ) {
    throw new Error("Expected researched Bribe discounts, duration extensions, and queueing to apply.");
  }

  stateModule.pruneExpiredLabBoosts(researchedBribeState, labStart + 55000);
  if (
    researchedBribeState.lab.queuedBoostId !== null ||
    researchedBribeState.lab.activeBoosts.front_page_hijack?.expiresAt !== labStart + 271000
  ) {
    throw new Error("Expected a queued Algorithm Bribe to activate after the current Bribe expires.");
  }

  const researchPrestigeState = stateModule.createDefaultState();
  researchPrestigeState.subscribers = 2000;
  for (const projectId of ["follower_forensics", "second_chance_follow", "audience_memory"]) {
    stateModule.purchaseAlgorithmResearch(researchPrestigeState, projectId, labStart);
  }
  researchPrestigeState.subscribers = 500;
  researchPrestigeState.towers[towersModule.TOWERS[towersModule.TOWERS.length - 1].id].amount = 1;
  const researchPrestige = stateModule.goViral(researchPrestigeState, labStart);
  if (
    !researchPrestige.ok || researchPrestigeState.subscribers !== 100 ||
    researchPrestigeState.totalSubscribersEver !== 100 ||
    !stateModule.hasAlgorithmResearch(researchPrestigeState, "audience_memory")
  ) {
    throw new Error("Expected Audience Memory and all permanent research to survive Go Viral.");
  }

  const researchMilestones = achievementsModule.ACHIEVEMENTS.filter((achievement) => achievement.id.startsWith("algorithm_research_"));
  if (
    researchMilestones.length !== memeLabModule.ALGORITHM_RESEARCH_PROJECTS.length + 3 ||
    !researchMilestones.every((achievement) => achievement.isUnlocked(researchState))
  ) {
    throw new Error("Expected project and collection milestones for Algorithm Research.");
  }

  if (memeLabModule.BAD_IDEA_BUTTON.outcomes.some((outcome) => /tower.*lps|lps.*tower|towerMultiplier/i.test(outcome.type))) {
    throw new Error("Bad Idea Button should not include tower LPS doubling outcomes.");
  }

  const badIdeaWeightsTotal = memeLabModule.BAD_IDEA_BUTTON.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  const randomTowerShipment = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "random_tower_shipment");
  const starterPackMisdelivery = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "starter_pack_misdelivery");
  const clickbaitSprint = memeLabModule.BAD_IDEA_BUTTON.outcomes.find((outcome) => outcome.id === "clickbait_sprint");
  const expectedBadIdeaOutcomes = new Map([
    ["random_tower_shipment", { weight: 15, amount: 5 }],
    ["starter_pack_misdelivery", { weight: 10, amount: 12 }],
    ["emergency_repost", { weight: 24, seconds: 1200 }],
    ["clickbait_sprint", { weight: 20, clicks: 10000 }],
    ["audience_confusion", { weight: 11, amount: 120 }],
    ["brand_deal_invoice", { weight: 10, seconds: 30 }],
    ["awkward_apology_video", { weight: 5, amount: 3 }],
    ["nothing_happens_loudly", { weight: 5 }]
  ]);
  if (
    badIdeaWeightsTotal !== 100 ||
    memeLabModule.BAD_IDEA_BUTTON.outcomes.length !== expectedBadIdeaOutcomes.size ||
    memeLabModule.BAD_IDEA_BUTTON.outcomes.some((outcome) => {
      const expected = expectedBadIdeaOutcomes.get(outcome.id);
      return !expected || Object.entries(expected).some(([key, value]) => outcome[key] !== value);
    })
  ) {
    throw new Error("Expected the recommended eight-outcome Bad Idea reward table.");
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
  const clickbaitResult = stateModule.pressBadIdeaButton(clickbaitState, Date.now(), () => 0.55);
  const expectedClickbaitLikes = clickbaitPower * clickbaitSprint.clicks;
  if (
    !clickbaitResult.ok ||
    clickbaitResult.outcome.id !== "clickbait_sprint" ||
    clickbaitState.likes !== expectedClickbaitLikes ||
    clickbaitState.totalLikesEver !== expectedClickbaitLikes ||
    clickbaitState.totalClicks !== 0 ||
    clickbaitState.totalLikesFromClicks !== 0
  ) {
    throw new Error("Expected Clickbait Sprint to pay 10,000 clicks worth of Likes without increasing manual click stats.");
  }

  const brandDealState = stateModule.createDefaultState();
  brandDealState.subscribers = 100;
  brandDealState.likes = 3;
  brandDealState.towers.swirling_like_button.amount = 1000;
  const brandDealResult = stateModule.pressBadIdeaButton(brandDealState, Date.now(), () => 0.85);
  if (!brandDealResult.ok || brandDealResult.outcome.id !== "brand_deal_invoice" || brandDealState.likes < 0) {
    throw new Error("Expected Brand Deal Invoice to never make Likes negative.");
  }

  const apologyState = stateModule.createDefaultState();
  apologyState.subscribers = 80;
  const apologyResult = stateModule.pressBadIdeaButton(apologyState, Date.now(), () => 0.92);
  if (!apologyResult.ok || apologyResult.outcome.id !== "awkward_apology_video" || apologyState.subscribers < 0) {
    throw new Error("Expected Awkward Apology Video to never make Subscribers negative.");
  }

  const damageControlState = stateModule.createDefaultState();
  damageControlState.subscribers = 1000;
  stateModule.purchaseAlgorithmResearch(damageControlState, "risk_assessment", labStart);
  stateModule.purchaseAlgorithmResearch(damageControlState, "damage_control", labStart);
  damageControlState.subscribers = 100;
  const controlledApology = stateModule.pressBadIdeaButton(damageControlState, labStart, () => 0.92);
  if (!controlledApology.ok || controlledApology.outcome.id !== "awkward_apology_video" || damageControlState.subscribers !== 18) {
    throw new Error("Expected Damage Control to halve negative Subscriber losses after the Bad Idea cost.");
  }

  const peerReviewState = stateModule.createDefaultState();
  peerReviewState.subscribers = 2000;
  for (const projectId of ["risk_assessment", "damage_control", "peer_review"]) {
    stateModule.purchaseAlgorithmResearch(peerReviewState, projectId, labStart);
  }
  peerReviewState.subscribers = 100;
  peerReviewState.lab.badIdeaDryStreak = 3;
  const peerReviewedOutcome = stateModule.pressBadIdeaButton(peerReviewState, labStart, () => 0.99);
  if (!peerReviewedOutcome.ok || !["awardRandomTower", "addLikesFromLps", "addLikesFromClicks", "addSubscribers"].includes(peerReviewedOutcome.outcome.type)) {
    throw new Error("Expected Peer Review to guarantee a positive outcome after three non-positive results.");
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
  if (
    leaderboardRows.length !== 1 ||
    !leaderboardRows[0].isPlayer ||
    leaderboardRows[0].rank !== null
  ) {
    throw new Error("Offline leaderboard rows should contain only the unranked local player, never mock competitors.");
  }

  const prestigeLeaderboardState = stateModule.createDefaultState();
  prestigeLeaderboardState.prestige.level = 2;
  prestigeLeaderboardState.leaderboardRecords.totalLikesEver = 999;
  const prestigeLeaderboardRows = leaderboardsModule.getLeaderboardRows(prestigeLeaderboardState, {
    scope: "global",
    metricId: "total_likes_ever"
  });
  if (prestigeLeaderboardRows.find((row) => row.isPlayer)?.prestigeLevel !== 2) {
    throw new Error("Expected leaderboard rows to expose the player's public prestige pin.");
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

  const legacyAudioSettings = saveModule.mergeSaveData({
    settings: { muted: true, volume: 0.35 }
  });
  if (
    !legacyAudioSettings.settings.musicMuted ||
    !legacyAudioSettings.settings.sfxMuted ||
    legacyAudioSettings.settings.musicVolume !== 0.35 ||
    legacyAudioSettings.settings.sfxVolume !== 0.35
  ) {
    throw new Error("Expected legacy master audio settings to migrate to both audio channels.");
  }

  const separateAudioState = stateModule.createDefaultState();
  separateAudioState.settings.musicMuted = true;
  separateAudioState.settings.sfxMuted = false;
  separateAudioState.settings.musicVolume = 0.2;
  separateAudioState.settings.sfxVolume = 0.8;
  const separateAudioSave = saveModule.mergeSaveData(saveModule.serializeState(separateAudioState));
  if (
    !separateAudioSave.settings.musicMuted ||
    separateAudioSave.settings.sfxMuted ||
    separateAudioSave.settings.musicVolume !== 0.2 ||
    separateAudioSave.settings.sfxVolume !== 0.8
  ) {
    throw new Error("Expected independent music and sound-effect settings to survive save serialization.");
  }

  const originalAudio = globalThis.Audio;
  const originalDocument = globalThis.document;
  const audioInstances = [];
  try {
    globalThis.Audio = class MockAudio {
      constructor(src) {
        this.src = src;
        this.muted = false;
        this.volume = 1;
        this.currentTime = 0;
        this.playCount = 0;
        audioInstances.push(this);
      }

      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
    };
    globalThis.document = { addEventListener() {} };
    const audioController = audioModule.createAudioController();
    audioController.init({ musicMuted: true, sfxMuted: false, musicVolume: 0.25, sfxVolume: 0.75 });
    audioController.pop();
    if (
      !audioInstances[0].muted ||
      audioInstances[0].playCount !== 0 ||
      audioInstances.slice(1, 7).every((item) => item.playCount === 0) ||
      audioController.sfxMuted
    ) {
      throw new Error("Expected muted background music to leave clicking sound effects enabled.");
    }
  } finally {
    globalThis.Audio = originalAudio;
    globalThis.document = originalDocument;
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
