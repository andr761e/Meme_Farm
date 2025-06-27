//TOP BAR FUNCTIONS
function openOverlay(tabName) {
  const overlay = document.getElementById("nav-overlay");
  const content = document.getElementById("overlay-content");

  // Du kan tilføje mere kompleks logik her for hvert tab
  switch (tabName) {
    case "Stats":
      content.innerHTML = "<h2>Stats</h2><p>Her vises dine likes, LPS og subscribers osv.</p>";
      break;
    case "Upgrades":
      content.innerHTML = "<h2>Upgrades</h2><p>Oversigt over permanente opgraderinger.</p>";
      break;
    case "Options":
      content.innerHTML = "<h2>Options</h2><p>Her kan du ændre spilindstillinger.</p>";
      break;
    case "Info":
      content.innerHTML = "<h2>Info</h2><p>Lavet af dig – det sejeste idle game nogensinde.</p>";
      break;
  }

  overlay.style.display = "flex";
}

function closeOverlay() {
  document.getElementById("nav-overlay").style.display = "none";
}


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
  totalLikesDisplay.textContent = `${formatNumber(totalLikes)} Likes`;
  lpsDisplay.textContent = `${formatNumber(likesPerSecond)} LPS`;
  totalSubsDisplay.textContent = `${formatNumber(totalSubscribers)} Subscribers`;

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

//MIDDLE COLUMN FUNCTIONS



//RIGHT SIDE (ITEM SHOP) FUNCTIONS
const baseTowers = {
  swirling_like_button: {
    displayName: "Swirling Like Button",
    baseCost: 15,
    currentCost: 15,
    lps: 0.1,
    amount: 0,
    totalProduced: 0,
    description: "Spins around your meme. It’s basic, but it vibes.",
  },
  shitposter_intern: {
    displayName: "Shitposter Intern",
    baseCost: 100,
    currentCost: 100,
    lps: 0.3,
    amount: 0,
    totalProduced: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  outdated_meme_reposter: {
    displayName: "Outdated Meme Reposter",
    baseCost: 500,
    currentCost: 500,
    lps: 0.5,
    amount: 0,
    totalProduced: 0,
    description: "Posts Trollface and expects praise. Gets it.",
  },
  edgy_teen: {
    displayName: "Edgy Teen",
    baseCost: 2000,
    currentCost: 2000,
    lps: 1,
    amount: 0,
    totalProduced: 0,
    description: "Posts aggressively ironic memes from their mom’s Wi-Fi.",
  },
  botnet: {
    displayName: "Botnet",
    baseCost: 10000,
    currentCost: 10000,
    lps: 3,
    amount: 0,
    totalProduced: 0,
    description: "Works for exposure. And chaos. Mostly chaos.",
  },
  doomscroller: {
    displayName: "Doomscroller",
    baseCost: 50000,
    currentCost: 50000,
    lps: 10,
    amount: 0,
    totalProduced: 0,
    description: "Consumes so many memes, the algorithm starts generating them.",
  },
  meme_subreddit: {
    displayName: "Meme Subreddit",
    baseCost: 200000,
    currentCost: 200000,
    lps: 20,
    amount: 0,
    totalProduced: 0,
    description: "Power of 1 million Redditors with strong opinions.",
  },
  discord_mod: {
    displayName: "Discord Mod",
    baseCost: 500000,
    currentCost: 500000,
    lps: 40,
    amount: 0,
    totalProduced: 0,
    description: "Will delete your meme, then repost it for clout.",
  },
  tikTok_zoomer: {
    displayName: "TikTok Zoomer",
    baseCost: 1500000,
    currentCost: 1500000,
    lps: 100,
    amount: 0,
    totalProduced: 0,
    description: "Edits lightning-fast memes with zero coherence.",
  },
  meme_lord: {
    displayName: "Meme Lord",
    baseCost: 5000000,
    currentCost: 5000000,
    lps: 300,
    amount: 0,
    totalProduced: 0,
    description: "Speaks only in deep-fried memes and obscure references.",
  },
  AI_meme_generator: {
    displayName: "AI Meme Generator",
    baseCost: 15000000,
    currentCost: 15000000,
    lps: 800,
    amount: 0,
    totalProduced: 0,
    description: "Posts memes 24/7, most of which shouldn’t exist.",
  },
  internet_historian: {
    displayName: "Internet Historian",
    baseCost: 30000000,
    currentCost: 30000000,
    lps: 1500,
    amount: 0,
    totalProduced: 0,
    description: "Powers up your entire meme empire with sacred meme lore.",
  },
  viral_singularity: {
    displayName: "Viral Singularity",
    baseCost: 100000000,
    currentCost: 100000000,
    lps: 3000,
    amount: 0,
    totalProduced: 0,
    description: "A meme so viral it bends the algorithm. Everyone’s For You Page becomes you.",
  },
  cursed_content_forge: {
    displayName: "Cursed Content Forge",
    baseCost: 300000000,
    currentCost: 300000000,
    lps: 5000,
    amount: 0,
    totalProduced: 0,
    description: "Combines deep-fried memes with forbidden formats. You’ve created something… unnatural.",
  },
  elons_meme_brainchip: {
    displayName: "Elon's Meme Brainchip",
    baseCost: 1000000000,
    currentCost: 1000000000,
    lps: 10000,
    amount: 0,
    totalProduced: 0,
    description: "Direct neural meme injection. Also tweets itself every 3 seconds.",
  },
  based_reality_distorter: {
    displayName: "Based Reality Distorter",
    baseCost: 2500000000,
    currentCost: 2500000000,
    lps: 20000,
    amount: 0,
    totalProduced: 0,
    description: "Alters reality to fit your memes. “Cringe” is now illegal.",
  },
  meme_multiverse_server: {
    displayName: "Meme Multiverse Server",
    baseCost: 10000000000,
    currentCost: 10000000000,
    lps: 30000,
    amount: 0,
    totalProduced: 0,
    description: "Crossposts across infinite universes. Even Rick Astley is farming likes now.",
  },
  clout_god: {
    displayName: "Clout God",
    baseCost: 20000000000,
    currentCost: 20000000000,
    lps: 50000,
    amount: 0,
    totalProduced: 0,
    description: "You no longer post memes. You are the meme. Worshipped by ironic teens and boomers alike.",
  },
    boomer_facebook_group: {
    displayName: "Boomer Facebook Group",
    baseCost: 40000000000,
    currentCost: 40000000000,
    lps: 75000,
    amount: 0,
    totalProduced: 0,
    description: "Posts the same Minions meme every day. Somehow farms billions of likes."
  },
  irony_engine: {
    displayName: "Irony Engine",
    baseCost: 60000000000,
    currentCost: 60000000000,
    lps: 100000,
    amount: 0,
    totalProduced: 0,
    description: "Drives pure irony into the meme stream. Nothing makes sense, but everything works."
  },
  fourchan_core_reactor: {
    displayName: "4chan Core Reactor",
    baseCost: 100000000000,
    currentCost: 100000000000,
    lps: 150000,
    amount: 0,
    totalProduced: 0,
    description: "A toxic power plant of chaos. Generates unstable yet high-yield meme reactions."
  },
  eternal_rickroll_loop: {
    displayName: "Eternal Rickroll Loop",
    baseCost: 250000000000,
    currentCost: 250000000000,
    lps: 300000,
    amount: 0,
    totalProduced: 0,
    description: "A time loop that eternally Rickrolls the internet. Likes surge with every repetition."
  },
  wojak_factory: {
    displayName: "Wojak Factory",
    baseCost: 500000000000,
    currentCost: 500000000000,
    lps: 500000,
    amount: 0,
    totalProduced: 0,
    description: "Mass-produces emotionally unstable memes for every niche feeling imaginable."
  },
  quantum_shitpost_array: {
    displayName: "Quantum Shitpost Array",
    baseCost: 1000000000000,
    currentCost: 1000000000000,
    lps: 750000,
    amount: 0,
    totalProduced: 0,
    description: "Shitposts in every timeline simultaneously. Some of them make you question reality."
  },
  copium_refinery: {
    displayName: "Copium Refinery",
    baseCost: 1500000000000,
    currentCost: 1500000000000,
    lps: 1000000,
    amount: 0,
    totalProduced: 0,
    description: "Distills pure Copium into memeable doses. Increases engagement during crises."
  },
  npc_overpopulation_center: {
    displayName: "NPC Overpopulation Center",
    baseCost: 3000000000000,
    currentCost: 3000000000000,
    lps: 1500000,
    amount: 0,
    totalProduced: 0,
    description: "Spawns billions of NPCs to mindlessly like whatever you post."
  },
  nft_cemetery: {
    displayName: "NFT Cemetery",
    baseCost: 7500000000000,
    currentCost: 7500000000000,
    lps: 3000000,
    amount: 0,
    totalProduced: 0,
    description: "Buries broken dreams and JPEGs, harvesting nostalgia-laced meme juice."
  },
  cringe_singularity: {
    displayName: "Cringe Singularity",
    baseCost: 20000000000000,
    currentCost: 20000000000000,
    lps: 5000000,
    amount: 0,
    totalProduced: 0,
    description: "Collapses all outdated humor into a dense point of ironic power. It's horrifying. And efficient."
  },
  ceo_of_memes: {
    displayName: "CEO of Memes",
    baseCost: 50000000000000,
    currentCost: 50000000000000,
    lps: 7500000,
    amount: 0,
    totalProduced: 0,
    description: "They don’t make the memes. They acquire them. Then sue others for using them."
  },
  reality_glitcher: {
    displayName: "Reality Glitcher",
    baseCost: 100000000000000,
    currentCost: 100000000000000,
    lps: 10000000,
    amount: 0,
    totalProduced: 0,
    description: "Corrupts spacetime to insert your memes into dreams, hallucinations, and PowerPoint templates."
  },
  sigma_godfather: {
    displayName: "Sigma Godfather",
    baseCost: 300000000000000,
    currentCost: 300000000000000,
    lps: 15000000,
    amount: 0,
    totalProduced: 0,
    description: "He mentored every grindset influencer. Just staring at his quotes makes likes appear."
  },
  multiversal_mod_team: {
    displayName: "Multiversal Mod Team",
    baseCost: 1000000000000000,
    currentCost: 1000000000000000,
    lps: 20000000,
    amount: 0,
    totalProduced: 0,
    description: "Bans negativity across all realities, except your memes. Boosts engagement galactically."
  },
  chrono_poster: {
    displayName: "Chrono-Poster",
    baseCost: 2000000000000000,
    currentCost: 2000000000000000,
    lps: 30000000,
    amount: 0,
    totalProduced: 0,
    description: "Posts before trends happen. Likes pour in before the meme is even born."
  },
  memeconomist: {
    displayName: "Memeconomist",
    baseCost: 5000000000000000,
    currentCost: 5000000000000000,
    lps: 50000000,
    amount: 0,
    totalProduced: 0,
    description: "Invented the Meme Index™. Pumps and dumps meme trends to maximize virality."
  },
  zuckerbot_9000: {
    displayName: "Zuckerbot 9000",
    baseCost: 10000000000000000,
    currentCost: 10000000000000000,
    lps: 75000000,
    amount: 0,
    totalProduced: 0,
    description: "A fully automated content replicator with the face of Zuckerberg. Likes increase when stared at."
  },
  forbidden_archivist: {
    displayName: "The Forbidden Archivist",
    baseCost: 20000000000000000,
    currentCost: 20000000000000000,
    lps: 100000000,
    amount: 0,
    totalProduced: 0,
    description: "Knows every meme, even the ones deleted by the FBI. Likes summoned from the dark web."
  },
  cursed_tiktok_cultist: {
    displayName: "Cursed TikTok Cultist",
    baseCost: 30000000000000000,
    currentCost: 30000000000000000,
    lps: 125000000,
    amount: 0,
    totalProduced: 0,
    description: "Posts rituals disguised as memes. Teens follow blindly. Likes rise mysteriously at 3:00 AM."
  },
  meme_pope: {
    displayName: "The Meme Pope",
    baseCost: 50000000000000000,
    currentCost: 50000000000000000,
    lps: 150000000,
    amount: 0,
    totalProduced: 0,
    description: "Declares meme crusades and canonizes dankness. Blesses your farm with divine irony."
  },
  ai_thinks_its_funny: {
    displayName: "AI That Thinks It’s Funny",
    baseCost: 150000000000000000,
    currentCost: 150000000000000000,
    lps: 300000000,
    amount: 0,
    totalProduced: 0,
    description: "It doesn’t get the joke, but it posts 10,000 a second. Half go viral. Half cause concern."
  },
  the_algorithm: {
    displayName: "The Algorithm Itself",
    baseCost: 1000000000000000000,
    currentCost: 1000000000000000000,
    lps: 1000000000,
    amount: 0,
    totalProduced: 0,
    description: "You don’t beat the algorithm. You *become* the algorithm. Everything bows to you now."
  }
  // ... flere towers
};

baseUpgrades = {
  power_click: {
    basePower: 1,
    currentPower: 1,
    baseLevel: 0,
    currentLevel: 0,
    basePrice: 1000,
    currentPrice: 1000,
  }
}

//Funktion til at opdatere et tower's display værdier
function updateUI(key) {
  const tower = playerTowers[key];
  document.getElementById(`price-${key}`).textContent = `${formatNumber(tower.currentCost)} Likes`;
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
    tower.currentCost = Math.floor(tower.baseCost * Math.pow(1.25, tower.amount));
    likesPerSecond += tower.lps;
    // Afspil lyd
    const effect = new Audio('../assets/sounds/pop-sound.mp3');
    effect.volume = 0.1;
    effect.play();
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
    // Afspil lyd
    const effect = new Audio('../assets/sounds/pop-sound.mp3');
    effect.volume = 0.1;
    effect.play();
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
    const suffixes = [
        { value: 1e60, suffix: " novemdecillion" },
        { value: 1e57, suffix: " octodecillion" },
        { value: 1e54, suffix: " septendecillion" },
        { value: 1e51, suffix: " sexdecillion" },
        { value: 1e48, suffix: " quindecillion" },
        { value: 1e45, suffix: " quattuordecillion" },
        { value: 1e42, suffix: " tredecillion" },
        { value: 1e39, suffix: " duodecillion" },
        { value: 1e36, suffix: " undecillion" },
        { value: 1e33, suffix: " decillion" },
        { value: 1e30, suffix: " nonillion" },
        { value: 1e27, suffix: " octillion" },
        { value: 1e24, suffix: " septillion" },
        { value: 1e21, suffix: " sextillion" },
        { value: 1e18, suffix: " quintillion" },
        { value: 1e15, suffix: " quadrillion" },
        { value: 1e12, suffix: " trillion" },
        { value: 1e9,  suffix: " billion" },
        { value: 1e6,  suffix: " million" },
        { value: 1e3,  suffix: "K" }
    ];

    for (let i = 0; i < suffixes.length; i++) {
        if (num >= suffixes[i].value) {
            return (num / suffixes[i].value).toFixed(3) + suffixes[i].suffix;
        }
    }

    return Math.floor(num).toString();
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

    updateDisplay();
    updateAllTowersUI();
    updateAllUpgradesUI();
  } catch (e) {
    console.error("Fejl under indlæsning af spil:", e);
  }
}