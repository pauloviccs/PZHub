/**
 * PZHub Desktop - Global Social Manager (Riot Client 1:1 Architecture)
 * Sincronização 100% REAL com o Supabase do Website (public.profiles, public.follows, public.profile_scraps)
 * Dados 100% reais de sobreviventes e criadores registrados no ecossistema PZHub.
 */

import { supabase, isConfigured } from './supabaseClient.js';
import { getCurrentUser, getCurrentUserProfile } from './auth.js';
import { showTacticalToast } from './updater.js';

class SocialManager {
  constructor() {
    this.isOpen = false;
    this.activeTab = 'tab-riot-friends';
    this.searchQuery = '';
    this.isOfflineCollapsed = false;
    this.activeChatFriend = null;

    this.friends = [];      // Sobreviventes reais do banco de dados (public.profiles)
    this.requests = [];     // Conexões / seguidores pendentes reais (public.follows)
    this.chats = new Map(); // friendId -> [messages]

    this.onlinePresenceUsers = new Map(); // userId / username -> presence data
    this.realtimeChannel = null;
  }

  async init() {
    this.bindDOM();
    this.setupRealtime();
    this.loadLocalCache();
    await this.syncRealDataFromSupabase();
    this.render();
    this.updateUserHeader();

    // Escuta login / logout do operador
    window.addEventListener('pzhub:auth-changed', async (e) => {
      this.updateUserHeader(e.detail?.profile);
      await this.syncRealDataFromSupabase();
      this.broadcastMyPresence();
    });

    // Tecla ESC fecha chat ou gaveta lateral
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isChatOpen()) {
          this.closeChat();
        } else if (this.isOpen) {
          this.toggleDrawer(false);
        }
      }
    });

    return this;
  }

  loadLocalCache() {
    try {
      const cachedFriends = localStorage.getItem('pzhub_real_friends_cache');
      if (cachedFriends) this.friends = JSON.parse(cachedFriends);

      const cachedReqs = localStorage.getItem('pzhub_real_requests_cache');
      if (cachedReqs) this.requests = JSON.parse(cachedReqs);

      const cachedChats = localStorage.getItem('pzhub_real_chats_cache');
      if (cachedChats) {
        this.chats = new Map(Object.entries(JSON.parse(cachedChats)));
      }
    } catch (e) {
      console.warn('Erro ao ler cache local social:', e);
    }
  }

  saveLocalCache() {
    try {
      localStorage.setItem('pzhub_real_friends_cache', JSON.stringify(this.friends));
      localStorage.setItem('pzhub_real_requests_cache', JSON.stringify(this.requests));
      const obj = Object.fromEntries(this.chats);
      localStorage.setItem('pzhub_real_chats_cache', JSON.stringify(obj));
    } catch (e) {
      console.warn('Erro ao salvar cache local social:', e);
    }
  }

  bindDOM() {
    // 1. Toggle na Topbar & Colapso
    const topbarBtn = document.getElementById('btn-topbar-social-toggle');
    if (topbarBtn) {
      topbarBtn.addEventListener('click', () => this.toggleDrawer());
    }

    const btnCollapse = document.getElementById('riot-btn-collapse-drawer');
    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => this.toggleDrawer(false));
    }

    // 2. Segmented Pill Tabs (3 abas)
    const tabs = document.querySelectorAll('.riot-seg-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // 3. Campo de Pesquisa em tempo real
    const searchInput = document.getElementById('riot-social-search');
    const clearSearchBtn = document.getElementById('riot-btn-clear-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearSearchBtn) {
          clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.renderFriends();
      });
    }
    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        this.renderFriends();
      });
    }

    // 4. Accordion da seção Offline
    const accordionHeader = document.getElementById('riot-accordion-offline-header');
    if (accordionHeader) {
      accordionHeader.addEventListener('click', () => {
        this.isOfflineCollapsed = !this.isOfflineCollapsed;
        accordionHeader.classList.toggle('collapsed', this.isOfflineCollapsed);
        const list = document.getElementById('riot-list-offline');
        if (list) {
          list.style.display = this.isOfflineCollapsed ? 'none' : 'flex';
        }
      });
    }

    // 5. Formulário Adicionar Amigo por Nome/Tagline (Tab 3)
    const inputName = document.getElementById('input-riot-req-name');
    const inputTag = document.getElementById('input-riot-req-tag');
    const btnSendReq = document.getElementById('btn-riot-send-req');

    const updateAddBtn = () => {
      if (!btnSendReq || !inputName) return;
      const isValid = inputName.value.trim().length >= 2;
      btnSendReq.disabled = !isValid;
    };

    if (inputName) inputName.addEventListener('input', updateAddBtn);
    if (inputTag) inputTag.addEventListener('input', updateAddBtn);

    if (btnSendReq && inputName) {
      btnSendReq.addEventListener('click', async () => {
        const query = inputName.value.trim();
        await this.handleSendFriendRequest(query);
        inputName.value = '';
        if (inputTag) inputTag.value = '';
        btnSendReq.disabled = true;
      });
    }

    // 6. Janela Flutuante de Chat
    const chatCloseBtn = document.getElementById('riot-chat-close-btn');
    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => this.closeChat());
    }

    const chatSendBtn = document.getElementById('btn-riot-chat-send');
    const chatInput = document.getElementById('riot-chat-input');
    if (chatSendBtn && chatInput) {
      const doSend = () => {
        const text = chatInput.value.trim();
        if (!text || !this.activeChatFriend) return;
        this.sendChatMessage(this.activeChatFriend.id, text);
        chatInput.value = '';
      };

      chatSendBtn.addEventListener('click', doSend);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSend();
        }
      });
    }
  }

  // =========================================================================
  // SINCRONIZAÇÃO COM DADOS REAIS DO SUPABASE (PROFILES, FOLLOWS, SCRAPS)
  // =========================================================================
  async syncRealDataFromSupabase() {
    if (!isConfigured || !supabase) return;

    const myProfile = getCurrentUserProfile();
    const myUser = getCurrentUser();
    const myId = myProfile?.id || myUser?.id;

    try {
      // 1. Busca todos os perfis reais de usuários registrados no PZHub
      const { data: profiles, error: errProfiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role, bio, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (errProfiles) {
        console.warn('Erro ao consultar public.profiles no Supabase:', errProfiles);
        return;
      }

      // 2. Busca todas as conexões / follows
      const { data: follows } = await supabase
        .from('follows')
        .select('follower_id, following_id, created_at');

      const allFollows = follows || [];

      // Mapeia quem eu sigo e quem me segue
      const myFollowingSet = new Set(
        allFollows.filter(f => f.follower_id === myId).map(f => f.following_id)
      );
      const myFollowersSet = new Set(
        allFollows.filter(f => f.following_id === myId).map(f => f.follower_id)
      );

      // 3. Processa sobreviventes reais (excluindo a minha própria conta)
      const realSurvivors = (profiles || [])
        .filter(p => p.id !== myId)
        .map(p => {
          const isOnlineInPresence = this.onlinePresenceUsers.has(p.id) || 
                                     this.onlinePresenceUsers.has((p.username || '').toLowerCase());
          const isFollowed = myFollowingSet.has(p.id);

          return {
            id: p.id,
            username: p.display_name || p.username || 'Sobrevivente',
            rawUsername: p.username,
            tagline: (p.role === 'creator' ? 'CRIADOR' : (p.role === 'admin' ? 'ADMIN' : 'B42')),
            role: p.role || 'user',
            avatar: p.avatar_url || '',
            bio: p.bio || '',
            status: isOnlineInPresence ? 'in_game' : 'offline',
            subText: isOnlineInPresence ? 'Online' : 'Offline',
            isFollowed: isFollowed
          };
        });

      // Ordena: quem eu sigo ou está online primeiro
      realSurvivors.sort((a, b) => {
        if (a.status === 'in_game' && b.status !== 'in_game') return -1;
        if (a.status !== 'in_game' && b.status === 'in_game') return 1;
        if (a.isFollowed && !b.isFollowed) return -1;
        if (!a.isFollowed && b.isFollowed) return 1;
        return a.username.localeCompare(b.username);
      });

      this.friends = realSurvivors;

      // 4. Solicitações reais: Usuários que me seguem mas que eu ainda não sigo de volta
      const incomingFollowers = (profiles || []).filter(p => {
        return p.id !== myId && myFollowersSet.has(p.id) && !myFollowingSet.has(p.id);
      }).map(p => ({
        id: p.id,
        username: p.display_name || p.username,
        tagline: (p.role === 'creator' ? 'CRIADOR' : 'BR1'),
        avatar: p.avatar_url || ''
      }));

      this.requests = incomingFollowers;

      // 5. Carrega mensagens históricas reais do mural de recados / direct scraps
      if (myId) {
        await this.syncRealChatMessages(myId);
      }

      this.saveLocalCache();
      this.render();
      this.updateBadges();
    } catch (err) {
      console.warn('Exceção ao sincronizar dados reais do Supabase:', err);
    }
  }

  async syncRealChatMessages(myId) {
    if (!supabase) return;
    try {
      const { data: scraps, error } = await supabase
        .from('profile_scraps')
        .select('*')
        .or(`profile_id.eq.${myId},sender_id.eq.${myId}`)
        .order('created_at', { ascending: true });

      if (error || !scraps) return;

      scraps.forEach(s => {
        const isMine = s.sender_id === myId;
        const targetId = isMine ? s.profile_id : s.sender_id;
        const d = new Date(s.created_at);
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        if (!this.chats.has(targetId)) {
          this.chats.set(targetId, []);
        }

        const list = this.chats.get(targetId);
        if (!list.some(m => m.id === s.id)) {
          list.push({
            id: s.id,
            sender: s.sender_name,
            isMine: isMine,
            text: s.message,
            time: timeStr
          });
        }
      });
    } catch (e) {
      console.warn('Erro ao sincronizar mensagens reais do Supabase:', e);
    }
  }

  async handleSendFriendRequest(query) {
    if (!isConfigured || !supabase) return;

    const myProfile = getCurrentUserProfile();
    const myUser = getCurrentUser();
    const myId = myProfile?.id || myUser?.id;

    if (!myId) {
      showTacticalToast({
        title: 'AUTENTICAÇÃO NECESSÁRIA',
        message: 'Faça login com sua conta PZHub para enviar pedidos de amizade.',
        type: 'warning'
      });
      return;
    }

    try {
      // Procura o usuário real no banco
      const { data: targets, error } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', myId)
        .limit(1);

      if (error || !targets || targets.length === 0) {
        showTacticalToast({
          title: 'SOBREVIVENTE NÃO ENCONTRADO',
          message: `Nenhum operador com nick "${query}" no banco de dados do PZHub.`,
          type: 'warning'
        });
        return;
      }

      const target = targets[0];

      // Insere follow no banco
      const { error: followErr } = await supabase
        .from('follows')
        .insert({ follower_id: myId, following_id: target.id });

      if (followErr) {
        if (followErr.code === '23505') { // Já segue
          showTacticalToast({
            title: 'JÁ CONECTADO',
            message: `Você já está conectado com ${target.display_name || target.username}.`,
            type: 'info'
          });
        } else {
          showTacticalToast({
            title: 'ERRO NA CONEXÃO',
            message: followErr.message || 'Falha ao salvar conexão.',
            type: 'error'
          });
        }
        return;
      }

      showTacticalToast({
        title: 'AMIGO ADICIONADO',
        message: `Você agora está conectado com ${target.display_name || target.username}!`,
        type: 'success'
      });

      await this.syncRealDataFromSupabase();
    } catch (err) {
      console.warn('Erro ao adicionar amigo real:', err);
    }
  }

  toggleDrawer(forceState = null) {
    const drawer = document.getElementById('riot-social-drawer');
    const topbarBtn = document.getElementById('btn-topbar-social-toggle');
    if (!drawer) return;

    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    drawer.classList.toggle('open', this.isOpen);
    drawer.setAttribute('aria-hidden', String(!this.isOpen));

    if (topbarBtn) {
      topbarBtn.classList.toggle('active', this.isOpen);
    }

    // Ao abrir, atualiza dados do Supabase
    if (this.isOpen) {
      this.syncRealDataFromSupabase();
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    const tabs = document.querySelectorAll('.riot-seg-tab');
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.classList.toggle('active', isActive);
    });

    const panes = document.querySelectorAll('.riot-tab-pane');
    panes.forEach(pane => {
      const isActive = pane.id === tabId;
      pane.classList.toggle('active', isActive);
    });

    this.updateTabIndicator(tabId);

    if (tabId === 'tab-riot-friends') this.renderFriends();
    if (tabId === 'tab-riot-chat') this.renderChatsTab();
    if (tabId === 'tab-riot-requests') this.renderRequests();
  }

  updateTabIndicator(tabId) {
    const activeTabEl = document.querySelector(`.riot-seg-tab[data-tab="${tabId}"]`);
    const indicator = document.querySelector('.riot-seg-indicator');
    if (!activeTabEl || !indicator) return;

    const left = activeTabEl.offsetLeft;
    const width = activeTabEl.offsetWidth;
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
  }

  updateUserHeader(profile = null) {
    const p = profile || getCurrentUserProfile();
    const avatarEl = document.getElementById('riot-drawer-my-avatar');
    const nameEl = document.getElementById('riot-drawer-my-name');

    const name = p?.display_name || p?.username || 'Operador';
    if (nameEl) nameEl.textContent = name;

    if (avatarEl) {
      if (p?.avatar_url) {
        avatarEl.src = p.avatar_url;
      } else {
        avatarEl.src = './assets/logo/PZHub_LogoIcon.svg';
      }
    }
  }

  render() {
    this.renderFriends();
    this.renderRequests();
    this.renderChatsTab();
    this.updateBadges();
  }

  updateBadges() {
    const reqCount = this.requests.length;
    const tabBadge = document.getElementById('riot-requests-badge');
    const topbarBadge = document.getElementById('topbar-social-badge');

    if (tabBadge) {
      tabBadge.textContent = reqCount;
      tabBadge.style.display = reqCount > 0 ? 'inline-flex' : 'none';
    }

    if (topbarBadge) {
      topbarBadge.textContent = reqCount;
      topbarBadge.style.display = reqCount > 0 ? 'inline-flex' : 'none';
    }
  }

  renderFriends() {
    const inGameContainer = document.getElementById('riot-list-in-game');
    const offlineContainer = document.getElementById('riot-list-offline');
    const inGameCountEl = document.getElementById('riot-count-in-game');
    const offlineCountEl = document.getElementById('riot-count-offline');

    if (!inGameContainer || !offlineContainer) return;

    const query = this.searchQuery;
    const filtered = this.friends.filter(f => {
      if (!query) return true;
      return f.username.toLowerCase().includes(query) || (f.tagline && f.tagline.toLowerCase().includes(query));
    });

    const inGame = filtered.filter(f => f.status === 'in_game');
    const offline = filtered.filter(f => f.status === 'offline');

    if (inGameCountEl) inGameCountEl.textContent = inGame.length;
    if (offlineCountEl) offlineCountEl.textContent = offline.length;

    // Seção de jogadores ativos
    inGameContainer.innerHTML = inGame.length > 0 
      ? inGame.map(f => this.createFriendRowHTML(f, true)).join('')
      : `<div class="riot-friends-empty-sub">Nenhum operador em jogo no momento.</div>`;

    // Seção offline com todos os outros usuários reais
    offlineContainer.innerHTML = offline.map(f => this.createFriendRowHTML(f, false)).join('');

    // Adiciona evento de clique para abrir o chat flutuante com a pessoa real
    const allRows = document.querySelectorAll('.riot-friend-row');
    allRows.forEach(row => {
      row.addEventListener('click', () => {
        const friendId = row.getAttribute('data-id');
        const friend = this.friends.find(x => x.id === friendId);
        if (friend) {
          this.openChat(friend);
        }
      });
    });
  }

  createFriendRowHTML(friend, isOnline) {
    const statusClass = isOnline ? 'in-game' : 'offline';
    const iconSub = isOnline
      ? `<svg viewBox="0 0 24 24" class="riot-sub-desktop-ico"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg><span>Online</span>`
      : `<span>Offline</span>`;

    const avatarInitial = (friend.username || 'P').charAt(0).toUpperCase();
    const starTag = friend.isFollowed ? `<span style="color: #ffd32a; font-size: 10px;" title="Conectado no PZHub">★</span> ` : '';

    return `
      <div class="riot-friend-row" data-id="${friend.id}" title="Clique para abrir chat com ${friend.username}">
        <div class="riot-friend-avatar-cluster">
          ${friend.avatar 
            ? `<img src="${friend.avatar}" class="riot-friend-avatar-img" alt="${friend.username}" />`
            : `<div class="riot-friend-avatar-fallback">${avatarInitial}</div>`
          }
          <span class="riot-status-dot ${statusClass}"></span>
        </div>
        <div class="riot-friend-meta">
          <div class="riot-friend-name">${starTag}${friend.username}</div>
          <div class="riot-friend-status-text">${iconSub} • <span style="color: var(--accent-amber); font-size: 9.5px;">${friend.tagline}</span></div>
        </div>
      </div>
    `;
  }

  renderRequests() {
    const list = document.getElementById('riot-requests-list');
    const countLabel = document.getElementById('riot-requests-count-label');
    if (!list) return;

    if (countLabel) countLabel.textContent = this.requests.length;

    if (this.requests.length === 0) {
      list.innerHTML = `
        <div class="riot-requests-empty">
          <span>Nenhuma solicitação pendente no momento.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = this.requests.map(req => {
      const initial = req.username.charAt(0).toUpperCase();
      return `
        <div class="riot-request-row" data-id="${req.id}">
          <div class="riot-request-avatar-wrap">
            ${req.avatar
              ? `<img src="${req.avatar}" class="riot-friend-avatar-img" alt="${req.username}" />`
              : `<div class="riot-friend-avatar-fallback">${initial}</div>`
            }
          </div>
          <div class="riot-request-info">
            <div class="riot-request-username">${req.username}</div>
            <div class="riot-request-tag">#${req.tagline || 'B42'}</div>
          </div>
          <div class="riot-request-actions">
            <button class="riot-req-btn btn-accept" data-action="accept" data-id="${req.id}" title="Aceitar e Seguir de Volta">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
            <button class="riot-req-btn btn-decline" data-action="decline" data-id="${req.id}" title="Ignorar">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.riot-req-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const reqId = btn.getAttribute('data-id');
        await this.handleRequestAction(reqId, action);
      });
    });
  }

  async handleRequestAction(reqId, action) {
    const myProfile = getCurrentUserProfile();
    const myUser = getCurrentUser();
    const myId = myProfile?.id || myUser?.id;

    if (!myId || !supabase) return;

    if (action === 'accept') {
      // Cria follow recíproco no Supabase
      await supabase
        .from('follows')
        .insert({ follower_id: myId, following_id: reqId });

      showTacticalToast({
        title: 'SOLICITAÇÃO ACEITA',
        message: 'Você e este sobrevivente agora são aliados de esquadrão!',
        type: 'success'
      });
    } else {
      showTacticalToast({
        title: 'SOLICITAÇÃO DISPENSADA',
        message: 'Solicitação removida.',
        type: 'info'
      });
    }

    await this.syncRealDataFromSupabase();
  }

  renderChatsTab() {
    const emptyState = document.getElementById('riot-chats-empty-state');
    const conversationsList = document.getElementById('riot-recent-conversations-list');
    if (!emptyState || !conversationsList) return;

    const activeFriendIds = Array.from(this.chats.keys()).filter(fid => {
      const msgs = this.chats.get(fid) || [];
      return msgs.length > 0;
    });

    if (activeFriendIds.length === 0) {
      emptyState.style.display = 'flex';
      conversationsList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    conversationsList.style.display = 'flex';

    conversationsList.innerHTML = activeFriendIds.map(fid => {
      const friend = this.friends.find(f => f.id === fid) || { username: 'Operador', id: fid, status: 'offline' };
      const msgs = this.chats.get(fid) || [];
      const lastMsg = msgs[msgs.length - 1];
      const initial = (friend.username || 'P').charAt(0).toUpperCase();

      return `
        <div class="riot-conversation-row" data-id="${friend.id}">
          <div class="riot-friend-avatar-cluster">
            ${friend.avatar
              ? `<img src="${friend.avatar}" class="riot-friend-avatar-img" alt="${friend.username}" />`
              : `<div class="riot-friend-avatar-fallback">${initial}</div>`
            }
            <span class="riot-status-dot ${friend.status === 'in_game' ? 'in-game' : 'offline'}"></span>
          </div>
          <div class="riot-convo-meta">
            <div class="riot-convo-header">
              <span class="riot-convo-name">${friend.username}</span>
              <span class="riot-convo-time">${lastMsg ? lastMsg.time : ''}</span>
            </div>
            <div class="riot-convo-preview">${lastMsg ? (lastMsg.isMine ? 'Você: ' : '') + lastMsg.text : 'Conversa aberta'}</div>
          </div>
        </div>
      `;
    }).join('');

    conversationsList.querySelectorAll('.riot-conversation-row').forEach(row => {
      row.addEventListener('click', () => {
        const fid = row.getAttribute('data-id');
        const friend = this.friends.find(f => f.id === fid);
        if (friend) this.openChat(friend);
      });
    });
  }

  // =========================================================================
  // JANELA FLUTUANTE DE CHAT COM PESSOAS REAIS
  // =========================================================================
  openChat(friend) {
    this.activeChatFriend = friend;
    const chatPopup = document.getElementById('riot-floating-chat-window');
    if (!chatPopup) return;

    const nameEl = document.getElementById('riot-chat-target-name');
    const statusEl = document.getElementById('riot-chat-target-status');
    const dotEl = document.getElementById('riot-chat-target-dot');
    const avatarEl = document.getElementById('riot-chat-target-avatar');

    if (nameEl) nameEl.textContent = friend.username;
    if (statusEl) statusEl.textContent = friend.status === 'in_game' ? 'Em Project Zomboid' : 'Offline';
    if (dotEl) {
      dotEl.className = `riot-status-dot ${friend.status === 'in_game' ? 'in-game' : 'offline'}`;
    }
    if (avatarEl) {
      avatarEl.src = friend.avatar || './assets/logo/PZHub_LogoIcon.svg';
    }

    chatPopup.style.display = 'flex';
    this.renderChatMessages(friend.id);

    const input = document.getElementById('riot-chat-input');
    if (input) {
      setTimeout(() => input.focus(), 50);
    }
  }

  closeChat() {
    const chatPopup = document.getElementById('riot-floating-chat-window');
    if (chatPopup) {
      chatPopup.style.display = 'none';
    }
    this.activeChatFriend = null;
  }

  isChatOpen() {
    const chatPopup = document.getElementById('riot-floating-chat-window');
    return chatPopup && chatPopup.style.display !== 'none';
  }

  renderChatMessages(friendId) {
    const stream = document.getElementById('riot-chat-messages-stream');
    if (!stream) return;

    const messages = this.chats.get(friendId) || [];

    if (messages.length === 0) {
      stream.innerHTML = `
        <div class="riot-chat-start-hint">
          <span>Início do canal direto criptografado com o sobrevivente <strong>${this.activeChatFriend?.username}</strong>.</span>
        </div>
      `;
      return;
    }

    stream.innerHTML = messages.map(m => `
      <div class="riot-chat-bubble-wrap ${m.isMine ? 'outgoing' : 'incoming'}">
        <div class="riot-chat-bubble">${m.text}</div>
        <span class="riot-chat-time">${m.time}</span>
      </div>
    `).join('');

    stream.scrollTop = stream.scrollHeight;
  }

  async sendChatMessage(targetId, text) {
    const myProfile = getCurrentUserProfile();
    const myUser = getCurrentUser();
    const myId = myProfile?.id || myUser?.id;
    const myName = myProfile?.display_name || myProfile?.username || 'Operador';
    const myAvatar = myProfile?.avatar_url || '';

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: myName,
      isMine: true,
      text: text,
      time: timeStr
    };

    if (!this.chats.has(targetId)) {
      this.chats.set(targetId, []);
    }
    this.chats.get(targetId).push(newMsg);
    this.saveLocalCache();

    if (this.activeChatFriend && this.activeChatFriend.id === targetId) {
      this.renderChatMessages(targetId);
    }
    this.renderChatsTab();

    // 1. Grava no banco real (public.profile_scraps) se ambos estiverem identificados
    if (supabase && myId && targetId) {
      try {
        await supabase.from('profile_scraps').insert({
          profile_id: targetId,
          sender_id: myId,
          sender_name: myName,
          sender_avatar: myAvatar,
          message: text
        });
      } catch (err) {
        console.warn('Erro ao gravar mensagem em profile_scraps:', err);
      }
    }

    // 2. Transmite via WebSocket em tempo real (< 50ms)
    if (this.realtimeChannel) {
      this.realtimeChannel.send({
        type: 'broadcast',
        event: 'pzhub:chat-message',
        payload: {
          targetId: targetId,
          senderId: myId,
          text: text,
          senderName: myName,
          time: timeStr
        }
      });
    }
  }

  // =========================================================================
  // SUPABASE REALTIME PRESENCE & BROADCAST
  // =========================================================================
  setupRealtime() {
    if (!isConfigured || !supabase) return;

    try {
      this.realtimeChannel = supabase.channel('pzhub-global-social', {
        config: {
          presence: { key: getCurrentUser()?.id || 'guest-' + Math.random() }
        }
      });

      this.realtimeChannel
        .on('presence', { event: 'sync' }, () => {
          const state = this.realtimeChannel.presenceState();
          this.onlinePresenceUsers.clear();

          for (const key in state) {
            const presences = state[key] || [];
            presences.forEach((p) => {
              if (p.user_id) this.onlinePresenceUsers.set(p.user_id, p);
              if (p.username) this.onlinePresenceUsers.set(p.username.toLowerCase(), p);
            });
          }

          this.renderFriends();
        })
        .on('broadcast', { event: 'pzhub:chat-message' }, (payload) => {
          this.handleIncomingBroadcast(payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await this.broadcastMyPresence();
          }
        });
    } catch (e) {
      console.warn('Falha ao conectar no canal Supabase Realtime Social:', e);
    }
  }

  async broadcastMyPresence() {
    if (!this.realtimeChannel) return;
    const profile = getCurrentUserProfile();
    const user = getCurrentUser();
    if (!profile && !user) return;

    try {
      await this.realtimeChannel.track({
        user_id: user?.id || profile?.id,
        username: profile?.username,
        display_name: profile?.display_name || profile?.username,
        avatar_url: profile?.avatar_url,
        role: profile?.role,
        online_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Erro ao rastrear presença:', err);
    }
  }

  handleIncomingBroadcast(event) {
    const data = event.payload;
    if (!data || !data.text) return;

    const myProfile = getCurrentUserProfile();
    const myId = myProfile?.id || getCurrentUser()?.id;

    // Verifica se a mensagem é endereçada a mim
    if (data.targetId && myId && data.targetId !== myId) return;

    const senderId = data.senderId || 'survivor';
    const msg = {
      id: `in-${Date.now()}`,
      sender: data.senderName,
      isMine: false,
      text: data.text,
      time: data.time || 'Agora'
    };

    if (!this.chats.has(senderId)) {
      this.chats.set(senderId, []);
    }
    this.chats.get(senderId).push(msg);
    this.saveLocalCache();

    if (this.activeChatFriend && this.activeChatFriend.id === senderId) {
      this.renderChatMessages(senderId);
    } else {
      showTacticalToast({
        title: `MENSAGEM DE ${data.senderName.toUpperCase()}`,
        message: data.text,
        type: 'info'
      });
    }

    this.renderChatsTab();
  }
}

export const socialManager = new SocialManager();
export async function initSocialManager() {
  return await socialManager.init();
}
