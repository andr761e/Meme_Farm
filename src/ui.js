import { ACHIEVEMENTS } from "./data/achievements.js";
import { MEME_LAB_PROGRAMS } from "./data/memeLab.js";
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
  getActiveLabBoosts,
  getLabBoostMultipliers,
  getLikesPerSecond,
  getNextLockedTower,
  getOfflineProductionCapacity,
  getProgressionTitle,
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
  shouldShowUpgradeInShop
} from "./state.js";
import { formatDuration, formatNumber } from "./utils/format.js";

const ORBITER_VISUAL_CAP = 120;

let elements;
let handlers;
let activeOverlay = null;
let activeTooltip = null;
let lastOrbiterCount = -1;
let activeLeaderboardScope = "global";
let activeLeaderboardMetric = LEADERBOARD_METRICS[0].id;
let activeLabProgramId = MEME_LAB_PROGRAMS[0]?.id ?? null;

export function initUI(options) {
  handlers = options;
  elements = collectElements();

  renderTowerShop();
  renderUpgradeShop();
  renderMemeLab();
  bindTopNav();
  bindTabs();
  bindMemeButton();
  bindShopTabs();
  bindSocialControls();

  return {
    update: () => updateUI(options.state),
    updateVisuals: (elapsedSeconds) => updateVisuals(options.state, elapsedSeconds),
    spawnSubscriber: () => spawnSubscriber(options.onCollectSubscriber),
    showToast,
    showOfflineModal,
    setSaveStatus,
    closeOverlay
  };
}

export function updateUI(state) {
  updateResources(state);
  updateTowerCards(state);
  updateUpgradeCards(state);
  updateSocial(state);
  updateMemeLab(state);
  updateNextUnlock(state);
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
    totalLikes: document.getElementById("total-likes"),
    lps: document.getElementById("likes-per-sec"),
    clickPower: document.getElementById("click-power"),
    subscribers: document.getElementById("subscriber-count"),
    activeBoostTimers: document.getElementById("active-boost-timers"),
    memeButton: document.getElementById("meme-button"),
    memeWrapper: document.querySelector(".meme-button-wrapper"),
    orbitContainer: document.getElementById("orbit-container"),
    subscriberContainer: document.getElementById("subscriber-container"),
    shopTowers: document.getElementById("shop-towers"),
    shopUpgrades: document.getElementById("shop-upgrades"),
    tabTowers: document.getElementById("tab-towers"),
    tabUpgrades: document.getElementById("tab-upgrades"),
    nextUnlock: document.getElementById("next-unlock"),
    leaderboardGlobal: document.getElementById("leaderboard-global"),
    leaderboardFriends: document.getElementById("leaderboard-friends"),
    leaderboardMetricToggle: document.getElementById("leaderboard-metric-toggle"),
    leaderboardMetricList: document.getElementById("leaderboard-metric-list"),
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
    createLikePopup(`+${formatNumber(gain)}`, event.clientX, event.clientY);
  });

  elements.memeButton.addEventListener("animationend", (event) => {
    if (event.animationName === "memeClickPop") {
      elements.memeButton.classList.remove("meme-click-pop");
    }
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
  const towersActive = tab === "towers";
  elements.tabTowers.classList.toggle("active", towersActive);
  elements.tabUpgrades.classList.toggle("active", !towersActive);
  elements.tabTowers.setAttribute("aria-selected", String(towersActive));
  elements.tabUpgrades.setAttribute("aria-selected", String(!towersActive));
  elements.shopTowers.hidden = !towersActive;
  elements.shopUpgrades.hidden = towersActive;
  elements.nextUnlock.hidden = !towersActive;
  elements.shopTowers.classList.toggle("active", towersActive);
  elements.shopUpgrades.classList.toggle("active", !towersActive);
}

function renderTowerShop() {
  elements.shopTowers.innerHTML = TOWERS.map((tower) => `
    <button class="shop-card tower-card" type="button" data-tower-id="${tower.id}" aria-label="Buy ${escapeHtml(tower.displayName)}">
      <img class="shop-icon" src="${tower.image}" alt="${escapeHtml(tower.displayName)}" loading="lazy" />
      <span class="shop-count" data-role="count">x0</span>
      <span class="shop-state" data-role="state">Locked</span>
      <span class="shop-copy">
        <span class="shop-name">${escapeHtml(tower.displayName)}</span>
        <span class="shop-desc">${escapeHtml(tower.description)}</span>
        <span class="shop-meta">
          <span data-role="cost">0 Likes</span>
          <span data-role="production">0 LPS each</span>
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
  elements.totalLikes.textContent = `${formatNumber(state.likes)} Likes`;
  elements.lps.textContent = `${formatNumber(getLikesPerSecond(state))} LPS${labMultipliers.lps > 1 ? ` x${formatNumber(labMultipliers.lps)}` : ""}`;
  elements.clickPower.textContent = `+${formatNumber(getClickPower(state))} per click${labMultipliers.click > 1 ? ` x${formatNumber(labMultipliers.click)}` : ""}`;
  elements.subscribers.textContent = `${formatNumber(state.subscribers)} Subscribers`;
  updateActiveBoostTimers(state);
}

function updateActiveBoostTimers(state) {
  const activeBoosts = getActiveLabBoosts(state).filter((boost) => boost.programId === "algorithm_bribe");

  if (activeBoosts.length === 0) {
    elements.activeBoostTimers.hidden = true;
    elements.activeBoostTimers.innerHTML = "";
    return;
  }

  elements.activeBoostTimers.hidden = false;
  elements.activeBoostTimers.innerHTML = `
    <span class="active-boost-heading">Algorithm Bribe</span>
    ${activeBoosts.map((boost) => `
      <span class="active-boost-timer">
        <strong>${escapeHtml(boost.name)}</strong>
        <span>${formatDuration(boost.remainingSeconds)}</span>
      </span>
    `).join("")}
  `;
}

function updateTowerCards(state) {
  for (const tower of TOWERS) {
    const card = elements.shopTowers.querySelector(`[data-tower-id="${tower.id}"]`);
    const unlocked = isTowerUnlocked(state, tower);
    const amount = getTowerAmount(state, tower.id);
    const cost = getTowerCost(state, tower.id);
    const canAfford = state.likes >= cost;

    card.hidden = !unlocked;
    card.classList.toggle("is-affordable", unlocked && canAfford);
    card.classList.toggle("is-unaffordable", unlocked && !canAfford);
    card.setAttribute("aria-disabled", String(!unlocked || !canAfford));
    card.querySelector('[data-role="count"]').textContent = `x${formatNumber(amount)}`;
    card.querySelector('[data-role="cost"]').textContent = `${formatNumber(cost)} Likes`;
    card.querySelector('[data-role="production"]').textContent = `${formatNumber(tower.lps * getTowerMultiplierForDisplay(state, tower.id))} LPS each`;
    card.querySelector('[data-role="state"]').textContent = canAfford ? "Can afford" : `Need ${formatNumber(cost - state.likes)}`;
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

function updateNextUnlock(state) {
  const nextTower = getNextLockedTower(state);

  if (!nextTower) {
    elements.nextUnlock.textContent = "All towers revealed. The internet has no remaining dignity.";
    return;
  }

  const needed = Math.max(0, (nextTower.unlockAt?.totalLikesEver ?? 0) - state.totalLikesEver);
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

  elements.leaderboardStatus.innerHTML = `
    <span>${escapeHtml(metric.description)}</span>
    <strong>Your ${escapeHtml(metric.label)}: ${escapeHtml(formatLeaderboardValue(metric.id, playerValue))}</strong>
    <small>${activeLeaderboardScope === "friends" ? "Friends ranking" : "Global ranking"}</small>
  `;

  elements.leaderboardList.innerHTML = rows.map((row) => `
    <div class="leaderboard-row ${row.isPlayer ? "is-player" : ""}">
      <span class="leaderboard-rank">#${row.rank}</span>
      <span class="leaderboard-player">
        <strong>${escapeHtml(row.name)}</strong>
        ${row.isPlayer ? "<small>You</small>" : `<small>${activeLeaderboardScope === "friends" ? "Friend" : "Player"}</small>`}
      </span>
      <span class="leaderboard-score">${escapeHtml(formatLeaderboardValue(metric.id, row.score))}</span>
    </div>
  `).join("");

  if (playerRow) {
    elements.leaderboardStatus.dataset.rank = `#${playerRow.rank}`;
  }
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

  for (const boost of activeProgram.boosts) {
    const card = elements.labPrograms.querySelector(`[data-lab-boost-id="${boost.id}"]`);
    const active = activeById.get(boost.id);
    const canAfford = state.subscribers >= boost.subscriberCost;

    card.classList.toggle("is-active", Boolean(active));
    card.classList.toggle("is-affordable", !active && canAfford);
    card.classList.toggle("is-unaffordable", !active && !canAfford);
    card.disabled = Boolean(active) || !canAfford;
    card.querySelector('[data-role="status"]').textContent = active
      ? "Active"
      : canAfford
        ? "Ready"
        : `Need ${formatNumber(boost.subscriberCost - state.subscribers)}`;
    card.querySelector('[data-role="cost"]').textContent = active
      ? "Timer in resource box"
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
  document.title = `${formatNumber(state.likes)} Likes - Meme Farm`;
}

function updateVisuals(state, elapsedSeconds) {
  updateOrbiters(getTowerAmount(state, "swirling_like_button"), elapsedSeconds);
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
    const ring = Math.floor(index / 36);
    const slot = index % 36;
    const ringCount = Math.min(36, visibleCount - ring * 36);
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

function createLikePopup(text, clientX, clientY) {
  const rect = elements.memeWrapper.getBoundingClientRect();
  const popup = document.createElement("span");
  popup.className = "like-popup";
  popup.textContent = text;
  popup.style.left = `${clientX - rect.left}px`;
  popup.style.top = `${clientY - rect.top}px`;
  elements.memeWrapper.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

function spawnSubscriber(onCollect) {
  const subscriber = document.createElement("button");
  subscriber.type = "button";
  subscriber.className = "subscriber";
  subscriber.setAttribute("aria-label", "Collect subscriber");
  subscriber.style.left = `${5 + Math.random() * 85}%`;

  subscriber.addEventListener("click", () => {
    subscriber.remove();
    onCollect();
  });

  elements.subscriberContainer.appendChild(subscriber);
  setTimeout(() => subscriber.remove(), 6500);
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
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Game Statistics</h2>
      <div class="stats-list">
        ${statLine("Total Likes", `${formatNumber(state.likes)} Likes`)}
        ${statLine("Total Likes Ever", `${formatNumber(state.totalLikesEver)} Likes`)}
        ${statLine("Brainrot Tier", getProgressionTitle(state))}
        ${statLine("Likes Per Second", formatNumber(getLikesPerSecond(state)))}
        ${statLine("Click Power", `+${formatNumber(getClickPower(state))}`)}
        ${statLine("Offline Capacity", formatPercent(getOfflineProductionCapacity(state)))}
        ${statLine("Subscribers", formatNumber(state.subscribers))}
        ${statLine("Subscribers Ever", formatNumber(state.totalSubscribersEver))}
        ${statLine("Towers Owned", formatNumber(getTotalTowersOwned(state)))}
        ${statLine("Likes Spent", formatNumber(state.totalLikesSpent))}
        ${statLine("Likes From Clicks", formatNumber(state.totalLikesFromClicks))}
        ${statLine("Play Time", formatDuration(state.playTimeSeconds))}
      </div>
    `;
    return;
  }

  if (type === "milestones") {
    const unlockedCount = ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.id]).length;
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Milestones</h2>
      <p class="overlay-subtitle">These are the future Steam achievements for Meme Farm: tower purchases, viral thresholds, bad decisions, and a few deeply specific internet crimes.</p>
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
    const ownedCrossfeeds = getOwnedCrossfeedUpgrades(state);
    const ownedLegacyOverclocks = getOwnedLegacyOverclockUpgrades(state);
    elements.overlayContent.innerHTML = `
      <h2 id="overlay-title">Upgrade Dashboard</h2>
      <p class="overlay-subtitle">A cleaner view of the upgrades you own: repeatable core upgrades, tower upgrade chains, Crossfeed synergies, and late-game Legacy Overclocks.</p>
      <div class="upgrade-summary-grid">
        ${upgradeSummaryCard("Core Levels", formatNumber(getCoreUpgradeLevelCount(state)), "Click Boost and offline capacity levels")}
        ${upgradeSummaryCard("One-Time Owned", `${formatNumber(ownedOneTimeCount)} / ${formatNumber(totalOneTimeCount)}`, "Tower doubles, Crossfeeds, and overclocks")}
        ${upgradeSummaryCard("Active Towers", `${formatNumber(activeTowerChains.length)} / ${formatNumber(TOWERS.length)}`, "Towers with at least one owned upgrade")}
        ${upgradeSummaryCard("Legacy Overclocks", `${formatNumber(ownedLegacyOverclocks.length)} / ${formatNumber(getLegacyOverclockUpgradeCount())}`, "x1000 late-game revivals")}
      </div>
      <section class="upgrade-dashboard-section">
        <h3>Core Upgrades</h3>
        <div class="owned-core-grid">
          ${renderCoreUpgradeCards(state)}
        </div>
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
          ? `<div class="owned-crossfeed-list">${ownedCrossfeeds.map((upgrade) => `
            <div class="owned-crossfeed-item">
              <strong>${escapeHtml(upgrade.displayName)}</strong>
              <span>${escapeHtml(describeUpgradeEffect(upgrade))}</span>
            </div>
          `).join("")}</div>`
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
      <div class="upgrade-dashboard-note">
        Bought one-time upgrades disappear from the shop, but they stay summarized here.
      </div>
    `;
    return;
  }

  if (type === "options") {
    const volumePercent = Math.round((state.settings.volume ?? 1) * 100);
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
      <div class="tower-crossfeed-status tower-legacy-status ${summary.legacyOwned ? "is-owned" : ""}">
        <span>Legacy Overclock</span>
        <strong>${summary.legacyOwned ? "Owned" : "Not owned"}</strong>
      </div>
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

function getOwnedCrossfeedUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.type === "towerAmountSynergy" && getUpgradeLevel(state, upgrade.id) > 0);
}

function getOwnedLegacyOverclockUpgrades(state) {
  return UPGRADES.filter((upgrade) => upgrade.category === "legacyOverclock" && getUpgradeLevel(state, upgrade.id) > 0);
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
    const amount = getTowerAmount(state, id);
    elements.tooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(tower.displayName)}</div>
      <div class="tooltip-description">${escapeHtml(tower.description)}</div>
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

function showOfflineModal({ likesEarned, secondsAway, capacity = 0 }) {
  if (likesEarned <= 0 || secondsAway < 60) {
    return;
  }

  showModal(`
    <div class="modal-card">
      <h2>While You Were Away</h2>
      <p>Your towers kept posting at ${formatPercent(capacity)} offline capacity for ${formatDuration(secondsAway)}.</p>
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

function showModal(markup) {
  elements.modalRoot.innerHTML = markup;
  elements.modalRoot.hidden = false;
  elements.modalRoot.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  elements.modalRoot.addEventListener("click", onModalBackdrop);
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

function statLine(label, value) {
  return `<div class="stat-line"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
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
    return `${tower?.displayName ?? "Tower"} +${formatPercent(upgrade.effect.multiplierPerSource)} LPS per ${sourceTower?.displayName ?? "other tower"} owned, max x${upgrade.effect.maxMultiplier}`;
  }

  if (upgrade.type === "globalLpsMultiplier") {
    return `All LPS x${upgrade.effect.multiplier} per level`;
  }

  if (upgrade.type === "subscriberBonus") {
    return `Subscriber spawns x${upgrade.effect.spawnMultiplier} per level`;
  }

  if (upgrade.type === "offlineProductionCapacity") {
    return `Offline production +${formatPercent(upgrade.effect.capacityPerLevel)} per level, max ${formatPercent(upgrade.effect.maxCapacity)}`;
  }

  return "Mystery boost";
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
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
