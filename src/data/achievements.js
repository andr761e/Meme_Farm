import { TOWERS } from "./towers.js";
import { UPGRADES } from "./upgrades.js";
import { BAD_IDEA_BUTTON, MEME_LAB_BOOSTS } from "./memeLab.js";
import { PRESTIGE_TIERS } from "./prestige.js";
import {
  getClickPower,
  getLikesPerSecond,
  getPrestigeLevel,
  getTotalTowersOwned,
  getTowerAmount,
  getUpgradeLevel
} from "../state.js";

const TOWER_MILESTONE_COPY = {
  swirling_like_button: {
    title: "Orbital Liking",
    description: "Buy your first Swirling Like Button. It is not much, but it has entered orbit."
  },
  shitposter_intern: {
    title: "Unpaid Internship",
    description: "Hire a Shitposter Intern. HR has been replaced by a comment section."
  },
  outdated_meme_reposter: {
    title: "Ancient Meme Archaeology",
    description: "Buy an Outdated Meme Reposter. The ancient formats are restless."
  },
  edgy_teen: {
    title: "Parental Controls Failed",
    description: "Recruit an Edgy Teen. The Wi-Fi password was not enough to stop them."
  },
  botnet: {
    title: "Totally Organic",
    description: "Acquire a Botnet. Every account swears it is a real person."
  },
  doomscroller: {
    title: "Thumb Doom Loop",
    description: "Buy a Doomscroller. Engagement is up, posture is down."
  },
  meme_subreddit: {
    title: "Upvote Court",
    description: "Create a Meme Subreddit. The jury is loud, anonymous, and mostly wrong."
  },
  discord_mod: {
    title: "Permission Granted",
    description: "Buy a Discord Mod. Your meme now requires three roles and a rules channel."
  },
  tiktok_zoomer: {
    title: "Vertical Velocity",
    description: "Hire a TikTok Zoomer. The edit has six cuts before the joke starts."
  },
  meme_lord: {
    title: "The Crown Is Deep Fried",
    description: "Buy a Meme Lord. Royal decrees are now posted in Impact font."
  },
  ai_meme_generator: {
    title: "Promptly Regretted",
    description: "Buy an AI Meme Generator. It is confident, tireless, and spiritually confused."
  },
  internet_historian: {
    title: "Lore Accurate",
    description: "Recruit an Internet Historian. The meme now has a three-hour backstory."
  },
  viral_singularity: {
    title: "Event Horizon Posted",
    description: "Create a Viral Singularity. The algorithm can no longer look away."
  },
  cursed_content_forge: {
    title: "Do Not Open The PNG",
    description: "Buy a Cursed Content Forge. The file extension is more of a warning."
  },
  elons_meme_brainchip: {
    title: "Neural Tweet Installed",
    description: "Install Elon's Meme Brainchip. Thoughts now arrive with engagement metrics."
  },
  based_reality_distorter: {
    title: "Cringe Outlawed",
    description: "Buy a Based Reality Distorter. Reality has been ratioed into compliance."
  },
  meme_multiverse_server: {
    title: "Crosspost Cosmology",
    description: "Build a Meme Multiverse Server. Every timeline has seen the same joke now."
  },
  clout_god: {
    title: "Worship The Ratio",
    description: "Summon a Clout God. The like button has become devotional architecture."
  },
  boomer_facebook_group: {
    title: "Minion Market Fit",
    description: "Buy a Boomer Facebook Group. The caption says good morning. The numbers say profit."
  },
  irony_engine: {
    title: "Post-Ironic Horsepower",
    description: "Start an Irony Engine. Nobody knows if the meme is good, which means it is working."
  },
  fourchan_core_reactor: {
    title: "Containment Breach",
    description: "Activate a 4chan Core Reactor. Please keep all eyebrows inside the vehicle."
  },
  eternal_rickroll_loop: {
    title: "Never Gonna Desync",
    description: "Buy an Eternal Rickroll Loop. The internet has made a binding promise."
  },
  wojak_factory: {
    title: "Feels Assembly Line",
    description: "Open a Wojak Factory. Every emotion now has a production quota."
  },
  quantum_shitpost_array: {
    title: "All Timelines Posting",
    description: "Buy a Quantum Shitpost Array. The joke both landed and did not land."
  },
  copium_refinery: {
    title: "Industrial Cope",
    description: "Build a Copium Refinery. The tanks are full and the replies are glowing."
  },
  npc_overpopulation_center: {
    title: "Dialogue Tree Exhausted",
    description: "Buy an NPC Overpopulation Center. The replies are identical, but profitable."
  },
  nft_cemetery: {
    title: "Right Click Funeral",
    description: "Buy an NFT Cemetery. The JPEGs are gone, but the meme yield remains."
  },
  cringe_singularity: {
    title: "Dense Cringe Matter",
    description: "Create a Cringe Singularity. The cringe collapsed into raw power."
  },
  ceo_of_memes: {
    title: "Synergy Of Memes",
    description: "Hire the CEO of Memes. The quarterly report is just reaction images."
  },
  reality_glitcher: {
    title: "Slide Deck Inception",
    description: "Buy a Reality Glitcher. Your meme has appeared inside someone's presentation."
  },
  sigma_godfather: {
    title: "Grindset Patriarch",
    description: "Recruit the Sigma Godfather. Breakfast is now leverage."
  },
  multiversal_mod_team: {
    title: "Ban Hammer Across Space",
    description: "Hire a Multiversal Mod Team. Rule 1 applies in every dimension."
  },
  chrono_poster: {
    title: "Premature Posting",
    description: "Buy a Chrono-Poster. You posted the meme before the event happened."
  },
  memeconomist: {
    title: "GDP: Gross Dank Product",
    description: "Hire a Memeconomist. The market has priced in tomorrow's punchline."
  },
  zuckerbot_9000: {
    title: "Human Enough",
    description: "Buy Zuckerbot 9000. It blinked once, probably on purpose."
  },
  forbidden_archivist: {
    title: "Do Not Cite This Scroll",
    description: "Recruit The Forbidden Archivist. Some memes were deleted for a reason."
  },
  cursed_tiktok_cultist: {
    title: "3 AM Engagement Ritual",
    description: "Buy a Cursed TikTok Cultist. The comments are chanting in portrait mode."
  },
  meme_pope: {
    title: "Canonized Dankness",
    description: "Recruit The Meme Pope. Your worst post has been declared sacred."
  },
  ai_thinks_its_funny: {
    title: "Laugh Track Compiled",
    description: "Buy AI That Thinks It's Funny. It does not get the joke. It scales anyway."
  },
  the_algorithm: {
    title: "Final Boss Hired",
    description: "Buy The Algorithm Itself. You have acquired the thing that was judging you."
  }
};

const CORE_MILESTONES = [
  {
    id: "first_click",
    title: "First Click",
    description: "Post one meme. History regrets nothing.",
    icon: "1",
    isUnlocked: (state) => state.totalClicks >= 1
  },
  {
    id: "clicks_10",
    title: "Ten Tiny Posts",
    description: "Click the meme button 10 times. Manual labor, but make it digital.",
    icon: "10",
    isUnlocked: (state) => state.totalClicks >= 10
  },
  {
    id: "clicks_100",
    title: "Mouse Button Stress Test",
    description: "Click 100 times. The button is beginning to understand fear.",
    icon: "100",
    isUnlocked: (state) => state.totalClicks >= 100
  },
  {
    id: "clicks_1000",
    title: "Artisanal Engagement",
    description: "Click 1,000 times. Every like was handmade in a small batch.",
    icon: "1K",
    isUnlocked: (state) => state.totalClicks >= 1000
  },
  {
    id: "clicks_10000",
    title: "Carpal Tunnel Any Percent",
    description: "Click 10,000 times. Speedrunners fear your dedication.",
    icon: "10K",
    isUnlocked: (state) => state.totalClicks >= 10000
  },
  {
    id: "clicks_100000",
    title: "Finger Of Theseus",
    description: "Click 100,000 times. Is it still the same finger? Philosophers refuse to answer.",
    icon: "100K",
    isUnlocked: (state) => state.totalClicks >= 100000
  },
  {
    id: "likes_100",
    title: "100 Likes",
    description: "The group chat has noticed.",
    icon: "100",
    isUnlocked: (state) => state.totalLikesEver >= 100
  },
  {
    id: "likes_1000",
    title: "1,000 Likes",
    description: "The algorithm coughs politely.",
    icon: "1K",
    isUnlocked: (state) => state.totalLikesEver >= 1000
  },
  {
    id: "likes_10000",
    title: "Certified Poster",
    description: "Earn 10,000 total likes. Your posts now have regional influence.",
    icon: "10K",
    isUnlocked: (state) => state.totalLikesEver >= 10000
  },
  {
    id: "likes_100000",
    title: "Main Character Arc",
    description: "Earn 100,000 total likes. The feed has started making eye contact.",
    icon: "100K",
    isUnlocked: (state) => state.totalLikesEver >= 100000
  },
  {
    id: "likes_1000000",
    title: "Million Like Malware",
    description: "Earn 1,000,000 total likes. It spreads, but in a fun way.",
    icon: "1M",
    isUnlocked: (state) => state.totalLikesEver >= 1000000
  },
  {
    id: "likes_10000000",
    title: "Viral Monarchy",
    description: "Earn 10,000,000 total likes. The peasants demand more posts.",
    icon: "10M",
    isUnlocked: (state) => state.totalLikesEver >= 10000000
  },
  {
    id: "likes_100000000",
    title: "Content Industrialist",
    description: "Earn 100,000,000 total likes. A factory whistle now plays when you post.",
    icon: "100M",
    isUnlocked: (state) => state.totalLikesEver >= 100000000
  },
  {
    id: "likes_1000000000",
    title: "Algorithmic Overlord",
    description: "Earn 1,000,000,000 total likes. The algorithm reports directly to you.",
    icon: "1B",
    isUnlocked: (state) => state.totalLikesEver >= 1000000000
  },
  {
    id: "likes_1000000000000",
    title: "Trillion Like Incident",
    description: "Earn 1,000,000,000,000 total likes. Several dashboards have gone silent.",
    icon: "1T",
    isUnlocked: (state) => state.totalLikesEver >= 1000000000000
  },
  {
    id: "first_tower",
    title: "First Tower",
    description: "Outsourcing begins. Morale drops. LPS rises.",
    icon: "T1",
    isUnlocked: (state) => getTotalTowersOwned(state) >= 1
  },
  {
    id: "ten_towers",
    title: "10 Towers",
    description: "This is no longer a hobby. This is a content mill.",
    icon: "10T",
    isUnlocked: (state) => getTotalTowersOwned(state) >= 10
  },
  {
    id: "towers_100",
    title: "One Hundred Tiny Machines",
    description: "Own 100 towers total. The farm is making fan noise.",
    icon: "100T",
    isUnlocked: (state) => getTotalTowersOwned(state) >= 100
  },
  {
    id: "towers_500",
    title: "Server Room Smell",
    description: "Own 500 towers total. Nobody knows where the heat is coming from.",
    icon: "500T",
    isUnlocked: (state) => getTotalTowersOwned(state) >= 500
  },
  {
    id: "towers_1000",
    title: "The Content Mill Has Teeth",
    description: "Own 1,000 towers total. The machinery is posting while you sleep.",
    icon: "1KT",
    isUnlocked: (state) => getTotalTowersOwned(state) >= 1000
  },
  {
    id: "first_five_towers",
    title: "Starter Pack Complete",
    description: "Own at least one of each of the first five towers. The early internet starter kit is assembled.",
    icon: "5T",
    isUnlocked: (state) => ownsFirstTowers(state, 5)
  },
  {
    id: "all_towers_first",
    title: "Full Roster Of Regret",
    description: "Own at least one of every tower. The whole internet has clocked in.",
    icon: "ALL",
    isUnlocked: (state) => ownsAllTowers(state)
  },
  {
    id: "first_subscriber",
    title: "First Subscriber",
    description: "Someone clicked follow. Nobody knows why.",
    icon: "SUB",
    isUnlocked: (state) => state.totalSubscribersEver >= 1
  },
  {
    id: "subscribers_10",
    title: "Parasocial Seed Round",
    description: "Collect 10 subscribers. The audience is small, but emotionally available.",
    icon: "10S",
    isUnlocked: (state) => state.totalSubscribersEver >= 10
  },
  {
    id: "subscribers_69",
    title: "Numerically Obligated",
    description: "Collect 69 subscribers. Nice. Contractually, we had to include this.",
    icon: "69",
    isUnlocked: (state) => state.totalSubscribersEver >= 69
  },
  {
    id: "subscribers_420",
    title: "Smoke Signal Boost",
    description: "Collect 420 subscribers. The engagement cloud is visible from orbit.",
    icon: "420",
    isUnlocked: (state) => state.totalSubscribersEver >= 420
  },
  {
    id: "subscribers_1000",
    title: "Micro-Influencer Incident",
    description: "Collect 1,000 subscribers. Someone has asked for a media kit.",
    icon: "1KS",
    isUnlocked: (state) => state.totalSubscribersEver >= 1000
  },
  {
    id: "super_subscriber_jackpot",
    title: "Verified By Mistake",
    description: "Collect a 1-in-1,000 Super Subscriber. The fake account was somehow the realest one here.",
    icon: "SSS",
    isUnlocked: (state) => (state.stats?.superSubscribersCollected ?? 0) >= 1
  },
  {
    id: "twenty_lps",
    title: "20 LPS",
    description: "The meme stream has measurable velocity.",
    icon: "LPS",
    isUnlocked: (state) => getLikesPerSecond(state) >= 20
  },
  {
    id: "lps_1000",
    title: "Like Hose",
    description: "Reach 1,000 Likes per second. The faucet is stuck open.",
    icon: "1K",
    isUnlocked: (state) => getLikesPerSecond(state) >= 1000
  },
  {
    id: "lps_1000000",
    title: "Engagement Weather System",
    description: "Reach 1,000,000 Likes per second. Bring an umbrella.",
    icon: "1M",
    isUnlocked: (state) => getLikesPerSecond(state) >= 1000000
  },
  {
    id: "lps_1000000000",
    title: "Billion Per Second Brain Fry",
    description: "Reach 1,000,000,000 Likes per second. Numbers have become decorative.",
    icon: "1B",
    isUnlocked: (state) => getLikesPerSecond(state) >= 1000000000
  },
  {
    id: "lps_1000000000000",
    title: "Trillion LPS Mainframe Scream",
    description: "Reach 1,000,000,000,000 Likes per second. The graph needs a bigger wall.",
    icon: "1T",
    isUnlocked: (state) => getLikesPerSecond(state) >= 1000000000000
  },
  {
    id: "click_power_16",
    title: "Thick Clicks",
    description: "Reach 16 Likes per click. The button has gained mass.",
    icon: "x16",
    isUnlocked: (state) => getClickPower(state) >= 16
  },
  {
    id: "click_power_1024",
    title: "Kiloclick",
    description: "Reach 1,024 Likes per click. A very computer-shaped number.",
    icon: "1K",
    isUnlocked: (state) => getClickPower(state) >= 1024
  },
  {
    id: "click_power_1048576",
    title: "Megaclick Ritual",
    description: "Reach 1,048,576 Likes per click. The button now has patch notes.",
    icon: "1M",
    isUnlocked: (state) => getClickPower(state) >= 1048576
  },
  {
    id: "click_boost_5",
    title: "Click Boost Warmup",
    description: "Reach Click Boost level 5. The button has started lifting.",
    icon: "CB5",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 5
  },
  {
    id: "click_boost_10",
    title: "Click Boost Enjoyer",
    description: "Reach Click Boost level 10. Doubling is a lifestyle.",
    icon: "CB10",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 10
  },
  {
    id: "click_boost_25",
    title: "Exponent Chaos Mode",
    description: "Reach Click Boost level 25. The number has left polite society.",
    icon: "CB25",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 25
  },
  {
    id: "click_boost_50",
    title: "The Double Never Dies",
    description: "Reach Click Boost level 50. Somewhere, a calculator has resigned.",
    icon: "CB50",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 50
  },
  {
    id: "click_boost_75",
    title: "Button With Tenure",
    description: "Reach Click Boost level 75. The clicker economy has entered senior management.",
    icon: "CB75",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 75
  },
  {
    id: "click_boost_100",
    title: "Century Of Clicking",
    description: "Reach Click Boost level 100. Manual input has become a strategic weapon.",
    icon: "CB100",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 100
  },
  {
    id: "click_boost_150",
    title: "The Button Is A Department",
    description: "Reach Click Boost level 150. The button now needs its own budget meeting.",
    icon: "CB150",
    isUnlocked: (state) => getUpgradeLevel(state, "power_click") >= 150
  },
  {
    id: "upgrade_levels_25",
    title: "Patch Notes With Teeth",
    description: "Buy 25 total upgrade levels. The build is starting to have opinions.",
    icon: "U25",
    isUnlocked: (state) => getTotalUpgradeLevels(state) >= 25
  },
  {
    id: "upgrade_levels_100",
    title: "Balance Designer Nightmare",
    description: "Buy 100 total upgrade levels. The spreadsheet has begun bargaining.",
    icon: "U100",
    isUnlocked: (state) => getTotalUpgradeLevels(state) >= 100
  },
  {
    id: "click_likes_1000",
    title: "Hand-Cranked Clout",
    description: "Earn 1,000 Likes from clicking. Pure manual posting energy.",
    icon: "HC",
    isUnlocked: (state) => state.totalLikesFromClicks >= 1000
  },
  {
    id: "click_likes_1000000",
    title: "Manual Millionaire",
    description: "Earn 1,000,000 Likes from clicking. Automation watched in silence.",
    icon: "HM",
    isUnlocked: (state) => state.totalLikesFromClicks >= 1000000
  },
  {
    id: "tower_produced_1000000",
    title: "Factory Floor Verified",
    description: "Have towers produce 1,000,000 Likes total. The machines have found rhythm.",
    icon: "FP",
    isUnlocked: (state) => getTotalTowerProduced(state) >= 1000000
  },
  {
    id: "tower_produced_1000000000",
    title: "Industrial Meme Fog",
    description: "Have towers produce 1,000,000,000 Likes total. Visibility is low near the content stacks.",
    icon: "IF",
    isUnlocked: (state) => getTotalTowerProduced(state) >= 1000000000
  },
  {
    id: "offline_1000",
    title: "Posted While Unsuspecting",
    description: "Earn at least 1,000 Likes while away. The farm does not respect bedtime.",
    icon: "AFK",
    isUnlocked: (state) => (state.stats?.offlineLikesEarned ?? 0) >= 1000
  },
  {
    id: "playtime_1h",
    title: "One Hour Of Internet",
    description: "Play for 1 hour. It was supposed to be a quick check-in.",
    icon: "1H",
    isUnlocked: (state) => state.playTimeSeconds >= 3600
  },
  {
    id: "playtime_24h",
    title: "The Tab Has Citizenship",
    description: "Play for 24 hours. This process now has tenant rights.",
    icon: "24H",
    isUnlocked: (state) => state.playTimeSeconds >= 86400
  }
];

const TOWER_PURCHASE_MILESTONES = TOWERS.map((tower, index) => {
  const copy = TOWER_MILESTONE_COPY[tower.id] ?? {
    title: `First ${tower.displayName}`,
    description: `Buy your first ${tower.displayName}. The catalog grows more suspicious.`
  };

  return {
    id: `tower_${tower.id}_first`,
    title: copy.title,
    description: copy.description,
    icon: `T${index + 1}`,
    isUnlocked: (state) => getTowerAmount(state, tower.id) >= 1
  };
});

const TOWER_AMOUNT_THRESHOLDS = [10, 25, 50, 100];
const LIKE_BUTTON_AMOUNT_THRESHOLDS = [
  {
    amount: 250,
    title: "Button District",
    description: "Own 250 Swirling Like Buttons. The starter tower has developed urban planning."
  },
  {
    amount: 500,
    title: "Like Button Weather",
    description: "Own 500 Swirling Like Buttons. Forecast: scattered engagement with a chance of broken UI."
  },
  {
    amount: 1000,
    title: "A Thousand Tiny Approvals",
    description: "Own 1,000 Swirling Like Buttons. The original idea has become heavy infrastructure."
  }
];

const TOWER_AMOUNT_MILESTONES = TOWERS.flatMap((tower, index) => TOWER_AMOUNT_THRESHOLDS.map((amount) => ({
  id: `tower_${tower.id}_${amount}`,
  title: getTowerAmountTitle(tower, amount),
  description: getTowerAmountDescription(tower, amount),
  icon: `T${index + 1}-${formatCompactAmount(amount)}`,
  isUnlocked: (state) => getTowerAmount(state, tower.id) >= amount
})));

const LIKE_BUTTON_AMOUNT_MILESTONES = LIKE_BUTTON_AMOUNT_THRESHOLDS.map((milestone) => ({
  id: `tower_swirling_like_button_${milestone.amount}`,
  title: milestone.title,
  description: milestone.description,
  icon: `LB-${formatCompactAmount(milestone.amount)}`,
  isUnlocked: (state) => getTowerAmount(state, "swirling_like_button") >= milestone.amount
}));

const TOWER_TIER_FIVE_MILESTONES = TOWERS.map((tower, index) => ({
  id: `upgrade_${tower.id}_double_5`,
  title: `${tower.displayName} Level 5`,
  description: `Buy ${tower.displayName}'s fifth standard LPS upgrade. This tower has completed its formal overclocking paperwork.`,
  icon: `U5-${index + 1}`,
  isUnlocked: (state) => getUpgradeLevel(state, `${tower.id}_double_5`) >= 1
}));

const TOWER_CROSSFEED_MILESTONES = TOWERS.map((tower, index) => {
  const sourceTower = getCrossfeedSourceTower(index);

  return {
    id: `upgrade_${tower.id}_crossfeed`,
    title: `${tower.displayName} Crossfeed`,
    description: `Buy ${tower.displayName} Crossfeed. It now gets stronger from your ${sourceTower.displayName} count, which is definitely normal engineering.`,
    icon: `XF-${index + 1}`,
    isUnlocked: (state) => getUpgradeLevel(state, getCrossfeedUpgradeId(tower, sourceTower)) >= 1
  };
});

const LEGACY_OVERCLOCK_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock");
const SUBSCRIBER_SPAWN_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === "subscriberSpawn");
const OBSCURE_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === "obscure");

const LEGACY_OVERCLOCK_MILESTONES = LEGACY_OVERCLOCK_UPGRADES.map((upgrade, index) => {
  const tower = TOWERS.find((item) => item.id === upgrade.effect.towerId);

  return {
    id: `upgrade_${upgrade.id}`,
    title: upgrade.displayName,
    description: `Buy ${upgrade.displayName}. ${tower?.displayName ?? "This tower"} gets a x${upgrade.effect.multiplier} late-game relevance arc.`,
    icon: `LO-${index + 1}`,
    isUnlocked: (state) => getUpgradeLevel(state, upgrade.id) >= 1
  };
});

const MEME_LAB_BOOST_MILESTONES = MEME_LAB_BOOSTS.map((boost, index) => ({
  id: `meme_lab_boost_${boost.id}`,
  title: `${boost.name} Bribe`,
  description: `Buy ${boost.name} from Algorithm Bribe at least once. The algorithm remains officially neutral.`,
  icon: `AB-${index + 1}`,
  isUnlocked: (state) => getLabBoostPurchaseCount(state, boost.id) >= 1
}));

const BAD_IDEA_OUTCOME_MILESTONES = BAD_IDEA_BUTTON.outcomes
  .filter((outcome) => outcome.type !== "nothing")
  .map((outcome, index) => ({
    id: `bad_idea_outcome_${outcome.id}`,
    title: outcome.name,
    description: `Get "${outcome.name}" from the Bad Idea Button. Research has produced consequences.`,
    icon: `BI-${index + 1}`,
    isUnlocked: (state) => getBadIdeaOutcomeCount(state, outcome.id) >= 1
  }));

const MEME_LAB_COLLECTION_MILESTONES = [
  {
    id: "meme_lab_first_bribe",
    title: "Subscriber Lobbying",
    description: "Buy your first Algorithm Bribe. Democracy trembles before temporary multipliers.",
    icon: "AB1",
    isUnlocked: (state) => getTotalLabBoostPurchases(state) >= 1
  },
  {
    id: "meme_lab_10_bribes",
    title: "Bribe Punch Card",
    description: "Buy 10 Algorithm Bribes total. The algorithm knows your coffee order now.",
    icon: "AB10",
    isUnlocked: (state) => getTotalLabBoostPurchases(state) >= 10
  },
  {
    id: "meme_lab_50_bribes",
    title: "Sponsored Existence",
    description: "Buy 50 Algorithm Bribes total. Your feed is now mostly receipts.",
    icon: "AB50",
    isUnlocked: (state) => getTotalLabBoostPurchases(state) >= 50
  },
  {
    id: "meme_lab_all_bribes",
    title: "Full Bribe Sampler",
    description: "Buy every Algorithm Bribe type at least once. The menu has been thoroughly compromised.",
    icon: "ABALL",
    isUnlocked: (state) => MEME_LAB_BOOSTS.every((boost) => getLabBoostPurchaseCount(state, boost.id) >= 1)
  },
  {
    id: "bad_idea_first_press",
    title: "Surely This Is Fine",
    description: "Press the Bad Idea Button once. The lab notes begin with a warning label.",
    icon: "BI1",
    isUnlocked: (state) => getBadIdeaPressCount(state) >= 1
  },
  {
    id: "bad_idea_10_presses",
    title: "Repeatable Mistake",
    description: "Press the Bad Idea Button 10 times. At some point this became methodology.",
    icon: "BI10",
    isUnlocked: (state) => getBadIdeaPressCount(state) >= 10
  },
  {
    id: "bad_idea_50_presses",
    title: "Peer Reviewed Regret",
    description: "Press the Bad Idea Button 50 times. The lab has published findings nobody requested.",
    icon: "BI50",
    isUnlocked: (state) => getBadIdeaPressCount(state) >= 50
  },
  {
    id: "bad_idea_every_outcome",
    title: "Consequence Collector",
    description: "Trigger every non-empty Bad Idea Button outcome at least once. The control group has left.",
    icon: "BIALL",
    isUnlocked: (state) => BAD_IDEA_BUTTON.outcomes
      .filter((outcome) => outcome.type !== "nothing")
      .every((outcome) => getBadIdeaOutcomeCount(state, outcome.id) >= 1)
  },
  {
    id: "meme_lab_250_subscribers_spent",
    title: "Subscriber Expense Account",
    description: "Spend 250 subscribers in Meme Lab programs. The receipts are mostly vibes.",
    icon: "ML250",
    isUnlocked: (state) => getLabSubscribersSpent(state) >= 250
  },
  {
    id: "meme_lab_1000_subscribers_spent",
    title: "Lab Budget Incident",
    description: "Spend 1,000 subscribers in Meme Lab programs. Finance has muted the channel.",
    icon: "ML1K",
    isUnlocked: (state) => getLabSubscribersSpent(state) >= 1000
  }
];

const SUBSCRIBER_UPGRADE_MILESTONES = [
  {
    id: "subscriber_spawn_all_5",
    title: "Notification Weather System",
    description: "Buy all 5 Subscriber Spawn upgrades. The followers are now arriving with meteorological confidence.",
    icon: "SUB5",
    isUnlocked: (state) => SUBSCRIBER_SPAWN_UPGRADES.every((upgrade) => getUpgradeLevel(state, upgrade.id) >= 1)
  }
];

const OBSCURE_UPGRADE_MILESTONES = OBSCURE_UPGRADES.map((upgrade, index) => ({
  id: `upgrade_${upgrade.id}`,
  title: upgrade.displayName,
  description: `Buy ${upgrade.displayName}. The upgrade tab has started stocking suspicious side hustles.`,
  icon: `OB-${index + 1}`,
  isUnlocked: (state) => getUpgradeLevel(state, upgrade.id) >= 1
}));

const UPGRADE_COLLECTION_MILESTONES = [
  {
    id: "tower_level_5_first",
    title: "Fifth Upgrade Fever",
    description: "Buy the fifth standard LPS upgrade for any tower. One tower has officially gone too far.",
    icon: "U5",
    isUnlocked: (state) => getTowerTierFiveUpgradeCount(state) >= 1
  },
  {
    id: "tower_level_5_10",
    title: "Ten Fully Overclocked Towers",
    description: "Buy the fifth standard LPS upgrade for 10 different towers. The upgrade tab is sweating.",
    icon: "10U",
    isUnlocked: (state) => getTowerTierFiveUpgradeCount(state) >= 10
  },
  {
    id: "tower_level_5_all",
    title: "Every Tower Has A Fifth Gear",
    description: "Buy the fifth standard LPS upgrade for every tower. The entire farm has become a patch note.",
    icon: "ALL5",
    isUnlocked: (state) => getTowerTierFiveUpgradeCount(state) >= TOWERS.length
  },
  {
    id: "crossfeed_first",
    title: "Suspicious Dependency Graph",
    description: "Buy any Crossfeed upgrade. One tower is now feeding off another tower's headcount.",
    icon: "XF1",
    isUnlocked: (state) => getCrossfeedUpgradeCount(state) >= 1
  },
  {
    id: "crossfeed_10",
    title: "Spaghetti Economy",
    description: "Buy 10 Crossfeed upgrades. The upgrade graph is now making its own decisions.",
    icon: "XF10",
    isUnlocked: (state) => getCrossfeedUpgradeCount(state) >= 10
  },
  {
    id: "crossfeed_all",
    title: "The Synergy Web Is Complete",
    description: "Buy every Crossfeed upgrade. Every tower is now suspiciously dependent on another tower.",
    icon: "XFALL",
    isUnlocked: (state) => getCrossfeedUpgradeCount(state) >= TOWERS.length
  },
  {
    id: "legacy_overclock_first",
    title: "Old Content, New Engine",
    description: "Buy any Legacy Overclock. A weak tower has found the late-game gym.",
    icon: "LO1",
    isUnlocked: (state) => getLegacyOverclockUpgradeCount(state) >= 1
  },
  {
    id: "legacy_overclock_5",
    title: "Starter Pack Revenge Tour",
    description: "Buy 5 Legacy Overclocks. The early towers are back and charging appearance fees.",
    icon: "LO5",
    isUnlocked: (state) => getLegacyOverclockUpgradeCount(state) >= 5
  },
  {
    id: "legacy_overclock_all",
    title: "No Tower Left Behind",
    description: "Buy every Legacy Overclock. The low-level roster has successfully argued for relevance.",
    icon: "LOALL",
    isUnlocked: (state) => getLegacyOverclockUpgradeCount(state) >= LEGACY_OVERCLOCK_UPGRADES.length
  }
];

const PRESTIGE_MILESTONES = PRESTIGE_TIERS.map((tier) => ({
  id: `prestige_${tier.level}`,
  title: tier.pinName,
  description: `Go Viral and earn the ${tier.pinName}. Your run is gone, but the public record has become louder.`,
  icon: tier.symbol,
  isUnlocked: (state) => getPrestigeLevel(state) >= tier.level
}));

export const ACHIEVEMENTS = [
  ...CORE_MILESTONES,
  ...TOWER_PURCHASE_MILESTONES,
  ...TOWER_AMOUNT_MILESTONES,
  ...LIKE_BUTTON_AMOUNT_MILESTONES,
  ...TOWER_TIER_FIVE_MILESTONES,
  ...TOWER_CROSSFEED_MILESTONES,
  ...LEGACY_OVERCLOCK_MILESTONES,
  ...MEME_LAB_BOOST_MILESTONES,
  ...BAD_IDEA_OUTCOME_MILESTONES,
  ...MEME_LAB_COLLECTION_MILESTONES,
  ...SUBSCRIBER_UPGRADE_MILESTONES,
  ...OBSCURE_UPGRADE_MILESTONES,
  ...UPGRADE_COLLECTION_MILESTONES,
  ...PRESTIGE_MILESTONES
];

function ownsFirstTowers(state, count) {
  return TOWERS.slice(0, count).every((tower) => getTowerAmount(state, tower.id) >= 1);
}

function ownsAllTowers(state) {
  return TOWERS.every((tower) => getTowerAmount(state, tower.id) >= 1);
}

function getTotalUpgradeLevels(state) {
  return Object.values(state.upgrades ?? {}).reduce((sum, upgrade) => sum + (upgrade.level ?? 0), 0);
}

function getTotalTowerProduced(state) {
  return Object.values(state.towers ?? {}).reduce((sum, tower) => sum + (tower.totalProduced ?? 0), 0);
}

function getTowerTierFiveUpgradeCount(state) {
  return TOWERS.reduce(
    (count, tower) => count + (getUpgradeLevel(state, `${tower.id}_double_5`) >= 1 ? 1 : 0),
    0
  );
}

function getCrossfeedUpgradeCount(state) {
  return TOWERS.reduce((count, tower, index) => {
    const sourceTower = getCrossfeedSourceTower(index);
    return count + (getUpgradeLevel(state, getCrossfeedUpgradeId(tower, sourceTower)) >= 1 ? 1 : 0);
  }, 0);
}

function getLegacyOverclockUpgradeCount(state) {
  return LEGACY_OVERCLOCK_UPGRADES.reduce(
    (count, upgrade) => count + (getUpgradeLevel(state, upgrade.id) >= 1 ? 1 : 0),
    0
  );
}

function getTotalLabBoostPurchases(state) {
  return state.lab?.totalBoostsPurchased ?? 0;
}

function getLabBoostPurchaseCount(state, boostId) {
  return state.lab?.boostPurchaseCounts?.[boostId] ?? 0;
}

function getBadIdeaPressCount(state) {
  return state.lab?.badIdeaPresses ?? 0;
}

function getBadIdeaOutcomeCount(state, outcomeId) {
  return state.lab?.badIdeaOutcomeCounts?.[outcomeId] ?? 0;
}

function getLabSubscribersSpent(state) {
  return state.lab?.subscribersSpent ?? 0;
}

function getCrossfeedSourceTower(index) {
  return index === 0
    ? TOWERS[1]
    : TOWERS[index - 1];
}

function getCrossfeedUpgradeId(tower, sourceTower) {
  return `${tower.id}_crossfeed_${sourceTower.id}`;
}

function getTowerAmountTitle(tower, amount) {
  if (tower.id === "swirling_like_button") {
    return `${formatDisplayAmount(amount)}x Like Button`;
  }

  return `${formatDisplayAmount(amount)}x ${tower.displayName}`;
}

function getTowerAmountDescription(tower, amount) {
  if (amount >= 100) {
    return `Own ${formatDisplayAmount(amount)} ${tower.displayName} towers. At this point it is less a purchase and more a municipal department.`;
  }

  if (amount >= 50) {
    return `Own ${formatDisplayAmount(amount)} ${tower.displayName} towers. The payroll has started asking difficult questions.`;
  }

  if (amount >= 25) {
    return `Own ${formatDisplayAmount(amount)} ${tower.displayName} towers. A suspiciously specific amount of commitment.`;
  }

  return `Own ${formatDisplayAmount(amount)} ${tower.displayName} towers. The bit has officially become a system.`;
}

function formatDisplayAmount(amount) {
  return amount.toLocaleString("en-US");
}

function formatCompactAmount(amount) {
  if (amount >= 1000) {
    return `${amount / 1000}K`;
  }

  return String(amount);
}
