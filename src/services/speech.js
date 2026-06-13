// ============================================
// SPEECH.JS — Text-to-Speech using Web Speech API
// ============================================

import { store } from '../store.js';

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this._voice = null;
    this._rate = 0.92;
    this._pitch = 0.96;
    this._onStateChange = null;
    this._elevenAudio = null;
  }

  /** Get available voices, preferring English ones */
  getVoices() {
    return this.synth.getVoices();
  }

  getEnglishVoices() {
    return this.getVoices().filter(v => v.lang.startsWith('en'));
  }

  /** Pick the best default voice */
  _pickVoice() {
    if (this._voice) return this._voice;
    const voices = this.getVoices();
    
    // 1. Filter to Indian (English and Hindi) voices
    const indianVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('en-in') || 
        lang.startsWith('en_in') || 
        lang.startsWith('hi-in') || 
        lang.startsWith('hi_in') || 
        name.includes('india') || 
        name.includes('indian') || 
        name.includes('hindi')
      );
    });

    const maleNames = ['ravi', 'rishi', 'prabhat', 'madhur', 'dilip', 'harsh', 'vijay', 'anil', 'male'];
    const femaleNames = ['heera', 'veena', 'neerja', 'ananya', 'zira', 'samantha', 'kavya', 'swara', 'aditi', 'female'];

    const isMaleVoice = (v) => {
      const nameLower = v.name.toLowerCase();
      if (femaleNames.some(f => nameLower.includes(f))) return false;
      if (maleNames.some(m => nameLower.includes(m))) return true;
      return false;
    };

    if (indianVoices.length > 0) {
      // Find all Indian male voices
      const indianMaleVoices = indianVoices.filter(isMaleVoice);

      if (indianMaleVoices.length > 0) {
        // Prioritize Neural / Natural voices (Edge Neural voices sound amazing)
        const neural = indianMaleVoices.find(v => v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('natural'));
        if (neural) return neural;
        
        // Prioritize Microsoft Ravi, Apple Rishi, Microsoft Madhur
        const preferred = indianMaleVoices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('ravi') || n.includes('rishi') || n.includes('madhur');
        });
        if (preferred) return preferred;

        // Fallback to any Indian male voice
        return indianMaleVoices[0];
      }

      // If no explicit Indian male voice, try to find any Indian voice that is not explicitly female
      const nonFemaleIndian = indianVoices.filter(v => {
        const nameLower = v.name.toLowerCase();
        return !femaleNames.some(f => nameLower.includes(f));
      });
      if (nonFemaleIndian.length > 0) {
        return nonFemaleIndian[0];
      }

      // Fallback to any Indian voice
      return indianVoices[0];
    }
    
    // 2. Fallback to general English voices
    const engVoices = this.getEnglishVoices();
    const engMaleVoices = engVoices.filter(isMaleVoice);

    if (engMaleVoices.length > 0) {
      const engMaleNeural = engMaleVoices.find(v => v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('natural'));
      if (engMaleNeural) return engMaleNeural;
      return engMaleVoices[0];
    }

    const preferredFallbacks = ['Google UK English Male', 'Daniel', 'David', 'Google US English'];
    for (const name of preferredFallbacks) {
      const found = engVoices.find(v => v.name.includes(name));
      if (found) return found;
    }

    return engVoices[0] || voices[0] || null;
  }

  setVoice(voice) { this._voice = voice; }
  setRate(rate) { this._rate = Math.max(0.5, Math.min(2.0, rate)); }
  setPitch(pitch) { this._pitch = Math.max(0.5, Math.min(2.0, pitch)); }
  onStateChange(cb) { this._onStateChange = cb; }

  _notify() { if (this._onStateChange) this._onStateChange({ speaking: this.isSpeaking, paused: this.isPaused }); }

  /** Strip markdown/HTML from text for cleaner speech */
  _cleanText(text) {
    let t = text;
    
    // Replace code variables/arrays to sound like natural speech
    t = t.replace(/arr\[([^\]]+)\]/g, 'array element at $1');
    t = t.replace(/newNode\.next/g, "new node's next pointer");
    t = t.replace(/curr\.next/g, "current node's next pointer");
    t = t.replace(/prev\.next/g, "previous node's next pointer");
    t = t.replace(/\bcurr\b/g, 'current');
    t = t.replace(/\bprev\b/g, 'previous');
    
    // Operators
    t = t.replace(/==/g, ' is equal to ');
    t = t.replace(/!=/g, ' is not equal to ');
    t = t.replace(/<=/g, ' is less than or equal to ');
    t = t.replace(/>=/g, ' is greater than or equal to ');
    t = t.replace(/</g, ' is less than ');
    t = t.replace(/>/g, ' is greater than ');
    t = t.replace(/&&/g, ' and ');
    t = t.replace(/\|\|/g, ' or ');

    return t
      .replace(/```[\s\S]*?```/g, ' (code block) ')      // code blocks
      .replace(/`([^`]+)`/g, '$1')                         // inline code
      .replace(/\*\*(.+?)\*\*/g, '$1')                     // bold
      .replace(/\*(.+?)\*/g, '$1')                         // italic
      .replace(/#{1,6}\s/g, '')                             // headings
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')            // links
      .replace(/<[^>]+>/g, '')                              // HTML tags
      .replace(/[-•]\s/g, '')                               // bullets
      .replace(/\n{2,}/g, '. ')                             // paragraph breaks → pause
      .replace(/\n/g, ' ')                                  // newlines
      .replace(/\s{2,}/g, ' ')                              // collapse whitespace
      .replace(/O\(([^)]+)\)/g, 'O of $1')                 // complexity notation
      .trim();
  }

  /** Speak text. Returns a promise that resolves when done. */
  speak(text) {
    const elevenKey = store.get('settings.elevenLabsKey');
    const elevenVoiceId = store.get('settings.elevenLabsVoiceId') || 'BTNeCNdXniCSbjEac5vd';
    
    if (elevenKey) {
      return this._speakElevenLabs(text, elevenKey, elevenVoiceId)
        .catch(err => {
          console.warn('ElevenLabs failed, falling back to Web Speech API:', err);
          return this._speakWebSpeech(text);
        });
    }

    return this._speakWebSpeech(text);
  }

  _speakWebSpeech(text) {
    return new Promise((resolve, reject) => {
      if (!this.synth) { reject(new Error('Speech synthesis not supported')); return; }

      this.stop(); // Stop any current speech

      const cleaned = this._cleanText(text);
      if (!cleaned) { resolve(); return; }

      // Chrome has a bug where long utterances cut off. Split into chunks.
      const chunks = this._splitIntoChunks(cleaned, 180);
      let currentChunk = 0;

      const speakNext = () => {
        if (currentChunk >= chunks.length) {
          this.isSpeaking = false;
          this.isPaused = false;
          this.currentUtterance = null;
          this._notify();
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
        const voice = this._pickVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = this._rate;
        utterance.pitch = this._pitch;
        utterance.volume = 1.0;

        utterance.onend = () => { currentChunk++; speakNext(); };
        utterance.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') { resolve(); return; }
          this.isSpeaking = false; this._notify(); reject(e);
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      };

      this.isSpeaking = true;
      this.isPaused = false;
      this._notify();
      speakNext();
    });
  }

  async _speakElevenLabs(text, apiKey, voiceId) {
    this.stop();
    
    this.isSpeaking = true;
    this.isPaused = false;
    this._notify();
    
    try {
      const cleaned = this._cleanText(text);
      if (!cleaned) {
        this.isSpeaking = false;
        this._notify();
        return;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: cleaned,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail?.message || 'ElevenLabs API Error');
      }
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      this._elevenAudio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        this._elevenAudio.onended = () => {
          this.isSpeaking = false;
          this._notify();
          resolve();
        };
        this._elevenAudio.onerror = (e) => {
          this.isSpeaking = false;
          this._notify();
          reject(e);
        };
        this._elevenAudio.play().catch(reject);
      });
    } catch (e) {
      console.error('ElevenLabs TTS Error:', e);
      this.isSpeaking = false;
      this._notify();
      throw e;
    }
  }

  /** Split text into sentence-bounded chunks under maxLen characters */
  _splitIntoChunks(text, maxLen = 180) {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > maxLen && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  pause() {
    if (this._elevenAudio) {
      this._elevenAudio.pause();
      this.isPaused = true;
      this._notify();
      return;
    }
    if (this.isSpeaking && !this.isPaused) { this.synth.pause(); this.isPaused = true; this._notify(); }
  }

  resume() {
    if (this._elevenAudio && this.isPaused) {
      this._elevenAudio.play().catch(console.error);
      this.isPaused = false;
      this._notify();
      return;
    }
    if (this.isPaused) { this.synth.resume(); this.isPaused = false; this._notify(); }
  }

  stop() {
    if (this._elevenAudio) {
      this._elevenAudio.pause();
      this._elevenAudio = null;
    }
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this._notify();
  }

  toggle(text) {
    if (this.isSpeaking && !this.isPaused) { this.pause(); return 'paused'; }
    if (this.isPaused) { this.resume(); return 'speaking'; }
    this.speak(text); return 'speaking';
  }

  get supported() { return !!this.synth || !!store.get('settings.elevenLabsKey'); }
}

export const speech = new SpeechService();

// Voices load async in some browsers
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
