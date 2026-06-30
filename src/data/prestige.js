const prestigeImage = (fileName) => `../assets/images/prestiges/${fileName}`;

export const PRESTIGE_TIERS = [
  {
    level: 1,
    id: "containment_leak",
    image: prestigeImage("Prestige 1.png"),
    title: "Containment Leak",
    pinName: "Containment Leak Pin",
    towerLpsMultiplier: 2,
    clickPowerMultiplier: 2,
    description: "Your meme escaped the farm, tripped three alarms, and came back with a permanent public stain."
  },
  {
    level: 2,
    id: "algorithmic_coronation",
    image: prestigeImage("Prestige 2.png"),
    title: "Algorithmic Coronation",
    pinName: "Algorithmic Coronation Pin",
    towerLpsMultiplier: 4,
    clickPowerMultiplier: 4,
    description: "The feed crowned you in public, then immediately pretended this was always the plan."
  },
  {
    level: 3,
    id: "myth_of_the_feed",
    image: prestigeImage("Prestige 3.png"),
    title: "Myth of the Feed",
    pinName: "Myth of the Feed Pin",
    towerLpsMultiplier: 8,
    clickPowerMultiplier: 8,
    description: "Your account has become a cautionary legend used to frighten new platforms into compliance."
  }
];

export const PRESTIGE_MAX_LEVEL = PRESTIGE_TIERS.length;

export const PRESTIGE_TIER_BY_LEVEL = Object.fromEntries(
  PRESTIGE_TIERS.map((tier) => [tier.level, tier])
);
