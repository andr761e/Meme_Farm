import { ACHIEVEMENTS } from "./data/achievements.js";
import { TOWERS } from "./data/towers.js";
import { TERMS_OF_SERVICE_EVENT_BY_TOWER_ID } from "./data/termsOfService.js";
import {
  acceptTermsOfService,
  addLikes,
  applyOfflineProgress,
  awardTower,
  clickMemeButton,
  collectSubscriber,
  DESKTOP_COMPANION_DEFAULTS,
  DESKTOP_WINDOW_DEFAULTS,
  DESKTOP_WINDOW_PRESETS,
  canGoViral,
  gameState,
  getApocalypseEra,
  getLikesPerSecond,
  getSubscriberSpawnMultiplier,
  getTotalTowersOwned,
  getTowerAmount,
  goViral,
  hasAcceptedTermsOfService,
  maybeTriggerObscureLpsBoosts,
  pressBadIdeaButton,
  pruneExpiredBadIdeaConsequences,
  pruneExpiredLabBoosts,
  pruneExpiredObscureLpsBoosts,
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
  loadGame,
  saveGame
} from "./save.js";
import { createAudioController } from "./audio.js";
import { startGameLoop } from "./gameLoop.js";
import { initUI, showResetConfirmation } from "./ui.js";
import { formatDuration, formatNumber } from "./utils/format.js";

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
    checkAchievements({ ui });
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
      const amountBefore = getTowerAmount(gameState, towerId);
      const result = purchaseTower(gameState, towerId);

      if (!result.ok) {
        ui.showToast(result.reason === "need-more"
          ? `Need ${formatNumber(result.missing)} more likes.`
          : "That tower is not ready yet.");
        return;
      }

      audio.purchase();
      ui.showToast("Tower bought.");
      if (amountBefore === 0) {
        notifyTowerCameOnline(towerId);
        maybeShowTermsOfService(towerId);
      }
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
      if (result.upgrade?.category === "legacyOverclock") {
        ui.showLegacyOverclockEvent(result.upgrade);
        ui.showToast("Legacy Overclock activated.");
        notifyDesktopCompanion({
          title: "Legacy Overclock activated",
          body: `${result.upgrade.displayName} dragged an old format back into the discourse.`
        }, { flash: true });
      } else {
        ui.showToast("Upgrade bought.");
      }
      markChanged({ meaningful: true });
    },
    onBuyLabBoost: (boostId) => {
      const result = purchaseLabBoost(gameState, boostId);

      if (!result.ok) {
        ui.showToast(result.reason === "active"
          ? "An Algorithm Bribe is already running."
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

      if (result.outcome?.id === "nothing_happens_loudly") {
        audio.confidentNoise();
      } else {
        audio.purchase();
      }
      ui.showToast(result.message);
      if (result.consequence?.modal) {
        ui.showBadIdeaConsequenceModal(result.consequence);
      }
      markChanged({ meaningful: true });
    },
    onCollectSubscriber: ({ amount = 1, fake = false, golden = false, superSubscriber = false, convertedFake = false } = {}) => {
      if (fake) {
        audio.pop();
        ui.showToast("Fake subscriber. Bot energy detected.");
        return;
      }

      const gained = collectSubscriber(gameState, amount);
      if (superSubscriber) {
        gameState.stats.superSubscribersCollected = (gameState.stats.superSubscribersCollected ?? 0) + 1;
      }
      audio.purchase();
      ui.showToast(superSubscriber
        ? `+${formatNumber(gained)} Super Subscriber Jackpot`
        : convertedFake
          ? `+${formatNumber(gained)} Verified Fake User`
          : golden
            ? `+${formatNumber(gained)} Golden Subscribers`
            : `+${formatNumber(gained)} Subscriber${gained === 1 ? "" : "s"}`);
      markChanged({ meaningful: true });
    },
    onResetRequest: () => {
      showResetConfirmation(() => {
        const preservedSettings = { ...gameState.settings };
        resetGameState();
        gameState.settings = preservedSettings;
        clearSave();
        audio.purchase();
        dirty = true;
        markChanged({ immediate: true });
        ui.showToast("Fresh meme farm, clean slate.");
      });
    },
    onToggleMute: () => {
      gameState.settings.muted = audio.toggleMuted();
      markChanged({ meaningful: true });
    },
    onSetVolume: (volume) => {
      gameState.settings.volume = audio.setVolume(volume);
      markChanged({ meaningful: true });
    },
    onSetVisualTakeover: (takeoverId, enabled) => {
      gameState.settings.visualTakeovers ??= {};
      gameState.settings.visualTakeovers[takeoverId] = Boolean(enabled);
      markChanged({ meaningful: true });
    },
    onSetDesktopCompanion: (settingId, enabled) => {
      gameState.settings.desktopCompanion = {
        ...getDesktopCompanionSettings(gameState),
        [settingId]: Boolean(enabled)
      };
      syncDesktopCompanion({ configure: true });
      markChanged({ meaningful: true });
    },
    onSetDesktopWindowSize: (sizePreset) => {
      gameState.settings.desktopWindow = {
        ...getDesktopWindowSettings(gameState),
        sizePreset: normalizeDesktopWindowPreset(sizePreset)
      };
      syncDesktopWindow();
      markChanged({ meaningful: true });
    },
    onGoViralRequest: () => {
      if (!canGoViral(gameState)) {
        ui.showToast("Go Viral unlocks after buying the final tower.");
        return;
      }

      ui.showGoViralConfirmation(() => {
        const result = goViral(gameState);

        if (!result.ok) {
          ui.showToast(result.reason === "maxed"
            ? "The feed has no higher pin to give."
            : "Go Viral is not ready yet.");
          return;
        }

        audio.purchase();
        ui.showPrestigeEvent(result);
        ui.showToast(`${result.tier.pinName} earned. The farm has been reset for prestige ${result.level}.`);
        markChanged({ meaningful: true, immediate: true });
      });
    }
  });

  audio.init({
    muted: gameState.settings.muted,
    volume: gameState.settings.volume
  });

  const recordsChanged = updateLeaderboardRecords(gameState);
  const achievementsChanged = checkAchievements({ silent: true });
  if (recordsChanged || achievementsChanged) {
    dirty = true;
  }
  ui.update();
  syncDesktopWindow();
  syncDesktopCompanion({ configure: true });

  if (loadResult.corrupt) {
    ui.showToast("Your old save was corrupt, so Meme Farm started clean.");
  }

  const offlineReportLines = createOfflineCompanionReport(gameState, offlineProgress);
  ui.showOfflineModal({
    ...offlineProgress,
    companionLines: getDesktopCompanionSettings(gameState).offlineReports ? offlineReportLines : []
  });
  notifyOfflineReport(offlineProgress, offlineReportLines);

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

      if (pruneExpiredObscureLpsBoosts(gameState)) {
        dirty = true;
      }

      if (pruneExpiredBadIdeaConsequences(gameState)) {
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
      const obscureBoosts = maybeTriggerObscureLpsBoosts(gameState);
      if (obscureBoosts.length > 0) {
        dirty = true;
        for (const boost of obscureBoosts) {
          ui.showToast(`${boost.name}: x${formatNumber(boost.multiplier)} LPS panic spike for ${formatDuration(boost.durationSeconds)}.`);
        }
      }
      syncDesktopCompanion();
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
    addSubscribers(amount = 1) {
      const value = Math.max(1, Math.floor(Number(amount) || 1));
      gameState.subscribers += value;
      gameState.totalSubscribersEver += value;
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

  window.addLikes = window.MemeFarmDebug.addLikes;
  window.addSubscribers = window.MemeFarmDebug.addSubscribers;
}

function getDesktopPlatform() {
  return globalThis.window?.memeFarmPlatform?.desktop ?? null;
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
  return {
    sizePreset: normalizeDesktopWindowPreset(state.settings?.desktopWindow?.sizePreset)
  };
}

function normalizeDesktopWindowPreset(sizePreset) {
  return DESKTOP_WINDOW_PRESETS.some((preset) => preset.id === sizePreset)
    ? sizePreset
    : DESKTOP_WINDOW_DEFAULTS.sizePreset;
}

function syncDesktopWindow() {
  const platform = getDesktopPlatform();

  if (!platform?.available || typeof platform.configureWindow !== "function") {
    return;
  }

  platform.configureWindow(getDesktopWindowSettings(gameState));
}

function syncDesktopCompanion({ configure = false } = {}) {
  const platform = getDesktopPlatform();

  if (!platform?.available) {
    return;
  }

  const settings = getDesktopCompanionSettings(gameState);

  if (configure) {
    platform.configure(settings);
  }

  if (!settings.enabled) {
    return;
  }

  const era = getApocalypseEra(gameState);
  platform.updateStatus({
    likes: formatNumber(gameState.likes),
    lps: formatNumber(getLikesPerSecond(gameState)),
    subscribers: formatNumber(gameState.subscribers),
    towers: formatNumber(getTotalTowersOwned(gameState)),
    era: era.label
  });
}

function notifyDesktopCompanion({ title, body }, { flash = false } = {}) {
  const platform = getDesktopPlatform();
  const settings = getDesktopCompanionSettings(gameState);

  if (!platform?.available || !settings.enabled) {
    return;
  }

  if (flash && settings.taskbarFlash) {
    platform.flash();
  }
}

function notifyTowerCameOnline(towerId) {
  const tower = TOWERS.find((item) => item.id === towerId);

  if (!tower) {
    return;
  }

  notifyDesktopCompanion({
    title: `${tower.displayName} came online`,
    body: `${tower.description} The desktop has been informed against its will.`
  }, { flash: true });
}

function notifyAchievementUnlocked(achievement) {
  const major = isMajorAchievement(achievement);
  notifyDesktopCompanion({
    title: major ? "Milestone breach detected" : "Achievement unlocked",
    body: `${achievement.title}: ${achievement.description}`
  }, { flash: major });
}

function notifyOfflineReport(offlineProgress, reportLines) {
  const settings = getDesktopCompanionSettings(gameState);

  if (!settings.offlineReports || offlineProgress.likesEarned <= 0 || offlineProgress.productionSeconds < 60) {
    return;
  }

  notifyDesktopCompanion({
    title: "Meme Farm posted while unsupervised",
    body: `${formatNumber(offlineProgress.likesEarned)} Likes earned in ${formatDuration(offlineProgress.productionSeconds)}. ${reportLines[0] ?? "The feed denies everything."}`
  }, { flash: true });
}

function createOfflineCompanionReport(state, offlineProgress) {
  if (offlineProgress.likesEarned <= 0 || offlineProgress.productionSeconds < 60) {
    return [];
  }

  const ownedTowers = TOWERS
    .filter((tower) => getTowerAmount(state, tower.id) > 0)
    .sort((first, second) => getTowerAmount(state, second.id) - getTowerAmount(state, first.id));
  const lines = [
    `The farm earned ${formatNumber(offlineProgress.likesEarned)} Likes while you were pretending to have boundaries.`,
    `Offline production ran for ${formatDuration(offlineProgress.productionSeconds)} at ${Math.round((offlineProgress.capacity ?? 0) * 100)}% attention leakage.`
  ];

  for (const tower of ownedTowers.slice(0, 4)) {
    lines.push(createTowerOfflineLine(tower, getTowerAmount(state, tower.id)));
  }

  if (offlineProgress.secondsAway > offlineProgress.productionSeconds) {
    lines.push(`The remaining ${formatDuration(offlineProgress.secondsAway - offlineProgress.productionSeconds)} was marked "emotionally offline" by the feed.`);
  }

  return lines.slice(0, 6);
}

function createTowerOfflineLine(tower, amount) {
  const templates = {
    botnet: `${formatNumber(amount)} Botnet nodes held a fake argument until engagement improved.`,
    discord_mod: `${formatNumber(amount)} Discord Mods approved several posts and one suspicious power trip.`,
    meme_lord: `${formatNumber(amount)} Meme Lords issued royal decrees in Impact font.`,
    eternal_rickroll_loop: `${formatNumber(amount)} Rickroll Loops kept user trust at historically unsafe levels.`,
    reality_glitcher: `${formatNumber(amount)} Reality Glitchers moved three pixels of the desktop somewhere legally unclear.`,
    cursed_tiktok_cultist: `${formatNumber(amount)} Cursed TikTok Cultists posted rituals disguised as productivity tips.`,
    the_algorithm: `${formatNumber(amount)} Algorithms denied involvement while signing every report.`
  };

  return templates[tower.id] ?? `${formatNumber(amount)} ${tower.displayName}${amount === 1 ? "" : "s"} kept posting in the background.`;
}

function maybeShowTermsOfService(towerId) {
  const termsEvent = TERMS_OF_SERVICE_EVENT_BY_TOWER_ID[towerId];

  if (!termsEvent || hasAcceptedTermsOfService(gameState, termsEvent.id)) {
    return;
  }

  ui.showTermsOfServiceModal(termsEvent, () => {
    if (!acceptTermsOfService(gameState, termsEvent.id)) {
      return;
    }

    audio.purchase();
    ui.showToast(termsEvent.acceptedToast);
    markChanged({ meaningful: true, immediate: true });
  });
}

function isMajorAchievement(achievement) {
  const id = achievement.id ?? "";
  return /1000000|100000000|1000000000|bad_idea|meme_lab|legacy_overclock|crossfeed|subscriber_spawn_all|tower_level_5_all|super_subscriber|prestige_/.test(id);
}

function checkAchievements({ silent = false, ui = null } = {}) {
  let unlockedAny = false;

  for (const achievement of ACHIEVEMENTS) {
    if (!gameState.achievements[achievement.id] && achievement.isUnlocked(gameState)) {
      unlockAchievement(gameState, achievement.id);
      unlockedAny = true;
      if (silent) {
        continue;
      }
      ui?.showAchievementReaction(achievement);
      notifyAchievementUnlocked(achievement);
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
