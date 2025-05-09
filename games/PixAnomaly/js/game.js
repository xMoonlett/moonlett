// Player variables
let lastMouseX = 0;
let lastMouseY = 0;
let playerHealth = 100;
let score = 0;
const PLAYER_SIZE = 40;
const player = document.getElementById("player");
let playerX = 100;
let playerY = 100;
let playerBullets = 30; // Bullets in the current magazine
let playerMags = 3; // Total magazines

let playerRoundsWon = 0;
let enemyRoundsWon = 0;
let playerKills = 0;
let playerDeaths = 0;
let isSpawnPhase = true; // Prevent movement during spawn phase

let round = 1;
let maxRounds = 10;
let ctPlayers = [];
let tPlayers = [];
let isRoundActive = false;

// Initialize player position
player.style.left = `${playerX}px`;
player.style.bottom = `${playerY}px`;

// Player movement
const keys = { a: false, d: false, w: false, s: false };

document.addEventListener("keydown", (e) => {
  const gameArea = document.getElementById("game-area");
  const gameAreaRect = gameArea.getBoundingClientRect();

  // Enable movement only if the cursor is inside the game area
  if (
    lastMouseX >= gameAreaRect.left &&
    lastMouseX <= gameAreaRect.right &&
    lastMouseY >= gameAreaRect.top &&
    lastMouseY <= gameAreaRect.bottom
  ) {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  }

  // Show leaderboard when holding TAB
  if (e.key === "Tab") {
    document.getElementById("leaderboard").classList.remove("hidden");
  }
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;

  // Hide leaderboard when releasing TAB
  if (e.key === "Tab") {
    document.getElementById("leaderboard").classList.add("hidden");
  }
});

function updatePlayerPosition() {
  if (isSpawnPhase) return;

  requestAnimationFrame(updatePlayerPosition);

  const gameArea = document.getElementById("game-area");
  const gameAreaRect = gameArea.getBoundingClientRect();

  // Allow movement only if the cursor is inside the game area
  if (
    lastMouseX >= gameAreaRect.left &&
    lastMouseX <= gameAreaRect.right &&
    lastMouseY >= gameAreaRect.top &&
    lastMouseY <= gameAreaRect.bottom
  ) {
    let dx = 0;
    let dy = 0;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    if (keys.w) dy += 1;
    if (keys.s) dy -= 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      let moveX = (dx / length) * 2;
      let moveY = (dy / length) * 2;

      // Slow down in water
      if (isInWater(playerX + moveX, playerY + moveY)) {
        moveX *= 0.5; // Reduce speed by 50%
        moveY *= 0.5;
      }

      let nextX = playerX + moveX;
      let nextY = playerY + moveY;

      // Check horizontal collision with walls and enemies
      if (
        !isCollidingWithWall(nextX, playerY) &&
        !isCollidingWithEnemy(nextX, playerY) &&
        nextX >= 0 &&
        nextX <= 1200 - PLAYER_SIZE
      ) {
        playerX = nextX;
      }

      // Check vertical collision with walls and enemies
      if (
        !isCollidingWithWall(playerX, nextY) &&
        !isCollidingWithEnemy(playerX, nextY) &&
        nextY >= 0 &&
        nextY <= 800 - PLAYER_SIZE
      ) {
        playerY = nextY;
      }

      // Update player position
      player.style.left = `${playerX}px`;
      player.style.bottom = `${playerY}px`;
    }
  }
}

// Check if player is colliding with an enemy
function isCollidingWithEnemy(nextX, nextY) {
  const playerRect = {
    left: nextX,
    right: nextX + PLAYER_SIZE,
    top: nextY + PLAYER_SIZE,
    bottom: nextY,
  };

  const enemies = document.querySelectorAll(".enemy");
  for (const enemy of enemies) {
    const enemyRect = enemy.getBoundingClientRect();
    const gameAreaRect = document.getElementById("game-area").getBoundingClientRect();
    const adjustedEnemyRect = {
      left: enemyRect.left - gameAreaRect.left,
      right: enemyRect.right - gameAreaRect.left,
      top: gameAreaRect.bottom - enemyRect.top,
      bottom: gameAreaRect.bottom - enemyRect.bottom,
    };

    if (
      playerRect.right > adjustedEnemyRect.left &&
      playerRect.left < adjustedEnemyRect.right &&
      playerRect.top > adjustedEnemyRect.bottom &&
      playerRect.bottom < adjustedEnemyRect.top
    ) {
      return true; // Collision detected
    }
  }

  return false; // No collision
}

updatePlayerPosition();

// Player rotation
document.addEventListener("mousemove", (e) => {
  const gameArea = document.getElementById("game-area");
  const gameAreaRect = gameArea.getBoundingClientRect();

  // Check if the cursor is inside the game area
  if (
    e.clientX >= gameAreaRect.left &&
    e.clientX <= gameAreaRect.right &&
    e.clientY >= gameAreaRect.top &&
    e.clientY <= gameAreaRect.bottom
  ) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    const playerRect = player.getBoundingClientRect();
    const centerX = playerRect.left + playerRect.width / 2;
    const centerY = playerRect.top + playerRect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    player.style.transform = `rotate(${angle}rad)`;
  }
});

// Player shooting logic
document.addEventListener("click", (e) => {
  const gameArea = document.getElementById("game-area");
  const gameAreaRect = gameArea.getBoundingClientRect();

  if (
    e.clientX >= gameAreaRect.left &&
    e.clientX <= gameAreaRect.right &&
    e.clientY >= gameAreaRect.top &&
    e.clientY <= gameAreaRect.bottom
  ) {
    if (playerBullets > 0) {
      // Shoot a bullet
      playerBullets--;
      updateBulletCount();

      const bullet = document.createElement("div");
      bullet.className = "bullet";

      const centerX = playerX + PLAYER_SIZE / 2;
      const centerY = playerY + PLAYER_SIZE / 2;

      const playerRotation = parseFloat(player.style.transform.replace("rotate(", "").replace("rad)", ""));
      const gunLength = 20;
      const startX = centerX + Math.cos(playerRotation) * gunLength;
      const startY = centerY - Math.sin(playerRotation) * gunLength;

      bullet.style.left = `${startX}px`;
      bullet.style.bottom = `${startY}px`;
      gameArea.appendChild(bullet);

      const speed = 5;
      const velocityX = Math.cos(playerRotation) * speed;
      const velocityY = -Math.sin(playerRotation) * speed;

      const bulletInterval = setInterval(() => {
        let x = parseFloat(bullet.style.left);
        let y = parseFloat(bullet.style.bottom);

        const nextX = x + velocityX;
        const nextY = y + velocityY;

        bullet.style.left = `${nextX}px`;
        bullet.style.bottom = `${nextY}px`;

        // Check for collision with walls
        const walls = document.querySelectorAll(".wall");
        for (const wall of walls) {
          const wallRect = wall.getBoundingClientRect();
          const bulletRect = bullet.getBoundingClientRect();

          if (
            bulletRect.left < wallRect.right &&
            bulletRect.right > wallRect.left &&
            bulletRect.top < wallRect.bottom &&
            bulletRect.bottom > wallRect.top
          ) {
            bullet.remove();
            clearInterval(bulletInterval);
            return;
          }
        }

        // Check for collision with enemies
        const enemies = document.querySelectorAll(".enemy");
        for (const enemy of enemies) {
          const enemyRect = enemy.getBoundingClientRect();
          const bulletRect = bullet.getBoundingClientRect();

          if (
            bulletRect.left < enemyRect.right &&
            bulletRect.right > enemyRect.left &&
            bulletRect.top < enemyRect.bottom &&
            bulletRect.bottom > enemyRect.top
          ) {
            bullet.remove();
            enemy.remove(); // Remove enemy
            updateScore(10); // Increase score
            clearInterval(bulletInterval);
            return;
          }
        }

        // Remove bullet if it goes out of bounds
        if (nextX < 0 || nextX > 1200 || nextY < 0 || nextY > 800) {
          bullet.remove();
          clearInterval(bulletInterval);
        }
      }, 16);
    } else if (playerMags > 0) {
      // Reload if out of bullets
      reloadPlayer();
    }
  }
});

// Reload logic for the player
function reloadPlayer() {
  if (playerMags > 0) {
    playerMags--;
    playerBullets = 30; // Refill the magazine
    updateBulletCount();
    const bulletCountElement = document.getElementById("bullet-count");
    bulletCountElement.textContent = "Reloading...";
    setTimeout(() => {
      updateBulletCount();
    }, 1000); // Simulate reload time
  } else {
    const bulletCountElement = document.getElementById("bullet-count");
    bulletCountElement.textContent = "Out of ammo!";
    setTimeout(() => {
      updateBulletCount();
    }, 2000); // Reset text after 2 seconds
  }
}

// Update bullet count display
function updateBulletCount() {
  document.getElementById("bullet-count").textContent = `Bullets: ${playerBullets} | Mags: ${playerMags}`;
}

function startRound() {
  if (round > maxRounds) {
    alert("Game Over!");
    return;
  }

  isRoundActive = true;
  clearAllPlayers();
  spawnTeams();
}

function spawnTeams() {
  // Spawn CTs
  ctSpawns.forEach((spawn, i) => {
    const ct = spawnPlayer(spawn.x, spawn.y, "CT", i);
    ctPlayers.push(ct);
  });

  // Spawn Ts
  tSpawns.forEach((spawn, i) => {
    const t = spawnPlayer(spawn.x, spawn.y, "T", i);
    tPlayers.push(t);
  });
}

function spawnPlayer(x, y) {
  player.style.left = `${x}px`;
  player.style.bottom = `${y}px`;
  playerX = x;
  playerY = y;
}

function clearAllPlayers() {
  document.querySelectorAll(".player, .enemy").forEach(p => p.remove());
  ctPlayers = [];
  tPlayers = [];
}

function checkWinCondition() {
  if (tPlayers.every(p => !document.body.contains(p))) {
    score.CT++;
    endRound("CT");
  } else if (ctPlayers.every(p => !document.body.contains(p))) {
    score.T++;
    endRound("T");
  }
}

function endRound(winner) {
  isRoundActive = false;
  round++;
  alert(`${winner} wins the round!`);
  setTimeout(startRound, 2000);
}

// Enemy logic
function spawnEnemy(x, y) {
  const enemy = document.createElement("div");
  enemy.className = "enemy";
  enemy.style.left = `${x}px`;
  enemy.style.bottom = `${y}px`;
  enemy.style.position = "absolute";
  enemy.style.width = "40px";
  enemy.style.height = "40px";
  enemy.style.background = "red";
  document.getElementById("game-area").appendChild(enemy);
}

function spawnEnemyLogic(enemy, enemyHealth) {
  const gameArea = document.getElementById("game-area");
  let enemyHealthPoints = 100;

  // Random movement direction
  let randomDirection = Math.random() * 2 * Math.PI;

  const interval = setInterval(() => {
    const enemyRect = enemy.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    const dx = playerRect.left - enemyRect.left;
    const dy = playerRect.top - enemyRect.top;
    const distance = Math.hypot(dx, dy);

    // Check if the player is visible
    const isPlayerVisible = distance < 300; // Adjust visibility range as needed

    if (isPlayerVisible) {
      // Move toward the player but stop at a certain distance
      if (distance > 50) { // Stop moving when within 50px of the player
        const moveX = (dx / distance) * 1.5; // Enemy movement speed
        const moveY = (dy / distance) * 1.5;

        const nextX = parseFloat(enemy.style.left) + moveX;
        const nextY = parseFloat(enemy.style.bottom) + moveY;

        // Prevent enemies from leaving the map or colliding with walls
        if (!isCollidingWithWall(nextX, nextY) && isWithinMapBounds(nextX, nextY)) {
          enemy.style.left = `${nextX}px`;
          enemy.style.bottom = `${nextY}px`;
        }
      }

      // Shoot at the player
      if (distance < 200) {
        shootAtPlayer(enemy);
      }
    } else {
      // Random movement when not engaging the player
      const moveX = Math.cos(randomDirection) * 1; // Random movement speed
      const moveY = Math.sin(randomDirection) * 1;

      const nextX = parseFloat(enemy.style.left) + moveX;
      const nextY = parseFloat(enemy.style.bottom) + moveY;

      // Prevent enemies from leaving the map or colliding with walls
      if (!isCollidingWithWall(nextX, nextY) && isWithinMapBounds(nextX, nextY)) {
        enemy.style.left = `${nextX}px`;
        enemy.style.bottom = `${nextY}px`;
      } else {
        // Change direction if collision occurs
        randomDirection = Math.random() * 2 * Math.PI;
      }
    }
  }, 16);
}

// Enemy shooting logic
function shootAtPlayer(enemy) {
  const gameArea = document.getElementById("game-area");

  // Initialize enemy ammo if not already set
  if (!enemy.dataset.bullets) enemy.dataset.bullets = 30; // Bullets in the current magazine
  if (!enemy.dataset.mags) enemy.dataset.mags = 3; // Total magazines

  const bullets = parseInt(enemy.dataset.bullets, 10);
  const mags = parseInt(enemy.dataset.mags, 10);

  // Check if the enemy already has a cooldown
  if (enemy.dataset.shootingCooldown === "true") return;

  if (bullets > 0) {
    // Shoot a bullet
    enemy.dataset.bullets = bullets - 1;

    enemy.dataset.shootingCooldown = "true";
    setTimeout(() => {
      enemy.dataset.shootingCooldown = "false";
    }, 1000); // Cooldown duration in milliseconds (1 second)

    const bullet = document.createElement("div");
    bullet.className = "enemy-bullet";

    const enemyX = parseFloat(enemy.style.left) + 20;
    const enemyY = parseFloat(enemy.style.bottom) + 20;

    const angle = Math.atan2(playerY - enemyY, playerX - enemyX);

    bullet.style.left = `${enemyX}px`;
    bullet.style.bottom = `${enemyY}px`;
    gameArea.appendChild(bullet);

    const speed = 3; // Bullet speed
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    const bulletInterval = setInterval(() => {
      let x = parseFloat(bullet.style.left);
      let y = parseFloat(bullet.style.bottom);

      const nextX = x + velocityX;
      const nextY = y + velocityY;

      bullet.style.left = `${nextX}px`;
      bullet.style.bottom = `${nextY}px`;

      // Check for collision with walls
      const walls = document.querySelectorAll(".wall");
      for (const wall of walls) {
        const wallRect = wall.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();

        if (
          bulletRect.left < wallRect.right &&
          bulletRect.right > wallRect.left &&
          bulletRect.top < wallRect.bottom &&
          bulletRect.bottom > wallRect.top
        ) {
          bullet.remove();
          clearInterval(bulletInterval);
          return;
        }
      }

      // Check for collision with the player
      const playerRect = player.getBoundingClientRect();
      const bulletRect = bullet.getBoundingClientRect();

      if (
        bulletRect.left < playerRect.right &&
        bulletRect.right > playerRect.left &&
        bulletRect.top < playerRect.bottom &&
        bulletRect.bottom > playerRect.top
      ) {
        updateHealth(-10); // Damage player
        bullet.remove();
        clearInterval(bulletInterval);
        return;
      }

      // Remove bullet if it goes out of bounds
      if (nextX < 0 || nextX > 1200 || nextY < 0 || nextY > 800) {
        bullet.remove();
        clearInterval(bulletInterval);
      }
    }, 16);
  } else if (mags > 0) {
    // Reload if out of bullets
    enemy.dataset.mags = mags - 1;
    enemy.dataset.bullets = 30; // Refill the magazine
  }
}

// Collision detection with walls
function isCollidingWithWall(nextX, nextY) {
  const rect = {
    left: nextX,
    right: nextX + 40, // Enemy size
    top: nextY + 40,
    bottom: nextY,
  };

  const obstacles = document.querySelectorAll(".wall, .rock");
  for (const obstacle of obstacles) {
    const obstacleRect = obstacle.getBoundingClientRect();

    // Adjust obstacleRect to match the coordinate system of the game area
    const gameAreaRect = document.getElementById("game-area").getBoundingClientRect();
    const adjustedObstacleRect = {
      left: obstacleRect.left - gameAreaRect.left,
      right: obstacleRect.right - gameAreaRect.left,
      top: gameAreaRect.bottom - obstacleRect.top,
      bottom: gameAreaRect.bottom - obstacleRect.bottom,
    };

    if (
      rect.right > adjustedObstacleRect.left &&
      rect.left < adjustedObstacleRect.right &&
      rect.top > adjustedObstacleRect.bottom &&
      rect.bottom < adjustedObstacleRect.top
    ) {
      return true; // Collision detected
    }
  }

  return false; // No collision
}

// Check if player is in water
function isInWater(nextX, nextY) {
  const playerRect = {
    left: nextX,
    right: nextX + PLAYER_SIZE,
    top: nextY + PLAYER_SIZE,
    bottom: nextY,
  };

  const waterAreas = document.querySelectorAll(".water");
  for (const water of waterAreas) {
    const waterRect = water.getBoundingClientRect();

    // Adjust waterRect to match the coordinate system of the game area
    const gameAreaRect = document.getElementById("game-area").getBoundingClientRect();
    const adjustedWaterRect = {
      left: waterRect.left - gameAreaRect.left,
      right: waterRect.right - gameAreaRect.left,
      top: gameAreaRect.bottom - waterRect.top,
      bottom: gameAreaRect.bottom - waterRect.bottom,
    };

    if (
      playerRect.right > adjustedWaterRect.left &&
      playerRect.left < adjustedWaterRect.right &&
      playerRect.top > adjustedWaterRect.bottom &&
      playerRect.bottom < adjustedWaterRect.top
    ) {
      return true; // Player is in water
    }
  }

  return false; // Player is not in water
}

// Check if position is within map bounds
function isWithinMapBounds(nextX, nextY) {
  const mapWidth = 1200; // Map width
  const mapHeight = 800; // Map height
  const enemySize = 40; // Enemy size

  return (
    nextX >= 0 &&
    nextX + enemySize <= mapWidth &&
    nextY >= 0 &&
    nextY + enemySize <= mapHeight
  );
}

// Update score
function updateScore(points) {
  score += points;
  document.getElementById("score").textContent = `Score: ${score}`;
}

// Update health
function updateHealth(amount) {
  console.log("Updating health by:", amount); // Debugging
  playerHealth += amount;
  playerHealth = Math.max(0, Math.min(playerHealth, 100)); // Clamp health between 0 and 100
  console.log("New health:", playerHealth); // Debugging
  document.getElementById("health-percentage").textContent = `${playerHealth}%`;

  if (playerHealth <= 0) {
    console.log("Player health reached 0. Game Over!");
    alert("Game Over!");
    location.reload();
  }
}

function startNewRound() {
  // Reset player and enemy positions
  playerX = 100;
  playerY = 100;
  player.style.left = `${playerX}px`;
  player.style.bottom = `${playerY}px`;

  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = ""; // Clear the game area
  gameArea.appendChild(player);

  // Spawn enemies
  for (let i = 0; i < 4; i++) {
    const enemyX = Math.random() * 1000 + 100;
    const enemyY = Math.random() * 600 + 100;
    spawnEnemy(enemyX, enemyY);
  }

  updateScoreboard();
}

function endRound(winner) {
  if (winner === "player") {
    playerRoundsWon++;
  } else if (winner === "enemy") {
    enemyRoundsWon++;
  }

  if (playerRoundsWon === 13 || enemyRoundsWon === 13) {
    showWinLoseScreen();
  } else {
    startNewRound();
  }
}

function showWinLoseScreen() {
  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = ""; // Clear the game area

  const winLoseScreen = document.createElement("div");
  winLoseScreen.className = "win-lose-screen";

  if (playerRoundsWon === 13) {
    winLoseScreen.innerHTML = `<h1>You Win!</h1><p>Final Score: ${playerRoundsWon} - ${enemyRoundsWon}</p>`;
  } else {
    winLoseScreen.innerHTML = `<h1>You Lose!</h1><p>Final Score: ${playerRoundsWon} - ${enemyRoundsWon}</p>`;
  }

  const restartButton = document.createElement("button");
  restartButton.textContent = "Restart Game";
  restartButton.onclick = () => location.reload();
  winLoseScreen.appendChild(restartButton);

  gameArea.appendChild(winLoseScreen);
}

function updateScoreboard() {
  document.getElementById("scoreboard").innerHTML = `Kills: ${playerKills} | Deaths: ${playerDeaths}`;
  document.getElementById("rounds").innerHTML = `Rounds Won: ${playerRoundsWon} | Rounds Lost: ${enemyRoundsWon}`;
}

// Side selection logic
function selectSide() {
  const sideSelectionScreen = document.createElement("div");
  sideSelectionScreen.className = "side-selection";
  sideSelectionScreen.style.position = "absolute";
  sideSelectionScreen.style.top = "50%";
  sideSelectionScreen.style.left = "50%";
  sideSelectionScreen.style.transform = "translate(-50%, -50%)";
  sideSelectionScreen.style.background = "rgba(0, 0, 0, 0.8)";
  sideSelectionScreen.style.padding = "20px";
  sideSelectionScreen.style.borderRadius = "10px";
  sideSelectionScreen.style.textAlign = "center";
  sideSelectionScreen.style.color = "white";
  sideSelectionScreen.innerHTML = `
    <h1>Select Your Side</h1>
    <button id="ct-side" style="margin: 10px; padding: 10px;">CT-Side</button>
    <button id="t-side" style="margin: 10px; padding: 10px;">T-Side</button>
  `;
  document.body.appendChild(sideSelectionScreen);

  document.getElementById("ct-side").addEventListener("click", () => {
    document.body.removeChild(sideSelectionScreen);
    startLevel1("CT");
  });

  document.getElementById("t-side").addEventListener("click", () => {
    document.body.removeChild(sideSelectionScreen);
    startLevel1("T");
  });
  selectSide();
}

// Spawn a player
function spawnPlayer(x, y) {
  player.style.left = `${x}px`;
  player.style.bottom = `${y}px`;
  playerX = x;
  playerY = y;
}

// Create spawn marker
function createSpawnMarker(type, x, y) {
  const el = document.createElement("div");
  el.className = type === "CT" ? "ct-spawn" : "t-spawn";
  el.style.left = `${x}px`;
  el.style.bottom = `${y}px`;
  el.style.position = "absolute";
  el.style.width = "40px";
  el.style.height = "40px";
  el.style.borderRadius = "50%";
  el.style.background = type === "CT" ? "cyan" : "orange";
  el.style.opacity = "0.7";
  el.style.boxShadow = `0 0 5px ${el.style.background}`;
  document.getElementById("game-area").appendChild(el);
}

// Side selection logic
function selectSide() {
  const sideSelectionScreen = document.createElement("div");
  sideSelectionScreen.className = "side-selection";
  sideSelectionScreen.style.position = "absolute";
  sideSelectionScreen.style.top = "50%";
  sideSelectionScreen.style.left = "50%";
  sideSelectionScreen.style.transform = "translate(-50%, -50%)";
  sideSelectionScreen.style.background = "rgba(0, 0, 0, 0.9)";
  sideSelectionScreen.style.padding = "30px";
  sideSelectionScreen.style.borderRadius = "10px";
  sideSelectionScreen.style.textAlign = "center";
  sideSelectionScreen.style.color = "white";
  sideSelectionScreen.style.width = "400px";
  sideSelectionScreen.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.2)";
  sideSelectionScreen.innerHTML = `
    <h1 style="margin-bottom: 20px;">Select Your Side</h1>
    <div style="display: flex; justify-content: space-between; gap: 20px;">
      <div id="ct-side" class="team-option" style="flex: 1; padding: 20px; background: rgba(0, 0, 0, 0.8); border: 2px solid cyan; border-radius: 10px; cursor: pointer; transition: transform 0.2s;">
        <img src="/images/ct-logo.png" alt="CT Logo" style="width: 100%; max-width: 100px; margin-bottom: 10px;">
        <h2 style="margin: 0; color: cyan;">CT-Side</h2>
        <p style="font-size: 12px; color: #aaa;">Defend the objective and eliminate threats.</p>
      </div>
      <div id="t-side" class="team-option" style="flex: 1; padding: 20px; background: rgba(0, 0, 0, 0.8); border: 2px solid orange; border-radius: 10px; cursor: pointer; transition: transform 0.2s;">
        <img src="/images/t-logo.png" alt="T Logo" style="width: 100%; max-width: 100px; margin-bottom: 10px;">
        <h2 style="margin: 0; color: orange;">T-Side</h2>
        <p style="font-size: 12px; color: #aaa;">Attack the objective and eliminate defenders.</p>
      </div>
    </div>
  `;
  document.body.appendChild(sideSelectionScreen);
  
  // Add hover effects
  const teamOptions = sideSelectionScreen.querySelectorAll(".team-option");
  teamOptions.forEach((option) => {
    option.addEventListener("mouseenter", () => {
      option.style.transform = "scale(1.05)";
      option.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
    });
    option.addEventListener("mouseleave", () => {
      option.style.transform = "scale(1)";
      option.style.boxShadow = "none";
    });
  });

  // Add click events
  document.getElementById("ct-side").addEventListener("click", () => {
    document.body.removeChild(sideSelectionScreen);
    startLevel1("CT");
  });

  document.getElementById("t-side").addEventListener("click", () => {
    document.body.removeChild(sideSelectionScreen);
    startLevel1("T");
  });
}

selectSide();