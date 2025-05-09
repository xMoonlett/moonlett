// --- Game State ---
let fishCoins = parseInt(localStorage.getItem('fishCoins')) || 0;
let purchasedItems = JSON.parse(localStorage.getItem('purchasedItems')) || [];
let sharkiesPerSecond = parseInt(localStorage.getItem('sharkiesPerSecond')) || 0;

// Store items with effects (such as increasing sharkies per second)
let storeItems = [
  {
    id: 'item1',
    name: 'Sharkie Boost - +1000 Sharkies/sec',
    cost: 50, // Cost in Fish Coins
    description: 'Increase your Sharkies per second by 1k.',
    effect: () => {
      sharkiesPerSecond += 10;
      localStorage.setItem('sharkiesPerSecond', sharkiesPerSecond);
    }
  },
  {
    id: 'item2',
    name: 'Mega Sharkie Boost - +10000 Sharkies/sec',
    cost: 150,
    description: 'Increase your Sharkies per second by 10k.',
    effect: () => {
      sharkiesPerSecond += 100;
      localStorage.setItem('sharkiesPerSecond', sharkiesPerSecond);
    }
  },
  {
    id: 'item3',
    name: 'Super Sharkie Boost - +100000 Sharkies/sec',
    cost: 1000,
    description: 'Increase your Sharkies per second by 100k.',
    effect: () => {
      sharkiesPerSecond += 1000;
      localStorage.setItem('sharkiesPerSecond', sharkiesPerSecond);
    }
  },
];

// Format the cost as needed (e.g., 1K, 1M, etc.)
function formatNumber(num) {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(1) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
}

// --- Display Store ---
function displayStore() {
  const container = document.getElementById('store-container');
  container.innerHTML = ''; // Clear previous store items

  storeItems.forEach(item => {
    const itemCostFormatted = formatNumber(item.cost);

    // Create the item container
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('store-item');

    // Create the description text
    const description = document.createElement('p');
    description.textContent = item.description;

    // Create the Buy button
    const btn = document.createElement('button');
    btn.textContent = `Cost: ${itemCostFormatted} Fish Coins`;
    btn.disabled = fishCoins < item.cost;

    // Handle item purchase
    btn.onclick = () => {
      if (fishCoins >= item.cost) {
        fishCoins -= item.cost;
        purchasedItems.push(item.id); // Store the purchased item
        item.effect(); // Apply the effect (e.g., increase Sharkies per second)
        localStorage.setItem('fishCoins', fishCoins); // Save updated Fish Coins
        localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems)); // Store purchased items
        updateGame(); // Update game display
        displayStore(); // Refresh store display
      }
    };

    // Append elements for description and purchase
    itemDiv.appendChild(description);
    itemDiv.appendChild(btn);
    container.appendChild(itemDiv);
  });
}

// --- Update Game UI ---
function updateGame() {
  const fishDisplay = document.getElementById('fish-coin-count');
  if (fishDisplay) {
    fishDisplay.innerText = `Fish Coins: ${formatNumber(fishCoins)}`;
  }

  const sharkiesDisplay = document.getElementById("shark-per-second");
  if (sharkiesDisplay) {
    sharkiesDisplay.innerText = `Sharkies per second: ${sharkiesPerSecond.toLocaleString()}`;
  }
}

// --- Call the store display on page load ---
window.onload = () => {
  displayStore();
  updateGame();
};
