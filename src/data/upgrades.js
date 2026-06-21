import { TOWERS } from "./towers.js";

const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
const iconImage = (fileName) => `../assets/images/icons/${fileName}`;

const STANDARD_TOWER_TIERS = [
  { tier: 1, costMultiplier: 5, unlockMultiplier: 2 },
  { tier: 2, costMultiplier: 60, unlockMultiplier: 30 },
  { tier: 3, costMultiplier: 900, unlockMultiplier: 450 },
  { tier: 4, costMultiplier: 16000, unlockMultiplier: 8000 },
  { tier: 5, costMultiplier: 350000, unlockMultiplier: 175000 }
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
    description: "One late-game jolt that makes Swirling Like Button LPS x1000. The starter button refuses to become irrelevant."
  },
  {
    towerId: "shitposter_intern",
    displayName: "Intern Promoted To Lore",
    description: "One late-game jolt that makes Shitposter Intern LPS x1000. Somehow the unpaid labor became load-bearing."
  },
  {
    towerId: "outdated_meme_reposter",
    displayName: "Ancient Format Renaissance",
    description: "One late-game jolt that makes Outdated Meme Reposter LPS x1000. The old template has discovered modern distribution."
  },
  {
    towerId: "edgy_teen",
    displayName: "Cringe Immunity Patch",
    description: "One late-game jolt that makes Edgy Teen LPS x1000. The phase did not pass; it scaled."
  },
  {
    towerId: "botnet",
    displayName: "Organic Looking Button",
    description: "One late-game jolt that makes Botnet LPS x1000. Every account is suddenly very enthusiastic and legally distinct."
  },
  {
    towerId: "doomscroller",
    displayName: "Infinite Feed Compression",
    description: "One late-game jolt that makes Doomscroller LPS x1000. The scroll has been optimized into a straight line."
  },
  {
    towerId: "meme_subreddit",
    displayName: "Front Page Relicensing",
    description: "One late-game jolt that makes Meme Subreddit LPS x1000. The repost policy is now a revenue strategy."
  },
  {
    towerId: "discord_mod",
    displayName: "Permission Stack Overflow",
    description: "One late-game jolt that makes Discord Mod LPS x1000. The roles have roles now."
  },
  {
    towerId: "tiktok_zoomer",
    displayName: "Vertical Velocity Breach",
    description: "One late-game jolt that makes TikTok Zoomer LPS x1000. The clip is faster than the explanation."
  },
  {
    towerId: "meme_lord",
    displayName: "Crown Of Old Internet",
    description: "One late-game jolt that makes Meme Lord LPS x1000. The throne is deep-fried and extremely expensive."
  }
];

const CORE_UPGRADES = [
  {
    id: "power_click",
    displayName: "Click Boost",
    description: "Makes each meme button press hit harder. Still suspiciously manual.",
    type: "clickPower",
    baseCost: 100,
    costScale: 3.15,
    effect: { multiplier: 2 },
    image: towerImage("Tower 1 - Swirling Like Button.png"),
    unlockAt: {}
  },
  {
    id: "offline_capacity",
    displayName: "Offline Production Capacity",
    description: "Lets part of your meme machine keep running while the app is closed.",
    type: "offlineProductionCapacity",
    baseCost: 5000,
    costScale: 3.25,
    maxLevel: 10,
    effect: { capacityPerLevel: 0.05, maxCapacity: 0.5 },
    image: iconImage("icon 3 - Prestige og progression.png"),
    unlockAt: {}
  }
];

const TOWER_UPGRADES = TOWERS.flatMap((tower, index) => [
  ...createStandardTowerUpgrades(tower),
  createTowerSynergyUpgrade(tower, index)
]);

const LEGACY_TOWER_UPGRADES = LEGACY_OVERCLOCKS.map(createLegacyTowerUpgrade).filter(Boolean);

export const UPGRADES = [
  ...CORE_UPGRADES,
  ...TOWER_UPGRADES,
  ...LEGACY_TOWER_UPGRADES
];

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

function createStandardTowerUpgrades(tower) {
  return STANDARD_TOWER_TIERS.map(({ tier, costMultiplier, unlockMultiplier }) => ({
    id: `${tower.id}_double_${tier}`,
    displayName: `${getTowerUpgradeName(tower)} ${tier}`,
    description: `A one-time upgrade that doubles ${tower.displayName} LPS.`,
    type: "towerMultiplier",
    category: "standardTowerDouble",
    baseCost: Math.ceil(tower.baseCost * costMultiplier),
    costScale: 1,
    maxLevel: 1,
    effect: { towerId: tower.id, multiplier: 2 },
    image: tower.image,
    unlockAt: {
      towerId: tower.id,
      amount: 1,
      totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, tower.baseCost * unlockMultiplier)),
      ...(tier > 1
        ? {
          upgradeId: `${tower.id}_double_${tier - 1}`,
          level: 1
        }
        : {})
    }
  }));
}

function createTowerSynergyUpgrade(tower, index) {
  const sourceTower = index === 0
    ? TOWERS[1]
    : TOWERS[index - 1];
  const perTowerBonus = 0.0125;
  const maxMultiplier = 3;

  return {
    id: `${tower.id}_crossfeed_${sourceTower.id}`,
    displayName: `${tower.displayName} Crossfeed`,
    description: `${tower.displayName} gets +${formatPercent(perTowerBonus)} LPS for each ${sourceTower.displayName} owned, capped at x${maxMultiplier}.`,
    type: "towerAmountSynergy",
    baseCost: Math.ceil(tower.baseCost * 250),
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
      amount: 1,
      totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, tower.baseCost * 180))
    }
  };
}

function createLegacyTowerUpgrade(config) {
  const tower = TOWERS.find((item) => item.id === config.towerId);

  if (!tower) {
    return null;
  }

  return {
    id: `${tower.id}_legacy_overclock`,
    displayName: config.displayName,
    description: config.description,
    type: "towerMultiplier",
    category: "legacyOverclock",
    baseCost: Math.ceil(tower.baseCost * 5000000),
    costScale: 1,
    maxLevel: 1,
    effect: { towerId: tower.id, multiplier: 1000 },
    image: tower.image,
    unlockAt: {
      towerId: tower.id,
      amount: 25,
      totalLikesEver: Math.ceil(Math.max(tower.unlockAt?.totalLikesEver ?? 0, tower.baseCost * 2000000)),
      upgradeId: `${tower.id}_double_5`,
      level: 1
    }
  };
}

function getTowerUpgradeName(tower) {
  return TOWER_UPGRADE_NAMES[tower.id] ?? `${tower.displayName} Optimization`;
}

function formatPercent(value) {
  return `${Math.round(value * 1000) / 10}%`;
}
