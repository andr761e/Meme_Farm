import { TOWERS } from "./towers.js";

const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
const iconImage = (fileName) => `../assets/images/icons/${fileName}`;

const STANDARD_TOWER_COST_MULTIPLIERS = [
  [22.5, 390, 7440, 161000, 3840000],
  [22.2, 372.1, 6890, 144383, 3337600],
  [22, 354.9, 6380, 129481, 2899200],
  [21.6, 338.5, 5909, 116117, 2518400],
  [21.3, 322.9, 5472, 104132, 2188800],
  [21.1, 308.1, 5067, 93385, 1900800],
  [20.8, 294.1, 4693, 83746, 1651200],
  [20.5, 280.8, 4346, 75102, 1436800],
  [20.3, 267.5, 4024, 67351, 1248000],
  [20, 255.8, 3727, 60399, 1084800],
  [19.7, 244.1, 3452, 54165, 940800],
  [19.4, 232.4, 3196, 48575, 819200],
  [19.3, 222.3, 2960, 43562, 710400],
  [19, 211.4, 2741, 39066, 617600],
  [18.7, 202, 2538, 35034, 537600],
  [18.5, 192.7, 2350, 31418, 467200],
  [18.3, 184.1, 2177, 28175, 406400],
  [18, 175.5, 2016, 25267, 352000],
  [17.7, 167.7, 1867, 22659, 306036],
  [17.6, 159.9, 1729, 20321, 265914],
  [17.3, 152.1, 1601, 18223, 231052],
  [17.1, 145.1, 1482, 16342, 200761],
  [16.8, 138.8, 1373, 14656, 174441],
  [16.7, 132.6, 1272, 13143, 151571],
  [16.5, 126.4, 1177, 11787, 131700],
  [16.2, 120.9, 1091, 10570, 114434],
  [16, 114.7, 1010, 9479, 99431],
  [15.8, 110, 935, 8501, 86396],
  [15.6, 104.5, 866, 7623, 75069],
  [15.4, 99.8, 802, 6837, 65228],
  [15.2, 95.2, 743, 6131, 56676],
  [15, 91.3, 688, 5498, 49246],
  [14.8, 86.6, 637, 4931, 42789],
  [14.6, 82.7, 590, 4422, 37180],
  [14.4, 78.8, 546, 3965, 32305],
  [14.2, 75.3, 506, 3556, 28070],
  [14, 71.8, 469, 3189, 24390],
  [13.9, 68.6, 434, 2860, 21193],
  [13.7, 65.4, 402, 2565, 18414],
  [13.5, 62.4, 372, 2300, 16000]
];
const STANDARD_TOWER_UNLOCK_REQUIREMENTS = [
  { tier: 1, amount: 10, costRatio: 0.75 },
  { tier: 2, amount: 20, costRatio: 1 },
  { tier: 3, amount: 30, costRatio: 1.5 },
  { tier: 4, amount: 40, costRatio: 2.5 },
  { tier: 5, amount: 50, costRatio: 4 }
];
const CROSSFEED_FIRST_COST_MULTIPLIER = 5000;
const CROSSFEED_LAST_COST_MULTIPLIER = 1000;
const SUBSCRIBER_SPAWN_UPGRADE_TIERS = [
  { tier: 1, baseCost: 250000, unlockAt: 50000, multiplier: 1.5, name: "Subscriber Bell" },
  { tier: 2, baseCost: 10000000, unlockAt: 2500000, multiplier: 1.6, name: "Notification Bait" },
  { tier: 3, baseCost: 500000000, unlockAt: 100000000, multiplier: 1.75, name: "Parasocial Funnel" },
  { tier: 4, baseCost: 25000000000, unlockAt: 10000000000, multiplier: 2, name: "Follow Button Gravity Well" },
  { tier: 5, baseCost: 1500000000000, unlockAt: 2000000000000, multiplier: 2.5, name: "Subscriber Event Horizon" }
];

const TOWER_UPGRADE_NAMES = {
  swirling_like_button: "Like Button Swarm",
  shitposter_intern: "Intern Orientation",
  outdated_meme_reposter: "Vintage Format Seminar",
  edgy_teen: "Edgelord Workshop",
  botnet: "Organic Reach Audit",
  doomscroller: "Thumb Endurance Program",
  meme_subreddit: "Moderator Consensus",
  discord_mod: "Permission Escalation",
  tiktok_zoomer: "Vertical Velocity",
  meme_lord: "Deep Fry Coronation"
};

const LEGACY_OVERCLOCKS = [
  {
    towerId: "swirling_like_button",
    displayName: "Like Button Legacy Overclock",
    multiplier: 1000,
    tierFiveCostRatio: 0.67,
    flavor: "The starter button refuses to become irrelevant."
  },
  {
    towerId: "shitposter_intern",
    displayName: "Intern Promoted To Lore",
    multiplier: 1000,
    tierFiveCostRatio: 0.77,
    flavor: "Somehow the unpaid labor became load-bearing."
  },
  {
    towerId: "outdated_meme_reposter",
    displayName: "Ancient Format Renaissance",
    multiplier: 1000,
    tierFiveCostRatio: 0.88,
    flavor: "The old template has discovered modern distribution."
  },
  {
    towerId: "edgy_teen",
    displayName: "Cringe Immunity Patch",
    multiplier: 1000,
    tierFiveCostRatio: 1.02,
    flavor: "The phase did not pass; it scaled."
  },
  {
    towerId: "botnet",
    displayName: "Organic Looking Button",
    multiplier: 1000,
    tierFiveCostRatio: 1.17,
    flavor: "Every account is suddenly very enthusiastic and legally distinct."
  },
  {
    towerId: "doomscroller",
    displayName: "Infinite Feed Compression",
    multiplier: 1000,
    tierFiveCostRatio: 1.35,
    flavor: "The scroll has been optimized into a straight line."
  },
  {
    towerId: "meme_subreddit",
    displayName: "Front Page Relicensing",
    multiplier: 1000,
    tierFiveCostRatio: 1.55,
    flavor: "The repost policy is now a revenue strategy."
  },
  {
    towerId: "discord_mod",
    displayName: "Permission Stack Overflow",
    multiplier: 1000,
    tierFiveCostRatio: 1.78,
    flavor: "The roles have roles now."
  },
  {
    towerId: "tiktok_zoomer",
    displayName: "Vertical Velocity Breach",
    multiplier: 1000,
    tierFiveCostRatio: 2.05,
    flavor: "The clip is faster than the explanation."
  },
  {
    towerId: "meme_lord",
    displayName: "Crown Of Old Internet",
    multiplier: 1000,
    tierFiveCostRatio: 2.36,
    flavor: "The throne is deep-fried and extremely expensive."
  }
];

const CORE_UPGRADES = [
  {
    id: "power_click",
    displayName: "Click Boost",
    description: "Doubles flat click power and adds a growing share of tower production to every click.",
    type: "clickPower",
    baseCost: 100,
    costScale: 2.2,
    effect: {
      multiplier: 2,
      towerLpsSharePerLevel: 0.005,
      maxTowerLpsShare: 0.05
    },
    image: iconImage("icon 1 - Tower-baserede challenges.png"),
    unlockAt: {}
  },
  {
    id: "offline_capacity",
    displayName: "48 Hour Offline Production Capacity",
    description: "Lets part of your meme machine keep running while the app is closed, but only for the first 48 hours away.",
    type: "offlineProductionCapacity",
    baseCost: 50000,
    costScale: 1,
    tierCosts: [
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
    ],
    maxLevel: 10,
    effect: { capacityPerLevel: 0.05, maxCapacity: 0.5, maxOfflineSeconds: 60 * 60 * 48 },
    image: iconImage("icon 3 - Prestige og progression.png"),
    unlockAt: {}
  }
];

const OBSCURE_UPGRADES = [
  {
    id: "verified_fake_user",
    displayName: "Verified Fake User",
    description: "Fake subscriber bots have a small chance to become real subscribers when clicked. The checkmark is doing a lot of work.",
    type: "subscriberFakeConversion",
    category: "obscure",
    baseCost: 2500000,
    costScale: 1,
    maxLevel: 1,
    effect: { conversionChance: 0.1, amount: 1 },
    image: towerImage("Tower 5 - Botnet.png"),
    unlockAt: {
      towerId: "botnet",
      amount: 1,
      totalLikesEver: 2000000
    }
  },
  {
    id: "brainchip_autoclicker",
    displayName: "Brainchip Autoclicker",
    description: "A neural cursor sometimes darts out and collects a falling subscriber for you. Disturbingly helpful.",
    type: "subscriberAutoCollector",
    category: "obscure",
    baseCost: 25000000000000,
    costScale: 1,
    maxLevel: 1,
    effect: {
      autoCollectChance: 0.22,
      maxPerRaid: 1,
      delayMinMs: 900,
      delayMaxMs: 2500
    },
    image: iconImage("icon 1 - Tower-baserede challenges.png"),
    unlockAt: {
      towerId: "cursed_content_forge",
      amount: 1,
      totalLikesEver: 300000000
    }
  },
  {
    id: "doomscroll_surge",
    displayName: "Doomscroll Session",
    description: "Every so often a deeply unhealthy scrolling session panic-spikes your whole farm for 15 seconds. Terrible for focus. Excellent for LPS.",
    type: "randomLpsBoost",
    category: "obscure",
    baseCost: 75000000,
    costScale: 1,
    maxLevel: 1,
    effect: {
      triggerChancePerSecond: 0.0125,
      durationSeconds: 15,
      multipliers: [2, 3, 4, 5]
    },
    image: towerImage("Tower 6 - Doomscroller.png"),
    unlockAt: {
      towerId: "doomscroller",
      amount: 1
    }
  }
];

const TOWER_UPGRADES = TOWERS.flatMap((tower, index) => [
  ...createStandardTowerUpgrades(tower, index),
  createTowerSynergyUpgrade(tower, index)
]);

const SUBSCRIBER_SPAWN_UPGRADES = SUBSCRIBER_SPAWN_UPGRADE_TIERS.map(createSubscriberSpawnUpgrade);

const LEGACY_TOWER_UPGRADES = LEGACY_OVERCLOCKS.map(createLegacyTowerUpgrade).filter(Boolean);

export const UPGRADES = [
  ...CORE_UPGRADES,
  ...OBSCURE_UPGRADES,
  ...SUBSCRIBER_SPAWN_UPGRADES,
  ...TOWER_UPGRADES,
  ...LEGACY_TOWER_UPGRADES
];

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

function createStandardTowerUpgrades(tower, towerIndex) {
  const costMultipliers = getStandardTowerCostMultipliers(towerIndex);

  return costMultipliers.map((costMultiplier, index) => {
    const tier = index + 1;
    const unlockRequirement = STANDARD_TOWER_UNLOCK_REQUIREMENTS[index];
    const baseCost = Math.ceil(tower.baseCost * costMultiplier);

    return {
      id: `${tower.id}_double_${tier}`,
      displayName: `${getTowerUpgradeName(tower)} ${tier}`,
      description: `A one-time upgrade that doubles ${tower.displayName} LPS.`,
      type: "towerMultiplier",
      category: "standardTowerDouble",
      baseCost,
      costScale: 1,
      maxLevel: 1,
      effect: { towerId: tower.id, multiplier: 2 },
      image: tower.image,
      unlockAt: {
        towerId: tower.id,
        amount: unlockRequirement.amount,
        totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, baseCost * unlockRequirement.costRatio)),
        ...(tier > 1
          ? {
            upgradeId: `${tower.id}_double_${tier - 1}`,
            level: 1
          }
          : {})
      }
    };
  });
}

function createTowerSynergyUpgrade(tower, index) {
  const sourceTower = index === 0
    ? TOWERS[1]
    : TOWERS[index - 1];
  const perTowerBonus = 0.0125;
  const maxMultiplier = 10;
  const costMultiplier = getCrossfeedCostMultiplier(index);
  const baseCost = Math.ceil(tower.baseCost * costMultiplier);
  const countsAllOtherTowers = tower.id === "swirling_like_button";

  return {
    id: `${tower.id}_crossfeed_${sourceTower.id}`,
    displayName: `${tower.displayName} Crossfeed`,
    description: countsAllOtherTowers
      ? `${tower.displayName} gets +${formatPercent(perTowerBonus)} LPS for every other tower you own. No cap. The small button has unionized the entire shop.`
      : `${tower.displayName} gets +${formatPercent(perTowerBonus)} LPS for each ${sourceTower.displayName} owned, capped at x${maxMultiplier}.`,
    type: "towerAmountSynergy",
    baseCost,
    costScale: 1,
    maxLevel: 1,
    effect: {
      towerId: tower.id,
      sourceTowerId: sourceTower.id,
      multiplierPerSource: perTowerBonus,
      maxMultiplier: countsAllOtherTowers ? null : maxMultiplier,
      countsAllOtherTowers
    },
    image: tower.image,
    unlockAt: {
      towerId: tower.id,
      amount: 10,
      towerRequirements: [
        { towerId: tower.id, amount: 10 },
        { towerId: sourceTower.id, amount: 40 }
      ],
      totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, baseCost * 2))
    }
  };
}

function getCrossfeedCostMultiplier(towerIndex) {
  const progress = TOWERS.length > 1
    ? towerIndex / (TOWERS.length - 1)
    : 0;

  return CROSSFEED_FIRST_COST_MULTIPLIER * Math.pow(CROSSFEED_LAST_COST_MULTIPLIER / CROSSFEED_FIRST_COST_MULTIPLIER, progress);
}

function createLegacyTowerUpgrade(config) {
  const tower = TOWERS.find((item) => item.id === config.towerId);
  const towerIndex = TOWERS.findIndex((item) => item.id === config.towerId);

  if (!tower || towerIndex < 0) {
    return null;
  }

  const tierFiveMultiplier = getStandardTowerCostMultipliers(towerIndex)[4];
  const tierFiveCost = Math.ceil(tower.baseCost * tierFiveMultiplier);
  const baseCost = Math.ceil(tierFiveCost * config.tierFiveCostRatio);

  return {
    id: `${tower.id}_legacy_overclock`,
    displayName: config.displayName,
    description: `One late-game jolt that makes ${tower.displayName} LPS x${config.multiplier}. ${config.flavor}`,
    type: "towerMultiplier",
    category: "legacyOverclock",
    baseCost,
    costScale: 1,
    maxLevel: 1,
    effect: { towerId: tower.id, multiplier: config.multiplier },
    image: tower.image,
    unlockAt: {
      towerId: tower.id,
      amount: 25,
      totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, baseCost)),
      upgradeId: `${tower.id}_double_5`,
      level: 1
    }
  };
}

function getStandardTowerCostMultipliers(towerIndex) {
  return STANDARD_TOWER_COST_MULTIPLIERS[towerIndex] ?? STANDARD_TOWER_COST_MULTIPLIERS[STANDARD_TOWER_COST_MULTIPLIERS.length - 1];
}

function createSubscriberSpawnUpgrade(tierConfig) {
  return {
    id: `subscriber_spawn_${tierConfig.tier}`,
    displayName: `${tierConfig.name} ${tierConfig.tier}`,
    description: `A one-time upgrade that makes subscribers appear x${tierConfig.multiplier} more often.`,
    type: "subscriberBonus",
    category: "subscriberSpawn",
    baseCost: tierConfig.baseCost,
    costScale: 1,
    maxLevel: 1,
    effect: { spawnMultiplier: tierConfig.multiplier },
    image: iconImage("icon 5 - Specielle bonusser og events.png"),
    unlockAt: {
      totalLikesEver: tierConfig.unlockAt,
      ...(tierConfig.tier > 1
        ? {
          upgradeId: `subscriber_spawn_${tierConfig.tier - 1}`,
          level: 1
        }
        : {})
    }
  };
}

function getTowerUpgradeName(tower) {
  return TOWER_UPGRADE_NAMES[tower.id] ?? `${tower.displayName} Optimization`;
}

function formatPercent(value) {
  return `${Number((value * 100).toFixed(2))}%`;
}
