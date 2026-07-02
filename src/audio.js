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
  let musicMuted = false;
  let sfxMuted = false;
  let musicVolume = 1;
  let sfxVolume = 1;
  let musicStarted = false;

  music.loop = true;
  music.volume = MUSIC_BASE_VOLUME;

  function init({
    musicMuted: startMusicMuted = false,
    sfxMuted: startSfxMuted = false,
    musicVolume: startMusicVolume = 1,
    sfxVolume: startSfxVolume = 1
  } = {}) {
    setMusicVolume(startMusicVolume);
    setSfxVolume(startSfxVolume);
    setMusicMuted(startMusicMuted);
    setSfxMuted(startSfxMuted);
    tryStartMusic();
    document.addEventListener("pointerdown", tryStartMusic, { once: true });
    document.addEventListener("keydown", tryStartMusic, { once: true });
  }

  function tryStartMusic() {
    if (musicStarted || musicMuted) {
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

  function setMusicMuted(value) {
    musicMuted = Boolean(value);
    music.muted = musicMuted;

    if (!musicMuted) {
      tryStartMusic();
    }

    return musicMuted;
  }

  function setSfxMuted(value) {
    sfxMuted = Boolean(value);
    for (const audio of [...popPool.items, ...powerPool.items]) {
      audio.muted = sfxMuted;
    }
    return sfxMuted;
  }

  function toggleMusicMuted() {
    return setMusicMuted(!musicMuted);
  }

  function toggleSfxMuted() {
    return setSfxMuted(!sfxMuted);
  }

  function setMusicVolume(value) {
    musicVolume = clamp01(value);
    music.volume = MUSIC_BASE_VOLUME * musicVolume;
    return musicVolume;
  }

  function setSfxVolume(value) {
    sfxVolume = clamp01(value);
    popPool.setVolume(sfxVolume);
    powerPool.setVolume(sfxVolume);
    return sfxVolume;
  }

  return {
    init,
    setMusicMuted,
    setSfxMuted,
    setMusicVolume,
    setSfxVolume,
    toggleMusicMuted,
    toggleSfxMuted,
    get musicMuted() {
      return musicMuted;
    },
    get sfxMuted() {
      return sfxMuted;
    },
    get musicVolume() {
      return musicVolume;
    },
    get sfxVolume() {
      return sfxVolume;
    },
    pop() {
      if (!sfxMuted) popPool.play();
    },
    purchase() {
      if (!sfxMuted) powerPool.play();
    },
    confidentNoise() {
      if (sfxMuted) {
        return;
      }

      powerPool.play(POWERUP_BASE_VOLUME * 1.35);
      globalThis.setTimeout(() => {
        if (!sfxMuted) popPool.play(POP_BASE_VOLUME * 1.2);
      }, 90);
      globalThis.setTimeout(() => {
        if (!sfxMuted) powerPool.play(POWERUP_BASE_VOLUME * 1.1);
      }, 180);
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
