// Kids Math Game - Full Interactive Game Engine
document.addEventListener('DOMContentLoaded', () => {
  // Global Assets Registry
  const ASSETS = {
    animals: ['bird0.png', 'cow0.png', 'duck0.png', 'fox0.png', 'monkey0.png', 'pig0.png', 'rabbit0.png', 'sheep0.png', 'snail0.png', 'turtle0.png']
      .map(f => `./Objects/Animals/PNG/${f}`),
    fruits: ['banana0.png', 'cherry0.png', 'coconut0.png', 'kiwi0.png', 'lemon0.png', 'peach0.png', 'pear0.png', 'pineapple0.png', 'plum0.png', 'strawberry0.png']
      .map(f => `./Objects/Fruits/PNG/${f}`),
    sweets: ['cake slice0.png', 'candy0.png', 'caramel0.png', 'chocolate bar0.png', 'cookie0.png', 'cupcake0.png', 'lollipop0.png', 'macaron0.png', 'marshmallow0.png', 'waffle0.png']
      .map(f => `./Objects/Sweets/PNG/${f}`),
    toys: ['block0.png', 'doll0.png', 'drum0.png', 'jump rope0.png', 'puzzle piece0.png', 'rabot0.png', 'rocking horse0.png', 'rubber duck0.png', 'spinning top0.png', 'toy plane0.png']
      .map(f => `./Objects/Toys/PNG/${f}`),
    school: ['backpack0.png', 'book0.png', 'calculator0.png', 'crayon0.png', 'eraser0.png', 'glue stick0.png', 'paintbrush0.png', 'pen0.png', 'ruler0.png', 'scissors0.png']
      .map(f => `./Objects/School subjects/PNG/${f}`)
  };

  const ALL_OBJECTS = [
    ...ASSETS.animals,
    ...ASSETS.fruits,
    ...ASSETS.sweets,
    ...ASSETS.toys,
    ...ASSETS.school
  ];

  const BACKGROUNDS = {
    menu: './Background/PNG/Background_2.png',
    count: './Background/PNG/Background_1.png',
    compare: './Background/PNG/Background_4.png',
    add: './Background/PNG/Background_3.png',
    sub: './Background/PNG/Background_2.png',
    memory: './Background/PNG/Background_1.png'
  };

  function getNumberImg(n) {
    return `./Number/Colored%20version/PNG/${n}0.png`;
  }

  // State Management
  const state = {
    currentGame: 'menu',
    score: parseInt(localStorage.getItem('kids_math_stars') || '150', 10),
    level: 1,
    mascotState: 'Idle',
    mascotFrame: 0,
    mascotTimeout: null,
    answered: false,
    countedItems: 0,
    // Memory game state
    memoryCards: [],
    flippedCards: [],
    matchedCount: 0,
    matchedObjects: [],
    portraitDismissed: false
  };

  // DOM Elements
  const gameScreen = document.getElementById('game-screen');
  const starScoreEl = document.getElementById('star-score-val');
  const mascotImg = document.getElementById('mascot-img');
  const mascotBubble = document.getElementById('mascot-bubble');
  const ribbonTitle = document.getElementById('ribbon-title');
  const ribbonSubtitle = document.getElementById('ribbon-subtitle');
  const victoryModal = document.getElementById('victory-modal');

  // Navigation Buttons
  const btnHome = document.getElementById('btn-home');
  const btnSound = document.getElementById('btn-sound');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnRestart = document.getElementById('btn-restart');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const btnModalNext = document.getElementById('btn-modal-next');
  const rotatePrompt = document.getElementById('rotate-prompt');
  const btnDismissRotate = document.getElementById('btn-dismiss-rotate');

  // Views
  const views = {
    menu: document.getElementById('menu-view'),
    count: document.getElementById('count-view'),
    compare: document.getElementById('compare-view'),
    add: document.getElementById('add-view'),
    sub: document.getElementById('sub-view'),
    memory: document.getElementById('memory-view')
  };

  // Mascot Animations Loop
  const MASCOT_FRAMES = 8;
  setInterval(() => {
    state.mascotFrame = (state.mascotFrame + 1) % MASCOT_FRAMES;
    const path = `./Mascot/PNG%20Sequence/${state.mascotState}/${state.mascotState}_${state.mascotFrame}.png`;
    mascotImg.src = path;
  }, 110);

  function setMascotState(newState, duration = 0, speech = '') {
    if (state.mascotTimeout) {
      clearTimeout(state.mascotTimeout);
      state.mascotTimeout = null;
    }
    state.mascotState = newState;
    state.mascotFrame = 0;

    if (speech) {
      mascotBubble.textContent = speech;
      mascotBubble.classList.add('show');
    }

    if (duration > 0) {
      state.mascotTimeout = setTimeout(() => {
        state.mascotState = 'Idle';
        mascotBubble.classList.remove('show');
      }, duration);
    }
  }

  // Mascot Click Reaction
  document.getElementById('mascot-container').addEventListener('click', () => {
    window.soundEngine.playPop(1.4);
    const compliments = ['Yay!', 'Good Job!', 'You can do it!', 'Super Star!', 'Giggle!'];
    const chosen = compliments[Math.floor(Math.random() * compliments.length)];
    setMascotState('Happy', 2000, chosen);
  });

  // Score System
  function addStars(amount = 10) {
    state.score += amount;
    starScoreEl.textContent = state.score;
    localStorage.setItem('kids_math_stars', state.score);
    window.soundEngine.playStar();
    spawnFloatingStars(amount);
  }

  starScoreEl.textContent = state.score;

  // View Navigation
  function switchView(gameName) {
    state.currentGame = gameName;
    state.answered = false;
    victoryModal.classList.remove('show');

    // Hide all views
    Object.values(views).forEach(v => v.classList.remove('active'));

    // Set Background
    gameScreen.style.backgroundImage = `url('${BACKGROUNDS[gameName]}')`;

    // Toggle view
    if (views[gameName]) {
      views[gameName].classList.add('active');
    }

    // Top Bar & Controls UI adjustments
    const bannerContainer = document.querySelector('.banner-ribbon-container');
    const mascotEl = document.getElementById('mascot-container');
    const controlsRight = document.querySelector('.bottom-controls-right');

    if (gameName === 'menu') {
      gameScreen.classList.add('is-menu');
      gameScreen.classList.remove('in-game');
      bannerContainer.style.display = 'none';
      btnHome.style.display = 'none';
      btnRestart.style.display = 'none';
      controlsRight.style.display = 'none';
      mascotEl.style.display = 'none';
      setMascotState('Idle');
    } else {
      gameScreen.classList.remove('is-menu');
      gameScreen.classList.add('in-game');
      bannerContainer.style.display = 'flex';
      btnHome.style.display = 'flex';
      btnRestart.style.display = 'flex';
      controlsRight.style.display = 'flex';
      mascotEl.style.display = 'flex';
    }

    // Initialize Game Mode
    if (gameName === 'count') initCountGame();
    if (gameName === 'compare') initCompareGame();
    if (gameName === 'add') initMathGame('add');
    if (gameName === 'sub') initMathGame('sub');
    if (gameName === 'memory') initMemoryGame();
  }

  // ========================================================
  // 1. COUNT OBJECTS GAME
  // ========================================================
  function initCountGame() {
    ribbonTitle.textContent = 'COUNT OBJECTS';
    ribbonSubtitle.textContent = 'Count the objects.';
    setMascotState('Thinking', 2500, 'How many?');

    const tray = document.getElementById('count-tray');
    const revealSlot = document.getElementById('count-reveal-slot');
    const choicesRow = document.getElementById('count-choices-row');

    tray.innerHTML = '<div class="tray-inner-stitch"></div>';
    revealSlot.innerHTML = '<span class="placeholder-q">?</span>';
    choicesRow.innerHTML = '';
    state.answered = false;

    // Pick random count (1 to 10)
    const targetCount = Math.floor(Math.random() * 9) + 2; // 2 to 10
    const catKeys = Object.keys(ASSETS);
    const chosenCat = ASSETS[catKeys[Math.floor(Math.random() * catKeys.length)]];
    const chosenItemImg = chosenCat[Math.floor(Math.random() * chosenCat.length)];

    let currentTapCount = 0;

    // Create countable items
    for (let i = 1; i <= targetCount; i++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'countable-item';
      const img = document.createElement('img');
      img.src = chosenItemImg;
      itemEl.appendChild(img);

      // Interactive count-tapping
      itemEl.addEventListener('click', () => {
        if (!itemEl.classList.contains('counted')) {
          itemEl.classList.add('counted');
          currentTapCount++;
          window.soundEngine.playCount(currentTapCount);
          const badge = document.createElement('div');
          badge.className = 'badge-number';
          badge.textContent = currentTapCount;
          itemEl.appendChild(badge);
          setMascotState('Counting', 1200);
        } else {
          window.soundEngine.playPop(1.2);
        }
      });

      tray.appendChild(itemEl);
    }

    // Generate 4 distinct answer choices
    const choices = [targetCount];
    while (choices.length < 4) {
      const cand = Math.floor(Math.random() * 10) + 1;
      if (!choices.includes(cand)) choices.push(cand);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(num => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      const img = document.createElement('img');
      img.src = getNumberImg(num);
      card.appendChild(img);

      card.addEventListener('click', () => {
        if (state.answered) return;
        if (num === targetCount) {
          state.answered = true;
          card.classList.add('correct');
          revealSlot.innerHTML = `<img src="${getNumberImg(targetCount)}" alt="${targetCount}">`;
          window.soundEngine.playSuccess();
          setMascotState('Celebrating', 3500, 'Hooray!');
          addStars(10);
          showConfetti();
        } else {
          card.classList.add('wrong');
          window.soundEngine.playWrong();
          setMascotState('Thinking', 2000, 'Try again!');
          setTimeout(() => card.classList.remove('wrong'), 600);
        }
      });

      choicesRow.appendChild(card);
    });
  }

  // ========================================================
  // 2. COMPARE NUMBERS GAME
  // ========================================================
  function initCompareGame() {
    ribbonTitle.textContent = 'COMPARE NUMBERS';
    ribbonSubtitle.textContent = 'Compare the numbers.';
    setMascotState('Pointing', 2500, 'Which is bigger?');

    const numLeftBox = document.getElementById('compare-left-num');
    const numRightBox = document.getElementById('compare-right-num');
    const targetSlot = document.getElementById('compare-slot');
    const choicesRow = document.getElementById('compare-choices-row');

    targetSlot.className = 'compare-target-slot';
    targetSlot.innerHTML = '?';
    choicesRow.innerHTML = '';
    state.answered = false;

    // Pick two numbers
    const numA = Math.floor(Math.random() * 19) + 1; // 1 to 19
    let numB = Math.floor(Math.random() * 19) + 1;
    // 25% chance of equal
    if (Math.random() < 0.25) numB = numA;

    numLeftBox.innerHTML = `<img src="${getNumberImg(numA)}" alt="${numA}">`;
    numRightBox.innerHTML = `<img src="${getNumberImg(numB)}" alt="${numB}">`;

    const expectedSymbol = numA < numB ? '<' : (numA === numB ? '=' : '>');
    const symbols = ['<', '=', '>'];

    symbols.forEach(sym => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      const label = document.createElement('span');
      label.className = 'symbol-choice';
      label.textContent = sym;
      card.appendChild(label);

      card.addEventListener('click', () => {
        if (state.answered) return;
        if (sym === expectedSymbol) {
          state.answered = true;
          card.classList.add('correct');
          targetSlot.classList.add('filled');
          targetSlot.innerHTML = `<span class="symbol-choice" style="color: #61b329;">${sym}</span>`;
          window.soundEngine.playSuccess();
          setMascotState('Celebrating', 3500, 'Awesome!');
          addStars(10);
          showConfetti();
        } else {
          card.classList.add('wrong');
          window.soundEngine.playWrong();
          setMascotState('Thinking', 2000, 'Hmm, look closely!');
          setTimeout(() => card.classList.remove('wrong'), 600);
        }
      });

      choicesRow.appendChild(card);
    });
  }

  // ========================================================
  // 3 & 4. ADDITION & SUBTRACTION GAMES
  // ========================================================
  function initMathGame(mode = 'add') {
    state.answered = false;
    const isAdd = mode === 'add';

    ribbonTitle.textContent = isAdd ? 'ADDITION' : 'SUBTRACTION';
    ribbonSubtitle.textContent = isAdd ? 'Find the sum of the numbers.' : 'Find the difference between the numbers.';
    setMascotState('Thinking', 2500, isAdd ? 'Add them together!' : 'Take away!');

    const container = document.getElementById(isAdd ? 'add-equation-box' : 'sub-equation-box');
    const choicesRow = document.getElementById(isAdd ? 'add-choices-row' : 'sub-choices-row');

    container.innerHTML = '';
    choicesRow.innerHTML = '';

    let a, b, result;
    if (isAdd) {
      a = Math.floor(Math.random() * 6) + 1; // 1 to 6
      b = Math.floor(Math.random() * 6) + 1; // 1 to 6
      result = a + b;
    } else {
      a = Math.floor(Math.random() * 6) + 4; // 4 to 9
      b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
      result = a - b;
    }

    // Pick 2 cute item types
    const item1 = ALL_OBJECTS[Math.floor(Math.random() * ALL_OBJECTS.length)];
    const item2 = ALL_OBJECTS[Math.floor(Math.random() * ALL_OBJECTS.length)];

    // Left cluster
    const cluster1 = document.createElement('div');
    cluster1.className = 'math-item-cluster';
    for (let i = 0; i < a; i++) {
      const img = document.createElement('img');
      img.src = item1;
      cluster1.appendChild(img);
    }

    // Operator
    const op = document.createElement('span');
    op.className = 'math-operator';
    op.textContent = isAdd ? '+' : '−';

    // Right cluster
    const cluster2 = document.createElement('div');
    cluster2.className = 'math-item-cluster';
    for (let i = 0; i < b; i++) {
      const img = document.createElement('img');
      img.src = isAdd ? item2 : item1;
      cluster2.appendChild(img);
    }

    // Equal sign
    const eq = document.createElement('span');
    eq.className = 'math-operator';
    eq.textContent = '=';

    // Reveal slot
    const revealSlot = document.createElement('div');
    revealSlot.className = 'reveal-slot';
    revealSlot.style.width = '180px';
    revealSlot.style.height = '180px';
    revealSlot.innerHTML = '<span class="placeholder-q">?</span>';

    container.appendChild(cluster1);
    container.appendChild(op);
    container.appendChild(cluster2);
    container.appendChild(eq);
    container.appendChild(revealSlot);

    // Answer choices (3 options)
    const choices = [result];
    while (choices.length < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const cand = Math.max(1, result + offset);
      if (!choices.includes(cand)) choices.push(cand);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(cand => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      const img = document.createElement('img');
      img.src = getNumberImg(cand);
      card.appendChild(img);

      card.addEventListener('click', () => {
        if (state.answered) return;
        if (cand === result) {
          state.answered = true;
          card.classList.add('correct');
          revealSlot.innerHTML = `<img src="${getNumberImg(result)}" alt="${result}">`;
          window.soundEngine.playSuccess();
          setMascotState('Celebrating', 3500, 'Genius!');
          addStars(10);
          showConfetti();
        } else {
          card.classList.add('wrong');
          window.soundEngine.playWrong();
          setMascotState('Thinking', 2000, 'Count again!');
          setTimeout(() => card.classList.remove('wrong'), 600);
        }
      });

      choicesRow.appendChild(card);
    });
  }

  // ========================================================
  // 5. MEMORY CARDS (FIND IDENTICAL OBJECTS)
  // ========================================================
  function initMemoryGame() {
    ribbonTitle.textContent = 'MEMORY CARDS';
    ribbonSubtitle.textContent = 'Find identical objects.';
    setMascotState('Idle', 2000, 'Match the pairs!');

    const grid = document.getElementById('memory-grid');
    const showcaseInner = document.getElementById('showcase-inner');
    const showcaseLabel = document.getElementById('showcase-label');

    grid.innerHTML = '';
    showcaseInner.innerHTML = '';
    showcaseLabel.textContent = 'Match a pair!';
    state.flippedCards = [];
    state.matchedCount = 0;

    // Pick 6 unique objects from ALL_OBJECTS
    const pool = [...ALL_OBJECTS].sort(() => Math.random() - 0.5).slice(0, 6);
    // Duplicate into 12 cards
    const deck = [...pool, ...pool].sort(() => Math.random() - 0.5);

    deck.forEach((objSrc, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.src = objSrc;
      card.dataset.index = idx;

      const back = document.createElement('div');
      back.className = 'memory-card-face card-back';

      const front = document.createElement('div');
      front.className = 'memory-card-face card-front';
      const img = document.createElement('img');
      img.src = objSrc;
      front.appendChild(img);

      card.appendChild(back);
      card.appendChild(front);

      card.addEventListener('click', () => {
        if (card.classList.contains('flipped') || card.classList.contains('matched') || state.flippedCards.length >= 2) {
          return;
        }

        window.soundEngine.playFlip();
        card.classList.add('flipped');
        state.flippedCards.push(card);

        if (state.flippedCards.length === 2) {
          const [c1, c2] = state.flippedCards;
          if (c1.dataset.src === c2.dataset.src) {
            // Match!
            setTimeout(() => {
              c1.classList.add('matched');
              c2.classList.add('matched');
              state.flippedCards = [];
              state.matchedCount++;

              window.soundEngine.playSuccess();
              setMascotState('Happy', 2000, 'Matched!');
              addStars(5);

              // Update showcase frame
              showcaseInner.innerHTML = `<img src="${c1.dataset.src}" alt="Pair"> <img src="${c2.dataset.src}" alt="Pair">`;
              showcaseLabel.textContent = `Found Pair ${state.matchedCount} of 6!`;

              if (state.matchedCount === 6) {
                // Completed all 6 pairs!
                setTimeout(() => {
                  window.soundEngine.playWin();
                  setMascotState('Celebrating', 5000, 'You Won!');
                  victoryModal.classList.add('show');
                  showConfetti();
                }, 600);
              }
            }, 300);
          } else {
            // No match
            setTimeout(() => {
              window.soundEngine.playWrong();
              c1.classList.remove('flipped');
              c2.classList.remove('flipped');
              state.flippedCards = [];
            }, 850);
          }
        }
      });

      grid.appendChild(card);
    });
  }

  // ========================================================
  // Particles & Confetti Canvas Engine
  // ========================================================
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = 1920;
    canvas.height = 1080;
  }
  resizeCanvas();

  function showConfetti() {
    resizeCanvas();
    const colors = ['#ff5252', '#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#9c27b0', '#ff9800'];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        type: Math.random() > 0.4 ? 'rect' : 'star',
        alpha: 1
      });
    }
  }

  function spawnFloatingStars(count = 5) {
    resizeCanvas();
    const startX = canvas.width * 0.5;
    const startY = canvas.height * 0.6;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: startX + (Math.random() - 0.5) * 100,
        y: startY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 8 - 4,
        size: Math.random() * 16 + 14,
        color: '#ffdd44',
        rotation: 0,
        vRot: 4,
        type: 'star',
        alpha: 1
      });
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRot;
      p.alpha -= 0.012;

      if (p.alpha <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.type === 'rect') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        // Draw 5-pointed star
        ctx.fillStyle = p.color;
        drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
        ctx.fill();
      }

      ctx.restore();
    }
    requestAnimationFrame(renderParticles);
  }

  function drawStar(c, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(cx, cy - outerRadius);
    c.closePath();
  }

  requestAnimationFrame(renderParticles);

  // ========================================================
  // Button Event Handlers
  // ========================================================
  btnHome.addEventListener('click', () => {
    window.soundEngine.playPop();
    switchView('menu');
  });

  btnSound.addEventListener('click', () => {
    const isPlaying = window.soundEngine.toggleMusic();
    btnSound.classList.toggle('btn-purple', !isPlaying);
    btnSound.classList.toggle('btn-green', isPlaying);
    setMascotState('Happy', 1500, isPlaying ? 'Music ON!' : 'Music OFF');
  });

  btnRestart.addEventListener('click', () => {
    window.soundEngine.playPop();
    switchView(state.currentGame);
  });

  btnNext.addEventListener('click', () => {
    window.soundEngine.playPop();
    switchView(state.currentGame);
  });

  btnPrev.addEventListener('click', () => {
    window.soundEngine.playPop();
    switchView(state.currentGame);
  });

  btnModalNext.addEventListener('click', () => {
    window.soundEngine.playPop();
    victoryModal.classList.remove('show');
    switchView('menu');
  });

  // Main Menu Game Selection Cards
  document.querySelectorAll('.game-card-hub').forEach(card => {
    card.addEventListener('click', () => {
      window.soundEngine.playPop(1.2);
      const gameKey = card.dataset.game;
      switchView(gameKey);
    });
  });

  // Fullscreen Button
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      window.soundEngine.playPop();
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  // Dismiss Rotate Prompt
  if (btnDismissRotate) {
    btnDismissRotate.addEventListener('click', () => {
      window.soundEngine.playPop();
      state.portraitDismissed = true;
      if (rotatePrompt) rotatePrompt.classList.remove('show');
      resizeGame();
    });
  }

  // Responsive Resizing Engine for Mobile & Desktop
  function resizeGame() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate scale to fit 1920x1080 resolution inside viewport
    const scale = Math.min(w / 1920, h / 1080);
    gameScreen.style.transform = `scale(${scale})`;

    // Check if on mobile device in portrait mode
    if (rotatePrompt && !state.portraitDismissed) {
      if (h > w && w < 850) {
        rotatePrompt.classList.add('show');
      } else {
        rotatePrompt.classList.remove('show');
      }
    }
  }

  window.addEventListener('resize', resizeGame);
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeGame, 150);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeGame);
  }

  // Start at Menu
  switchView('menu');
  resizeGame();
});
