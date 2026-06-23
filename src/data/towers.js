const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;
export const TOWER_COST_SCALE = 1.15;

const RAW_TOWERS = [
  {
    id: "swirling_like_button",
    displayName: "Swirling Like Button",
    description: "Spins around your meme. It is basic, but it vibes.",
    baseCost: 10,
    lps: 0.1,
    image: towerImage("Tower 1 - Swirling Like Button.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "shitposter_intern",
    displayName: "Shitposter Intern",
    description: "Works for exposure. And chaos. Mostly chaos.",
    baseCost: 100,
    lps: 1,
    image: towerImage("Tower 2 - Shitposter Intern.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "outdated_meme_reposter",
    displayName: "Outdated Meme Reposter",
    description: "Posts Trollface and expects praise. Gets it.",
    baseCost: 1000,
    lps: 10,
    image: towerImage("Tower 3 - Outdated Meme Reposter.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "edgy_teen",
    displayName: "Edgy Teen",
    description: "Posts aggressively ironic memes from their mom's Wi-Fi.",
    baseCost: 13000,
    lps: 50,
    image: towerImage("Tower 4 - Edgy Teen.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "botnet",
    displayName: "Botnet",
    description: "Several totally real accounts agree that your meme is fire.",
    baseCost: 150000,
    lps: 250,
    image: towerImage("Tower 5 - Botnet.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "doomscroller",
    displayName: "Doomscroller",
    description: "Consumes so many memes, the algorithm starts generating them.",
    baseCost: 1800000,
    lps: 1250,
    image: towerImage("Tower 6 - Doomscroller.png"),
    unlockAt: { totalLikesEver: 1200 }
  },
  {
    id: "meme_subreddit",
    displayName: "Meme Subreddit",
    description: "Power of one million Redditors with strong opinions.",
    baseCost: 24000000,
    lps: 6250,
    image: towerImage("Tower 7 - Meme Subreddit.png"),
    unlockAt: { totalLikesEver: 8000 }
  },
  {
    id: "discord_mod",
    displayName: "Discord Mod",
    description: "Will delete your meme, then repost it for clout.",
    baseCost: 360000000,
    lps: 31250,
    image: towerImage("Tower 8 - Discord Mod.png"),
    unlockAt: { totalLikesEver: 30000 }
  },
  {
    id: "tiktok_zoomer",
    legacyIds: ["tikTok_zoomer"],
    displayName: "TikTok Zoomer",
    description: "Edits lightning-fast memes with zero coherence.",
    baseCost: 5100000000,
    lps: 156250,
    image: towerImage("Tower 9 - TikTok Zoomer.png"),
    unlockAt: { totalLikesEver: 120000 }
  },
  {
    id: "meme_lord",
    displayName: "Meme Lord",
    description: "Speaks only in deep-fried memes and obscure references.",
    baseCost: 70000000000,
    lps: 781250,
    image: towerImage("Tower 10 - Meme Lord.png"),
    unlockAt: { totalLikesEver: 500000 }
  },
  {
    id: "ai_meme_generator",
    legacyIds: ["AI_meme_generator"],
    displayName: "AI Meme Generator",
    description: "Posts memes 24/7, most of which should not exist.",
    baseCost: 930000000000,
    lps: 3906250,
    image: towerImage("Tower 11 - AI Meme Generator.png"),
    unlockAt: { totalLikesEver: 2000000 }
  },
  {
    id: "internet_historian",
    displayName: "Internet Historian",
    description: "Powers up your entire meme empire with sacred meme lore.",
    baseCost: 13000000000000,
    lps: 19531250,
    image: towerImage("Tower 12 - Internet Historian.png"),
    unlockAt: { totalLikesEver: 7500000 }
  },
  {
    id: "viral_singularity",
    displayName: "Viral Singularity",
    description: "A meme so viral it bends the algorithm. Everyone's For You Page becomes you.",
    baseCost: 160000000000000,
    lps: 97656250,
    image: towerImage("Tower 13 - Viral Singularity.png"),
    unlockAt: { totalLikesEver: 25000000 }
  },
  {
    id: "cursed_content_forge",
    displayName: "Cursed Content Forge",
    description: "Combines deep-fried memes with forbidden formats. You created something unnatural.",
    baseCost: 2000000000000000,
    lps: 488281250,
    image: towerImage("Tower 14 - Cursed Content Forge.png"),
    unlockAt: { totalLikesEver: 90000000 }
  },
  {
    id: "elons_meme_brainchip",
    displayName: "Elon's Meme Brainchip",
    description: "Direct neural meme injection. Also tweets itself every three seconds.",
    baseCost: 26000000000000000,
    lps: 2441406250,
    image: towerImage("Tower 15 - Elon\u2019s Meme Brainchip.png"),
    unlockAt: { totalLikesEver: 300000000 }
  },
  {
    id: "based_reality_distorter",
    displayName: "Based Reality Distorter",
    description: "Alters reality to fit your memes. Cringe is now illegal.",
    baseCost: 320000000000000000,
    lps: 12207031250,
    image: towerImage("Tower 16 - Based Reality Distorter.png"),
    unlockAt: { totalLikesEver: 1000000000 }
  },
  {
    id: "meme_multiverse_server",
    displayName: "Meme Multiverse Server",
    description: "Crossposts across infinite universes. Every timeline is farming likes now.",
    baseCost: 4.2e+18,
    lps: 61035156250,
    image: towerImage("Tower 17 - Meme Multiverse Server.png"),
    unlockAt: { totalLikesEver: 3500000000 }
  },
  {
    id: "clout_god",
    displayName: "Clout God",
    description: "You no longer post memes. You are the meme.",
    baseCost: 5.3e+19,
    lps: 305175781250,
    image: towerImage("Tower 18 - Clout God.png"),
    unlockAt: { totalLikesEver: 12000000000 }
  },
  {
    id: "boomer_facebook_group",
    displayName: "Boomer Facebook Group",
    description: "Posts the same Minions meme every day. Somehow farms billions of likes.",
    baseCost: 6.9e+20,
    lps: 1525878906250,
    image: towerImage("Tower 19 - Boomer Facebook Group.png"),
    unlockAt: { totalLikesEver: 40000000000 }
  },
  {
    id: "irony_engine",
    displayName: "Irony Engine",
    description: "Drives pure irony into the meme stream. Nothing makes sense, but everything works.",
    baseCost: 9.1e+21,
    lps: 7629394531250,
    image: towerImage("Tower 20 - Irony Engine.png"),
    unlockAt: { totalLikesEver: 150000000000 }
  },
  {
    id: "fourchan_core_reactor",
    displayName: "4chan Core Reactor",
    description: "A chaotic power plant of unstable but high-yield meme reactions.",
    baseCost: 1.2e+23,
    lps: 38146972656250,
    image: towerImage("Tower 21 - 4chan Core Reactor.png"),
    unlockAt: { totalLikesEver: 450000000000 }
  },
  {
    id: "eternal_rickroll_loop",
    displayName: "Eternal Rickroll Loop",
    description: "A time loop that eternally Rickrolls the internet. Likes surge with every repetition.",
    baseCost: 1.5e+24,
    lps: 190734863281250,
    image: towerImage("Tower 22 - Eternal Rickroll Loop.png"),
    unlockAt: { totalLikesEver: 1200000000000 }
  },
  {
    id: "wojak_factory",
    displayName: "Wojak Factory",
    description: "Mass-produces emotionally unstable memes for every niche feeling imaginable.",
    baseCost: 2e+25,
    lps: 953674316406250,
    image: towerImage("Tower 23 - Wojak Factory.png"),
    unlockAt: { totalLikesEver: 3500000000000 }
  },
  {
    id: "quantum_shitpost_array",
    displayName: "Quantum Shitpost Array",
    description: "Shitposts in every timeline simultaneously. Some of them make you question reality.",
    baseCost: 2.6e+26,
    lps: 4.76837158203125e+15,
    image: towerImage("Tower 24 - Quantum Shitpost Array.png"),
    unlockAt: { totalLikesEver: 10000000000000 }
  },
  {
    id: "copium_refinery",
    displayName: "Copium Refinery",
    description: "Distills pure Copium into memeable doses. Engagement rises during crises.",
    baseCost: 3.3e+27,
    lps: 2.384185791015625e+16,
    image: towerImage("Tower 25 - Copium Refinery.png"),
    unlockAt: { totalLikesEver: 30000000000000 }
  },
  {
    id: "npc_overpopulation_center",
    displayName: "NPC Overpopulation Center",
    description: "Spawns billions of NPCs to mindlessly like whatever you post.",
    baseCost: 4.4e+28,
    lps: 1.1920928955078125e+17,
    image: towerImage("Tower 26 - NPC Overpopulation Center.png"),
    unlockAt: { totalLikesEver: 90000000000000 }
  },
  {
    id: "nft_cemetery",
    displayName: "NFT Cemetery",
    description: "Buries broken dreams and JPEGs, harvesting nostalgia-laced meme juice.",
    baseCost: 5.8e+29,
    lps: 5.960464477539063e+17,
    image: towerImage("Tower 27 - NFT Cemetery.png"),
    unlockAt: { totalLikesEver: 250000000000000 }
  },
  {
    id: "cringe_singularity",
    displayName: "Cringe Singularity",
    description: "Collapses outdated humor into a dense point of ironic power. Horrifying and efficient.",
    baseCost: 7.5e+30,
    lps: 2.980232238769531e+18,
    image: towerImage("Tower 28 - Cringe Singularity.png"),
    unlockAt: { totalLikesEver: 800000000000000 }
  },
  {
    id: "ceo_of_memes",
    displayName: "CEO of Memes",
    description: "They do not make the memes. They acquire them, then sue others for using them.",
    baseCost: 9.9e+31,
    lps: 1.4901161193847656e+19,
    image: towerImage("Tower 29 - CEO of Memes.png"),
    unlockAt: { totalLikesEver: 2500000000000000 }
  },
  {
    id: "reality_glitcher",
    displayName: "Reality Glitcher",
    description: "Corrupts spacetime to insert your memes into dreams and PowerPoint templates.",
    baseCost: 1.3e+33,
    lps: 7.450580596923828e+19,
    image: towerImage("Tower 30 - Reality Glitcher.png"),
    unlockAt: { totalLikesEver: 8000000000000000 }
  },
  {
    id: "sigma_godfather",
    displayName: "Sigma Godfather",
    description: "Mentored every grindset influencer. His quotes make likes appear.",
    baseCost: 1.7e+34,
    lps: 3.725290298461914e+20,
    image: towerImage("Tower 31 - Sigma Godfather.png"),
    unlockAt: { totalLikesEver: 22000000000000000 }
  },
  {
    id: "multiversal_mod_team",
    displayName: "Multiversal Mod Team",
    description: "Bans negativity across all realities, except your memes.",
    baseCost: 2.3e+35,
    lps: 1.862645149230957e+21,
    image: towerImage("Tower 32 - Multiversal Mod Team.png"),
    unlockAt: { totalLikesEver: 70000000000000000 }
  },
  {
    id: "chrono_poster",
    displayName: "Chrono-Poster",
    description: "Posts before trends happen. Likes arrive before the meme is born.",
    baseCost: 3e+36,
    lps: 9.313225746154785e+21,
    image: towerImage("Tower 33 - Chrono-Poster.png"),
    unlockAt: { totalLikesEver: 200000000000000000 }
  },
  {
    id: "memeconomist",
    displayName: "Memeconomist",
    description: "Invented the Meme Index. Pumps and dumps trends to maximize virality.",
    baseCost: 3.9e+37,
    lps: 4.656612873077393e+22,
    image: towerImage("Tower 34 - Memeconomist.png"),
    unlockAt: { totalLikesEver: 600000000000000000 }
  },
  {
    id: "zuckerbot_9000",
    displayName: "Zuckerbot 9000",
    description: "A fully automated content replicator with a suspiciously glassy stare.",
    baseCost: 5.2e+38,
    lps: 2.328306436538696e+23,
    image: towerImage("Tower 35 - Zuckerbot 9000.png"),
    unlockAt: { totalLikesEver: 1800000000000000000 }
  },
  {
    id: "forbidden_archivist",
    displayName: "The Forbidden Archivist",
    description: "Knows every meme, even the ones scrubbed from the timeline.",
    baseCost: 6.9e+39,
    lps: 1.164153218269348e+24,
    image: towerImage("Tower 36 - The Forbidden Archivist.png"),
    unlockAt: { totalLikesEver: 5500000000000000000 }
  },
  {
    id: "cursed_tiktok_cultist",
    displayName: "Cursed TikTok Cultist",
    description: "Posts rituals disguised as memes. Likes rise mysteriously at 3 AM.",
    baseCost: 9.1e+40,
    lps: 5.820766091346741e+24,
    image: towerImage("Tower 37 - Cursed TikTok Cultist.png"),
    unlockAt: { totalLikesEver: 16000000000000000000 }
  },
  {
    id: "meme_pope",
    displayName: "The Meme Pope",
    description: "Declares meme crusades and canonizes dankness.",
    baseCost: 1.2e+42,
    lps: 2.9103830456733704e+25,
    image: towerImage("Tower 38 - The Meme Pope.png"),
    unlockAt: { totalLikesEver: 50000000000000000000 }
  },
  {
    id: "ai_thinks_its_funny",
    displayName: "AI That Thinks It's Funny",
    description: "It does not get the joke, but it posts ten thousand a second.",
    baseCost: 1.6e+43,
    lps: 1.4551915228366852e+26,
    image: towerImage("Tower 39 - AI That Thinks It\u2019s Funny.png"),
    unlockAt: { totalLikesEver: 150000000000000000000 }
  },
  {
    id: "the_algorithm",
    displayName: "The Algorithm Itself",
    description: "You do not beat the algorithm. You become the algorithm.",
    baseCost: 2.1e+44,
    lps: 7.275957614183426e+26,
    image: towerImage("Tower 40 - The Algorithm Itself.png"),
    unlockAt: { totalLikesEver: 500000000000000000000 }
  }
];

export const TOWERS = RAW_TOWERS.map((tower) => ({
  ...tower,
  costScale: TOWER_COST_SCALE
}));

export const TOWER_BY_ID = Object.fromEntries(TOWERS.map((tower) => [tower.id, tower]));
