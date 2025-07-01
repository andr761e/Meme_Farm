//Game Stats
//Values displayed in game
let totalLikes = 0;
let likesPerSecond = 0;
let totalSubscribers = 0;
//Background values
let totalLikesEver = 0;
let totalSubscribersEver = 0;
let playTimeSeconds = 0;
let totalClicks = 0; 
let totalLikesFromClicks = 0;
let luckySpinsUsed = 0;
let totalTowersOwned = 0;
let totalLikesSpent = 0;


let hoveredKey = null;
let lastHoverY = null;

//Directionaries med Towers og Upgrades
let playerTowers = JSON.parse(JSON.stringify(baseTowers));
let playerUpgrades = JSON.parse(JSON.stringify(baseUpgrades));

// Automatisk tilknytter overlay-åbning til hver nav-tab
document.querySelectorAll(".nav-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    const tabName = button.textContent.trim(); // fx "Stats"
    openOverlay(tabName);
  });
});


//Tjekker om en tower boks bliver klikket og kalder derefter køb tower. Viser også info boks
document.querySelectorAll('.tower-img-box').forEach(box => {
  const key = box.dataset.key;

  box.addEventListener('mouseenter', (e) => {
    hoveredKey = key;
    lastHoverY = e.pageY;
    showTowerTooltip(e, key);
  });

  box.addEventListener('mouseleave', () => {
    hoveredKey = null;
    lastHoverY = null;
    hideTowerTooltip();
  });


  box.addEventListener('click', () => {
    buyTower(key);
  });
});


//Tjekker om en opgrade boks bliver klikket og kalder derefter køb upgrade
document.querySelectorAll('.upgrade-img-box').forEach(box => {
  box.addEventListener('click', () => {
    const key = box.dataset.key;
    buyUpgrade(key);
  });
});

//Henter elementerne der er meme-knappen, viser total likes og 
const memeButton = document.getElementById("meme-button");
const totalLikesDisplay = document.getElementById("total-likes");
const lpsDisplay = document.getElementById("likes-per-sec");
const totalSubsDisplay = document.getElementById("subscriber-count");

//Henter objekterne, der styrer skift imellem towers og upgrades
const tabTowers = document.getElementById("tab-towers");
const tabUpgrades = document.getElementById("tab-upgrades");
const shopTowers = document.getElementById("shop-towers");
const shopUpgrades = document.getElementById("shop-upgrades");

// Meme Button Click
memeButton.addEventListener("click", (e) => {
  const gain = playerUpgrades.power_click.currentPower;
  totalLikes += gain;
  updateDisplay();
  totalClicks += 1;
  totalLikesFromClicks += gain;
  totalLikesEver += gain;
      // Afspil lyd
    const effect = new Audio('../assets/sounds/pop-sound.mp3');
    effect.volume = 0.1;
    effect.play();
  
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createLikePopup(`+${gain}`, x, y);
});

// Likes per second increment
setInterval(() => {
  totalLikes += likesPerSecond;
  totalLikesEver += likesPerSecond
  playTimeSeconds += 1;
  updateDisplay();
  updateTotalProduced();
  updateDocumentTitle();
}, 1000);

//Opdaterer farven på cost-teksterne og gemmer spillet til local storage hvert 100 ms. 
setInterval(() => {
  updateTowerAffordability();
  updateUpgradeAffordability();
  if (hoveredKey !== null) {
  const hovered = document.querySelector(`.tower-img-box[data-key="${hoveredKey}"]`);
  if (hovered) {
    const fakeEvent = {
      currentTarget: hovered,
      pageY: lastHoverY
    };
    showTowerTooltip(fakeEvent, hoveredKey);
  }
}
  saveGame();
}, 100)

//Knap der resetter alle værdier ved tryk
document.getElementById("reset-box").addEventListener("click", () => {
  playerTowers = JSON.parse(JSON.stringify(baseTowers));
  playerUpgrades = JSON.parse(JSON.stringify(baseUpgrades));
  totalLikes = 0;
  likesPerSecond = 0;
  totalLikesEver = 0; 
  totalSubscribers = 0;
  totalSubscribersEver = 0;
  playTimeSeconds = 0;
  totalClicks = 0;
  totalLikesFromClicks = 0;
  luckySpinsUsed = 0;
  totalTowersOwned = 0;
  totalLikesSpent = 0;
  updateDisplay();
  updateAllUpgradesUI();
  updateAllTowersUI();
})

//Event listeners til tryk på tower og upgrade tabs (så man kan skifte mellem dem)
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

document.addEventListener('mousemove', (e) => {
  window.mouseY = e.pageY;
});

document.querySelectorAll('.middle-tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.dataset.tab;

    document.querySelectorAll('.middle-tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.middle-tab-content').forEach(tab => {
      tab.style.display = tab.id === tabId ? 'block' : 'none';
    });
  });
});


//SWIRLING LIKES BUTTONS OMKRING MEME BUTTON
let orbitAngleOffset = 0;

animateOrbit(); // Start loop

// Spawn én subscriber baseret på en normfordeling over 1 minut
let seconds = 0;

function normalPDF(x, mean, std) {
  const expPart = Math.exp(-0.5 * ((x - mean) / std) ** 2);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * expPart;
}

setInterval(() => {
  const mean = 60;
  const std = 10; // mindre = skarpere kurve, større = bredere top
  const probability = normalPDF(seconds, mean, std) * 20; // skaler for at matche ønsket spawnrate

  if (Math.random() < probability) {
    spawnSubscriber();
    seconds = 0; // reset efter spawn
  } else {
    seconds++;
    if (seconds > 120) seconds = 0;
  }
}, 1000);

//LOCAL STORAGE DEL, VERY IMPORTANT
//Load Local Storage
window.addEventListener('load', loadGame);
