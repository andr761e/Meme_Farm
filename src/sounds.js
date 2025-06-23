const audio = new Audio('../assets/sounds/8bit-music-for-game-68698.mp3');
audio.loop = true;
audio.volume = 0.2;

// Play background music on load or first click
window.addEventListener('DOMContentLoaded', () => {
  audio.play().catch(() => {
    document.addEventListener('click', () => {
      audio.play();
    }, { once: true });
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

  // kun afspil lyd når der er råd til at købe et tower
  const towerImgBoxes = document.querySelectorAll('.tower-img-box');
  towerImgBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const key = box.getAttribute('data-key');
      const priceEl = document.getElementById(`price-${key}`);
      if (!priceEl) return;

      let canAfford = false;
      let price = null;

      if (window.playerTowers && window.playerTowers[key]) {
        price = window.playerTowers[key].currentCost;
        canAfford = typeof window.totalLikes === 'number' && window.totalLikes >= price;
      } else {
        const priceText = priceEl.textContent;
        const match = priceText.replace(/,/g, '').match(/(\d+)/);
        if (match) {
          price = parseInt(match[1], 10);
          canAfford = typeof window.totalLikes === 'number' && window.totalLikes >= price;
        }
      }

      if (canAfford) {
        const effect = new Audio('../assets/sounds/pop-sound.mp3');
        effect.volume = 0.1;
        effect.play();
      }
    });
  });

  const memeButton = document.getElementById('meme-button');
  if (memeButton) {
    memeButton.addEventListener('click', () => {
      const effect = new Audio('../assets/sounds/pop-sound.mp3'); // Change to your preferred sound
      effect.volume = 0.15;
      effect.play();
    });
  }

  // Kun afspil lyd når der er råd til upgrade
  const upgradeImgBoxes = document.querySelectorAll('.upgrade-img-box');
  upgradeImgBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const key = box.getAttribute('data-key');
      const priceEl = document.getElementById(`price-${key}`);
      if (!priceEl) return;

      let canAfford = false;
      let price = null;

      if (window.upgrades && window.upgrades[key]) {
        price = window.upgrades[key].currentCost;
        canAfford = typeof window.totalLikes === 'number' && window.totalLikes >= price;
      } else {
        const priceText = priceEl.textContent;
        const match = priceText.replace(/,/g, '').match(/(\d+)/);
        if (match) {
          price = parseInt(match[1], 10);
          canAfford = typeof window.totalLikes === 'number' && window.totalLikes >= price;
        }
      }

      if (canAfford) {
        const effect = new Audio('../assets/sounds/pop-sound.mp3');
        effect.volume = 0.1;
        effect.play();
      }
    });
  });
});

function buyTower(key) {
  const tower = playerTowers[key];
  if (totalLikes >= tower.currentCost) {
    totalLikes -= tower.currentCost;
    tower.amount += 1;
    tower.currentCost = Math.floor(tower.baseCost * Math.pow(1.20, tower.amount));
    likesPerSecond += tower.lps;
    // Play sound here
    const effect = new Audio('../assets/sounds/pop-sound.mp3');
    effect.volume = 0.1;
    effect.play();
    updateUI(key);
    updateDisplay();
  }
}
function buyUpgrade(key) {
  const upgrade = playerUpgrades[key];

  if (totalLikes >= upgrade.currentPrice) {
    totalLikes -= upgrade.currentPrice;

    // Effekt: fordobl power
    upgrade.currentPower *= 2;
    upgrade.currentLevel += 1;

    // Ny pris (fx x2 pr. level)
    upgrade.currentPrice = Math.floor(upgrade.basePrice * Math.pow(2, upgrade.currentLevel));

    // Play sound here
    const effect = new Audio('../assets/sounds/pop-sound.mp3');
    effect.volume = 0.1;
    effect.play();

    updateUpgradeUI(key);
    updateDisplay();
  }
}