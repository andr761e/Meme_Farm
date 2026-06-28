import { ACHIEVEMENTS } from "./data/achievements.js";
import { MEME_LAB_PROGRAMS } from "./data/memeLab.js";
import { TERMS_OF_SERVICE_EVENTS } from "./data/termsOfService.js";
import { TOWERS } from "./data/towers.js";
import { UPGRADES } from "./data/upgrades.js";
import {
  LEADERBOARD_METRICS,
  formatLeaderboardValue,
  getLeaderboardMetric,
  getLeaderboardMetricValue,
  getLeaderboardRows
} from "./leaderboards.js";
import {
  getClickPower,
  getActiveObscureLpsBoosts,
  getActiveLabBoosts,
  getActiveBadIdeaConsequences,
  getApocalypseEra,
  hasActiveBadIdeaConsequence,
  hasActiveLabProgramBoost,
  getLabBoostMultipliers,
  getLikesPerSecond,
  getFakeSubscriberConversion,
  getLifetimePrestigeStats,
  getSubscriberAutoCollector,
  getNextLockedTower,
  canGoViral,
  hasFinalTower,
  getNextPrestigeTier,
  getPrestigeLevel,
  getPrestigeRunStats,
  getPrestigeTier,
  getPrestigeTowerLpsMultiplier,
  getTowerAmount,
  getTowerCost,
  getTowerEffectiveLps,
  getTotalTowersOwned,
  getUpgradeCost,
  getUpgradeLevel,
  hasUpgradeLevelCap,
  isUpgradeMaxed,
  isTowerUnlocked,
  isUpgradeUnlocked,
  shouldShowUpgradeInShop,
  DESKTOP_COMPANION_DEFAULTS,
  DESKTOP_WINDOW_DEFAULTS,
  DESKTOP_WINDOW_PRESETS,
  PRESTIGE_MAX_LEVEL,
  PRESTIGE_STAT_LEVELS,
  VISUAL_TAKEOVER_DEFAULTS
} from "./state.js";
import { formatDuration, formatFullNumber, formatLongScaleNumber, formatNumber } from "./utils/format.js";

const ORBITER_VISUAL_CAP = 180;
const ORBITERS_PER_RING = 60;
const MODERATION_STAMPS = [
  "POST APPROVED",
  "RULE 3 VIOLATION",
  "MUTED FOR 10M",
  "MOD QUEUE",
  "THREAD LOCKED",
  "RATIO REVIEW"
];
const ALGORITHM_LABELS = [
  "TREND DETECTED",
  "FEED REWRITTEN",
  "USER INTENT: YES",
  "RECOMMENDATION LOOP",
  "ENGAGEMENT ORDER",
  "MEME CLASSIFIED",
  "SCROLL DEPTH MAXED"
];
const COMMENT_RIOT_LINES = [
  "first",
  "ratio",
  "source?",
  "mods asleep",
  "this aged instantly",
  "touch grass",
  "unsubscribed emotionally",
  "based but wrong",
  "who let this cook",
  "algorithm moment"
];
const SUBSCRIBER_MISSED_LINES = [
  "unfollowed before it was cool",
  "left to start a podcast",
  "could not verify the vibe",
  "missed the follow button somehow",
  "went back to lurking",
  "reported the farm to the group chat"
];
const SUBSCRIBER_BOT_LINES = [
  "bot failed captcha",
  "totally real user dissolved",
  "engagement farm rejected",
  "profile picture was a spreadsheet"
];
const POSSESSED_FEED_BASE_LINES = [
  {
    tone: "system",
    actor: "Feed Monitor",
    text: "The Social tab insists this is still a leaderboard feature.",
    meta: "normal UI"
  },
  {
    tone: "system",
    actor: "Engagement Desk",
    text: "Your ranking changed and three fictional analysts pretended to understand why.",
    meta: "live analysis"
  },
  {
    tone: "thread",
    actor: "Pinned Thread",
    text: "Nobody knows who started this meme farm. Everyone is still clicking.",
    meta: "developing"
  },
  {
    tone: "thread",
    actor: "Comment Section",
    text: "Several users are typing essays about whether this counts as content.",
    meta: "volatile"
  }
];
const POSSESSED_FEED_TOWER_LINES = [
  {
    towerId: "meme_subreddit",
    tone: "thread",
    actor: "Meme Subreddit",
    text: "A megathread has formed around your latest statistical accident.",
    meta: "8 rules ignored"
  },
  {
    towerId: "discord_mod",
    tone: "mod",
    actor: "Discord Mod",
    text: "Removed 47 replies for being off-topic, then pinned their own.",
    meta: "thread locked"
  },
  {
    towerId: "ai_meme_generator",
    tone: "ai",
    actor: "AI Meme Generator",
    text: "Generated 4,096 captions and apologized for the six that made sense.",
    meta: "machine humor"
  },
  {
    towerId: "viral_singularity",
    tone: "viral",
    actor: "Viral Singularity",
    text: "Every For You Page briefly became a mirror pointed at your meme.",
    meta: "feed event"
  },
  {
    towerId: "eternal_rickroll_loop",
    tone: "loop",
    actor: "Eternal Loop",
    text: "A link preview opened, closed itself, and started humming confidently.",
    meta: "repeat forever"
  },
  {
    towerId: "reality_glitcher",
    tone: "glitch",
    actor: "Reality Glitcher",
    text: "A reply arrived yesterday to a comment that has not been posted yet.",
    meta: "timestamp broken"
  },
  {
    towerId: "memeconomist",
    tone: "market",
    actor: "Memeconomist",
    text: "The Meme Index is up after analysts priced in one excellent bad idea.",
    meta: "market open"
  },
  {
    towerId: "forbidden_archivist",
    tone: "archive",
    actor: "Archivist",
    text: "Recovered a deleted post from a timeline where this was briefly tasteful.",
    meta: "forbidden cache"
  },
  {
    towerId: "cursed_tiktok_cultist",
    tone: "ritual",
    actor: "TikTok Ritual",
    text: "The captions synced perfectly and the comments began chanting the metric.",
    meta: "3 AM format"
  },
  {
    towerId: "meme_pope",
    tone: "decree",
    actor: "The Meme Pope",
    text: "Issued a decree declaring your leaderboard position canonically dank.",
    meta: "papal update"
  }
];
const POSSESSED_FEED_ALGORITHM_LINES = [
  "Pinned because the algorithm has developed personal taste, which is illegal.",
  "Recommended to users who closed the app three hours ago.",
  "Boosted after the feed decided confusion is a valid retention strategy.",
  "Promoted as a wholesome post despite all available evidence."
];
const DESKTOP_TITLE_MISCHIEF_LINES = [
  "Posting Without Supervision",
  "Algorithm Denies Everything",
  "Desktop Parasite Protocol",
  "Reality Is Buffering",
  "The Feed Is Warm",
  "Engagement Leak Detected"
];
const TOP_BAR_TICKER_TIERS = [
  {
    likes: 0,
    lines: [
      "Local basement poster claims this can stay normal.",
      "One meme button detected. Authorities are monitoring the vibe.",
      "Early farm bulletin: engagement remains legally containable."
    ]
  },
  {
    likes: 1000,
    lines: [
      "Three users noticed the farm. One appears to be a spreadsheet.",
      "Minor feed ripple detected. Someone's group chat is at risk.",
      "Engagement forecast: scattered likes, isolated bad takes."
    ]
  },
  {
    likes: 100000,
    lines: [
      "Your memes are now being recommended to people with jobs.",
      "Platform safety report: the farm has escaped the basement.",
      "A small audience has formed and immediately begun arguing."
    ]
  },
  {
    likes: 10000000,
    lines: [
      "Discourse pressure rising. Comment sections should shelter in place.",
      "The feed has started putting your posts between actual life events.",
      "Brand safety says everything is fine, which is how you know it is not."
    ]
  },
  {
    likes: 10000000000,
    lines: [
      "The meme economy is emitting heat visible from orbit.",
      "Engagement analysts found a new number and are calling it strategy.",
      "Your posting schedule is now considered regional infrastructure."
    ]
  },
  {
    likes: 100000000000000,
    lines: [
      "Bot auditors confirm the numbers are organic if you stop asking.",
      "The group chat has become a sovereign engagement zone.",
      "Several dashboards are sweating through their fonts."
    ]
  },
  {
    likes: 1000000000000000000,
    lines: [
      "Entire comment sections now file quarterly reports to your farm.",
      "The algorithm sent a fruit basket and denied sending a fruit basket.",
      "Trend velocity has exceeded the posted speed limit."
    ]
  },
  {
    likes: 1e24,
    lines: [
      "The algorithm replaced its morning meeting with your latest post.",
      "Influencer weather service reports severe cloutfront conditions.",
      "Moderators are now measuring the farm in geological units."
    ]
  },
  {
    likes: 1e30,
    lines: [
      "Reality officials request you stop converting attention into infrastructure.",
      "Your meme empire has been spotted in background radiation.",
      "Every timeline is pretending it discovered you early."
    ]
  },
  {
    likes: 1e38,
    lines: [
      "Several timelines subscribed and immediately regretted it.",
      "The feed no longer scrolls. It kneels.",
      "Attention markets halted trading after your farm sneezed."
    ]
  },
  {
    likes: 1e45,
    lines: [
      "The internet is no longer hosting your memes; your memes are hosting the internet.",
      "A multiverse inquiry has found the farm funny in 61% of known realities.",
      "The Algorithm Itself has requested a performance review."
    ]
  }
];
const LEGACY_OVERCLOCK_LINES = [
  "OLD FORMAT RE-ENTERED THE DISCOURSE",
  "STARTER TOWER STOCK SURGING",
  "ARCHIVE DUST: MONETIZED",
  "NOSTALGIA ENGINE ONLINE",
  "THE EARLY GAME HAS HANDS NOW",
  "RETRO TEMPLATE CLASS ACTION",
  "LOAD-BEARING CRINGE RESTORED",
  "HISTORY IS POSTING AGAIN"
];
const LEGENDARY_ACHIEVEMENT_PATTERNS = [
  /all/i,
  /every/i,
  /1000000000000/,
  /click_boost_150/,
  /legacy_overclock_all/,
  /crossfeed_all/,
  /tower_level_5_all/,
  /bad_idea_every_outcome/,
  /meme_lab_all_bribes/,
  /subscriber_spawn_all_5/,
  /prestige_/
];
const RARE_ACHIEVEMENT_PATTERNS = [
  /1000000000/,
  /100000000/,
  /click_boost_(50|75|100)/,
  /bad_idea_/,
  /meme_lab_/,
  /legacy_overclock_/,
  /crossfeed_/,
  /tower_swirling_like_button_(500|1000)/,
  /subscribers_(69|420|1000)/
];
const TAKEOVER_OPTIONS = [
  {
    id: "botnet",
    towerId: "botnet",
    label: "Botnet fake cursors",
    description: "Moving fake-user cursors from Botnet."
  },
  {
    id: "discordMod",
    towerId: "discord_mod",
    label: "Discord Mod stamps",
    description: "Moderation stamps from Discord Mod."
  },
  {
    id: "memeLord",
    towerId: "meme_lord",
    label: "Meme Lord rainbow shop",
    description: "A rainbow discourse wave through tower names from Meme Lord."
  },
  {
    id: "rickrollLoop",
    towerId: "eternal_rickroll_loop",
    label: "Rickroll banners",
    description: "Looping warning banners from Eternal Rickroll Loop."
  },
  {
    id: "realityGlitcher",
    towerId: "reality_glitcher",
    label: "Reality glitches",
    description: "Panel slips and glitch slices from Reality Glitcher."
  },
  {
    id: "cursedTikTok",
    towerId: "cursed_tiktok_cultist",
    label: "Cursed TikTok text ritual",
    description: "Tower names physically wave from Cursed TikTok Cultist."
  },
  {
    id: "algorithm",
    towerId: "the_algorithm",
    label: "Algorithm labels",
    description: "System labels from The Algorithm Itself."
  }
];
const STATS_LIFETIME_VIEW_ID = "lifetime";

let elements;
let handlers;
let activeOverlay = null;
let activeTooltip = null;
let activeStatsView = STATS_LIFETIME_VIEW_ID;
let lastOrbiterCount = -1;
let lastTakeoverSignature = "";
let lastCommentRiotBurstAt = 0;
let activeLeaderboardScope = "global";
let activeLeaderboardMetric = LEADERBOARD_METRICS[0].id;
let activeLabProgramId = MEME_LAB_PROGRAMS[0]?.id ?? null;
let activeShopTab = "towers";
const shopScrollPositions = {
  towers: 0,
  upgrades: 0
};
let lastApocalypseEraClass = "";
let lastTopTickerText = "";
let lastTopTickerSignature = "";
let lastPossessedFeedSignature = "";

export function initUI(options) {
  handlers = options;
  elements = collectElements();

  renderTowerShop();
  renderUpgradeShop();
  renderMemeLab();
  bindTopNav();
  bindTabs();
  bindMemeButton();
  bindPrestigeControls();
  bindShopTabs();
  bindSocialControls();

  return {
    update: () => updateUI(options.state),
    updateVisuals: (elapsedSeconds) => updateVisuals(options.state, elapsedSeconds),
    spawnSubscriber: () => spawnSubscriberRaid(options.onCollectSubscriber, options.state),
    showToast,
    showAchievementReaction,
    showLegacyOverclockEvent,
    showPrestigeEvent,
    showGoViralConfirmation,
    showTermsOfServiceModal,
    showBadIdeaConsequenceModal,
    showOfflineModal,
    setSaveStatus,
    closeOverlay
  };
}

export function updateUI(state) {
  updateApocalypseEra(state);
  updateBadIdeaConsequenceClasses(state);
  updateTermsOfServiceClasses(state);
  updateResources(state);
  updatePrestigeDisplay(state);
  updateTowerCards(state);
  updateUpgradeCards(state);
  updateSocial(state);
  updateMemeLab(state);
  updateNextUnlock(state);
  updateTopTicker(state);
  updateDocumentTitle(state);

  if (activeOverlay === "stats" || activeOverlay === "milestones" || activeOverlay === "upgrades") {
    renderOverlay(activeOverlay);
  }

  if (activeTooltip) {
    updateTooltip(activeTooltip.kind, activeTooltip.id, activeTooltip.anchor);
  }
}

function collectElements() {
  return {
    body: document.body,
    topTicker: document.getElementById("top-ticker"),
    prestigePin: document.getElementById("prestige-pin"),
    apocalypseStage: document.getElementById("apocalypse-stage"),
    totalLikes: document.getElementById("total-likes"),
    lps: document.getElementById("likes-per-sec"),
    clickPower: document.getElementById("click-power"),
    subscribers: document.getElementById("subscriber-count"),
    activeBoostTimers: document.getElementById("active-boost-timers"),
    prestigePanel: document.getElementById("prestige-panel"),
    prestigePanelKicker: document.getElementById("prestige-panel-kicker"),
    prestigePanelTitle: document.getElementById("prestige-panel-title"),
    prestigePanelCopy: document.getElementById("prestige-panel-copy"),
    goViralButton: document.getElementById("go-viral-button"),
    memeButton: document.getElementById("meme-button"),
    memeWrapper: document.querySelector(".meme-button-wrapper"),
    orbitContainer: document.getElementById("orbit-container"),
    subscriberContainer: document.getElementById("subscriber-container"),
    takeoverLayer: document.getElementById("takeover-layer"),
    consequenceLayer: document.getElementById("consequence-layer"),
    achievementReactionLayer: document.getElementById("achievement-reaction-layer"),
    rightPanel: document.querySelector(".right-panel"),
    shopTowers: document.getElementById("shop-towers"),
    shopUpgrades: document.getElementById("shop-upgrades"),
    tabTowers: document.getElementById("tab-towers"),
    tabUpgrades: document.getElementById("tab-upgrades"),
    nextUnlock: document.getElementById("next-unlock"),
    leaderboardGlobal: document.getElementById("leaderboard-global"),
    leaderboardFriends: document.getElementById("leaderboard-friends"),
    leaderboardMetricToggle: document.getElementById("leaderboard-metric-toggle"),
    leaderboardMetricList: document.getElementById("leaderboard-metric-list"),
    possessedFeed: document.getElementById("possessed-feed"),
    leaderboardStatus: document.getElementById("leaderboard-status"),
    leaderboardList: document.getElementById("leaderboard-list"),
    labPrograms: document.getElementById("lab-programs"),
    overlay: document.getElementById("nav-overlay"),
    overlayContent: document.getElementById("overlay-content"),
    overlayClose: document.getElementById("overlay-close"),
    tooltip: document.getElementById("tooltip"),
    toastContainer: document.getElementById("toast-container"),
    modalRoot: document.getElementById("modal-root"),
    saveStatus: document.getElementById("save-status")
  };
}

function bindMemeButton() {
  elements.memeButton.addEventListener("click", (event) => {
    elements.memeButton.classList.remove("meme-click-pop");
    void elements.memeButton.offsetWidth;
    elements.memeButton.classList.add("meme-click-pop");

    const gain = handlers.onMemeClick(event);
    const era = getApocalypseEra(handlers.state);
    createLikePopup(`+${formatNumber(gain)}`, event.clientX, event.clientY, getLikePopupCaption(handlers.state, era));
  });

  elements.memeButton.addEventListener("animationend", (event) => {
    if (event.animationName === "memeClickPop") {
      elements.memeButton.classList.remove("meme-click-pop");
    }
  });
}

function bindPrestigeControls() {
  elements.goViralButton?.addEventListener("click", () => {
    handlers.onGoViralRequest?.();
  });
}

function bindTopNav() {
  document.querySelectorAll("[data-overlay]").forEach((button) => {
    button.addEventListener("click", () => {
      openOverlay(button.dataset.overlay);
    });
  });

  elements.overlayClose.addEventListener("click", closeOverlay);
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) {
      closeOverlay();
    }
  });
}

function bindTabs() {
  document.querySelectorAll(".middle-tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;

      document.querySelectorAll(".middle-tab-button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      document.querySelectorAll(".middle-tab-content").forEach((tab) => {
        const active = tab.id === tabId;
        tab.classList.toggle("active", active);
        tab.hidden = !active;
      });
    });
  });
}

function bindShopTabs() {
  elements.tabTowers.addEventListener("click", () => switchShopTab("towers"));
  elements.tabUpgrades.addEventListener("click", () => switchShopTab("upgrades"));
}

function bindSocialControls() {
  const metricCategories = [...new Set(LEADERBOARD_METRICS.map((metric) => metric.category ?? "General"))];
  elements.leaderboardMetricList.innerHTML = metricCategories.map((category) => `
    <section class="leaderboard-metric-group" aria-label="${escapeHtml(category)}">
      <span class="leaderboard-metric-category">${escapeHtml(category)}</span>
      <div class="leaderboard-metric-options">
      ${LEADERBOARD_METRICS
        .filter((metric) => (metric.category ?? "General") === category)
        .map((metric) => `
          <button class="leaderboard-metric-option" type="button" role="option" data-leaderboard-metric="${metric.id}" aria-pressed="${metric.id === activeLeaderboardMetric}" aria-selected="${metric.id === activeLeaderboardMetric}">
            <strong>${escapeHtml(metric.label)}</strong>
            <small>${escapeHtml(metric.description)}</small>
          </button>
        `)
        .join("")}
      </div>
    </section>
  `).join("");

  elements.leaderboardMetricList.querySelectorAll("[data-leaderboard-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      activeLeaderboardMetric = button.dataset.leaderboardMetric;
      setMetricListOpen(false);
      updateSocial(handlers.state);
    });
  });

  elements.leaderboardMetricToggle.addEventListener("click", () => {
    setMetricListOpen(elements.leaderboardMetricList.hidden);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!elements.leaderboardMetricList.hidden && (!(target instanceof Element) || !target.closest(".leaderboard-metric-picker"))) {
      setMetricListOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMetricListOpen(false);
    }
  });

  for (const button of [elements.leaderboardGlobal, elements.leaderboardFriends]) {
    button.addEventListener("click", () => {
      activeLeaderboardScope = button.dataset.leaderboardScope;
      updateSocial(handlers.state);
    });
  }

}

function setMetricListOpen(open) {
  elements.leaderboardMetricList.hidden = !open;
  elements.leaderboardMetricToggle.setAttribute("aria-expanded", String(open));
}

function switchShopTab(tab) {
  if (elements.rightPanel) {
    shopScrollPositions[activeShopTab] = elements.rightPanel.scrollTop;
  }

  const towersActive = tab === "towers";
  activeShopTab = tab;
  elements.tabTowers.classList.toggle("active", towersActive);
  elements.tabUpgrades.classList.toggle("active", !towersActive);
  elements.tabTowers.setAttribute("aria-selected", String(towersActive));
  elements.tabUpgrades.setAttribute("aria-selected", String(!towersActive));
  elements.shopTowers.hidden = !towersActive;
  elements.shopUpgrades.hidden = towersActive;
  elements.nextUnlock.hidden = !towersActive;
  elements.shopTowers.classList.toggle("active", towersActive);
  elements.shopUpgrades.classList.toggle("active", !towersActive);
  updateNextUnlock(handlers.state);

  window.requestAnimationFrame(() => {
    if (elements.rightPanel) {
      elements.rightPanel.scrollTop = shopScrollPositions[tab] ?? 0;
    }
  });
}

function renderTowerShop() {
  elements.shopTowers.innerHTML = TOWERS.map((tower, index) => `
    <button class="shop-card tower-card" type="button" data-tower-id="${tower.id}" aria-label="Buy ${escapeHtml(tower.displayName)}" style="--tower-index:${index}; --rainbow-delay:${(index * -0.075).toFixed(3)}s; --rainbow-hue:${(190 + index * 31) % 360}deg;">
      <img class="shop-icon" src="${tower.image}" alt="${escapeHtml(tower.displayName)}" loading="lazy" />
      <span class="shop-count" data-role="count">x0</span>
      <span class="shop-state" data-role="state">Locked</span>
      <span class="shop-copy">
        <span class="shop-name" aria-label="${escapeHtml(tower.displayName)}">${renderShopNameText(tower.displayName)}</span>
        <span class="shop-meta">
          <span class="shop-meta-line">
            <b class="shop-meta-label">Price:</b>
            <span class="shop-meta-value" data-role="cost">0 Likes</span>
          </span>
          <span class="shop-meta-line">
            <b class="shop-meta-label">Producing:</b>
            <span class="shop-meta-value" data-role="production">0 LPS</span>
          </span>
        </span>
      </span>
    </button>
  `).join("");

  elements.shopTowers.querySelectorAll("[data-tower-id]").forEach((card) => {
    const id = card.dataset.towerId;
    card.addEventListener("click", () => handlers.onBuyTower(id));
    card.addEventListener("mouseenter", () => showTooltip("tower", id, card));
    card.addEventListener("focus", () => showTooltip("tower", id, card));
    card.addEventListener("mouseleave", hideTooltip);
    card.addEventListener("blur", hideTooltip);
  });
}

function renderUpgradeShop() {
  elements.shopUpgrades.innerHTML = UPGRADES.map((upgrade) => `
    <button class="shop-card upgrade-card" type="button" data-upgrade-id="${upgrade.id}" aria-label="Buy ${escapeHtml(upgrade.displayName)}">
      <img class="shop-icon" src="${upgrade.image}" alt="${escapeHtml(upgrade.displayName)}" loading="lazy" />
      <span class="shop-count" data-role="count">Lvl. 0</span>
      <span class="shop-state" data-role="state">Locked</span>
      <span class="shop-copy">
        <span class="shop-name">${escapeHtml(upgrade.displayName)}</span>
        <span class="shop-desc">${escapeHtml(upgrade.description)}</span>
        <span class="shop-meta">
          <span data-role="cost">0 Likes</span>
          <span data-role="effect">${escapeHtml(describeUpgradeEffect(upgrade))}</span>
        </span>
      </span>
    </button>
  `).join("");

  elements.shopUpgrades.querySelectorAll("[data-upgrade-id]").forEach((card) => {
    const id = card.dataset.upgradeId;
    card.addEventListener("click", () => handlers.onBuyUpgrade(id));
    card.addEventListener("mouseenter", () => showTooltip("upgrade", id, card));
    card.addEventListener("focus", () => showTooltip("upgrade", id, card));
    card.addEventListener("mouseleave", hideTooltip);
    card.addEventListener("blur", hideTooltip);
  });
}

function renderMemeLab() {
  const activeProgram = getActiveLabProgram();

  elements.labPrograms.innerHTML = `
    <div class="lab-program-picker" role="tablist" aria-label="Meme Lab programs">
      ${MEME_LAB_PROGRAMS.map((program) => `
        <button class="lab-program-tab ${program.id === activeProgram.id ? "active" : ""}" type="button" role="tab" aria-selected="${program.id === activeProgram.id}" data-lab-program-select="${program.id}">
          <strong>${escapeHtml(program.title)}</strong>
          <span>${escapeHtml(program.eyebrow)}</span>
        </button>
      `).join("")}
    </div>
    <div class="lab-program-content">
      ${renderLabProgram(activeProgram)}
    </div>
  `;

  elements.labPrograms.querySelectorAll("[data-lab-program-select]").forEach((button) => {
    button.addEventListener("click", () => {
      activeLabProgramId = button.dataset.labProgramSelect;
      renderMemeLab();
      updateMemeLab(handlers.state);
    });
  });

  elements.labPrograms.querySelectorAll("[data-lab-boost-id]").forEach((card) => {
    card.addEventListener("click", () => handlers.onBuyLabBoost(card.dataset.labBoostId));
  });

  const badIdeaButton = elements.labPrograms.querySelector("[data-lab-action='bad-idea']");
  badIdeaButton?.addEventListener("click", handlers.onPressBadIdeaButton);
}

function renderLabProgram(program) {
  if (program.type === "bad_idea_button") {
    return renderBadIdeaProgram(program);
  }

  return renderBoostProgram(program);
}

function getActiveLabProgram() {
  const activeProgram = MEME_LAB_PROGRAMS.find((program) => program.id === activeLabProgramId) ?? MEME_LAB_PROGRAMS[0];
  activeLabProgramId = activeProgram.id;
  return activeProgram;
}

function renderBoostProgram(program) {
  return `
    <article class="lab-program" data-lab-program="${program.id}">
      <div class="lab-program-header">
        <span class="eyebrow">${escapeHtml(program.eyebrow)}</span>
        <h2>${escapeHtml(program.title)}</h2>
        <p>${escapeHtml(program.description)}</p>
      </div>
      <div class="lab-boost-grid">
        ${program.boosts.map((boost) => `
          <button class="lab-boost-card" type="button" data-lab-boost-id="${boost.id}">
            <span class="lab-boost-topline">
              <strong>${escapeHtml(boost.name)}</strong>
              <span data-role="status">Ready</span>
            </span>
            <span class="lab-boost-description">${escapeHtml(boost.description)}</span>
            <span class="lab-boost-effects">
              ${formatBoostMultiplier("LPS", boost.lpsMultiplier)}
              ${formatBoostMultiplier("Click", boost.clickMultiplier)}
              <span>${formatDuration(boost.durationSeconds)}</span>
            </span>
            <span class="lab-boost-cost" data-role="cost">${formatNumber(boost.subscriberCost)} Subscribers</span>
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function renderBadIdeaProgram(program) {
  return `
    <article class="lab-program bad-idea-program" data-lab-program="${program.id}">
      <div class="lab-program-header">
        <span class="eyebrow">${escapeHtml(program.eyebrow)}</span>
        <h2>${escapeHtml(program.title)}</h2>
        <p>${escapeHtml(program.description)}</p>
      </div>
      <div class="bad-idea-layout">
        <button class="bad-idea-button" type="button" data-lab-action="bad-idea">
          <span class="bad-idea-button-label">Press Bad Idea</span>
          <span class="bad-idea-button-cost" data-role="bad-idea-cost">${formatNumber(program.subscriberCost)} Subscribers</span>
          <span class="bad-idea-button-state" data-role="bad-idea-state">Ready</span>
        </button>
        <div class="bad-idea-result" data-role="bad-idea-result">
          <small>Last outcome</small>
          <span>No bad idea committed yet.</span>
        </div>
      </div>
      <div class="bad-idea-outcomes">
        <h3>Possible outcomes</h3>
        <div class="bad-idea-outcome-list">
          ${program.outcomes.map((outcome) => `
            <div class="bad-idea-outcome">
              <strong>${escapeHtml(outcome.name)}</strong>
              <span>${escapeHtml(outcome.description)}</span>
              <small>${formatOutcomeChance(outcome, program.outcomes)} chance</small>
            </div>
          `).join("")}
        </div>
      </div>
    </article>
  `;
}

function updateResources(state) {
  const labMultipliers = getLabBoostMultipliers(state);
  const obscureLpsBoosts = getActiveObscureLpsBoosts(state);
  const obscureLpsMultiplier = obscureLpsBoosts.reduce((multiplier, boost) => multiplier * boost.multiplier, 1);
  const era = getApocalypseEra(state);
  const clickVerb = getActiveClickVerb(state, era);
  elements.apocalypseStage.textContent = era.title;
  elements.apocalypseStage.title = era.description;
  elements.totalLikes.textContent = `${formatLongScaleNumber(state.likes)} Likes`;
  elements.lps.textContent = `${formatLongScaleNumber(getLikesPerSecond(state))} LPS${labMultipliers.lps > 1 ? ` x${formatNumber(labMultipliers.lps)}` : ""}${obscureLpsMultiplier > 1 ? ` doom x${formatNumber(obscureLpsMultiplier)}` : ""}`;
  elements.lps.classList.toggle("is-obscure-boosted", obscureLpsMultiplier > 1);
  elements.clickPower.textContent = `+${formatLongScaleNumber(getClickPower(state))} per ${clickVerb} click${labMultipliers.click > 1 ? ` x${formatNumber(labMultipliers.click)}` : ""}`;
  elements.subscribers.textContent = `${formatNumber(state.subscribers)} Subscribers`;
  updateActiveBoostTimers(state);
}

function updatePrestigeDisplay(state) {
  const level = getPrestigeLevel(state);
  const tier = getPrestigeTier(state);
  const nextTier = getNextPrestigeTier(state);
  const currentLpsMultiplier = getPrestigeTowerLpsMultiplier(state);
  const nextLpsMultiplier = nextTier
    ? getPrestigeTowerLpsMultiplier(nextTier.level)
    : currentLpsMultiplier;
  const eligible = canGoViral(state);
  const finalTowerOwned = hasFinalTower(state);

  if (elements.prestigePin) {
    elements.prestigePin.hidden = level <= 0;
    elements.prestigePin.className = level > 0
      ? `prestige-pin prestige-pin-${level}`
      : "prestige-pin prestige-pin-hidden";
    elements.prestigePin.textContent = tier?.symbol ?? "";
    elements.prestigePin.title = tier ? `${tier.pinName}: ${tier.description}` : "";
    elements.prestigePin.setAttribute("aria-label", tier ? `${tier.pinName}, prestige ${level}` : "No Go Viral prestige");
  }

  if (!elements.prestigePanel) {
    return;
  }

  const shouldShow = finalTowerOwned;
  elements.prestigePanel.hidden = !shouldShow;

  if (!shouldShow) {
    return;
  }

  elements.prestigePanel.dataset.prestigeLevel = String(level);
  elements.prestigePanel.classList.toggle("is-eligible", eligible);
  elements.prestigePanel.classList.toggle("is-maxed", level >= PRESTIGE_MAX_LEVEL);

  if (level >= PRESTIGE_MAX_LEVEL) {
    elements.prestigePanelKicker.textContent = "Max Viral Prestige";
    elements.prestigePanelTitle.textContent = tier?.pinName ?? "Mythic feed status";
    elements.prestigePanelCopy.textContent = `Permanent x${currentLpsMultiplier} tower LPS is active. All three public prestige pins are yours.`;
    elements.goViralButton.disabled = true;
    elements.goViralButton.textContent = "Fully Viral";
    return;
  }

  elements.prestigePanelKicker.textContent = level > 0
    ? `${tier.pinName} active`
    : "Go Viral";
  elements.prestigePanelTitle.textContent = nextTier
    ? `Next pin: ${nextTier.pinName}`
    : "The feed is watching";
  elements.prestigePanelCopy.textContent = eligible
    ? `Permanent reward: all tower LPS increases from x${currentLpsMultiplier} to x${nextLpsMultiplier}. This resets the current run.`
    : "Buy the final tower to make this run eligible for a Go Viral reset.";
  elements.goViralButton.disabled = !eligible;
  elements.goViralButton.textContent = nextTier
    ? `Go Viral: ${nextTier.symbol} / x${nextLpsMultiplier} LPS`
    : "Go Viral";
}

function renderPrestigePin(level, variant = "") {
  const normalizedLevel = Math.max(0, Math.min(PRESTIGE_MAX_LEVEL, Math.floor(Number(level) || 0)));
  const tier = getPrestigeTier(normalizedLevel);

  if (!tier) {
    return "";
  }

  const variantClass = variant ? ` prestige-pin-${variant}` : "";
  return `<span class="prestige-pin prestige-pin-${normalizedLevel}${variantClass}" title="${escapeHtml(tier.pinName)}" aria-label="${escapeHtml(tier.pinName)}">${escapeHtml(tier.symbol)}</span>`;
}

function updateTopTicker(state) {
  if (!elements.topTicker) {
    return;
  }

  const { signature, text } = getTopTickerSnapshot(state);

  if (signature === lastTopTickerSignature) {
    return;
  }

  lastTopTickerSignature = signature;
  lastTopTickerText = text;
  elements.topTicker.innerHTML = `
    <span data-role="ticker-track">
      <span>${escapeHtml(text)}</span>
      <span>${escapeHtml(text)}</span>
    </span>
  `;
}

function getTopTickerSnapshot(state) {
  const tier = [...TOP_BAR_TICKER_TIERS]
    .reverse()
    .find((item) => state.totalLikesEver >= item.likes) ?? TOP_BAR_TICKER_TIERS[0];
  const index = Math.floor((state.playTimeSeconds ?? 0) / 12) % tier.lines.length;
  const era = getApocalypseEra(state);
  const bulletin = tier.lines[index];
  const termsTicker = getTermsOfServiceTickerLine(state);
  return {
    signature: `${era.id}|${tier.likes}|${index}|${termsTicker}`,
    text: `${era.label} bulletin // ${bulletin} // ${formatNumber(state.totalLikesEver)} lifetime likes // ${formatNumber(getTotalTowersOwned(state))} towers implicated${termsTicker ? ` // legal status: ${termsTicker}` : ""}`
  };
}

function getAcceptedTermsEvents(source) {
  return TERMS_OF_SERVICE_EVENTS.filter((event) => hasAcceptedTermsEvent(source, event.id));
}

function hasAcceptedTermsEvent(source, eventId) {
  return Boolean(getAcceptedTermsMap(source)[eventId]);
}

function getAcceptedTermsMap(source) {
  return source?.stats?.acceptedTerms ?? source?.acceptedTerms ?? {};
}

function getTermsOfServiceTickerLine(state) {
  const acceptedEvents = getAcceptedTermsEvents(state);

  if (acceptedEvents.length === 0) {
    return "";
  }

  const slot = Math.floor((state.playTimeSeconds ?? 0) / 18);
  const event = acceptedEvents[slot % acceptedEvents.length];
  return event.tickerLines[slot % event.tickerLines.length];
}

function getActiveClickVerb(state, era) {
  if (hasActiveBadIdeaConsequence(state, "apology_arc")) {
    return "apology";
  }

  if (hasActiveBadIdeaConsequence(state, "brand_safety_mode")) {
    return "brand-safe";
  }

  return era.clickVerb;
}

function updateApocalypseEra(state) {
  const era = getApocalypseEra(state);

  if (lastApocalypseEraClass && lastApocalypseEraClass !== era.className) {
    elements.body.classList.remove(lastApocalypseEraClass);
  }

  if (lastApocalypseEraClass !== era.className) {
    elements.body.classList.add(era.className);
    elements.body.dataset.apocalypseEra = era.id;
    elements.body.dataset.apocalypseLabel = era.label;
    elements.body.dataset.apocalypseHint = era.unlockHint;
    lastApocalypseEraClass = era.className;
  }
}

function updateBadIdeaConsequenceClasses(state) {
  elements.body.classList.toggle("consequence-brand-safety", hasActiveBadIdeaConsequence(state, "brand_safety_mode"));
  elements.body.classList.toggle("consequence-comment-riot", hasActiveBadIdeaConsequence(state, "comment_section_riot"));
  elements.body.classList.toggle("consequence-apology-arc", hasActiveBadIdeaConsequence(state, "apology_arc"));
  elements.body.classList.toggle("consequence-algorithm-denial", hasActiveBadIdeaConsequence(state, "algorithm_denial_letter"));
}

function updateTermsOfServiceClasses(state) {
  for (const event of TERMS_OF_SERVICE_EVENTS) {
    elements.body.classList.toggle(event.bodyClass, hasAcceptedTermsEvent(state, event.id));
  }
}

function updateActiveBoostTimers(state) {
  const activeBoosts = getActiveLabBoosts(state).filter((boost) => boost.programId === "algorithm_bribe");
  const activeObscureBoosts = getActiveObscureLpsBoosts(state);
  const activeConsequences = getActiveBadIdeaConsequences(state);

  if (activeBoosts.length === 0 && activeObscureBoosts.length === 0 && activeConsequences.length === 0) {
    elements.activeBoostTimers.hidden = true;
    elements.activeBoostTimers.innerHTML = "";
    return;
  }

  elements.activeBoostTimers.hidden = false;
  elements.activeBoostTimers.innerHTML = `
    ${activeBoosts.length > 0
      ? `<span class="active-boost-heading">Algorithm Bribe</span>
        ${activeBoosts.map((boost) => `
          <span class="active-boost-timer">
            <strong>${escapeHtml(boost.name)}</strong>
            <span>${formatDuration(boost.remainingSeconds)}</span>
          </span>
        `).join("")}`
      : ""}
    ${activeObscureBoosts.length > 0
      ? `<span class="active-boost-heading active-obscure-boost-heading">Doomscroll Surge</span>
        ${activeObscureBoosts.map((boost) => `
          <span class="active-boost-timer active-obscure-boost-timer">
            <strong>${escapeHtml(boost.name)} x${formatNumber(boost.multiplier)}</strong>
            <span>${formatDuration(boost.remainingSeconds)}</span>
          </span>
        `).join("")}`
      : ""}
    ${activeConsequences.length > 0
      ? `<span class="active-boost-heading active-consequence-heading">Bad Idea Aftermath</span>
        ${activeConsequences.map((consequence) => `
          <span class="active-boost-timer active-consequence-timer">
            <strong>${escapeHtml(consequence.title)}</strong>
            <span>${formatDuration(consequence.remainingSeconds)}</span>
          </span>
        `).join("")}`
      : ""}
  `;
}

function updateTowerCards(state) {
  for (const [index, tower] of TOWERS.entries()) {
    const card = elements.shopTowers.querySelector(`[data-tower-id="${tower.id}"]`);
    const unlocked = isTowerUnlocked(state, tower);
    const amount = getTowerAmount(state, tower.id);
    const cost = getTowerCost(state, tower.id);
    const canAfford = state.likes >= cost;
    const copy = getTowerDisplayCopy(state, tower, index);

    card.hidden = !unlocked;
    card.classList.toggle("is-affordable", unlocked && canAfford);
    card.classList.toggle("is-unaffordable", unlocked && !canAfford);
    card.setAttribute("aria-disabled", String(!unlocked || !canAfford));
    const nameElement = card.querySelector(".shop-name");
    if (nameElement.dataset.displayName !== copy.displayName) {
      nameElement.dataset.displayName = copy.displayName;
      nameElement.setAttribute("aria-label", copy.displayName);
      nameElement.innerHTML = renderShopNameText(copy.displayName);
    }
    card.querySelector('[data-role="count"]').textContent = `x${formatNumber(amount)}`;
    card.querySelector('[data-role="cost"]').textContent = `${formatNumber(cost)} Likes`;
    card.querySelector('[data-role="production"]').textContent = `${formatNumber(tower.lps * getTowerMultiplierForDisplay(state, tower.id))} LPS`;
    const stateElement = card.querySelector('[data-role="state"]');
    const stateText = canAfford ? "Can afford" : `Need ${formatNumber(cost - state.likes)}`;
    stateElement.textContent = stateText;
    stateElement.title = stateText;
  }
}

function updateUpgradeCards(state) {
  for (const upgrade of UPGRADES) {
    const card = elements.shopUpgrades.querySelector(`[data-upgrade-id="${upgrade.id}"]`);
    const unlocked = isUpgradeUnlocked(state, upgrade);
    const visible = shouldShowUpgradeInShop(state, upgrade);
    const level = getUpgradeLevel(state, upgrade.id);
    const maxed = isUpgradeMaxed(state, upgrade);
    const cost = getUpgradeCost(state, upgrade.id);
    const canAfford = state.likes >= cost;

    card.hidden = !visible;
    card.classList.toggle("is-affordable", unlocked && canAfford && !maxed);
    card.classList.toggle("is-unaffordable", unlocked && !canAfford && !maxed);
    card.classList.toggle("is-maxed", maxed);
    card.setAttribute("aria-disabled", String(!unlocked || !canAfford || maxed));
    card.querySelector('[data-role="count"]').textContent = formatUpgradeLevel(upgrade, level);
    card.querySelector('[data-role="cost"]').textContent = maxed ? "Maxed" : `${formatNumber(cost)} Likes`;
    card.querySelector('[data-role="state"]').textContent = maxed ? "Maxed" : (canAfford ? "Can afford" : `Need ${formatNumber(cost - state.likes)}`);
  }
}

function renderShopNameText(displayName) {
  const letters = Array.from(displayName).map((char, index) => {
    const content = char === " " ? "&nbsp;" : escapeHtml(char);
    const delay = (index * 0.055).toFixed(3);
    const hue = (190 + index * 18) % 360;
    return `<span class="shop-name-letter" style="--letter-delay:${delay}s; --letter-hue:${hue}deg;">${content}</span>`;
  }).join("");

  return `<span class="shop-name-plain">${escapeHtml(displayName)}</span><span class="shop-name-wave" aria-hidden="true">${letters}</span>`;
}

function getTowerDisplayCopy(state, tower, index = TOWERS.findIndex((item) => item.id === tower.id)) {
  if (!hasActiveBadIdeaConsequence(state, "brand_safety_mode")) {
    return {
      displayName: tower.displayName,
      description: tower.description
    };
  }

  return {
    displayName: `Brand Safe Asset #${String(index + 1).padStart(2, "0")}`,
    description: "This creator-facing engagement unit has been reviewed for advertiser comfort."
  };
}

function updateNextUnlock(state) {
  if (activeShopTab !== "towers") {
    elements.nextUnlock.hidden = true;
    elements.nextUnlock.textContent = "";
    return;
  }

  const nextTower = getNextLockedTower(state);

  if (!nextTower) {
    elements.nextUnlock.hidden = true;
    elements.nextUnlock.textContent = "";
    return;
  }

  const needed = Math.max(0, (nextTower.unlockAt?.totalLikesEver ?? 0) - state.totalLikesEver);
  elements.nextUnlock.hidden = false;
  elements.nextUnlock.textContent = needed > 0
    ? `Next tower reveal: ${nextTower.displayName} in ${formatNumber(needed)} total likes`
    : `Next tower reveal: ${nextTower.displayName}`;
}

function updateSocial(state) {
  const metric = getLeaderboardMetric(activeLeaderboardMetric);
  const playerValue = getLeaderboardMetricValue(state, metric.id);
  const rows = getLeaderboardRows(state, {
    scope: activeLeaderboardScope,
    metricId: metric.id
  });
  const playerRow = rows.find((row) => row.isPlayer);

  elements.leaderboardGlobal.classList.toggle("active", activeLeaderboardScope === "global");
  elements.leaderboardFriends.classList.toggle("active", activeLeaderboardScope === "friends");
  elements.leaderboardGlobal.setAttribute("aria-selected", String(activeLeaderboardScope === "global"));
  elements.leaderboardFriends.setAttribute("aria-selected", String(activeLeaderboardScope === "friends"));
  elements.leaderboardMetricToggle.querySelector('[data-role="selected-metric"]').textContent = metric.label;
  elements.leaderboardMetricToggle.querySelector('[data-role="selected-metric-description"]').textContent = metric.description;
  elements.leaderboardMetricList.querySelectorAll("[data-leaderboard-metric]").forEach((button) => {
    const active = button.dataset.leaderboardMetric === metric.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-selected", String(active));
  });

  updatePossessedFeed(state, rows, metric, playerRow);

  elements.leaderboardStatus.innerHTML = `
    <span>${escapeHtml(metric.description)}</span>
    <strong>Your ${escapeHtml(metric.label)}: ${escapeHtml(formatLeaderboardValue(metric.id, playerValue))}</strong>
    <small>${activeLeaderboardScope === "friends" ? "Friends ranking" : "Global ranking"}</small>
  `;

  elements.leaderboardList.innerHTML = rows.map((row) => `
    <div class="leaderboard-row ${row.isPlayer ? "is-player" : ""}">
      <span class="leaderboard-rank">#${row.rank}</span>
      <span class="leaderboard-player">
        <strong>${escapeHtml(row.name)}${renderPrestigePin(row.prestigeLevel, "leaderboard")}</strong>
        ${row.isPlayer ? "<small>You</small>" : `<small>${activeLeaderboardScope === "friends" ? "Friend" : "Player"}</small>`}
      </span>
      <span class="leaderboard-score">${escapeHtml(formatLeaderboardValue(metric.id, row.score))}</span>
    </div>
  `).join("");

  if (playerRow) {
    elements.leaderboardStatus.dataset.rank = `#${playerRow.rank}`;
  }
}

function updatePossessedFeed(state, rows, metric, playerRow) {
  if (!elements.possessedFeed) {
    return;
  }

  const items = getPossessedFeedItems(state, rows, metric, playerRow);
  const status = getPossessedFeedStatus(state);
  const signature = `${status}|${items.map((item) => `${item.actor}:${item.text}:${item.meta}:${item.pinned ? 1 : 0}`).join("|")}`;

  if (signature === lastPossessedFeedSignature) {
    return;
  }

  lastPossessedFeedSignature = signature;
  elements.possessedFeed.innerHTML = `
    <div class="possessed-feed-header">
      <span>Live Feed</span>
      <strong>${escapeHtml(status)}</strong>
    </div>
    <div class="possessed-feed-list">
      ${items.map((item) => `
        <article class="possessed-feed-item is-${item.tone}${item.pinned ? " is-pinned" : ""}">
          <span class="possessed-feed-actor">${escapeHtml(item.actor)}</span>
          <span class="possessed-feed-text">${escapeHtml(item.text)}</span>
          <span class="possessed-feed-meta">${escapeHtml(item.meta)}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function getPossessedFeedItems(state, rows, metric, playerRow) {
  const slot = Math.floor((state.playTimeSeconds ?? 0) / 9);
  const topRow = rows.find((row) => !row.isPlayer) ?? rows[0];
  const playerRank = playerRow ? `#${playerRow.rank}` : "unranked";
  const topPlayerName = topRow?.name ?? "Someone with a concerning amount of free time";
  const scopeName = activeLeaderboardScope === "friends" ? "Steam friends" : "global";
  const contextItems = [
    {
      tone: "system",
      actor: "Leaderboard Wire",
      text: `${topPlayerName} is currently haunting ${metric.label}. You are ${playerRank}.`,
      meta: scopeName
    },
    {
      tone: "system",
      actor: "Metric Desk",
      text: `${metric.label} updated. The feed described it as "deeply normal" and refused comment.`,
      meta: "metric watch"
    },
    ...POSSESSED_FEED_BASE_LINES
  ];
  const towerItems = getPossessedTowerFeedItems(state, metric, slot);
  const termsItems = getTermsOfServiceFeedItems(state);
  const pinnedItems = towerItems.filter((item) => item.pinned);
  const rotatingItems = [...towerItems.filter((item) => !item.pinned), ...termsItems, ...contextItems];
  const start = rotatingItems.length > 0 ? slot % rotatingItems.length : 0;
  const orderedItems = [
    ...pinnedItems,
    ...rotatingItems.slice(start),
    ...rotatingItems.slice(0, start)
  ];

  return orderedItems.slice(0, 5);
}

function getPossessedTowerFeedItems(state, metric, slot) {
  const items = [];
  const botnets = getTowerAmount(state, "botnet");

  if (botnets > 0) {
    const firstBot = String((slot * 7) % 97).padStart(2, "0");
    const secondBot = String(((slot * 7) + 1) % 97).padStart(2, "0");
    const text = "This meme is fire. Very organic. Please engage.";
    items.push(
      {
        tone: "bot",
        actor: `REAL_USER_${firstBot}`,
        text,
        meta: `${formatNumber(botnets)} nodes`
      },
      {
        tone: "bot",
        actor: `REAL_USER_${secondBot}`,
        text,
        meta: "same opinion"
      }
    );
  }

  for (const line of POSSESSED_FEED_TOWER_LINES) {
    const amount = getTowerAmount(state, line.towerId);

    if (amount > 0) {
      items.push({
        tone: line.tone,
        actor: line.actor,
        text: line.text,
        meta: amount > 1 ? `${formatNumber(amount)} active` : line.meta
      });
    }
  }

  if (getTowerAmount(state, "the_algorithm") > 0) {
    items.push({
      tone: "algorithm",
      actor: "The Algorithm",
      text: POSSESSED_FEED_ALGORITHM_LINES[slot % POSSESSED_FEED_ALGORITHM_LINES.length],
      meta: metric.label,
      pinned: true
    });
  }

  return items;
}

function getTermsOfServiceFeedItems(state) {
  return getAcceptedTermsEvents(state).map((event) => event.feedItem);
}

function getPossessedFeedStatus(state) {
  if (getTowerAmount(state, "the_algorithm") > 0) {
    return "Algorithm-curated nonsense";
  }

  if (getTowerAmount(state, "meme_pope") > 0) {
    return "Papal commentary live";
  }

  if (getTowerAmount(state, "cursed_tiktok_cultist") > 0) {
    return "Ritual comments detected";
  }

  if (getTowerAmount(state, "discord_mod") > 0) {
    return "Moderation queue unstable";
  }

  if (getTowerAmount(state, "botnet") > 0) {
    return "Mostly real users";
  }

  return "The internet is warming up";
}

function updateMemeLab(state) {
  const activeProgram = getActiveLabProgram();

  for (const program of MEME_LAB_PROGRAMS) {
    const selector = elements.labPrograms.querySelector(`[data-lab-program-select="${program.id}"]`);
    const active = program.id === activeProgram.id;
    selector?.classList.toggle("active", active);
    selector?.setAttribute("aria-selected", String(active));
  }

  if (activeProgram.type === "bad_idea_button") {
    updateBadIdeaProgram(state, activeProgram);
    return;
  }

  const activeBoosts = getActiveLabBoosts(state);
  const activeById = new Map(activeBoosts.map((boost) => [boost.id, boost]));
  const hasActiveProgramBoost = hasActiveLabProgramBoost(state, activeProgram.id);

  for (const boost of activeProgram.boosts) {
    const card = elements.labPrograms.querySelector(`[data-lab-boost-id="${boost.id}"]`);
    const active = activeById.get(boost.id);
    const canAfford = state.subscribers >= boost.subscriberCost;
    const blockedByProgramBoost = hasActiveProgramBoost && !active;

    card.classList.toggle("is-active", Boolean(active));
    card.classList.toggle("is-affordable", !active && !blockedByProgramBoost && canAfford);
    card.classList.toggle("is-unaffordable", !active && !blockedByProgramBoost && !canAfford);
    card.classList.toggle("is-program-blocked", blockedByProgramBoost);
    card.disabled = Boolean(active) || blockedByProgramBoost || !canAfford;
    card.querySelector('[data-role="status"]').textContent = active
      ? "Active"
      : blockedByProgramBoost
        ? "Wait for current bribe"
        : canAfford
        ? "Ready"
        : `Need ${formatNumber(boost.subscriberCost - state.subscribers)}`;
    card.querySelector('[data-role="cost"]').textContent = active
      ? "Timer in resource box"
      : blockedByProgramBoost
        ? "Bribe already active"
      : `${formatNumber(boost.subscriberCost)} Subscribers`;
  }
}

function updateBadIdeaProgram(state, program) {
  const button = elements.labPrograms.querySelector("[data-lab-action='bad-idea']");
  const stateLabel = elements.labPrograms.querySelector("[data-role='bad-idea-state']");
  const costLabel = elements.labPrograms.querySelector("[data-role='bad-idea-cost']");
  const resultPanel = elements.labPrograms.querySelector("[data-role='bad-idea-result']");
  const canAfford = state.subscribers >= program.subscriberCost;
  const lastOutcome = state.lab?.lastBadIdeaOutcome;

  button.disabled = !canAfford;
  button.classList.toggle("is-affordable", canAfford);
  button.classList.toggle("is-unaffordable", !canAfford);
  costLabel.textContent = `${formatNumber(program.subscriberCost)} Subscribers`;
  stateLabel.textContent = canAfford
    ? "Ready to regret"
    : `Need ${formatNumber(program.subscriberCost - state.subscribers)}`;

  if (!lastOutcome) {
    resultPanel.innerHTML = `
      <small>Last outcome</small>
      <span>No bad idea committed yet.</span>
    `;
    return;
  }

  resultPanel.innerHTML = `
    <small>Last outcome</small>
    <strong>${escapeHtml(lastOutcome.name)}</strong>
    <span>${escapeHtml(lastOutcome.message)}</span>
  `;
}

function updateDocumentTitle(state) {
  const era = getApocalypseEra(state);
  const desktopSettings = getDesktopCompanionSettings(state);

  if (!desktopSettings.enabled || !desktopSettings.titleMischief) {
    document.title = `${formatNumber(state.likes)} Likes - ${era.label} - Meme Farm`;
    return;
  }

  const index = Math.floor((state.playTimeSeconds ?? 0) / 45) % DESKTOP_TITLE_MISCHIEF_LINES.length;
  document.title = `${formatNumber(state.likes)} Likes - ${DESKTOP_TITLE_MISCHIEF_LINES[index]} - Meme Farm`;
}

function updateVisuals(state, elapsedSeconds) {
  updateOrbiters(getTowerAmount(state, "swirling_like_button"), elapsedSeconds);
  updateTowerTakeovers(state, elapsedSeconds);
  updateBadIdeaConsequenceVisuals(state, elapsedSeconds);
}

function updateBadIdeaConsequenceVisuals(state, elapsedSeconds) {
  if (!hasActiveBadIdeaConsequence(state, "comment_section_riot")) {
    lastCommentRiotBurstAt = 0;
    return;
  }

  if (elapsedSeconds - lastCommentRiotBurstAt < 0.72) {
    return;
  }

  lastCommentRiotBurstAt = elapsedSeconds;
  const burstCount = 2 + Math.floor(Math.random() * 2);

  for (let index = 0; index < burstCount; index += 1) {
    createCommentRiotBubble();
  }
}

function createCommentRiotBubble() {
  const bubble = document.createElement("span");
  const line = COMMENT_RIOT_LINES[Math.floor(Math.random() * COMMENT_RIOT_LINES.length)];
  bubble.className = "comment-riot-bubble";
  bubble.textContent = line;
  bubble.style.left = `${6 + Math.random() * 82}%`;
  bubble.style.top = `${12 + Math.random() * 72}%`;
  bubble.style.setProperty("--r", `${-10 + Math.random() * 20}deg`);
  elements.consequenceLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2600);
}

function updateTowerTakeovers(state, elapsedSeconds) {
  const config = getTowerTakeoverConfig(state);
  const signature = [
    config.cursorCount,
    config.stampCount,
    config.hasMemeLord ? 1 : 0,
    config.bannerCount,
    config.hasRealityGlitcher ? 1 : 0,
    config.hasCursedTikTok ? 1 : 0,
    config.algorithmLabelCount
  ].join("|");

  elements.body.classList.toggle("takeover-botnet", config.cursorCount > 0);
  elements.body.classList.toggle("takeover-discord-mod", config.stampCount > 0);
  elements.body.classList.toggle("takeover-meme-lord", config.hasMemeLord);
  elements.body.classList.toggle("takeover-rickroll-loop", config.bannerCount > 0);
  elements.body.classList.toggle("takeover-reality-glitcher", config.hasRealityGlitcher);
  elements.body.classList.toggle("takeover-cursed-tiktok", config.hasCursedTikTok);
  elements.body.classList.toggle("takeover-algorithm", config.algorithmLabelCount > 0);

  if (!hasActiveTowerTakeover(config)) {
    clearTowerTakeovers();
    return;
  }

  if (signature !== lastTakeoverSignature) {
    renderTowerTakeovers(config);
    lastTakeoverSignature = signature;
  }

  animateTakeoverCursors(elapsedSeconds);
}

function getTowerTakeoverConfig(state) {
  const settings = getVisualTakeoverSettings(state);
  const botnets = settings.botnet ? getTowerAmount(state, "botnet") : 0;
  const discordMods = settings.discordMod ? getTowerAmount(state, "discord_mod") : 0;
  const memeLords = settings.memeLord ? getTowerAmount(state, "meme_lord") : 0;
  const rickrollLoops = settings.rickrollLoop ? getTowerAmount(state, "eternal_rickroll_loop") : 0;
  const realityGlitchers = settings.realityGlitcher ? getTowerAmount(state, "reality_glitcher") : 0;
  const cursedTikTokCultists = settings.cursedTikTok ? getTowerAmount(state, "cursed_tiktok_cultist") : 0;
  const algorithms = settings.algorithm ? getTowerAmount(state, "the_algorithm") : 0;

  return {
    cursorCount: botnets > 0 ? Math.min(14, 3 + Math.floor(Math.sqrt(botnets) * 1.25)) : 0,
    stampCount: discordMods > 0 ? Math.min(10, 3 + Math.floor(Math.sqrt(discordMods))) : 0,
    hasMemeLord: memeLords > 0,
    bannerCount: rickrollLoops > 0 ? Math.min(4, 1 + Math.floor(Math.sqrt(rickrollLoops) / 3)) : 0,
    hasRealityGlitcher: realityGlitchers > 0,
    hasCursedTikTok: cursedTikTokCultists > 0,
    algorithmLabelCount: algorithms > 0 ? Math.min(10, 5 + Math.floor(Math.sqrt(algorithms))) : 0
  };
}

function hasActiveTowerTakeover(config) {
  return config.cursorCount > 0 ||
    config.stampCount > 0 ||
    config.hasMemeLord ||
    config.bannerCount > 0 ||
    config.hasRealityGlitcher ||
    config.hasCursedTikTok ||
    config.algorithmLabelCount > 0;
}

function getVisualTakeoverSettings(state) {
  const value = state.settings?.visualTakeovers;
  const keys = Object.keys(VISUAL_TAKEOVER_DEFAULTS);

  if (value === false) {
    return Object.fromEntries(keys.map((key) => [key, false]));
  }

  if (!value || typeof value !== "object") {
    return { ...VISUAL_TAKEOVER_DEFAULTS };
  }

  return Object.fromEntries(keys.map((key) => [key, value[key] !== false]));
}

function getDesktopCompanionSettings(state) {
  const value = state.settings?.desktopCompanion;
  const defaults = DESKTOP_COMPANION_DEFAULTS;

  if (value === false) {
    return Object.fromEntries(Object.keys(defaults).map((key) => [key, false]));
  }

  if (!value || typeof value !== "object") {
    return { ...defaults };
  }

  return Object.fromEntries(
    Object.entries(defaults).map(([key, defaultValue]) => [
      key,
      Boolean(value[key] ?? defaultValue)
    ])
  );
}

function getDesktopWindowSettings(state) {
  const value = state.settings?.desktopWindow;
  const presetIds = new Set(DESKTOP_WINDOW_PRESETS.map((preset) => preset.id));
  const sizePreset = typeof value?.sizePreset === "string" && presetIds.has(value.sizePreset)
    ? value.sizePreset
    : DESKTOP_WINDOW_DEFAULTS.sizePreset;

  return { sizePreset };
}

function hasDesktopWindowControls() {
  return Boolean(globalThis.window?.memeFarmPlatform?.desktop?.configureWindow);
}

function getAvailableTakeoverOptions(state) {
  return TAKEOVER_OPTIONS.filter((option) => getTowerAmount(state, option.towerId) > 0);
}

function clearTowerTakeovers() {
  elements.body.classList.remove(
    "takeover-botnet",
    "takeover-discord-mod",
    "takeover-meme-lord",
    "takeover-rickroll-loop",
    "takeover-reality-glitcher",
    "takeover-cursed-tiktok",
    "takeover-algorithm"
  );

  if (lastTakeoverSignature !== "off") {
    elements.takeoverLayer.innerHTML = "";
    lastTakeoverSignature = "off";
  }
}

function renderTowerTakeovers(config) {
  const pieces = [];

  for (let index = 0; index < config.cursorCount; index += 1) {
    pieces.push(`
      <span class="takeover-cursor" data-takeover-cursor="${index}">
        <span>REAL_USER_${String(index + 1).padStart(2, "0")}</span>
      </span>
    `);
  }

  for (let index = 0; index < config.stampCount; index += 1) {
    const label = MODERATION_STAMPS[index % MODERATION_STAMPS.length];
    const x = 10 + ((index * 17) % 76);
    const y = 14 + ((index * 23) % 70);
    const rotation = -18 + ((index * 13) % 36);
    pieces.push(`
      <span class="takeover-mod-stamp" style="--x:${x}%; --y:${y}%; --r:${rotation}deg; --d:${index * 0.35}s;">
        ${escapeHtml(label)}
      </span>
    `);
  }

  for (let index = 0; index < config.bannerCount; index += 1) {
    pieces.push(`
      <div class="takeover-rickroll-banner" style="--lane:${index}; --speed:${22 + index * 4}s;">
        <span>ETERNAL RICKROLL LOOP ONLINE</span>
        <span>LINK TRUST DESTROYED</span>
        <span>RETRO BAIT DETECTED</span>
      </div>
    `);
  }

  if (config.hasRealityGlitcher) {
    for (let index = 0; index < 5; index += 1) {
      pieces.push(`<span class="takeover-glitch-slice" style="--y:${18 + index * 15}%; --d:${index * 0.22}s;"></span>`);
    }
  }

  for (let index = 0; index < config.algorithmLabelCount; index += 1) {
    const label = ALGORITHM_LABELS[index % ALGORITHM_LABELS.length];
    const x = 8 + ((index * 19) % 80);
    const y = 16 + ((index * 29) % 66);
    pieces.push(`
      <span class="takeover-algorithm-label" style="--x:${x}%; --y:${y}%; --d:${index * 0.4}s;">
        ${escapeHtml(label)}
      </span>
    `);
  }

  elements.takeoverLayer.innerHTML = pieces.join("");
}

function animateTakeoverCursors(elapsedSeconds) {
  const cursors = elements.takeoverLayer.querySelectorAll("[data-takeover-cursor]");

  cursors.forEach((cursor, index) => {
    const speed = 0.42 + (index % 5) * 0.045;
    const phase = index * 1.71;
    const x = 10 + (Math.sin(elapsedSeconds * speed + phase) * 0.5 + 0.5) * 80;
    const y = 12 + (Math.cos(elapsedSeconds * (speed * 1.37) + phase * 0.8) * 0.5 + 0.5) * 74;
    const rotation = -18 + Math.sin(elapsedSeconds * 1.1 + phase) * 20;
    cursor.style.left = `${x}%`;
    cursor.style.top = `${y}%`;
    cursor.style.transform = `rotate(${rotation}deg)`;
  });
}

function updateOrbiters(amount, elapsedSeconds) {
  const visibleCount = Math.min(ORBITER_VISUAL_CAP, amount);

  if (visibleCount !== lastOrbiterCount) {
    elements.orbitContainer.innerHTML = "";
    for (let index = 0; index < visibleCount; index += 1) {
      const orbiter = document.createElement("span");
      orbiter.className = "orbit-item";
      orbiter.style.setProperty("--i", index);
      orbiter.innerHTML = '<span class="orbit-item-core"></span>';
      elements.orbitContainer.appendChild(orbiter);
    }
    lastOrbiterCount = visibleCount;
  }

  const orbiters = elements.orbitContainer.children;
  const baseRadius = 162;
  const ringStep = 24;
  const time = elapsedSeconds * 0.9;

  for (let index = 0; index < orbiters.length; index += 1) {
    const ring = Math.floor(index / ORBITERS_PER_RING);
    const slot = index % ORBITERS_PER_RING;
    const ringCount = Math.min(ORBITERS_PER_RING, visibleCount - ring * ORBITERS_PER_RING);
    const angle = (slot / Math.max(1, ringCount)) * Math.PI * 2 + time * (1 + ring * 0.12);
    const radius = baseRadius + ring * ringStep + Math.sin(time * 2 + index) * 3;
    const x = 150 + Math.cos(angle) * radius;
    const y = 150 + Math.sin(angle) * radius;
    orbiters[index].style.left = `${x}px`;
    orbiters[index].style.top = `${y}px`;
    orbiters[index].style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
  }

  elements.orbitContainer.classList.toggle("is-capped", amount > ORBITER_VISUAL_CAP);
}

function getLikePopupCaption(state, era) {
  if (hasActiveBadIdeaConsequence(state, "apology_arc")) {
    return "public statement";
  }

  if (hasActiveBadIdeaConsequence(state, "brand_safety_mode")) {
    return "approved content";
  }

  if (hasActiveBadIdeaConsequence(state, "comment_section_riot")) {
    return "reply bait";
  }

  return era.popupSuffix;
}

function createLikePopup(text, clientX, clientY, caption) {
  const rect = elements.memeWrapper.getBoundingClientRect();
  const popup = document.createElement("span");
  popup.className = "like-popup";
  popup.textContent = text;
  popup.dataset.caption = caption;
  popup.style.left = `${clientX - rect.left}px`;
  popup.style.top = `${clientY - rect.top}px`;
  elements.memeWrapper.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

function spawnSubscriberRaid(onCollect, state) {
  const bribeActive = hasActiveLabProgramBoost(state, "algorithm_bribe");
  const count = bribeActive ? randomInt(4, 6) : randomInt(2, 4);
  const baseLeft = 14 + Math.random() * 72;
  const members = createSubscriberRaidMembers(count, bribeActive);
  const fakeConversion = getFakeSubscriberConversion(state);
  const autoCollector = getSubscriberAutoCollector(state);
  let autoCollectCount = 0;

  showSubscriberRaidCallout(bribeActive ? "Golden attention raid" : "Attention raid");

  members.forEach((member, index) => {
    const offset = (index - (count - 1) / 2) * (count > 4 ? 10 : 14);
    const rowOffset = index % 2 === 0 ? 0 : 24;
    const left = clamp(baseLeft + offset, 5, 90);
    const drift = (index - (count - 1) / 2) * 18;
    const autoCollect = canAutoCollectSubscriber(member, autoCollector, autoCollectCount);
    if (autoCollect) {
      autoCollectCount += 1;
    }

    createSubscriberRaidMember({
      ...member,
      left,
      rowOffset,
      drift,
      delayMs: index * 130,
      fakeConversion,
      autoCollect,
      autoCollector,
      onCollect
    });
  });
}

function canAutoCollectSubscriber(member, autoCollector, autoCollectCount) {
  return autoCollector.chance > 0 &&
    autoCollectCount < autoCollector.maxPerRaid &&
    member.kind !== "bot" &&
    Math.random() < autoCollector.chance;
}

function createSubscriberRaidMembers(count, bribeActive) {
  const members = Array.from({ length: count }, (_, index) => {
    const golden = bribeActive && Math.random() < 0.22;
    const fake = !golden && index > 0 && Math.random() < (bribeActive ? 0.18 : 0.28);

    if (golden) {
      return { kind: "golden", amount: 3 };
    }

    return fake
      ? createFakeSubscriberMember()
      : { kind: "real", amount: 1 };
  });

  if (members.every((member) => member.kind === "bot")) {
    members[0] = { kind: "real", amount: 1 };
  }

  if (bribeActive && !members.some((member) => member.kind === "golden") && Math.random() < 0.45) {
    members[Math.floor(Math.random() * members.length)] = { kind: "golden", amount: 3 };
  }

  return members;
}

function createFakeSubscriberMember() {
  return Math.random() < 0.001
    ? { kind: "super", amount: 1000 }
    : { kind: "bot", amount: 0 };
}

function createSubscriberRaidMember({ kind, amount, left, rowOffset, drift, delayMs, fakeConversion = { chance: 0, amount: 1 }, autoCollect = false, autoCollector = { delayMinMs: 900, delayMaxMs: 2500 }, onCollect }) {
  const subscriber = document.createElement("button");
  const fake = kind === "bot";
  const golden = kind === "golden";
  const superSubscriber = kind === "super";
  subscriber.type = "button";
  subscriber.className = `subscriber subscriber-${kind}`;
  subscriber.setAttribute("aria-label", fake
    ? "Reject fake subscriber bot"
    : superSubscriber
      ? `Collect super subscriber worth ${amount} subscribers`
      : golden
        ? `Collect golden subscriber raid worth ${amount} subscribers`
        : "Collect subscriber");
  subscriber.style.left = `${left}%`;
  subscriber.style.setProperty("--raid-delay", `${delayMs}ms`);
  subscriber.style.setProperty("--raid-row-offset", `${rowOffset}px`);
  subscriber.style.setProperty("--raid-drift", `${drift}px`);

  const timeout = window.setTimeout(() => {
    if (!subscriber.isConnected) {
      return;
    }

    if (!fake) {
      showSubscriberSnark(randomItem(SUBSCRIBER_MISSED_LINES), subscriber);
    }

    subscriber.remove();
  }, 6800 + delayMs);

  subscriber.addEventListener("click", () => {
    window.clearTimeout(timeout);

    if (fake) {
      if (Math.random() < (fakeConversion.chance ?? 0)) {
        showSubscriberSnark("verified by accident", subscriber);
        subscriber.remove();
        onCollect({ amount: fakeConversion.amount ?? 1, convertedFake: true });
        return;
      }

      showSubscriberSnark(randomItem(SUBSCRIBER_BOT_LINES), subscriber);
      subscriber.remove();
      onCollect({ fake: true, amount: 0 });
      return;
    }

    subscriber.remove();
    onCollect({ amount, golden, superSubscriber });
  });

  elements.subscriberContainer.appendChild(subscriber);

  if (autoCollect) {
    scheduleSubscriberAutoCollect(subscriber, autoCollector, delayMs);
  }
}

function scheduleSubscriberAutoCollect(subscriber, autoCollector, raidDelayMs) {
  const delayMin = Math.max(0, autoCollector.delayMinMs ?? 900);
  const delayMax = Math.max(delayMin, autoCollector.delayMaxMs ?? 2500);
  const collectDelay = raidDelayMs + randomInt(delayMin, delayMax);

  window.setTimeout(() => {
    if (!subscriber.isConnected) {
      return;
    }

    showSubscriberAutoClicker(subscriber);
  }, collectDelay);
}

function showSubscriberAutoClicker(subscriber) {
  const containerRect = elements.subscriberContainer.getBoundingClientRect();
  const targetRect = subscriber.getBoundingClientRect();

  if (containerRect.width <= 0 || containerRect.height <= 0) {
    subscriber.click();
    return;
  }

  const cursor = document.createElement("span");
  cursor.className = "subscriber-autoclicker";
  cursor.style.setProperty("--auto-start-x", `${containerRect.width * 0.5}px`);
  cursor.style.setProperty("--auto-start-y", `${containerRect.height * 0.78}px`);
  cursor.style.setProperty("--auto-end-x", `${targetRect.left + targetRect.width / 2 - containerRect.left}px`);
  cursor.style.setProperty("--auto-end-y", `${targetRect.top + targetRect.height / 2 - containerRect.top}px`);
  elements.subscriberContainer.appendChild(cursor);

  window.setTimeout(() => {
    if (subscriber.isConnected) {
      subscriber.click();
    }
  }, 620);

  window.setTimeout(() => cursor.remove(), 920);
}

function showSubscriberRaidCallout(text) {
  const callout = document.createElement("span");
  callout.className = "subscriber-raid-callout";
  callout.textContent = text;
  callout.style.left = `${18 + Math.random() * 48}%`;
  elements.subscriberContainer.appendChild(callout);
  window.setTimeout(() => callout.remove(), 2100);
}

function showSubscriberSnark(text, anchor) {
  const containerRect = elements.subscriberContainer.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  const x = containerRect.width > 0
    ? ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100
    : 50;
  const y = containerRect.height > 0
    ? ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100
    : 50;
  const snark = document.createElement("span");
  snark.className = "subscriber-snark";
  snark.textContent = text;
  snark.style.left = `${clamp(x, 8, 86)}%`;
  snark.style.top = `${clamp(y, 10, 84)}%`;
  elements.subscriberContainer.appendChild(snark);
  window.setTimeout(() => snark.remove(), 2600);
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function openOverlay(type) {
  activeOverlay = type;
  elements.overlay.dataset.overlay = type;
  renderOverlay(type);
  elements.overlay.hidden = false;
}

function closeOverlay() {
  activeOverlay = null;
  delete elements.overlay.dataset.overlay;
  elements.overlay.hidden = true;
}

function renderOverlay(type) {
  const state = handlers.state;

  if (type === "stats") {
    const statsSnapshot = getStatsSnapshotForActiveView(state);
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Game Statistics</h2>
      ${renderStatsViewTabs(state)}
      <div class="stats-list">
        ${renderStatsList(statsSnapshot, state)}
      </div>
    `;
    bindStatsViewTabs();
    return;
  }

  if (type === "milestones") {
    const unlockedCount = ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.id]).length;
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Milestones</h2>
      <p class="overlay-subtitle">Steam achievement goals for Meme Farm: tower purchases, viral thresholds, bad decisions, and a few deeply specific internet crimes.</p>
      <div class="milestone-summary">
        <strong>${formatNumber(unlockedCount)} / ${formatNumber(ACHIEVEMENTS.length)} unlocked</strong>
        <span>${formatNumber(ACHIEVEMENTS.length - unlockedCount)} still hiding in the content mines</span>
      </div>
      <div class="achievement-grid achievement-grid-overlay">
        ${renderAchievementCards(state)}
      </div>
    `;
    return;
  }

  if (type === "upgrades") {
    const ownedOneTimeCount = getOwnedOneTimeUpgradeCount(state);
    const totalOneTimeCount = getOneTimeUpgradeCount();
    const activeTowerChains = getTowerUpgradeSummaries(state).filter((summary) => summary.ownedTotal > 0);
    const ownedSubscriberSpawnUpgrades = getOwnedSubscriberSpawnUpgrades(state);
    const ownedCrossfeeds = getOwnedCrossfeedUpgrades(state);
    const ownedLegacyOverclocks = getOwnedLegacyOverclockUpgrades(state);
    const ownedObscureUpgrades = getOwnedObscureUpgrades(state);
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Upgrade Dashboard</h2>
      <p class="overlay-subtitle">Track your owned upgrades, tower chains, Crossfeed synergies, and late-game Legacy Overclocks in one place.</p>
      <div class="upgrade-summary-grid">
        ${upgradeSummaryCard("Core Levels", formatNumber(getCoreUpgradeLevelCount(state)), "Click Boost and 48h offline capacity levels")}
        ${upgradeSummaryCard("One-Time Owned", `${formatNumber(ownedOneTimeCount)} / ${formatNumber(totalOneTimeCount)}`, "Tower doubles, Crossfeeds, and overclocks")}
        ${upgradeSummaryCard("Active Towers", `${formatNumber(activeTowerChains.length)} / ${formatNumber(TOWERS.length)}`, "Towers with at least one owned upgrade")}
        ${upgradeSummaryCard("Legacy Overclocks", `${formatNumber(ownedLegacyOverclocks.length)} / ${formatNumber(getLegacyOverclockUpgradeCount())}`, "Declining late-game revival boosts")}
      </div>
      <section class="upgrade-dashboard-section">
        <h3>Core Upgrades</h3>
        <div class="owned-core-grid">
          ${renderCoreUpgradeCards(state)}
        </div>
      </section>
      <section class="upgrade-dashboard-section">
        <h3>Subscriber Spawn</h3>
        ${ownedSubscriberSpawnUpgrades.length > 0
          ? `<div class="owned-crossfeed-list">${ownedSubscriberSpawnUpgrades.map((upgrade) => `
            <div class="owned-crossfeed-item subscriber-spawn-upgrade-item">
              <strong>${escapeHtml(upgrade.displayName)}</strong>
              <span>${escapeHtml(describeUpgradeEffect(upgrade))}</span>
            </div>
          `).join("")}</div>`
          : `<p class="empty-upgrade-state">No Subscriber Spawn upgrades owned yet. The follow button is still obeying normal weather.</p>`}
      </section>
      <section class="upgrade-dashboard-section">
        <h3>Tower Upgrade Chains</h3>
        ${activeTowerChains.length > 0
          ? `<div class="tower-upgrade-grid">${activeTowerChains.map(renderTowerUpgradeSummary).join("")}</div>`
          : `<p class="empty-upgrade-state">No tower-specific upgrades owned yet. The tower paperwork remains tragically blank.</p>`}
      </section>
      <section class="upgrade-dashboard-section">
        <h3>Owned Crossfeeds</h3>
        ${ownedCrossfeeds.length > 0
          ? renderCrossfeedConspiracyWeb(ownedCrossfeeds, state)
          : `<p class="empty-upgrade-state">No Crossfeeds owned yet. The suspicious dependency graph has not begun.</p>`}
      </section>
      <section class="upgrade-dashboard-section">
        <h3>Owned Legacy Overclocks</h3>
        ${ownedLegacyOverclocks.length > 0
          ? `<div class="owned-crossfeed-list">${ownedLegacyOverclocks.map((upgrade) => `
            <div class="owned-crossfeed-item">
              <strong>${escapeHtml(upgrade.displayName)}</strong>
              <span>${escapeHtml(describeUpgradeEffect(upgrade))}</span>
            </div>
          `).join("")}</div>`
          : `<p class="empty-upgrade-state">No Legacy Overclocks owned yet. The early towers are still waiting for their comeback arc.</p>`}
      </section>
      <section class="upgrade-dashboard-section">
        <h3>Obscure Upgrades</h3>
        ${ownedObscureUpgrades.length > 0
          ? `<div class="owned-crossfeed-list">${ownedObscureUpgrades.map((upgrade) => `
            <div class="owned-crossfeed-item obscure-upgrade-item">
              <strong>${escapeHtml(upgrade.displayName)}</strong>
              <span>${escapeHtml(describeUpgradeEffect(upgrade))}</span>
            </div>
          `).join("")}</div>`
          : `<p class="empty-upgrade-state">No obscure upgrades owned yet. The weird shelf is empty, which feels temporary.</p>`}
      </section>
      <div class="upgrade-dashboard-note">
        Bought one-time upgrades disappear from the shop, but they stay summarized here.
      </div>
    `;
    return;
  }

  if (type === "options") {
    const volumePercent = Math.round((state.settings.volume ?? 1) * 100);
    const visualTakeoverSettings = getVisualTakeoverSettings(state);
    const availableTakeoverOptions = getAvailableTakeoverOptions(state);
    const desktopCompanionSettings = getDesktopCompanionSettings(state);
    const desktopWindowSettings = getDesktopWindowSettings(state);
    const desktopWindowControlsAvailable = hasDesktopWindowControls();
    const desktopCompanionOptions = [
      ["enabled", "Enable desktop companion", "Master switch for every desktop-adjacent behavior."],
      ["trayStatus", "Tray status", "Keep a tiny tray/status menu with current progress."],
      ["taskbarFlash", "Taskbar attention flash", "Let big moments request attention from the taskbar."],
      ["offlineReports", "Absurd offline reports", "Add tower-specific nonsense to the away report."],
      ["titleMischief", "Unhinged window title", "Let the title bar rotate through cursed status lines."]
    ];
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Options</h2>
      <div class="options-panel">
        <section class="options-section" aria-labelledby="audio-options-title">
          <h3 id="audio-options-title">Audio</h3>
          <label class="volume-control" for="volume-slider">
            <span>
              <strong>Master Volume</strong>
              <small id="volume-value">${volumePercent}%${state.settings.muted ? " (muted)" : ""}</small>
            </span>
            <input id="volume-slider" type="range" min="0" max="100" step="1" value="${volumePercent}" />
          </label>
          <button type="button" id="toggle-mute">${state.settings.muted ? "Unmute Audio" : "Mute Audio"}</button>
        </section>
        <section class="options-section" aria-labelledby="desktop-window-options-title">
          <h3 id="desktop-window-options-title">Screen Size</h3>
          <p>${desktopWindowControlsAvailable
            ? "Choose how much space Meme Farm should take up on your desktop. Windowed sizes keep the same layout and scale the game down."
            : "Screen size controls are available in the desktop app."}</p>
          <label class="screen-size-control" for="desktop-window-size">
            <span>
              <strong>Display mode</strong>
              <small>${desktopWindowControlsAvailable ? "Pick a fixed window size or switch to fullscreen." : "Open the desktop app to change this."}</small>
            </span>
            <select id="desktop-window-size" ${desktopWindowControlsAvailable ? "" : "disabled"}>
              ${DESKTOP_WINDOW_PRESETS.map((preset) => `
                <option value="${preset.id}" ${preset.id === desktopWindowSettings.sizePreset ? "selected" : ""}>
                  ${escapeHtml(preset.label)}
                </option>
              `).join("")}
            </select>
          </label>
        </section>
        <section class="options-section" aria-labelledby="desktop-companion-options-title">
          <h3 id="desktop-companion-options-title">Desktop Companion</h3>
          <p>Control how much Meme Farm is allowed to behave like a cursed desktop side-game.</p>
          <div class="takeover-option-list">
            ${desktopCompanionOptions.map(([id, label, description]) => `
              <label class="takeover-option" for="desktop-companion-${id}">
                <input id="desktop-companion-${id}" type="checkbox" data-desktop-companion="${id}" ${desktopCompanionSettings[id] ? "checked" : ""} />
                <span>
                  <strong>${escapeHtml(label)}</strong>
                  <small>${escapeHtml(description)}</small>
                </span>
              </label>
            `).join("")}
          </div>
        </section>
        ${availableTakeoverOptions.length > 0
          ? `<section class="options-section" aria-labelledby="visual-options-title">
          <h3 id="visual-options-title">Visuals</h3>
          <p>Choose which owned tower screen-invasion effects are allowed to appear.</p>
          <div class="takeover-option-list">
            ${availableTakeoverOptions.map((option) => `
              <label class="takeover-option" for="visual-takeover-${option.id}">
                <input id="visual-takeover-${option.id}" type="checkbox" data-visual-takeover="${option.id}" ${visualTakeoverSettings[option.id] ? "checked" : ""} />
                <span>
                  <strong>${escapeHtml(option.label)}</strong>
                  <small>${escapeHtml(option.description)}</small>
                </span>
              </label>
            `).join("")}
          </div>
        </section>`
          : ""}
        <section class="options-section" aria-labelledby="save-options-title">
          <h3 id="save-options-title">Progress</h3>
          <p>Your progress saves automatically.</p>
          <button type="button" id="reset-game" class="danger">Reset Save</button>
        </section>
      </div>
    `;
    const volumeSlider = document.getElementById("volume-slider");
    const volumeValue = document.getElementById("volume-value");

    volumeSlider.addEventListener("input", (event) => {
      const nextVolume = Number(event.currentTarget.value) / 100;
      handlers.onSetVolume(nextVolume);
      const nextPercent = Math.round((state.settings.volume ?? nextVolume) * 100);
      volumeValue.textContent = `${nextPercent}%${state.settings.muted ? " (muted)" : ""}`;
    });

    document.getElementById("toggle-mute").addEventListener("click", (event) => {
      handlers.onToggleMute();
      event.currentTarget.textContent = state.settings.muted ? "Unmute Audio" : "Mute Audio";
      volumeValue.textContent = `${Math.round((state.settings.volume ?? 1) * 100)}%${state.settings.muted ? " (muted)" : ""}`;
    });
    document.getElementById("desktop-window-size").addEventListener("change", (event) => {
      handlers.onSetDesktopWindowSize?.(event.currentTarget.value);
    });
    document.querySelectorAll("[data-visual-takeover]").forEach((input) => {
      input.addEventListener("change", (event) => {
        handlers.onSetVisualTakeover(event.currentTarget.dataset.visualTakeover, event.currentTarget.checked);
      });
    });
    document.querySelectorAll("[data-desktop-companion]").forEach((input) => {
      input.addEventListener("change", (event) => {
        handlers.onSetDesktopCompanion(event.currentTarget.dataset.desktopCompanion, event.currentTarget.checked);
      });
    });
    document.getElementById("reset-game").addEventListener("click", handlers.onResetRequest);
    return;
  }

  elements.overlayContent.innerHTML = `
    <h2 id="overlay-title">About Meme Farm</h2>
    <p>Meme Farm is a chaotic idle clicker about posting memes, farming likes, and turning internet nonsense into an increasingly ridiculous empire. Click for early likes, buy towers to automate the grind, and stack upgrades until the numbers become deeply unserious.</p>
    <p>Subscribers are your special side currency. Collect them when they appear, then spend them in the Meme Lab on temporary boosts, risky experiments, and stranger systems as the game grows.</p>
    <p>Future updates will expand the Meme Lab with new programs, more subscriber sinks, and fresh ways to bend your meme economy in irresponsible directions.</p>
  `;
}

function upgradeSummaryCard(label, value, description) {
  return `
    <div class="upgrade-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(description)}</small>
    </div>
  `;
}

function renderCoreUpgradeCards(state) {
  return getCoreUpgrades().map((upgrade) => {
    const level = getUpgradeLevel(state, upgrade.id);
    return `
      <div class="owned-core-card">
        <img src="${upgrade.image}" alt="${escapeHtml(upgrade.displayName)}" />
        <span>
          <strong>${escapeHtml(upgrade.displayName)}</strong>
          <small>${escapeHtml(describeUpgradeEffect(upgrade))}</small>
        </span>
        <b>${escapeHtml(formatUpgradeLevel(upgrade, level).replace("Lvl.", "Level"))}</b>
      </div>
    `;
  }).join("");
}

function renderTowerUpgradeSummary(summary) {
  return `
    <div class="tower-upgrade-card">
      <div class="tower-upgrade-heading">
        <strong>${escapeHtml(summary.tower.displayName)}</strong>
        <span>${formatNumber(summary.standardOwnedCount)} / ${formatNumber(summary.standardUpgrades.length)} standard</span>
      </div>
      <div class="upgrade-tier-row" aria-label="${escapeHtml(summary.tower.displayName)} upgrade tiers">
        ${summary.standardUpgrades.map((upgrade, index) => `
          <span class="${getUpgradeLevel(summary.state, upgrade.id) > 0 ? "is-owned" : ""}">${index + 1}</span>
        `).join("")}
      </div>
      <div class="tower-crossfeed-status ${summary.crossfeedOwned ? "is-owned" : ""}">
        <span>Crossfeed</span>
        <strong>${summary.crossfeedOwned ? "Owned" : "Not owned"}</strong>
      </div>
      ${summary.legacyAvailable
        ? `<div class="tower-crossfeed-status tower-legacy-status ${summary.legacyOwned ? "is-owned" : ""}">
          <span>Legacy Overclock</span>
          <strong>${summary.legacyOwned ? "Owned" : "Not owned"}</strong>
        </div>`
        : ""}
    </div>
  `;
}

function renderCrossfeedConspiracyWeb(ownedCrossfeeds, state) {
  const implicatedTowerIds = new Set();

  for (const upgrade of ownedCrossfeeds) {
    implicatedTowerIds.add(upgrade.effect.towerId);
    if (upgrade.effect.countsAllOtherTowers) {
      for (const tower of TOWERS) {
        if (tower.id !== upgrade.effect.towerId && getTowerAmount(state, tower.id) > 0) {
          implicatedTowerIds.add(tower.id);
        }
      }
    } else {
      implicatedTowerIds.add(upgrade.effect.sourceTowerId);
    }
  }

  return `
    <div class="crossfeed-conspiracy-web" aria-label="Owned Crossfeed dependency map">
      <div class="crossfeed-web-header">
        <span>
          <small>Definitely normal engineering</small>
          <strong>Crossfeed Conspiracy Web</strong>
        </span>
        <b>${formatNumber(ownedCrossfeeds.length)} suspicious links</b>
        <em>${formatNumber(implicatedTowerIds.size)} towers implicated</em>
      </div>
      <div class="crossfeed-web-map">
        ${ownedCrossfeeds.map((upgrade, index) => renderCrossfeedConspiracyLink(upgrade, state, index)).join("")}
      </div>
    </div>
  `;
}

function renderCrossfeedConspiracyLink(upgrade, state, index) {
  const sourceTower = TOWERS.find((tower) => tower.id === upgrade.effect.sourceTowerId);
  const targetTower = TOWERS.find((tower) => tower.id === upgrade.effect.towerId);
  const countsAllOtherTowers = Boolean(upgrade.effect.countsAllOtherTowers);
  const sourceNodeTower = countsAllOtherTowers ? null : sourceTower;
  const sourceCopy = countsAllOtherTowers
    ? { displayName: "Every Other Tower", description: "" }
    : sourceTower
    ? getTowerDisplayCopy(state, sourceTower)
    : { displayName: "Unknown Source", description: "" };
  const targetCopy = targetTower
    ? getTowerDisplayCopy(state, targetTower)
    : { displayName: "Unknown Target", description: "" };
  const sourceAmount = countsAllOtherTowers
    ? TOWERS.reduce((sum, tower) => tower.id === upgrade.effect.towerId ? sum : sum + getTowerAmount(state, tower.id), 0)
    : sourceTower ? getTowerAmount(state, sourceTower.id) : 0;
  const targetAmount = targetTower ? getTowerAmount(state, targetTower.id) : 0;
  const perSource = upgrade.effect.multiplierPerSource ?? 0;
  const maxMultiplier = upgrade.effect.maxMultiplier;
  const rawMultiplier = 1 + sourceAmount * perSource;
  const hasCap = Number.isFinite(maxMultiplier);
  const currentMultiplier = hasCap ? Math.min(maxMultiplier, rawMultiplier) : rawMultiplier;
  const isCapped = hasCap && currentMultiplier >= maxMultiplier && sourceAmount > 0;
  const heat = hasCap && maxMultiplier > 1
    ? Math.min(1, Math.max(0, (currentMultiplier - 1) / (maxMultiplier - 1)))
    : Math.min(1, Math.max(0, (currentMultiplier - 1) / 12));

  return `
    <article class="crossfeed-web-link ${isCapped ? "is-capped" : ""}" style="--crossfeed-heat:${heat.toFixed(3)};">
      ${renderCrossfeedTowerNode(sourceNodeTower, sourceCopy.displayName, sourceAmount, countsAllOtherTowers ? "All-shop pressure" : "Source pressure")}
      <div class="crossfeed-connector" aria-label="${escapeHtml(sourceCopy.displayName)} feeds ${escapeHtml(targetCopy.displayName)}">
        <span class="crossfeed-wire-label">engagement pipe ${index + 1}</span>
        <strong>x${formatNumber(currentMultiplier)} LPS</strong>
        <div class="crossfeed-badges">
          <span>+${formatNumber(perSource * 100)}% each</span>
          <span>${hasCap ? `cap x${formatNumber(maxMultiplier)}` : "no cap"}</span>
          ${isCapped ? "<span>cap reached</span>" : ""}
        </div>
      </div>
      ${renderCrossfeedTowerNode(targetTower, targetCopy.displayName, targetAmount, "Target beneficiary")}
      <p class="crossfeed-warning">
        Dependency note: ${escapeHtml(sourceCopy.displayName)} is laundering engagement into ${escapeHtml(targetCopy.displayName)}.
        ${isCapped ? "The graph has hit the legal maximum nonsense multiplier." : countsAllOtherTowers ? "There is no maximum. Legal has left the channel." : "Auditors have marked this as fine."}
      </p>
    </article>
  `;
}

function renderCrossfeedTowerNode(tower, displayName, amount, role) {
  return `
    <div class="crossfeed-node">
      ${tower
        ? `<img src="${tower.image}" alt="${escapeHtml(displayName)}" loading="lazy" />`
        : `<span class="crossfeed-node-fallback">?</span>`}
      <span>
        <small>${escapeHtml(role)}</small>
        <strong>${escapeHtml(displayName)}</strong>
        <b>x${formatNumber(amount)} owned</b>
      </span>
    </div>
  `;
}

function getCoreUpgrades() {
  return UPGRADES.filter((upgrade) => upgrade.type === "clickPower" || upgrade.type === "offlineProductionCapacity");
}

function getCoreUpgradeLevelCount(state) {
  return getCoreUpgrades().reduce((sum, upgrade) => sum + getUpgradeLevel(state, upgrade.id), 0);
}

function getOneTimeUpgradeCount() {
  return UPGRADES.filter((upgrade) => upgrade.maxLevel === 1).length;
}

function getOwnedOneTimeUpgradeCount(state) {
  return UPGRADES.filter((upgrade) => upgrade.maxLevel === 1 && getUpgradeLevel(state, upgrade.id) > 0).length;
}

function getOwnedSubscriberSpawnUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.category === "subscriberSpawn" && getUpgradeLevel(state, upgrade.id) > 0);
}

function getOwnedCrossfeedUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.type === "towerAmountSynergy" && getUpgradeLevel(state, upgrade.id) > 0);
}

function getOwnedLegacyOverclockUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock" && getUpgradeLevel(state, upgrade.id) > 0);
}

function getOwnedObscureUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.category === "obscure" && getUpgradeLevel(state, upgrade.id) > 0);
}

function getLegacyOverclockUpgradeCount() {
  return UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock").length;
}

function getTowerUpgradeSummaries(state) {
  return TOWERS.map((tower) => {
    const standardUpgrades = UPGRADES.filter((upgrade) => upgrade.category === "standardTowerDouble" && upgrade.effect.towerId === tower.id);
    const crossfeedUpgrade = UPGRADES.find((upgrade) => upgrade.type === "towerAmountSynergy" && upgrade.effect.towerId === tower.id);
    const legacyUpgrade = UPGRADES.find((upgrade) => upgrade.category === "legacyOverclock" && upgrade.effect.towerId === tower.id);
    const standardOwnedCount = standardUpgrades.filter((upgrade) => getUpgradeLevel(state, upgrade.id) > 0).length;
    const crossfeedOwned = Boolean(crossfeedUpgrade && getUpgradeLevel(state, crossfeedUpgrade.id) > 0);
    const legacyOwned = Boolean(legacyUpgrade && getUpgradeLevel(state, legacyUpgrade.id) > 0);

    return {
      state,
      tower,
      standardUpgrades,
      standardOwnedCount,
      crossfeedOwned,
      legacyAvailable: Boolean(legacyUpgrade),
      legacyOwned,
      ownedTotal: standardOwnedCount + (crossfeedOwned ? 1 : 0) + (legacyOwned ? 1 : 0)
    };
  });
}

function renderAchievementCards(state) {
  return ACHIEVEMENTS.map((achievement) => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    return `
      <div class="achievement-card ${unlocked ? "is-unlocked" : "is-locked"}" data-achievement-id="${achievement.id}">
        <span class="achievement-icon">${escapeHtml(achievement.icon)}</span>
        <span class="achievement-title">${escapeHtml(achievement.title)}</span>
        <span class="achievement-description">${escapeHtml(achievement.description)}</span>
      </div>
    `;
  }).join("");
}

function showTooltip(kind, id, anchor) {
  activeTooltip = { kind, id, anchor };
  updateTooltip(kind, id, anchor);
}

function updateTooltip(kind, id, anchor) {
  const state = handlers.state;

  if (kind === "tower") {
    const tower = TOWERS.find((item) => item.id === id);
    const copy = getTowerDisplayCopy(state, tower);
    const amount = getTowerAmount(state, id);
    elements.tooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(copy.displayName)}</div>
      <div class="tooltip-description">${escapeHtml(copy.description)}</div>
      <div class="tooltip-line">Each produces <b>${formatNumber(tower.lps * getTowerMultiplierForDisplay(state, id))}</b> Likes/sec</div>
      <div class="tooltip-line">${formatNumber(amount)} owned produce <b>${formatNumber(getTowerEffectiveLps(state, id))}</b> LPS</div>
      <div class="tooltip-line"><b>${formatNumber(state.towers[id]?.totalProduced ?? 0)}</b> Likes produced total</div>
    `;
  } else {
    const upgrade = UPGRADES.find((item) => item.id === id);
    elements.tooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(upgrade.displayName)}</div>
      <div class="tooltip-description">${escapeHtml(upgrade.description)}</div>
      <div class="tooltip-line">${escapeHtml(describeUpgradeEffect(upgrade))}</div>
      <div class="tooltip-line">${escapeHtml(formatUpgradeLevel(upgrade, getUpgradeLevel(state, id)).replace("Lvl.", "Level"))}</div>
    `;
  }

  elements.tooltip.hidden = false;
  positionTooltip(anchor);
}

function hideTooltip() {
  activeTooltip = null;
  elements.tooltip.hidden = true;
}

function positionTooltip(anchor) {
  const rect = anchor.getBoundingClientRect();
  const tooltipRect = elements.tooltip.getBoundingClientRect();
  const gap = 12;
  let left = rect.left - tooltipRect.width - gap;

  if (left < 8) {
    left = Math.min(window.innerWidth - tooltipRect.width - 8, rect.right + gap);
  }

  const top = Math.min(window.innerHeight - tooltipRect.height - 8, Math.max(8, rect.top));
  elements.tooltip.style.left = `${left}px`;
  elements.tooltip.style.top = `${top}px`;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function showAchievementReaction(achievement) {
  const reaction = getAchievementReaction(achievement);
  const card = document.createElement("article");
  card.className = `achievement-reaction achievement-reaction-${reaction.tier}`;
  card.innerHTML = `
    <span class="achievement-reaction-kicker">${escapeHtml(reaction.kicker)}</span>
    <span class="achievement-reaction-icon">${escapeHtml(achievement.icon)}</span>
    <strong>${escapeHtml(achievement.title)}</strong>
    <span>${escapeHtml(achievement.description)}</span>
    ${reaction.patchNote
      ? `<small>Patch note: ${escapeHtml(reaction.patchNote)}</small>`
      : ""}
  `;

  elements.achievementReactionLayer.appendChild(card);

  if (reaction.tier !== "standard") {
    elements.body.classList.remove("achievement-screen-pulse", "achievement-screen-legendary");
    void elements.body.offsetWidth;
    elements.body.classList.add(reaction.tier === "legendary" ? "achievement-screen-legendary" : "achievement-screen-pulse");
    window.setTimeout(() => {
      elements.body.classList.remove("achievement-screen-pulse", "achievement-screen-legendary");
    }, reaction.tier === "legendary" ? 900 : 620);
  }

  window.setTimeout(() => card.remove(), reaction.tier === "legendary" ? 6200 : 4600);
}

function showLegacyOverclockEvent(upgrade) {
  const tower = TOWERS.find((item) => item.id === upgrade.effect?.towerId);
  const towerName = tower?.displayName ?? "Forgotten Tower";
  const multiplier = upgrade.effect?.multiplier ?? 1;
  const event = document.createElement("section");
  event.className = "legacy-overclock-reaction";
  event.setAttribute("aria-label", `${upgrade.displayName} activated`);
  event.innerHTML = `
    <div class="legacy-overclock-static" aria-hidden="true"></div>
    <div class="legacy-overclock-comeback-rain" aria-hidden="true">
      ${LEGACY_OVERCLOCK_LINES.map((line, index) => `
        <span style="--x:${8 + ((index * 13) % 78)}%; --y:${12 + ((index * 17) % 70)}%; --r:${-14 + ((index * 11) % 28)}deg; --d:${index * 0.08}s;">
          ${escapeHtml(line)}
        </span>
      `).join("")}
    </div>
    <article class="legacy-overclock-card">
      <span class="legacy-overclock-kicker">Legacy Overclock</span>
      <div class="legacy-overclock-hero">
        ${tower ? `<img src="${tower.image}" alt="${escapeHtml(towerName)}" />` : ""}
        <span class="legacy-overclock-multiplier">x${formatNumber(multiplier)}</span>
      </div>
      <strong>${escapeHtml(towerName)} storms back</strong>
      <span>${escapeHtml(upgrade.displayName)} has dragged an early-game relic back into late-game relevance.</span>
      <small>${escapeHtml(towerName)} has re-entered the discourse. Everyone is pretending they always believed.</small>
    </article>
  `;

  elements.achievementReactionLayer.appendChild(event);
  elements.body.classList.remove("legacy-overclock-screen-hit");
  void elements.body.offsetWidth;
  elements.body.classList.add("legacy-overclock-screen-hit");

  window.setTimeout(() => {
    elements.body.classList.remove("legacy-overclock-screen-hit");
  }, 1000);
  window.setTimeout(() => event.remove(), 5600);
}

function showPrestigeEvent(result) {
  const tier = result.tier;
  const finalTower = result.finalTower;
  const event = document.createElement("section");
  event.className = `prestige-reaction prestige-reaction-${result.level}`;
  event.setAttribute("aria-label", `${tier.pinName} earned`);
  event.innerHTML = `
    <div class="prestige-reaction-noise" aria-hidden="true"></div>
    <article class="prestige-reaction-card">
      <span class="prestige-reaction-kicker">Your meme went viral</span>
      <div class="prestige-reaction-pin">
        ${renderPrestigePin(result.level, "reaction")}
      </div>
      <strong>${escapeHtml(tier.pinName)}</strong>
      <span>${escapeHtml(tier.description)}</span>
      <div class="prestige-reaction-reward">Permanent reward: all towers now produce x${formatNumber(result.towerLpsMultiplier)} LPS</div>
      <small>${escapeHtml(finalTower?.displayName ?? "The final tower")} has been converted into public reputation. The farm is reset. The leaderboard receipts remain.</small>
    </article>
  `;

  elements.achievementReactionLayer.appendChild(event);
  elements.body.classList.remove("prestige-screen-hit");
  void elements.body.offsetWidth;
  elements.body.classList.add("prestige-screen-hit");

  window.setTimeout(() => {
    elements.body.classList.remove("prestige-screen-hit");
  }, 1300);
  window.setTimeout(() => event.remove(), 6400);
}

function getAchievementReaction(achievement) {
  const id = achievement.id ?? "";

  if (LEGENDARY_ACHIEVEMENT_PATTERNS.some((pattern) => pattern.test(id))) {
    return {
      tier: "legendary",
      kicker: "Reality patch deployed",
      patchNote: `Unlocked "${achievement.title}" and made the farm noticeably less normal.`
    };
  }

  if (RARE_ACHIEVEMENT_PATTERNS.some((pattern) => pattern.test(id))) {
    return {
      tier: "rare",
      kicker: "Milestone breach",
      patchNote: `The system has filed "${achievement.title}" under excellent bad decisions.`
    };
  }

  return {
    tier: "standard",
    kicker: "Milestone unlocked",
    patchNote: ""
  };
}

function showBadIdeaConsequenceModal(consequence) {
  showModal(`
    <div class="modal-card algorithm-denial-modal">
      <span class="eyebrow">Automated platform notice</span>
      <h2>${escapeHtml(consequence.title)}</h2>
      <p>The algorithm has reviewed your appeal and found no evidence that anything weird happened.</p>
      <p>Reference code: <strong>DENIED-${Math.floor(Math.random() * 9000 + 1000)}</strong></p>
      <button type="button" data-modal-close>Accept Obviously False Statement</button>
    </div>
  `);
}

function showTermsOfServiceModal(termsEvent, onAccept) {
  showModal(`
    <div class="modal-card terms-modal ${escapeHtml(termsEvent.bodyClass)}">
      <span class="eyebrow">${escapeHtml(termsEvent.eyebrow)}</span>
      <h2>${escapeHtml(termsEvent.title)}</h2>
      <p>${escapeHtml(termsEvent.subtitle)}</p>
      <ol class="terms-clause-list">
        ${termsEvent.clauses.map((clause, index) => `
          <li>
            <span>${escapeHtml(`${termsEvent.referencePrefix}-${String(index + 1).padStart(2, "0")}`)}</span>
            <p>${escapeHtml(clause)}</p>
          </li>
        `).join("")}
      </ol>
      <strong>By continuing, the farm becomes slightly less normal.</strong>
      <div class="modal-actions">
        <button type="button" data-terms-accept>${escapeHtml(termsEvent.acceptLabel)}</button>
      </div>
    </div>
  `, { closeOnBackdrop: false });

  elements.modalRoot.querySelector("[data-terms-accept]")?.addEventListener("click", () => {
    onAccept?.();
    closeModal();
  });
}

function showGoViralConfirmation(onConfirm) {
  const nextTier = getNextPrestigeTier(handlers.state);

  if (!nextTier) {
    return;
  }

  const currentLpsMultiplier = getPrestigeTowerLpsMultiplier(handlers.state);
  const nextLpsMultiplier = getPrestigeTowerLpsMultiplier(nextTier.level);

  showModal(`
    <div class="modal-card prestige-confirm-modal">
      <span class="eyebrow">Go Viral reset</span>
      <h2>Send This Meme Into The Public Record?</h2>
      <div class="prestige-confirm-pin">
        ${renderPrestigePin(nextTier.level, "modal")}
        <span>
          <strong>${escapeHtml(nextTier.pinName)}</strong>
          <small>${escapeHtml(nextTier.description)}</small>
        </span>
      </div>
      <div class="prestige-confirm-reward">
        <span>Permanent production reward</span>
        <strong>All tower LPS increases from x${formatNumber(currentLpsMultiplier)} to x${formatNumber(nextLpsMultiplier)}</strong>
        <small>This multiplier remains active for every tower in all future runs.</small>
      </div>
      <p class="prestige-reset-warning"><b>Reset warning:</b> This resets likes, towers, upgrades, subscribers, milestones, lab effects, local stats, and the current run.</p>
      <p>Your leaderboard records, prestige history, new pin, and permanent tower multiplier are preserved.</p>
      <div class="modal-actions">
        <button type="button" data-modal-close>Cancel</button>
        <button type="button" id="confirm-go-viral">Go Viral &amp; Unlock x${formatNumber(nextLpsMultiplier)} LPS</button>
      </div>
    </div>
  `);

  document.getElementById("confirm-go-viral").addEventListener("click", () => {
    closeModal();
    onConfirm?.();
  });
}

function showOfflineModal({ likesEarned, secondsAway, productionSeconds = secondsAway, capacity = 0, maxOfflineSeconds = productionSeconds, companionLines = [] }) {
  if (likesEarned <= 0 || productionSeconds < 60) {
    return;
  }

  const wasCapped = secondsAway > productionSeconds;

  showModal(`
    <div class="modal-card">
      <h2>While You Were Away</h2>
      <p>Your towers kept posting at ${formatPercent(capacity)} offline capacity for ${formatDuration(productionSeconds)}.</p>
      ${wasCapped
        ? `<p>You were away for ${formatDuration(secondsAway)}, but offline production stops after ${formatDuration(maxOfflineSeconds)}.</p>`
        : ""}
      ${companionLines.length > 0
        ? `<div class="offline-report-lines" aria-label="Desktop companion offline report">
          ${companionLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
        </div>`
        : ""}
      <strong>+${formatNumber(likesEarned)} Likes</strong>
      <button type="button" data-modal-close>Nice</button>
    </div>
  `);
}

export function showResetConfirmation(onConfirm) {
  showModal(`
    <div class="modal-card">
      <h2>Reset Meme Farm?</h2>
      <p>This clears likes, towers, upgrades, subscribers, and achievements from this browser.</p>
      <div class="modal-actions">
        <button type="button" data-modal-close>Cancel</button>
        <button type="button" id="confirm-reset" class="danger">Reset Save</button>
      </div>
    </div>
  `);

  document.getElementById("confirm-reset").addEventListener("click", () => {
    onConfirm();
    closeModal();
  });
}

function showModal(markup, { closeOnBackdrop = true } = {}) {
  elements.modalRoot.innerHTML = markup;
  elements.modalRoot.hidden = false;
  elements.modalRoot.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  if (closeOnBackdrop) {
    elements.modalRoot.addEventListener("click", onModalBackdrop);
  }
}

function closeModal() {
  elements.modalRoot.hidden = true;
  elements.modalRoot.innerHTML = "";
  elements.modalRoot.removeEventListener("click", onModalBackdrop);
}

function onModalBackdrop(event) {
  if (event.target === elements.modalRoot) {
    closeModal();
  }
}

function setSaveStatus(text) {
  elements.saveStatus.textContent = text;
}

function getStatsViewOptions(state) {
  const reachedLevel = getPrestigeLevel(state);

  return [
    { id: STATS_LIFETIME_VIEW_ID, label: "Lifetime" },
    ...PRESTIGE_STAT_LEVELS
      .filter((level) => level <= reachedLevel)
      .map((level) => ({
        id: `prestige-${level}`,
        label: `Prestige ${level}`,
        level
      }))
  ];
}

function renderStatsViewTabs(state) {
  const options = getStatsViewOptions(state);
  const activeOption = options.find((option) => option.id === activeStatsView);

  if (!activeOption) {
    activeStatsView = STATS_LIFETIME_VIEW_ID;
  }

  return `
    <div class="stats-view-tabs" role="tablist" aria-label="Stats scope">
      ${options.map((option) => {
        const active = option.id === activeStatsView;
        return `
          <button class="stats-view-tab ${active ? "active" : ""}" type="button" role="tab" aria-selected="${active}" data-stats-view="${escapeHtml(option.id)}">
            ${escapeHtml(option.label)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function bindStatsViewTabs() {
  elements.overlayContent.querySelectorAll("[data-stats-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStatsView = button.dataset.statsView ?? STATS_LIFETIME_VIEW_ID;
      renderOverlay("stats");
    });
  });
}

function getStatsSnapshotForActiveView(state) {
  const option = getStatsViewOptions(state).find((item) => item.id === activeStatsView);

  if (!option || option.id === STATS_LIFETIME_VIEW_ID) {
    activeStatsView = STATS_LIFETIME_VIEW_ID;
    return {
      ...getLifetimePrestigeStats(state),
      viewId: STATS_LIFETIME_VIEW_ID,
      viewLabel: "Lifetime",
      isLifetime: true
    };
  }

  return {
    ...getPrestigeRunStats(state, option.level),
    viewId: option.id,
    viewLabel: option.label,
    isLifetime: false
  };
}

function renderStatsList(snapshot, state) {
  return `
    ${statLine("Go Viral Prestige", getStatsPrestigeLabel(snapshot, state))}
    ${statLine("Total Likes", `${formatNumber(snapshot.likes)} Likes`, `${formatFullNumber(snapshot.likes)} Likes`)}
    ${statLine("Total Likes Ever", `${formatNumber(snapshot.totalLikesEver)} Likes`, `${formatFullNumber(snapshot.totalLikesEver)} Likes`)}
    ${statLine("Leaderboard Likes Record", `${formatNumber(snapshot.leaderboardLikesRecord)} Likes`, `${formatFullNumber(snapshot.leaderboardLikesRecord)} Likes`)}
    ${statLine("Brainrot Tier", snapshot.progressionTitle)}
    ${statLine("Likes Per Second", formatNumber(snapshot.likesPerSecond), formatFullNumber(snapshot.likesPerSecond))}
    ${statLine("Click Power", `+${formatNumber(snapshot.clickPower)}`, `+${formatFullNumber(snapshot.clickPower)}`)}
    ${statLine("48h Offline Capacity", formatPercent(snapshot.offlineCapacity))}
    ${statLine("Subscribers", formatNumber(snapshot.subscribers), formatFullNumber(snapshot.subscribers))}
    ${statLine("Subscribers Ever", formatNumber(snapshot.totalSubscribersEver), formatFullNumber(snapshot.totalSubscribersEver))}
    ${statLine("Towers Owned", formatNumber(snapshot.towersOwned), formatFullNumber(snapshot.towersOwned))}
    ${statLine("Meme Button Clicks", formatNumber(snapshot.totalClicks), formatFullNumber(snapshot.totalClicks))}
    ${statLine("Likes Spent", formatNumber(snapshot.totalLikesSpent), formatFullNumber(snapshot.totalLikesSpent))}
    ${statLine("Likes From Clicks", formatNumber(snapshot.totalLikesFromClicks), formatFullNumber(snapshot.totalLikesFromClicks))}
    ${statLine("Play Time", formatDuration(snapshot.playTimeSeconds))}
    ${renderTermsOfServiceStats(snapshot)}
  `;
}

function getStatsPrestigeLabel(snapshot, state) {
  if (snapshot.isLifetime) {
    const currentTier = getPrestigeTier(state);
    return currentTier ? `${currentTier.symbol} - ${currentTier.pinName}` : "No public pin";
  }

  if (!snapshot.hasData) {
    return "No run recorded";
  }

  const tier = getPrestigeTier(snapshot.level);
  return tier ? `${tier.symbol} - ${tier.pinName}` : "No public pin";
}

function statLine(label, value, title = value) {
  return `<div class="stat-line"><span>${escapeHtml(label)}</span><strong title="${escapeHtml(title)}">${escapeHtml(value)}</strong></div>`;
}

function renderTermsOfServiceStats(source) {
  const acceptedEvents = getAcceptedTermsEvents(source);

  if (acceptedEvents.length === 0) {
    return "";
  }

  const titles = acceptedEvents.map((event) => event.title).join(", ");
  const consentPrediction = hasAcceptedTermsEvent(source, "personalized_reality_agreement")
    ? statLine("Consent Predicted", "100%", "The Algorithm says this was always your preference.")
    : "";

  return `
    ${statLine("Cursed Terms Accepted", `${formatNumber(acceptedEvents.length)} / ${formatNumber(TERMS_OF_SERVICE_EVENTS.length)}`, titles)}
    ${consentPrediction}
  `;
}

function formatUpgradeLevel(upgrade, level) {
  if (upgrade.type === "offlineProductionCapacity") {
    return `${formatPercent(level * upgrade.effect.capacityPerLevel)} / ${formatPercent(upgrade.effect.maxCapacity)}`;
  }

  if (upgrade.maxLevel === 1) {
    return level > 0 ? "Owned" : "One-time";
  }

  return hasUpgradeLevelCap(upgrade)
    ? `Lvl. ${level}/${upgrade.maxLevel}`
    : `Lvl. ${level}`;
}

function describeUpgradeEffect(upgrade) {
  if (upgrade.type === "clickPower") {
    return `Click power x${upgrade.effect.multiplier} per level`;
  }

  if (upgrade.type === "towerMultiplier") {
    const tower = TOWERS.find((item) => item.id === upgrade.effect.towerId);
    return `${tower?.displayName ?? "Tower"} LPS x${upgrade.effect.multiplier}`;
  }

  if (upgrade.type === "towerAmountSynergy") {
    const tower = TOWERS.find((item) => item.id === upgrade.effect.towerId);
    const sourceTower = TOWERS.find((item) => item.id === upgrade.effect.sourceTowerId);
    return upgrade.effect.countsAllOtherTowers
      ? `${tower?.displayName ?? "Tower"} +${formatPercent(upgrade.effect.multiplierPerSource)} LPS per other tower owned, no cap`
      : `${tower?.displayName ?? "Tower"} +${formatPercent(upgrade.effect.multiplierPerSource)} LPS per ${sourceTower?.displayName ?? "other tower"} owned, max x${upgrade.effect.maxMultiplier}`;
  }

  if (upgrade.type === "globalLpsMultiplier") {
    return `All LPS x${upgrade.effect.multiplier} per level`;
  }

  if (upgrade.type === "subscriberBonus") {
    return upgrade.maxLevel === 1
      ? `Subscriber spawns x${upgrade.effect.spawnMultiplier}`
      : `Subscriber spawns x${upgrade.effect.spawnMultiplier} per level`;
  }

  if (upgrade.type === "subscriberFakeConversion") {
    return `Fake subscribers convert ${formatPercent(upgrade.effect.conversionChance)} of the time`;
  }

  if (upgrade.type === "subscriberAutoCollector") {
    return `Auto-collects falling subscribers ${formatPercent(upgrade.effect.autoCollectChance)} of the time`;
  }

  if (upgrade.type === "randomLpsBoost") {
    const multipliers = upgrade.effect.multipliers?.map((multiplier) => `x${formatNumber(multiplier)}`).join(", ") ?? "random";
    return `Sometimes triggers ${multipliers} LPS for ${formatDuration(upgrade.effect.durationSeconds ?? 15)}`;
  }

  if (upgrade.type === "offlineProductionCapacity") {
    return `48h offline production +${formatPercent(upgrade.effect.capacityPerLevel)} per level, max ${formatPercent(upgrade.effect.maxCapacity)}`;
  }

  return "Mystery boost";
}

function formatPercent(value) {
  return `${Number((value * 100).toFixed(2))}%`;
}

function formatBoostMultiplier(label, multiplier = 1) {
  return multiplier > 1
    ? `<span>${escapeHtml(label)} x${formatNumber(multiplier)}</span>`
    : "";
}

function formatOutcomeChance(outcome, outcomes) {
  const totalWeight = outcomes.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  const chance = totalWeight > 0 ? (outcome.weight ?? 0) / totalWeight : 0;
  return formatPercent(chance);
}

function getTowerMultiplierForDisplay(state, towerId) {
  const amount = getTowerAmount(state, towerId);

  if (amount <= 0) {
    const tower = TOWERS.find((item) => item.id === towerId);
    if (!tower) return 1;
    return getTowerEffectiveLps({ ...state, towers: { ...state.towers, [towerId]: { amount: 1, totalProduced: 0 } } }, towerId) / tower.lps;
  }

  const tower = TOWERS.find((item) => item.id === towerId);
  return tower ? getTowerEffectiveLps(state, towerId) / (tower.lps * amount) : 1;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
