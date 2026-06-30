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
  }
];

const METRIC_BY_ID = Object.fromEntries(LEADERBOARD_METRICS.map((metric) => [metric.id, metric]));

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

export function getLeaderboardRows(state, { metricId = "total_likes_ever" } = {}) {
  const metric = getLeaderboardMetric(metricId);
  const playerScore = getLeaderboardMetricValue(state, metric.id);
  return [{
    id: "you",
    name: "You",
    score: playerScore,
    prestigeLevel: getPrestigeLevel(state),
    rank: null,
    isPlayer: true
  }];
}
