/**
 * PZHub Desktop - Authentication & User Profile Module
 * Sincronizado 100% com o Supabase do PZHub Website (perfis, roles e sessão)
 */

import { supabase, isConfigured } from './supabaseClient.js';

let currentUser = null;
let currentUserProfile = null;
let isRegisterMode = false;

export async function initAuth() {
  const btnOpenAuth = document.getElementById('btn-open-auth-modal');
  const authModal = document.getElementById('auth-modal');
  const authCloseBtn = document.getElementById('auth-modal-close');
  const authForm = document.getElementById('auth-form');
  const toggleAuthModeBtn = document.getElementById('btn-toggle-auth-mode');
  const userCard = document.getElementById('user-operator-card');
  const userContextMenu = document.getElementById('user-context-menu');
  const logoutBtn = document.getElementById('menu-opt-logout');

  if (isConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      currentUser = session?.user || null;
      if (currentUser) {
        currentUserProfile = await fetchOrCreateProfile(currentUser);
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
          currentUserProfile = await fetchOrCreateProfile(currentUser);
        } else {
          currentUserProfile = null;
        }
        updateAuthUI();
        window.dispatchEvent(new CustomEvent('pzhub:auth-changed', { 
          detail: { user: currentUser, profile: currentUserProfile } 
        }));
      });
    } catch (err) {
      console.warn('Erro ao verificar sessão Supabase:', err);
    }
  }

  updateAuthUI();

  // Abrir modal de login
  if (btnOpenAuth) {
    btnOpenAuth.addEventListener('click', () => {
      openAuthModal(false);
    });
  }

  // Toggle do menu de contexto do usuário logado
  if (userCard && userContextMenu) {
    userCard.addEventListener('click', (e) => {
      e.stopPropagation();
      userContextMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#nav-user-profile-slot')) {
        userContextMenu.classList.remove('open');
      }
    });
  }

  // Fechar modal
  if (authCloseBtn && authModal) {
    authCloseBtn.addEventListener('click', () => {
      closeAuthModal();
    });
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Fechar com tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('visible')) {
      closeAuthModal();
    }
  });

  // Alternar Login / Registro
  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
      openAuthModal(!isRegisterMode);
    });
  }

  // Submissão do Formulário
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!isConfigured || !supabase) {
        setAuthStatus('Erro: Supabase não está configurado ou offline.', true);
        return;
      }

      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value.trim();
      const usernameInput = document.getElementById('auth-username');
      const username = usernameInput && usernameInput.value.trim() ? usernameInput.value.trim() : email.split('@')[0];

      setAuthStatus('Autenticando na base central do PZHub...', false);

      try {
        if (isRegisterMode) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username, display_name: username }
            }
          });
          if (error) throw error;
          currentUser = data.user;
          setAuthStatus('Perfil tático criado com sucesso!', false);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          currentUser = data.user;
          setAuthStatus('Operador autenticado com sucesso!', false);
        }

        if (currentUser) {
          currentUserProfile = await fetchOrCreateProfile(currentUser);
          updateAuthUI();
          setTimeout(() => {
            closeAuthModal();
            authForm.reset();
            setAuthStatus('', false);
          }, 600);
        }
      } catch (err) {
        console.error('Erro de autenticação:', err);
        setAuthStatus(formatAuthError(err), true);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (userContextMenu) userContextMenu.classList.remove('open');
      if (isConfigured && supabase) {
        await supabase.auth.signOut();
      }
      currentUser = null;
      currentUserProfile = null;
      try {
        localStorage.removeItem('pzhub_operator_profile');
      } catch (e) {}
      updateAuthUI();
      window.dispatchEvent(new CustomEvent('pzhub:auth-changed', { 
        detail: { user: null, profile: null } 
      }));
    });
  }
}

export function openAuthModal(registerMode = false) {
  isRegisterMode = registerMode;
  const authModal = document.getElementById('auth-modal');
  const modalTitle = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const usernameGroup = document.getElementById('auth-username-group');
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  const statusMsg = document.getElementById('auth-status-msg');

  if (statusMsg) statusMsg.textContent = '';

  if (isRegisterMode) {
    if (modalTitle) modalTitle.textContent = 'CADASTRO DE OPERADOR';
    if (submitBtn) submitBtn.textContent = 'CRIAR CONTA DE OPERADOR';
    if (usernameGroup) usernameGroup.style.display = 'block';
    if (toggleBtn) toggleBtn.textContent = 'Já possui conta? Faça login';
  } else {
    if (modalTitle) modalTitle.textContent = 'AUTENTICAÇÃO TÁTICA';
    if (submitBtn) submitBtn.textContent = 'ENTRAR NO PZHUB';
    if (usernameGroup) usernameGroup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Não tem conta? Cadastre-se como Criador';
  }

  if (authModal) authModal.classList.add('visible');
}

export function closeAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.classList.remove('visible');
}

function setAuthStatus(msg, isError) {
  const statusMsg = document.getElementById('auth-status-msg');
  if (statusMsg) {
    statusMsg.textContent = msg;
    statusMsg.style.color = isError ? 'var(--accent-red, #ff4757)' : 'var(--accent-emerald, #2ecc71)';
  }
}

function formatAuthError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('Invalid login credentials')) {
    return 'Credenciais inválidas: e-mail ou senha incorretos.';
  }
  if (msg.includes('User already registered')) {
    return 'Este e-mail já está cadastrado no PZHub. Faça login.';
  }
  if (msg.includes('Password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'E-mail pendente de confirmação no site.';
  }
  return `Erro de autenticação: ${msg}`;
}

async function fetchOrCreateProfile(user) {
  if (!user || !supabase) return null;
  const uname = user.user_metadata?.username || user.email?.split('@')[0] || 'operador';
  const dname = user.user_metadata?.display_name || uname;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao consultar perfil no Supabase:', error);
    }

    if (profile) {
      try {
        localStorage.setItem('pzhub_operator_profile', JSON.stringify(profile));
      } catch (e) {}
      return profile;
    }

    // Cria perfil sincronizado idêntico ao do Website
    const defaultProfile = {
      id: user.id,
      username: uname,
      display_name: dname,
      role: uname.toLowerCase() === 'admin' ? 'admin' : 'user',
      avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      banner_url: user.user_metadata?.banner_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      bio: 'Sobrevivente tático de Knox County registrado no PZHub.'
    };

    const { data: created, error: createErr } = await supabase
      .from('profiles')
      .upsert([defaultProfile])
      .select()
      .maybeSingle();

    if (createErr) console.warn('Erro ao criar perfil padrão:', createErr);
    const finalProfile = created || defaultProfile;
    try {
      localStorage.setItem('pzhub_operator_profile', JSON.stringify(finalProfile));
    } catch (e) {}
    return finalProfile;
  } catch (err) {
    console.error('Exceção ao obter perfil:', err);
    return null;
  }
}

function updateAuthUI() {
  const btnOpenAuth = document.getElementById('btn-open-auth-modal');
  const userCard = document.getElementById('user-operator-card');
  const userAvatar = document.getElementById('user-avatar-img');
  const usernameDisplay = document.getElementById('user-username-display');
  const statusTag = userCard?.querySelector('.operator-status-tag');

  // Elementos do Card do Operador na Barra Lateral da Página 4 (Radar Tático)
  const riotMyAvatar = document.getElementById('riot-my-avatar');
  const riotMyName = document.getElementById('riot-my-name');
  const riotSubtitle = document.querySelector('.riot-user-subtitle');
  const riotIndicator = document.querySelector('.riot-avatar-cluster .riot-status-indicator');

  if (currentUser) {
    if (btnOpenAuth) btnOpenAuth.style.display = 'none';
    if (userCard) userCard.classList.remove('hidden');

    const name = currentUserProfile?.display_name || currentUserProfile?.username || currentUser.email?.split('@')[0] || 'Operador';
    const avatar = currentUserProfile?.avatar_url || './assets/logo/PZHub_LogoIcon.svg';

    if (usernameDisplay) usernameDisplay.textContent = name;
    if (userAvatar) {
      userAvatar.src = avatar;
      userAvatar.onerror = () => {
        userAvatar.src = './assets/logo/PZHub_LogoIcon.svg';
      };
    }

    // Sincroniza em tempo real o perfil do usuário na lista social da sidebar
    if (riotMyName) riotMyName.textContent = name;
    if (riotMyAvatar) {
      riotMyAvatar.src = avatar;
      riotMyAvatar.onerror = () => {
        riotMyAvatar.src = './assets/logo/PZHub_LogoIcon.svg';
      };
    }
    if (riotIndicator) {
      riotIndicator.className = 'riot-status-indicator online';
      riotIndicator.title = 'Conectado ao PZHub';
    }
    if (riotSubtitle) {
      riotSubtitle.innerHTML = '<span class="riot-sub-dot"></span><span>Online no PZHub</span>';
    }

    if (statusTag) {
      const role = (currentUserProfile?.role || 'user').toLowerCase();
      if (role === 'admin') {
        statusTag.textContent = '👑 ADMIN';
        statusTag.style.color = 'var(--accent-amber, #e58e26)';
      } else if (role === 'moderator') {
        statusTag.textContent = '🛡️ MOD';
        statusTag.style.color = 'var(--accent-emerald, #2ecc71)';
      } else if (role === 'creator') {
        statusTag.textContent = '💎 CRIADOR';
        statusTag.style.color = 'var(--accent-cyan, #00cec9)';
      } else {
        statusTag.textContent = '🎖️ OPERADOR';
        statusTag.style.color = 'var(--accent-emerald, #2ecc71)';
      }
    }
  } else {
    if (btnOpenAuth) btnOpenAuth.style.display = 'flex';
    if (userCard) userCard.classList.add('hidden');

    // Estado deslogado / guest no card do operador
    if (riotMyName) riotMyName.textContent = 'Operador';
    if (riotMyAvatar) riotMyAvatar.src = './assets/logo/PZHub_LogoIcon.svg';
    if (riotIndicator) {
      riotIndicator.className = 'riot-status-indicator';
      riotIndicator.title = 'Modo Offline';
    }
    if (riotSubtitle) {
      riotSubtitle.innerHTML = '<span class="riot-sub-dot" style="background: #64748b;"></span><span style="color: #64748b;">Aguardando Login</span>';
    }
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentUserProfile() {
  return currentUserProfile;
}

