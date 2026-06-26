import { ACHIEVEMENTS } from "./data/achievements.js";
import {
  getClickPower,
  getLikesPerSecond,
  getPrestigeLevel,
  getTotalTowersOwned
} from "./state.js";
import { formatNumber } from "./utils/format.js";

export const LEADERBOARD_SCOPES = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Steam Friends" }
];

export const LEADERBOARD_METRICS = [
  {
    id: "total_likes_ever",
    steamName: "MF_LIFETIME_LIKES",
    category: "Progress",
    label: "Lifetime Likes",
    description: "Best lifetime-like score preserved across Go Viral resets.",
    getValue: (state) => Math.max(state.leaderboardRecords?.totalLikesEver ?? 0, state.totalLikesEver)
  },
  {
    id: "highest_lps",
    steamName: "MF_PEAK_LPS",
    category: "Production",
    label: "Peak Likes Per Second",
    description: "Highest likes-per-second reached.",
    getValue: (state) => Math.max(state.leaderboardRecords?.highestLps ?? 0, state.stats?.bestLikesPerSecond ?? 0, getLikesPerSecond(state))
  },
  {
    id: "total_towers_owned",
    steamName: "MF_TOWERS_OWNED",
    category: "Progress",
    label: "Towers Owned",
    description: "Highest tower count reached before or after resets.",
    getValue: (state) => Math.max(state.leaderboardRecords?.totalTowersOwned ?? 0, getTotalTowersOwned(state))
  },
  {
    id: "milestones_unlocked",
    steamName: "MF_MILESTONES_UNLOCKED",
    category: "Progress",
    label: "Milestones Unlocked",
    description: "Total milestones unlocked.",
    getValue: (state) => Math.max(
      state.leaderboardRecords?.milestonesUnlocked ?? 0,
      ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.id]).length
    )
  },
  {
    id: "total_clicks",
    steamName: "MF_MEME_BUTTON_CLICKS",
    category: "Activity",
    label: "Meme Button Clicks",
    description: "Most manual meme button clicks preserved across resets.",
    getValue: (state) => Math.max(state.leaderboardRecords?.totalClicks ?? 0, state.totalClicks)
  },
  {
    id: "highest_click_power",
    steamName: "MF_PEAK_CLICK_POWER",
    category: "Production",
    label: "Peak Click Power",
    description: "Highest likes-per-click reached.",
    getValue: (state) => Math.max(state.leaderboardRecords?.highestClickPower ?? 1, state.stats?.bestClickPower ?? 1, getClickPower(state))
  },
  {
    id: "subscribers_collected",
    steamName: "MF_SUBSCRIBERS_COLLECTED",
    category: "Activity",
    label: "Subscribers Collected",
    description: "Most subscribers collected, preserved across resets.",
    getValue: (state) => Math.max(state.leaderboardRecords?.subscribersCollected ?? 0, state.totalSubscribersEver)
  },
  {
    id: "prestige_level",
    steamName: "MF_GO_VIRAL_PRESTIGE",
    category: "Progress",
    label: "Go Viral Prestige",
    description: "Highest public Go Viral pin earned.",
    getValue: (state) => Math.max(state.leaderboardRecords?.prestigeLevel ?? 0, getPrestigeLevel(state))
  }
];

const METRIC_BY_ID = Object.fromEntries(LEADERBOARD_METRICS.map((metric) => [metric.id, metric]));

const BASELINE_SCORES = {
  total_likes_ever: 1250000000,
  highest_lps: 1400000,
  total_towers_owned: 420,
  milestones_unlocked: 64,
  total_clicks: 25000,
  highest_click_power: 65536,
  subscribers_collected: 850,
  prestige_level: 1
};

const GLOBAL_PLAYERS = [
  { name: "Patch Notes Max", multiplier: 2.8, prestigeLevel: 3 },
  { name: "Clout Accountant", multiplier: 2.1, prestigeLevel: 2 },
  { name: "Deep Fried Dave", multiplier: 1.62, prestigeLevel: 2 },
  { name: "Algorithm Intern", multiplier: 1.18, prestigeLevel: 1 },
  { name: "AFK Baron", multiplier: 0.92, prestigeLevel: 1 },
  { name: "Trend Miner", multiplier: 0.66, prestigeLevel: 0 },
  { name: "JPEG Prophet", multiplier: 0.41, prestigeLevel: 0 }
];

const FRIEND_PLAYERS = [
  { name: "Steam Pal Zero", multiplier: 1.24, prestigeLevel: 1 },
  { name: "Queue Dodger", multiplier: 0.94, prestigeLevel: 0 },
  { name: "Lunch Break Legend", multiplier: 0.72, prestigeLevel: 0 },
  { name: "Wishlist Wizard", multiplier: 0.48, prestigeLevel: 0 }
];

export function getLeaderboardMetric(metricId) {
  return METRIC_BY_ID[metricId] ?? LEADERBOARD_METRICS[0];
}

export function getLeaderboardMetricValue(state, metricId) {
  return Math.floor(getLeaderboardMetric(metricId).getValue(state) ?? 0);
}

export function formatLeaderboardValue(metricId, value) {
  if (metricId === "prestige_level") {
    return value > 0 ? `Prestige ${formatNumber(value)}` : "No pin";
  }

  const suffix = metricId === "highest_lps"
    ? " LPS"
    : metricId === "highest_click_power"
      ? " / click"
      : "";

  return `${formatNumber(value)}${suffix}`;
}

export function getLeaderboardRows(state, { scope = "global", metricId = "total_likes_ever" } = {}) {
  const metric = getLeaderboardMetric(metricId);
  const players = scope === "friends" ? FRIEND_PLAYERS : GLOBAL_PLAYERS;
  const baseline = BASELINE_SCORES[metric.id] ?? 1000;
  const playerScore = getLeaderboardMetricValue(state, metric.id);

  const rows = players.map((player, index) => ({
    id: `${scope}-${metric.id}-${index}`,
    name: player.name,
    score: metric.id === "prestige_level"
      ? player.prestigeLevel ?? 0
      : Math.floor(baseline * player.multiplier),
    prestigeLevel: player.prestigeLevel ?? 0,
    isPlayer: false
  }));

  rows.push({
    id: "you",
    name: "You",
    score: playerScore,
    prestigeLevel: getPrestigeLevel(state),
    isPlayer: true
  });

  return rows
    .sort((first, second) => second.score - first.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
