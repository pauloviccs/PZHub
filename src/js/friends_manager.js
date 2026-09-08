/**
 * VICCS_PZHub - Gerenciador Tático de Amigos & Painel Social Estilo Riot Client
 * Sincronizado 100% com o Supabase (Perfis, Fotos e Presença em Tempo Real entre Usuários Desktop)
 */

import { supabase, isConfigured } from './supabaseClient.js';
import { getCurrentUser, getCurrentUserProfile } from './auth.js';

export class FriendsManager {
  constructor(mapEngine, squadTracker, containerId) {
    this.mapEngine = mapEngine;
    this.squadTracker = squadTracker;
    this.container = document.getElementById(containerId);

    // Elementos da Interface Social Estilo Riot Client
    this.onlineListEl = document.getElementById('riot-online-list');
    this.offlineListEl = document.getElementById('riot-offline-list');
    this.countFriendsBadge = document.getElementById('riot-friends-count-badge');
    this.countLiveBadge = document.getElementById('riot-live-count-badge');
    this.countOnlineDisplay = document.getElementById('count-online-display');
    this.countOfflineDisplay = document.getElementById('count-offline-display');
    this.searchInput = document.getElementById('riot-friends-search-input');
    this.clearSearchBtn = document.getElementById('btn-clear-friend-search');
    this.drawer = document.getElementById('riot-add-friend-drawer');
    this.btnToggleDrawer = document.getElementById('btn-toggle-add-friend');
    this.btnCloseDrawer = document.getElementById('btn-close-add-drawer');
    this.accordionOffline = document.getElementById('toggle-offline-accordion');

    this.friends = [];
    this.searchQuery = '';
    this.isOfflineCollapsed = false;
    this.isTauri = typeof window.__TAURI__ !== 'undefined';

    // Presença em tempo real do Supabase (para saber quem está com o PZHub aberto)
    this.onlineDesktopUsers = new Map(); // username.toLowerCase() -> presenceData
    this.presenceChannel = null;
  }

  async init() {
    await this.loadFriends();
    this.setupSubtabs();
    this.setupUserProfile();
    this.setupSearch();
    this.setupDrawer();
    this.setupColorSwatches();
    this.setupAccordion();
    this.setupForm();
    this.setupPresence();
    await this.syncFriendsWithSupabase();
    this.render();
    return this;
  }

  async loadFriends() {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        this.friends = await window.__TAURI__.core.invoke('get_friends');
      } catch (err) {
        console.warn('Erro ao carregar amigos do Rust:', err);
        this.loadLocal();
      }
    } else {
      this.loadLocal();
    }
  }

  loadLocal() {
    try {
      const stored = localStorage.getItem('viccs_friends_list');
      this.friends = stored ? JSON.parse(stored) : [];
    } catch {
      this.friends = [];
    }
  }

  async saveFriends() {
    try {
      localStorage.setItem('viccs_friends_list', JSON.stringify(this.friends));
    } catch (e) {
      console.warn('Erro ao salvar amigos localmente:', e);
    }
  }

  setupUserProfile() {
    this.updateMyProfileUI();

    // Ouve eventos de login/logout disparados pelo módulo de autenticação
    window.addEventListener('pzhub:auth-changed', async (e) => {
      this.updateMyProfileUI(e.detail?.profile);
      await this.broadcastPresence();
      await this.syncFriendsWithSupabase();
    });
  }

  updateMyProfileUI(customProfile = null) {
    const avatarEl = document.getElementById('riot-my-avatar');
    const nameEl = document.getElementById('riot-my-name');
    const subtitleEl = document.querySelector('.riot-user-subtitle');
    const indicatorEl = document.querySelector('.riot-avatar-cluster .riot-status-indicator');

    let profile = customProfile || getCurrentUserProfile();
    if (!profile) {
      try {
        const stored = localStorage.getItem('pzhub_operator_profile');
        if (stored) profile = JSON.parse(stored);
      } catch (e) {}
    }

    if (profile) {
      const displayName = profile.display_name || profile.username || 'Operador';
      const avatarUrl = profile.avatar_url || './assets/logo/PZHub_LogoIcon.svg';

      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) {
        avatarEl.src = avatarUrl;
        avatarEl.onerror = () => { avatarEl.src = './assets/logo/PZHub_LogoIcon.svg'; };
      }
      if (indicatorEl) {
        indicatorEl.className = 'riot-status-indicator online';
        indicatorEl.title = 'Conectado ao PZHub';
      }
      if (subtitleEl) {
        subtitleEl.innerHTML = '<span class="riot-sub-dot"></span><span>Online no PZHub</span>';
      }
    } else {
      if (nameEl) nameEl.textContent = 'Operador';
      if (avatarEl) avatarEl.src = './assets/logo/PZHub_LogoIcon.svg';
      if (indicatorEl) {
        indicatorEl.className = 'riot-status-indicator';
        indicatorEl.title = 'Modo Offline (Não logado)';
      }
      if (subtitleEl) {
        subtitleEl.innerHTML = '<span class="riot-sub-dot" style="background: #64748b;"></span><span style="color: #64748b;">Aguardando Login</span>';
      }
    }
  }

  /**
   * Configura o canal de presença global do Supabase para sincronizar status de quem está com o app aberto
   */
  setupPresence() {
    if (!isConfigured || !supabase) return;

    try {
      const user = getCurrentUser();
      const channelKey = user?.id || `anon-${Math.random().toString(36).substring(2, 9)}`;

      this.presenceChannel = supabase.channel('pzhub-global-presence', {
        config: {
          presence: { key: channelKey }
        }
      });

      this.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = this.presenceChannel.presenceState();
          this.onlineDesktopUsers.clear();

          for (const key in state) {
            const presences = state[key] || [];
            presences.forEach((p) => {
              if (p.username) {
                this.onlineDesktopUsers.set(p.username.toLowerCase(), p);
              }
            });
          }

          this.render();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await this.broadcastPresence();
          }
        });
    } catch (err) {
      console.warn('Erro ao inicializar presença Supabase:', err);
    }
  }

  /**
   * Transmite o perfil do usuário logado atual para todos os outros usuários do PZHub Desktop
   */
  async broadcastPresence() {
    if (!this.presenceChannel) return;
    const user = getCurrentUser();
    const profile = getCurrentUserProfile();
    if (!user || !profile) return;

    try {
      await this.presenceChannel.track({
        user_id: user.id,
        username: profile.username,
        display_name: profile.display_name || profile.username,
        avatar_url: profile.avatar_url,
        role: profile.role,
        online_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Erro ao rastrear presença:', err);
    }
  }

  /**
   * Consulta a tabela `profiles` do Supabase para puxar a foto e o nome sincronizado de cada amigo
   */
  async syncFriendsWithSupabase() {
    if (!isConfigured || !supabase || this.friends.length === 0) return;

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role, bio');

      if (error) {
        console.warn('Erro ao consultar perfis de amigos no Supabase:', error);
        return;
      }

      if (profiles && profiles.length > 0) {
        let changed = false;

        profiles.forEach((p) => {
          const uname = (p.username || '').toLowerCase();
          const friend = this.friends.find((f) => f.username.toLowerCase() === uname);
          if (friend) {
            if (friend.avatar_url !== p.avatar_url || friend.db_display_name !== p.display_name) {
              friend.avatar_url = p.avatar_url;
              friend.db_display_name = p.display_name;
              friend.role = p.role;
              changed = true;
            }
          }
        });

        if (changed) {
          this.saveFriends();
          this.render();
        }
      }
    } catch (err) {
      console.warn('Exceção ao sincronizar perfis com Supabase:', err);
    }
  }

  setupSubtabs() {
    const subtabButtons = document.querySelectorAll('.riot-toolbar-btn');
    const subtabFriends = document.getElementById('subtab-friends-content');
    const subtabLive = document.getElementById('subtab-live-content');

    subtabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetSubtab = btn.getAttribute('data-subtab');
        subtabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (targetSubtab === 'subtab-friends') {
          if (subtabFriends) subtabFriends.style.display = 'block';
          if (subtabLive) subtabLive.style.display = 'none';
        } else if (targetSubtab === 'subtab-live-radar') {
          if (subtabFriends) subtabFriends.style.display = 'none';
          if (subtabLive) subtabLive.style.display = 'block';
        }
      });
    });
  }

  setupSearch() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.style.display = this.searchQuery.length > 0 ? 'block' : 'none';
        }
        this.render();
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        this.searchQuery = '';
        this.clearSearchBtn.style.display = 'none';
        this.render();
      });
    }
  }

  setupDrawer() {
    if (this.btnToggleDrawer && this.drawer) {
      this.btnToggleDrawer.addEventListener('click', () => {
        const isOpen = this.drawer.classList.toggle('open');
        this.btnToggleDrawer.classList.toggle('active', isOpen);
        if (isOpen) {
          const inputName = document.getElementById('input-friend-name');
          if (inputName) setTimeout(() => inputName.focus(), 100);
        }
      });
    }

    if (this.btnCloseDrawer && this.drawer) {
      this.btnCloseDrawer.addEventListener('click', () => {
        this.drawer.classList.remove('open');
        if (this.btnToggleDrawer) this.btnToggleDrawer.classList.remove('active');
      });
    }
  }

  setupColorSwatches() {
    const swatches = document.querySelectorAll('.swatch-btn');
    const colorInput = document.getElementById('select-friend-color');

    swatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color') || '#ffdd59';
        if (colorInput) colorInput.value = color;
      });
    });
  }

  setupAccordion() {
    if (this.accordionOffline && this.offlineListEl) {
      this.accordionOffline.addEventListener('click', () => {
        this.isOfflineCollapsed = !this.isOfflineCollapsed;
        this.accordionOffline.classList.toggle('collapsed', this.isOfflineCollapsed);
        this.offlineListEl.classList.toggle('collapsed', this.isOfflineCollapsed);
      });
    }
  }

  setupForm() {
    const btnAdd = document.getElementById('btn-add-friend');
    const inputName = document.getElementById('input-friend-name');
    const inputNick = document.getElementById('input-friend-nick');
    const selectColor = document.getElementById('select-friend-color');

    if (btnAdd && inputName) {
      btnAdd.addEventListener('click', async () => {
        const username = inputName.value.trim();
        const nickname = inputNick ? inputNick.value.trim() : '';
        const color = selectColor ? selectColor.value : '#ffdd59';

        if (!username) return;

        // Pré-consulta o Supabase para já salvar avatar e display_name oficiais
        let avatar_url = null;
        let db_display_name = null;
        if (isConfigured && supabase) {
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('avatar_url, display_name, username')
              .ilike('username', username)
              .maybeSingle();

            if (prof) {
              avatar_url = prof.avatar_url;
              db_display_name = prof.display_name;
            }
          } catch (e) {
            console.warn('Erro ao consultar perfil:', e);
          }
        }

        const newFriend = {
          username,
          nickname: nickname || db_display_name || null,
          steam_id: null,
          color,
          avatar_url,
          db_display_name
        };

        if (this.isTauri && window.__TAURI__?.core?.invoke) {
          try {
            this.friends = await window.__TAURI__.core.invoke('add_friend', { friend: newFriend });
          } catch (err) {
            this.addLocal(newFriend);
          }
        } else {
          this.addLocal(newFriend);
        }

        inputName.value = '';
        if (inputNick) inputNick.value = '';
        if (this.drawer) this.drawer.classList.remove('open');
        if (this.btnToggleDrawer) this.btnToggleDrawer.classList.remove('active');

        this.render();
        this.squadTracker.setFriendsList(this.friends);
      });
    }
  }

  addLocal(friend) {
    this.friends = this.friends.filter((f) => f.username.toLowerCase() !== friend.username.toLowerCase());
    this.friends.push(friend);
    this.saveFriends();
  }

  async removeFriend(username) {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        this.friends = await window.__TAURI__.core.invoke('remove_friend', { username });
      } catch (err) {
        this.friends = this.friends.filter((f) => f.username.toLowerCase() !== username.toLowerCase());
        this.saveFriends();
      }
    } else {
      this.friends = this.friends.filter((f) => f.username.toLowerCase() !== username.toLowerCase());
      this.saveFriends();
    }
    this.render();
    this.squadTracker.setFriendsList(this.friends);
  }

  render() {
    // Atualiza contadores nas badges de subtab
    if (this.countFriendsBadge) {
      this.countFriendsBadge.textContent = this.friends.length;
    }

    const onlinePlayers = this.squadTracker.players || [];
    const nonSelfPlayers = onlinePlayers.filter((p) => !p.is_self);
    if (this.countLiveBadge) {
      this.countLiveBadge.textContent = nonSelfPlayers.length;
    }

    // Filtra amigos pela pesquisa rápida
    let filteredFriends = this.friends;
    if (this.searchQuery) {
      filteredFriends = this.friends.filter((f) => {
        const u = f.username.toLowerCase();
        const n = (f.nickname || '').toLowerCase();
        const d = (f.db_display_name || '').toLowerCase();
        return u.includes(this.searchQuery) || n.includes(this.searchQuery) || d.includes(this.searchQuery);
      });
    }

    // Divide em grupos: Online e Offline
    const onlineFriends = [];
    const offlineFriends = [];

    filteredFriends.forEach((friend) => {
      // 1. Detectado no radar do Project Zomboid (jogo aberto)
      const inGamePlayer = onlinePlayers.find(
        (p) => p.name.toLowerCase() === friend.username.toLowerCase() && !p.is_self
      );

      // 2. Detectado online no PZHub Desktop (Supabase presence)
      const desktopPresence = this.onlineDesktopUsers.get(friend.username.toLowerCase());

      if (inGamePlayer) {
        onlineFriends.push({ friend, detected: inGamePlayer, presence: desktopPresence, type: 'game' });
      } else if (desktopPresence) {
        onlineFriends.push({ friend, detected: null, presence: desktopPresence, type: 'desktop' });
      } else {
        offlineFriends.push({ friend, detected: null, presence: null, type: 'offline' });
      }
    });

    // Atualiza contadores dos grupos
    if (this.countOnlineDisplay) this.countOnlineDisplay.textContent = onlineFriends.length;
    if (this.countOfflineDisplay) this.countOfflineDisplay.textContent = offlineFriends.length;

    // Renderiza lista Online
    if (this.onlineListEl) {
      if (onlineFriends.length === 0) {
        this.onlineListEl.innerHTML = `
          <div class="riot-empty-state">
            ${this.searchQuery ? 'Nenhum amigo online encontrado.' : 'Nenhum amigo detectado online agora.'}
          </div>
        `;
      } else {
        this.onlineListEl.innerHTML = onlineFriends
          .map(({ friend, detected, presence, type }) => this.createFriendRowHtml(friend, detected, presence, type))
          .join('');
      }
    }

    // Renderiza lista Offline
    if (this.offlineListEl) {
      if (offlineFriends.length === 0) {
        this.offlineListEl.innerHTML = `
          <div class="riot-empty-state">
            ${this.searchQuery ? 'Nenhum contato offline corresponde à busca.' : 'Nenhum amigo offline.'}
          </div>
        `;
      } else {
        this.offlineListEl.innerHTML = offlineFriends
          .map(({ friend }) => this.createFriendRowHtml(friend, null, null, 'offline'))
          .join('');
      }
    }

    // Vincula eventos dos botões de remoção
    document.querySelectorAll('.friend-action-btn.remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const username = btn.getAttribute('data-user');
        if (username) this.removeFriend(username);
      });
    });

    // Vincula eventos dos botões de GPS
    document.querySelectorAll('.friend-action-btn.gps').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const x = parseFloat(btn.getAttribute('data-x'));
        const y = parseFloat(btn.getAttribute('data-y'));
        const name = btn.getAttribute('data-name');
        if (!isNaN(x) && !isNaN(y)) {
          this.mapEngine.setGpsDestination(x, y, `Amigo: ${name}`);
        }
      });
    });

    // Mantém compatibilidade com fallback legado
    if (this.container && this.container.style.display !== 'none') {
      this.container.innerHTML = '';
    }
  }

  createFriendRowHtml(friend, detected, presence, type) {
    const isGameOnline = type === 'game';
    const isDesktopOnline = type === 'desktop';
    const isOnline = isGameOnline || isDesktopOnline;

    // Foto do perfil sincronizada: prioriza presence -> avatar salvo -> fallback de iniciais
    const avatarUrl = presence?.avatar_url || friend.avatar_url || null;

    // Nome oficial: apelido customizado > apelido do banco de dados > username
    const mainNick = friend.nickname || presence?.display_name || friend.db_display_name;
    const displayName = mainNick ? `${mainNick} (${friend.username})` : friend.username;
    const initial = (mainNick || friend.username).substring(0, 2).toUpperCase();
    const customColor = friend.color || '#ffdd59';

    let statusLineHtml = '';
    let gpsButtonHtml = '';
    let statusDotClass = 'offline';

    if (isGameOnline && detected) {
      statusDotClass = 'online';
      let distText = '';
      if (this.squadTracker.selfPlayer) {
        const dist = Math.round(
          Math.hypot(
            detected.x - this.squadTracker.selfPlayer.x,
            detected.y - this.squadTracker.selfPlayer.y
          )
        );
        distText = ` • <span class="friend-dist-pill">${dist}m</span>`;
      }

      statusLineHtml = `
        <div class="friend-status-line online">
          <span>ONLINE NO RADAR</span>${distText}
        </div>
      `;

      gpsButtonHtml = `
        <button class="friend-action-btn gps" data-x="${detected.x}" data-y="${detected.y}" data-name="${displayName}" title="Traçar rota GPS até ${displayName}">
          <svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </button>
      `;
    } else if (isDesktopOnline) {
      statusDotClass = 'desktop';
      statusLineHtml = `
        <div class="friend-status-line online" style="color: var(--accent-cyan, #00d2d3);">
          <span>ONLINE NO PZHUB</span>
        </div>
      `;
    } else {
      statusDotClass = 'offline';
      statusLineHtml = `
        <div class="friend-status-line">
          <span>Offline</span>
        </div>
      `;
    }

    const avatarInnerHtml = avatarUrl
      ? `<img class="friend-avatar-img" src="${avatarUrl}" alt="${displayName}" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="friend-avatar-fallback" style="display: none;">${initial}</span>`
      : `<span class="friend-avatar-fallback">${initial}</span>`;

    return `
      <div class="riot-friend-row" data-username="${friend.username}">
        <div class="friend-row-left">
          <div class="friend-avatar-wrap">
            <div class="friend-avatar-circle" style="border-color: ${customColor}50;">
              ${avatarInnerHtml}
            </div>
            <span class="friend-dot-status ${statusDotClass}"></span>
          </div>
          <div class="friend-info-col">
            <div class="friend-title-line">
              <span class="friend-tactical-star" style="color: ${customColor};" title="Marcador tático no radar">★</span>
              <span class="friend-name" title="${friend.username}">${displayName}</span>
            </div>
            ${statusLineHtml}
          </div>
        </div>
        <div class="friend-row-actions">
          ${gpsButtonHtml}
          <button class="friend-action-btn remove" data-user="${friend.username}" title="Remover contato do radar">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      </div>
    `;
  }
}
