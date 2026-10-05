// Soundbox chime & Punjabi Voice Synthesizer using Web Audio API and SpeechSynthesis

class AudioManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a pleasant double-tone payment confirmation chime
  playPaymentChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note 1 (High bell C6: 1046.5 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2 (Major third higher E6: 1318.5 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio chime unsupported or blocked:', e);
    }
  }

  // Play alert chime for FIRMS satellite anomaly
  playAlertChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Speak soundbox confirmation in Hindi or Punjabi
  speakSoundboxPayout(amount: number, farmerName: string) {
    this.playPaymentChime();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop prior audio
      const utteranceText = `Demo mein Nirdhoom clearance ke liye ${farmerName} ka ${amount} rupaye ka simulated settlement event dikhaya ja raha hai. Koi asli payment nahi hui.`;
      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      
      // Look for Hindi / Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('pa') || v.lang.includes('en-IN'));
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
      
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 350);
    }
  }

  // Play Punjabi Voice Note for Farmer Telegram interface
  speakPunjabiVoiceNote(text: string, onEnd?: () => void) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const regionalVoice = voices.find(v => v.lang.includes('pa') || v.lang.includes('hi') || v.lang.includes('en-IN'));
      if (regionalVoice) {
        utterance.voice = regionalVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      setTimeout(onEnd, 2000);
    }
  }

  stopAllSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioSynth = new AudioManager();
