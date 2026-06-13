// ============================================
// SOUND.JS — Sound Effects using Web Audio API
// ============================================

import { store } from '../store.js';

class SoundService {
  constructor() {
    this.ctx = null;
  }

  _initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _shouldPlay() {
    // Enable sound effects by default if not set
    const soundSetting = store.get('settings.soundEffects');
    if (soundSetting === undefined) {
      store.set('settings.soundEffects', true);
      return true;
    }
    return soundSetting === true;
  }

  playTick(frequency = 400, duration = 0.05, type = 'sine', volume = 0.15) {
    if (!this._shouldPlay()) return;
    try {
      this._initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // fail silent
    }
  }

  playCompare() {
    // Low, short sine wave beep
    this.playTick(320, 0.08, 'sine', 0.18);
  }

  playSwap() {
    // Sliding frequency chime (frequency goes up quickly)
    if (!this._shouldPlay()) return;
    try {
      this._initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.20, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playSuccess() {
    // Arpeggio / ascending C-major chime
    if (!this._shouldPlay()) return;
    try {
      this._initContext();
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.35);
      });
    } catch (e) {}
  }

  playStep() {
    this.playTick(550, 0.04, 'sine', 0.12);
  }

  playClick() {
    this.playTick(650, 0.03, 'sine', 0.15);
  }
}

export const sound = new SoundService();
