const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
const TOWER_BASE_COST_MULTIPLIER = 8;
const TOWER_BASE_COST_RAMP = 1.08;
const TOWER_COST_SCALE = 1.22;

const RAW_TOWERS = [
  {
    id: "swirling_like_button",
    displayName: "Swirling Like Button",
    description: "Spins around your meme. It is basic, but it vibes.",
    baseCost: 10,
    costScale: 1.15,
    lps: 0.2,
    image: towerImage("Tower 1 - Swirling Like Button.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "shitposter_intern",
    displayName: "Shitposter Intern",
    description: "Works for exposure. And chaos. Mostly chaos.",
    baseCost: 75,
    costScale: 1.15,
    lps: 1,
    image: towerImage("Tower 2 - Shitposter Intern.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "outdated_meme_reposter",
    displayName: "Outdated Meme Reposter",
    description: "Posts Trollface and expects praise. Gets it.",
    baseCost: 350,
    costScale: 1.15,
    lps: 4,
    image: towerImage("Tower 3 - Outdated Meme Reposter.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "edgy_teen",
    displayName: "Edgy Teen",
    description: "Posts aggressively ironic memes from their mom's Wi-Fi.",
    baseCost: 1200,
    costScale: 1.15,
    lps: 12,
    image: towerImage("Tower 4 - Edgy Teen.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "botnet",
    displayName: "Botnet",
    description: "Several totally real accounts agree that your meme is fire.",
    baseCost: 5000,
    costScale: 1.15,
    lps: 45,
    image: towerImage("Tower 5 - Botnet.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "doomscroller",
    displayName: "Doomscroller",
    description: "Consumes so many memes, the algorithm starts generating them.",
    baseCost: 25000,
    costScale: 1.15,
    lps: 140,
    image: towerImage("Tower 6 - Doomscroller.png"),
    unlockAt: { totalLikesEver: 1200 }
  },
  {
    id: "meme_subreddit",
    displayName: "Meme Subreddit",
    description: "Power of one million Redditors with strong opinions.",
    baseCost: 100000,
    costScale: 1.15,
    lps: 420,
    image: towerImage("Tower 7 - Meme Subreddit.png"),
    unlockAt: { totalLikesEver: 8000 }
  },
  {
    id: "discord_mod",
    displayName: "Discord Mod",
    description: "Will delete your meme, then repost it for clout.",
    baseCost: 450000,
    costScale: 1.15,
    lps: 1200,
    image: towerImage("Tower 8 - Discord Mod.png"),
    unlockAt: { totalLikesEver: 30000 }
  },
  {
    id: "tiktok_zoomer",
    legacyIds: ["tikTok_zoomer"],
    displayName: "TikTok Zoomer",
    description: "Edits lightning-fast memes with zero coherence.",
    baseCost: 1500000,
    costScale: 1.15,
    lps: 3600,
    image: towerImage("Tower 9 - TikTok Zoomer.png"),
    unlockAt: { totalLikesEver: 120000 }
  },
  {
    id: "meme_lord",
    displayName: "Meme Lord",
    description: "Speaks only in deep-fried memes and obscure references.",
    baseCost: 5000000,
    costScale: 1.15,
    lps: 10000,
    image: towerImage("Tower 10 - Meme Lord.png"),
    unlockAt: { totalLikesEver: 500000 }
  },
  {
    id: "ai_meme_generator",
    legacyIds: ["AI_meme_generator"],
    displayName: "AI Meme Generator",
    description: "Posts memes 24/7, most of which should not exist.",
    baseCost: 15000000,
    costScale: 1.15,
    lps: 28000,
    image: towerImage("Tower 11 - AI Meme Generator.png"),
    unlockAt: { totalLikesEver: 2000000 }
  },
  {
    id: "internet_historian",
    displayName: "Internet Historian",
    description: "Powers up your entire meme empire with sacred meme lore.",
    baseCost: 40000000,
    costScale: 1.15,
    lps: 75000,
    image: towerImage("Tower 12 - Internet Historian.png"),
    unlockAt: { totalLikesEver: 7500000 }
  },
  {
    id: "viral_singularity",
    displayName: "Viral Singularity",
    description: "A meme so viral it bends the algorithm. Everyone's For You Page becomes you.",
    baseCost: 120000000,
    costScale: 1.15,
    lps: 200000,
    image: towerImage("Tower 13 - Viral Singularity.png"),
    unlockAt: { totalLikesEver: 25000000 }
  },
  {
    id: "cursed_content_forge",
    displayName: "Cursed Content Forge",
    description: "Combines deep-fried memes with forbidden formats. You created something unnatural.",
    baseCost: 350000000,
    costScale: 1.15,
    lps: 550000,
    image: towerImage("Tower 14 - Cursed Content Forge.png"),
    unlockAt: { totalLikesEver: 90000000 }
  },
  {
    id: "elons_meme_brainchip",
    displayName: "Elon's Meme Brainchip",
    description: "Direct neural meme injection. Also tweets itself every three seconds.",
    baseCost: 1000000000,
    costScale: 1.15,
    lps: 1400000,
    image: towerImage("Tower 15 - Elon\u2019s Meme Brainchip.png"),
    unlockAt: { totalLikesEver: 300000000 }
  },
  {
    id: "based_reality_distorter",
    displayName: "Based Reality Distorter",
    description: "Alters reality to fit your memes. Cringe is now illegal.",
    baseCost: 3000000000,
    costScale: 1.15,
    lps: 4000000,
    image: towerImage("Tower 16 - Based Reality Distorter.png"),
    unlockAt: { totalLikesEver: 1000000000 }
  },
  {
    id: "meme_multiverse_server",
    displayName: "Meme Multiverse Server",
    description: "Crossposts across infinite universes. Every timeline is farming likes now.",
    baseCost: 10000000000,
    costScale: 1.15,
    lps: 12000000,
    image: towerImage("Tower 17 - Meme Multiverse Server.png"),
    unlockAt: { totalLikesEver: 3500000000 }
  },
  {
    id: "clout_god",
    displayName: "Clout God",
    description: "You no longer post memes. You are the meme.",
    baseCost: 30000000000,
    costScale: 1.15,
    lps: 35000000,
    image: towerImage("Tower 18 - Clout God.png"),
    unlockAt: { totalLikesEver: 12000000000 }
  },
  {
    id: "boomer_facebook_group",
    displayName: "Boomer Facebook Group",
    description: "Posts the same Minions meme every day. Somehow farms billions of likes.",
    baseCost: 90000000000,
    costScale: 1.15,
    lps: 90000000,
    image: towerImage("Tower 19 - Boomer Facebook Group.png"),
    unlockAt: { totalLikesEver: 40000000000 }
  },
  {
    id: "irony_engine",
    displayName: "Irony Engine",
    description: "Drives pure irony into the meme stream. Nothing makes sense, but everything works.",
    baseCost: 250000000000,
    costScale: 1.15,
    lps: 240000000,
    image: towerImage("Tower 20 - Irony Engine.png"),
    unlockAt: { totalLikesEver: 150000000000 }
  },
  {
    id: "fourchan_core_reactor",
    displayName: "4chan Core Reactor",
    description: "A chaotic power plant of unstable but high-yield meme reactions.",
    baseCost: 750000000000,
    costScale: 1.15,
    lps: 650000000,
    image: towerImage("Tower 21 - 4chan Core Reactor.png"),
    unlockAt: { totalLikesEver: 450000000000 }
  },
  {
    id: "eternal_rickroll_loop",
    displayName: "Eternal Rickroll Loop",
    description: "A time loop that eternally Rickrolls the internet. Likes surge with every repetition.",
    baseCost: 2200000000000,
    costScale: 1.15,
    lps: 1800000000,
    image: towerImage("Tower 22 - Eternal Rickroll Loop.png"),
    unlockAt: { totalLikesEver: 1200000000000 }
  },
  {
    id: "wojak_factory",
    displayName: "Wojak Factory",
    description: "Mass-produces emotionally unstable memes for every niche feeling imaginable.",
    baseCost: 6500000000000,
    costScale: 1.15,
    lps: 4800000000,
    image: towerImage("Tower 23 - Wojak Factory.png"),
    unlockAt: { totalLikesEver: 3500000000000 }
  },
  {
    id: "quantum_shitpost_array",
    displayName: "Quantum Shitpost Array",
    description: "Shitposts in every timeline simultaneously. Some of them make you question reality.",
    baseCost: 20000000000000,
    costScale: 1.15,
    lps: 13000000000,
    image: towerImage("Tower 24 - Quantum Shitpost Array.png"),
    unlockAt: { totalLikesEver: 10000000000000 }
  },
  {
    id: "copium_refinery",
    displayName: "Copium Refinery",
    description: "Distills pure Copium into memeable doses. Engagement rises during crises.",
    baseCost: 60000000000000,
    costScale: 1.15,
    lps: 35000000000,
    image: towerImage("Tower 25 - Copium Refinery.png"),
    unlockAt: { totalLikesEver: 30000000000000 }
  },
  {
    id: "npc_overpopulation_center",
    displayName: "NPC Overpopulation Center",
    description: "Spawns billions of NPCs to mindlessly like whatever you post.",
    baseCost: 180000000000000,
    costScale: 1.15,
    lps: 90000000000,
    image: towerImage("Tower 26 - NPC Overpopulation Center.png"),
    unlockAt: { totalLikesEver: 90000000000000 }
  },
  {
    id: "nft_cemetery",
    displayName: "NFT Cemetery",
    description: "Buries broken dreams and JPEGs, harvesting nostalgia-laced meme juice.",
    baseCost: 550000000000000,
    costScale: 1.15,
    lps: 250000000000,
    image: towerImage("Tower 27 - NFT Cemetery.png"),
    unlockAt: { totalLikesEver: 250000000000000 }
  },
  {
    id: "cringe_singularity",
    displayName: "Cringe Singularity",
    description: "Collapses outdated humor into a dense point of ironic power. Horrifying and efficient.",
    baseCost: 1600000000000000,
    costScale: 1.15,
    lps: 650000000000,
    image: towerImage("Tower 28 - Cringe Singularity.png"),
    unlockAt: { totalLikesEver: 800000000000000 }
  },
  {
    id: "ceo_of_memes",
    displayName: "CEO of Memes",
    description: "They do not make the memes. They acquire them, then sue others for using them.",
    baseCost: 5000000000000000,
    costScale: 1.15,
    lps: 1700000000000,
    image: towerImage("Tower 29 - CEO of Memes.png"),
    unlockAt: { totalLikesEver: 2500000000000000 }
  },
  {
    id: "reality_glitcher",
    displayName: "Reality Glitcher",
    description: "Corrupts spacetime to insert your memes into dreams and PowerPoint templates.",
    baseCost: 15000000000000000,
    costScale: 1.15,
    lps: 4500000000000,
    image: towerImage("Tower 30 - Reality Glitcher.png"),
    unlockAt: { totalLikesEver: 8000000000000000 }
  },
  {
    id: "sigma_godfather",
    displayName: "Sigma Godfather",
    description: "Mentored every grindset influencer. His quotes make likes appear.",
    baseCost: 45000000000000000,
    costScale: 1.15,
    lps: 12000000000000,
    image: towerImage("Tower 31 - Sigma Godfather.png"),
    unlockAt: { totalLikesEver: 22000000000000000 }
  },
  {
    id: "multiversal_mod_team",
    displayName: "Multiversal Mod Team",
    description: "Bans negativity across all realities, except your memes.",
    baseCost: 130000000000000000,
    costScale: 1.15,
    lps: 30000000000000,
    image: towerImage("Tower 32 - Multiversal Mod Team.png"),
    unlockAt: { totalLikesEver: 70000000000000000 }
  },
  {
    id: "chrono_poster",
    displayName: "Chrono-Poster",
    description: "Posts before trends happen. Likes arrive before the meme is born.",
    baseCost: 400000000000000000,
    costScale: 1.15,
    lps: 80000000000000,
    image: towerImage("Tower 33 - Chrono-Poster.png"),
    unlockAt: { totalLikesEver: 200000000000000000 }
  },
  {
    id: "memeconomist",
    displayName: "Memeconomist",
    description: "Invented the Meme Index. Pumps and dumps trends to maximize virality.",
    baseCost: 1200000000000000000,
    costScale: 1.15,
    lps: 210000000000000,
    image: towerImage("Tower 34 - Memeconomist.png"),
    unlockAt: { totalLikesEver: 600000000000000000 }
  },
  {
    id: "zuckerbot_9000",
    displayName: "Zuckerbot 9000",
    description: "A fully automated content replicator with a suspiciously glassy stare.",
    baseCost: 3600000000000000000,
    costScale: 1.15,
    lps: 550000000000000,
    image: towerImage("Tower 35 - Zuckerbot 9000.png"),
    unlockAt: { totalLikesEver: 1800000000000000000 }
  },
  {
    id: "forbidden_archivist",
    displayName: "The Forbidden Archivist",
    description: "Knows every meme, even the ones scrubbed from the timeline.",
    baseCost: 11000000000000000000,
    costScale: 1.15,
    lps: 1400000000000000,
    image: towerImage("Tower 36 - The Forbidden Archivist.png"),
    unlockAt: { totalLikesEver: 5500000000000000000 }
  },
  {
    id: "cursed_tiktok_cultist",
    displayName: "Cursed TikTok Cultist",
    description: "Posts rituals disguised as memes. Likes rise mysteriously at 3 AM.",
    baseCost: 33000000000000000000,
    costScale: 1.15,
    lps: 3800000000000000,
    image: towerImage("Tower 37 - Cursed TikTok Cultist.png"),
    unlockAt: { totalLikesEver: 16000000000000000000 }
  },
  {
    id: "meme_pope",
    displayName: "The Meme Pope",
    description: "Declares meme crusades and canonizes dankness.",
    baseCost: 100000000000000000000,
    costScale: 1.15,
    lps: 9500000000000000,
    image: towerImage("Tower 38 - The Meme Pope.png"),
    unlockAt: { totalLikesEver: 50000000000000000000 }
  },
  {
    id: "ai_thinks_its_funny",
    displayName: "AI That Thinks It's Funny",
    description: "It does not get the joke, but it posts ten thousand a second.",
    baseCost: 300000000000000000000,
    costScale: 1.15,
    lps: 25000000000000000,
    image: towerImage("Tower 39 - AI That Thinks It\u2019s Funny.png"),
    unlockAt: { totalLikesEver: 150000000000000000000 }
  },
  {
    id: "the_algorithm",
    displayName: "The Algorithm Itself",
    description: "You do not beat the algorithm. You become the algorithm.",
    baseCost: 1000000000000000000000,
    costScale: 1.15,
    lps: 100000000000000000,
    image: towerImage("Tower 40 - The Algorithm Itself.png"),
    unlockAt: { totalLikesEver: 500000000000000000000 }
  }
];

export const TOWERS = RAW_TOWERS.map((tower, index) => ({
  ...tower,
  baseCost: Math.ceil(tower.baseCost * TOWER_BASE_COST_MULTIPLIER * Math.pow(TOWER_BASE_COST_RAMP, index)),
  costScale: TOWER_COST_SCALE
}));

export const TOWER_BY_ID = Object.fromEntries(TOWERS.map((tower) => [tower.id, tower]));
