const MUSIC_PATH = "../assets/sounds/8bit-music-for-game-68698.mp3";
const POP_PATH = "../assets/sounds/pop-sound.mp3";
const POWERUP_PATH = "../assets/sounds/8-bit-powerup-6768.mp3";
const MUSIC_BASE_VOLUME = 0.18;
const POP_BASE_VOLUME = 0.12;
const POWERUP_BASE_VOLUME = 0.2;

export function createAudioController() {
  const music = new Audio(MUSIC_PATH);
  const popPool = createAudioPool(POP_PATH, 6, POP_BASE_VOLUME);
  const powerPool = createAudioPool(POWERUP_PATH, 4, POWERUP_BASE_VOLUME);
  let muted = false;
  let volume = 1;
  let musicStarted = false;

  music.loop = true;
  music.volume = MUSIC_BASE_VOLUME;

  function init({ muted: startMuted = false, volume: startVolume = 1 } = {}) {
    setVolume(startVolume);
    setMuted(startMuted);
    tryStartMusic();
    document.addEventListener("pointerdown", tryStartMusic, { once: true });
    document.addEventListener("keydown", tryStartMusic, { once: true });
  }

  function tryStartMusic() {
    if (musicStarted || muted) {
      return;
    }

    music.play()
      .then(() => {
        musicStarted = true;
      })
      .catch(() => {
        musicStarted = false;
      });
  }

  function setMuted(value) {
    muted = Boolean(value);
    music.muted = muted;
    for (const audio of [...popPool.items, ...powerPool.items]) {
      audio.muted = muted;
    }

    if (!muted) {
      tryStartMusic();
    }
  }

  function toggleMuted() {
    setMuted(!muted);
    return muted;
  }

  function setVolume(value) {
    volume = clamp01(value);
    music.volume = MUSIC_BASE_VOLUME * volume;
    popPool.setVolume(volume);
    powerPool.setVolume(volume);
    return volume;
  }

  return {
    init,
    setMuted,
    setVolume,
    toggleMuted,
    get muted() {
      return muted;
    },
    get volume() {
      return volume;
    },
    pop() {
      if (!muted) popPool.play();
    },
    purchase() {
      if (!muted) powerPool.play();
    }
  };
}

function createAudioPool(src, size, volume) {
  let masterVolume = 1;
  const items = Array.from({ length: size }, () => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    return audio;
  });
  let index = 0;

  return {
    items,
    setVolume(value) {
      masterVolume = clamp01(value);
      for (const audio of items) {
        audio.volume = volume * masterVolume;
      }
    },
    play(volumeOverride) {
      const audio = items[index];
      index = (index + 1) % items.length;
      audio.currentTime = 0;
      audio.volume = (volumeOverride ?? volume) * masterVolume;
      audio.play().catch(() => {});
    }
  };
}

function clamp01(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 1;
}
