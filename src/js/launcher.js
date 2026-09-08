/**
 * PZHub Desktop - Steam Game Launcher & RAM Controller
 * Gerencia a seleção de memória RAM e inicialização do Project Zomboid via Steam
 */

let selectedRamGb = 8;
const invoke = window.__TAURI__?.core?.invoke || (async () => console.log('Tauri mock'));

export async function initLauncher() {
  const btnPlay = document.getElementById('btn-play-game');
  const ramTrigger = document.getElementById('btn-ram-select-trigger');
  const ramMenu = document.getElementById('ram-options-menu');
  const ramLabel = document.getElementById('selected-ram-label');
  const ramOptions = document.querySelectorAll('.ram-option');

  // 1. Carrega configuração salva
  try {
    if (window.__TAURI__?.core) {
      const cfg = await invoke('get_user_config');
      if (cfg && cfg.allocated_ram_gb) {
        selectedRamGb = cfg.allocated_ram_gb;
      }
    }
  } catch (e) {
    console.warn('Não foi possível carregar RAM da configuração:', e);
  }

  // Atualiza label inicial
  updateRamUI(selectedRamGb, ramLabel, ramOptions);

  // 2. Dropdown de seleção de RAM
  if (ramTrigger && ramMenu) {
    ramTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      ramMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.ram-selector-dropdown')) {
        ramMenu.classList.remove('open');
      }
    });
  }

  // Opções de RAM
  ramOptions.forEach(opt => {
    opt.addEventListener('click', async () => {
      const ram = parseInt(opt.getAttribute('data-ram'), 10) || 8;
      selectedRamGb = ram;
      updateRamUI(selectedRamGb, ramLabel, ramOptions);
      if (ramMenu) ramMenu.classList.remove('open');

      // Salva preferência no backend
      try {
        if (window.__TAURI__?.core) {
          const cfg = await invoke('get_user_config');
          cfg.allocated_ram_gb = selectedRamGb;
          await invoke('set_user_config', { config: cfg });
        }
      } catch (err) {
        console.warn('Erro ao salvar alocação de RAM:', err);
      }
    });
  });

  // 3. Clique no botão de Play
  if (btnPlay) {
    btnPlay.addEventListener('click', async () => {
      const originalHtml = btnPlay.innerHTML;
      btnPlay.disabled = true;
      btnPlay.classList.add('launching');
      btnPlay.innerHTML = `
        <svg class="play-icon spinning" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 10"/></svg>
        <span class="play-text">INICIANDO...</span>
      `;

      try {
        if (window.__TAURI__?.core) {
          const msg = await invoke('launch_project_zomboid', { ramGb: selectedRamGb });
          console.log(msg);
          showLauncherToast(msg || `Iniciando Project Zomboid (${selectedRamGb} GB RAM)...`);
        } else {
          showLauncherToast(`[MOCK] Disparando Project Zomboid com ${selectedRamGb}GB RAM`);
        }
      } catch (err) {
        console.error('Erro ao iniciar jogo:', err);
        showLauncherToast(`Erro ao disparar jogo: ${err}`, true);
      } finally {
        setTimeout(() => {
          btnPlay.disabled = false;
          btnPlay.classList.remove('launching');
          btnPlay.innerHTML = originalHtml;
        }, 3000);
      }
    });
  }
}

function updateRamUI(ram, labelEl, options) {
  if (labelEl) {
    labelEl.textContent = `${ram} GB`;
  }
  options.forEach(opt => {
    const optRam = parseInt(opt.getAttribute('data-ram'), 10);
    opt.classList.toggle('active', optRam === ram);
  });
}

function showLauncherToast(message, isError = false) {
  let toast = document.getElementById('launcher-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'launcher-toast';
    toast.className = 'tarkov-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}
