// Web Audio API Sound & Music Synthesizer for Kids Math Game
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.init();
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  // Soft wooden bubble pop
  playPop(freqMultiplier = 1) {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 420 * freqMultiplier;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Tapping object to count it (pitch goes up with count: 1, 2, 3...)
  playCount(number = 1) {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale frequency calculation
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = pentatonic[Math.min(number - 1, pentatonic.length - 1)];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.05);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Success arpeggio + sparkle
  playSuccess() {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });

    // Magic bell sparkle on top
    setTimeout(() => {
      this.playStar();
    }, 280);
  }

  // Friendly soft boing on wrong guess
  playWrong() {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Card flip whoosh
  playFlip() {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Sparkling star gain
  playStar() {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const sparkles = [1200, 1600, 2000, 2400];

    sparkles.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Level cleared fanfare
  playWin() {
    if (!this.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 523.25, d: 0.15, t: 0.15 },
      { f: 523.25, d: 0.15, t: 0.3 },
      { f: 659.25, d: 0.3, t: 0.45 },
      { f: 587.33, d: 0.2, t: 0.75 },
      { f: 783.99, d: 0.5, t: 0.95 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + n.d);
    });
  }

  // Soft nursery marimba loop for BGM
  startMusic() {
    this.stopMusic();
    const melody = [
      261.63, 329.63, 392.00, 523.25, // C E G C
      440.00, 392.00, 329.63, 261.63, // A G E C
      293.66, 329.63, 349.23, 392.00, // D E F G
      329.63, 293.66, 261.63, 0       // E D C rest
    ];

    const playStep = () => {
      if (!this.musicEnabled) return;
      const freq = melody[this.musicStep % melody.length];
      this.musicStep++;

      if (freq > 0 && this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }

      this.musicTimer = setTimeout(playStep, 280);
    };

    playStep();
  }

  stopMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

window.soundEngine = new SoundEngine();
