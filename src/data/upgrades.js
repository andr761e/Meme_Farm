import { TOWERS } from "./towers.js";

const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
const iconImage = (fileName) => `../assets/images/icons/${fileName}`;

const STANDARD_TOWER_COST_MULTIPLIER_ENDPOINTS = [
  [22.5, 13.5],
  [390, 62.4],
  [7440, 372],
  [161000, 2300],
  [3840000, 16000]
];
const STANDARD_TOWER_UNLOCK_REQUIREMENTS = [
  { tier: 1, amount: 10, costRatio: 0.75 },
  { tier: 2, amount: 20, costRatio: 1 },
  { tier: 3, amount: 30, costRatio: 1.5 },
  { tier: 4, amount: 40, costRatio: 2.5 },
  { tier: 5, amount: 50, costRatio: 4 }
];
const CROSSFEED_FIRST_COST_MULTIPLIER = 30;
const CROSSFEED_LAST_COST_MULTIPLIER = 15;
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
    multiplier: 100,
    tierFiveCostRatio: 0.67,
    flavor: "The starter button refuses to become irrelevant."
  },
  {
    towerId: "shitposter_intern",
    displayName: "Intern Promoted To Lore",
    multiplier: 100,
    tierFiveCostRatio: 0.77,
    flavor: "Somehow the unpaid labor became load-bearing."
  },
  {
    towerId: "outdated_meme_reposter",
    displayName: "Ancient Format Renaissance",
    multiplier: 100,
    tierFiveCostRatio: 0.88,
    flavor: "The old template has discovered modern distribution."
  },
  {
    towerId: "edgy_teen",
    displayName: "Cringe Immunity Patch",
    multiplier: 100,
    tierFiveCostRatio: 1.02,
    flavor: "The phase did not pass; it scaled."
  },
  {
    towerId: "botnet",
    displayName: "Organic Looking Button",
    multiplier: 100,
    tierFiveCostRatio: 1.17,
    flavor: "Every account is suddenly very enthusiastic and legally distinct."
  },
  {
    towerId: "doomscroller",
    displayName: "Infinite Feed Compression",
    multiplier: 100,
    tierFiveCostRatio: 1.35,
    flavor: "The scroll has been optimized into a straight line."
  },
  {
    towerId: "meme_subreddit",
    displayName: "Front Page Relicensing",
    multiplier: 100,
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
    multiplier: 100,
    tierFiveCostRatio: 2.05,
    flavor: "The clip is faster than the explanation."
  },
  {
    towerId: "meme_lord",
    displayName: "Crown Of Old Internet",
    multiplier: 100,
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
    costScale: 2.20,
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
  const productionMultipliers = [2, 3, 4, 5, 6];

  return costMultipliers.map((costMultiplier, index) => {
    const tier = index + 1;
    const unlockRequirement = STANDARD_TOWER_UNLOCK_REQUIREMENTS[index];
    const baseCost = Math.ceil(tower.baseCost * costMultiplier);
    const productionMultiplier = productionMultipliers[index];

    return {
      id: `${tower.id}_double_${tier}`,
      legacyIds: (tower.retiredIds ?? []).map((retiredId) => `${retiredId}_double_${tier}`),
      displayName: `${getTowerUpgradeName(tower)} ${tier}`,
      description: `A one-time upgrade that multiplies ${tower.displayName} LPS by x${productionMultiplier}.`,
      type: "towerMultiplier",
      category: "standardTowerDouble",
      baseCost,
      costScale: 1,
      maxLevel: 1,
      effect: { towerId: tower.id, multiplier: productionMultiplier },
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
    legacyIds: tower.retiredCrossfeedIds ?? [],
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
  const progress = TOWERS.length > 1
    ? Math.max(0, Math.min(1, towerIndex / (TOWERS.length - 1)))
    : 0;

  return STANDARD_TOWER_COST_MULTIPLIER_ENDPOINTS.map(([first, last]) => (
    first * Math.pow(last / first, progress)
  ));
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
