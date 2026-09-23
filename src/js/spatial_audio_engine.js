/**
 * PZHub - Spatial Audio & Acoustic DSP Engine (VICCS Broadcasting v1.2.0)
 * Motor Web Audio API de espacialização 3D, filtros de oclusão e reverberação procedural de ambientes.
 */

export class SpatialAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterCompressor = null;
    this.masterGain = null;

    // Configurações do jogador
    this.panMode = localStorage.getItem('viccs_spatial_pan_mode') || 'headphones'; // 'headphones' (HRTF) ou 'speakers' (EqualPower)
    this.reverbIntensity = parseFloat(localStorage.getItem('viccs_spatial_reverb_intensity') || '1.0');
    this.occlusionIntensity = parseFloat(localStorage.getItem('viccs_spatial_occl_intensity') || '1.0');

    // Barramentos de Reverberação Duplos para Crossfade Suave entre cômodos
    this.reverbBusA = null;
    this.reverbBusB = null;
    this.activeBusIndex = 'A';
    this.currentRoomClass = 'outdoor';
    this.reverbCrossfadeDuration = 0.5; // 500ms de crossfade entre salas

    // Cache de Respostas de Impulso (IR) geradas proceduralmente
    this.irCache = new Map();

    // Pool de canais acústicos por aparelho (máximo 8 emissores ativos)
    this.emitters = new Map();
    this.maxEmitters = 8;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('[VICCS Spatial] Web Audio API não suportada neste ambiente.');
        return null;
      }
      this.audioCtx = new AudioCtxClass();
      this.setupMasterGraph();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => { });
    }
    return this.audioCtx;
  }

  setupMasterGraph() {
    const ctx = this.audioCtx;

    // 1. Compressor/Limitador no Master para somar múltiplos rádios sem distorção digital
    this.masterCompressor = ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-3, ctx.currentTime);
    this.masterCompressor.knee.setValueAtTime(6, ctx.currentTime);
    this.masterCompressor.ratio.setValueAtTime(12, ctx.currentTime);
    this.masterCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
    this.masterCompressor.release.setValueAtTime(0.15, ctx.currentTime);

    // 2. Ganho Master
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

    this.masterCompressor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // 3. Inicializa Barramentos de Reverb
    this.reverbBusA = this.createReverbBus();
    this.reverbBusB = this.createReverbBus();
    this.reverbBusA.gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
    this.reverbBusB.gainNode.gain.setValueAtTime(0.0, ctx.currentTime);

    this.updateRoomReverb('outdoor', true);
  }

  createReverbBus() {
    const ctx = this.audioCtx;
    const convolver = ctx.createConvolver();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(8000, ctx.currentTime);

    convolver.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterCompressor);

    return { convolver, filter, gainNode };
  }

  /**
   * Gera uma Resposta de Impulso (Impulse Response - IR) de Reverberação Estéreo
   * Utiliza modelo matemático baseado na fórmula de Sabine: Ruído branco com decaimento exponencial
   */
  generateImpulseResponse(rt60, preDelayMs = 10, damping = 0.5) {
    const ctx = this.audioCtx;
    const cacheKey = `${rt60}_${preDelayMs}_${damping}`;
    if (this.irCache.has(cacheKey)) {
      return this.irCache.get(cacheKey);
    }

    const sampleRate = ctx.sampleRate;
    const length = Math.max(sampleRate * 0.1, Math.floor(sampleRate * rt60));
    const preDelaySamples = Math.floor((preDelayMs / 1000) * sampleRate);
    const impulseBuffer = ctx.createBuffer(2, length, sampleRate);

    const left = impulseBuffer.getChannelData(0);
    const right = impulseBuffer.getChannelData(1);

    // Decaimento RT60 = tempo para cair 60 dB (fator 0.001) -> ln(0.001) ≈ -6.9077
    const decayConst = 6.9077 / (rt60 * sampleRate);

    for (let i = 0; i < length; i++) {
      if (i < preDelaySamples) {
        left[i] = 0;
        right[i] = 0;
      } else {
        const t = i - preDelaySamples;
        const envelope = Math.exp(-decayConst * t);
        // Ruído branco estéreo com leve descorrelação de canal
        const noiseL = (Math.random() * 2 - 1);
        const noiseR = (Math.random() * 2 - 1);

        left[i] = noiseL * envelope;
        right[i] = noiseR * envelope;
      }
    }

    this.irCache.set(cacheKey, impulseBuffer);
    return impulseBuffer;
  }

  getRoomPreset(roomClass) {
    switch (roomClass) {
      case 'vehicle_cabin': return { rt60: 0.18, preDelay: 3, damping: 3200 };
      case 'small': return { rt60: 0.35, preDelay: 5, damping: 4000 };
      case 'medium': return { rt60: 0.75, preDelay: 10, damping: 5500 };
      case 'large': return { rt60: 1.60, preDelay: 20, damping: 7000 };
      case 'industrial': return { rt60: 2.20, preDelay: 25, damping: 6000 };
      case 'outdoor':
      default: return { rt60: 0.08, preDelay: 0, damping: 2500 };
    }
  }

  updateRoomReverb(newRoomClass, instant = false) {
    if (!this.audioCtx) return;
    if (this.currentRoomClass === newRoomClass && !instant) return;
    this.currentRoomClass = newRoomClass;

    const ctx = this.audioCtx;
    const preset = this.getRoomPreset(newRoomClass);
    const irBuffer = this.generateImpulseResponse(preset.rt60, preset.preDelay);

    const now = ctx.currentTime;
    const fadeTime = instant ? 0.01 : this.reverbCrossfadeDuration;

    if (this.activeBusIndex === 'A') {
      // Alterna para Bus B
      this.reverbBusB.convolver.buffer = irBuffer;
      this.reverbBusB.filter.frequency.setTargetAtTime(preset.damping, now, 0.05);
      this.reverbBusB.gainNode.gain.setTargetAtTime(1.0 * this.reverbIntensity, now, fadeTime / 2);
      this.reverbBusA.gainNode.gain.setTargetAtTime(0.0, now, fadeTime / 2);
      this.activeBusIndex = 'B';
    } else {
      // Alterna para Bus A
      this.reverbBusA.convolver.buffer = irBuffer;
      this.reverbBusA.filter.frequency.setTargetAtTime(preset.damping, now, 0.05);
      this.reverbBusA.gainNode.gain.setTargetAtTime(1.0 * this.reverbIntensity, now, fadeTime / 2);
      this.reverbBusB.gainNode.gain.setTargetAtTime(0.0, now, fadeTime / 2);
      this.activeBusIndex = 'A';
    }
  }

  getActiveReverbInput() {
    return (this.activeBusIndex === 'A') ? this.reverbBusA.convolver : this.reverbBusB.convolver;
  }

  /**
   * Cria ou recupera o canal de processamento de um emissor específico
   */
  getOrCreateEmitter(deviceId) {
    this.ensureContext();
    const ctx = this.audioCtx;

    if (this.emitters.has(deviceId)) {
      return this.emitters.get(deviceId);
    }

    // 1. Filtro Passa-Baixa (LowPass) para Simulação de Oclusão
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(20000, ctx.currentTime);
    filter.Q.setValueAtTime(0.707, ctx.currentTime);

    // 2. Nó de Ganho Direto (Dry)
    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(1.0, ctx.currentTime);

    // 3. Panner Estéreo / 3D
    let panner = null;
    if (this.panMode === 'headphones' && ctx.createPanner) {
      panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 35;
      panner.rolloffFactor = 1;
    } else if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(0, ctx.currentTime);
    } else {
      panner = ctx.createGain();
    }

    // 4. Nó de Envio para Reverberação (Wet Send)
    const reverbSend = ctx.createGain();
    reverbSend.gain.setValueAtTime(0.15, ctx.currentTime);

    // Conexões internas do canal do emissor
    filter.connect(dryGain);
    dryGain.connect(panner);
    panner.connect(this.masterCompressor);

    // Envio Wet para o barramento de reverberação ativo
    dryGain.connect(reverbSend);
    reverbSend.connect(this.getActiveReverbInput());

    const emitterChannel = {
      deviceId,
      filter,
      dryGain,
      panner,
      reverbSend,
      lastVolume: 1.0,
      active: true
    };

    this.emitters.set(deviceId, emitterChannel);
    return emitterChannel;
  }

  /**
   * Conecta uma fonte de áudio nativa (ex: HTMLAudioElement) diretamente ao canal DSP do emissor
   */
  connectSource(deviceId, sourceNode) {
    const channel = this.getOrCreateEmitter(deviceId);
    if (channel && channel.filter && sourceNode) {
      try {
        sourceNode.connect(channel.filter);
      } catch (err) {
        console.warn('[VICCS Spatial] Falha ao conectar sourceNode ao filtro:', err);
      }
    }
  }

  /**
   * Atualiza a acústica do emissor a partir da telemetria v2 vinda do Zomboid
   */
  updateAcoustics(deviceData, listenerData) {
    if (!deviceData) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const channel = this.getOrCreateEmitter(deviceData.deviceId);

    // 1. Atualiza sala do jogador e do emissor
    if (listenerData && listenerData.roomClass) {
      this.updateRoomReverb(listenerData.roomClass);
    }

    // 2. Cálculo do Filtro Passa-Baixa de Oclusão (Cutoff Frequency)
    let cutoff = 20000;
    const occl = deviceData.occl || {};

    if (deviceData.deviceType === 'CDPLAYER') {
      // Fone de ouvido: resposta de frequência pura
      cutoff = 20000;
    } else {
      // Absorção do ar pela distância: 20 kHz -> 8 kHz no alcance máximo
      const dist = deviceData.distance || 0;
      const airAbsorption = Math.max(8000, 20000 - (dist * 350));
      cutoff = Math.min(cutoff, airAbsorption);

      // Barreiras físicas sólidas (Paredes, Portas e Janelas)
      if (occl.exteriorWall) {
        cutoff = Math.min(cutoff, 650);
      } else if (occl.interiorWall) {
        cutoff = Math.min(cutoff, 1200);
      }

      if (occl.walls >= 3) {
        cutoff = Math.min(cutoff, 450);
      } else if (occl.walls === 2) {
        cutoff = Math.min(cutoff, 800);
      } else if (occl.walls === 1 && !occl.exteriorWall && !occl.interiorWall) {
        cutoff = Math.min(cutoff, 2200);
      }

      if (occl.doors > 0) {
        cutoff = Math.min(cutoff, 1800);
      }
      if (occl.windows > 0) {
        cutoff = Math.min(cutoff, 5000);
      }
      if (occl.floors > 0) {
        cutoff = Math.min(cutoff, 600);
      }
      if (occl.vehicleEnclosure) {
        cutoff = Math.min(cutoff, 1100);
      }

      // Aplica a intensidade da Sandbox do usuário
      if (this.occlusionIntensity < 1.0) {
        cutoff = cutoff + (20000 - cutoff) * (1.0 - this.occlusionIntensity);
      }
    }

    channel.filter.frequency.setTargetAtTime(Math.max(300, cutoff), now, 0.08);

    // 3. Ajuste de Panning Estéreo / Eixos Isométricos
    const panVal = Math.max(-1.0, Math.min(1.0, deviceData.pan || 0));
    if (channel.panner.pan && channel.panner.pan.setTargetAtTime) {
      channel.panner.pan.setTargetAtTime(panVal, now, 0.05);
    } else if (channel.panner.positionX && channel.panner.positionX.setTargetAtTime) {
      // Modelo HRTF 3D PannerNode usando projeção da tela isométrica
      const sx = (deviceData.screenX || 0) * 0.1;
      const sy = (deviceData.screenY || 0) * 0.1;
      channel.panner.positionX.setTargetAtTime(sx, now, 0.05);
      channel.panner.positionY.setTargetAtTime(0, now, 0.05);
      channel.panner.positionZ.setTargetAtTime(sy, now, 0.05);
    }

    // 4. Ganho e Relação Wet/Dry
    const targetVol = Math.max(0.0, Math.min(1.0, deviceData.volume || 0));
    channel.dryGain.gain.setTargetAtTime(targetVol, now, 0.06);

    // Distância Crítica de Reverb: quanto mais longe, mais eco relativo é percebido
    const maxDist = 35.0;
    const distRatio = Math.min(1.0, (deviceData.distance || 0) / maxDist);
    let wetRatio = 0.02;
    if (listenerData && listenerData.roomClass === 'vehicle_cabin') {
      wetRatio = 0.12;
    } else if (listenerData && listenerData.outdoor) {
      wetRatio = 0.02;
    } else {
      wetRatio = 0.10 + 0.45 * distRatio;
    }
    channel.reverbSend.gain.setTargetAtTime(wetRatio * this.reverbIntensity, now, 0.1);
  }

  removeEmitter(deviceId) {
    if (!this.emitters.has(deviceId)) return;
    const channel = this.emitters.get(deviceId);
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      channel.dryGain.gain.setTargetAtTime(0.0, now, 0.1);
      setTimeout(() => {
        try {
          channel.filter.disconnect();
          channel.dryGain.disconnect();
          channel.panner.disconnect();
          channel.reverbSend.disconnect();
        } catch (_) { }
        this.emitters.delete(deviceId);
      }, 150);
    } else {
      this.emitters.delete(deviceId);
    }
  }

  clearAll() {
    for (const [id] of this.emitters) {
      this.removeEmitter(id);
    }
  }
}
