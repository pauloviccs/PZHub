# Project Overview

## Project Name
PZHub Desktop (Tactical Live Radar, Modpack Manager & Operations Suite)

## Description
Aplicação desktop nativa para Windows desenvolvida em **Tauri v2 + Rust** e **Vanilla JavaScript / Leaflet**, projetada como a central de operações e inteligência tática definitiva para a comunidade de **Project Zomboid (Build 42 & Build 41)**. O sistema integra motor de mapa isométrico 1:1 de Knox County com cache em disco em Rust, live radar e telemetria ao vivo com transmissão Lua local, navegação GPS A* por malha viária oficial de 1.098 ruas, gerenciador e instalador de modpacks com suporte à Steam Workshop (`steam://`) e downloads diretos `.zip`, scanner assíncrono de mods locais (com alternância entre Grade ⊞ e Lista ☰), autenticação integrada com o Supabase (mesma conta do PZHub Website), **painel de amigos e esquadrão estilo Riot Client** com sincronização de avatares/apelidos em tempo real e **presença global entre usuários do desktop** via Supabase Realtime Channels, **carrossel dinâmico de modpacks comunitários em destaque no Hub**, além de um botão hero de lançamento do jogo na Steam com injeção de parâmetros de memória RAM no `ProjectZomboid64.json`.

## Tech Stack
- **Languages:** Rust 1.94+ (Edition 2021), JavaScript (ES2023 Modules), Lua 5.1/JIT (PZ Modding API), HTML5, CSS3, SQL (PostgreSQL DDL/RLS)
- **Frameworks:** Tauri v2 (`tauri` 2.x, `tauri-plugin-opener`), Leaflet.js v1.9.4
- **Tools:** Cargo, Node.js / npm, NSIS (Windows Installer Bundle), WiX (MSI Toolset), Tauri Icon CLI
- **Services:** Supabase (PostgreSQL + Auth + Storage + Realtime Presence Channels + REST API), Steam Workshop Protocol (`steam://`), Vercel (Hospedagem da plataforma web companheira `VICCS_PZHub_Website`)

## Folder Structure
- ```text
VICCS_PZHub/ (Desktop App Workspace Root)
├── .agent/                                  # Cortex de Memória e Contexto do Agente
│   ├── assets/                              # Brand assets (Logos SVG, ícones e referências)
│   │   ├── icons/                           # Ícones e assets gráficos auxiliares
│   │   └── ui_reference/                    # Screenshots e referências de interface
│   ├── context/                             # Diretrizes de arquitetura, banco e stack
│   │   ├── architecture.md                  # Arquitetura do ecossistema Desktop + Web
│   │   ├── database_schema.md               # Schema Supabase e políticas RLS
│   │   └── stack.md                         # Especificação técnica da stack
│   ├── guidelines/                          # Diretrizes de desenvolvimento
│   │   ├── code_style.md                    # Padrões de código JavaScript/Rust
│   │   └── ui_ux.md                         # Diretrizes Tarkov, Riot Client e Tactical Apple
│   ├── logs/                                # Registros e logs de execução de servidores/consoles
│   ├── memory/                              # Memória viva do projeto
│   │   ├── active_task.md                   # Tarefa ativa e entregas imediatas
│   │   ├── changelog.md                     # Histórico versionado de releases
│   │   └── todos.md                         # Roadmap e checklist de fases
│   └── overview/
│       └── PROJECT_STATUS.md                # Visão geral unificada do projeto
├── server-mod/                              # Mini-mod Lua para Project Zomboid (B41 & B42)
│   ├── 42/                                  # Arquivos específicos da Build 42
│   ├── common/                              # Scripts compartilhados entre versões
│   ├── media/lua/                           # Implementação do transmissor de telemetria
│   ├── icon.png                             # Ícone oficial do mod in-game
│   ├── mod.info                             # Metadados do mod para o Zomboid
│   ├── poster.png                           # Arte de exibição do mod
│   └── README.md                            # Guia de instalação manual do mod
├── src/                                     # Frontend Desktop (Vanilla JS + Leaflet)
│   ├── assets/                              # Ícones, logotipos vetoriais e ilustrações SVG
│   ├── css/
│   │   ├── main.css                         # Design System Escape from Tarkov, Riot Client e Tactical White Mode
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
│   │   └── updater.js                       # Orquestrador de verificação de versão e UI do updater
│   ├── lib/
│   │   ├── leaflet/                         # Biblioteca Leaflet.js local integrada
│   │   └── supabase/                        # Bundled Supabase client
│   ├── favicon.ico                          # Favicon do aplicativo
│   ├── index.html                           # Layout Desktop, Topbar Slim, Painel Riot, Modais e Views
│   ├── main.js                              # Entry script do Vite/Tauri
│   ├── site.webmanifest                     # Manifesto web de metadados
│   └── styles.css                           # Estilos base de reset e tipografia
├── src-tauri/                               # Backend Nativo Rust (Tauri v2)
│   ├── icons/                               # Ícones oficiais multi-resolução (icon.ico 16-256px)
│   ├── src/
│   │   ├── cache.rs                         # Cache local assíncrono de tiles em disco
│   │   ├── config.rs                        # Configurações do usuário, amigos e persistência JSON
│   │   ├── launcher.rs                      # Configuração de JVM/RAM em ProjectZomboid64.json e disparo Steam
│   │   ├── lib.rs                           # Registro dos 26 comandos nativos e inicialização de plugins
│   │   ├── main.rs                          # Entry point do executável Windows
│   │   ├── mod_installer.rs                 # Instalador automatizado do mod Lua no Zomboid
│   │   ├── mod_manager.rs                   # Varredura do filesystem, unzip assíncrono e Steam
│   │   ├── tracker.rs                       # Leitura segura de telemetria local e estado offline
│   │   └── updater.rs                       # Downloader nativo em streaming de instaladores NSIS
│   ├── target/release/bundle/               # Pacotes de distribuição gerados (v2.1.1 setup .exe e v2.0.0 .msi)
│   ├── Cargo.toml                           # Dependências e manifesto Rust
│   └── tauri.conf.json                      # Configuração de janelas, permissões e empacotamento NSIS/MSI
├── download_data.js                         # Utilitário para download de mapas e vetores oficiais
├── package.json                             # Scripts npm e dependências de frontend
└── README.md                                # Apresentação do projeto
```

## Key Files
- `src-tauri/src/lib.rs`: Registra todos os 26 comandos nativos expostos ao frontend (cache de tiles, telemetria, janelas, scanner, modpacks, launcher de RAM e updater).
- `src-tauri/src/launcher.rs`: Localiza as pastas de instalação do Project Zomboid no Windows, injeta a configuração de memória RAM (`-Xmx` e `-Xms`) diretamente no `ProjectZomboid64.json` e dispara a inicialização do jogo via Steam (`steam://run/108600`) com fallback para o executável nativo.
- `src/js/launcher.js`: Gerenciador frontend do botão hero "JOGAR" no cabeçalho superior e menu dropdown tático para seleção de memória RAM (4GB a 32GB) com persistência em `localStorage`.
- `src/js/auth.js`: Autenticação completa via Supabase, gestão de sessão persistente, perfil de operador (`profiles`), menu de contexto de perfil e sincronização biunívoca com a barra superior e a barra lateral.
- `src/js/friends_manager.js`: Gerenciador social estilo Riot Client com pesquisa rápida, gaveta retrátil de novo sobrevivente com swatches de cores táticas, agrupamento dinâmico (Online / Offline com accordion), sincronização de avatares via tabela `profiles` e presença em tempo real via canal WebSocket `pzhub-global-presence`.
- `src/js/map_engine.js`: Motor Leaflet com projeção customizada do Project Zomboid, suporte a andares (Z-Levels 0-7), GPS viário integrado e marcadores de telemetria.
- `src/js/squad_tracker.js`: Rastreamento de jogadores locais e remotos via leitura de arquivo Lua, disparando notificações de atualização (`onSquadUpdate`) para o painel social.
- `src/js/modpack_manager.js`: Gerenciador de modpacks com suporte à alternância de visualização Grade ⊞ vs Lista ☰, renderização de Markdown, consulta assíncrona de changelogs/comentários ao Supabase e modal tático de detalhes.
- `src/js/local_mods_scanner.js`: Scanner assíncrono de mods em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`), com filtros por tipo, pesquisa em tempo real, visualização em Grade ⊞ e Lista ☰ e atalho para abrir pastas no Windows Explorer.
- `src-tauri/src/updater.rs`: Motor de download em streaming via `reqwest` com emissão contínua de eventos de progresso e inicialização atômica de instaladores NSIS.

## Current Features Implemented
1. **Autenticação e Perfis Sincronizados com Supabase:**
   - Modal nativo de Login e Cadastro de Operador no desktop sincronizado com o banco de dados oficial do PZHub Website (`https://legqoupwzpdzqqhwuwwv.supabase.co`).
   - Sincronização em tempo real de avatar, nome de exibição (`display_name`), papéis (`ADMIN`, `MOD`, `CRIADOR`, `OPERADOR`) e persistência segura em `localStorage`.
   - Espelhamento instantâneo do avatar e nickname tanto no cabeçalho superior direito (`#user-operator-card`) quanto no card do operador da barra lateral da Página 4 (`.riot-user-card`).

2. **Hero Play Button & Injeção de Memória RAM no Project Zomboid:**
   - Botão de lançamento primário em verde esmeralda com destaque visual predominante no cabeçalho superior.
   - Menu dropdown tático integrado para alocação de memória RAM na inicialização (4GB, 6GB, 8GB, 12GB, 16GB, 24GB, 32GB), memorizando a última preferência do jogador.
   - Injeção atômica dos parâmetros JVM `-Xmx` e `-Xms` no arquivo `ProjectZomboid64.json` pelo backend Rust antes de disparar o protocolo Steam (`steam://run/108600`).

3. **Painel Social & Lista de Amigos Estilo Riot Client:**
   - **Card de Perfil do Operador:** Avatar circular, status neon verde online, nome do operador e botão de ação rápida `+` para abrir a gaveta de novos contatos.
   - **Sub-Toolbar Tática:** Abas `Amigos (N)` e `Radar Ao Vivo (M)` com badges pill luminescentes e linha sublinhada dourada na aba ativa.
   - **Barra de Pesquisa Rápida:** Filtro instantâneo em tempo real com botão `✕` para limpeza de busca.
   - **Gaveta Retrátil de Novo Amigo:** Animação suave com 6 seletores de cores em discos circulares brilhantes (Ouro, Ciano, Esmeralda, Púrpura, Rosa, Vermelho).
   - **Agrupamento Automático Online / Offline:**
     - **Online:** Destaque com estrela colorida, cálculo de distância em metros (`Xm de você`), rota `🧭 GPS` e botão de remover com hover vermelho suave.
     - **Offline:** Accordion retrátil recolhível com chevron animado e status cinza discreto.
   - **Sincronização de Avatares:** Fotos oficiais dos amigos puxadas diretamente da tabela `profiles` do Supabase e renderizadas com anel de foco tático, com fallback automático para iniciais caso o amigo não possua foto cadastrada.

4. **Presença Global em Tempo Real entre Usuários Desktop (Supabase Realtime Presence):**
   - Canal WebSocket `pzhub-global-presence` monitorando usuários ativos que estão com o PZHub Desktop aberto.
   - Se um amigo abrir o aplicativo desktop, seu status é promovido instantaneamente para `🟢 ONLINE NO PZHUB DESKTOP` para todos os outros usuários logados.
   - Caso os jogadores entrem no mesmo servidor do Project Zomboid, o rastreador de telemetria do jogo assume automaticamente com coordenadas e rotas GPS.

5. **Showcase Carousel Comunitário no Hub:**
   - Carrossel dinâmico na Página 1 (Centro de Operações) exibindo modpacks em destaque da comunidade.
   - Transição suave entre slides, controles manuais de navegação (`‹` e `›`), indicadores de paginação em dots e botão de ação imediata para instalação e subscrição.

6. **Responsividade Blindada & Isolamento de Abas na Página 4 (Radar Tático):**
   - `.tactical-header` travado em `44px` com `flex-wrap: nowrap !important;` e `overflow: hidden;`, eliminando qualquer sobreposição ou quebra de linha em monitores verticais ou widescreen.
   - `.tactical-sidebar` posicionada em `top: 58px; left: 8px; bottom: 12px; width: 330px;`, criando folga de 6px abaixo do header.
   - `.tactical-dock` centralizado no espaço útil do mapa com ancoragem adaptativa à direita em telas menores.
   - Isolamento rígido de abas (`.tab-pane` com `display: none !important;`) eliminando vazamentos de conteúdo ou lacunas vazias entre Cidades, Loot, Andar e Config.

7. **Motor de Mapa Tático 1:1 Knox County & Live Radar:**
   - Projeção de coordenadas Project Zomboid com suporte a andares (Z-Levels 0 a 7) e cache local de tiles em disco gerenciado pelo Rust.
   - Navegação GPS viária com algoritmo A* por malha de 1.098 ruas, bússola cardeal e HUD superior com ETA.
   - Modo Mini-Radar estilo GTA V ($340\times220\text{px}$) frameless, always-on-top.

8. **Gerenciador de Modpacks & Scanner Local:**
   - Catálogo de modpacks integrado ao Supabase com alternância entre Grade ⊞ e Lista ☰.
   - Scanner assíncrono de mods locais em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`).
   - Modal tático de detalhes com Markdown renderizado, changelogs e comentários.

9. **Auto-Updater Nativo (Windows NSIS):**
   - Consulta SemVer a manifestos remotos, modal tático de notas de atualização e streaming de download em Rust com substituição atômica de executáveis.

10. **Binários de Distribuição Compilados:**
    - `src-tauri/target/release/bundle/nsis/PZHub_2.1.1_x64-setup.exe` (Instalador NSIS v2.1.1)
    - `src-tauri/target/release/bundle/msi/PZHub_2.0.0_x64_en-US.msi` (Instalador MSI v2.0.0)

## Work-in-Progress Items
- Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canal Realtime.
- Otimização do loop de telemetria multiplayer em servidores densos com mais de 30 jogadores simultâneos no esquadrão.
- Pré-carregamento offline programado de tiles de alta resolução das cidades principais (Louisville, Muldraugh, West Point).

## Known TODOs & Next Steps
- Implementar chat tático direto por texto entre amigos através do canal Supabase Realtime.
- Adicionar notificações nativas do Windows quando um amigo entrar no PZHub Desktop ou conectar ao servidor do Zomboid.
- Criar ferramenta de diagnóstico de compatibilidade e conflitos de mods no scanner local.
