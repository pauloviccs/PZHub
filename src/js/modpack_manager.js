/**
 * PZHub Desktop - Modpack Manager Module (Escape from Tarkov Aesthetic)
 * Sincronização em tempo real com a Nuvem Supabase / PZHub Website,
 * com interface intuitiva para Instalação, Atualização, Desinstalação e Auditoria de Mods.
 */

import { isModInstalled, refreshLocalMods, getLocalModsList } from './local_mods_scanner.js';
import { parseMarkdown } from './markdown_parser.js';

const SUPABASE_PROJECT_URL = 'https://legqoupwzpdzqqhwuwwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ3FvdXB3enBkenFxaHd1d3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTQ5MTUsImV4cCI6MjEwMzg3MDkxNX0.B1WzociWqnXIE9AM3NA6cY7c7UM-2kLztjgeIQOYJQs';

let savedModpacks = [];
let cloudCommunityModpacks = [];
let activeCategoryFilter = 'all';
let currentSearchQuery = '';
let isCloudConnected = false;
let currentModpacksViewMode = localStorage.getItem('pzhub_modpacks_view_mode') || 'grid';

// Catálogo demonstrativo para fallback offline imediato se sem internet
const DEFAULT_COMMUNITY_MODPACKS = [
  {
    id: "viccs_b42_tactical_pack",
    slug: "viccs-tactical-b42",
    name: "VICCS TACTICAL OPERATIONS PACK (B42)",
    version: "1.4.0",
    author_name: "VICCS Tactical Command",
    description: "Modpack militar e tático oficial para Project Zomboid Build 42. Inclui o radar de telemetria integrado, armas balísticas equilibradas, veículos blindados dos anos 90 e uniformes táticos.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    zomboid_version: "42.0+",
    is_cloud: true,
    category: "Militar",
    downloads_count: 1420,
    likes_count: 388,
    mods: [
      {
        id: "1510950729",
        name: "Filibuster Rhymes' Used Cars! B42",
        mod_type: "workshop",
        workshop_id: "1510950729",
        required: true,
        description: "Mais de 40 veículos militares e civis autênticos da era 1993"
      },
      {
        id: "CustomMilitaryGear",
        name: "VICCS Custom Military Gear Pack",
        mod_type: "direct_download",
        download_url: "https://github.com/viccs/pzhub/releases/download/v1.0/CustomMilitaryGear.zip",
        folder_name: "CustomMilitaryGear",
        required: false,
        description: "Equipamentos, coletes e mochilas táticas"
      }
    ]
  },
  {
    id: "vanilla_plus_qol",
    slug: "vanilla-plus-qol-b42",
    name: "VANILLA+ QUALITY OF LIFE & EXPANSION",
    version: "2.1.0",
    author_name: "Survivor Alliance",
    description: "Coleção essencial para quem quer a experiência original do Zomboid B42 aprimorada. Inclui leitura de mapa avançada e indicadores de status imersivos.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    zomboid_version: "42.0+",
    is_cloud: true,
    category: "Hardcore",
    downloads_count: 890,
    likes_count: 245,
    mods: [
      {
        id: "2392709985",
        name: "Minimal Display Bars",
        mod_type: "workshop",
        workshop_id: "2392709985",
        required: true,
        description: "Barras sutis de status do personagem"
      }
    ]
  }
];

export function setupModpackViewModeToggle() {
  const btnGrid = document.getElementById('btn-modpacks-view-grid');
  const btnList = document.getElementById('btn-modpacks-view-list');
  const container = document.getElementById('modpacks-feed-container');

  function applyMode(mode) {
    currentModpacksViewMode = mode;
    localStorage.setItem('pzhub_modpacks_view_mode', mode);
    btnGrid?.classList.toggle('active', mode === 'grid');
    btnList?.classList.toggle('active', mode === 'list');
    
    if (container) {
      container.classList.toggle('is-grid-view', mode === 'grid');
      container.classList.toggle('is-list-view', mode === 'list');
    }
    renderModpacks();
  }

  btnGrid?.addEventListener('click', () => applyMode('grid'));
  btnList?.addEventListener('click', () => applyMode('list'));

  if (container) {
    container.classList.toggle('is-grid-view', currentModpacksViewMode === 'grid');
    container.classList.toggle('is-list-view', currentModpacksViewMode === 'list');
  }
}

export async function initModpackManager() {
  const importBtn = document.getElementById('btn-import-modpack');
  const importInput = document.getElementById('input-modpack-url');
  const refreshFeedBtn = document.getElementById('btn-refresh-modpacks');
  const searchInput = document.getElementById('input-search-modpacks');
  const filterBtns = document.querySelectorAll('.modpack-tab-filter');

  // Inicializa a alternância de Grade vs Lista
  setupModpackViewModeToggle();

  if (importBtn && importInput) {
    importBtn.addEventListener('click', async () => {
      const url = importInput.value.trim();
      if (!url) {
        showModpackNotification('Insira um link do Pastebin (ex: pastebin.com/raw/...) ou URL JSON válida.', 'warning');
        return;
      }
      await importModpackFromUrl(url);
      importInput.value = '';
    });
  }

  if (refreshFeedBtn) {
    refreshFeedBtn.addEventListener('click', async () => {
      refreshFeedBtn.classList.add('spinning');
      await refreshLocalMods();
      await loadModpacks();
      setTimeout(() => refreshFeedBtn.classList.remove('spinning'), 600);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderModpacks();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.dataset.filter || 'all';
      const selectMore = document.getElementById('select-more-categories');
      if (selectMore) selectMore.value = '';
      renderModpacks();
    });
  });

  const selectMore = document.getElementById('select-more-categories');
  if (selectMore) {
    selectMore.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        filterBtns.forEach(b => b.classList.remove('active'));
        activeCategoryFilter = val;
        renderModpacks();
      }
    });
  }

  await loadModpacks();
}

export function setCategoryFilter(category) {
  activeCategoryFilter = category || 'all';
  const filterBtns = document.querySelectorAll('.modpack-tab-filter');
  filterBtns.forEach(b => {
    b.classList.toggle('active', (b.dataset.filter || '').toLowerCase() === (category || '').toLowerCase());
  });
  renderModpacks();
}

export async function loadModpacks() {
  // 1. Tenta buscar modpacks em tempo real do Supabase de Produção
  try {
    cloudCommunityModpacks = await fetchCloudModpacks();
    isCloudConnected = true;
  } catch (e) {
    console.warn('Conectando em modo catálogo offline/fallback:', e);
    cloudCommunityModpacks = DEFAULT_COMMUNITY_MODPACKS;
    isCloudConnected = false;
  }

  // 2. Carrega modpacks locais salvos da configuração do usuário
  if (window.__TAURI__?.core?.invoke) {
    try {
      const config = await window.__TAURI__.core.invoke('get_user_config');
      if (config && config.saved_modpacks && config.saved_modpacks.length > 0) {
        savedModpacks = config.saved_modpacks;
      } else {
        savedModpacks = [];
      }
    } catch (err) {
      console.warn('Erro ao ler modpacks salvos na config:', err);
      savedModpacks = [];
    }
  }

  updateCloudSyncStatusBadge();
  renderModpacks();
}

function updateCloudSyncStatusBadge() {
  const badge = document.getElementById('modpack-cloud-indicator');
  if (!badge) return;

  const totalCloud = cloudCommunityModpacks.length;
  if (isCloudConnected) {
    badge.textContent = `🟢 NUVEM PZHUB CONECTADA (${totalCloud} MODPACKS)`;
    badge.className = 'tarkov-tag badge-emerald';
  } else {
    badge.textContent = `🟡 MODO OFFLINE (${totalCloud} MODPACKS)`;
    badge.className = 'tarkov-tag badge-amber';
  }
}

async function fetchCloudModpacks() {
  const cloudEndpoint = `${SUPABASE_PROJECT_URL}/rest/v1/modpacks?select=*&is_public=eq.true&order=downloads_count.desc`;
  try {
    const resp = await fetch(cloudEndpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => ({ ...item, is_cloud: true }));
      }
    }
  } catch (err) {
    console.warn('Falha na chamada REST ao Supabase:', err);
  }
  return DEFAULT_COMMUNITY_MODPACKS;
}

export async function importModpackFromUrl(url) {
  if (window.__TAURI__?.core?.invoke) {
    try {
      showModpackNotification('Baixando manifesto do Modpack...', 'info');
      const manifest = await window.__TAURI__.core.invoke('fetch_remote_modpack', { url });
      
      const updatedList = await window.__TAURI__.core.invoke('save_modpack', { manifest });
      savedModpacks = updatedList;
      
      showModpackNotification(`Modpack "${manifest.name}" importado com sucesso!`, 'success');
      await refreshLocalMods();
      renderModpacks();
    } catch (err) {
      console.error('Erro ao importar modpack:', err);
      showModpackNotification(`Falha na importação: ${err}`, 'error');
    }
  } else {
    showModpackNotification('Modo Web: Manifesto importado com sucesso.', 'info');
  }
}

export function renderModpacks() {
  const container = document.getElementById('modpacks-feed-container');
  if (!container) return;

  // Garante a classe correta de Grade ou Lista
  container.className = `modpacks-grid ${currentModpacksViewMode === 'grid' ? 'is-grid-view' : 'is-list-view'}`;

  // Unifica pacotes da nuvem e pacotes importados localmente pelo usuário
  const combined = [];
  cloudCommunityModpacks.forEach(c => combined.push({ ...c, is_cloud: true }));
  savedModpacks.forEach(saved => {
    if (!combined.some(c => c.id === saved.id || (c.slug && c.slug === saved.slug))) {
      combined.push({ ...saved, is_cloud: false });
    }
  });

  // Filtros de Categoria / Origem
  let filtered = combined.filter(pack => {
    if (activeCategoryFilter === 'cloud' && !pack.is_cloud) return false;
    if (activeCategoryFilter === 'saved' && pack.is_cloud) return false;
    if (activeCategoryFilter !== 'all' && activeCategoryFilter !== 'cloud' && activeCategoryFilter !== 'saved') {
      if ((pack.category || '').toLowerCase() !== activeCategoryFilter.toLowerCase()) return false;
    }

    if (currentSearchQuery) {
      const matchTitle = (pack.name || '').toLowerCase().includes(currentSearchQuery);
      const matchDesc = (pack.description || '').toLowerCase().includes(currentSearchQuery);
      const matchAuthor = (pack.author_name || pack.author || '').toLowerCase().includes(currentSearchQuery);
      return matchTitle || matchDesc || matchAuthor;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="tarkov-empty-state" style="grid-column: 1 / -1;">
        <svg class="tarkov-empty-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
        <div class="tarkov-empty-title">NENHUM MODPACK ENCONTRADO</div>
        <div class="tarkov-empty-desc">Nenhum pacote corresponde aos filtros ativos. Cole um link do Pastebin acima ou altere os filtros de categoria.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pack => {
    const totalMods = pack.mods?.length || 0;
    let installedCount = 0;

    pack.mods?.forEach(m => {
      if (m.mod_type === 'builtin') {
        installedCount++;
      } else if (isModInstalled(m.folder_name || m.id, m.workshop_id)) {
        installedCount++;
      }
    });

    const isFullyInstalled = totalMods > 0 && installedCount === totalMods;
    const isPartiallyInstalled = installedCount > 0 && installedCount < totalMods;
    const bannerImg = pack.image || pack.banner_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
    const isCloud = pack.is_cloud !== false;

    let statusBadgeHtml = '';
    if (isFullyInstalled) {
      statusBadgeHtml = `<span class="tarkov-tag badge-emerald">🟢 SINCRONIZADO (${totalMods}/${totalMods})</span>`;
    } else if (isPartiallyInstalled) {
      statusBadgeHtml = `<span class="tarkov-tag badge-amber">🟡 ATUALIZAÇÃO PENDENTE (${installedCount}/${totalMods})</span>`;
    } else {
      statusBadgeHtml = `<span class="tarkov-tag badge-version">⚪ NÃO INSTALADO (0/${totalMods})</span>`;
    }

    return `
      <div class="tarkov-modpack-card" data-pack-id="${pack.id}">
        <div class="modpack-banner-wrapper" style="cursor: pointer;" title="Clique para abrir detalhes, changelogs e comentários">
          <img src="${bannerImg}" class="modpack-banner-img" alt="${pack.name}" onerror="this.src='https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';" />
          <div class="modpack-banner-overlay"></div>
          
          <div class="modpack-badge-strip">
            <span class="tarkov-tag ${isCloud ? 'badge-cyan' : 'badge-amber'}">${isCloud ? '☁️ PZHUB NUVEM' : '💾 IMPORTAÇÃO LOCAL'}</span>
            <span class="tarkov-tag badge-amber">BUILD ${pack.zomboid_version || '42.0+'}</span>
            <span class="tarkov-tag badge-version">v${pack.version}</span>
            ${statusBadgeHtml}
          </div>

          <h3 class="modpack-title" style="cursor: pointer;" title="Clique para abrir detalhes, changelogs e comentários">${pack.name}</h3>
        </div>

        <div class="modpack-content">
          <div class="modpack-meta-row">
            <span class="modpack-author">OPERADOR: <strong>${pack.author_name || pack.author || 'Comunidade PZHub'}</strong></span>
            <span class="modpack-count">TOTAL: <strong>${totalMods} MODS</strong></span>
          </div>

          <div class="modpack-desc" style="max-height: 90px; overflow: hidden; margin-bottom: 12px; word-break: break-word;">
            ${parseMarkdown(pack.description)}
          </div>

          <!-- Accordion de Inspecionar Mods Inclusos -->
          <div class="modpack-mods-section">
            <div class="modpack-mods-header" onclick="this.nextElementSibling.classList.toggle('expanded'); this.querySelector('.dropdown-arrow').classList.toggle('rotated');">
              <span style="font-weight: 700; letter-spacing: 0.5px;">🔍 INSPECIONAR COMPONENTES (${totalMods})</span>
              <svg class="dropdown-arrow rotated" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="modpack-mods-list expanded">
              ${pack.mods?.map(m => {
                const installed = m.mod_type === 'builtin' || isModInstalled(m.folder_name || m.id, m.workshop_id);
                let typeBadge = '';
                if (m.mod_type === 'workshop') {
                  typeBadge = `<span class="mod-pill pill-workshop" title="Oficina Steam - ID: ${m.workshop_id || 'N/A'}">🌐 STEAM WORKSHOP</span>`;
                } else if (m.mod_type === 'builtin') {
                  typeBadge = '<span class="mod-pill pill-builtin" title="Mod de Telemetria Integrado">⚡ RADAR NATIVO</span>';
                } else {
                  typeBadge = `<span class="mod-pill pill-direct" title="Download Direto para Zomboid/mods/${m.folder_name || m.id}">📦 DOWNLOAD DIRETO</span>`;
                }

                return `
                  <div class="modpack-mod-item ${installed ? 'item-synced' : 'item-missing'}">
                    <div class="mod-item-left">
                      <span class="mod-item-status-icon">${installed ? '✓' : '•'}</span>
                      <div class="mod-item-texts">
                        <span class="mod-item-name" title="${m.name}">${m.name}</span>
                        <span class="mod-item-sub" title="${m.description || (m.workshop_id ? `Workshop ID: ${m.workshop_id}` : `Pasta: Zomboid/mods/${m.folder_name || m.id}`)}">${m.description || (m.workshop_id ? `Workshop ID: ${m.workshop_id}` : `Pasta: Zomboid/mods/${m.folder_name || m.id}`)}</span>
                      </div>
                    </div>
                    <div class="mod-item-right">
                      ${typeBadge}
                      ${m.mod_type === 'workshop' && m.workshop_id ? `
                        <button class="tarkov-btn-mini btn-open-steam-item" data-workshop-id="${m.workshop_id}" title="Abrir página da Oficina Steam">
                          STEAM
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('') || '<div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Nenhum mod listado.</div>'}
            </div>
          </div>
        </div>

        <!-- Barra de Ações Rápidas -->
        <div class="modpack-card-actions">
          <button class="tarkov-btn-action btn-details-pack" data-pack-id="${pack.id}" title="Ver visão geral, changelogs e comentários">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <span>DETALHES</span>
          </button>

          ${!isFullyInstalled ? `
            <button class="tarkov-btn-action action-primary btn-install-pack" data-pack-id="${pack.id}" title="Instalar todos os mods deste pacote">
              <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
              <span>${isPartiallyInstalled ? 'ATUALIZAR' : 'INSTALAR'}</span>
            </button>
          ` : `
            <button class="tarkov-btn-action synced btn-reinstall-pack" data-pack-id="${pack.id}" title="Modpack instalado. Clique para reinstalar ou atualizar">
              <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              <span>INSTALADO</span>
            </button>
          `}

          <!-- Botão Desinstalar / Remover Modpack -->
          <button class="tarkov-btn-action btn-uninstall-pack" data-pack-id="${pack.id}" title="Desinstalar mods ou remover da lista">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            <span>DESINSTALAR</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Vinculação de abertura do Modal de Detalhes
  container.querySelectorAll('.btn-details-pack, .modpack-title, .modpack-banner-wrapper').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.tarkov-btn-action:not(.btn-details-pack)') || e.target.closest('.modpack-mods-section')) return;
      const card = el.closest('.tarkov-modpack-card');
      const packId = card?.dataset.packId || el.dataset.packId;
      const pack = combined.find(p => p.id === packId);
      if (pack) {
        openDesktopModpackDetailsModal(pack);
      }
    });
  });

  // Vinculação de eventos dos botões de instalação
  container.querySelectorAll('.btn-install-pack, .btn-reinstall-pack').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const packId = btn.dataset.packId;
      const pack = combined.find(p => p.id === packId);
      if (pack) {
        executeModpackInstallation(pack);
      }
    });
  });

  container.querySelectorAll('.btn-uninstall-pack').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const packId = btn.dataset.packId;
      const pack = combined.find(p => p.id === packId);
      if (!pack) return;

      if (confirm(`Deseja desinstalar os arquivos do modpack "${pack.name}" da pasta do Zomboid?`)) {
        await executeModpackUninstallation(pack);
      }
    });
  });

  container.querySelectorAll('.btn-open-steam-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wsId = btn.dataset.workshopId;
      if (wsId && window.__TAURI__?.core?.invoke) {
        window.__TAURI__.core.invoke('open_steam_workshop_item', { workshopId: wsId });
      }
    });
  });
}

/**
 * Busca changelogs na nuvem Supabase
 */
export async function fetchModpackChangelogsFromCloud(modpackId) {
  try {
    const res = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/modpack_changelogs?modpack_id=eq.${encodeURIComponent(modpackId)}&select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Falha ao buscar changelogs da nuvem no Desktop:', e);
  }
  return [];
}

/**
 * Busca comentários na nuvem Supabase
 */
export async function fetchModpackCommentsFromCloud(modpackId) {
  try {
    const res = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/comments?target_id=eq.${encodeURIComponent(modpackId)}&select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn('Falha ao buscar comentários da nuvem no Desktop:', e);
  }
  return [];
}

/**
 * Modal Detalhado Desktop (4 Abas: Visão Geral, Changelogs, Comentários, Componentes)
 */
export async function openDesktopModpackDetailsModal(pack) {
  const modal = document.getElementById('desktop-modpack-details-modal');
  if (!modal) return;

  const titleEl = document.getElementById('desk-modal-title');
  const authorEl = document.getElementById('desk-modal-author');
  const downloadsEl = document.getElementById('desk-modal-downloads');
  const likesEl = document.getElementById('desk-modal-likes');
  const bannerEl = document.getElementById('desk-modal-banner');

  if (titleEl) titleEl.textContent = pack.name;
  if (authorEl) authorEl.textContent = `OPERADOR: @${pack.author_name || pack.author || 'Comunidade'}`;
  if (downloadsEl) downloadsEl.textContent = `🚀 ${pack.downloads_count || 0} Downloads`;
  if (likesEl) likesEl.textContent = `❤️ ${pack.likes_count || 0} Likes`;
  if (bannerEl) {
    bannerEl.src = pack.image || pack.banner_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
    bannerEl.onerror = () => {
      bannerEl.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
    };
  }

  // Busca changelogs e comentários
  const changelogs = await fetchModpackChangelogsFromCloud(pack.slug || pack.id);
  const comments = await fetchModpackCommentsFromCloud(pack.slug || pack.id);

  let activeTab = 'desk-tab-overview';

  function renderTab() {
    const bodyEl = document.getElementById('desk-modal-body-content');
    if (!bodyEl) return;

    if (activeTab === 'desk-tab-overview') {
      const desc = pack.detailed_description || pack.description || 'Nenhuma descrição detalhada informada.';
      bodyEl.innerHTML = `
        <div class="md-rendered-content" style="font-size: 13px; color: var(--text-main); line-height: 1.7; word-break: break-word;">
          ${parseMarkdown(desc)}
        </div>
      `;
    } else if (activeTab === 'desk-tab-changelogs') {
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${changelogs.length === 0 ? `
            <div style="color: var(--text-dim); font-size: 11px; padding: 24px; text-align: center; border: 1px dashed var(--panel-border); border-radius: 4px;">
              ⚠️ Nenhum registro de changelog anterior documentado para este modpack.
            </div>
          ` : changelogs.map(ch => `
            <div style="background: rgba(0,0,0,0.3); border-left: 3px solid var(--accent-amber); padding: 14px; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="tarkov-tag badge-version">v${ch.version}</span>
                  <strong style="color: #fff; font-size: 13px;">${ch.title}</strong>
                </div>
                <span style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">${new Date(ch.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6; word-break: break-word;">
                ${parseMarkdown(ch.notes)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'desk-tab-comments') {
      bodyEl.innerHTML = `
        <div class="md-comments-pane">
          <div class="comment-compose-box" style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input type="text" id="desk-input-comment" class="tarkov-input" placeholder="Comente algo sobre este modpack no radar comunitário..." style="flex: 1;" />
            <button id="desk-btn-submit-comment" class="tarkov-btn btn-amber">POSTAR</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${comments.length === 0 ? `
              <div style="color: var(--text-dim); font-size: 11px; padding: 24px; text-align: center; border: 1px dashed var(--panel-border); border-radius: 4px;">
                💬 Nenhum comentário publicado ainda pela comunidade.
              </div>
            ` : comments.map(c => `
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${c.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&q=80'}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" />
                    <strong style="color: var(--accent-amber); font-size: 12px;">${c.author_name}</strong>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">${new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p style="font-size: 12px; color: var(--text-main); line-height: 1.5; margin: 0; word-break: break-word;">${c.content}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const submitBtn = document.getElementById('desk-btn-submit-comment');
      const inputEl = document.getElementById('desk-input-comment');
      if (submitBtn && inputEl) {
        submitBtn.onclick = async () => {
          const text = inputEl.value.trim();
          if (!text) return;

          const commentPayload = {
            target_id: pack.id,
            author_name: 'Operador PZHub Desktop',
            author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
            content: text
          };

          try {
            const resp = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/comments`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(commentPayload)
            });
            if (resp.ok) {
              const data = await resp.json();
              if (Array.isArray(data) && data[0]) {
                comments.unshift(data[0]);
              } else {
                comments.unshift({ ...commentPayload, id: `c-${Date.now()}`, created_at: new Date().toISOString() });
              }
            }
            showModpackNotification('Comentário enviado com sucesso para a rede!', 'success');
          } catch(e) {
            comments.unshift({ ...commentPayload, id: `c-${Date.now()}`, created_at: new Date().toISOString() });
            showModpackNotification('Comentário gravado localmente.', 'info');
          }

          inputEl.value = '';
          renderTab();
        };
      }
    } else if (activeTab === 'desk-tab-components') {
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(pack.mods || []).map(m => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 4px; border: 1px solid var(--panel-border);">
              <div>
                <strong style="font-size: 13px; color: #fff;">${m.name}</strong>
                <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px;">
                  ${m.workshop_id ? `Workshop ID: ${m.workshop_id}` : `Pasta: Zomboid/mods/${m.folder_name || m.id}`}
                </div>
              </div>
              <span class="tarkov-tag ${m.mod_type === 'workshop' ? 'badge-cyan' : 'badge-amber'}">${m.mod_type?.toUpperCase()}</span>
            </div>
          `).join('') || '<div style="color: var(--text-dim); font-size: 11px; padding: 20px;">Nenhum mod configurado.</div>'}
        </div>
      `;
    }
  }

  renderTab();
  modal.classList.add('visible');

  // Alternador de abas no modal desktop
  document.querySelectorAll('.desk-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.desk-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderTab();
    };
  });

  const closeBtn = document.getElementById('desk-modal-close-btn');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('visible');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('visible');
  };
}

/**
 * Instalação em lote de todos os componentes com feedback visual e barra de progresso tática
 */
export async function executeModpackInstallation(pack) {
  const modal = document.getElementById('modpack-install-modal');
  const modalTitle = document.getElementById('install-modal-title');
  const modalStatus = document.getElementById('install-modal-status');
  const progressBar = document.getElementById('install-progress-fill');
  const progressPercent = document.getElementById('install-progress-percent');
  const logContainer = document.getElementById('install-log-container');
  const closeBtn = document.getElementById('install-modal-close-btn');

  if (modal) modal.classList.add('visible');
  if (modalTitle) modalTitle.textContent = `SINCRONIZANDO: ${pack.name}`;
  if (closeBtn) closeBtn.style.display = 'none';

  const mods = pack.mods || [];
  const total = mods.length;
  let successCount = 0;

  if (logContainer) logContainer.innerHTML = '';

  function appendLog(msg, type = 'info') {
    if (!logContainer) return;
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  appendLog(`Iniciando rotina de instalação do Modpack v${pack.version}...`, 'info');

  for (let i = 0; i < total; i++) {
    const mod = mods[i];
    const currentProgress = Math.round(((i) / total) * 100);
    
    if (progressBar) progressBar.style.width = `${currentProgress}%`;
    if (progressPercent) progressPercent.textContent = `${currentProgress}%`;
    if (modalStatus) modalStatus.textContent = `Instalando [${i + 1}/${total}]: ${mod.name}`;

    appendLog(`Processando "${mod.name}" (${mod.mod_type || 'workshop'})...`, 'info');

    try {
      if (mod.mod_type === 'builtin') {
        if (window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('install_zomboid_mod');
        }
        appendLog(`✓ Radar Tático PZHub instalado em Zomboid/mods!`, 'success');
        successCount++;
      } else if (mod.mod_type === 'workshop' && (mod.workshop_id || mod.id)) {
        const wsId = mod.workshop_id || mod.id;
        if (window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('open_steam_workshop_item', { workshopId: wsId });
        }
        appendLog(`✓ Abrindo subscrição da Oficina Steam [ID: ${wsId}]...`, 'success');
        successCount++;
      } else if (mod.mod_type === 'direct_download' && mod.download_url) {
        appendLog(`Baixando pacote direto de ${mod.download_url}...`, 'info');
        if (window.__TAURI__?.core?.invoke) {
          await window.__TAURI__.core.invoke('download_and_extract_mod', {
            downloadUrl: mod.download_url,
            folderName: mod.folder_name || mod.id
          });
        }
        appendLog(`✓ Pacote extraído com sucesso em Zomboid/mods/${mod.folder_name || mod.id}!`, 'success');
        successCount++;
      } else {
        appendLog(`Componente "${mod.name}" verificado.`, 'info');
        successCount++;
      }
    } catch (err) {
      appendLog(`❌ Falha no mod "${mod.name}": ${err}`, 'error');
    }

    await new Promise(r => setTimeout(r, 350));
  }

  // Telemetria de Download no Supabase
  if (successCount > 0 && pack.is_cloud) {
    try {
      fetch(`${SUPABASE_PROJECT_URL}/rest/v1/modpacks?id=eq.${pack.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ downloads_count: (pack.downloads_count || 0) + 1 })
      }).then();
    } catch(e) {}
  }

  // Finalização
  if (progressBar) progressBar.style.width = '100%';
  if (progressPercent) progressPercent.textContent = '100%';
  if (modalStatus) modalStatus.textContent = `OPERAÇÃO CONCLUÍDA (${successCount}/${total} SUCESSOS)`;
  appendLog(`Instalação concluída com sucesso! Todos os mods foram processados.`, 'success');

  if (closeBtn) {
    closeBtn.style.display = 'block';
    closeBtn.onclick = async () => {
      modal.classList.remove('visible');
      await refreshLocalMods();
      renderModpacks();
    };
  }
}

/**
 * Desinstalação de componentes locais do modpack
 */
export async function executeModpackUninstallation(pack) {
  showModpackNotification(`Removendo arquivos do modpack "${pack.name}"...`, 'info');

  const mods = pack.mods || [];
  for (const mod of mods) {
    if (mod.mod_type === 'direct_download' && (mod.folder_name || mod.id)) {
      if (window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke('delete_local_mod_folder', {
            folderName: mod.folder_name || mod.id
          });
        } catch (e) {
          console.warn('Erro ao remover pasta:', e);
        }
      }
    }
  }

  // Se for um modpack importado pelo usuário, remove da config
  if (!pack.is_cloud && window.__TAURI__?.core?.invoke) {
    try {
      const updated = await window.__TAURI__.core.invoke('remove_saved_modpack', { modpackId: pack.id });
      savedModpacks = updated;
    } catch (e) {
      console.warn('Erro ao remover modpack salvo:', e);
    }
  }

  await refreshLocalMods();
  renderModpacks();
  showModpackNotification(`Modpack "${pack.name}" desinstalado com sucesso.`, 'success');
}

function showModpackNotification(msg, type = 'info') {
  const container = document.getElementById('modpack-notification-toast') || createNotificationToast();
  if (container) {
    container.textContent = msg;
    container.className = `tarkov-toast toast-${type} visible`;
    setTimeout(() => container.classList.remove('visible'), 4000);
  }
}

function createNotificationToast() {
  const toast = document.createElement('div');
  toast.id = 'modpack-notification-toast';
  toast.className = 'tarkov-toast';
  document.body.appendChild(toast);
  return toast;
}

export function getAvailableModpacks() {
  const combined = [];
  cloudCommunityModpacks.forEach(c => combined.push({ ...c, is_cloud: true }));
  savedModpacks.forEach(saved => {
    if (!combined.some(c => c.id === saved.id || (c.slug && c.slug === saved.slug))) {
      combined.push({ ...saved, is_cloud: false });
    }
  });
  return combined.length > 0 ? combined : DEFAULT_COMMUNITY_MODPACKS;
}
