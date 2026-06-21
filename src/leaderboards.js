import { ACHIEVEMENTS } from "./data/achievements.js";
import {
  getClickPower,
  getLikesPerSecond,
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
    description: "Total likes earned in this run.",
    getValue: (state) => state.totalLikesEver
  },
  {
    id: "highest_lps",
    steamName: "MF_PEAK_LPS",
    category: "Production",
    label: "Peak Likes Per Second",
    description: "Highest likes-per-second reached.",
    getValue: (state) => Math.max(state.stats?.bestLikesPerSecond ?? 0, getLikesPerSecond(state))
  },
  {
    id: "total_towers_owned",
    steamName: "MF_TOWERS_OWNED",
    category: "Progress",
    label: "Towers Owned",
    description: "Total production towers currently owned.",
    getValue: getTotalTowersOwned
  },
  {
    id: "milestones_unlocked",
    steamName: "MF_MILESTONES_UNLOCKED",
    category: "Progress",
    label: "Milestones Unlocked",
    description: "Total milestones unlocked.",
    getValue: (state) => ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.id]).length
  },
  {
    id: "total_clicks",
    steamName: "MF_MEME_BUTTON_CLICKS",
    category: "Activity",
    label: "Meme Button Clicks",
    description: "Total manual meme button clicks.",
    getValue: (state) => state.totalClicks
  },
  {
    id: "highest_click_power",
    steamName: "MF_PEAK_CLICK_POWER",
    category: "Production",
    label: "Peak Click Power",
    description: "Highest likes-per-click reached.",
    getValue: (state) => Math.max(state.stats?.bestClickPower ?? 1, getClickPower(state))
  },
  {
    id: "subscribers_collected",
    steamName: "MF_SUBSCRIBERS_COLLECTED",
    category: "Activity",
    label: "Subscribers Collected",
    description: "Total subscribers collected.",
    getValue: (state) => state.totalSubscribersEver
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
  subscribers_collected: 850
};

const GLOBAL_PLAYERS = [
  { name: "Patch Notes Max", multiplier: 2.8 },
  { name: "Clout Accountant", multiplier: 2.1 },
  { name: "Deep Fried Dave", multiplier: 1.62 },
  { name: "Algorithm Intern", multiplier: 1.18 },
  { name: "AFK Baron", multiplier: 0.92 },
  { name: "Trend Miner", multiplier: 0.66 },
  { name: "JPEG Prophet", multiplier: 0.41 }
];

const FRIEND_PLAYERS = [
  { name: "Steam Pal Zero", multiplier: 1.24 },
  { name: "Queue Dodger", multiplier: 0.94 },
  { name: "Lunch Break Legend", multiplier: 0.72 },
  { name: "Wishlist Wizard", multiplier: 0.48 }
];

export function getLeaderboardMetric(metricId) {
  return METRIC_BY_ID[metricId] ?? LEADERBOARD_METRICS[0];
}

export function getLeaderboardMetricValue(state, metricId) {
  return Math.floor(getLeaderboardMetric(metricId).getValue(state) ?? 0);
}

export function formatLeaderboardValue(metricId, value) {
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
    score: Math.floor(baseline * player.multiplier),
    isPlayer: false
  }));

  rows.push({
    id: "you",
    name: "You",
    score: playerScore,
    isPlayer: true
  });

  return rows
    .sort((first, second) => second.score - first.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
