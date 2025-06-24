//LEFT SIDE (MEME BUTTON SIDE) FUNCTIONS
//Funktion der får tal til at poppe op, når man klikker på meme knappen
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

//Funktion til at opdatere likes, likes per second og subscriber display
function updateDisplay() {
  totalLikesDisplay.textContent = `${totalLikes} Likes`;
  lpsDisplay.textContent = `${likesPerSecond} LPS`;
  totalSubsDisplay.textContent = `${totalSubscribers} Subscribers`;

}

//Funktion til at opdatere like buttons omkring meme-button
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

//Funktion der animerer like buttons
function animateOrbit() {
  orbitAngleOffset += 0.005;
  updateOrbiters();
  requestAnimationFrame(animateOrbit);
}

//Funktion til at spawne subscribers der falder 
function spawnSubscriber() {
  const container = document.getElementById("subscriber-container");
  const sub = document.createElement("div");
  sub.classList.add("subscriber");

  // Tilfældigt horisontalt spawnpunkt
  const left = Math.random() * 90; // i %
  sub.style.left = `${left}%`;

  // Når spilleren klikker på subscriber
  sub.addEventListener("click", () => {
    totalSubscribers += 1; // Du definerer denne variabel
    container.removeChild(sub);
    // Du kan fx vise en flyvende "+1 subscriber"-effekt her
  });

  container.appendChild(sub);

  // Fjern automatisk efter animationen
  setTimeout(() => {
    if (container.contains(sub)) container.removeChild(sub);
  }, 6000);
}

//Funktion til at opdatere subscriber count tekst
function updateSubscribersUI() {
  const subText = document.getElementById("subscriber-count");
  if (subText) {
    subText.textContent = `${totalSubscribers} Subscribers`;
  }
}

//MIDDLE COLUMN FUNCTIONS



//RIGHT SIDE (ITEM SHOP) FUNCTIONS
const baseTowers = {
  swirling_like_button: {
    displayName: "Swirling Like Button",
    baseCost: 10,
    currentCost: 10,
    lps: 1,
    amount: 0,
    totalProduced: 0,
    description: "Spins around your meme. It’s basic, but it vibes.",
  },
  shitposter_intern: {
    displayName: "Shitposter Intern",
    baseCost: 200,
    currentCost: 200,
    lps: 2,
    amount: 0,
    totalProduced: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  outdated_meme_reposter: {
    displayName: "Outdated Meme Reposter",
    baseCost: 200,
    currentCost: 200,
    lps: 5,
    amount: 0,
    totalProduced: 0,
    description: "Posts Trollface and expects praise. Gets it.",
  },
  edgy_teen: {
    displayName: "Edgy Teen",
    baseCost: 200,
    currentCost: 200,
    lps: 10,
    amount: 0,
    totalProduced: 0,
    description: "Posts aggressively ironic memes from their mom’s Wi-Fi.",
  },
  botnet: {
    displayName: "Botnet",
    baseCost: 200,
    currentCost: 200,
    lps: 20,
    amount: 0,
    totalProduced: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  doomscroller: {
    displayName: "Doomscroller",
    baseCost: 200,
    currentCost: 200,
    lps: 50,
    amount: 0,
    totalProduced: 0,
    description: "Consumes so many memes, the algorithm starts generating them.",
  },
  meme_subreddit: {
    displayName: "Meme Subreddit",
    baseCost: 200,
    currentCost: 200,
    lps: 100,
    amount: 0,
    totalProduced: 0,
    description: "Power of 1 million Redditors with strong opinions.",
  },
  discord_mod: {
    displayName: "Discord Mod",
    baseCost: 200,
    currentCost: 200,
    lps: 200,
    amount: 0,
    totalProduced: 0,
    description: "Will delete your meme, then repost it for clout.",
  },
  tikTok_zoomer: {
    displayName: "TikTok Zoomer",
    baseCost: 200,
    currentCost: 200,
    lps: 500,
    amount: 0,
    totalProduced: 0,
    description: "Edits lightning-fast memes with zero coherence.",
  },
  meme_lord: {
    displayName: "Meme Lord",
    baseCost: 200,
    currentCost: 200,
    lps: 1000,
    amount: 0,
    totalProduced: 0,
    description: "Speaks only in deep-fried memes and obscure references.",
  },
  AI_meme_generator: {
    displayName: "AI Meme Generator",
    baseCost: 200,
    currentCost: 200,
    lps: 2500,
    amount: 0,
    totalProduced: 0,
    description: "Posts memes 24/7, most of which shouldn’t exist.",
  },
  internet_historian: {
    displayName: "Internet Historian",
    baseCost: 200,
    currentCost: 200,
    lps: 10000,
    amount: 0,
    totalProduced: 0,
    description: "Powers up your entire meme empire with sacred meme lore.",
  },
  viral_singularity: {
    displayName: "Viral Singularity",
    baseCost: 200,
    currentCost: 200,
    lps: 25000,
    amount: 0,
    totalProduced: 0,
    description: "A meme so viral it bends the algorithm. Everyone’s For You Page becomes you.",
  },
  cursed_content_forge: {
    displayName: "Cursed Content Forge",
    baseCost: 200,
    currentCost: 200,
    lps: 50000,
    amount: 0,
    totalProduced: 0,
    description: "Combines deep-fried memes with forbidden formats. You’ve created something… unnatural.",
  },
  elons_meme_brainchip: {
    displayName: "Elon's Meme Brainchip",
    baseCost: 200,
    currentCost: 200,
    lps: 100000,
    amount: 0,
    totalProduced: 0,
    description: "Direct neural meme injection. Also tweets itself every 3 seconds.",
  },
  based_reality_distorter: {
    displayName: "Based Reality Distorter",
    baseCost: 200,
    currentCost: 200,
    lps: 250000,
    amount: 0,
    totalProduced: 0,
    description: "Alters reality to fit your memes. “Cringe” is now illegal.",
  },
  meme_multiverse_server: {
    displayName: "Meme Multiverse Server",
    baseCost: 200,
    currentCost: 200,
    lps: 500000,
    amount: 0,
    totalProduced: 0,
    description: "Crossposts across infinite universes. Even Rick Astley is farming likes now.",
  },
  clout_god: {
    displayName: "Clout God",
    baseCost: 200,
    currentCost: 10,
    lps: 1000000,
    amount: 0,
    totalProduced: 0,
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

//Funktion til at opdatere et tower's display værdier
function updateUI(key) {
  const tower = playerTowers[key];
  document.getElementById(`price-${key}`).textContent = `${tower.currentCost} Likes`;
  document.getElementById(`count-${key}`).textContent = `x${tower.amount}`;
}

//Funktion til at opdatere alle tower's display værdier
function updateAllTowersUI() {
  for (const key in playerTowers) {
    if (playerTowers.hasOwnProperty(key)) {
      updateUI(key);
    }
  }
}

//Funktion til at købe et tower
function buyTower(key) {
  const tower = playerTowers[key];
  if (totalLikes >= tower.currentCost) {
    totalLikes -= tower.currentCost;
    tower.amount += 1;
    tower.currentCost = Math.floor(tower.baseCost * Math.pow(1.20, tower.amount));
    likesPerSecond += tower.lps
    // Hvis tooltip stadig er åben og relevant, opdater indholdet
    const hovered = document.querySelector(`.tower-img-box[data-key="${key}"]:hover`);
    if (hovered) {
      const rect = hovered.getBoundingClientRect();
      const fakeEvent = {
        currentTarget: hovered,
        pageY: window.mouseY || hovered.getBoundingClientRect().top + window.scrollY
      };
      showTowerTooltip(fakeEvent, key);
    }
    updateUI(key);
    updateDisplay();
  }
}

//Funktion til at købe et upgrade
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

//Funktion til at opdatere et upgrade's display værdier
function updateUpgradeUI(key) {
  const upgrade = playerUpgrades[key];
  document.getElementById(`price-${key}`).textContent = `${upgrade.currentPrice} Likes`;
  document.getElementById(`count-${key}`).textContent = `Lvl. ${upgrade.currentLevel}`;
}

//Funktion til at opdatere alle upgrade's display værdier
function updateAllUpgradesUI() {
  for (const key in playerUpgrades) {
    if (playerUpgrades.hasOwnProperty(key)) {
      updateUpgradeUI(key);
    }
  }
}

//Funktion der tilføjer tower produktion til totalProduced variablen (det er bare en stats variabel, ingen effekt på selve spillet)
function updateTotalProduced() {
  for (const key in playerTowers) {
    if (playerTowers.hasOwnProperty(key)) {
      const tower = playerTowers[key];
      tower.totalProduced += tower.amount * tower.lps;
    }
  }
}

//Funktion der viser info-bokse for towers
function showTowerTooltip(e, key) {
  const tower = playerTowers[key];
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = `
    <div class="tooltip-title">${tower.displayName}</div>
    <div style="color: #aaa; font-style: italic;">${tower.description || "No description."}</div>
    <div class="tooltip-line">Each tower produces <b>${tower.lps}</b> Likes/sec</div>
    <div class="tooltip-line">${tower.amount} owned = <b>${tower.amount * tower.lps}</b> LPS</div>
    <div class="tooltip-line"><b>${tower.totalProduced}</b> Likes produced in total</div>
  `;
  tooltip.style.display = 'block';

  const towerBox = e.currentTarget.getBoundingClientRect();
  tooltip.style.left = `${towerBox.left - tooltip.offsetWidth - 10}px`; // Fast venstre placering
  tooltip.style.top = `${towerBox.top + window.scrollY}px`;             // Fast top ift. tower
}

//Funktion der gemmer info-bokse for towers
function hideTowerTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
}

//Funktion der opdaterer farven på cost teksterne på towers alt efter om vi har råd eller ej. 
function updateTowerAffordability() {
  for (const key in playerTowers) {
    if (playerTowers.hasOwnProperty(key)) {
      const tower = playerTowers[key];
      const priceEl = document.getElementById(`price-${key}`);
      if (!priceEl) continue;

      if (totalLikes >= tower.currentCost) {
        priceEl.style.color = '#9fff99'; // eller fx '#7fff00'
      } else {
        priceEl.style.color = 'crimson'; // eller '#ff4d4d'
      }
    }
  }
}

//Funktion der opdaterer farven på cost teksterne på upgrades alt efter om vi har råd eller ej. 
function updateUpgradeAffordability() {
  for (const key in playerUpgrades) {
    if (playerUpgrades.hasOwnProperty(key)) {
      const upgrade = playerUpgrades[key];
      const priceEl = document.getElementById(`price-${key}`);
      if (!priceEl) continue;

      if (totalLikes >= upgrade.currentPrice) {
        priceEl.style.color = '#9fff99'; // fx '#7fff00'
      } else {
        priceEl.style.color = 'crimson';   // fx '#ff4d4d'
      }
    }
  }
}

//Funktion til Tab switching
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



//GENERAL FUNCTIONS OR TOP BAR FUNCTIONS
//Funktion til at Opdatere Fane-hovedet med current likes
function updateDocumentTitle() {
  document.title = `${formatNumber(totalLikes)} Likes - Meme Farm`;
}

//Funktion til at formatere tal
function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(3) + " billion";
  if (num >= 1e6) return (num / 1e6).toFixed(3) + " million";
  if (num >= 1e3) return (num / 1e3).toFixed(0) + "K";
  return Math.floor(num);
}

//LOCAL STORAGE
//Gem data
function saveGame() {
  const saveData = {
    totalLikes,
    likesPerSecond,
    totalLikesEver,
    totalSubscribers,
    playerTowers,
    playerUpgrades
  };

  localStorage.setItem('memeFarmSave', JSON.stringify(saveData));
}
//Load data
function loadGame() {
  const save = localStorage.getItem('memeFarmSave');
  if (!save) return;

  try {
    const data = JSON.parse(save);
    totalLikes = data.totalLikes || 0;
    likesPerSecond = data.likesPerSecond || 0;
    totalLikesEver = data.totalLikesEver || 0;
    totalSubscribers = data.totalSubscribers || 0;

    playerTowers = data.playerTowers || JSON.parse(JSON.stringify(baseTowers));
    playerUpgrades = data.playerUpgrades || JSON.parse(JSON.stringify(baseUpgrades));

    updateDisplay();;
    updateAllTowersUI();
    updateAllUpgradesUI();
  } catch (e) {
    console.error("Fejl under indlæsning af spil:", e);
  }
}