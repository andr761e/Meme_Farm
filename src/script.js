const baseTowers = {
  swirling_like_button: {
    baseCost: 10,
    currentCost: 10,
    lps: 1,
    amount: 0,
    description: "Spins around your meme. It’s basic, but it vibes.",
  },
  shitposter_intern: {
    baseCost: 200,
    currentCost: 200,
    lps: 2,
    amount: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  outdated_meme_reposter: {
    baseCost: 200,
    currentCost: 200,
    lps: 5,
    amount: 0,
    description: "Posts Trollface and expects praise. Gets it.",
  },
  edgy_teen: {
    baseCost: 200,
    currentCost: 200,
    lps: 10,
    amount: 0,
    description: "Posts aggressively ironic memes from their mom’s Wi-Fi.",
  },
  botnet: {
    baseCost: 200,
    currentCost: 200,
    lps: 20,
    amount: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  doomscroller: {
    baseCost: 200,
    currentCost: 200,
    lps: 50,
    amount: 0,
    description: "Consumes so many memes, the algorithm starts generating them.",
  },
  meme_subreddit: {
    baseCost: 200,
    currentCost: 200,
    lps: 100,
    amount: 0,
    description: "Power of 1 million Redditors with strong opinions.",
  },
  discord_mod: {
    baseCost: 200,
    currentCost: 200,
    lps: 200,
    amount: 0,
    description: "Will delete your meme, then repost it for clout.",
  },
  tikTok_zoomer: {
    baseCost: 200,
    currentCost: 200,
    lps: 500,
    amount: 0,
    description: "Edits lightning-fast memes with zero coherence.",
  },
  meme_lord: {
    baseCost: 200,
    currentCost: 200,
    lps: 1000,
    amount: 0,
    description: "Speaks only in deep-fried memes and obscure references.",
  },
  AI_meme_generator: {
    baseCost: 200,
    currentCost: 200,
    lps: 2500,
    amount: 0,
    description: "Posts memes 24/7, most of which shouldn’t exist.",
  },
  internet_historian: {
    baseCost: 200,
    currentCost: 200,
    lps: 10000,
    amount: 0,
    description: "Powers up your entire meme empire with sacred meme lore.",
  },
  viral_singularity: {
    baseCost: 200,
    currentCost: 200,
    lps: 25000,
    amount: 0,
    description: "A meme so viral it bends the algorithm. Everyone’s For You Page becomes you.",
  },
  cursed_content_forge: {
    baseCost: 200,
    currentCost: 200,
    lps: 50000,
    amount: 0,
    description: "Combines deep-fried memes with forbidden formats. You’ve created something… unnatural.",
  },
  elons_meme_brainchip: {
    baseCost: 200,
    currentCost: 200,
    lps: 100000,
    amount: 0,
    description: "Direct neural meme injection. Also tweets itself every 3 seconds.",
  },
  based_reality_distorter: {
    baseCost: 200,
    currentCost: 200,
    lps: 250000,
    amount: 0,
    description: "Alters reality to fit your memes. “Cringe” is now illegal.",
  },
  meme_multiverse_server: {
    baseCost: 200,
    currentCost: 200,
    lps: 500000,
    amount: 0,
    description: "Crossposts across infinite universes. Even Rick Astley is farming likes now.",
  },
  clout_god: {
    baseCost: 200,
    currentCost: 10,
    lps: 1000000,
    amount: 0,
    description: "You no longer post memes. You are the meme. Worshipped by ironic teens and boomers alike.",
  }
  // ... flere towers
};

baseUpgrades = {
  power_click: {
    basePower: 1,
    currentPower: 1,
    baseLevel: 0,
    currentLevel: 0,
    basePrice: 500,
    currentPrice: 5,
  }
}

let totalLikes = 0;
let likesPerSecond = 0;

let playerTowers = JSON.parse(JSON.stringify(baseTowers));
let playerUpgrades = JSON.parse(JSON.stringify(baseUpgrades));

function updateUI(key) {
  const tower = playerTowers[key];
  document.getElementById(`price-${key}`).textContent = `${tower.currentCost} Likes`;
  document.getElementById(`count-${key}`).textContent = `x${tower.amount}`;
}

function updateAllTowersUI() {
  for (const key in playerTowers) {
    if (playerTowers.hasOwnProperty(key)) {
      updateUI(key);
    }
  }
}

function buyTower(key) {
  const tower = playerTowers[key];
  if (totalLikes >= tower.currentCost) {
    totalLikes -= tower.currentCost;
    tower.amount += 1;
    tower.currentCost = Math.floor(tower.baseCost * Math.pow(1.20, tower.amount));
    likesPerSecond += tower.lps
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

    updateUpgradeUI(key);
    updateDisplay();
  }
}

function updateUpgradeUI(key) {
  const upgrade = playerUpgrades[key];
  document.getElementById(`price-${key}`).textContent = `${upgrade.currentPrice} Likes`;
  document.getElementById(`count-${key}`).textContent = `Lvl. ${upgrade.currentLevel}`;
}

function updateAllUpgradesUI() {
  for (const key in playerUpgrades) {
    if (playerUpgrades.hasOwnProperty(key)) {
      updateUpgradeUI(key);
    }
  }
}


document.querySelectorAll('.upgrade-img-box').forEach(box => {
  box.addEventListener('click', () => {
    const key = box.dataset.key;
    buyUpgrade(key);
  });
});


document.querySelectorAll('.tower-img-box').forEach(box => {
  box.addEventListener('click', () => {
    const key = box.dataset.key; // fx "cursor"
    buyTower(key);
  });
});

function createLikePopup(text, x, y) {
  const wrapper = document.querySelector('.meme-button-wrapper');
  const button = document.getElementById('meme-button');

  const popup = document.createElement('div');
  popup.classList.add('like-popup');
  popup.textContent = text;

  // Position relativ til knappen
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Variation i animation (valgfri)
  popup.style.transform = `translate(-50%, -50%)`;

  button.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1000);
}



const memeButton = document.getElementById("meme-button");
const totalLikesDisplay = document.getElementById("total-likes");
const lpsDisplay = document.getElementById("likes-per-sec");

const tabTowers = document.getElementById("tab-towers");
const tabUpgrades = document.getElementById("tab-upgrades");
const shopTowers = document.getElementById("shop-towers");
const shopUpgrades = document.getElementById("shop-upgrades");

// Meme Button Click
memeButton.addEventListener("click", (e) => {
  const gain = playerUpgrades.power_click.currentPower;
  totalLikes += gain;
  updateDisplay();

  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createLikePopup(`+${gain}`, x, y);
});

document.getElementById("reset-box").addEventListener("click", () => {
  playerTowers = JSON.parse(JSON.stringify(baseTowers));
  playerUpgrades = JSON.parse(JSON.stringify(baseUpgrades));
  totalLikes = 0;
  likesPerSecond = 0;
  updateDisplay();
  updateAllUpgradesUI();
  updateAllTowersUI();
})

// Likes per second increment
setInterval(() => {
  totalLikes += likesPerSecond;
  updateDisplay();
}, 1000);

// Local storage hvert 2,5 sekund
setInterval(saveGame, 500);

function updateDisplay() {
  totalLikesDisplay.textContent = `${totalLikes} Likes`;
  lpsDisplay.textContent = `${likesPerSecond} LPS`;
}

// Tab switching
function switchTab(tab) {
  if (tab === "towers") {
    tabTowers.classList.add("active");
    tabUpgrades.classList.remove("active");
    shopTowers.style.display = "flex";
    shopUpgrades.style.display = "none";
  } else {
    tabUpgrades.classList.add("active");
    tabTowers.classList.remove("active");
    shopUpgrades.style.display = "flex";
    shopTowers.style.display = "none";
  }
}

tabTowers.addEventListener("click", () => switchTab("towers"));
tabUpgrades.addEventListener("click", () => switchTab("upgrades"));

// Placeholder tooltip logic (can be extended)
const towerBoxes = document.querySelectorAll(".tower-box");
towerBoxes.forEach(box => {
  box.setAttribute("data-tooltip", "Produces 1 meme/sec");
});

const upgradeBoxes = document.querySelectorAll(".upgrade-box");
upgradeBoxes.forEach(box => {
  box.setAttribute("data-tooltip", "Upgrades click efficiency");
});


//SWIRLING LIKES BUTTONS OMKRING MEME BUTTON
let orbitAngleOffset = 0;

function updateOrbiters() {
  const container = document.getElementById('orbit-container');
  container.innerHTML = "";

  const count = playerTowers['swirling_like_button']?.amount || 0;
  const baseRadius = 160;
  const orbitSpacing = 0.15;

  const orbsPerRing = [42]; // første ring har 42
  while (orbsPerRing.reduce((a, b) => a + b, 0) < count) {
    const last = orbsPerRing[orbsPerRing.length - 1];
    orbsPerRing.push(last + 3); // +3 per ekstra ring
  }

  let orbIndex = 0;

  for (let ring = 0; ring < orbsPerRing.length; ring++) {
    const ringCount = orbsPerRing[ring];
    const radius = baseRadius + ring * 25;

    for (let i = 0; i < ringCount && orbIndex < count; i++, orbIndex++) {
      const orb = document.createElement('div');
      orb.classList.add('orbit-item');

      const angle = orbitAngleOffset + i * orbitSpacing;
      const sway = 4 * Math.sin(angle * 3 + Date.now() / 300);
      const r = radius + sway;

      const x = 150 + r * Math.cos(angle);
      const y = 150 + r * Math.sin(angle);

      const angleDeg = angle * (180 / Math.PI);

      orb.style.left = `${x}px`;
      orb.style.top = `${y}px`;
      orb.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 270}deg)`;

      container.appendChild(orb);
    }
  }
}


function animateOrbit() {
  orbitAngleOffset += 0.005;
  updateOrbiters();
  requestAnimationFrame(animateOrbit);
}

animateOrbit(); // Start loop

//Load Local Storage
window.addEventListener('load', loadGame);

function saveGame() {
  const saveData = {
    totalLikes,
    likesPerSecond,
    playerTowers,
    playerUpgrades
  };

  localStorage.setItem('memeFarmSave', JSON.stringify(saveData));
}

function loadGame() {
  const save = localStorage.getItem('memeFarmSave');
  if (!save) return;

  try {
    const data = JSON.parse(save);
    totalLikes = data.totalLikes || 0;
    likesPerSecond = data.likesPerSecond || 0;

    playerTowers = data.playerTowers || JSON.parse(JSON.stringify(baseTowers));
    playerUpgrades = data.playerUpgrades || JSON.parse(JSON.stringify(baseUpgrades));

    updateDisplay();;
    updateAllTowersUI();
    updateAllUpgradesUI();
  } catch (e) {
    console.error("Fejl under indlæsning af spil:", e);
  }
}

