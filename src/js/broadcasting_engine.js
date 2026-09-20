/**
 * PZHub - Broadcasting & Media Engine (VICCS Protocol)
 * Motor externo de reprodução de áudio e vídeo conectado ao mod in-game.
 * Mantém reprodução em segundo plano com suporte a janela flutuante PiP para televisões.
 */

export class BroadcastingEngine {
  constructor() {
    this.isTauri = typeof window.__TAURI__ !== 'undefined';
    this.isModInstalled = false;
    this.isEnabled = localStorage.getItem('viccs_broadcasting_enabled') === 'true';
    this.autoPipEnabled = localStorage.getItem('viccs_auto_pip') !== 'false'; // default true
    
    this.pollInterval = null;
    this.lastSeq = -1;
    this.lastDataTime = 0;
    this.currentPlayingDevice = null;
    this.currentVideoId = null;

    // Canal de comunicação inter-janelas para a janela PiP
    this.broadcastBus = new BroadcastChannel('viccs_broadcasting_bus');

    // YouTube Player em Segundo Plano
    this.ytPlayer = null;
    this.isYtReady = false;
  }

  async init() {
    this.setupDOM();
    this.initYouTubeAPI();
    await this.checkModStatus();
    this.bindEvents();

    if (this.isEnabled && this.isModInstalled) {
      this.startEngine();
    } else {
      this.updateStatusBadge(false);
    }

    return this;
  }

  setupDOM() {
    // Injeta o container invisível para o player de áudio do YouTube
    if (!document.getElementById('viccs-yt-audio-container')) {
      const audioContainer = document.createElement('div');
      audioContainer.id = 'viccs-yt-audio-container';
      audioContainer.style.cssText = 'position: absolute; bottom: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0.01; pointer-events: none;';
      audioContainer.innerHTML = '<div id="viccs-hidden-yt-node"></div>';
      document.body.appendChild(audioContainer);
    }
  }

  initYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    // Carrega script da API do YouTube se ainda não existir
    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  createPlayer() {
    try {
      this.ytPlayer = new window.YT.Player('viccs-hidden-yt-node', {
        height: '100',
        width: '100',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            this.isYtReady = true;
          },
          onError: (e) => {
            console.warn('[VICCS Broadcasting] Erro no player do YouTube:', e.data);
          }
        }
      });
    } catch (err) {
      console.warn('[VICCS Broadcasting] Falha ao instanciar YouTube Player:', err);
    }
  }

  async checkModStatus() {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        this.isModInstalled = await window.__TAURI__.core.invoke('check_broadcasting_installed');
      } catch (err) {
        console.error('[VICCS] Erro ao verificar instalação do mod:', err);
        this.isModInstalled = false;
      }
    } else {
      // Simulação em ambiente navegador
      this.isModInstalled = true;
    }

    this.renderModStatusUI();
  }

  renderModStatusUI() {
    const card = document.getElementById('broadcasting-mod-status-card');
    const badge = document.getElementById('broadcasting-mod-detected-badge');
    const toggle = document.getElementById('broadcasting-master-toggle');
    const desc = document.getElementById('broadcasting-toggle-desc');
    const actionBtn = document.getElementById('btn-broadcasting-action');

    if (!card || !toggle) return;

    if (this.isModInstalled) {
      badge.className = 'tactical-badge badge-success';
      badge.innerHTML = '<span class="status-dot"></span> MOD DETECTADO: VICCS_Broadcasting';
      toggle.disabled = false;
      toggle.checked = this.isEnabled;
      desc.textContent = this.isEnabled 
        ? 'Motor em execução. O áudio e vídeo tocam em segundo plano conforme acionados no jogo.'
        : 'Pronto para sincronizar. Ative o interruptor para conectar com o Project Zomboid.';
      if (actionBtn) actionBtn.style.display = 'none';
    } else {
      badge.className = 'tactical-badge badge-danger';
      badge.innerHTML = '<span class="status-dot"></span> MOD NÃO DETECTADO NO ZOMBOID';
      toggle.disabled = true;
      toggle.checked = false;
      desc.textContent = 'Instale o mod "VICCS Broadcasting" na sua pasta de mods do Zomboid para liberar o motor.';
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.textContent = 'ABRIR PASTA DE MODS';
      }
    }
  }

  bindEvents() {
    const toggle = document.getElementById('broadcasting-master-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        if (!this.isModInstalled) {
          e.target.checked = false;
          return;
        }
        this.setEnabled(e.target.checked);
      });
    }

    const autoPipToggle = document.getElementById('broadcasting-autopip-toggle');
    if (autoPipToggle) {
      autoPipToggle.checked = this.autoPipEnabled;
      autoPipToggle.addEventListener('change', (e) => {
        this.autoPipEnabled = e.target.checked;
        localStorage.setItem('viccs_auto_pip', this.autoPipEnabled);
      });
    }

    const btnTestPip = document.getElementById('btn-test-pip-window');
    if (btnTestPip) {
      btnTestPip.addEventListener('click', async () => {
        if (this.isTauri && window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('set_pip_window_visible', { visible: true });
        }
      });
    }

    const btnAction = document.getElementById('btn-broadcasting-action');
    if (btnAction) {
      btnAction.addEventListener('click', async () => {
        if (this.isTauri && window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('open_zomboid_mods_dir');
        }
      });
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('viccs_broadcasting_enabled', enabled);

    if (enabled) {
      this.startEngine();
      this.showWelcomeModal();
    } else {
      this.stopEngine();
    }

    this.renderModStatusUI();
  }

  showWelcomeModal() {
    const modal = document.getElementById('broadcasting-confirm-modal');
    if (modal) {
      modal.classList.add('active');
      const closeBtn = document.getElementById('btn-close-broadcasting-modal');
      if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
      }
    }
  }

  startEngine() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.pollGameState(), 350);
    this.updateStatusBadge(true);
  }

  stopEngine() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.ytPlayer && this.isYtReady) {
      try { this.ytPlayer.stopVideo(); } catch (e) {}
    }

    this.currentPlayingDevice = null;
    this.currentVideoId = null;

    // Notifica PiP para parar
    this.broadcastBus.postMessage({ type: 'STOP_TV_STREAM' });
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      window.__TAURI__.core.invoke('set_pip_window_visible', { visible: false });
    }

    this.updateStatusBadge(false);
    this.clearTelemetryUI();
  }

  async pollGameState() {
    if (!this.isEnabled) return;

    let rawJson = null;

    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        rawJson = await window.__TAURI__.core.invoke('get_broadcasting_data');
      } catch (err) {
        console.warn('[VICCS] Falha ao ler broadcasting data:', err);
      }
    }

    if (!rawJson) return;

    try {
      const data = JSON.parse(rawJson);
      this.processGameData(data);
    } catch (e) {
      console.warn('[VICCS] JSON corrompido:', e);
    }
  }

  processGameData(data) {
    if (!data || !data.devices) return;

    this.lastDataTime = Date.now();
    this.lastSeq = data.seq || 0;

    const activeDevices = data.devices;

    if (activeDevices.length === 0) {
      // Nenhum dispositivo ligado
      if (this.currentPlayingDevice) {
        this.stopCurrentMedia();
      }
      this.clearTelemetryUI();
      return;
    }

    // Seleciona o dispositivo mais audível (maior volume espacial)
    activeDevices.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    const primeDev = activeDevices[0];

    this.handlePlayback(primeDev);
    this.updateTelemetryUI(primeDev, activeDevices.length);
  }

  extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:v=|\/embed\/|youtu\.be\/|v\/|watch\?v=|\&v=)([^#\&\?]+)/;
    const match = url.match(regExp);
    return (match && match[1] && match[1].length === 11) ? match[1] : null;
  }

  handlePlayback(device) {
    if (!device || !device.url) return;

    const videoId = this.extractYouTubeId(device.url);
    if (!videoId) return;

    const currentTimestamp = Date.now() / 1000;
    const startedAt = device.startedAt || currentTimestamp;
    const offsetSeconds = Math.max(0, currentTimestamp - startedAt);
    const targetVolume = Math.min(100, Math.max(0, Math.round((device.volume || 0.7) * 100)));

    // 1. Áudio em Segundo Plano
    if (this.ytPlayer && this.isYtReady) {
      try {
        if (this.currentVideoId !== videoId) {
          this.currentVideoId = videoId;
          this.ytPlayer.loadVideoById({
            videoId: videoId,
            startSeconds: Math.floor(offsetSeconds)
          });
          this.ytPlayer.setVolume(targetVolume);
        } else {
          // Ajusta volume espacial dinâmico
          this.ytPlayer.setVolume(targetVolume);

          // Verifica dessincronização maior que 3.5 segundos
          const playerTime = this.ytPlayer.getCurrentTime ? this.ytPlayer.getCurrentTime() : 0;
          if (Math.abs(playerTime - offsetSeconds) > 3.5) {
            this.ytPlayer.seekTo(offsetSeconds, true);
          }
        }
      } catch (err) {
        console.warn('[VICCS] Erro no YT Player:', err);
      }
    }

    // 2. Janela Flutuante PiP para Televisores
    if (device.deviceType === 'TELEVISION') {
      this.broadcastBus.postMessage({
        type: 'SYNC_TV_STREAM',
        url: device.url,
        offsetSeconds: offsetSeconds,
        volume: targetVolume,
        isMuted: true // O áudio é tocado centralizadamente pelo PZHub
      });

      if (this.autoPipEnabled && this.isTauri && window.__TAURI__?.core?.invoke) {
        window.__TAURI__.core.invoke('set_pip_window_visible', { visible: true });
      }
    } else {
      // Se for RÁDIO, fecha a janela de vídeo flutuante
      this.broadcastBus.postMessage({ type: 'STOP_TV_STREAM' });
      if (this.isTauri && window.__TAURI__?.core?.invoke) {
        window.__TAURI__.core.invoke('set_pip_window_visible', { visible: false });
      }
    }

    this.currentPlayingDevice = device;
  }

  stopCurrentMedia() {
    if (this.ytPlayer && this.isYtReady) {
      try { this.ytPlayer.stopVideo(); } catch (e) {}
    }
    this.currentPlayingDevice = null;
    this.currentVideoId = null;

    this.broadcastBus.postMessage({ type: 'STOP_TV_STREAM' });
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      window.__TAURI__.core.invoke('set_pip_window_visible', { visible: false });
    }
  }

  updateStatusBadge(active) {
    const badge = document.getElementById('broadcasting-engine-status-badge');
    if (!badge) return;

    if (active) {
      badge.className = 'tactical-badge badge-success';
      badge.innerHTML = '<span class="status-dot"></span> MOTOR ATIVO // ESCUTANDO';
    } else {
      badge.className = 'tactical-badge badge-muted';
      badge.innerHTML = '<span class="status-dot"></span> MOTOR DESLIGADO';
    }
  }

  updateTelemetryUI(device, totalDevices) {
    const bridgeState = document.getElementById('telemetry-bridge-status');
    const deviceTypeEl = document.getElementById('telemetry-device-type');
    const devCoordsEl = document.getElementById('telemetry-device-coords');
    const devUrlEl = document.getElementById('telemetry-device-url');
    const volBarEl = document.getElementById('telemetry-volume-bar');
    const volTextEl = document.getElementById('telemetry-volume-text');

    if (bridgeState) {
      bridgeState.textContent = `CONECTADO (${totalDevices} APARELHOS)`;
      bridgeState.style.color = 'var(--accent-green)';
    }

    if (deviceTypeEl) {
      deviceTypeEl.textContent = device.deviceType === 'TELEVISION' 
        ? '📺 TELEVISÃO CRT (ÁUDIO + VÍDEO PiP)' 
        : '📻 RÁDIO PORTÁTIL / SOM (ÁUDIO 3D)';
    }

    if (devCoordsEl) {
      devCoordsEl.textContent = `X: ${device.deviceId || 'MUNDO'} | DISTÂNCIA: ${device.distance ? device.distance.toFixed(1) + 'm' : '1.0m'}`;
    }

    if (devUrlEl) {
      devUrlEl.textContent = device.url || 'STREAM ATIVO';
    }

    const volPct = Math.round((device.volume || 0.7) * 100);
    if (volBarEl) volBarEl.style.width = `${volPct}%`;
    if (volTextEl) volTextEl.textContent = `${volPct}%`;
  }

  clearTelemetryUI() {
    const bridgeState = document.getElementById('telemetry-bridge-status');
    const deviceTypeEl = document.getElementById('telemetry-device-type');
    const devCoordsEl = document.getElementById('telemetry-device-coords');
    const devUrlEl = document.getElementById('telemetry-device-url');
    const volBarEl = document.getElementById('telemetry-volume-bar');
    const volTextEl = document.getElementById('telemetry-volume-text');

    if (bridgeState) {
      bridgeState.textContent = 'STANDBY // AGUARDANDO APARELHO IN-GAME';
      bridgeState.style.color = 'var(--accent-amber)';
    }

    if (deviceTypeEl) deviceTypeEl.textContent = 'NENHUM APARELHO EM REPRODUÇÃO';
    if (devCoordsEl) devCoordsEl.textContent = 'X: -- | Y: -- | Z: --';
    if (devUrlEl) devUrlEl.textContent = 'NENHUM STREAM';
    if (volBarEl) volBarEl.style.width = '0%';
    if (volTextEl) volTextEl.textContent = '0%';
  }
}
