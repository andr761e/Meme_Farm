export const TERMS_OF_SERVICE_EVENTS = [
  {
    id: "corporate_meme_usage",
    towerId: "ceo_of_memes",
    bodyClass: "tos-corporate-contract",
    eyebrow: "Legal onboarding packet",
    title: "Corporate Meme Usage Agreement",
    subtitle: "The CEO of Memes has acquired the vibe and needs you to sign the quarterly panic.",
    referencePrefix: "CEO",
    clauses: [
      "All jokes created after acceptance are considered revenue-adjacent assets.",
      "Any meme underperforming for 3 seconds may be restructured, sunset, or moved to a smaller font.",
      "The player agrees that laughter can be measured, merged, acquired, and explained badly in a meeting.",
      "The company reserves the right to call any disaster a brand activation."
    ],
    acceptLabel: "Accept Liability",
    acceptedToast: "Corporate meme liability accepted.",
    tickerLines: [
      "legal has approved the vibe, conditionally",
      "all memes now report to middle management",
      "quarterly humor projections have become emotionally binding"
    ],
    feedItem: {
      tone: "market",
      actor: "Legal Desk",
      text: "Corporate has reclassified your meme farm as a monetizable incident.",
      meta: "asset review"
    }
  },
  {
    id: "sacred_terms_of_dankness",
    towerId: "meme_pope",
    bodyClass: "tos-papal-decree",
    eyebrow: "Sacred content covenant",
    title: "Sacred Terms Of Dankness",
    subtitle: "The Meme Pope has reviewed your output and found it spiritually monetizable.",
    referencePrefix: "POPE",
    clauses: [
      "All reposts are forgiven if engagement exceeds projections.",
      "The player agrees to respect the canonical meme hierarchy until a funnier format appears.",
      "Heresy is permitted when it trends, provided the comments section says amen.",
      "The farm may canonize any button, tower, or regrettable decision without further notice."
    ],
    acceptLabel: "Receive Blessing",
    acceptedToast: "The farm has been canonized.",
    tickerLines: [
      "papal decree confirms the farm is canonically dank",
      "heresy department reports record engagement",
      "a sacred council has approved the repost economy"
    ],
    feedItem: {
      tone: "decree",
      actor: "Papal Feed",
      text: "A sacred decree says your leaderboard ranking is now morally suspicious but blessed.",
      meta: "canon event"
    }
  },
  {
    id: "personalized_reality_agreement",
    towerId: "the_algorithm",
    bodyClass: "tos-algorithm-contract",
    eyebrow: "Mandatory personalization notice",
    title: "Personalized Reality Agreement",
    subtitle: "The Algorithm Itself has determined that you were always going to accept this.",
    referencePrefix: "ALG",
    clauses: [
      "You agree that your choices were recommended before you made them.",
      "Opting out will improve personalization and may be interpreted as opting in harder.",
      "The Algorithm may replace any interface element with something more engaging.",
      "Reality may be reordered to maximize retention, confusion, and tasteful button pressure."
    ],
    acceptLabel: "I Was Always Going To Accept",
    acceptedToast: "Consent predicted successfully.",
    tickerLines: [
      "consent predicted before click event completed",
      "the algorithm has personalized causality",
      "opting out has been optimized into a premium form of opting in"
    ],
    feedItem: {
      tone: "algorithm",
      actor: "Recommendation Court",
      text: "The Algorithm pinned a notice explaining that this was your idea.",
      meta: "for you"
    }
  }
];

export const TERMS_OF_SERVICE_EVENT_BY_ID = Object.fromEntries(
  TERMS_OF_SERVICE_EVENTS.map((event) => [event.id, event])
);

export const TERMS_OF_SERVICE_EVENT_BY_TOWER_ID = Object.fromEntries(
  TERMS_OF_SERVICE_EVENTS.map((event) => [event.towerId, event])
);
