/**
 * PZHub - Tactical UI Sound Effects Engine (Web Audio API)
 * Gera efeitos sonoros táteis, sutis e aveludados para micro-interações da interface.
 * Zero dependências externas, zero latência, economia de bateria e persistência de mute.
 */

class UISoundManager {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('pzhub_sound_muted') === 'true';
    this.lastHoverTime = 0;
    this.hoverThrottleMs = 45; // Evita metralhadora de áudio em passadas rápidas
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = !!muted;
    localStorage.setItem('pzhub_sound_muted', this.muted);
    window.dispatchEvent(new CustomEvent('pzhub-sound-mute-changed', { detail: { muted: this.muted } }));
    if (!this.muted) {
      this.playClick();
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Som de Hover: Toque acústico aveludado ultra-sutil (transiente suave)
   */
  playHover() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastHoverTime < this.hoverThrottleMs) return;
    this.lastHoverTime = now;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Filtro passa-baixa para tirar qualquer som estridente/agudo
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.025);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.02);

      // Volume extremamente sutil (0.025) com queda exponencial rápida
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch (_) {}
  }

  /**
   * Som de Clique: Micro-switch mecânico tátil aveludado (dois transientes curtos)
   */
  playClick() {
    if (this.muted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;

      // 1. Componente de transiente rápido (o 'tick' tátil)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, t);
      osc1.frequency.exponentialRampToValueAtTime(380, t + 0.018);

      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(0.055, t + 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(t);
      osc1.stop(t + 0.025);

      // 2. Micro-ressonância de corpo (o corpo do botão de acrílico)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(420, t + 0.003);
      osc2.frequency.exponentialRampToValueAtTime(220, t + 0.035);

      gain2.gain.setValueAtTime(0.0001, t + 0.003);
      gain2.gain.linearRampToValueAtTime(0.04, t + 0.006);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(t + 0.003);
      osc2.stop(t + 0.042);
    } catch (_) {}
  }

  /**
   * Som de Transição de View / Sucesso de Ação
   */
  playSwitch() {
    if (this.muted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(840, t + 0.04);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (_) {}
  }
}

export const soundFx = new UISoundManager();
window.soundFx = soundFx;
