/**
 * PZHub - Tactical Live Radar & Operations Suite
 * Módulo de Auto-Atualização em Tempo Real (Tarkov UI + Native Rust Downloader)
 */

import { parseMarkdown } from './markdown_parser.js';

export const CURRENT_APP_VERSION = '2.2.0';

// Endpoint padrão do manifesto oficial no GitHub Raw
export const DEFAULT_UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/pauloviccs/PZHub/master/latest.json';

// Estado em memória da última verificação executada
let lastUpdateCheckState = null;

try {
  const cached = localStorage.getItem('pzhub_last_update_check');
  if (cached) {
    lastUpdateCheckState = JSON.parse(cached);
    if (typeof window !== 'undefined') {
      window.__PZHUB_LAST_UPDATE_CHECK__ = lastUpdateCheckState;
    }
  }
} catch (_) {}

/**
 * Retorna os detalhes da última verificação de atualização executada
 */
export function getLastUpdateCheck() {
  if (lastUpdateCheckState) return lastUpdateCheckState;
  try {
    const cached = localStorage.getItem('pzhub_last_update_check');
    if (cached) {
      lastUpdateCheckState = JSON.parse(cached);
      return lastUpdateCheckState;
    }
  } catch (_) {}
  return null;
}

/**
 * Registra e persiste o status da verificação
 */
function recordUpdateCheck(result) {
  lastUpdateCheckState = result;
  if (typeof window !== 'undefined') {
    window.__PZHUB_LAST_UPDATE_CHECK__ = result;
  }
  try {
    localStorage.setItem('pzhub_last_update_check', JSON.stringify(result));
  } catch (_) {}
}

/**
 * Normaliza links de manifesto para garantir formato RAW direto
 */
export function normalizeManifestUrl(url) {
  if (!url) return DEFAULT_UPDATE_MANIFEST_URL;
  let clean = String(url).trim();

  // Suporte a links web do GitHub (github.com/.../blob/... -> raw.githubusercontent.com/.../...)
  if (clean.includes('github.com/') && clean.includes('/blob/')) {
    clean = clean
      .replace('github.com/', 'raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }

  // Suporte a fallback secundário para links normais do Pastebin
  if (clean.includes('pastebin.com/') && !clean.includes('pastebin.com/raw/')) {
    clean = clean.replace('pastebin.com/', 'pastebin.com/raw/');
  }

  return clean;
}

/**
 * Atualiza o indicador discreto de atualização na topbar
 */
export function updateTopbarIndicator({ status, error = null, version = null, manifest = null, isManualCheck = false }) {
  let badge = document.getElementById('topbar-updater-status');
  if (!badge) {
    const systemSection = document.querySelector('.nav-system-section');
    if (systemSection) {
      badge = document.createElement('div');
      badge.id = 'topbar-updater-status';
      badge.className = 'tarkov-stat-item updater-stat-item';
      badge.innerHTML = `
        <span class="stat-dot" id="updater-status-dot"></span>
        <span class="stat-val" id="updater-status-val">UPDATER</span>
      `;
      const aotBtn = document.getElementById('btn-global-always-on-top');
      if (aotBtn) {
        systemSection.insertBefore(badge, aotBtn);
      } else {
        systemSection.appendChild(badge);
      }
    }
  }

  if (!badge) return;

  const dot = badge.querySelector('#updater-status-dot');
  const val = badge.querySelector('#updater-status-val');

  badge.classList.remove('has-error', 'has-update', 'is-uptodate');

  if (status === 'error') {
    badge.style.display = 'inline-flex';
    badge.classList.add('has-error');
    if (dot) dot.className = 'stat-dot red';
    if (val) val.textContent = 'UPDATE: FALHA';
    badge.setAttribute(
      'title',
      `⚠️ Falha na verificação de atualização:\n${error || 'Erro de conexão'}\n\nClique para tentar verificar novamente.`
    );
    badge.onclick = () => checkForAppUpdates(null, true);

  } else if (status === 'update-available') {
    badge.style.display = 'inline-flex';
    badge.classList.add('has-update');
    if (dot) dot.className = 'stat-dot green';
    if (val) val.textContent = `UPDATE: v${version}`;
    badge.setAttribute(
      'title',
      `🚀 Nova versão do PZHub disponível: v${version}!\nClique para baixar e atualizar.`
    );
    badge.onclick = () => {
      if (manifest) showUpdateModal(manifest);
    };

  } else if (status === 'up-to-date') {
    badge.style.display = 'none';
    badge.setAttribute('title', `PZHub atualizado (v${CURRENT_APP_VERSION})`);
    badge.onclick = () => checkForAppUpdates(null, true);
  }
}

/**
 * Compara versões no padrão SemVer (ex: "2.1.0" > "2.0.0")
 */
export function isNewerVersion(remoteVersion, currentVersion) {
  if (!remoteVersion || !currentVersion) return false;
  const r = String(remoteVersion).replace(/^v/i, '').trim().split('.').map(n => parseInt(n, 10) || 0);
  const c = String(currentVersion).replace(/^v/i, '').trim().split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rPart = r[i] || 0;
    const cPart = c[i] || 0;
    if (rPart > cPart) return true;
    if (rPart < cPart) return false;
  }
  return false;
}

/**
 * Exibe notificação tática flutuante com animação suave no estilo Tarkov / Liquid Glass
 */
export function showTacticalToast({ title = null, message, type = 'info', duration = 4500, actionLabel = null, onAction = null }) {
  let container = document.getElementById('tactical-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tactical-toast-container';
    container.className = 'tactical-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `tactical-toast toast-${type}`;

  const iconMap = {
    success: `<svg class="toast-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    error: `<svg class="toast-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
    warning: `<svg class="toast-svg" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
    info: `<svg class="toast-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
  };

  const iconSvg = iconMap[type] || iconMap.info;

  toast.innerHTML = `
    <div class="toast-content-wrapper">
      <div class="toast-icon-box">${iconSvg}</div>
      <div class="toast-text-box">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-msg">${message}</div>
      </div>
      ${actionLabel ? `<button class="toast-action-btn">${actionLabel}</button>` : ''}
      <button class="toast-close-btn" title="Fechar">✕</button>
    </div>
    <div class="toast-timer-bar"><div class="toast-timer-progress"></div></div>
  `;

  container.appendChild(toast);

  // Gatilho suave de entrada
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  const closeToast = () => {
    toast.classList.remove('active');
    toast.classList.add('dismissing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 280);
  };

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) closeBtn.onclick = closeToast;

  if (actionLabel && onAction) {
    const actionBtn = toast.querySelector('.toast-action-btn');
    if (actionBtn) {
      actionBtn.onclick = () => {
        closeToast();
        onAction();
      };
    }
  }

  if (duration > 0) {
    const progressBar = toast.querySelector('.toast-timer-progress');
    if (progressBar) {
      progressBar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }
    setTimeout(closeToast, duration);
  }

  return toast;
}

/**
 * Exibe a Central Tática de Versão e Diagnóstico (Modal)
 */
export function showTacticalVersionModal({ status = 'uptodate', manifest = null, error = null, isChecking = false }) {
  const modal = document.getElementById('tactical-version-modal');
  if (!modal) return;

  const dot = document.getElementById('version-modal-dot');
  const kicker = document.getElementById('version-modal-kicker');
  const heroIcon = document.getElementById('version-hero-icon');
  const headline = document.getElementById('version-modal-headline');
  const desc = document.getElementById('version-modal-desc');
  const localVer = document.getElementById('version-info-local');
  const remoteVer = document.getElementById('version-info-remote');
  const channel = document.getElementById('version-info-channel');
  const dateEl = document.getElementById('version-info-date');
  const errorBox = document.getElementById('version-error-detail-box');
  const errorText = document.getElementById('version-error-detail-text');
  const btnRecheck = document.getElementById('btn-version-recheck');
  const btnConfirm = document.getElementById('btn-version-confirm');
  const btnClose = document.getElementById('version-modal-close');

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (localVer) localVer.textContent = `v${CURRENT_APP_VERSION}`;
  if (channel) channel.textContent = 'GitHub Raw (Oficial)';
  if (dateEl) dateEl.textContent = `Hoje às ${timeFormatted}`;

  if (heroIcon) heroIcon.className = 'version-hero-icon-container';

  if (isChecking) {
    if (dot) dot.className = 'stat-dot amber';
    if (kicker) kicker.textContent = 'CENTRAL DE ATUALIZAÇÕES // BUSCANDO...';
    if (heroIcon) {
      heroIcon.classList.add('is-checking');
      heroIcon.innerHTML = `
        <svg class="icon-spin-animated" viewBox="0 0 24 24" style="fill: var(--accent-cyan);"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
      `;
    }
    if (headline) headline.textContent = 'Consultando Satélites do GitHub...';
    if (desc) desc.textContent = 'Verificando manifesto remoto em busca de novas atualizações operacionais.';
    if (remoteVer) remoteVer.textContent = 'Verificando...';
    if (errorBox) errorBox.style.display = 'none';
    if (btnRecheck) {
      btnRecheck.disabled = true;
      btnRecheck.innerHTML = `
        <div class="tarkov-spinner" style="width: 11px; height: 11px; border-width: 2px;"></div>
        <span>BUSCANDO...</span>
      `;
    }
  } else if (status === 'error') {
    if (dot) dot.className = 'stat-dot red';
    if (kicker) kicker.textContent = 'CENTRAL DE ATUALIZAÇÕES // FALHA NA TRANSMISSÃO';
    if (heroIcon) {
      heroIcon.classList.add('is-error');
      heroIcon.innerHTML = `
        <svg viewBox="0 0 24 24" style="fill: var(--accent-red);"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      `;
    }
    if (headline) headline.textContent = 'Falha ao Verificar Atualização';
    if (desc) desc.textContent = 'Não foi possível confirmar o manifesto remoto. O aplicativo permanece 100% operacional no modo offline.';
    if (remoteVer) remoteVer.textContent = 'Indisponível (Offline)';
    if (errorBox) {
      errorBox.style.display = 'block';
      if (errorText) errorText.textContent = error || 'Erro de rede ou resposta inválida.';
    }
    if (btnRecheck) {
      btnRecheck.disabled = false;
      btnRecheck.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
        <span>TENTAR NOVAMENTE</span>
      `;
    }
  } else {
    // Up to date
    if (dot) dot.className = 'stat-dot green';
    if (kicker) kicker.textContent = 'CENTRAL DE ATUALIZAÇÕES // SISTEMA EM DIA';
    if (heroIcon) {
      heroIcon.innerHTML = `
        <svg viewBox="0 0 24 24" style="fill: var(--accent-emerald);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
      `;
    }
    if (headline) headline.textContent = 'PZHub está 100% Atualizado';
    if (desc) desc.textContent = 'Você já está rodando a versão oficial mais recente. Todos os subsistemas táticos estão sincronizados.';
    if (remoteVer) remoteVer.textContent = `v${manifest?.version || CURRENT_APP_VERSION}`;
    if (errorBox) errorBox.style.display = 'none';
    if (btnRecheck) {
      btnRecheck.disabled = false;
      btnRecheck.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
        <span>VERIFICAR NOVAMENTE</span>
      `;
    }
  }

  modal.classList.add('active');

  const closeModal = () => modal.classList.remove('active');
  if (btnClose) btnClose.onclick = closeModal;
  if (btnConfirm) btnConfirm.onclick = closeModal;
  if (btnRecheck) {
    btnRecheck.onclick = () => checkForAppUpdates(null, true);
  }
}

/**
 * Consulta o manifesto remoto e aciona o modal tático se houver nova versão
 */
export async function checkForAppUpdates(customUrl = null, isManualCheck = false) {
  let manifestUrl = customUrl || localStorage.getItem('pzhub_custom_update_url') || DEFAULT_UPDATE_MANIFEST_URL;
  manifestUrl = normalizeManifestUrl(manifestUrl);

  const hubBtn = document.getElementById('btn-hub-check-updates');
  const hubLabel = document.getElementById('hub-btn-update-label');

  // Se for checagem manual, dispara feedback animado imediato
  if (isManualCheck) {
    if (hubBtn) hubBtn.classList.add('is-checking');
    if (hubLabel) hubLabel.textContent = 'BUSCANDO...';
    showTacticalVersionModal({ isChecking: true });
    showTacticalToast({
      title: 'BUSCANDO ATUALIZAÇÕES',
      message: 'Consultando manifesto oficial no GitHub Raw...',
      type: 'info',
      duration: 2500
    });
  }

  let manifest = null;
  let nativeError = null;

  try {
    // Prioridade 1: Buscar via comando nativo Rust (100% imune a bloqueios de CORS do WebView)
    if (window.__TAURI__?.core?.invoke) {
      try {
        manifest = await window.__TAURI__.core.invoke('fetch_update_manifest', { manifestUrl });
      } catch (invokeErr) {
        nativeError = invokeErr;
        console.warn('[Updater] Falha no comando nativo de manifesto, tentando fallback fetch:', invokeErr);
      }
    }

    // Prioridade 2: Fallback via fetch padrão (para simulação no browser ou caso invoke falhe)
    if (!manifest) {
      try {
        let res = await fetch(manifestUrl, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json, text/plain, */*'
          }
        });

        // Auto-fallback inteligente entre branches master e main se uma retornar 404
        if (res.status === 404) {
          const altUrl = manifestUrl.includes('/main/') 
            ? manifestUrl.replace('/main/', '/master/') 
            : (manifestUrl.includes('/master/') ? manifestUrl.replace('/master/', '/main/') : null);
          if (altUrl) {
            try {
              const altRes = await fetch(altUrl, { cache: 'no-store', headers: { 'Accept': 'application/json, text/plain, */*' } });
              if (altRes.ok) {
                res = altRes;
                manifestUrl = altUrl;
              }
            } catch (_) {}
          }
        }

        if (!res.ok) {
          throw new Error(`Servidor de atualizações retornou HTTP ${res.status} (${res.statusText || 'Falha de requisição'})`);
        }

        const text = await res.text();
        try {
          manifest = JSON.parse(text);
        } catch (parseErr) {
          const preview = text.slice(0, 100).replace(/\s+/g, ' ');
          throw new Error(`JSON do manifesto inválido: ${parseErr.message} (Início recebido: "${preview}")`);
        }
      } catch (fetchErr) {
        // Se o invoke nativo falhou, propaga a mensagem descritiva do Rust; caso contrário propaga o erro do fetch
        const finalMsg = nativeError ? String(nativeError) : (fetchErr?.message || String(fetchErr));
        throw new Error(finalMsg);
      }
    }

    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Manifesto retornado está vazio ou com formato inválido.');
    }

    if (!manifest.version) {
      throw new Error("Manifesto inválido: campo 'version' obrigatório não encontrado.");
    }

    // Registra sucesso
    recordUpdateCheck({
      timestamp: new Date().toISOString(),
      success: true,
      error: null,
      manifest,
      url: manifestUrl,
      isManualCheck
    });

    const hasUpdate = isNewerVersion(manifest.version, CURRENT_APP_VERSION);

    // Atualiza indicador da topbar
    updateTopbarIndicator({
      status: hasUpdate ? 'update-available' : 'up-to-date',
      version: manifest.version,
      manifest,
      isManualCheck
    });

    // Emite evento no window para escuta de outros módulos
    window.dispatchEvent(new CustomEvent('updater-check-success', {
      detail: {
        manifest,
        hasUpdate,
        isManualCheck,
        manifestUrl,
        timestamp: new Date().toISOString()
      }
    }));

    if (hasUpdate) {
      // Fecha o modal de versão se estiver aberto e exibe o modal de update
      const versionModal = document.getElementById('tactical-version-modal');
      if (versionModal) versionModal.classList.remove('active');

      showUpdateModal(manifest);
      showTacticalToast({
        title: 'ATUALIZAÇÃO DETECTADA',
        message: `PZHub Tactical Patch v${manifest.version} está disponível para instalação.`,
        type: 'success',
        duration: 7000,
        actionLabel: 'VER NOTAS',
        onAction: () => showUpdateModal(manifest)
      });

    } else if (isManualCheck) {
      showTacticalVersionModal({ status: 'uptodate', manifest });
      showTacticalToast({
        title: 'PZHUB ATUALIZADO',
        message: `Você está na versão mais recente (v${CURRENT_APP_VERSION}).`,
        type: 'success',
        duration: 4000
      });
    }

  } catch (err) {
    const errorMsg = err?.message || String(err);
    console.warn('[Updater] Verificação de atualização falhou:', errorMsg);

    // Registra falha de forma persistente
    recordUpdateCheck({
      timestamp: new Date().toISOString(),
      success: false,
      error: errorMsg,
      manifest: null,
      url: manifestUrl,
      isManualCheck
    });

    // Emite evento customizado updater-check-failed com a mensagem real
    window.dispatchEvent(new CustomEvent('updater-check-failed', {
      detail: {
        error: errorMsg,
        isManualCheck,
        manifestUrl,
        timestamp: new Date().toISOString()
      }
    }));

    // Atualiza indicador na Topbar (discreto, não-bloqueante na checagem automática)
    updateTopbarIndicator({
      status: 'error',
      error: errorMsg,
      manifestUrl,
      isManualCheck
    });

    // Se for checagem manual: exibe o modal tático de erro e dispara o toast tático de erro
    if (isManualCheck) {
      showTacticalVersionModal({ status: 'error', error: errorMsg });
      showTacticalToast({
        title: 'FALHA NA VERIFICAÇÃO',
        message: errorMsg,
        type: 'error',
        duration: 6500,
        actionLabel: 'TENTAR',
        onAction: () => checkForAppUpdates(null, true)
      });
    }
  } finally {
    if (hubBtn) hubBtn.classList.remove('is-checking');
    if (hubLabel) hubLabel.textContent = 'BUSCAR';
  }
}

/**
 * Exibe o Modal Tático de Atualização
 */
export function showUpdateModal(manifest) {
  let modal = document.getElementById('tactical-update-modal');
  if (!modal) return;

  const currentVerEl = document.getElementById('update-modal-current-ver');
  const targetVerEl = document.getElementById('update-modal-target-ver');
  const titleEl = document.getElementById('update-modal-title');
  const notesEl = document.getElementById('update-modal-notes');
  const progressContainer = document.getElementById('update-progress-container');
  const progressFill = document.getElementById('update-progress-fill');
  const progressText = document.getElementById('update-progress-text');
  const statusMsg = document.getElementById('update-status-msg');
  const btnStart = document.getElementById('btn-confirm-update');
  const btnLater = document.getElementById('btn-dismiss-update');
  const fallbackDownloadLink = document.getElementById('update-fallback-link');

  if (currentVerEl) currentVerEl.textContent = `v${CURRENT_APP_VERSION}`;
  if (targetVerEl) targetVerEl.textContent = `v${manifest.version}`;
  if (titleEl) titleEl.textContent = manifest.name || `PZHub Tactical Patch v${manifest.version}`;
  if (notesEl) {
    notesEl.innerHTML = parseMarkdown(manifest.notes || 'Notas da versão não fornecidas.');
  }

  // Se for atualização obrigatória, esconde o botão "Lembrar Mais Tarde"
  if (btnLater) {
    btnLater.style.display = manifest.mandatory ? 'none' : 'inline-flex';
  }

  // Reseta estado dos controles
  if (progressContainer) progressContainer.style.display = 'none';
  if (progressFill) progressFill.style.width = '0%';
  if (progressText) progressText.textContent = '0.0 MB / 0.0 MB (0%)';
  if (statusMsg) statusMsg.textContent = 'Aguardando autorização do operador...';
  if (btnStart) {
    btnStart.disabled = false;
    btnStart.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
      <span>BAIXAR E INSTALAR AGORA</span>
    `;
  }
  if (fallbackDownloadLink) fallbackDownloadLink.style.display = 'none';

  modal.classList.add('active');

  // Configura ação de download e instalação
  if (btnStart) {
    btnStart.onclick = async () => {
      btnStart.disabled = true;
      btnStart.innerHTML = `
        <div class="tarkov-spinner" style="width: 12px; height: 12px; border-width: 2px;"></div>
        <span>BAIXANDO INSTALADOR...</span>
      `;

      if (progressContainer) progressContainer.style.display = 'block';
      if (statusMsg) statusMsg.textContent = 'Conectando ao servidor e iniciando streaming do instalador...';

      let unlisten = null;
      if (window.__TAURI__?.event?.listen) {
        unlisten = await window.__TAURI__.event.listen('updater-progress', (event) => {
          const payload = event.payload || {};
          const pct = Math.min(100, Math.max(0, payload.percentage || 0));
          const downMB = ((payload.downloaded_bytes || 0) / (1024 * 1024)).toFixed(1);
          const totalMB = ((payload.total_bytes || 0) / (1024 * 1024)).toFixed(1);

          if (progressFill) progressFill.style.width = `${pct}%`;
          if (progressText) progressText.textContent = `${downMB} MB / ${totalMB} MB (${pct.toFixed(0)}%)`;
          if (statusMsg) {
            statusMsg.textContent = pct >= 100 
              ? 'Download concluído! Iniciando instalador e reiniciando PZHub...'
              : `Baixando pacote oficial... ${pct.toFixed(0)}%`;
          }
        });
      }

      try {
        if (window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('download_and_run_installer', {
            installerUrl: manifest.url
          });
        } else {
          throw new Error('Comando nativo Tauri indisponível no ambiente de simulação.');
        }
      } catch (err) {
        console.error('[Updater] Erro ao aplicar atualização:', err);
        if (statusMsg) statusMsg.textContent = `Erro durante o update: ${err}`;
        btnStart.disabled = false;
        btnStart.textContent = 'TENTAR NOVAMENTE';

        // Mostra link de fallback para o usuário não ficar na mão
        if (fallbackDownloadLink && manifest.url) {
          fallbackDownloadLink.style.display = 'block';
          fallbackDownloadLink.href = manifest.url;
        }
      } finally {
        if (unlisten) unlisten();
      }
    };
  }

  if (btnLater) {
    btnLater.onclick = () => {
      modal.classList.remove('active');
    };
  }
}

// Utilitários de Diagnóstico e Teste Manual (acessíveis via DevTools / Console)
if (typeof window !== 'undefined') {
  window.PZHubUpdater = {
    check: (url = null, manual = true) => checkForAppUpdates(url, manual),
    getLastCheck: () => getLastUpdateCheck(),
    showVersionModal: (status = 'uptodate') => showTacticalVersionModal({ status }),
    showToast: (opts) => showTacticalToast(opts),
    // Teste 1: Simula falha com HTTP 404
    testFailureHttp404: () => {
      console.log('[Updater Test] Disparando checagem com manifesto inexistente (HTTP 404)...');
      return checkForAppUpdates('https://raw.githubusercontent.com/pauloviccs/PZHub/main/manifest_404_teste.json', true);
    },
    // Teste 2: Simula falha com JSON inválido (retorno em texto/HTML)
    testFailureInvalidJson: () => {
      console.log('[Updater Test] Disparando checagem com resposta não-JSON...');
      return checkForAppUpdates('https://raw.githubusercontent.com/pauloviccs/PZHub/main/README.md', true);
    },
    // Teste 3: Checagem oficial no GitHub Raw
    checkOfficial: (manual = false) => {
      console.log('[Updater Test] Verificando manifesto oficial no GitHub Raw...');
      return checkForAppUpdates(DEFAULT_UPDATE_MANIFEST_URL, manual);
    },
    // Teste 4: Demonstração de Toast Tático com animação suave
    testToastSuccess: () => {
      showTacticalToast({
        title: 'SISTEMA OPERACIONAL',
        message: 'PZHub Desktop v2.0.0 sincronizado com sucesso.',
        type: 'success',
        duration: 4000
      });
    }
  };

  // Listeners de log automático no console para visibilidade transparente de eventos
  window.addEventListener('updater-check-failed', (evt) => {
    console.warn('[PZHub Event: updater-check-failed]', evt.detail);
  });
  window.addEventListener('updater-check-success', (evt) => {
    console.log('[PZHub Event: updater-check-success]', evt.detail);
  });
}

/**
 * Inicializa todos os listeners e gatilhos da interface para o sistema de atualizações
 */
export function initUpdaterListeners() {
  // 1. Botão "BUSCAR" no card de versão do Hub
  const hubBtn = document.getElementById('btn-hub-check-updates');
  if (hubBtn) {
    hubBtn.onclick = (e) => {
      e.stopPropagation();
      checkForAppUpdates(null, true);
    };
  }

  // 2. Card de versão do Hub
  const hubBox = document.getElementById('hub-updater-box');
  if (hubBox) {
    hubBox.onclick = () => {
      const last = getLastUpdateCheck();
      if (last && last.success === true && last.manifest) {
        showTacticalVersionModal({ status: 'uptodate', manifest: last.manifest });
      } else {
        checkForAppUpdates(null, true);
      }
    };
  }

  // 3. Item "Buscar Atualizações" no menu de perfil do operador
  const menuOpt = document.getElementById('menu-opt-check-updates');
  if (menuOpt) {
    menuOpt.onclick = () => {
      checkForAppUpdates(null, true);
    };
  }

  // 4. Indicador na Topbar
  const topbarBadge = document.getElementById('topbar-updater-status');
  if (topbarBadge) {
    topbarBadge.onclick = () => {
      const last = getLastUpdateCheck();
      if (last && last.success === false) {
        showTacticalVersionModal({ status: 'error', error: last.error });
      } else if (last && last.manifest && isNewerVersion(last.manifest.version, CURRENT_APP_VERSION)) {
        showUpdateModal(last.manifest);
      } else {
        checkForAppUpdates(null, true);
      }
    };
  }
}

// Auto-inicializa listeners assim que o DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpdaterListeners);
  } else {
    initUpdaterListeners();
  }
}


