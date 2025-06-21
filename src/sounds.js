const audio = new Audio('../assets/sounds/8bit-music-for-game-68698.mp3');
audio.loop = true;
audio.volume = 0.2; // 0.0 - 1.0


  audio.play().catch(() => {
    document.addEventListener('click', () => {
      audio.play();
    }, { once: true });
    
    
    window.addEventListener('DOMContentLoaded', () => {
  });

  // Create and style the mute button
  const muteBtn = document.createElement('button');
  muteBtn.textContent = '🔊 Mute';
  muteBtn.style.position = 'fixed';
  muteBtn.style.bottom = '20px';
  muteBtn.style.right = '20px';
  muteBtn.style.zIndex = '1000';
  muteBtn.style.padding = '10px 20px';
  muteBtn.style.fontSize = '16px';
  muteBtn.style.borderRadius = '8px';
  muteBtn.style.border = 'none';
  muteBtn.style.background = '#222';
  muteBtn.style.color = '#fff';
  muteBtn.style.cursor = 'pointer';

  document.body.appendChild(muteBtn);

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇 Unmute' : '🔊 Mute';
  });
});