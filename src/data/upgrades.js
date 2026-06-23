import { TOWERS } from "./towers.js";

const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
const iconImage = (fileName) => `../assets/images/icons/${fileName}`;

const STANDARD_TOWER_COST_MULTIPLIERS = [
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
    multiplier: 720,
    tierFiveCostRatio: 0.77,
    flavor: "Somehow the unpaid labor became load-bearing."
  },
  {
    towerId: "outdated_meme_reposter",
    displayName: "Ancient Format Renaissance",
    multiplier: 510,
    tierFiveCostRatio: 0.88,
    flavor: "The old template has discovered modern distribution."
  },
  {
    towerId: "edgy_teen",
    displayName: "Cringe Immunity Patch",
    multiplier: 370,
    tierFiveCostRatio: 1.02,
    flavor: "The phase did not pass; it scaled."
  },
  {
    towerId: "botnet",
    displayName: "Organic Looking Button",
    multiplier: 265,
    tierFiveCostRatio: 1.17,
    flavor: "Every account is suddenly very enthusiastic and legally distinct."
  },
  {
    towerId: "doomscroller",
    displayName: "Infinite Feed Compression",
    multiplier: 190,
    tierFiveCostRatio: 1.35,
    flavor: "The scroll has been optimized into a straight line."
  },
  {
    towerId: "meme_subreddit",
    displayName: "Front Page Relicensing",
    multiplier: 135,
    tierFiveCostRatio: 1.55,
    flavor: "The repost policy is now a revenue strategy."
  },
  {
    towerId: "discord_mod",
    displayName: "Permission Stack Overflow",
    multiplier: 100,
    tierFiveCostRatio: 1.78,
    flavor: "The roles have roles now."
  },
  {
    towerId: "tiktok_zoomer",
    displayName: "Vertical Velocity Breach",
    multiplier: 70,
    tierFiveCostRatio: 2.05,
    flavor: "The clip is faster than the explanation."
  },
  {
    towerId: "meme_lord",
    displayName: "Crown Of Old Internet",
    multiplier: 50,
    tierFiveCostRatio: 2.36,
    flavor: "The throne is deep-fried and extremely expensive."
  }
];

const CORE_UPGRADES = [
  {
    id: "power_click",
    displayName: "Click Boost",
    description: "Makes each meme button press hit harder. Still suspiciously manual.",
    type: "clickPower",
    baseCost: 100,
    costScale: 2.55,
    effect: { multiplier: 2 },
    image: towerImage("Tower 1 - Swirling Like Button.png"),
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

const TOWER_UPGRADES = TOWERS.flatMap((tower, index) => [
  ...createStandardTowerUpgrades(tower, index),
  createTowerSynergyUpgrade(tower, index)
]);

const SUBSCRIBER_SPAWN_UPGRADES = SUBSCRIBER_SPAWN_UPGRADE_TIERS.map(createSubscriberSpawnUpgrade);

const LEGACY_TOWER_UPGRADES = LEGACY_OVERCLOCKS.map(createLegacyTowerUpgrade).filter(Boolean);

export const UPGRADES = [
  ...CORE_UPGRADES,
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

  return {
    id: `${tower.id}_crossfeed_${sourceTower.id}`,
    displayName: `${tower.displayName} Crossfeed`,
    description: `${tower.displayName} gets +${formatPercent(perTowerBonus)} LPS for each ${sourceTower.displayName} owned, capped at x${maxMultiplier}.`,
    type: "towerAmountSynergy",
    baseCost,
    costScale: 1,
    maxLevel: 1,
    effect: {
      towerId: tower.id,
      sourceTowerId: sourceTower.id,
      multiplierPerSource: perTowerBonus,
      maxMultiplier
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
  return `${Math.round(value * 1000) / 10}%`;
}
