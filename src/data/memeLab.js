export const MEME_LAB_PROGRAMS = [
  {
    id: "algorithm_bribe",
    type: "boost_grid",
    title: "Algorithm Bribe",
    eyebrow: "Subscriber-funded nonsense",
    description: "Spend subscribers on short-lived boosts. The algorithm will deny everything in writing.",
    boosts: [
      {
        id: "ten_x_heatwave",
        name: "10x Heatwave",
        description: "The clean, obvious bribe: everything gets louder for a tiny window.",
        subscriberCost: 60,
        durationSeconds: 45,
        lpsMultiplier: 10,
        clickMultiplier: 10
      },
      {
        id: "front_page_hijack",
        name: "Front Page Hijack",
        description: "Moderately suspicious visibility. Great for idle gains.",
        subscriberCost: 110,
        durationSeconds: 180,
        lpsMultiplier: 4,
        clickMultiplier: 2
      },
      {
        id: "comment_section_riot",
        name: "Comment Section Riot",
        description: "Every click starts discourse. Horrible for society, excellent for numbers.",
        subscriberCost: 85,
        durationSeconds: 120,
        lpsMultiplier: 1,
        clickMultiplier: 8
      },
      {
        id: "sponsored_brainrot",
        name: "Sponsored Brainrot",
        description: "A longer paid placement for your meme empire's least responsible investors.",
        subscriberCost: 190,
        durationSeconds: 480,
        lpsMultiplier: 3,
        clickMultiplier: 3
      },
      {
        id: "midnight_repost_window",
        name: "Midnight Repost Window",
        description: "A blink-and-you-miss-it click burst for people who should be asleep.",
        subscriberCost: 125,
        durationSeconds: 25,
        lpsMultiplier: 1,
        clickMultiplier: 25
      }
    ]
  },
  {
    id: "bad_idea_button",
    type: "bad_idea_button",
    title: "Bad Idea Button",
    eyebrow: "Questionable research",
    description: "Spend subscribers to press one large button that should not be pressed. No tower LPS multipliers, just immediate consequences.",
    subscriberCost: 80,
    outcomes: [
      {
        id: "random_tower_shipment",
        name: "Random Tower Shipment",
        description: "Gain 5 of one currently unlocked tower.",
        weight: 15,
        type: "awardRandomTower",
        amount: 5,
        towerPool: "unlocked"
      },
      {
        id: "starter_pack_misdelivery",
        name: "Starter Pack Misdelivery",
        description: "Gain 12 of a random starter tower.",
        weight: 10,
        type: "awardRandomTower",
        amount: 12,
        towerPool: "starter"
      },
      {
        id: "emergency_repost",
        name: "Emergency Repost",
        description: "Gain 1,200 seconds of your current LPS as Likes, with a small minimum payout.",
        weight: 24,
        type: "addLikesFromLps",
        seconds: 1200,
        minimumLikes: 250
      },
      {
        id: "clickbait_sprint",
        name: "Clickbait Sprint",
        description: "Gain 10,000 clicks worth of Likes instantly.",
        weight: 20,
        type: "addLikesFromClicks",
        clicks: 10000
      },
      {
        id: "audience_confusion",
        name: "Audience Confusion",
        description: "Gain 120 subscribers because nobody can tell if this is ironic.",
        weight: 11,
        type: "addSubscribers",
        amount: 120,
        consequence: {
          id: "comment_section_riot",
          title: "Comment Section Riot",
          description: "The comment section leaks into the interface and starts yelling over your numbers.",
          durationSeconds: 45
        }
      },
      {
        id: "brand_deal_invoice",
        name: "Brand Deal Invoice",
        description: "Lose up to 30 seconds of current LPS from your Likes.",
        weight: 10,
        type: "loseLikesFromLps",
        seconds: 30,
        consequence: {
          id: "brand_safety_mode",
          title: "Brand Safety Mode",
          description: "Tower names are sanitized into advertiser-safe nonsense.",
          durationSeconds: 60
        }
      },
      {
        id: "awkward_apology_video",
        name: "Awkward Apology Video",
        description: "Lose 3 extra subscribers after paying the button cost.",
        weight: 5,
        type: "loseSubscribers",
        amount: 3,
        consequence: {
          id: "apology_arc",
          title: "Apology Arc",
          description: "Every click is now framed as damage control.",
          durationSeconds: 75
        }
      },
      {
        id: "nothing_happens_loudly",
        name: "Nothing Happens, Loudly",
        description: "No reward. The button makes a confident noise.",
        weight: 5,
        type: "nothing",
        consequence: {
          id: "algorithm_denial_letter",
          title: "Algorithm Denial Letter",
          description: "A fake system notice insists that nothing unusual happened.",
          durationSeconds: 50,
          modal: true
        }
      }
    ]
  },
  {
    id: "algorithm_research",
    type: "research_tree",
    title: "Algorithm Research",
    eyebrow: "Permanent subscriber research",
    description: "Fund permanent utility research that survives Go Viral resets. Each branch unlocks from top to bottom.",
    branches: [
      {
        id: "audience_research",
        title: "Audience Research",
        description: "Study the suspicious people clicking Follow.",
        projects: [
          {
            id: "follower_forensics",
            name: "Follower Forensics",
            description: "Fake subscribers gain an additional 8% chance to convert into real subscribers when clicked.",
            subscriberCost: 100,
            effect: { type: "fakeSubscriberConversion", value: 0.08 }
          },
          {
            id: "second_chance_follow",
            name: "Second-Chance Follow",
            description: "Missed real and golden subscribers have a 20% chance to be recovered automatically.",
            subscriberCost: 250,
            requires: "follower_forensics",
            effect: { type: "missedSubscriberRecovery", value: 0.2 }
          },
          {
            id: "audience_memory",
            name: "Audience Memory",
            description: "Keep 20% of your current Subscribers whenever you Go Viral.",
            subscriberCost: 600,
            requires: "second_chance_follow",
            effect: { type: "prestigeSubscriberRetention", value: 0.2 }
          }
        ]
      },
      {
        id: "lab_engineering",
        title: "Lab Engineering",
        description: "Make temporary corruption cheaper and easier to schedule.",
        projects: [
          {
            id: "negotiated_rates",
            name: "Negotiated Rates",
            description: "Algorithm Bribes cost 10% fewer Subscribers.",
            subscriberCost: 100,
            effect: { type: "bribeCostMultiplier", value: 0.9 }
          },
          {
            id: "contract_extension",
            name: "Contract Extension",
            description: "Algorithm Bribes last 20% longer.",
            subscriberCost: 250,
            requires: "negotiated_rates",
            effect: { type: "bribeDurationMultiplier", value: 1.2 }
          },
          {
            id: "scheduled_bribe",
            name: "Scheduled Bribe",
            description: "Pay for and queue one Bribe while another is active. It begins automatically when the current Bribe ends.",
            subscriberCost: 600,
            requires: "contract_extension",
            effect: { type: "bribeQueue", value: 1 }
          }
        ]
      },
      {
        id: "bad_idea_research",
        title: "Bad Idea Research",
        description: "Apply the scientific method to an object that hates science.",
        projects: [
          {
            id: "risk_assessment",
            name: "Risk Assessment",
            description: "Adds a positive, negative, and empty probability breakdown to the Bad Idea Button.",
            subscriberCost: 100,
            effect: { type: "badIdeaRiskBreakdown", value: 1 }
          },
          {
            id: "damage_control",
            name: "Damage Control",
            description: "Negative Bad Idea outcomes remove 50% fewer Likes and Subscribers.",
            subscriberCost: 250,
            requires: "risk_assessment",
            effect: { type: "badIdeaLossMultiplier", value: 0.5 }
          },
          {
            id: "peer_review",
            name: "Peer Review",
            description: "After three non-positive Bad Idea outcomes in a row, the next press is guaranteed positive.",
            subscriberCost: 600,
            requires: "damage_control",
            effect: { type: "badIdeaPityThreshold", value: 3 }
          }
        ]
      }
    ]
  }
];

export const MEME_LAB_BOOSTS = MEME_LAB_PROGRAMS.flatMap((program) =>
  (program.boosts ?? []).map((boost) => ({
    ...boost,
    programId: program.id
  }))
);

export const MEME_LAB_BOOST_BY_ID = Object.fromEntries(
  MEME_LAB_BOOSTS.map((boost) => [boost.id, boost])
);

export const BAD_IDEA_BUTTON = MEME_LAB_PROGRAMS.find((program) => program.id === "bad_idea_button");

export const BAD_IDEA_OUTCOME_BY_ID = Object.fromEntries(
  BAD_IDEA_BUTTON.outcomes.map((outcome) => [outcome.id, outcome])
);

export const BAD_IDEA_CONSEQUENCES = BAD_IDEA_BUTTON.outcomes
  .map((outcome) => outcome.consequence)
  .filter(Boolean);

export const BAD_IDEA_CONSEQUENCE_BY_ID = Object.fromEntries(
  BAD_IDEA_CONSEQUENCES.map((consequence) => [consequence.id, consequence])
);

export const ALGORITHM_RESEARCH = MEME_LAB_PROGRAMS.find((program) => program.id === "algorithm_research");

export const ALGORITHM_RESEARCH_PROJECTS = ALGORITHM_RESEARCH.branches.flatMap((branch) =>
  branch.projects.map((project) => ({ ...project, branchId: branch.id, branchTitle: branch.title }))
);

export const ALGORITHM_RESEARCH_PROJECT_BY_ID = Object.fromEntries(
  ALGORITHM_RESEARCH_PROJECTS.map((project) => [project.id, project])
);
