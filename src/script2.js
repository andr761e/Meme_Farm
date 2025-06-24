//Game Stats
let totalLikes = 0;
let likesPerSecond = 0;
let totalLikesEver = 0;
let hoveredKey = null;
let lastHoverY = null;
let totalSubscribers = 0;

let playerTowers = JSON.parse(JSON.stringify(baseTowers));
let playerUpgrades = JSON.parse(JSON.stringify(baseUpgrades));

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
  totalLikesEver += gain;

  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createLikePopup(`+${gain}`, x, y);
});

// Likes per second increment
setInterval(() => {
  totalLikes += likesPerSecond;
  totalLikesEver += likesPerSecond
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

// Spawn én subscriber hvert 15–25 sekund
setInterval(() => {
  if (Math.random() < 0.5) spawnSubscriber();
}, 15000);

//LOCAL STORAGE DEL, VERY IMPORTANT
//Load Local Storage
window.addEventListener('load', loadGame);
updateSubscribersUI();
