// Web Audio API Sound Generator & Speech Synthesizer

class AudioManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.bgmOscs = [];
    this.bgmTimer = null;
    this.speechVoice = null;

    // Load available voices
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for pleasant English voice
        this.speechVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny'))) 
          || voices.find(v => v.lang.startsWith('en')) 
          || voices[0];
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
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
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.initCtx();
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.musicEnabled;
  }

  playPop() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  playFanfare() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const melody = [
      { f: 523.25, d: 0.12, w: 0 },
      { f: 659.25, d: 0.12, w: 0.12 },
      { f: 783.99, d: 0.12, w: 0.24 },
      { f: 1046.50, d: 0.35, w: 0.36 },
      { f: 880.00, d: 0.12, w: 0.52 },
      { f: 1046.50, d: 0.5, w: 0.65 }
    ];

    melody.forEach(item => {
      const t = this.ctx.currentTime + item.w;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + item.d + 0.02);
    });
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.18);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playSparkle() {
    if (!this.soundEnabled) return;
    this.initCtx();
    const baseFreqs = [1200, 1500, 1800, 2200, 2600];
    baseFreqs.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  speak(text, rate = 0.9, pitch = 1.2) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (this.speechVoice) utter.voice = this.speechVoice;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }

  speakLetter(letter) {
    this.speak(letter, 0.85, 1.25);
  }

  speakWord(word) {
    this.speak(word.toLowerCase(), 0.9, 1.15);
  }

  speakPhonics(letter, word) {
    this.speak(`${letter}! ${letter} is for ${word}!`, 0.9, 1.2);
  }

  startBgm() {
    this.stopBgm();
    const playBar = () => {
      if (!this.musicEnabled) return;
      this.initCtx();
      const chords = [
        [261.63, 329.63, 392.00], // C
        [329.63, 392.00, 523.25], // Em
        [349.23, 440.00, 523.25], // F
        [392.00, 493.88, 587.33]  // G
      ];
      const now = this.ctx.currentTime;
      chords.forEach((chord, barIndex) => {
        chord.forEach((freq, noteIdx) => {
          const t = now + barIndex * 0.9 + noteIdx * 0.22;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 1.5, t);
          gain.gain.setValueAtTime(0.02, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.42);
        });
      });
      this.bgmTimer = setTimeout(playBar, 3600);
    };
    playBar();
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audio = new AudioManager();
