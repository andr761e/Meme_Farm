export const PRESTIGE_TIERS = [
  {
    level: 1,
    id: "containment_leak",
    symbol: "V1",
    title: "Containment Leak",
    pinName: "Containment Leak Pin",
    description: "Your meme escaped the farm, tripped three alarms, and came back with a permanent public stain."
  },
  {
    level: 2,
    id: "algorithmic_coronation",
    symbol: "V2",
    title: "Algorithmic Coronation",
    pinName: "Algorithmic Coronation Pin",
    description: "The feed crowned you in public, then immediately pretended this was always the plan."
  },
  {
    level: 3,
    id: "myth_of_the_feed",
    symbol: "V3",
    title: "Myth of the Feed",
    pinName: "Myth of the Feed Pin",
    description: "Your account has become a cautionary legend used to frighten new platforms into compliance."
  }
];

export const PRESTIGE_MAX_LEVEL = PRESTIGE_TIERS.length;

export const PRESTIGE_TIER_BY_LEVEL = Object.fromEntries(
  PRESTIGE_TIERS.map((tier) => [tier.level, tier])
);
