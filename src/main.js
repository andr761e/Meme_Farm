import { ACHIEVEMENTS } from "./data/achievements.js";
import {
  addLikes,
  applyOfflineProgress,
  awardTower,
  clickMemeButton,
  collectSubscriber,
  gameState,
  getSubscriberSpawnMultiplier,
  pressBadIdeaButton,
  pruneExpiredLabBoosts,
  purchaseLabBoost,
  purchaseTower,
  purchaseUpgrade,
  replaceGameState,
  resetGameState,
  tickProduction,
  unlockAchievement,
  updateLeaderboardRecords
} from "./state.js";
import {
  clearSave,
  exportSaveString,
  importSaveString,
  loadGame,
  saveGame
} from "./save.js";
import { createAudioController } from "./audio.js";
import { startGameLoop } from "./gameLoop.js";
import { initUI, showResetConfirmation } from "./ui.js";
import { formatNumber } from "./utils/format.js";

const AUTOSAVE_MS = 15000;
const MEANINGFUL_SAVE_DELAY_MS = 900;

document.addEventListener("DOMContentLoaded", bootGame);

function bootGame() {
  const loadResult = loadGame();
  replaceGameState(loadResult.state);
  const offlineProgress = applyOfflineProgress(gameState, loadResult.lastSaveTime);
  const audio = createAudioController();
  let ui;
  let dirty = Boolean(offlineProgress.likesEarned);
  let saveTimeout = null;
  let subscriberSeconds = 0;

  function markChanged({ meaningful = false, immediate = false } = {}) {
    dirty = true;
    updateLeaderboardRecords(gameState);
    checkAchievements();
    ui.update();

    if (immediate) {
      flushSave("Saved");
      return;
    }

    if (meaningful) {
      window.clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => flushSave("Saved"), MEANINGFUL_SAVE_DELAY_MS);
    }
  }

  function flushSave(label = "Autosaved") {
    window.clearTimeout(saveTimeout);
    saveTimeout = null;

    if (!dirty) {
      return;
    }

    if (saveGame(gameState)) {
      dirty = false;
      ui.setSaveStatus(`${label} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }
  }

  ui = initUI({
    state: gameState,
    onMemeClick: () => {
      const gain = clickMemeButton(gameState);
      audio.pop();
      markChanged({ meaningful: true });
      return gain;
    },
    onBuyTower: (towerId) => {
      const result = purchaseTower(gameState, towerId);

      if (!result.ok) {
        ui.showToast(result.reason === "need-more"
          ? `Need ${formatNumber(result.missing)} more likes.`
          : "That tower is not ready yet.");
        return;
      }

      audio.purchase();
      ui.showToast("Tower bought.");
      markChanged({ meaningful: true });
    },
    onBuyUpgrade: (upgradeId) => {
      const result = purchaseUpgrade(gameState, upgradeId);

      if (!result.ok) {
        ui.showToast(result.reason === "maxed"
          ? "Upgrade already maxed."
          : result.reason === "need-more"
            ? `Need ${formatNumber(result.missing)} more likes.`
            : "Upgrade locked.");
        return;
      }

      audio.purchase();
      ui.showToast("Upgrade bought.");
      markChanged({ meaningful: true });
    },
    onBuyLabBoost: (boostId) => {
      const result = purchaseLabBoost(gameState, boostId);

      if (!result.ok) {
        ui.showToast(result.reason === "active"
          ? "That boost is already running."
          : result.reason === "need-more"
            ? `Need ${formatNumber(result.missing)} more subscribers.`
            : "Lab boost unavailable.");
        return;
      }

      audio.purchase();
      ui.showToast(`${result.boost.name} activated.`);
      markChanged({ meaningful: true });
    },
    onPressBadIdeaButton: () => {
      const result = pressBadIdeaButton(gameState);

      if (!result.ok) {
        ui.showToast(result.reason === "need-more"
          ? `Need ${formatNumber(result.missing)} more subscribers.`
          : "The button refuses to be a bad idea right now.");
        return;
      }

      audio.purchase();
      ui.showToast(result.message);
      markChanged({ meaningful: true });
    },
    onCollectSubscriber: () => {
      collectSubscriber(gameState);
      audio.purchase();
      ui.showToast("+1 Subscriber");
      markChanged({ meaningful: true });
    },
    onResetRequest: () => {
      showResetConfirmation(() => {
        resetGameState();
        clearSave();
        audio.purchase();
        dirty = true;
        markChanged({ immediate: true });
        ui.showToast("Fresh meme farm, clean slate.");
      });
    },
    onExportRequest: () => {
      ui.showExportModal(exportSaveString(gameState));
    },
    onImportRequest: () => {
      ui.showImportModal((saveText) => {
        const result = importSaveString(saveText);

        if (result.ok) {
          dirty = false;
          audio.purchase();
          markChanged({ immediate: true });
        }

        return result;
      });
    },
    onToggleMute: () => {
      gameState.settings.muted = audio.toggleMuted();
      markChanged({ meaningful: true });
    }
  });

  audio.init({ muted: gameState.settings.muted });

  const recordsChanged = updateLeaderboardRecords(gameState);
  const achievementsChanged = checkAchievements({ silent: true });
  if (recordsChanged || achievementsChanged) {
    dirty = true;
  }
  ui.update();

  if (loadResult.corrupt) {
    ui.showToast("Your old save was corrupt, so Meme Farm started clean.");
  }

  ui.showOfflineModal(offlineProgress);

  startGameLoop({
    tickMs: 500,
    onTick: (deltaSeconds) => {
      const gained = tickProduction(gameState, deltaSeconds);

      if (gained > 0) {
        dirty = true;
      }

      if (pruneExpiredLabBoosts(gameState)) {
        dirty = true;
      }

      if (updateLeaderboardRecords(gameState)) {
        dirty = true;
      }

      ui.update();
    },
    onSecond: () => {
      subscriberSeconds += 1;
      if (maybeSpawnSubscriber(subscriberSeconds, getSubscriberSpawnMultiplier(gameState), ui)) {
        subscriberSeconds = 0;
      }
      flushIfAutosaveDue();
    },
    onFrame: (_delta, elapsedSeconds) => {
      ui.updateVisuals(elapsedSeconds);
    }
  });

  let lastAutosave = performance.now();

  function flushIfAutosaveDue() {
    const now = performance.now();

    if (now - lastAutosave >= AUTOSAVE_MS) {
      lastAutosave = now;
      flushSave("Autosaved");
    }
  }

  window.addEventListener("beforeunload", () => {
    if (dirty) {
      saveGame(gameState);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushSave("Saved");
    }
  });

  window.MemeFarmDebug = {
    state: gameState,
    addLikes(amount) {
      addLikes(gameState, amount);
      markChanged({ meaningful: true });
    },
    addTower(towerId, amount = 1) {
      awardTower(gameState, towerId, amount);
      markChanged({ meaningful: true });
    },
    buyLabBoost(boostId) {
      purchaseLabBoost(gameState, boostId);
      markChanged({ meaningful: true });
    },
    pressBadIdeaButton() {
      pressBadIdeaButton(gameState);
      markChanged({ meaningful: true });
    },
    saveNow() {
      dirty = true;
      flushSave("Saved");
    },
    reset() {
      resetGameState();
      dirty = true;
      markChanged({ immediate: true });
    }
  };
}

function checkAchievements({ silent = false } = {}) {
  let unlockedAny = false;

  for (const achievement of ACHIEVEMENTS) {
    if (!gameState.achievements[achievement.id] && achievement.isUnlocked(gameState)) {
      unlockAchievement(gameState, achievement.id);
      unlockedAny = true;
      if (silent) {
        continue;
      }
      const toastContainer = document.getElementById("toast-container");
      if (toastContainer) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = `Achievement: ${achievement.title}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3600);
      }
    }
  }

  return unlockedAny;
}

function maybeSpawnSubscriber(seconds, spawnMultiplier, ui) {
  const mean = 55;
  const standardDeviation = 16;
  const probability = normalPdf(seconds, mean, standardDeviation) * 14 * spawnMultiplier;

  if (Math.random() < probability || seconds > 120) {
    ui.spawnSubscriber();
    return true;
  }

  return false;
}

function normalPdf(x, mean, standardDeviation) {
  const variance = standardDeviation ** 2;
  return Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}
