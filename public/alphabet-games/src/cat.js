// Cat Mascot Animation Controller

export class CatCharacter {
  constructor(containerEl, defaultAnimation = 'idle') {
    this.container = containerEl;
    this.currentAnim = defaultAnimation;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.frameDuration = 110; // ~9 FPS for smooth hand-drawn cartoon feel
    this.isRunning = false;
    this.fallbackAnim = 'idle';
    this.oneShot = false;

    this.animations = {
      idle: { folder: 'IDLE', prefix: 'IDLE', frames: 8, loop: true },
      celebrate: { folder: 'Celebrate', prefix: 'Celebrate', frames: 8, loop: true },
      happy: { folder: 'Happy', prefix: 'Happy', frames: 8, loop: true },
      jamp: { folder: 'Jamp', prefix: 'Jamp', frames: 8, loop: true },
      pointing: { folder: 'Pointing', prefix: 'Pointing', frames: 8, loop: true },
      sad: { folder: 'Sad', prefix: 'Sad', frames: 8, loop: true },
      thinking: { folder: 'Thinking', prefix: 'Thinking', frames: 8, loop: true }
    };

    this.imgEl = null;
    this.bubbleEl = null;
    this.bubbleTimeout = null;

    this.initDOM();
    this.start();
  }

  initDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('cat-mascot-wrapper');

    // Speech/thought bubble
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'cat-speech-bubble';
    this.bubbleEl.style.display = 'none';
    this.container.appendChild(this.bubbleEl);

    // Sprite image
    this.imgEl = document.createElement('img');
    this.imgEl.className = 'cat-mascot-img';
    this.imgEl.alt = 'Cute Cat Guide';
    this.imgEl.src = this.getFrameSrc(this.currentAnim, 0);

    // Click cat for fun interaction
    this.container.addEventListener('click', () => {
      this.playReaction();
    });

    this.container.appendChild(this.imgEl);
  }

  getFrameSrc(animName, frameIdx) {
    const anim = this.animations[animName] || this.animations.idle;
    const safeFolder = encodeURIComponent(anim.folder);
    return `/Cat/Png%20sequence/${safeFolder}/${anim.prefix}_${frameIdx}.png`;
  }

  setAnimation(animName, oneShot = false, fallback = 'idle') {
    if (!this.animations[animName]) animName = 'idle';
    if (this.currentAnim === animName && !oneShot) return;

    this.currentAnim = animName;
    this.currentFrame = 0;
    this.oneShot = oneShot;
    this.fallbackAnim = fallback;
    if (this.imgEl) {
      this.imgEl.src = this.getFrameSrc(this.currentAnim, 0);
    }
  }

  say(text, duration = 3000) {
    if (!this.bubbleEl) return;
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    this.bubbleEl.textContent = text;
    this.bubbleEl.style.display = 'block';
    this.bubbleEl.classList.remove('pop-out');
    this.bubbleEl.classList.add('pop-in');

    this.bubbleTimeout = setTimeout(() => {
      this.bubbleEl.classList.remove('pop-in');
      this.bubbleEl.classList.add('pop-out');
      setTimeout(() => {
        this.bubbleEl.style.display = 'none';
      }, 300);
    }, duration);
  }

  playReaction() {
    const funAnims = ['jamp', 'happy', 'celebrate'];
    const randomAnim = funAnims[Math.floor(Math.random() * funAnims.length)];
    const messages = ['Purr~!', 'Meow!', 'You can do it!', 'Let\'s learn together! 🐾', 'Yay! ⭐'];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    this.setAnimation(randomAnim, true, 'idle');
    this.say(randomMsg, 2000);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    const loop = (now) => {
      if (!this.isRunning) return;
      if (now - this.lastFrameTime >= this.frameDuration) {
        this.lastFrameTime = now;
        const anim = this.animations[this.currentAnim] || this.animations.idle;

        this.currentFrame++;
        if (this.currentFrame >= anim.frames) {
          if (this.oneShot) {
            this.currentAnim = this.fallbackAnim;
            this.currentFrame = 0;
            this.oneShot = false;
          } else {
            this.currentFrame = 0;
          }
        }

        if (this.imgEl) {
          this.imgEl.src = this.getFrameSrc(this.currentAnim, this.currentFrame);
        }
      }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
  }
}
