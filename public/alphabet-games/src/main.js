import { ALPHABET_DATA, LETTERS, ASSET_PATHS } from './data.js';
import { audio } from './audio.js';
import { CatCharacter } from './cat.js';
import { ParticleFX } from './confetti.js';

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================
class GameManager {
  constructor() {
    this.stars = parseInt(localStorage.getItem('abc_game_stars') || '150', 10);
    this.currentScreen = 'menu';
    this.fx = null;
    this.cats = {};

    // Mode-specific states
    this.matchState = { levelIndex: 0, selectedLetter: null, matches: [] };
    this.findState = { letterIndex: 0, targetObj: null };
    this.buildState = { wordIndex: 0, currentWord: 'WHALE', slots: [] };
    this.traceState = { letter: 'A', isDrawing: false, pointsCount: 0, completed: false };
    this.missingState = { wordIndex: 0, targetWord: 'ORANGE', targetLetter: 'O' };

    this.init();
  }

  init() {
    // Setup particle canvas
    const canvas = document.getElementById('fx-canvas');
    this.fx = new ParticleFX(canvas);

    // Update star badge
    this.updateStarDisplay();

    // Initialize Cat mascots for each screen
    this.initCats();

    // Setup global top nav buttons
    this.initNavButtons();

    // Setup title screen
    this.initTitleScreen();

    // Setup Game Mode card clicks
    this.initMenuCards();

    // Setup Modals
    this.initModals();

    // Default screen is Menu
    this.setScreen('menu');
  }

  initCats() {
    const screens = ['menu', 'match', 'find', 'build', 'trace', 'missing'];
    screens.forEach(scr => {
      const el = document.getElementById(`cat-${scr}`);
      if (el) {
        this.cats[scr] = new CatCharacter(el, scr === 'build' ? 'thinking' : 'idle');
      }
    });
  }

  addStars(count = 10) {
    this.stars += count;
    localStorage.setItem('abc_game_stars', this.stars.toString());
    this.updateStarDisplay();

    // Animate star badge
    const badge = document.getElementById('star-badge-container');
    if (badge) {
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => badge.style.transform = 'scale(1)', 250);
    }
  }

  updateStarDisplay() {
    const el = document.getElementById('star-count-text');
    if (el) el.textContent = this.stars;
  }

  initNavButtons() {
    const btnHome = document.getElementById('btn-home');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        audio.playClick();
        this.setScreen('menu');
      });
    }

    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const enabled = audio.toggleSound();
        btnSound.textContent = enabled ? '🔊' : '🔇';
        if (enabled) audio.playPop();
      });
    }

    const btnMusic = document.getElementById('btn-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        const enabled = audio.toggleMusic();
        btnMusic.textContent = enabled ? '🎶' : '🎵';
      });
    }
  }

  setScreen(screenName) {
    this.currentScreen = screenName;
    const viewport = document.getElementById('game-viewport');

    // Remove all screen active classes
    document.querySelectorAll('.screen').forEach(scr => scr.classList.remove('active'));

    // Set screen background
    viewport.className = 'game-viewport';
    switch (screenName) {
      case 'menu':
      case 'match':
        viewport.classList.add('bg-meadow');
        break;
      case 'find':
      case 'missing':
        viewport.classList.add('bg-night');
        break;
      case 'build':
      case 'explorer':
        viewport.classList.add('bg-clouds');
        break;
      case 'trace':
        viewport.classList.add('bg-beach');
        break;
    }

    const targetScreen = document.getElementById(`screen-${screenName}`);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // Initialize the entered screen
    switch (screenName) {
      case 'menu':
        if (this.cats.menu) this.cats.menu.setAnimation('idle');
        break;
      case 'match':
        this.setupMatchGame();
        break;
      case 'find':
        this.setupFindGame();
        break;
      case 'build':
        this.setupBuildGame();
        break;
      case 'trace':
        this.setupTraceGame();
        break;
      case 'missing':
        this.setupMissingGame();
        break;
      case 'explorer':
        this.setupExplorerGame();
        break;
    }
  }

  showVictoryModal(message, nextCallback) {
    audio.playFanfare();
    this.fx.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
    this.addStars(20);

    const modal = document.getElementById('modal-victory');
    const msgEl = document.getElementById('victory-message');
    const btnContinue = document.getElementById('btn-victory-continue');

    if (msgEl) msgEl.textContent = message;
    if (modal) modal.classList.add('active');

    btnContinue.onclick = () => {
      audio.playPop();
      modal.classList.remove('active');
      if (nextCallback) nextCallback();
    };
  }

  initModals() {
    const modalExp = document.getElementById('modal-explorer');
    const btnClose = document.getElementById('btn-modal-close');
    if (btnClose && modalExp) {
      btnClose.addEventListener('click', () => {
        audio.playClick();
        modalExp.classList.remove('active');
      });
    }
  }

  // ==========================================
  // 0. TITLE SCREEN
  // ==========================================
  initTitleScreen() {
    const container = document.getElementById('title-letters-row');
    if (!container) return;
    container.innerHTML = '';

    const titleLetters = ['A', 'L', 'P', 'H', 'A', 'B', 'E', 'T'];
    titleLetters.forEach((char, idx) => {
      const img = document.createElement('img');
      img.className = 'title-letter-img';
      img.src = ASSET_PATHS.letterImg(char);
      img.alt = char;
      img.style.animationDelay = `${idx * 0.15}s`;
      img.addEventListener('click', () => {
        audio.playPop();
        audio.speakLetter(char);
        this.fx.burst(img.getBoundingClientRect().left + 25, img.getBoundingClientRect().top + 25, 20);
      });
      container.appendChild(img);
    });
  }

  initMenuCards() {
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playPop();
        const mode = card.dataset.mode;
        this.setScreen(mode);
      });
    });
  }

  // ==========================================
  // 1. GAME 1: MATCH LETTERS (Preview 2)
  // ==========================================
  setupMatchGame() {
    const levels = [
      ['A', 'B', 'C', 'D', 'E', 'F'],
      ['G', 'H', 'I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V', 'W', 'X'],
      ['Y', 'Z', 'A', 'B', 'C', 'D']
    ];

    const currentLetters = levels[this.matchState.levelIndex % levels.length];
    this.matchState.selectedLetter = null;
    this.matchState.matches = [];

    const lettersRow = document.getElementById('match-letters-row');
    const objectsRow = document.getElementById('match-objects-row');
    const svgEl = document.getElementById('match-lines-svg');

    lettersRow.innerHTML = '';
    objectsRow.innerHTML = '';
    svgEl.innerHTML = '';

    if (this.cats.match) {
      this.cats.match.setAnimation('happy');
      this.cats.match.say('Can you match letters with pictures? 🎨', 3000);
    }

    // Letters cards
    currentLetters.forEach(char => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.letter = char;
      card.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;

      card.addEventListener('click', () => {
        if (card.classList.contains('matched')) return;
        audio.playPop();
        audio.speakLetter(char);

        // Deselect any previous letter
        lettersRow.querySelectorAll('.match-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.matchState.selectedLetter = char;
      });

      lettersRow.appendChild(card);
    });

    // Shuffle objects for this level
    const objectsList = currentLetters.map(char => {
      const obj = ALPHABET_DATA[char].objects[0];
      return { letter: char, word: obj.word, file: obj.file };
    }).sort(() => Math.random() - 0.5);

    // Objects cards
    objectsList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.letter = item.letter;
      card.dataset.word = item.word;
      card.innerHTML = `<img src="${ASSET_PATHS.objectImg(item.file)}" alt="${item.word}">`;

      card.addEventListener('click', () => {
        if (card.classList.contains('matched')) return;

        if (!this.matchState.selectedLetter) {
          audio.speakWord(item.word);
          return;
        }

        const selectedLetter = this.matchState.selectedLetter;
        if (selectedLetter === item.letter) {
          // CORRECT MATCH!
          audio.playSuccess();
          audio.speakPhonics(selectedLetter, item.word);
          if (this.cats.match) this.cats.match.setAnimation('celebrate', true, 'happy');

          // Highlight both cards
          card.classList.add('matched');
          const letterCard = lettersRow.querySelector(`[data-letter="${selectedLetter}"]`);
          if (letterCard) {
            letterCard.classList.remove('selected');
            letterCard.classList.add('matched');
            this.drawMatchLine(letterCard, card);
          }

          this.matchState.matches.push(selectedLetter);
          this.matchState.selectedLetter = null;

          // Check level complete
          if (this.matchState.matches.length === currentLetters.length) {
            setTimeout(() => {
              this.showVictoryModal(`Great job! You matched all letters in Level ${this.matchState.levelIndex + 1}!`, () => {
                this.matchState.levelIndex++;
                this.setupMatchGame();
              });
            }, 600);
          }
        } else {
          // WRONG MATCH
          audio.playWrong();
          if (this.cats.match) this.cats.match.setAnimation('sad', true, 'idle');
          card.style.transform = 'translateX(-8px)';
          setTimeout(() => card.style.transform = 'translateX(8px)', 100);
          setTimeout(() => card.style.transform = 'none', 200);
        }
      });

      objectsRow.appendChild(card);
    });

    // Setup bottom buttons
    document.getElementById('btn-match-prev').onclick = () => {
      audio.playClick();
      if (this.matchState.levelIndex > 0) this.matchState.levelIndex--;
      this.setupMatchGame();
    };
    document.getElementById('btn-match-replay').onclick = () => {
      audio.playClick();
      this.setupMatchGame();
    };
    document.getElementById('btn-match-next').onclick = () => {
      audio.playClick();
      this.matchState.levelIndex++;
      this.setupMatchGame();
    };
  }

  drawMatchLine(letterCard, objectCard) {
    const svg = document.getElementById('match-lines-svg');
    const container = document.querySelector('.match-game-container');
    const cRect = container.getBoundingClientRect();
    const lRect = letterCard.getBoundingClientRect();
    const oRect = objectCard.getBoundingClientRect();

    const x1 = lRect.left + lRect.width / 2 - cRect.left;
    const y1 = lRect.bottom - cRect.top;
    const x2 = oRect.left + oRect.width / 2 - cRect.left;
    const y2 = oRect.top - cRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cy1 = y1 + 35;
    const cy2 = y2 - 35;
    const d = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;

    const color = ALPHABET_DATA[letterCard.dataset.letter]?.color || '#4FACFE';

    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '5');
    path.setAttribute('stroke-dasharray', '8 6');
    path.setAttribute('stroke-linecap', 'round');

    svg.appendChild(path);
  }

  // ==========================================
  // 2. GAME 2: FIND THE LETTER (Preview 3)
  // ==========================================
  setupFindGame() {
    const targetLetter = LETTERS[this.findState.letterIndex % LETTERS.length];
    const letterData = ALPHABET_DATA[targetLetter];
    const correctObj = letterData.objects[Math.floor(Math.random() * letterData.objects.length)];

    // Target letter display
    const targetImg = document.getElementById('find-target-letter-img');
    if (targetImg) targetImg.src = ASSET_PATHS.letterImg(targetLetter);

    if (this.cats.find) {
      this.cats.find.setAnimation('pointing');
      this.cats.find.say(`Find the picture for letter ${targetLetter}! 🔍`, 3000);
    }
    audio.speak(`Find the picture whose name begins with letter ${targetLetter}`);

    // Gather 14 other objects
    const otherObjects = [];
    LETTERS.filter(l => l !== targetLetter).forEach(l => {
      ALPHABET_DATA[l].objects.forEach(obj => {
        otherObjects.push({ letter: l, word: obj.word, file: obj.file });
      });
    });
    otherObjects.sort(() => Math.random() - 0.5);
    const chosenDistractors = otherObjects.slice(0, 14);

    const allItems = [
      { letter: targetLetter, word: correctObj.word, file: correctObj.file, isTarget: true },
      ...chosenDistractors
    ].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('find-grid');
    grid.innerHTML = '';

    allItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'find-item-card';
      card.innerHTML = `<img src="${ASSET_PATHS.objectImg(item.file)}" alt="${item.word}">`;

      card.addEventListener('click', () => {
        if (item.isTarget) {
          // WIN ROUND!
          audio.playSuccess();
          audio.speakPhonics(targetLetter, item.word);
          this.fx.burst(card.getBoundingClientRect().left + 40, card.getBoundingClientRect().top + 40, 40);
          this.addStars(10);

          if (this.cats.find) {
            this.cats.find.setAnimation('celebrate', true, 'idle');
            this.cats.find.say(`Hooray! ${item.word}! ⭐`, 2500);
          }

          card.style.transform = 'scale(1.25)';
          card.style.borderColor = '#43E97B';

          setTimeout(() => {
            this.findState.letterIndex++;
            this.setupFindGame();
          }, 1500);
        } else {
          // WRONG OBJECT
          audio.playWrong();
          audio.speakWord(item.word);
          if (this.cats.find) this.cats.find.setAnimation('thinking', true, 'idle');
          card.style.transform = 'rotate(-8deg)';
          setTimeout(() => card.style.transform = 'rotate(8deg)', 100);
          setTimeout(() => card.style.transform = 'none', 200);
        }
      });

      grid.appendChild(card);
    });

    // Bottom controls
    document.getElementById('btn-find-prev').onclick = () => {
      audio.playClick();
      if (this.findState.letterIndex > 0) this.findState.letterIndex--;
      this.setupFindGame();
    };
    document.getElementById('btn-find-replay').onclick = () => {
      audio.playClick();
      this.setupFindGame();
    };
    document.getElementById('btn-find-next').onclick = () => {
      audio.playClick();
      this.findState.letterIndex++;
      this.setupFindGame();
    };
  }

  // ==========================================
  // 3. GAME 3: BUILD THE WORD (Preview 4)
  // ==========================================
  setupBuildGame() {
    const wordList = [
      { word: 'WHALE', file: 'whale.png' },
      { word: 'CAR', file: 'car.png' },
      { word: 'APPLE', file: 'apple.png' },
      { word: 'LION', file: 'lion.png' },
      { word: 'FROG', file: 'frog.png' },
      { word: 'STAR', file: 'star.png' },
      { word: 'PANDA', file: 'panda.png' },
      { word: 'ZEBRA', file: 'zebra.png' },
      { word: 'SUN', file: 'sun.png' },
      { word: 'TREE', file: 'tree.png' },
      { word: 'TRAIN', file: 'train.png' }
    ];

    const current = wordList[this.buildState.wordIndex % wordList.length];
    this.buildState.currentWord = current.word;
    this.buildState.slots = new Array(current.word.length).fill(null);

    // Update object image and label
    const objImg = document.getElementById('build-object-img');
    const objName = document.getElementById('build-object-name');
    if (objImg) objImg.src = ASSET_PATHS.objectImg(current.file);
    if (objName) objName.textContent = current.word;

    if (this.cats.build) {
      this.cats.build.setAnimation('thinking');
      this.cats.build.say(`Let's spell ${current.word}! ✍️`, 3000);
    }
    audio.speakWord(current.word);

    // Render Slots
    this.renderBuildSlots();

    // Render Keyboard
    this.renderBuildKeyboard();

    // Bottom controls
    document.getElementById('btn-build-prev').onclick = () => {
      audio.playClick();
      if (this.buildState.wordIndex > 0) this.buildState.wordIndex--;
      this.setupBuildGame();
    };
    document.getElementById('btn-build-replay').onclick = () => {
      audio.playClick();
      this.setupBuildGame();
    };
    document.getElementById('btn-build-next').onclick = () => {
      audio.playClick();
      this.buildState.wordIndex++;
      this.setupBuildGame();
    };
  }

  renderBuildSlots() {
    const container = document.getElementById('build-slots-container');
    container.innerHTML = '';

    this.buildState.slots.forEach((char, idx) => {
      const slot = document.createElement('div');
      slot.className = `word-slot ${char ? 'filled' : ''}`;

      if (char) {
        slot.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;
        // Click slot to remove letter
        slot.addEventListener('click', () => {
          audio.playClick();
          this.buildState.slots[idx] = null;
          this.renderBuildSlots();
        });
      }

      container.appendChild(slot);
    });
  }

  renderBuildKeyboard() {
    const container = document.getElementById('build-keyboard');
    container.innerHTML = '';

    const row1 = LETTERS.slice(0, 13);
    const row2 = LETTERS.slice(13);

    [row1, row2].forEach(rowChars => {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      rowChars.forEach(char => {
        const key = document.createElement('div');
        key.className = 'key-tile';
        key.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;

        key.addEventListener('click', () => {
          audio.playPop();
          audio.speakLetter(char);

          // Find first empty slot
          const emptyIdx = this.buildState.slots.indexOf(null);
          if (emptyIdx !== -1) {
            this.buildState.slots[emptyIdx] = char;
            this.renderBuildSlots();
            this.checkBuildWord();
          }
        });

        rowEl.appendChild(key);
      });

      container.appendChild(rowEl);
    });
  }

  checkBuildWord() {
    // If all slots are filled
    if (!this.buildState.slots.includes(null)) {
      const formedWord = this.buildState.slots.join('');
      if (formedWord === this.buildState.currentWord) {
        // SUCCESS!
        audio.playSuccess();
        audio.speak(`${this.buildState.currentWord}! Fantastic spelling!`);
        this.addStars(15);
        if (this.cats.build) this.cats.build.setAnimation('celebrate', true, 'idle');

        setTimeout(() => {
          this.showVictoryModal(`You spelled "${this.buildState.currentWord}" perfectly!`, () => {
            this.buildState.wordIndex++;
            this.setupBuildGame();
          });
        }, 600);
      } else {
        // INCORRECT SPELLING
        audio.playWrong();
        if (this.cats.build) this.cats.build.setAnimation('sad', true, 'thinking');
        setTimeout(() => {
          this.buildState.slots = new Array(this.buildState.currentWord.length).fill(null);
          this.renderBuildSlots();
        }, 800);
      }
    }
  }

  // ==========================================
  // 4. GAME 4: TRACE THE LETTER (Preview 5)
  // ==========================================
  setupTraceGame() {
    const letter = this.traceState.letter;
    this.traceState.pointsCount = 0;
    this.traceState.completed = false;

    if (this.cats.trace) {
      this.cats.trace.setAnimation('happy');
      this.cats.trace.say(`Trace the letter ${letter}! ✏️`, 3000);
    }
    audio.speakLetter(letter);

    // Load SVG outline
    const svgContainer = document.getElementById('trace-svg-container');
    fetch(ASSET_PATHS.letterOutlineSvg(letter))
      .then(res => res.text())
      .then(svgText => {
        svgContainer.innerHTML = svgText;
      })
      .catch(() => {
        svgContainer.innerHTML = `<img src="${ASSET_PATHS.letterImg(letter)}" style="width:70%;height:70%;object-fit:contain;">`;
      });

    // Setup Canvas Drawing
    this.initTraceCanvas();

    // Render Quick Letter Picker
    const picker = document.getElementById('trace-picker-grid');
    picker.innerHTML = '';
    LETTERS.forEach(char => {
      const tile = document.createElement('div');
      tile.className = `picker-tile ${char === letter ? 'active' : ''}`;
      tile.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;

      tile.addEventListener('click', () => {
        audio.playPop();
        this.traceState.letter = char;
        this.setupTraceGame();
      });

      picker.appendChild(tile);
    });

    // Clear Button
    document.getElementById('btn-trace-clear').onclick = () => {
      audio.playClick();
      this.clearTraceCanvas();
    };

    // Hear Button
    document.getElementById('btn-trace-hear').onclick = () => {
      audio.playPop();
      const obj = ALPHABET_DATA[letter].objects[0];
      audio.speakPhonics(letter, obj.word);
    };

    // Bottom controls
    document.getElementById('btn-trace-prev').onclick = () => {
      audio.playClick();
      const currIdx = LETTERS.indexOf(this.traceState.letter);
      this.traceState.letter = LETTERS[(currIdx - 1 + LETTERS.length) % LETTERS.length];
      this.setupTraceGame();
    };
    document.getElementById('btn-trace-replay').onclick = () => {
      audio.playClick();
      this.setupTraceGame();
    };
    document.getElementById('btn-trace-next').onclick = () => {
      audio.playClick();
      const currIdx = LETTERS.indexOf(this.traceState.letter);
      this.traceState.letter = LETTERS[(currIdx + 1) % LETTERS.length];
      this.setupTraceGame();
    };
  }

  initTraceCanvas() {
    const canvas = document.getElementById('trace-draw-canvas');
    const ctx = canvas.getContext('2d');
    this.clearTraceCanvas();

    let lastX = 0;
    let lastY = 0;

    const startDraw = (e) => {
      this.traceState.isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      lastX = (clientX - rect.left) * (canvas.width / rect.width);
      lastY = (clientY - rect.top) * (canvas.height / rect.height);
      audio.playSparkle();
    };

    const draw = (e) => {
      if (!this.traceState.isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#FF6B8B';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 107, 139, 0.6)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      lastX = x;
      lastY = y;
      this.traceState.pointsCount++;

      // Emit sparkle particles
      if (this.traceState.pointsCount % 4 === 0) {
        this.fx.burst(clientX, clientY, 3);
      }

      // Check completion threshold
      if (this.traceState.pointsCount > 40 && !this.traceState.completed) {
        this.traceState.completed = true;
        this.completeTracing();
      }
    };

    const stopDraw = () => {
      this.traceState.isDrawing = false;
    };

    canvas.onpointerdown = startDraw;
    canvas.onpointermove = draw;
    canvas.onpointerup = stopDraw;
    canvas.onpointercancel = stopDraw;
  }

  clearTraceCanvas() {
    const canvas = document.getElementById('trace-draw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.traceState.pointsCount = 0;
    this.traceState.completed = false;
  }

  completeTracing() {
    const letter = this.traceState.letter;
    audio.playSuccess();
    const obj = ALPHABET_DATA[letter].objects[0];
    audio.speak(`${letter}! Fantastic tracing! ${letter} is for ${obj.word}!`);
    this.addStars(10);
    this.fx.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

    if (this.cats.trace) {
      this.cats.trace.setAnimation('celebrate', true, 'happy');
      this.cats.trace.say(`Awesome tracing! ⭐`, 3000);
    }
  }

  // ==========================================
  // 5. GAME 5: MISSING LETTER (Preview 6)
  // ==========================================
  setupMissingGame() {
    const words = [
      { word: 'ORANGE', file: 'orange.png', missing: 'O' },
      { word: 'APPLE', file: 'apple.png', missing: 'A' },
      { word: 'ZEBRA', file: 'zebra.png', missing: 'Z' },
      { word: 'ELEPHANT', file: 'elephant.png', missing: 'E' },
      { word: 'BEAR', file: 'bear.png', missing: 'B' },
      { word: 'CAT', file: 'cat.png', missing: 'C' },
      { word: 'DOLPHIN', file: 'donut.png', missing: 'D' },
      { word: 'FROG', file: 'frog.png', missing: 'F' },
      { word: 'LION', file: 'lion.png', missing: 'L' },
      { word: 'PANDA', file: 'panda.png', missing: 'P' },
      { word: 'STAR', file: 'star.png', missing: 'S' },
      { word: 'TRAIN', file: 'train.png', missing: 'T' }
    ];

    const current = words[this.missingState.wordIndex % words.length];
    this.missingState.targetWord = current.word;
    this.missingState.targetLetter = current.missing;

    // Display image and tail of word
    const imgEl = document.getElementById('missing-object-img');
    if (imgEl) imgEl.src = ASSET_PATHS.objectImg(current.file);

    const slotEl = document.getElementById('missing-slot');
    const tailEl = document.getElementById('missing-word-tail');
    if (slotEl) slotEl.textContent = '_';
    if (tailEl) tailEl.textContent = current.word.slice(1);

    if (this.cats.missing) {
      this.cats.missing.setAnimation('happy');
      this.cats.missing.say(`What letter is missing? 🤔`, 3000);
    }

    // Keyboard
    const keyboard = document.getElementById('missing-keyboard');
    keyboard.innerHTML = '';
    LETTERS.forEach(char => {
      const tile = document.createElement('div');
      tile.className = 'key-tile';
      tile.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;

      tile.addEventListener('click', () => {
        if (char === current.missing) {
          // CORRECT!
          audio.playSuccess();
          slotEl.innerHTML = `<img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">`;
          audio.speakPhonics(char, current.word);
          this.addStars(10);
          this.fx.burst(tile.getBoundingClientRect().left + 25, tile.getBoundingClientRect().top + 25, 30);

          if (this.cats.missing) {
            this.cats.missing.setAnimation('celebrate', true, 'idle');
            this.cats.missing.say(`Hooray! ${current.word}!`, 2500);
          }

          setTimeout(() => {
            this.missingState.wordIndex++;
            this.setupMissingGame();
          }, 1500);
        } else {
          // WRONG LETTER
          audio.playWrong();
          audio.speakLetter(char);
          if (this.cats.missing) this.cats.missing.setAnimation('sad', true, 'idle');
          tile.style.transform = 'translateY(-8px)';
          setTimeout(() => tile.style.transform = 'none', 200);
        }
      });

      keyboard.appendChild(tile);
    });

    // Controls
    document.getElementById('btn-missing-prev').onclick = () => {
      audio.playClick();
      if (this.missingState.wordIndex > 0) this.missingState.wordIndex--;
      this.setupMissingGame();
    };
    document.getElementById('btn-missing-replay').onclick = () => {
      audio.playClick();
      this.setupMissingGame();
    };
    document.getElementById('btn-missing-next').onclick = () => {
      audio.playClick();
      this.missingState.wordIndex++;
      this.setupMissingGame();
    };
  }

  // ==========================================
  // 6. ABC EXPLORER / SOUNDBOARD
  // ==========================================
  setupExplorerGame() {
    const grid = document.getElementById('explorer-grid');
    grid.innerHTML = '';

    LETTERS.forEach(char => {
      const data = ALPHABET_DATA[char];
      const primaryObj = data.objects[0];

      const card = document.createElement('div');
      card.className = 'explorer-card';
      card.innerHTML = `
        <img src="${ASSET_PATHS.letterImg(char)}" alt="${char}">
        <div class="explorer-word-label">${primaryObj.word}</div>
      `;

      card.addEventListener('click', () => {
        audio.playPop();
        this.openExplorerModal(char);
      });

      grid.appendChild(card);
    });
  }

  openExplorerModal(char) {
    const data = ALPHABET_DATA[char];
    const modal = document.getElementById('modal-explorer');
    const letterDisplay = document.getElementById('modal-letter-display');
    const objectsContainer = document.getElementById('modal-objects-container');

    // Bounce sequence animation for letter
    letterDisplay.innerHTML = `
      <img id="modal-bouncing-letter" src="${ASSET_PATHS.letterBounce(char, 0)}" style="width: 140px; height: 140px; object-fit: contain;">
    `;

    // Loop through bounce sequence frames
    let frame = 0;
    const bounceImg = document.getElementById('modal-bouncing-letter');
    const timer = setInterval(() => {
      if (!modal.classList.contains('active')) {
        clearInterval(timer);
        return;
      }
      frame = (frame + 1) % 8;
      if (bounceImg) bounceImg.src = ASSET_PATHS.letterBounce(char, frame);
    }, 110);

    // Objects
    objectsContainer.innerHTML = '';
    data.objects.forEach(obj => {
      const item = document.createElement('div');
      item.className = 'modal-object-item';
      item.innerHTML = `
        <img src="${ASSET_PATHS.objectImg(obj.file)}" alt="${obj.word}">
        <span class="modal-object-name">${obj.word}</span>
      `;
      item.addEventListener('click', () => {
        audio.playPop();
        audio.speakPhonics(char, obj.word);
        this.fx.burst(item.getBoundingClientRect().left + 50, item.getBoundingClientRect().top + 50, 30);
      });
      objectsContainer.appendChild(item);
    });

    audio.speakPhonics(char, data.objects[0].word);
    modal.classList.add('active');
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameManager();
});
