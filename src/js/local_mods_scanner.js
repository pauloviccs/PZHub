/**
 * PZHub - Local Mods Scanner Module (Tarkov & Tactical Apple Aesthetic)
 * Gerencia a varredura, busca, filtros e renderização dos mods instalados no computador.
 * Suporta alternância dinâmica entre visualização em Grade (Cards) e Lista (Tabela Tática).
 */

let allLocalMods = [];
let activeFilter = 'all'; // 'all' | 'local' | 'workshop'
let searchQuery = '';
let currentViewMode = localStorage.getItem('pzhub_local_mods_view') || 'grid'; // 'grid' | 'list'

const TACTICAL_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='%23d97706'%3E%3Cpath d='M16 3l12 7v12l-12 7-12-7V10l12-7zm0 2.4L6 11.2v9.6l10 5.8 10-5.8V11.2L16 5.4zM16 9a4 4 0 110 8 4 4 0 010-8z'/%3E%3C/svg%3E";

export async function initLocalModsScanner() {
  const refreshBtn = document.getElementById('btn-refresh-local-mods');
  const searchInput = document.getElementById('input-search-local-mods');
  const filterBtns = document.querySelectorAll('.mod-filter-btn');
  const openModsFolderBtn = document.getElementById('btn-open-folder-scanner');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnViewList = document.getElementById('btn-view-list');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => refreshLocalMods());
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderLocalMods();
    });
  }

  if (openModsFolderBtn) {
    openModsFolderBtn.addEventListener('click', async () => {
      if (window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke('open_zomboid_mods_dir');
        } catch (err) {
          console.error('Erro ao abrir pasta:', err);
        }
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      renderLocalMods();
    });
  });

  // Setup do alternador de visualização Grade / Lista
  updateViewToggleButtons();

  if (btnViewGrid) {
    btnViewGrid.addEventListener('click', () => {
      if (currentViewMode !== 'grid') {
        currentViewMode = 'grid';
        localStorage.setItem('pzhub_local_mods_view', 'grid');
        updateViewToggleButtons();
        renderLocalMods();
      }
    });
  }

  if (btnViewList) {
    btnViewList.addEventListener('click', () => {
      if (currentViewMode !== 'list') {
        currentViewMode = 'list';
        localStorage.setItem('pzhub_local_mods_view', 'list');
        updateViewToggleButtons();
        renderLocalMods();
      }
    });
  }

  // Carrega mods pela primeira vez
  await refreshLocalMods();
}

function updateViewToggleButtons() {
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnViewList = document.getElementById('btn-view-list');
  if (btnViewGrid) btnViewGrid.classList.toggle('active', currentViewMode === 'grid');
  if (btnViewList) btnViewList.classList.toggle('active', currentViewMode === 'list');
}

export async function refreshLocalMods() {
  const container = document.getElementById('local-mods-grid');
  const countBadge = document.getElementById('local-mods-total-count');
  const statusBadge = document.getElementById('scanner-status-text');

  if (statusBadge) statusBadge.textContent = 'ESCANEANDO ARQUIVOS...';
  if (container) {
    container.innerHTML = `
      <div class="tarkov-loading-state">
        <div class="tarkov-spinner"></div>
        <span>ESCANEANDO DIRETÓRIOS DO PROJECT ZOMBOID & STEAM WORKSHOP...</span>
      </div>
    `;
  }

  if (window.__TAURI__?.core?.invoke) {
    try {
      const mods = await window.__TAURI__.core.invoke('scan_installed_mods');
      allLocalMods = mods || [];
      if (countBadge) countBadge.textContent = `${allLocalMods.length} MODS DETECTADOS`;
      if (statusBadge) statusBadge.textContent = 'SISTEMA PRONTO';
    } catch (err) {
      console.error('Erro ao escanear mods:', err);
      if (statusBadge) statusBadge.textContent = 'ERRO NO SCANNER';
      if (container) {
        container.innerHTML = `
          <div class="tarkov-empty-state error">
            <span class="tarkov-empty-icon">⚠️</span>
            <div class="tarkov-empty-title">FALHA AO ACESSAR DIRETÓRIOS</div>
            <div class="tarkov-empty-desc">${err}</div>
          </div>
        `;
      }
      return;
    }
  } else {
    // Modo Web / Simulação
    allLocalMods = [
      {
        id: "VICCSRadarBridge",
        name: "VICCS PZMap Live Squad Radar Bridge (B42)",
        description: "Mini-mod ultraleve de telemetria e sincronizacao de radar em tempo real para o VICCS PZMap no Project Zomboid Build 42.",
        version_min: "42.0.0",
        poster_base64: null,
        icon_base64: null,
        source_type: "local",
        folder_path: "C:/Users/User/Zomboid/mods/VICCSRadarBridge",
        workshop_id: null,
        is_active: true
      },
      {
        id: "VICCS_HousingCareSystem",
        name: "Housing Care System (Lar Vivo)",
        description: "Avalia a manutencao, decoracao e limpeza da sua base no Project Zomboid Build 42, concedendo bônus táticos.",
        version_min: "42.0.0",
        poster_base64: null,
        icon_base64: null,
        source_type: "local",
        folder_path: "C:/Users/User/Zomboid/mods/VICCS_HousingCareSystem",
        workshop_id: null,
        is_active: true
      },
      {
        id: "FilibusterRhymesUsedCars",
        name: "Filibuster Rhymes' Used Cars! B42",
        description: "Adiciona dezenas de veículos fiéis aos anos 90 com peças customizadas e mecânica refinada.",
        version_min: "41.50",
        poster_base64: null,
        icon_base64: null,
        source_type: "workshop",
        folder_path: "Steam/steamapps/workshop/content/108600/1510950729",
        workshop_id: "1510950729",
        is_active: true
      }
    ];
    if (countBadge) countBadge.textContent = `${allLocalMods.length} MODS DETECTADOS (SIMULAÇÃO)`;
    if (statusBadge) statusBadge.textContent = 'SISTEMA PRONTO';
  }

  renderLocalMods();
}

export function getLocalModsList() {
  return allLocalMods;
}

export function isModInstalled(modId, workshopId) {
  if (!allLocalMods || allLocalMods.length === 0) return false;
  return allLocalMods.some(m => {
    if (modId) {
      const lowerModId = String(modId).toLowerCase();
      if (m.id && m.id.toLowerCase() === lowerModId) return true;
      if (m.folder_path && m.folder_path.toLowerCase().replace(/\\/g, '/').endsWith(`/${lowerModId}`)) return true;
      if (m.name && m.name.toLowerCase() === lowerModId) return true;
    }
    if (workshopId && m.workshop_id && String(m.workshop_id) === String(workshopId)) return true;
    return false;
  });
}

function renderLocalMods() {
  const container = document.getElementById('local-mods-grid');
  if (!container) return;

  const filtered = allLocalMods.filter(m => {
    // Filtro por tipo
    if (activeFilter === 'local' && m.source_type !== 'local') return false;
    if (activeFilter === 'workshop' && m.source_type !== 'workshop') return false;

    // Filtro por busca
    if (searchQuery) {
      const nameMatch = m.name?.toLowerCase().includes(searchQuery);
      const idMatch = m.id?.toLowerCase().includes(searchQuery);
      const descMatch = m.description?.toLowerCase().includes(searchQuery);
      return nameMatch || idMatch || descMatch;
    }
    return true;
  });

  // Atualiza a classe de layout do container
  if (currentViewMode === 'list') {
    container.className = 'local-mods-list';
  } else {
    container.className = 'local-mods-grid';
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="tarkov-empty-state" style="grid-column: 1 / -1; width: 100%;">
        <svg class="tarkov-empty-svg" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
        <div class="tarkov-empty-title">NENHUM MOD ENCONTRADO</div>
        <div class="tarkov-empty-desc">Nenhum mod corresponde aos filtros ativos ou à pesquisa realizada.</div>
      </div>
    `;
    return;
  }

  if (currentViewMode === 'list') {
    container.innerHTML = filtered.map(renderListModRow).join('');
  } else {
    container.innerHTML = filtered.map(renderGridModCard).join('');
  }

  // Adiciona listeners para os botões dos itens
  container.querySelectorAll('.btn-open-workshop').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const wsId = btn.dataset.workshopId;
      if (wsId && window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke('open_steam_workshop_item', { workshopId: wsId });
        } catch (err) {
          console.error('Erro ao abrir Workshop:', err);
        }
      }
    });
  });

  container.querySelectorAll('.btn-open-folder').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const folderPath = decodeURIComponent(btn.dataset.folder);
      if (folderPath && window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke('open_mod_folder', { folderPath });
        } catch (err) {
          console.error('Erro ao abrir pasta:', err);
        }
      }
    });
  });
}

function renderGridModCard(m) {
  const isWorkshop = m.source_type === 'workshop';
  const typeLabel = isWorkshop ? 'STEAM WORKSHOP' : 'MOD LOCAL';
  const typeClass = isWorkshop ? 'badge-workshop' : 'badge-local';
  const versionLabel = m.version_min ? `B${m.version_min}` : 'UNIVERSAL';
  const iconSrc = m.icon_base64 || m.poster_base64 || TACTICAL_FALLBACK_SVG;

  return `
    <div class="tarkov-mod-card" data-mod-id="${m.id}">
      <div class="mod-card-header">
        <div class="mod-icon-wrapper">
          <img src="${iconSrc}" class="mod-thumbnail-img" alt="${m.name}" onerror="this.src='${TACTICAL_FALLBACK_SVG}';" />
        </div>
        <div class="mod-header-info">
          <div class="mod-card-title" title="${m.name}">${m.name}</div>
          <div class="mod-id-code"><code>ID: ${m.id}</code></div>
        </div>
      </div>

      <div class="mod-card-body">
        <p class="mod-card-desc">${m.description || 'Nenhuma descrição técnica fornecida no arquivo mod.info.'}</p>
      </div>

      <div class="mod-card-footer">
        <div class="mod-tags-group">
          <span class="tarkov-tag ${typeClass}">${typeLabel}</span>
          <span class="tarkov-tag badge-version">${versionLabel}</span>
        </div>
        <div class="mod-actions-group">
          ${isWorkshop && m.workshop_id ? `
            <button class="tarkov-btn-icon btn-open-workshop" data-workshop-id="${m.workshop_id}" title="Abrir página no Steam Workshop">
              <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
            </button>
          ` : ''}
          <button class="tarkov-btn-icon btn-open-folder" data-folder="${encodeURIComponent(m.folder_path)}" title="Abrir pasta no Windows Explorer">
            <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderListModRow(m) {
  const isWorkshop = m.source_type === 'workshop';
  const typeLabel = isWorkshop ? 'WORKSHOP' : 'LOCAL';
  const typeClass = isWorkshop ? 'badge-workshop' : 'badge-local';
  const versionLabel = m.version_min ? `B${m.version_min}` : 'UNIVERSAL';
  const iconSrc = m.icon_base64 || m.poster_base64 || TACTICAL_FALLBACK_SVG;

  return `
    <div class="local-mod-row" data-mod-id="${m.id}">
      <div class="row-icon-col">
        <img src="${iconSrc}" class="row-thumb-img" alt="${m.name}" onerror="this.src='${TACTICAL_FALLBACK_SVG}';" />
      </div>

      <div class="row-info-col">
        <div class="row-mod-name" title="${m.name}">${m.name}</div>
        <div class="row-mod-meta">
          <code class="row-mod-id">ID: ${m.id}</code>
          <span class="row-desc-preview" title="${m.description || ''}">${m.description ? '— ' + m.description : ''}</span>
        </div>
      </div>

      <div class="row-badges-col">
        <span class="tarkov-tag ${typeClass}">${typeLabel}</span>
        <span class="tarkov-tag badge-version">${versionLabel}</span>
      </div>

      <div class="row-actions-col">
        ${isWorkshop && m.workshop_id ? `
          <button class="tarkov-btn-mini btn-open-workshop" data-workshop-id="${m.workshop_id}" title="Ver na Oficina Steam">
            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
            <span>STEAM</span>
          </button>
        ` : ''}
        <button class="tarkov-btn-mini btn-open-folder" data-folder="${encodeURIComponent(m.folder_path)}" title="Abrir pasta no Windows Explorer">
          <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          <span>PASTA</span>
        </button>
      </div>
    </div>
  `;
}

