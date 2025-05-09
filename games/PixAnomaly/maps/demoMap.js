function startLevel1(selectedSide) {
  const { tSpawns, ctSpawns } = generateLevel1Map();

  if (selectedSide === "CT") {
    spawnTeam(ctSpawns, "CT", 4, true); // Main player + 3 CT bots
    spawnTeam(tSpawns, "T", 4, false);  // 4 T bots
  } else if (selectedSide === "T") {
    spawnTeam(tSpawns, "T", 4, true);   // Main player + 3 T bots
    spawnTeam(ctSpawns, "CT", 4, false);// 4 CT bots
  } else {
    console.error("Error: Invalid side selected.");
    alert("Error: Invalid side selected.");
    return;
  }

  setTimeout(() => {
    isSpawnPhase = false;
    requestAnimationFrame(updatePlayerPosition);
  }, 5000);
}

// Generate level 1 map
function generateLevel1Map() {
  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = "";

  // Grid settings
  const cellSize = 100;
  let tSpawns = [];
  let ctSpawns = [];

  // CS-style map layout
  const mapLayout = [
    "wwwwwwwwwwww",
    "w....h....Tw",
    "w..~~~.....w",
    "w..~~~..p..w",
    "w....p.....w",
    "w....p.....w",
    "wC...h.....w",
    "wwwwwwwwwwww",
  ];

  // Generate map from layout
  for (let row = 0; row < mapLayout.length; row++) {
    for (let col = 0; col < mapLayout[row].length; col++) {
      const char = mapLayout[row][col];
      const x = col * cellSize;
      const y = (mapLayout.length - 1 - row) * cellSize;

      switch (char) {
        case "w":
          createObject("wall", x, y);
          break;
        case "h":
          createObject("house", x, y);
          break;
        case "~":
          createObject("water", x, y);
          break;
        case "p":
          createObject("path", x, y);
          break;
        case "T":
          tSpawns.push({ x, y });
          createSpawnMarker("T", x, y);
          break;
        case "C":
          ctSpawns.push({ x, y });
          createSpawnMarker("CT", x, y);
          break;
      }
    }
  }

  return { tSpawns, ctSpawns };
}

// Spawn a team at the given spawn points
function spawnTeam(spawnPoints, type, count, isPlayerTeam) {
  if (!spawnPoints || spawnPoints.length === 0) {
    console.error(`Error: No spawn points available for ${type}.`);
    return;
  }

  // Pick a random spawn zone for this team
  const spawnZone = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  const SPAWN_SIZE = 80; // Size of the square spawn area
  const positions = [];

  // Generate non-overlapping positions in the square
  for (let i = 0; i < count; i++) {
    let pos;
    let attempts = 0;
    do {
      const offsetX = Math.random() * (SPAWN_SIZE - 40);
      const offsetY = Math.random() * (SPAWN_SIZE - 40);
      pos = {
        x: spawnZone.x + offsetX,
        y: spawnZone.y + offsetY
      };
      attempts++;
    } while (
      positions.some(p => Math.abs(p.x - pos.x) < 40 && Math.abs(p.y - pos.y) < 40) &&
      attempts < 20
    );
    positions.push(pos);
  }

  for (let i = 0; i < count; i++) {
    const { x, y } = positions[i];
    if (isPlayerTeam && i === 0) {
      // Main player
      player.style.left = `${x}px`;
      player.style.bottom = `${y}px`;
      playerX = x;
      playerY = y;
    } else if (type === "CT") {
      // CT bot
      const ctBot = document.createElement("div");
      ctBot.className = "ctPlayer";
      ctBot.style.left = `${x}px`;
      ctBot.style.bottom = `${y}px`;
      ctBot.style.position = "absolute";
      ctBot.style.width = "40px";
      ctBot.style.height = "40px";
      ctBot.style.background = "blue";
      ctBot.style.border = "2px solid #000";
      ctBot.style.borderRadius = "4px";
      document.getElementById("game-area").appendChild(ctBot);
    } else if (type === "T") {
      // T bot
      const tBot = document.createElement("div");
      tBot.className = "tPlayer";
      tBot.style.left = `${x}px`;
      tBot.style.bottom = `${y}px`;
      tBot.style.position = "absolute";
      tBot.style.width = "40px";
      tBot.style.height = "40px";
      tBot.style.background = "red";
      tBot.style.border = "2px solid #000";
      tBot.style.borderRadius = "4px";
      document.getElementById("game-area").appendChild(tBot);
    }
  }
}

// Create objects in the world
function createObject(type, x, y) {
  const el = document.createElement("div");
  el.className = type;
  el.style.left = `${x}px`;
  el.style.bottom = `${y}px`;
  el.style.position = "absolute";
  el.style.width = "100px";
  el.style.height = "100px";
  document.getElementById("game-area").appendChild(el);
}

// Show spawn zone markers
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