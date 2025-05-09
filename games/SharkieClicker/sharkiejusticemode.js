(() => {
  // === CONFIG ===
  const AUTOCLICK_INTERVAL = 100;
  const MAX_FAST_STREAK = 3;
  const THROTTLE_DELAY = 500;
  const RESET_TIMEOUT = 2000;
  const GAME_OVER_TIMEOUT = 20000;

  // === STATE ===
  let lastClickTime = 0;
  let fastClickStreak = 0;
  let isCheater = false;
  let cheatCount = 0;
  let lastAcceptedCheatClick = 0;
  let resetTimeoutId = null;
  let gameOverTimeoutId = null;

  // In sharkieJusticeMode.js, define only the achievements relevant to this file
  const sharkieJusticeAchievements = [
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

  // === CLICK HANDLER ===
  document.addEventListener('click', (event) => {
    const now = performance.now();

    startResetCooldown();

    if (!event.isTrusted) {
      flagCheater(event, 'Untrusted click');
      return;
    }

    if (lastClickTime && now - lastClickTime < AUTOCLICK_INTERVAL) {
      fastClickStreak++;
      if (fastClickStreak >= MAX_FAST_STREAK) {
        flagCheater(event, 'Rapid clicking');
        return;
      }
    } else {
      fastClickStreak = 0;
    }

    lastClickTime = now;

    if (isCheater && now - lastAcceptedCheatClick < THROTTLE_DELAY) {
      console.warn('⛔ Cheater: throttled click ignored');
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    lastAcceptedCheatClick = now;
    clickShark(); // <-- your normal game function
  }, true);

  // === FLAG CHEATER ===
  function flagCheater(event, reason) {
    // Check if cheater achievements are not already unlocked
    if (!isCheater) {
      const busted = sharkieJusticeAchievements.find(a => a.name.includes("Busted"));
      if (busted && !achieved.includes(busted.name)) {
        unlockAchievement(busted);
        showCheaterAchievement();
      }
  
      isCheater = true;
      cheatCount++;
  
      document.body.classList.add('cheater-mode');
      showOverlay(`🚨 Cheating Detected! Offense #${cheatCount}`);
      applyVisualPunishment();
  
      if (cheatCount === 3) showCinematicLockdown();
      if (cheatCount % 2 === 0) document.body.classList.toggle('cheater-flip');
  
      startGameOverTimer();
    }
  
    event.preventDefault();
    event.stopImmediatePropagation();
  }  

  function applyVisualPunishment() {
    document.body.classList.add('cheater-glitch');
    setTimeout(() => {
      document.body.classList.remove('cheater-glitch');
    }, 500);
  }
  // === RESET SYSTEM AFTER COOLDOWN ===
  function startResetCooldown() {
    if (resetTimeoutId) clearTimeout(resetTimeoutId);

    resetTimeoutId = setTimeout(() => {
      if (isCheater) {
        isCheater = false;
        fastClickStreak = 0;
        lastAcceptedCheatClick = 0;
        document.body.classList.remove('cheater-mode', 'cheater-flip');
        showOverlay('✅ You’ve cooled off. Welcome back.');
        cancelGameOverTimer();
      }
    }, RESET_TIMEOUT);
  }

  // === 1-MINUTE GAME OVER TIMER ===
  function startGameOverTimer() {
    if (gameOverTimeoutId) return;

    gameOverTimeoutId = setTimeout(() => {
      console.warn("💣 cheat timer expired. Game Over.");
      showGameOver();
    }, GAME_OVER_TIMEOUT);
  }

  function cancelGameOverTimer() {
    if (gameOverTimeoutId) {
      clearTimeout(gameOverTimeoutId);
      gameOverTimeoutId = null;
      console.log("🧯 Game Over timer cancelled. You behaved.");
    }
  }

  // === VISUAL OVERLAY ===
  function showOverlay(message) {
    const existing = document.getElementById('cheatOverlay');
    if (existing) existing.remove();

    const warn = document.createElement('div');
    warn.id = 'cheatOverlay';
    warn.textContent = message;
    Object.assign(warn.style, {
      position: 'fixed',
      top: '10%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#ff0033',
      color: '#fff',
      padding: '14px 30px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '1.2em',
      zIndex: '10000',
      boxShadow: '0 0 12px rgba(0,0,0,0.4)',
    });

    document.body.appendChild(warn);
    setTimeout(() => {
      warn.style.transition = 'opacity 0.5s';
      warn.style.opacity = '0';
      setTimeout(() => warn.remove(), 500);
    }, 4000);
  }

  // === CHEATER MODE LOCKOUT ===
  function showGameOver() {
    const gameOver = document.createElement('div');
    gameOver.id = 'cheatGameOver';
    gameOver.innerHTML = `
        <h1 style="color:#fff; font-size:3em; margin:0;">💀 Cheater Mode Activated 💀</h1>
        <p style="color:#eee; font-size:1.5em;">Game has been locked for suspicious activity.</p>
      `;
    Object.assign(gameOver.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '99999',
      fontFamily: 'monospace',
    });
    document.body.appendChild(gameOver);

    const lockout = achievements.find(a => a.name.includes("Perma-Banned"));
    if (lockout && !achieved.includes(lockout.name)) {
      unlockAchievement(lockout);
    }
  }

  // === GLITCH MESSAGE + EFFECT ===
  const glitchMessages = [
    "Shark.exe failed",
    "404 Sharkies not found",
    "Why are you clicking?",
    "This isn't how you play...",
    "Auto-clicker engaged",
    "Cheater detected",
    "STOP 😭",
    "Sharkie Justice Mode!!!",
  ];

  function spawnFloatingGlitch() {
    if (!isCheater) return;

    const msg = document.createElement('div');
    msg.textContent = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
    Object.assign(msg.style, {
      position: 'fixed',
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 70 + 10}%`,
      fontSize: '1em',
      fontFamily: 'monospace',
      color: 'white',
      background: 'black',
      padding: '6px 12px',
      borderRadius: '8px',
      zIndex: 9999,
      transform: `rotate(${Math.random() * 20 - 10}deg)`,
      opacity: '1',
      pointerEvents: 'none',
      transition: 'opacity 2s ease-out',
    });

    document.body.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 2000);
    }, 1000);
  }

  // === VISUAL GLITCH LOOP ===
  setInterval(() => {
    if (isCheater) {
      spawnFloatingGlitch();
      document.body.style.transform = `rotate(${Math.random() * 2 - 1}deg)`;
    } else {
      document.body.style.transform = '';
    }
  }, 1500);

  // === FAKE SHARKIES MODE ===
  setInterval(() => {
    if (isCheater && document.getElementById('sharkiesCount')) {
      const fakeSharkies = Math.floor(Math.random() * -9999);
      document.getElementById('sharkiesCount').textContent = `Sharkies: ${fakeSharkies}`;
    }
  }, 1000);

  // === STYLE INJECTION ===
  const style = document.createElement('style');
  style.textContent = `
      body.cheater-mode {
        filter: grayscale(1) contrast(0.4) brightness(0.7);
      }
      body.cheater-flip {
        transform: rotateY(180deg);
      }
      body.cheater-glitch {
        animation: glitchShake 0.3s ease;
      }
      @keyframes glitchShake {
        0% { transform: translate(0, 0); }
        20% { transform: translate(-3px, 2px); }
        40% { transform: translate(4px, -3px); }
        60% { transform: translate(-2px, 4px); }
        80% { transform: translate(3px, -2px); }
        100% { transform: translate(0, 0); }
      }
    `;
  document.head.appendChild(style);

  // === CINEMATIC LOCKDOWN SEQUENCE ===
  window.showCinematicLockdown = function () {
    if (document.getElementById('cinematicLock')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cinematicLock';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'black',
      color: 'lime',
      fontFamily: 'monospace',
      fontSize: '1.2em',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '999999',
      overflow: 'hidden',
      padding: '2em',
    });

    const log = document.createElement('div');
    overlay.appendChild(log);
    document.body.appendChild(overlay);

    const lines = [
      "🦈 Initializing Sharkie Justice Protocol...",
      "🔍 Scanning click integrity...",
      "❌ Auto-click pattern detected.",
      "💣 Deploying punishment sequence...",
      "👁 Monitoring player input...",
      "💀 You have been flagged.",
      "🧼 Cleaning up unauthorized interactions...",
      "✅ System restored. Don’t do it again."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= lines.length) {
        clearInterval(interval);
        setTimeout(() => overlay.remove(), 2000);
        return;
      }
      const line = document.createElement('div');
      line.textContent = lines[i];
      log.appendChild(line);
      i++;
    }, 700);
  };
})(); 