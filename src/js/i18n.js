/**
 * PZHub - Sistema de Internacionalização (i18n) Multilíngue
 * Suporte nativo para Português (Brasil), English (US) e Español (ES)
 */

export const PZ_CATEGORIES = [
  // Versões
  { id: "Build 42", group: "versions", label: { pt: "Build 42", en: "Build 42", es: "Build 42" } },
  { id: "Build 41", group: "versions", label: { pt: "Build 41", en: "Build 41", es: "Build 41" } },
  { id: "Build 40", group: "versions", label: { pt: "Build 40", en: "Build 40", es: "Build 40" } },

  // Elementos e Mecânicas
  { id: "Military", group: "elements", label: { pt: "Militar & Armas", en: "Military & Weapons", es: "Militar y Armas" } },
  { id: "Weapons", group: "elements", label: { pt: "Armas de Fogo e Brancas", en: "Weapons & Guns", es: "Armas y Combate" } },
  { id: "Vehicles", group: "elements", label: { pt: "Veículos & Transporte", en: "Vehicles & Transport", es: "Vehículos y Transporte" } },
  { id: "Building", group: "elements", label: { pt: "Construção & Estruturas", en: "Building & Base", es: "Construcción y Base" } },
  { id: "Clothing/Armor", group: "elements", label: { pt: "Roupas & Armaduras", en: "Clothing & Armor", es: "Ropa y Armadura" } },
  { id: "Food", group: "elements", label: { pt: "Comidas & Culinária", en: "Food & Cooking", es: "Comida y Cocina" } },
  { id: "Farming", group: "elements", label: { pt: "Agricultura & Plantação", en: "Farming & Agriculture", es: "Agricultura" } },
  { id: "Animals", group: "elements", label: { pt: "Animais & Criação", en: "Animals & Husbandry", es: "Animales" } },
  { id: "Items", group: "elements", label: { pt: "Itens Variados", en: "Items & Gear", es: "Objetos e Ítems" } },
  { id: "Literature", group: "elements", label: { pt: "Literatura & Livros", en: "Literature & Books", es: "Literatura y Libros" } },
  { id: "Map", group: "elements", label: { pt: "Mapas & Cidades Adicionais", en: "Maps & Cities", es: "Mapas y Ciudades" } },
  { id: "Audio", group: "elements", label: { pt: "Áudio & Efeitos Sonoros", en: "Audio & Sounds", es: "Audio y Sonidos" } },

  // Estilo e Gameplay
  { id: "Hardmode", group: "gameplay", label: { pt: "Sobrevivência Hardcore", en: "Hardcore Survival", es: "Supervivencia Hardcore" } },
  { id: "QoL", group: "gameplay", label: { pt: "Qualidade de Vida (QoL)", en: "Quality of Life (QoL)", es: "Calidad de Vida (QoL)" } },
  { id: "Multiplayer", group: "gameplay", label: { pt: "Multiplayer & Servidores", en: "Multiplayer & Servers", es: "Multijugador" } },
  { id: "Realistic", group: "gameplay", label: { pt: "Realismo & Imersão", en: "Realism & Immersion", es: "Realismo e Inmersión" } },
  { id: "Balance", group: "gameplay", label: { pt: "Ajustes de Balanceamento", en: "Game Balance", es: "Ajustes de Balance" } },
  { id: "Silly/Fun", group: "gameplay", label: { pt: "Diversão & Cômico", en: "Fun & Silly", es: "Diversión y Cómico" } },

  // Técnica e Estrutura
  { id: "Framework", group: "technical", label: { pt: "Framework & Bibliotecas", en: "Framework & Libraries", es: "Framework y Librerías" } },
  { id: "Interface", group: "technical", label: { pt: "Interface (UI & Menus)", en: "Interface & UI", es: "Interfaz y HUD" } },
  { id: "Language/Translation", group: "technical", label: { pt: "Traduções & Idiomas", en: "Language & Translations", es: "Traducciones" } },
  { id: "Models", group: "technical", label: { pt: "Modelos 3D", en: "3D Models", es: "Modelos 3D" } },
  { id: "Textures", group: "technical", label: { pt: "Texturas Visuais", en: "Textures & Overhauls", es: "Texturas" } },
  { id: "Skills", group: "technical", label: { pt: "Habilidades & Níveis", en: "Skills & Leveling", es: "Habilidades" } },
  { id: "Traits", group: "technical", label: { pt: "Traços & Profissões", en: "Traits & Occupations", es: "Rasgos y Profesiones" } },
  { id: "Pop Culture", group: "technical", label: { pt: "Cultura Pop & Séries", en: "Pop Culture & Easter Eggs", es: "Cultura Pop" } },
  { id: "WIP", group: "technical", label: { pt: "Em Desenvolvimento (WIP)", en: "Work in Progress (WIP)", es: "En Desarrollo (WIP)" } },
  { id: "Misc", group: "technical", label: { pt: "Miscelânea / Outros", en: "Miscellaneous", es: "Miscelánea" } }
];

export const translations = {
  pt: {
    // Top Bar & Global
    "brand_name": "PZHUB",
    "brand_subtitle": "OPERATIONS SUITE // B42",
    "status_offline": "AGUARDANDO SINAL",
    "status_online": "ONLINE",
    "status_simulation": "MODO SIMULAÇÃO",
    "pin_window_title": "Fixar Janela no Topo (Always on Top)",
    "lang_select": "Idioma",

    // Tabs
    "tab_hub": "01 CENTRO DE OPERAÇÕES",
    "tab_modpacks": "02 MODPACKS",
    "tab_local_mods": "03 MODS LOCAIS",
    "tab_map": "04 MAPA & RADAR",

    // View 1: Hub
    "hub_badge": "CENTRO DE COMANDO TÁTICO",
    "hub_title": "PAINEL DE OPERAÇÕES DO SOBREVIVENTE",
    "hub_desc": "Gerencie modpacks, audite coleções locais e acerte coordenadas em tempo real no Project Zomboid Build 42.",
    "portal_map_code": "MODO 01 // TELEMETRIA",
    "portal_map_title": "MAPA TÁTICO & RADAR AO VIVO",
    "portal_map_desc": "Acompanhe sua posição, amigos e pontos de interesse com telemetria direta do Zomboid e HUD militar integrado.",
    "portal_map_btn": "ACESSAR RADAR TÁTICO",
    "portal_packs_code": "MODO 02 // SINCRONIZAÇÃO",
    "portal_packs_title": "GERENCIADOR DE MODPACKS",
    "portal_packs_desc": "Importe manifestos remotos de modpacks via links diretos, instale componentes em 1 clique e sincronize com seu servidor.",
    "portal_packs_btn": "ACESSAR MODPACKS",
    "portal_mods_code": "MODO 03 // AUDITORIA",
    "portal_mods_title": "MODS LOCAIS INSTALADOS",
    "portal_mods_desc": "Inspecione todos os mods instalados na pasta do seu Zomboid e no Steam Workshop, verifique versões mínimas e abra diretórios no Windows.",
    "portal_mods_btn": "VERIFICAR MODS",

    // View 2: Modpacks
    "modpacks_sub": "PAINEL DE SINCRONIZAÇÃO",
    "modpacks_title": "GERENCIADOR DE MODPACKS",
    "modpacks_placeholder": "Cole o link do Pastebin, Dropbox (.zip) ou manifesto JSON...",
    "btn_import_pack": "+ IMPORTAR MODPACK",
    "btn_refresh_packs": "Recarregar catálogo",
    "filter_all": "TODOS",
    "filter_cloud": "☁️ NUVEM",
    "filter_saved": "💾 LOCAIS",
    "search_pack_placeholder": "Buscar modpack...",
    "btn_install_pack": "⚡ INSTALAR MODPACK (1-CLIQUE)",
    "btn_reinstall_pack": "🔄 INSTALADO (FORÇAR REINSTALAÇÃO)",
    "btn_uninstall_pack": "🗑️ DESINSTALAR",
    "btn_inspect_components": "INSPECIONAR COMPONENTES",

    // View 3: Scanner
    "scanner_sub": "AUDITORIA DE ARQUIVOS",
    "scanner_title": "MODS INSTALADOS NO ZOMBOID",
    "search_local_placeholder": "Buscar mod por nome ou ID...",
    "btn_refresh_scanner": "RE-ESCANEAR",
    "btn_open_mods_folder": "📂 ABRIR PASTA MODS",

    // View 4: Map & Radar
    "radar_status_connecting": "Conectando ao Project Zomboid...",
    "radar_status_live": "Sinal GPS Ativo",
    "btn_center_me": "CENTRALIZAR",
    "btn_follow_me": "SEGUIR JOGADOR",
    "btn_following_me": "SEGUINDO JOGADOR",
    "sidebar_toggle_title": "Recolher / Expandir Painel (F10)",
    "sidebar_tab_squad": "Esquadrão & Amigos",
    "sidebar_tab_towns": "Cidades",
    "sidebar_tab_loot": "Loot",
    "sidebar_tab_floors": "Andares",
    "sidebar_tab_config": "Config",
    "squad_title": "Sinais Detectados no Radar",
    "squad_live_badge": "AO VIVO",
    "friends_title": "★ Lista de Amigos Cadastrados",
    "add_friend_placeholder": "Nick no Zomboid (ex: Rick_Grimes)",
    "add_friend_nick": "Apelido (opcional)",
    "btn_save_friend": "+ ADICIONAR AMIGO",

    // Modals & Feedback
    "modal_deploy_title": "SINCRONIZANDO MODPACK",
    "modal_btn_close": "CONCLUIR & FECHAR"
  },

  en: {
    // Top Bar & Global
    "brand_name": "PZHUB",
    "brand_subtitle": "OPERATIONS SUITE // B42",
    "status_offline": "WAITING FOR SIGNAL",
    "status_online": "ONLINE",
    "status_simulation": "SIMULATION MODE",
    "pin_window_title": "Pin Window on Top (Always on Top)",
    "lang_select": "Language",

    // Tabs
    "tab_hub": "01 OPERATIONS HUB",
    "tab_modpacks": "02 MODPACKS",
    "tab_local_mods": "03 LOCAL MODS",
    "tab_map": "04 MAP & RADAR",

    // View 1: Hub
    "hub_badge": "TACTICAL COMMAND CENTER",
    "hub_title": "SURVIVOR OPERATIONS DASHBOARD",
    "hub_desc": "Manage modpacks, audit local mod collections, and track live coordinates in Project Zomboid Build 42.",
    "portal_map_code": "MODE 01 // TELEMETRY",
    "portal_map_title": "TACTICAL MAP & LIVE RADAR",
    "portal_map_desc": "Track your position, squad members, and points of interest with direct Zomboid telemetry and integrated military HUD.",
    "portal_map_btn": "ACCESS TACTICAL RADAR",
    "portal_packs_code": "MODE 02 // SYNC",
    "portal_packs_title": "MODPACK MANAGER",
    "portal_packs_desc": "Import remote modpack manifests via direct links, install components in 1-click, and auto-sync with your server.",
    "portal_packs_btn": "ACCESS MODPACKS",
    "portal_mods_code": "MODE 03 // AUDIT",
    "portal_mods_title": "INSTALLED LOCAL MODS",
    "portal_mods_desc": "Inspect all mods installed in your Zomboid folder and Steam Workshop, check min versions, and open directories.",
    "portal_mods_btn": "CHECK MODS",

    // View 2: Modpacks
    "modpacks_sub": "SYNCHRONIZATION SUITE",
    "modpacks_title": "MODPACK MANAGER",
    "modpacks_placeholder": "Paste Pastebin link, Dropbox (.zip), or JSON manifest URL...",
    "btn_import_pack": "+ IMPORT MODPACK",
    "btn_refresh_packs": "Reload catalog",
    "filter_all": "ALL",
    "filter_cloud": "☁️ CLOUD",
    "filter_saved": "💾 LOCAL",
    "search_pack_placeholder": "Search modpacks...",
    "btn_install_pack": "⚡ INSTALL MODPACK (1-CLICK)",
    "btn_reinstall_pack": "🔄 INSTALLED (FORCE REINSTALL)",
    "btn_uninstall_pack": "🗑️ UNINSTALL",
    "btn_inspect_components": "INSPECT COMPONENTS",

    // View 3: Scanner
    "scanner_sub": "FILE SYSTEM AUDIT",
    "scanner_title": "ZOMBOID INSTALLED MODS",
    "search_local_placeholder": "Search mod by name or ID...",
    "btn_refresh_scanner": "RE-SCAN",
    "btn_open_mods_folder": "📂 OPEN MODS FOLDER",

    // View 4: Map & Radar
    "radar_status_connecting": "Connecting to Project Zomboid...",
    "radar_status_live": "GPS Signal Active",
    "btn_center_me": "CENTER ON ME",
    "btn_follow_me": "FOLLOW PLAYER",
    "btn_following_me": "FOLLOWING PLAYER",
    "sidebar_toggle_title": "Collapse / Expand Panel (F10)",
    "sidebar_tab_squad": "Squad & Friends",
    "sidebar_tab_towns": "Cities",
    "sidebar_tab_loot": "Loot",
    "sidebar_tab_floors": "Floors",
    "sidebar_tab_config": "Settings",
    "squad_title": "Signals Detected on Radar",
    "squad_live_badge": "LIVE",
    "friends_title": "★ Registered Friends List",
    "add_friend_placeholder": "Zomboid Username (e.g., Rick_Grimes)",
    "add_friend_nick": "Nickname (optional)",
    "btn_save_friend": "+ ADD FRIEND",

    // Modals & Feedback
    "modal_deploy_title": "SYNCING MODPACK",
    "modal_btn_close": "FINISH & CLOSE"
  },

  es: {
    // Top Bar & Global
    "brand_name": "PZHUB",
    "brand_subtitle": "OPERATIONS SUITE // B42",
    "status_offline": "ESPERANDO SEÑAL",
    "status_online": "EN LÍNEA",
    "status_simulation": "MODO SIMULACIÓN",
    "pin_window_title": "Fijar Ventana al Frente (Always on Top)",
    "lang_select": "Idioma",

    // Tabs
    "tab_hub": "01 CENTRO DE OPERACIONES",
    "tab_modpacks": "02 MODPACKS",
    "tab_local_mods": "03 MODS LOCALES",
    "tab_map": "04 MAPA Y RADAR",

    // View 1: Hub
    "hub_badge": "CENTRO DE COMANDO TÁCTICO",
    "hub_title": "PANEL DE OPERACIONES DE SUPERVIVENCIA",
    "hub_desc": "Gestiona modpacks, audita colecciones locales y rastrea coordenadas en tiempo real en Project Zomboid Build 42.",
    "portal_map_code": "MODO 01 // TELEMETRÍA",
    "portal_map_title": "MAPA TÁCTICO Y RADAR EN VIVO",
    "portal_map_desc": "Sigue tu posición, miembros de escuadrón y puntos de interés con telemetría directa de Zomboid y HUD militar.",
    "portal_map_btn": "ACCEDER A RADAR TÁCTICO",
    "portal_packs_code": "MODO 02 // SINCRONIZACIÓN",
    "portal_packs_title": "GESTOR DE MODPACKS",
    "portal_packs_desc": "Importa manifiestos remotos de modpacks mediante enlaces directos, instala componentes en 1 clic y sincroniza con tu servidor.",
    "portal_packs_btn": "ACCEDER A MODPACKS",
    "portal_mods_code": "MODO 03 // AUDITORÍA",
    "portal_mods_title": "MODS LOCALES INSTALADOS",
    "portal_mods_desc": "Inspecciona todos los mods instalados en tu carpeta de Zomboid y Steam Workshop, verifica versiones y abre carpetas.",
    "portal_mods_btn": "VERIFICAR MODS",

    // View 2: Modpacks
    "modpacks_sub": "PANEL DE SINCRONIZACIÓN",
    "modpacks_title": "GESTOR DE MODPACKS",
    "modpacks_placeholder": "Pega el enlace de Pastebin, Dropbox (.zip) o manifiesto JSON...",
    "btn_import_pack": "+ IMPORTAR MODPACK",
    "btn_refresh_packs": "Recargar catálogo",
    "filter_all": "TODOS",
    "filter_cloud": "☁️ NUBE",
    "filter_saved": "💾 LOCALES",
    "search_pack_placeholder": "Buscar modpacks...",
    "btn_install_pack": "⚡ INSTALAR MODPACK (1-CLIC)",
    "btn_reinstall_pack": "🔄 INSTALADO (FORZAR REINSTALACIÓN)",
    "btn_uninstall_pack": "🗑️ DESINSTALAR",
    "btn_inspect_components": "INSPECCIONAR COMPONENTES",

    // View 3: Scanner
    "scanner_sub": "AUDITORÍA DE ARCHIVOS",
    "scanner_title": "MODS INSTALADOS EN ZOMBOID",
    "search_local_placeholder": "Buscar mod por nombre o ID...",
    "btn_refresh_scanner": "RE-ESCANEAR",
    "btn_open_mods_folder": "📂 ABRIR CARPETA MODS",

    // View 4: Map & Radar
    "radar_status_connecting": "Conectando a Project Zomboid...",
    "radar_status_live": "Señal GPS Activa",
    "btn_center_me": "CENTRAR EN MÍ",
    "btn_follow_me": "SEGUIR JUGADOR",
    "btn_following_me": "SIGUIENDO JUGADOR",
    "sidebar_toggle_title": "Plegar / Desplegar Panel (F10)",
    "sidebar_tab_squad": "Escuadrón y Amigos",
    "sidebar_tab_towns": "Ciudades",
    "sidebar_tab_loot": "Botín",
    "sidebar_tab_floors": "Pisos",
    "sidebar_tab_config": "Ajustes",
    "squad_title": "Señales Detectadas en Radar",
    "squad_live_badge": "EN VIVO",
    "friends_title": "★ Lista de Amigos Registrados",
    "add_friend_placeholder": "Usuario de Zomboid (ej: Rick_Grimes)",
    "add_friend_nick": "Apodo (opcional)",
    "btn_save_friend": "+ AÑADIR AMIGO",

    // Modals & Feedback
    "modal_deploy_title": "SINCRONIZANDO MODPACK",
    "modal_btn_close": "FINALIZAR Y CERRAR"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('pzhub_lang') || 'pt';
    if (!translations[this.currentLang]) {
      this.currentLang = 'pt';
    }
    this.listeners = [];
  }

  setLanguage(lang) {
    if (!translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('pzhub_lang', lang);
    this.updateDom();
    this.listeners.forEach(fn => fn(lang));
  }

  t(key, fallback = '') {
    return translations[this.currentLang]?.[key] || translations['pt']?.[key] || fallback || key;
  }

  getCategoryName(catId) {
    const found = PZ_CATEGORIES.find(c => c.id.toLowerCase() === (catId || '').toLowerCase());
    if (found) {
      return found.label[this.currentLang] || found.label.pt || catId;
    }
    return catId;
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  updateDom() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && translations[this.currentLang]?.[key]) {
        el.textContent = translations[this.currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && translations[this.currentLang]?.[key]) {
        el.placeholder = translations[this.currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key && translations[this.currentLang]?.[key]) {
        el.title = translations[this.currentLang][key];
      }
    });

    // Atualiza classes ativas no seletor de idiomas
    document.querySelectorAll('.lang-btn-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  }
}

export const i18n = new I18nManager();
