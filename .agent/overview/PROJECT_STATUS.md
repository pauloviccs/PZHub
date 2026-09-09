# Project Overview

## Project Name
PZHub Desktop (Tactical Live Radar, Modpack Manager & Operations Suite)

## Description
Aplicação desktop nativa para Windows desenvolvida em **Tauri v2 + Rust** e **Vanilla JavaScript / Leaflet.js**, projetada como a central tática de inteligência, radar e gerenciamento para a comunidade de **Project Zomboid (Build 42 & Build 41)**. O sistema conta com motor de mapa isométrico 1:1 de Knox County com cache de tiles em disco gerenciado pelo Rust, telemetria e radar ao vivo via mini-mod Lua, navegação GPS A* por malha viária oficial de 1.098 ruas, catálogo e instalador de modpacks com integração ao Steam Workshop (`steam://`) e descompactação assíncrona de `.zip`, scanner local de mods com alternância Grade ⊞ / Lista ☰, autenticação integrada com Supabase Auth/PostgreSQL, painel social estilo Riot Client com presença em tempo real via Supabase Realtime Channels, botão hero de lançamento na Steam com injeção de parâmetros JVM de memória RAM no `ProjectZomboid64.json` e sistema de auto-atualização blindado (v2.1.1) com telemetria ativa, indicador discreto na topbar e fallback automático de branches (`master`/`main`).

## Tech Stack
- **Languages:** Rust 1.94+ (Edition 2021), JavaScript (ES2023 Modules), Lua 5.1/JIT (PZ Modding API), HTML5, CSS3, SQL (PostgreSQL DDL/RLS)
- **Frameworks:** Tauri v2 (`tauri` 2.x, `tauri-plugin-opener` 2.x), Leaflet.js v1.9.4
- **Tools:** Cargo, Node.js / npm, NSIS (Windows Installer Toolset), WiX Toolset (MSI), Tauri CLI v2
- **Services:** Supabase (PostgreSQL + Auth + Storage + Realtime Presence Channels + REST API), Steam Workshop Protocol (`steam://`), Vercel (Hospedagem da plataforma web `VICCS_PZHub_Website`), GitHub Raw (Distribuição oficial de manifestos de atualização)

## Folder Structure
- ```text
VICCS_PZHub/ (Desktop App Workspace Root)
├── .agent/                                  # Cortex de Memória e Contexto do Agente
│   ├── assets/                              # Brand assets (Logos SVG, ícones e referências)
│   │   ├── icons/                           # Ícones e assets gráficos auxiliares
│   │   └── ui_reference/                    # Screenshots e referências visuais de UI
│   ├── context/                             # Especificações de arquitetura, schema e stack
│   │   ├── architecture.md                  # Arquitetura do ecossistema Desktop + Web
│   │   ├── database_schema.md               # Schema Supabase e políticas RLS
│   │   └── stack.md                         # Especificação técnica da stack
│   ├── guidelines/                          # Diretrizes de desenvolvimento e código
│   │   ├── code_style.md                    # Padrões de código JavaScript/Rust
│   │   └── ui_ux.md                         # Diretrizes Tarkov, Riot Client e Tactical Apple
│   ├── logs/                                # Registros de execução de servidores e consoles
│   ├── memory/                              # Memória operacional do projeto
│   │   ├── active_task.md                   # Tarefa ativa e entregas imediatas
│   │   ├── changelog.md                     # Histórico versionado de releases
│   │   └── todos.md                         # Roadmap e checklist de fases
│   ├── overview/
│   │   └── PROJECT_STATUS.md                # Visão geral unificada e status do projeto
│   └── updates/
│       └── PATCH_NOTES.md                   # Notas de atualização imersivas (estilo Riot Games)
├── server-mod/                              # Mini-mod Lua para Project Zomboid (B41 & B42)
│   ├── 42/                                  # Implementação específica para Build 42
│   ├── common/                              # Scripts compartilhados entre versões
│   ├── media/lua/                           # Scripts de telemetria e extração in-game
│   ├── icon.png                             # Ícone oficial do mod in-game
│   ├── mod.info                             # Metadados do mod para o Project Zomboid
│   ├── poster.png                           # Arte de exibição do mod
│   └── README.md                            # Guia de instalação manual e documentação
├── src/                                     # Frontend Desktop (Vanilla JS + Leaflet)
│   ├── assets/                              # Ícones, logotipos vetoriais e ilustrações SVG
│   ├── css/
│   │   ├── main.css                         # Design System Tarkov, Toasts Táticos, Modais e Riot Client
│   │   └── map.css                          # Estilos táticos de Radar, HUD, camadas e Leaflet
│   ├── data/
│   │   ├── buildings_index.json             # Índice de edificações de Knox County
│   │   ├── meta.json                        # Metadados de projeção e limites do mapa
│   │   ├── streets.json                     # Malha viária oficial (1.098 segmentos de ruas)
│   │   ├── worldmap_forest.json             # Vetores de áreas de mata e floresta
│   │   └── worldmap_water.json              # Vetores de rios e massas d'água
│   ├── js/
│   │   ├── app.js                           # Controlador principal, router de views e showcase carousel
│   │   ├── auth.js                          # Autenticação e perfis sincronizados com Supabase Auth
│   │   ├── friends_manager.js               # Painel social estilo Riot Client, busca e presença Realtime
│   │   ├── gps_router.js                    # A* Pathfinding viário e cálculo de distâncias
│   │   ├── i18n.js                          # Dicionários de tradução (PT-BR, EN-US, ES-ES)
│   │   ├── launcher.js                      # Lançador Steam com seletor de alocação de memória RAM
│   │   ├── local_mods_scanner.js            # Scanner com modos Grade ⊞ e Lista ☰ de auditoria
│   │   ├── map_engine.js                    # Motor isométrico 1:1 Knox County com Z-levels 0 a 7
│   │   ├── markdown_parser.js               # Parser e sanitizador Markdown nativo zero-dependency
│   │   ├── modpack_manager.js               # Gerenciador de Modpacks conectado ao Supabase
│   │   ├── overlay.js                       # HUD flutuante e atalhos globais
│   │   ├── pz_projection.js                 # Projeção matemática de coordenadas Zomboid
│   │   ├── squad_tracker.js                 # Telemetria e rastreamento de aliados em tempo real
│   │   ├── supabaseClient.js                # Cliente Supabase singleton com persistência de sessão
│   │   └── updater.js                       # Auto-updater blindado, central de versão e toasts táticos
│   ├── lib/
│   │   ├── leaflet/                         # Biblioteca Leaflet.js local integrada
│   │   └── supabase/                        # Bundled Supabase client
│   ├── favicon.ico                          # Favicon do aplicativo
│   ├── index.html                           # Layout Desktop, Topbar Slim, Painel Riot, Modais e Views
│   ├── main.js                              # Entry script do Vite/Tauri
│   ├── site.webmanifest                     # Manifesto web de metadados
│   └── styles.css                           # Estilos base de reset e tipografia
├── src-tauri/                               # Backend Nativo Rust (Tauri v2)
│   ├── capabilities/
│   │   └── default.json                     # Permissões de janelas, plugins e canais Tauri
│   ├── icons/                               # Ícones oficiais multi-resolução (icon.ico 16-256px)
│   ├── src/
│   │   ├── cache.rs                         # Cache local assíncrono de tiles em disco
│   │   ├── config.rs                        # Configurações do usuário, amigos e persistência JSON
│   │   ├── launcher.rs                      # Configuração de JVM/RAM em ProjectZomboid64.json e disparo Steam
│   │   ├── lib.rs                           # Registro dos 27 comandos nativos e inicialização de plugins
│   │   ├── main.rs                          # Entry point do executável Windows
│   │   ├── mod_installer.rs                 # Instalador automatizado do mod Lua no Zomboid
│   │   ├── mod_manager.rs                   # Varredura do filesystem, unzip assíncrono e Steam
│   │   ├── tracker.rs                       # Leitura segura de telemetria local e estado offline
│   │   └── updater.rs                       # Downloader nativo em streaming e consulta de manifesto com fallback
│   ├── target/release/bundle/               # Pacotes de distribuição gerados
│   │   ├── nsis/PZHub_2.1.1_x64-setup.exe   # Instalador oficial NSIS v2.1.1
│   │   └── msi/PZHub_2.1.1_x64_en-US.msi    # Pacote MSI v2.1.1
│   ├── Cargo.toml                           # Dependências e manifesto Rust (v2.1.1)
│   └── tauri.conf.json                      # Configuração de janelas, permissões e empacotamento (v2.1.1)
├── download_data.js                         # Utilitário para download de mapas e vetores oficiais
├── latest.json                              # Manifesto oficial de release remoto (v2.1.1)
├── package.json                             # Scripts npm e dependências de frontend (v2.1.1)
└── README.md                                # Apresentação do projeto
```

## Key Files
- `src-tauri/src/lib.rs`: Registra os 27 comandos nativos expostos ao frontend (cache de tiles, telemetria, janelas, scanner de mods, modpacks, launcher de RAM, manifesto remoto e auto-updater).
- `src-tauri/src/updater.rs`: Motor de download em streaming de patch via `reqwest` com emissão contínua de eventos de progresso, inicialização atômica de instaladores NSIS e função `fetch_update_manifest` com normalização de URL e auto-fallback resiliente entre branches `master` e `main` em caso de erro HTTP 404.
- `src/js/updater.js`: Orquestrador completo de atualização no frontend. Consulta o manifesto oficial no GitHub Raw, gerencia a persistência da última verificação no `localStorage`, dispara eventos customizados (`updater-check-success`, `updater-check-failed`), controla os Toasts Táticos (`showTacticalToast`) e o Modal Tático de Versão e Diagnóstico (`showTacticalVersionModal`), sem uso de `alert()` nativo.
- `src-tauri/src/launcher.rs`: Localiza as pastas de instalação do Project Zomboid no Windows, injeta a configuração de memória RAM (`-Xmx` e `-Xms`) diretamente no `ProjectZomboid64.json` e dispara a inicialização do jogo via Steam (`steam://run/108600`) com fallback para o executável nativo.
- `src/js/launcher.js`: Gerenciador frontend do botão hero "JOGAR" no cabeçalho superior e menu dropdown tático para seleção de memória RAM (4GB a 32GB) com persistência em `localStorage`.
- `src/js/auth.js`: Autenticação completa via Supabase, gestão de sessão persistente, perfil de operador (`profiles`), menu de contexto de perfil e sincronização biunívoca com a barra superior e a barra lateral.
- `src/js/friends_manager.js`: Gerenciador social estilo Riot Client com pesquisa rápida, gaveta retrátil de novo sobrevivente com swatches de cores táticas, agrupamento dinâmico (Online / Offline com accordion), sincronização de avatares via tabela `profiles` e presença em tempo real via canal WebSocket `pzhub-global-presence`.
- `src/js/map_engine.js`: Motor Leaflet com projeção customizada do Project Zomboid, suporte a andares (Z-Levels 0-7), GPS viário integrado e marcadores de telemetria.
- `src/js/squad_tracker.js`: Rastreamento de jogadores locais e remotos via leitura de arquivo Lua, disparando notificações de atualização (`onSquadUpdate`) para o painel social.
- `src/js/modpack_manager.js`: Gerenciador de modpacks com suporte à alternância de visualização Grade ⊞ vs Lista ☰, renderização de Markdown, consulta assíncrona de changelogs/comentários ao Supabase e modal tático de detalhes.
- `src/js/local_mods_scanner.js`: Scanner assíncrono de mods em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`), com filtros por tipo, pesquisa em tempo real, visualização em Grade ⊞ e Lista ☰ e atalho para abrir pastas no Windows Explorer.
- `.agent/updates/PATCH_NOTES.md`: Caderno histórico imersivo e descontraído de notas de versão (estilo Riot Games) abrangendo todas as releases de 1.0.0 a 2.1.1.

## Current Features Implemented
1. **Auto-Updater Blindado & Central de Versão (v2.1.1):**
   - **Endpoint Oficial:** Apontado para `https://raw.githubusercontent.com/pauloviccs/PZHub/master/latest.json`.
   - **Auto-Fallback Inteligente:** Mecanismo duplo (Rust nativo + JS fetch) que redireciona automaticamente entre `master` e `main` caso alguma branch retorne HTTP 404, evitando falhas silenciosas.
   - **Eliminação de Diálogos Nativos:** 100% dos `alert()` e `confirm()` nativos do navegador foram substituídos por Toasts Táticos animados (`showTacticalToast`) e Modal Holográfico com desfoque profundo (`#tactical-version-modal`).
   - **Indicador Tático na Topbar:** Badge discreto `#topbar-updater-status` que sinaliza falhas de telemetria (`⚠️ FALHA TELEMETRIA`) ou novas versões disponíveis sem interromper a gameplay do operador.
   - **Card Interativo de Versão no Hero:** Elemento `#hub-updater-box` com tag de versão instalada (`v2.1.1`), status dinâmico e botão com ícone giratório **"BUSCAR"** (`#btn-hub-check-updates`).
   - **Ação Rápida no Perfil:** Opção "Buscar Atualizações" adicionada ao menu de contexto do Operador.
   - **Telemetria de Erros:** Captura e persistência em `localStorage` (`pzhub_last_update_check`) e emissão de eventos globais `updater-check-failed` e `updater-check-success`.

2. **Autenticação e Perfis Sincronizados com Supabase:**
   - Modal nativo de Login e Cadastro de Operador sincronizado com o banco oficial do PZHub Website (`https://legqoupwzpdzqqhwuwwv.supabase.co`).
   - Sincronização em tempo real de avatar, nome de exibição (`display_name`), papéis (`ADMIN`, `MOD`, `CRIADOR`, `OPERADOR`) e persistência de sessão.
   - Espelhamento instantâneo no cabeçalho superior direito (`#user-operator-card`) e no card da barra lateral da Página 4 (`.riot-user-card`).

3. **Hero Play Button & Injeção de Memória RAM no Project Zomboid:**
   - Botão de lançamento primário em verde esmeralda no cabeçalho superior.
   - Menu dropdown tático para alocação de memória RAM (4GB a 32GB) com persistência da preferência do jogador.
   - Injeção atômica dos parâmetros JVM `-Xmx` e `-Xms` no arquivo `ProjectZomboid64.json` pelo backend Rust antes de disparar o protocolo Steam (`steam://run/108600`).

4. **Painel Social & Lista de Amigos Estilo Riot Client:**
   - **Card de Perfil do Operador:** Avatar circular, status neon verde online, nome do operador e botão rápido `+`.
   - **Sub-Toolbar Tática:** Abas `Amigos (N)` e `Radar Ao Vivo (M)` com badges luminescentes e linha dourada.
   - **Barra de Pesquisa Rápida:** Filtro instantâneo com botão `✕` de limpeza.
   - **Gaveta Retrátil de Novo Amigo:** Animação com 6 seletores de cores em discos circulares brilhantes.
   - **Agrupamento Automático Online / Offline:**
     - **Online:** Destaque com estrela colorida, cálculo de distância em metros (`Xm de você`), traçado de rota `🧭 GPS` e remoção com hover suave.
     - **Offline:** Accordion recolhível com chevron animado e status discreto.
   - **Sincronização de Avatares:** Fotos dos amigos puxadas diretamente da tabela `profiles` do Supabase, com fallback para iniciais.

5. **Presença Global em Tempo Real (Supabase Realtime Presence):**
   - Canal WebSocket `pzhub-global-presence` monitorando instâncias ativas do PZHub Desktop abertas.
   - Promoção automática de status para `🟢 ONLINE NO PZHUB DESKTOP` para aliados logados.
   - Transição fluida para telemetria de coordenadas e rotas GPS quando no mesmo servidor de jogo.

6. **Showcase Carousel Comunitário no Hub:**
   - Carrossel dinâmico na Página 1 (Centro de Operações) exibindo modpacks em destaque da comunidade com paginação, controles manuais e botão de instalação.

7. **Responsividade Blindada & Isolamento de Abas na Página 4 (Radar Tático):**
   - `.tactical-header` travado em `44px` com `flex-wrap: nowrap !important;`, impedindo quebras em qualquer resolução.
   - `.tactical-sidebar` posicionada em `top: 58px; left: 8px; bottom: 12px; width: 330px;`.
   - `.tactical-dock` centralizado com ancoragem adaptativa.
   - Isolamento de abas (`.tab-pane` com `display: none !important;`) eliminando lacunas vazias ou sobreposição.

8. **Motor de Mapa Tático 1:1 Knox County & Live Radar:**
   - Projeção de coordenadas Project Zomboid com suporte a andares (Z-Levels 0 a 7) e cache local de tiles em disco gerenciado pelo Rust.
   - Navegação GPS viária com algoritmo A* por malha de 1.098 ruas, bússola cardeal e HUD superior com ETA.
   - Modo Mini-Radar estilo GTA V ($340\times220\text{px}$) frameless, always-on-top.

9. **Gerenciador de Modpacks & Scanner Local:**
   - Catálogo de modpacks integrado ao Supabase com alternância entre Grade ⊞ e Lista ☰.
   - Scanner assíncrono de mods locais em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`).
   - Modal tático de detalhes com Markdown renderizado, changelogs e comentários.

10. **Binários e Instaladores de Produção Gerados (v2.1.1):**
    - `src-tauri/target/release/bundle/nsis/PZHub_2.1.1_x64-setup.exe` (Instalador NSIS Oficial v2.1.1)
    - `src-tauri/target/release/bundle/msi/PZHub_2.1.1_x64_en-US.msi` (Instalador MSI v2.1.1)
    - `src-tauri/target/release/tauri-app.exe` (Executável Stand-alone v2.1.1)

## Work-in-Progress Items
- Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canal Realtime.
- Otimização do loop de telemetria multiplayer em servidores densos com mais de 30 jogadores simultâneos no esquadrão.
- Pré-carregamento offline programado de tiles de alta resolução das cidades principais (Louisville, Muldraugh, West Point).

## Known TODOs & Next Steps
- Implementar chat tático direto por texto entre amigos através do canal Supabase Realtime.
- Adicionar notificações nativas do Windows quando um amigo entrar no PZHub Desktop ou conectar ao servidor do Zomboid.
- Criar ferramenta de diagnóstico de compatibilidade e conflitos de mods no scanner local.
