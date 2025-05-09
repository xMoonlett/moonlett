// --- Game State ---
let sharkies = parseInt(localStorage.getItem('sharkies')) || 0;
let sharkiesPerSecond = parseInt(localStorage.getItem('sharkiesPerSecond')) || 0;
let sharkiesByClick = parseInt(localStorage.getItem('sharkiesByClick')) || 0;
let sharkiesByAuto = parseInt(localStorage.getItem('sharkiesByAuto')) || 0;
let themes = localStorage.getItem('sharkieThemes') || 'default';
let achieved = JSON.parse(localStorage.getItem('achievements')) || [];
let ownedThemes = JSON.parse(localStorage.getItem('ownedThemes')) || ['default'];
let clickKey = localStorage.getItem('clickKey') || '';
let fishCoins = parseInt(localStorage.getItem('fishCoins')) || 0;

// --- Game Data ---
const upgrades = [
  { id: 'basic', name: 'Fisherman', cost: 75, increment: 25 },
  { id: 'boat', name: 'Fishing Boat', cost: 375, increment: 125 },
  { id: 'ship', name: 'Sharkie Ship', cost: 1875, increment: 625 },
  { id: 'factory', name: 'Sharkie Factory', cost: 9375, increment: 3125 },
  { id: 'laboratory', name: 'Sharkie laboratory', cost: 46875, increment: 15625 },
  { id: 'hammerhead', name: 'Hammerhead Waters', cost: 234375, increment: 78125 },
];

document.addEventListener("click", (e) => {
  const ignoreList = [
    "BUTTON",
    "A",
    "INPUT",
    "TEXTAREA",
    "LABEL",
    "SELECT"
  ];

  if (
    ignoreList.includes(e.target.tagName) ||
    e.target.closest("#side-menu") ||
    e.target.closest("#upgrades") ||
    e.target.closest("#helpers-container") ||
    e.target.closest("#settings-tab") ||
    e.target.closest(".hamburger")
  ) {
    return;
  }

  clickShark();
});

const achievements = [
  { sharkies: 500, name: "Tiny Sharkie" },
  { sharkies: 1000, name: "Baby Sharkie" },
  { sharkies: 5000, name: "Growing Sharkie" },
  { sharkies: 10000, name: "Mega Sharkie" },
  { sharkies: 50000, name: "Ultra Sharkie" },
  { sharkies: 100000, name: "Legendary Sharkie" },
  { sharkies: 500000, name: "Mythical Sharkie" },
  { sharkies: 1000000, name: "Lottie! 🦈✨", lottie: true },
  { sharkies: 5000000, name: "Aqua & Joshy! 🦈✨" },
  {
    sharkies: -101,
    name: "💀 Busted! - Sharkie Justice Served",
    secret: true,
    description: "You got caught by Sharkie Justice Mode. Shame."
  },
  {
    sharkies: -666,
    name: "🔒 Perma-Banned (Just Kidding)",
    secret: true,
    description: "You reached full Sharkie Justice Mode lockout. Respect...?"
  }
];

function clickShark() {
  sharkies++;
  sharkiesByClick++;
  checkAchievements();  // Check achievements on every click
  
  const lottie = helpers.find(h => h.id === 'lottie' && h.unlocked);
  if (lottie) {
    spawnHeart();
  }

  if (lottie && lottie.unlocked) {
    spawnHeart();
    incrementLottieHeartQuest();
  }

  updateGame();
}

function updateGame() {
  document.getElementById("shark-count").innerText = `Sharkies: ${sharkies.toLocaleString()}`;
  document.getElementById("shark-per-second").innerText = `Sharkies per second: ${sharkiesPerSecond.toLocaleString()}`;
  updateStats();
  displayUpgrades();
  displayHelpers();
  updateProgress();
  document.getElementById("fish-coin-count").innerText = `Fish Coins: ${formatNumber(fishCoins)}`;
}

setInterval(() => {
  const totalSharkies = sharkiesByClick + sharkiesByAuto;
  const totalClicks = sharkiesByClick;
  const totalHelpers = helpers.filter(h => h.unlocked).length;

  fishCoins = checkQuests(totalSharkies, totalClicks, totalHelpers, fishCoins);
  localStorage.setItem('fishCoins', fishCoins);

  const fishDisplay = document.getElementById('fish-coin-count');
  if (fishDisplay) {
    fishDisplay.innerText = `Fish Coins: ${formatNumber(fishCoins)}`;
  }
}, 1000);

function updateStats() {
  localStorage.setItem('sharkies', sharkies);
  localStorage.setItem('sharkiesByClick', sharkiesByClick);
  localStorage.setItem('sharkiesByAuto', sharkiesByAuto);
  localStorage.setItem('fishCoins', fishCoins);
}

function buyUpgrade(upgrade) {
  if (sharkies >= upgrade.cost) {
    sharkies -= upgrade.cost;
    const increment = Math.ceil(upgrade.increment + (upgrade.cost / 15));
    sharkiesPerSecond += increment;
    upgrade.cost = Math.floor(upgrade.cost * 5);
    localStorage.setItem(upgrade.id + '-cost', upgrade.cost);
    localStorage.setItem('sharkiesPerSecond', sharkiesPerSecond);
    updateGame();
    displayUpgrades(); // Refresh upgrades
  }
}

function loadAchievements() {
  const normalAchieves = achieved.filter(name =>
    !achievements.find(a => a.name === name)?.secret
  );
  if (normalAchieves.length === 0) {
    document.getElementById('no-achievements-placeholder').style.display = 'block';
  } else {
    document.getElementById('no-achievements-placeholder').style.display = 'none';
  }

  achieved.forEach(name => {
    const achieve = achievements.find(a => a.name === name);
    if (achieve) showAchievement(achieve);
  });

  const secretAchieves = achieved.filter(name =>
    achievements.find(a => a.name === name)?.secret
  );

  if (secretAchieves.length > 0) {
    document.getElementById('cheater-title').style.display = 'block';
    document.getElementById('cheater-achievement-list').style.display = 'block';
  }
}

function checkAchievements() {
  achievements.forEach(achieve => {
    if (!achieved.includes(achieve.name) && sharkies >= achieve.sharkies) {
      unlockAchievement(achieve);
    }
  });
}

function unlockAchievement(achieve) {
  if (!achieved.includes(achieve.name)) {
    achieved.push(achieve.name);
    localStorage.setItem('achievements', JSON.stringify(achieved));
    showAchievement(achieve);
  }
}

function showAchievement(achieve) {
  console.log('Achievement:', achieve);
  const isCheater = achieve.secret === true;

  // Choose the correct list to display the achievement
  const list = document.getElementById(isCheater ? 'cheater-achievement-list' : 'achievement-list');

  // Create and add the list item
  const item = document.createElement('li');
  item.textContent = isCheater
    ? `${achieve.name} (Secret Unlocked!)`
    : `${achieve.name} (${achieve.sharkies.toLocaleString()} Sharkies!)`;
  list.appendChild(item);

  // Reveal secret section if needed
  if (isCheater) {
    const cheaterSection = document.getElementById('cheater-achievement-section');
    const cheaterTitle = document.getElementById('cheater-title');
    if (cheaterSection) cheaterSection.style.display = 'block';
    if (cheaterTitle) cheaterTitle.style.display = 'block';
  }

  // Show popup
  const popup = document.getElementById('achievement-popup');
  popup.textContent = `🏅 Achievement Unlocked: ${achieve.name}!`;
  popup.style.opacity = 1;
  setTimeout(() => popup.style.opacity = 0, 2000);

  // Show Lottie animation if needed
  if (achieve.lottie) {
    const lottieBox = document.getElementById('lottie-achievement');
    if (lottieBox) {
      lottieBox.style.display = 'block';
      lottie.loadAnimation({
        container: lottieBox,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/92d5910c-0836-4bd4-bd94-c9b675a177a2/X65m1OQ8As.json'
      });
    }
  }
}


function formatNumber(num) {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(1) + 'T'; // Trillions
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'; // Billions
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'; // Millions
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'; // Thousands
  } else {
    return num.toFixed(0); // Return as is if it's less than 1,000
  }
}

function displayUpgrades() {
  const container = document.getElementById('upgrades');
  container.innerHTML = ''; // Clear any previous content

  const formattedSharkies = formatNumber(sharkies);

  // Create the first row container
  let row = document.createElement('div');
  row.classList.add('upgrade-row');
  container.appendChild(row);  // Append the first row to the container

  upgrades.forEach((upgrade, index) => {
    upgrade.cost = parseInt(localStorage.getItem(upgrade.id + '-cost')) || upgrade.cost;

    const dynamicIncrement = Math.ceil(upgrade.increment + (upgrade.cost / 15)); // Dynamic increment for upgrade
    const formattedCost = formatNumber(upgrade.cost);

    // Create the upgrade card
    const upgradeCard = document.createElement('div');
    upgradeCard.classList.add('upgrade-card');

    // Create upgrade name as the first element
    const name = document.createElement('h3');
    name.classList.add('upgrade-name');
    name.textContent = upgrade.name;

    // Create the description text (placed below the name)
    const description = document.createElement('p');
    description.classList.add('upgrade-description');
    description.textContent = `${dynamicIncrement} sharkies per second.`;

    // Create the button for the upgrade
    const btn = document.createElement('button');
    btn.textContent = `Cost: ${formattedCost}`;
    btn.onclick = (e) => { e.stopPropagation(); buyUpgrade(upgrade, e); };  // Buy the upgrade on click
    btn.disabled = sharkies < upgrade.cost;  // Disable button if the player doesn't have enough Sharkies

    // Append the name, description, and button to the card
    upgradeCard.appendChild(name);
    upgradeCard.appendChild(description);
    upgradeCard.appendChild(btn);

    // If it's the first item or every 3rd item, add a new row before adding more upgrades
    if (index % 3 === 0 && index !== 0) {
      // Add a new row for every set of 3 upgrades
      row = document.createElement('div');
      row.classList.add('upgrade-row');
      container.appendChild(row);  // Add the new row to the container
    }

    // Add the card to the last row (or newly created row)
    row.appendChild(upgradeCard);
  });

  // Update the sharkies display with the formatted value
  document.getElementById('shark-count').innerText = `Sharkies: ${formattedSharkies}`;
}


function resetGame() {
  if (confirm("Are you sure you want to reset all your Sharkies and progress?")) {
    [
      'sharkies',
      'sharkiesPerSecond',
      'sharkiesByClick',
      'sharkiesByAuto',
      'achievements',
      'rewardStreak',
      'lastClaimDate',
      'sharkieThemes',
      'helpers',
      'unlockedThemes',
      'ownedThemes'
    ].forEach(k => localStorage.removeItem(k));

    upgrades.forEach(u => localStorage.removeItem(u.id + '-cost'));

    sharkies = 0;
    sharkiesPerSecond = 0;
    sharkiesByClick = 0;
    sharkiesByAuto = 0;
    achieved = [];
    ownedThemes = ['default'];

    setTimeout(() => location.reload(), 100);
  }
}


setInterval(() => {
  sharkies += sharkiesPerSecond;
  sharkiesByAuto += sharkiesPerSecond;
  updateGame();
}, 1000);

function updateProgress() {
  document.getElementById('click-sharkies').innerText = `Sharkies caught by clicking: ${sharkiesByClick}`;
  document.getElementById('auto-sharkies').innerText = `Sharkies caught automatically: ${sharkiesByAuto}`;
  document.getElementById('total-sharkies').innerText = `Total Sharkies caught: ${sharkiesByClick + sharkiesByAuto}`;
}

function loadHelpers() {
  const savedHelpers = JSON.parse(localStorage.getItem('helpers')) || [];
  savedHelpers.forEach(saved => {
    const helper = helpers.find(h => h.id === saved.id);
    if (helper) {
      helper.unlocked = saved.unlocked;
      if (helper.id === 'lottie' && saved.unlocked) {
        lottieUnlocked = true;
        document.getElementById('lottie-glow-overlay').style.display = 'block';
      }
    }
  });
  displayHelpers();
}

window.onload = () => {
  showTab('game');
  updateGame();
  loadHelpers();
  loadThemes();
  startHelperEffects();
  displayThemes();
  displayUpgrades();
  updateProgress();
  startLottieHelper();
  loadAchievements();
  checkAchievements();
  questRefreshInterval = setInterval(displayQuests, 15000);
};



// Apply saved themes on load
function loadThemes() {
  const savedThemes = localStorage.getItem('sharkieThemes') || 'default';
  setThemes(savedThemes, true);
}

// Change Themes
function setThemes(themesName, isLoading = false) {
  const themesCosts = {
    default: 0,
  };

  let unlockedThemes = JSON.parse(localStorage.getItem('unlockedThemes')) || ['default'];
  let ownedThemes = JSON.parse(localStorage.getItem('ownedThemes')) || ['default'];

  if (unlockedThemes.includes(themesName) || isLoading) {
    document.body.className = `${themesName}-themes`;
    localStorage.setItem('sharkieThemes', themesName);
    return;
  }

  if (sharkies < themesCosts[themesName]) {
    alert(`You need ${themesCosts[themesName].toLocaleString()} Sharkies to unlock this Theme!`);
    return;
  }

  sharkies -= themesCosts[themesName];
  unlockedThemes.push(themesName);
  ownedThemes.push(themesName);
  localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  localStorage.setItem('ownedThemes', JSON.stringify(ownedThemes));
  localStorage.setItem('sharkies', sharkies);
  localStorage.setItem('sharkieThemes', themesName);

  document.body.className = `${themesName}-themes`;
  updateGame();
  updateStats();
  displayThemes();
  alert(`Themes changed to ${themesName.charAt(0).toUpperCase() + themesName.slice(1)}!`);
}

function displayThemes() {
  const container = document.getElementById('themes-container');
  container.innerHTML = '';

  const themes = [
    { id: 'default', name: 'Ocean Breeze', cost: 0 },
  ];

  themes.forEach(themes => {
    const btn = document.createElement('button');
    const owned = ownedThemes.includes(themes.id);
    btn.textContent = owned ? `${themes.name} ✔️` : `${themes.name} (${themes.cost.toLocaleString()} Sharkies)`;
    btn.disabled = owned;
    btn.onclick = () => setthemes(themes.id);
    container.appendChild(btn);
  });
}

function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu.style.width === '250px') {
    menu.style.width = '0';
  } else {
    menu.style.width = '250px';
  }
}

function showTab(tab) {
  ['game', 'achievements', 'settings', 'progress', 'themes', 'helpers', 'quests', 'store'].forEach(t => {
    document.getElementById(`${t}-tab`).style.display = (tab === t) ? 'block' : 'none';
  });

  if (tab === 'quests') {
    displayQuests();
  }

  document.getElementById('side-menu').classList.remove('open');

  const helpBtn = document.getElementById('need-help-btn');
  helpBtn.style.display = (tab === 'game') ? 'block' : 'none';
}


const helpers = [
  {
    id: 'baby',
    name: 'Baby Sharkie',
    cost: 10000,
    clickBoost: 50,
    description: 'Gives +50 Sharkie per click.',
    unlocked: false
  },
  {
    id: 'chef',
    name: 'Chef Sharkie',
    cost: 50000,
    costReduction: 0.5,
    description: 'Reduces all upgrade costs by 50%.',
    unlocked: false
  },
  {
    id: 'lottie',
    name: 'Lottie',
    cost: 15000000,
    clickBoost: 10,
    autoBoost: 5000,
    unlocked: false,
    hearts: true,
    aura: true,
    description: `➕ +10,000 Sharkies every 5s  
🎯 +10% click bonus  
💖 Heart animations  
💞 Rare Big Hugs (+50K Sharkies!)  
🌟 Glowing aura  
🖱️ Auto-clicks for 5s every 5 minutes`

  }
];

// Lottie Helper Tracking
let lottieUnlocked = false;
let lottieAutoClickInterval;
let lottieAutoClickTimer = 0;

// Start Lottie when unlocked
function startLottieHelper() {
  if (!lottieUnlocked) return;

  // Glowing aura
  document.getElementById('shark-count').classList.add('glow-aura');

  // Sharkie boost every 5 seconds
  setInterval(() => {
    sharkies += 5000;
    spawnHeart();

    // Big Hug bonus (1% chance)
    if (Math.random() < 0.01) {
      sharkies += 50000;
      spawnHeart(); spawnHeart(); spawnHeart();
      showLottieMessage("Lottie gives you a Big Hug! 💞 +50,000 Sharkies!");
    }

    updateGame();
  }, 5000);

  // Auto-click every 5 minutes for 5 seconds
  setInterval(() => {
    showLottieMessage("Lottie is auto-clicking for you! 🖱️💖");
    lottieAutoClickTimer = 10; // 10 ticks of 500ms = 5s
    lottieAutoClickInterval = setInterval(() => {
      if (lottieAutoClickTimer <= 0) {
        clearInterval(lottieAutoClickInterval);
        return;
      }
      clickShark();
      lottieAutoClickTimer--;
    }, 500);
  }, 5 * 60 * 1000); // 5 minutes
}

function startHelperEffects() {
  helpers.forEach(h => {
    if (!h.unlocked) return;

    if (h.id === 'lottie') {
      document.getElementById('lottie-glow-overlay').style.display = 'block';
    }

    if (h.id === 'baby') {
      const bubbleOverlay = document.getElementById('baby-bubble-overlay');
      bubbleOverlay.style.display = 'block';

      // Add 10 floating bubbles
      for (let i = 0; i < 10; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'baby-bubble';
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 3}s`;
        bubbleOverlay.appendChild(bubble);
      }
    }

    if (h.id === 'chef') {
      document.getElementById('chef-sparkle-overlay').style.display = 'block';
    }
  });
}

function spawnHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '💖';

  heart.style.position = 'absolute';
  heart.style.left = `${Math.floor(Math.random() * window.innerWidth)}px`;
  heart.style.top = `${Math.floor(Math.random() * window.innerHeight)}px`;
  heart.style.fontSize = '24px';
  heart.style.zIndex = '99999';

  const container = document.getElementById('heart-container');
  if (container) {
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
    console.log('💖 Heart spawned!');
  } else {
    console.warn("Heart container not found!");
  }
}

function showLottieMessage(msg) {
  const box = document.createElement('div');
  box.className = 'lottie-message';
  box.textContent = msg;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

if (lottie) {
  const count = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < count; i++) spawnHeart();
}

function saveHelpers() {
  localStorage.setItem('helpers', JSON.stringify(helpers));
}

// Buy helper
function buyHelper(helper) {
  if (sharkies >= helper.cost && !helper.unlocked) {
    sharkies -= helper.cost;
    helper.unlocked = true;
    saveHelpers();
    updateGame();
  }
}

// Display helpers
function displayHelpers() {
  const container = document.getElementById('helpers-container');
  container.innerHTML = '';

  helpers.forEach(helper => {
    const card = document.createElement('div');
    card.className = 'helper-card';

    if (helper.id === 'lottie') {
      card.classList.add('lottie-style');
    }

    const title = document.createElement('div');
    title.className = 'helper-title';
    title.textContent = helper.name;

    const desc = document.createElement('div');
    desc.className = 'helper-description';
    desc.textContent = helper.tooltip || helper.description;

    const cost = document.createElement('div');
    cost.className = 'helper-cost';
    cost.textContent = helper.unlocked ? '✅ Owned' : `💰 Cost: ${helper.cost.toLocaleString()}`;

    const button = document.createElement('button');
    button.textContent = helper.unlocked ? '✔️ Owned' : 'Buy';
    button.disabled = helper.unlocked || sharkies < helper.cost;
    button.onclick = () => buyHelper(helper);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(cost);
    card.appendChild(button);
    container.appendChild(card);
  });
}

const originalClickShark = clickShark;

clickShark = () => {
  const clickBonus = helpers
    .filter(h => h.unlocked && h.clickBoost)
    .reduce((sum, h) => sum + h.clickBoost, 0);

  sharkies += clickBonus;
  sharkiesByClick += clickBonus;

  originalClickShark();
  updateGame();
};

const originalBuyUpgrade = buyUpgrade;
buyUpgrade = (upgrade, event) => {
  const chef = helpers.find(h => h.id === 'chef' && h.unlocked);
  if (chef) upgrade.cost = Math.floor(upgrade.cost * (1 - chef.costReduction));
  originalBuyUpgrade(upgrade, event);
};

// Auto-save every 5 minutes (300000ms = 5 minutes)
setInterval(() => {
  updateStats();
  saveHelpers();
  localStorage.setItem('sharkiethemes', themes);
  localStorage.setItem('clickKey', clickKey);
  showSaveMessage();
}, 300000); // 5 minutes

function showSaveMessage() {
  const msg = document.createElement('div');
  msg.textContent = '💾 Game Saved!';
  msg.style.position = 'fixed';
  msg.style.bottom = '30px';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.background = '#0077cc';
  msg.style.color = 'white';
  msg.style.padding = '10px 20px';
  msg.style.borderRadius = '12px';
  msg.style.zIndex = '9999';
  msg.style.fontWeight = 'bold';
  msg.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000); // Show for 3 seconds
}



import quests from './quests.js';

function checkQuests(totalSharkies, clicks, helpers, fishCoins) {
  quests.forEach(quest => {
    if (!quest.completed && totalSharkies >= quest.unlockAt) {
      let progressMet = false;

      if (quest.type === "clicks" && clicks >= quest.goal) {
        progressMet = true;
      }

      if (quest.type === "helpers" && helpers >= quest.goal) {
        progressMet = true;
      }

      if (progressMet) {
        quest.completed = true;
        fishCoins += quest.reward;
      
        showNotification(`🎉 Quest Completed: ${quest.name}!\n+${quest.reward} Fish Coins`);
      }              
    }
  });

  return fishCoins;
}

function showNotification(message, duration = 3000) {
  const container = document.getElementById('notification-container');

  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = message;

  container.appendChild(notification);

  // Automatically remove the notification after the specified duration
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s forwards';
    notification.addEventListener('animationend', () => {
      notification.remove();
    });
  }, duration);
}


function displayQuests() {
  const container = document.getElementById('quests-container');
  container.innerHTML = '';

  quests.forEach((quest) => {
    const totalSharkies = sharkiesByClick + sharkiesByAuto;
    const totalHelpers = helpers.filter(h => h.unlocked).length;

    if (totalSharkies >= quest.unlockAt) {
      const card = document.createElement('div');
      card.className = 'quest-card';

      const name = document.createElement('h3');
      name.textContent = quest.name;

      const desc = document.createElement('p');
      desc.textContent = quest.description;

      const progress = document.createElement('p');
      let progressText = '';
      if (quest.type === 'clicks') {
        progressText = `Progress: ${sharkiesByClick}/${quest.goal}`;
      } else if (quest.type === 'helpers') {
        progressText = `Progress: ${totalHelpers}/${quest.goal}`;
      } else if (quest.type === 'lottie_hearts') {
        progressText = `Progress: ${quest.progress || 0}/${quest.goal}`;
      }
      progress.textContent = progressText;

      const reward = document.createElement('p');
      reward.textContent = `🎁 Reward: ${quest.reward} Fish Coins`;

      if (quest.completed) {
        card.classList.add('quest-completed');
        reward.textContent += ' ✅ Completed!';
      }

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(progress);
      card.appendChild(reward);
      container.appendChild(card);
    }
  });
}

// Setup auto-refresh only once
if (!window.questRefreshInterval) {
  window.questRefreshInterval = setInterval(displayQuests, 0);
}

function refreshQuests() {
  quests.forEach(quest => {
    quest.completed = false;
    quest.rewardClaimed = false;
  });

  displayQuests();
}

function incrementLottieHeartQuest() {
  quests.forEach(quest => {
    if (
      quest.type === "lottie_hearts" &&
      !quest.completed &&
      (quest.progress || 0) < quest.goal
    ) {
      quest.progress = (quest.progress || 0) + 1;

      if (quest.progress >= quest.goal) {
        quest.completed = true;
        fishCoins += quest.reward;
        showNotification(`💖 Quest Completed: ${quest.name}! +${quest.reward} Fish Coins`);
      }

      displayQuests();
    }
  });
}






















window.clickShark = clickShark;
window.toggleMenu = toggleMenu;
window.showTab = showTab;
window.refreshQuests = refreshQuests;
window.resetGame = resetGame;