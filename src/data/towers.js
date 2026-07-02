const towerImage = (fileName) => `../assets/images/Towers/${fileName}`;

export const TOWER_COST_SCALE = 1.15;

const RAW_TOWERS = [
  {
    id: "swirling_like_button",
    displayName: "Swirling Like Button",
    description: "Spins around your meme. It is basic, but it vibes.",
    baseCost: 10,
    lps: 0.25,
    image: towerImage("Tower 1 - Swirling Like Button.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "shitposter_intern",
    displayName: "Shitposter Intern",
    description: "Works for exposure. And chaos. Mostly chaos.",
    baseCost: 116,
    lps: 2.5,
    image: towerImage("Tower 2 - Shitposter Intern.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "outdated_meme_reposter",
    displayName: "Outdated Meme Reposter",
    description: "Posts Trollface and expects praise. Gets it.",
    baseCost: 1340,
    lps: 25,
    image: towerImage("Tower 3 - Outdated Meme Reposter.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "edgy_teen",
    displayName: "Edgy Teen",
    description: "Posts aggressively ironic memes from their mom's Wi-Fi.",
    baseCost: 7730,
    lps: 125,
    image: towerImage("Tower 4 - Edgy Teen.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "botnet",
    displayName: "Botnet",
    description: "Several totally real accounts agree that your meme is fire.",
    baseCost: 44700,
    lps: 625,
    image: towerImage("Tower 5 - Botnet.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "doomscroller",
    displayName: "Doomscroller",
    description: "Consumes so many memes, the algorithm starts generating them.",
    baseCost: 258000,
    lps: 3125,
    image: towerImage("Tower 6 - Doomscroller.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "meme_subreddit",
    displayName: "Meme Subreddit",
    description: "Power of one million Redditors with strong opinions.",
    baseCost: 1490000,
    lps: 15625,
    image: towerImage("Tower 7 - Meme Subreddit.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "discord_mod",
    displayName: "Discord Mod",
    description: "Will delete your meme, then repost it for clout.",
    baseCost: 8630000,
    lps: 78125,
    image: towerImage("Tower 8 - Discord Mod.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "tiktok_zoomer",
    legacyIds: ["tikTok_zoomer"],
    displayName: "TikTok Zoomer",
    description: "Edits lightning-fast memes with zero coherence.",
    baseCost: 49900000,
    lps: 390625,
    image: towerImage("Tower 9 - TikTok Zoomer.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "meme_lord",
    displayName: "Meme Lord",
    description: "Speaks only in deep-fried memes and obscure references.",
    baseCost: 289000000,
    lps: 1953125,
    image: towerImage("Tower 10 - Meme Lord.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "ai_meme_generator",
    legacyIds: ["AI_meme_generator"],
    displayName: "AI Meme Generator",
    description: "Posts memes 24/7, most of which should not exist.",
    baseCost: 1.67e9,
    lps: 9765625,
    image: towerImage("Tower 11 - AI Meme Generator.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "internet_historian",
    displayName: "Internet Historian",
    description: "Powers up your entire meme empire with sacred meme lore.",
    baseCost: 9.64e9,
    lps: 48828125,
    image: towerImage("Tower 12 - Internet Historian.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "cursed_content_forge",
    retiredIds: ["viral_singularity"],
    retiredCrossfeedIds: ["viral_singularity_crossfeed_internet_historian"],
    displayName: "Cursed Content Forge",
    description: "Combines deep-fried memes with forbidden formats. You created something unnatural.",
    baseCost: 5.57e10,
    lps: 244140625,
    image: towerImage("Tower 14 - Cursed Content Forge.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "elons_meme_brainchip",
    displayName: "Elon's Meme Brainchip",
    description: "Direct neural meme injection. Also tweets itself every three seconds.",
    baseCost: 3.22e11,
    lps: 1220703125,
    image: towerImage("Tower 15 - Elon’s Meme Brainchip.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "meme_multiverse_server",
    retiredIds: ["based_reality_distorter"],
    retiredCrossfeedIds: ["based_reality_distorter_crossfeed_elons_meme_brainchip"],
    displayName: "Meme Multiverse Server",
    description: "Crossposts across infinite universes. Every timeline is farming likes now.",
    baseCost: 1.86e12,
    lps: 6103515625,
    image: towerImage("Tower 17 - Meme Multiverse Server.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "boomer_facebook_group",
    retiredIds: ["clout_god"],
    retiredCrossfeedIds: ["clout_god_crossfeed_meme_multiverse_server"],
    displayName: "Boomer Facebook Group",
    description: "Posts the same Minions meme every day. Somehow farms billions of likes.",
    baseCost: 1.08e13,
    lps: 30517578125,
    image: towerImage("Tower 19 - Boomer Facebook Group.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "irony_engine",
    displayName: "Irony Engine",
    description: "Drives pure irony into the meme stream. Nothing makes sense, but everything works.",
    baseCost: 6.23e13,
    lps: 152587890625,
    image: towerImage("Tower 20 - Irony Engine.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "fourchan_core_reactor",
    displayName: "4chan Core Reactor",
    description: "A chaotic power plant of unstable but high-yield meme reactions.",
    baseCost: 3.6e14,
    lps: 762939453125,
    image: towerImage("Tower 21 - 4chan Core Reactor.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "eternal_rickroll_loop",
    displayName: "Eternal Rickroll Loop",
    description: "A time loop that eternally Rickrolls the internet. Likes surge with every repetition.",
    baseCost: 2.08e15,
    lps: 3814697265625,
    image: towerImage("Tower 22 - Eternal Rickroll Loop.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "wojak_factory",
    displayName: "Wojak Factory",
    description: "Mass-produces emotionally unstable memes for every niche feeling imaginable.",
    baseCost: 1.2e16,
    lps: 19073486328125,
    image: towerImage("Tower 23 - Wojak Factory.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "copium_refinery",
    retiredIds: ["quantum_shitpost_array"],
    retiredCrossfeedIds: ["quantum_shitpost_array_crossfeed_wojak_factory"],
    displayName: "Copium Refinery",
    description: "Distills pure Copium into memeable doses. Engagement rises during crises.",
    baseCost: 6.95e16,
    lps: 95367431640625,
    image: towerImage("Tower 25 - Copium Refinery.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "nft_cemetery",
    retiredIds: ["npc_overpopulation_center"],
    retiredCrossfeedIds: ["npc_overpopulation_center_crossfeed_copium_refinery"],
    displayName: "NFT Cemetery",
    description: "Buries broken dreams and JPEGs, harvesting nostalgia-laced meme juice.",
    baseCost: 4.02e17,
    lps: 476837158203125,
    image: towerImage("Tower 27 - NFT Cemetery.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "cringe_singularity",
    displayName: "Cringe Singularity",
    description: "Collapses outdated humor into a dense point of ironic power. Horrifying and efficient.",
    baseCost: 2.32e18,
    lps: 2384185791015625,
    image: towerImage("Tower 28 - Cringe Singularity.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "ceo_of_memes",
    displayName: "CEO of Memes",
    description: "They do not make the memes. They acquire them, then sue others for using them.",
    baseCost: 1.34e19,
    lps: 11920928955078125,
    image: towerImage("Tower 29 - CEO of Memes.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "reality_glitcher",
    displayName: "Reality Glitcher",
    description: "Corrupts spacetime to insert your memes into dreams and PowerPoint templates.",
    baseCost: 7.77e19,
    lps: 59604644775390625,
    image: towerImage("Tower 30 - Reality Glitcher.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "sigma_godfather",
    displayName: "Sigma Godfather",
    description: "Mentored every grindset influencer. His quotes make likes appear.",
    baseCost: 4.49e20,
    lps: 298023223876953125,
    image: towerImage("Tower 31 - Sigma Godfather.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "chrono_poster",
    retiredIds: ["multiversal_mod_team"],
    retiredCrossfeedIds: ["multiversal_mod_team_crossfeed_sigma_godfather"],
    displayName: "Chrono-Poster",
    description: "Posts before trends happen. Likes arrive before the meme is born.",
    baseCost: 2.6e21,
    lps: 1490116119384765625,
    image: towerImage("Tower 33 - Chrono-Poster.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "memeconomist",
    displayName: "Memeconomist",
    description: "Invented the Meme Index. Pumps and dumps trends to maximize virality.",
    baseCost: 1.5e22,
    lps: 7450580596923828125,
    image: towerImage("Tower 34 - Memeconomist.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "zuckerbot_9000",
    displayName: "Zuckerbot 9000",
    description: "A fully automated content replicator with a suspiciously glassy stare.",
    baseCost: 8.68e22,
    lps: 37252902984619140625,
    image: towerImage("Tower 35 - Zuckerbot 9000.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "meme_pope",
    retiredIds: ["forbidden_archivist", "cursed_tiktok_cultist"],
    retiredCrossfeedIds: [
      "forbidden_archivist_crossfeed_zuckerbot_9000",
      "cursed_tiktok_cultist_crossfeed_forbidden_archivist"
    ],
    displayName: "The Meme Pope",
    description: "Declares meme crusades and canonizes dankness.",
    baseCost: 5.02e23,
    lps: 186264514923095703125,
    image: towerImage("Tower 38 - The Meme Pope.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "ai_thinks_its_funny",
    displayName: "AI That Thinks It's Funny",
    description: "It does not get the joke, but it posts ten thousand a second.",
    baseCost: 2.9e24,
    lps: 9.313225746154785e20,
    image: towerImage("Tower 39 - AI That Thinks It’s Funny.png"),
    unlockAt: { totalLikesEver: 0 }
  },
  {
    id: "the_algorithm",
    displayName: "The Algorithm Itself",
    description: "You do not beat the algorithm. You become the algorithm.",
    baseCost: 1.68e25,
    lps: 4.656612873077393e21,
    image: towerImage("Tower 40 - The Algorithm Itself.png"),
    unlockAt: { totalLikesEver: 0 }
  }
];

export const TOWERS = RAW_TOWERS.map((tower) => ({
  ...tower,
  costScale: TOWER_COST_SCALE
}));

export const TOWER_BY_ID = Object.fromEntries(TOWERS.map((tower) => [tower.id, tower]));
