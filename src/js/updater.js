/**
 * PZHub - Tactical Live Radar & Operations Suite
 * Módulo de Auto-Atualização em Tempo Real (Tarkov UI + Native Rust Downloader)
 */

import { parseMarkdown } from './markdown_parser.js';

export const CURRENT_APP_VERSION = '2.0.0';

// Endpoint padrão do manifesto (Link oficial no Pastebin RAW fornecido pelo operador)
export const DEFAULT_UPDATE_MANIFEST_URL = 'https://pastebin.com/raw/G0mEr2r9';

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
 * Consulta o manifesto remoto e aciona o modal tático se houver nova versão
 */
export async function checkForAppUpdates(customUrl = null, isManualCheck = false) {
  let manifestUrl = customUrl || localStorage.getItem('pzhub_custom_update_url') || DEFAULT_UPDATE_MANIFEST_URL;

  // Se o usuário passou um link do Pastebin normal (pastebin.com/XXXX), converte para RAW automaticamente
  if (manifestUrl.includes('pastebin.com/') && !manifestUrl.includes('pastebin.com/raw/')) {
    manifestUrl = manifestUrl.replace('pastebin.com/', 'pastebin.com/raw/');
  }

  try {
    let manifest = null;

    // Prioridade 1: Buscar via comando nativo Rust (100% imune a bloqueios de CORS do WebView)
    if (window.__TAURI__?.core?.invoke) {
      try {
        manifest = await window.__TAURI__.core.invoke('fetch_update_manifest', { manifestUrl });
      } catch (invokeErr) {
        console.warn('[Updater] Falha no comando nativo de manifesto, tentando fallback fetch:', invokeErr);
      }
    }

    // Prioridade 2: Fallback via fetch padrão (para testes no navegador ou ambiente web)
    if (!manifest) {
      const res = await fetch(manifestUrl, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });

      if (!res.ok) {
        if (isManualCheck) alert(`Falha ao verificar atualizações (HTTP ${res.status}). Verifique o link do manifesto.`);
        return;
      }

      const text = await res.text();
      try {
        manifest = JSON.parse(text);
      } catch (parseErr) {
        console.warn('[Updater] Erro ao interpretar JSON do manifesto:', parseErr);
        if (isManualCheck) alert('O manifesto de atualização retornado não é um JSON válido.');
        return;
      }
    }

    if (manifest && manifest.version && isNewerVersion(manifest.version, CURRENT_APP_VERSION)) {
      showUpdateModal(manifest);
    } else if (isManualCheck) {
      alert(`O PZHub já está atualizado na versão mais recente (v${CURRENT_APP_VERSION})!`);
    }
  } catch (err) {
    console.warn('[Updater] Verificação de atualização falhou silenciosamente:', err);
    if (isManualCheck) {
      alert('Não foi possível conectar ao servidor de atualizações. Verifique sua conexão com a internet.');
    }
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
