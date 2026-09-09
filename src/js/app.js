/**
 * PZHub - Tactical Live Radar & Modpack Manager
 * Controlador Principal da Aplicação com Router de Views (Escape from Tarkov UI)
 */

import { PZMapEngine } from './map_engine.js';
import { SquadTracker } from './squad_tracker.js';
import { OverlayController } from './overlay.js';
import { FriendsManager } from './friends_manager.js';
import { KNOX_TOWNS } from './pz_projection.js';
import { initLocalModsScanner, refreshLocalMods, getLocalModsList } from './local_mods_scanner.js';
import { initModpackManager, setCategoryFilter, getAvailableModpacks, executeModpackInstallation } from './modpack_manager.js';
import { i18n, PZ_CATEGORIES } from './i18n.js';
import { checkForAppUpdates, getLastUpdateCheck, updateTopbarIndicator } from './updater.js';
import { initLauncher } from './launcher.js';
import { initAuth } from './auth.js';
import { initSocialManager } from './social_manager.js';

class App {
  constructor() {
    this.mapEngine = null;
    this.squadTracker = null;
    this.friendsManager = null;
    this.overlayController = null;
    this.step = 0;
    this.telemetryTimer = null;
    this.isTauri = typeof window.__TAURI__ !== 'undefined';
    this.isMiniRadar = false;
    this.activeView = 'view-hub';
    this.showcaseIndex = 0;
    this.showcaseTimer = null;
    this.showcaseModpacks = [];
  }

  async init() {
    // 0. Inicializa Tema (Dark / White Mode) e Internacionalização (i18n)
    this.initTheme();
    this.setupLanguageSelector();
    this.populateMoreCategoriesSelect();

    // 1. Configura o Router de Views e Navegação Global
    this.setupViewRouter();

    // 2. Inicializa o Scanner de Mods Locais e o Gerenciador de Modpacks
    await initLocalModsScanner();
    await initModpackManager();
    this.updateHubMetrics();
    this.initHubModpackShowcase();

    // 2.1 Inicializa o Steam Game Launcher e a Autenticação Supabase
    await initLauncher();
    await initAuth();

    // 2.2 Inicializa o Painel Social Global Estilo Riot Client & Chat
    await initSocialManager();

    // 3. Inicializa o motor de mapa Leaflet (em segundo plano)
    this.mapEngine = new PZMapEngine('map', (telemetry) => {
      this.updateTelemetryHeader(telemetry);
    });

    // Registra listener de rota GPS
    this.mapEngine.onGpsUpdate = (gpsData) => {
      this.updateGpsHud(gpsData);
    };

    // Expõe atalhos globais de GPS para popups do Leaflet
    window.pzSetGps = (x, y, name) => {
      this.mapEngine.setGpsDestination(x, y, name);
    };
    window.pzClearGps = () => {
      this.mapEngine.clearGpsRoute();
    };

    await this.mapEngine.init();

    // 4. Inicializa o rastreador de esquadrão
    this.squadTracker = new SquadTracker(this.mapEngine, 'squad-list-container');

    // 5. Inicializa o gerenciador de amigos
    this.friendsManager = new FriendsManager(this.mapEngine, this.squadTracker, 'friends-list-container');
    await this.friendsManager.init();

    // Sincroniza amigos com o tracker e escuta atualizações em tempo real
    this.squadTracker.setFriendsList(this.friendsManager.friends);
    this.squadTracker.onSquadUpdate = () => {
      if (this.friendsManager) this.friendsManager.render();
    };

    // 6. Inicializa o controlador de overlay e atalhos
    this.overlayController = new OverlayController(this.mapEngine, this.squadTracker).init();

    // 7. Configura as abas da barra lateral do mapa
    this.setupSidebarTabs();

    // 8. Configura lista de Cidades e POIs com rotas GPS
    this.setupTownsList();

    // 9. Configura filtros de loot / categorias
    this.setupCategoryFilters();

    // 10. Configura seletor de Z-Levels (Andares)
    this.setupFloorSelector();

    // 11. Configura painel de cache e controles do mapa
    this.setupCacheAndModControls();

    // 12. Configura controle do Modo Mini-Radar
    this.setupMiniRadarControls();

    // 13. Configura GPS HUD (Barra de navegação no topo)
    this.setupGpsHudControls();

    // 14. Configura modais
    this.setupModal();

    // 15. Inicia o loop de telemetria do esquadrão
    this.startTelemetryLoop();

    // 16. Atualiza status do cache
    this.refreshCacheStats();
    this.dismissSplashScreen();

    // 17. Inicializa rotina de auto-atualização em segundo plano
    this.setupAppUpdater();
  }

  setupAppUpdater() {
    // Restaura indicador da última checagem se houver registro prévio em localStorage
    const lastCheck = getLastUpdateCheck();
    if (lastCheck && lastCheck.success === false && lastCheck.error) {
      updateTopbarIndicator({
        status: 'error',
        error: lastCheck.error,
        manifestUrl: lastCheck.url
      });
    }

    // Verificação automática silenciosa após 2.5s da inicialização
    setTimeout(() => {
      checkForAppUpdates();
    }, 2500);

    // Permite ao operador clicar no status do sistema na Topbar para forçar checagem manual
    const statusItem = document.getElementById('global-system-status') || document.querySelector('.nav-system-section .tarkov-stat-item');
    if (statusItem) {
      statusItem.style.cursor = 'pointer';
      statusItem.setAttribute('title', 'Clique para verificar atualizações do PZHub');
      statusItem.addEventListener('click', () => {
        checkForAppUpdates(null, true);
      });
    }
  }

  setupViewRouter() {
    const tabs = document.querySelectorAll('.tarkov-tab');
    const portals = document.querySelectorAll('.tarkov-portal-card');
    const brandBtn = document.getElementById('nav-brand-btn');
    const backToHubBtn = document.getElementById('btn-back-to-hub');
    const globalAotBtn = document.getElementById('btn-global-always-on-top');

    // Navegação pelas abas superiores
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        if (targetView) this.switchView(targetView);
      });
    });

    // Navegação pelos portais da Home / Hub
    portals.forEach(portal => {
      portal.addEventListener('click', () => {
        const targetView = portal.dataset.targetView;
        if (targetView) this.switchView(targetView);
      });
    });

    if (brandBtn) {
      brandBtn.addEventListener('click', () => this.switchView('view-hub'));
    }

    if (backToHubBtn) {
      backToHubBtn.addEventListener('click', () => this.switchView('view-hub'));
    }

    if (globalAotBtn) {
      globalAotBtn.addEventListener('click', async () => {
        if (this.isTauri) {
          try {
            const config = await window.__TAURI__.core.invoke('get_user_config');
            const newState = !config.always_on_top;
            config.always_on_top = newState;
            await window.__TAURI__.core.invoke('set_user_config', { config });
            await window.__TAURI__.core.invoke('set_always_on_top', { enabled: newState });
            globalAotBtn.classList.toggle('active', newState);
          } catch (e) {
            console.error('Erro ao alternar Always-On-Top:', e);
          }
        }
      });
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('pzhub_theme') || 'dark';
    const isLight = savedTheme === 'light';
    document.body.classList.toggle('theme-light', isLight);
    const themeIcon = document.getElementById('desktop-theme-icon');
    if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '☀️';

    const themeToggleBtn = document.getElementById('btn-global-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentlyLight = document.body.classList.contains('theme-light');
        const nextLight = !currentlyLight;
        document.body.classList.toggle('theme-light', nextLight);
        localStorage.setItem('pzhub_theme', nextLight ? 'light' : 'dark');
        if (themeIcon) themeIcon.textContent = nextLight ? '🌙' : '☀️';
      });
    }
  }

  setupLanguageSelector() {
    const langBtns = document.querySelectorAll('.lang-btn-option');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.dataset.lang;
        if (selectedLang) {
          i18n.setLanguage(selectedLang);
          this.populateMoreCategoriesSelect();
        }
      });
    });
    i18n.updateDom();
  }

  populateMoreCategoriesSelect() {
    const select = document.getElementById('select-more-categories');
    if (!select) return;

    select.innerHTML = `<option value="">+ ${i18n.t('lang_select', 'MAIS CATEGORIAS')}...</option>`;

    const groups = {
      elements: i18n.currentLang === 'pt' ? 'Mecânicas & Itens' : (i18n.currentLang === 'es' ? 'Mecánicas e Ítems' : 'Mechanics & Items'),
      gameplay: i18n.currentLang === 'pt' ? 'Estilo & Gameplay' : (i18n.currentLang === 'es' ? 'Estilo y Gameplay' : 'Style & Gameplay'),
      technical: i18n.currentLang === 'pt' ? 'Técnica & Estrutura' : (i18n.currentLang === 'es' ? 'Técnica y Estructura' : 'Technical & Overhaul'),
      versions: i18n.currentLang === 'pt' ? 'Versões Zomboid' : (i18n.currentLang === 'es' ? 'Versiones Zomboid' : 'Game Versions')
    };

    const groupedMap = {};
    PZ_CATEGORIES.forEach(cat => {
      if (!groupedMap[cat.group]) groupedMap[cat.group] = [];
      groupedMap[cat.group].push(cat);
    });

    Object.keys(groupedMap).forEach(grpKey => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groups[grpKey] || grpKey;
      groupedMap[grpKey].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.label[i18n.currentLang] || cat.label.pt || cat.id;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    });
  }

  switchView(viewId) {
    this.activeView = viewId;

    // Atualiza abas da navbar
    document.querySelectorAll('.tarkov-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewId);
    });

    // Atualiza views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.toggle('active', view.id === viewId);
    });

    // Gerenciamento de Suspensão de Recursos & Economia de Memória
    if (viewId === 'view-hub') {
      this.startShowcaseAutoplay();
      this.updateHubMetrics();
    } else {
      this.stopShowcaseAutoplay();
    }

    // Se estiver no mapa, acorda o Leaflet e redimensiona
    if (viewId === 'view-map') {
      setTimeout(() => {
        if (this.mapEngine?.map) {
          this.mapEngine.map.invalidateSize();
        }
      }, 100);
    }
  }

  initHubModpackShowcase() {
    const track = document.getElementById('showcase-track');
    const prevBtn = document.getElementById('btn-showcase-prev');
    const nextBtn = document.getElementById('btn-showcase-next');
    const dotsContainer = document.getElementById('showcase-indicators');
    const showcaseContainer = document.getElementById('hub-modpack-showcase');

    if (!track) return;

    // Obtém lista de pacotes disponíveis na nuvem ou locais
    this.showcaseModpacks = getAvailableModpacks().slice(0, 5);

    if (!this.showcaseModpacks || this.showcaseModpacks.length === 0) {
      track.innerHTML = `<div class="showcase-slide active"><p>Nenhum modpack disponível no momento.</p></div>`;
      return;
    }

    // Renderiza os slides dinâmicos
    track.innerHTML = this.showcaseModpacks.map((pack, idx) => {
      const bannerImg = pack.image || pack.banner_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
      const totalMods = pack.mods?.length || 0;
      const author = pack.author_name || pack.author || 'Comunidade PZHub';
      const category = pack.category || 'Militar';
      const bld = pack.zomboid_version || '42.0+';

      return `
        <div class="showcase-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
          <div class="slide-banner-bg" style="background-image: url('${bannerImg}');">
            <div class="slide-gradient-overlay"></div>
          </div>
          <div class="slide-content-overlay">
            <div class="slide-badge-row">
              <span class="tarkov-tag badge-emerald">DESTAQUE DA SEMANA</span>
              <span class="tarkov-tag badge-amber">BUILD ${bld}</span>
              <span class="tarkov-tag badge-cyan">${category.toUpperCase()}</span>
              <span class="tarkov-tag badge-version">${totalMods} MODS INCLUSOS</span>
            </div>
            <h2 class="slide-title">${pack.name}</h2>
            <p class="slide-desc">${pack.description}</p>
            <div class="slide-footer-row">
              <div class="slide-operator-info">
                <span class="slide-meta-label">CRIADOR / OPERADOR:</span>
                <span class="slide-meta-val">${author}</span>
              </div>
              <div class="slide-actions">
                <button class="tarkov-btn btn-emerald btn-showcase-install" data-pack-id="${pack.id}" title="Instalar todos os componentes agora">
                  <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  <span>INSTALAR MODPACK</span>
                </button>
                <button class="tarkov-btn btn-showcase-view-more" data-pack-id="${pack.id}" title="Abrir no Gerenciador de Modpacks">
                  <span>DETALHES</span>
                  <svg viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Renderiza dots de navegação
    if (dotsContainer) {
      dotsContainer.innerHTML = this.showcaseModpacks.map((_, idx) => `
        <button class="showcase-dot ${idx === 0 ? 'active' : ''}" data-slide-to="${idx}"></button>
      `).join('');

      dotsContainer.querySelectorAll('.showcase-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const targetIdx = parseInt(e.target.dataset.slideTo, 10);
          this.goToSlide(targetIdx);
        });
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevSlide());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Ações de instalação e detalhes
    track.querySelectorAll('.btn-showcase-install').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const packId = btn.dataset.packId;
        const pack = this.showcaseModpacks.find(p => p.id === packId);
        if (pack) {
          executeModpackInstallation(pack);
        }
      });
    });

    track.querySelectorAll('.btn-showcase-view-more').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchView('view-modpacks');
      });
    });

    // Pausa no hover
    if (showcaseContainer) {
      showcaseContainer.addEventListener('mouseenter', () => this.stopShowcaseAutoplay());
      showcaseContainer.addEventListener('mouseleave', () => {
        if (this.activeView === 'view-hub') this.startShowcaseAutoplay();
      });
    }

    // Inicia autoplay se estiver no Hub
    if (this.activeView === 'view-hub') {
      this.startShowcaseAutoplay();
    }
  }

  goToSlide(index) {
    if (!this.showcaseModpacks || this.showcaseModpacks.length === 0) return;
    const count = this.showcaseModpacks.length;
    this.showcaseIndex = ((index % count) + count) % count;

    const slides = document.querySelectorAll('.showcase-slide');
    const dots = document.querySelectorAll('.showcase-dot');

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.showcaseIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.showcaseIndex);
    });
  }

  nextSlide() {
    this.goToSlide(this.showcaseIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.showcaseIndex - 1);
  }

  startShowcaseAutoplay() {
    this.stopShowcaseAutoplay();
    this.showcaseTimer = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopShowcaseAutoplay() {
    if (this.showcaseTimer) {
      clearInterval(this.showcaseTimer);
      this.showcaseTimer = null;
    }
  }

  updateHubMetrics() {
    const modsCountEl = document.getElementById('hub-mods-count');
    const localMods = getLocalModsList();
    if (modsCountEl) {
      modsCountEl.textContent = `${localMods.length} INSTALADOS`;
    }
  }

  updateTelemetryHeader({ x, y, z, cell, chunk, zoom }) {
    const elX = document.getElementById('telemetry-x');
    const elY = document.getElementById('telemetry-y');
    const elFloor = document.getElementById('telemetry-floor');
    const elCell = document.getElementById('telemetry-cell');
    const elZoom = document.getElementById('telemetry-zoom');

    if (elX) elX.textContent = `${Math.round(x)}`;
    if (elY) elY.textContent = `${Math.round(y)}`;
    if (elFloor) elFloor.textContent = `${z}`;
    if (elCell) elCell.textContent = `${cell} [${chunk}]`;
    if (elZoom) elZoom.textContent = `${zoom}x`;
  }

  updateGpsHud(gpsData) {
    const hud = document.getElementById('gps-navigation-hud');
    const destName = document.getElementById('gps-hud-dest-name');
    const heading = document.getElementById('gps-hud-heading');
    const distance = document.getElementById('gps-hud-distance');
    const eta = document.getElementById('gps-hud-eta');

    if (!hud || !destName || !heading || !distance || !eta) return;

    if (!gpsData || !gpsData.active) {
      hud.classList.remove('active');
      return;
    }

    hud.classList.add('active');
    destName.textContent = gpsData.destinationName || 'Destino GPS';
    heading.textContent = `Rumo: ${gpsData.heading || '--'} (${Math.round(gpsData.angleDeg || 0)}°)`;
    distance.textContent = `${gpsData.distanceMeters || 0}m`;
    eta.textContent = gpsData.etaText || '--';
  }

  setupGpsHudControls() {
    const cancelBtn = document.getElementById('gps-hud-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.mapEngine) {
          this.mapEngine.clearGpsRoute();
        }
      });
    }
  }

  setupSidebarTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        navTabs.forEach((t) => t.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  setupTownsList() {
    const container = document.getElementById('poi-list-container');
    if (!container) return;

    container.innerHTML = '';

    KNOX_TOWNS.forEach((town) => {
      const card = document.createElement('div');
      card.className = 'tactical-btn';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.padding = '8px 10px';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div style="display: flex; flex-direction: column; text-align: left;">
          <span style="font-weight: bold; color: var(--text-main);">${town.name}</span>
          <span style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">
            X:${Math.round(town.x)} Y:${Math.round(town.y)}
          </span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="btn-town-gps" title="Traçar Rota GPS até ${town.name}" style="background: rgba(0, 210, 211, 0.15); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 4px 8px; border-radius: 3px; font-family: var(--font-mono); font-size: 10px; cursor: pointer;">
            🧭 GPS
          </button>
          <button class="btn-town-view" title="Ver no Mapa" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); color: var(--text-main); padding: 4px 8px; border-radius: 3px; font-family: var(--font-mono); font-size: 10px; cursor: pointer;">🎯 IR</button>
        </div>
      `;

      const gpsBtn = card.querySelector('.btn-town-gps');
      const viewBtn = card.querySelector('.btn-town-view');

      gpsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.mapEngine.setGpsDestination(town.x, town.y, town.name);
      });

      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.mapEngine.panToPz(town.x, town.y, 14);
      });

      card.addEventListener('click', () => {
        this.mapEngine.panToPz(town.x, town.y, 14);
      });

      container.appendChild(card);
    });
  }

  setupCategoryFilters() {
    const container = document.getElementById('category-filters-container');
    if (!container) return;

    const categories = [
      { id: 'police', label: 'Delegacias & Armarias', color: '#3498db' },
      { id: 'medical', label: 'Hospitais & Clínicas', color: '#e74c3c' },
      { id: 'food', label: 'Mercados & Restaurantes', color: '#f39c12' },
      { id: 'hardware', label: 'Ferramentas & Depósitos', color: '#95a5a6' },
      { id: 'gas', label: 'Postos de Combustível', color: '#e67e22' },
      { id: 'gunstore', label: 'Lojas de Armas', color: '#c0392b' },
    ];

    container.innerHTML = categories
      .map(
        (cat) => `
      <label class="category-toggle-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; margin-bottom: 4px; background: rgba(0,0,0,0.3); border-radius: 3px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color};"></span>
          <span style="font-size: 11px;">${cat.label}</span>
        </div>
        <input type="checkbox" class="category-checkbox" data-cat="${cat.id}" checked style="accent-color: var(--accent-cyan); cursor: pointer;" />
      </label>
    `
      )
      .join('');

    container.querySelectorAll('.category-checkbox').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const catId = e.target.dataset.cat;
        const enabled = e.target.checked;
        if (this.overlayController) {
          this.overlayController.toggleCategory(catId, enabled);
        }
      });
    });
  }

  setupFloorSelector() {
    const buttons = document.querySelectorAll('.z-level-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const floor = parseInt(btn.dataset.floor, 10);
        this.mapEngine.setFloor(floor);
      });
    });
  }

  setupCacheAndModControls() {
    const installModBtn = document.getElementById('btn-install-mod');
    const openModsBtn = document.getElementById('btn-open-mods-folder');
    const refreshCacheBtn = document.getElementById('btn-refresh-cache');
    const clearCacheBtn = document.getElementById('btn-clear-cache');

    if (installModBtn) {
      installModBtn.addEventListener('click', async () => {
        if (this.isTauri) {
          try {
            const targetPath = await window.__TAURI__.core.invoke('install_zomboid_mod');
            this.showModal(
              'Mod Instalado com Sucesso!',
              `O mod <strong>VICCSRadarBridge</strong> foi gravado nas pastas padrão e Build 42:<br><br><code>${targetPath}</code><br><br>Agora abra o Project Zomboid, vá em <strong>Mods</strong> e ative-o para iniciar o radar.`
            );
          } catch (e) {
            this.showModal('Erro na Instalação', `Falha ao gravar os arquivos do mod: ${e}`);
          }
        }
      });
    }

    if (openModsBtn) {
      openModsBtn.addEventListener('click', async () => {
        if (this.isTauri) {
          try {
            await window.__TAURI__.core.invoke('open_zomboid_mods_dir');
          } catch (e) {
            console.error('Erro ao abrir pasta mods:', e);
          }
        }
      });
    }

    if (refreshCacheBtn) {
      refreshCacheBtn.addEventListener('click', () => this.refreshCacheStats());
    }

    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', async () => {
        if (this.isTauri && confirm('Deseja realmente limpar todo o cache local de tiles do disco?')) {
          try {
            await window.__TAURI__.core.invoke('clear_tile_cache');
            this.refreshCacheStats();
          } catch (e) {
            console.error('Erro ao limpar cache:', e);
          }
        }
      });
    }

    // Configuração de opacidade da janela
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityVal = document.getElementById('opacity-val');
    if (opacitySlider && opacityVal) {
      opacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        opacityVal.textContent = `${Math.round(val * 100)}%`;
        document.body.style.opacity = `${val}`;
      });
    }
  }

  async refreshCacheStats() {
    if (!this.isTauri) return;

    try {
      const stats = await window.__TAURI__.core.invoke('get_cache_stats');
      const countEl = document.getElementById('cache-tiles-count');
      const sizeEl = document.getElementById('cache-size-mb');
      const pathEl = document.getElementById('cache-path-display');

      if (countEl) countEl.textContent = `${stats.total_tiles.toLocaleString('pt-BR')} arquivos`;
      if (sizeEl) sizeEl.textContent = `${stats.size_mb.toFixed(2)} MB`;
      if (pathEl) pathEl.textContent = stats.cache_dir;
    } catch (e) {
      console.warn('Erro ao consultar estatísticas do cache:', e);
    }
  }

  setupMiniRadarControls() {
    const btnMiniRadar = document.getElementById('btn-mini-radar');
    const btnExitMiniRadar = document.getElementById('btn-exit-mini-radar');
    const btnGtaMin = document.getElementById('btn-gta-minimize');
    const btnGtaClose = document.getElementById('btn-gta-close');

    const toggleMiniRadar = async () => {
      this.isMiniRadar = !this.isMiniRadar;
      document.body.classList.toggle('mini-radar-active', this.isMiniRadar);

      if (this.isTauri) {
        try {
          await window.__TAURI__.core.invoke('set_mini_radar_mode', { enabled: this.isMiniRadar });
        } catch (e) {
          console.error('Erro ao alternar modo mini-radar:', e);
        }
      }

      if (this.isMiniRadar) {
        this.squadTracker.followSelf = true;
        this.squadTracker.centerOnSelf();
        setTimeout(() => {
          this.mapEngine.map.invalidateSize();
        }, 150);
      } else {
        setTimeout(() => {
          this.mapEngine.map.invalidateSize();
        }, 150);
      }
    };

    if (btnMiniRadar) btnMiniRadar.addEventListener('click', toggleMiniRadar);
    if (btnExitMiniRadar) btnExitMiniRadar.addEventListener('click', toggleMiniRadar);

    // Atalho global de teclado: F9
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F9') {
        e.preventDefault();
        toggleMiniRadar();
      }
    });

    if (btnGtaMin && this.isTauri) {
      btnGtaMin.addEventListener('click', async () => {
        try {
          await window.__TAURI__.core.invoke('minimize_window');
        } catch (e) {
          console.error('Erro ao minimizar:', e);
        }
      });
    }

    if (btnGtaClose && this.isTauri) {
      btnGtaClose.addEventListener('click', async () => {
        try {
          await window.__TAURI__.core.invoke('close_window');
        } catch (e) {
          console.error('Erro ao fechar:', e);
        }
      });
    }
  }

  setupModal() {
    const modal = document.getElementById('tactical-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
      });
    }
  }

  showModal(title, htmlBody) {
    const modal = document.getElementById('tactical-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (modal && titleEl && bodyEl) {
      titleEl.innerHTML = title;
      bodyEl.innerHTML = htmlBody;
      modal.classList.add('visible');
    }
  }

  startTelemetryLoop() {
    const pollTelemetry = async () => {
      this.step++;
      if (this.isTauri) {
        try {
          const squadState = await window.__TAURI__.core.invoke('get_squad_telemetry', { step: this.step });
          this.squadTracker.updateSquad(squadState);

          const statusIndicator = document.getElementById('status-indicator');
          const serverNameDisplay = document.getElementById('server-name-display');
          const globalStatusVal = document.getElementById('global-status-val');
          const gtaHealthFill = document.getElementById('gta-health-fill');
          const gtaArmorFill = document.getElementById('gta-armor-fill');

          if (squadState && squadState.is_connected) {
            if (statusIndicator) statusIndicator.classList.add('online');
            if (serverNameDisplay) serverNameDisplay.textContent = squadState.server_name ? `Online (${squadState.server_name})` : 'Online (Live Radar)';
            if (globalStatusVal) globalStatusVal.textContent = 'ONLINE';

            const selfPlayer = squadState.players?.find((p) => p.is_self);
            if (selfPlayer) {
              if (gtaHealthFill) gtaHealthFill.style.width = `${Math.max(0, Math.min(100, selfPlayer.health || 100))}%`;
              if (gtaArmorFill) gtaArmorFill.style.width = `${Math.max(0, Math.min(100, (selfPlayer.stamina || 1.0) * 100))}%`;
            }
          } else {
            if (statusIndicator) statusIndicator.classList.remove('online');
            if (serverNameDisplay) serverNameDisplay.textContent = 'Modo Offline (Aguardando Sinal)';
            if (globalStatusVal) globalStatusVal.textContent = 'OFFLINE';
          }
        } catch (e) {
          console.warn('Erro ao obter telemetria:', e);
        }
      }

      const isMapActive = this.activeView === 'view-map' || this.isMiniRadar;
      const pollInterval = isMapActive ? 300 : 2500;
      this.telemetryTimer = setTimeout(pollTelemetry, pollInterval);
    };

    pollTelemetry();
  }

  dismissSplashScreen() {
    const splash = document.getElementById('pzhub-splash-intro');
    if (!splash) return;
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => { if (splash.parentNode) splash.remove(); }, 700);
    }, 1400);
  }
}

// Inicializacao segura - compativel com WebView2 e ES Modules
function startPZHubApp() {
  try {
    const app = new App();
    app.init();
  } catch (e) {
    console.error('[PZHub FATAL]', e);
    const splash = document.getElementById('pzhub-splash-intro');
    if (splash) splash.remove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPZHubApp);
} else {
  startPZHubApp();
}