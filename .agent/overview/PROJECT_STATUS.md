# Project Overview

## Project Name
PZHub Desktop (Tactical Live Radar, Modpack Manager & Operations Suite)

## Description
Aplicação desktop nativa para Windows desenvolvida em **Tauri v2 + Rust** e **Vanilla JavaScript / Leaflet.js**, projetada como a central tática de inteligência, radar e gerenciamento para a comunidade de **Project Zomboid (Build 42 & Build 41)**. O ecossistema integra motor de mapa isométrico 1:1 de Knox County com cache de tiles em disco gerenciado pelo Rust, motor de Blips táticos vetoriais SVG estilo GTA V (FiveM / RAGE:MP) com 20 categorias e sistema de LOD em 3 camadas, malha de 1.017 POIs enriquecidos (incluindo oficinas mecânicas de Fallas Lake, West Point, Muldraugh e Riverside), telemetria e radar ao vivo via mini-mod Lua, navegação GPS A* por malha viária oficial de 1.098 ruas, catálogo e instalador de modpacks com integração ao Steam Workshop (`steam://`) e descompactação assíncrona de `.zip`, scanner local de mods com alternância Grade ⊞ / Lista ☰, autenticação integrada com Supabase Auth/PostgreSQL, painel social global estilo Riot Client (com gaveta retrátil, lista de amigos, DM pop-up em tempo real, som de notificação Web Audio API e gestão de solicitações conectado ao banco de dados do website), botão hero de lançamento na Steam com injeção de parâmetros JVM de memória RAM no `ProjectZomboid64.json` e sistema de auto-atualização blindado (v2.2.2) com validação binária por Magic Bytes, download em streaming, elevação UAC nativa no Windows e fallback dinâmico de branches (`master`/`main`).

## Tech Stack
- **Languages:** Rust 1.94+ (Edition 2021), JavaScript (ES2023 Modules), Lua 5.1/JIT (PZ Modding API), HTML5, CSS3, SQL (PostgreSQL DDL/RLS)
- **Frameworks:** Tauri v2 (`tauri` 2.x, `tauri-plugin-opener` 2.x), Leaflet.js v1.9.4
- **Tools:** Cargo, Node.js / npm, NSIS (Windows Installer Toolset), WiX Toolset (MSI), Tauri CLI v2
- **Services:** Supabase (PostgreSQL + Auth + Storage + Realtime Presence Channels + REST API), Steam Workshop Protocol (`steam://`), Vercel (Hospedagem da plataforma web `VICCS_PZHub_Website`), GitHub Raw & Releases (Distribuição oficial de manifestos e instaladores binários)

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
├── scripts/                                 # Scripts utilitários de manutenção
│   └── enrich_pois.js                       # Telemetria e enriquecimento de edificações do mapa
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
│   │   ├── main.css                         # Design System Tarkov, Toasts Táticos, Modais e Riot Client Drawer
│   │   └── map.css                          # Estilos táticos de Radar, Blips GTA V, HUD, camadas e Leaflet
│   ├── data/
│   │   ├── buildings_index.json             # Índice de edificações de Knox County (1.017 POIs)
│   │   ├── meta.json                        # Metadados de projeção e categorias de POIs
│   │   ├── streets.json                     # Malha viária oficial (1.098 segmentos de ruas)
│   │   ├── worldmap_forest.json             # Vetores de áreas de mata e floresta
│   │   └── worldmap_water.json              # Vetores de rios e massas d'água
│   ├── js/
│   │   ├── app.js                           # Controlador principal, router de views e inicialização de subsistemas
│   │   ├── auth.js                          # Autenticação e perfis sincronizados com Supabase Auth
│   │   ├── blip_icons.js                    # Motor vetorial de Blips GTA V (FiveM/RAGE:MP) com 20 categorias e paleta tática
│   │   ├── friends_manager.js               # Painel social local legado do radar
│   │   ├── gps_router.js                    # A* Pathfinding viário e cálculo de distâncias
│   │   ├── i18n.js                          # Dicionários de tradução (PT-BR, EN-US, ES-ES)
│   │   ├── launcher.js                      # Lançador Steam com seletor de alocação de memória RAM
│   │   ├── local_mods_scanner.js            # Scanner com modos Grade ⊞ e Lista ☰ de auditoria
│   │   ├── map_engine.js                    # Motor isométrico 1:1 Knox County com Z-levels 0 a 7 e LOD
│   │   ├── markdown_parser.js               # Parser e sanitizador Markdown nativo zero-dependency
│   │   ├── modpack_manager.js               # Gerenciador de Modpacks conectado ao Supabase
│   │   ├── overlay.js                       # HUD flutuante e atalhos globais
│   │   ├── pz_projection.js                 # Projeção matemática de coordenadas Zomboid
│   │   ├── social_manager.js                # Painel social estilo Riot Client 1:1, DM Pop-up e Supabase Realtime
│   │   ├── squad_tracker.js                 # Telemetria e rastreamento de aliados em tempo real
│   │   ├── supabaseClient.js                # Cliente Supabase singleton com persistência de sessão
│   │   └── updater.js                       # Auto-updater blindado, central de versão, modais táticos e toasts
│   ├── lib/
│   │   ├── leaflet/                         # Biblioteca Leaflet.js local integrada
│   │   └── supabase/                        # Bundled Supabase client
│   ├── favicon.ico                          # Favicon do aplicativo
│   ├── index.html                           # Layout Desktop, Topbar Slim, Gaveta Riot Social, Modais e Views
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
│   │   ├── lib.rs                           # Registro dos comandos nativos e inicialização de plugins
│   │   ├── main.rs                          # Entry point do executável Windows
│   │   ├── mod_installer.rs                 # Instalador automatizado do mod Lua no Zomboid
│   │   ├── mod_manager.rs                   # Varredura do filesystem, unzip assíncrono e Steam
│   │   ├── tracker.rs                       # Leitura segura de telemetria local e estado offline
│   │   └── updater.rs                       # Downloader nativo em streaming, elevação UAC e consulta de manifesto
│   ├── target/release/bundle/               # Pacotes de distribuição oficiais gerados
│   │   ├── nsis/PZHub_2.2.2_x64-setup.exe   # Instalador oficial NSIS v2.2.2 (4.3 MB)
│   │   ├── nsis/PZHub_2.2.1_x64-setup.exe   # Instalador oficial NSIS v2.2.1
│   │   └── msi/PZHub_2.2.1_x64_en-US.msi    # Pacote MSI v2.2.1
│   ├── Cargo.toml                           # Dependências e manifesto Rust (v2.2.2)
│   └── tauri.conf.json                      # Configuração de janelas, permissões e empacotamento (v2.2.2)
├── download_data.js                         # Utilitário para download de mapas e vetores oficiais
├── latest.json                              # Manifesto oficial de release remoto (v2.2.2)
├── package.json                             # Scripts npm e dependências de frontend (v2.2.2)
└── README.md                                # Apresentação do projeto
```

## Key Files
- `src-tauri/src/lib.rs`: Registra todos os comandos nativos expostos ao frontend (cache de tiles, telemetria, janelas, scanner de mods, modpacks, launcher de RAM, manifesto remoto e auto-updater).
- `src-tauri/src/updater.rs`: Motor de download em streaming de patch via `reqwest` com emissão contínua de eventos de progresso, validação rigorosa de integridade binária por Magic Bytes (PE `MZ` e MSI OLE `0xD0...`) para eliminar o erro de 16 bits do Windows, auto-correção dinâmica de extensão (`.exe` vs `.msi`), criação de binários temporários seguros com timestamp (`PZHub_Update_Setup_<timestamp>.<ext>`), disparo desanexado com elevação UAC via `cmd.exe /C start ""` e fallback PowerShell `-Verb RunAs`, e função `fetch_update_manifest` com normalização de URL e auto-fallback resiliente entre branches `master` e `main` em caso de erro HTTP 404.
- `src/js/updater.js`: Orquestrador completo de atualização no frontend. Consulta o manifesto oficial no GitHub Raw, gerencia a persistência da última verificação no `localStorage`, dispara eventos customizados (`updater-check-success`, `updater-check-failed`), controla os Toasts Táticos (`showTacticalToast`) e os Modais Táticos (`#tactical-update-modal` e `#tactical-version-modal`) com suporte a classes `.visible` e `.active`, barra de progresso em tempo real e link de contingência no navegador via `tauri-plugin-opener`.
- `src/js/social_manager.js`: Gerenciador do Painel Social Global Estilo Riot Client. Controla a gaveta lateral onipresente (`#riot-social-drawer`), 3 abas segmentadas (Amigos, Chat Direto e Solicitações), isolamento total de mensagens na tabela `direct_messages` (sem vazar para o mural do website), sintetizador acústico Web Audio API (F#5 para C#6), presença dinâmica (`updateFriendsPresence`) com promoção de aliados online e canal WebSocket Realtime compartilhado (`pzhub-global-social`).
- `src-tauri/src/launcher.rs`: Localiza as pastas de instalação do Project Zomboid no Windows, injeta a configuração de memória RAM (`-Xmx` e `-Xms`) diretamente no `ProjectZomboid64.json` e dispara a inicialização do jogo via Steam (`steam://run/108600`) com fallback para o executável nativo.
- `src/js/launcher.js`: Gerenciador frontend do botão hero "JOGAR" no cabeçalho superior e menu dropdown tático para seleção de memória RAM (4GB a 32GB) com persistência em `localStorage`.
- `src/js/auth.js`: Autenticação completa via Supabase, gestão de sessão persistente, perfil de operador (`profiles`), menu de contexto de perfil e sincronização com cabeçalho superior e painel social.
- `src/js/map_engine.js`: Motor Leaflet com projeção customizada do Project Zomboid, suporte a andares (Z-Levels 0-7), GPS viário integrado e marcadores de telemetria.
- `src/js/squad_tracker.js`: Rastreamento de jogadores locais e remotos via leitura de arquivo Lua, disparando notificações de atualização (`onSquadUpdate`) para o painel social.
- `src/js/modpack_manager.js`: Gerenciador de modpacks com suporte à alternância de visualização Grade ⊞ vs Lista ☰, renderização de Markdown, consulta assíncrona de changelogs/comentários ao Supabase e modal tático de detalhes.
- `src/js/local_mods_scanner.js`: Scanner assíncrono de mods em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`), com filtros por tipo, pesquisa em tempo real, visualização em Grade ⊞ e Lista ☰ e atalho para abrir pastas no Windows Explorer.
- `.agent/updates/PATCH_NOTES.md`: Caderno histórico imersivo e descontraído de notas de versão (estilo Riot Games) abrangendo todas as releases de 1.0.0 a 2.2.1.

## Current Features Implemented
1. **Auto-Updater Blindado & Execução de Patch (v2.2.1):**
   - **Endpoint Oficial:** Apontado para `https://raw.githubusercontent.com/pauloviccs/PZHub/master/latest.json`.
   - **Auto-Fallback Inteligente:** Mecanismo duplo (Rust nativo + JS fetch) com failover automático entre `master` e `main`.
   - **Validação de Integridade por Magic Bytes:** Leitura de cabeçalho binário dos arquivos baixados para verificação de assinaturas PE Executable (`MZ`) e MSI OLE Compound File (`0xD0CF11E0A1B11AE1`). Impede categoricamente o erro Win32 de "Aplicativo de 16 bits não suportado" decorrente de respostas parciais ou HTMLs de erro do servidor.
   - **Auto-Correção Dinâmica de Extensão:** Detecta se a URL apontou para `.exe` mas o binário é `.msi` (ou vice-versa), renomeando o arquivo antes do disparo.
   - **Correção da Camada Visual:** Modais táticos com suporte bidirecional para as classes `.visible` e `.active`, eliminando o problema de modais invisíveis.
   - **Disparo Seguro com UAC no Windows:** Execução do instalador via Shell nativa (`cmd.exe /C start ""` e fallback PowerShell `-Verb RunAs`), permitindo que o diálogo de confirmação de Administrador do Windows seja exibido sem gerar o erro Win32 `ERROR_ELEVATION_REQUIRED (740)`.
   - **Arquivos Temporários Isolados:** Criação de binários no `%TEMP%` com sufixo timestamp (`PZHub_Update_Setup_<timestamp>.<ext>`), impedindo erros de arquivo travado.
   - **Encerramento Atômico:** Aguardo de 1 segundo para spawn do instalador antes do `exit(0)` do PZHub antigo, liberando DLLs e arquivos para substituição imediata.
   - **Fallback de Download no Navegador:** Link de contingência aberto diretamente no navegador padrão via `tauri-plugin-opener` caso o download nativo encontre oscilações de rede.

2. **Painel Social Global Estilo Riot Client & Chat Privado (v2.2.1):**
   - **Gaveta Lateral Onipresente (`#riot-social-drawer`):** Acessível em todas as telas através do botão com avatar/badge social na topbar (`#btn-open-riot-drawer`).
   - **3 Abas Segmentadas:**
     - *Amigos:* Lista categorizada com avatares reais, taglines, status dinâmico (Online, Ausente, In-Game Zomboid com ícone de monitor de PC) e atalho direto de DM.
     - *Chat:* Central de conversas recentes com contadores de não-lidas e status do parceiro.
     - *Solicitações:* Gestão de amizades pendentes com busca de operadores por Nome + Tagline (`VICCS#BR1`), botões de Aceitar (verde) e Recusar (vermelho).
   - **Janela Flutuante de DM (Direct Message Pop-up):** Janela de chat estilo Riot Client posicionada no canto inferior direito com cabeçalho de status, histórico persistente com aviso de retenção de 30 dias, scroll automático e envio com a tecla Enter.
   - **Isolamento de Mensagens Privadas:** Persistência em `public.direct_messages` com RLS rígido, eliminando 100% o vazamento de DMs para o mural de recados (`profile_scraps`) do site.
   - **Notificação Sonora Tática:** Áudio bi-tonal sintetizado via Web Audio API (F#5 para C#6 com decaimento suave de 0.28s) acionado a cada nova mensagem recebida de terceiros.
   - **Presença Real e Dinâmica:** Algoritmo `updateFriendsPresence()` acionado no evento `sync` do canal WebSocket Realtime (`pzhub-global-social`), promovendo amigos ativos para o topo da lista e atualizando o status do chat em tempo real.

3. **Autenticação e Perfis Sincronizados com Supabase:**
   - Modal nativo de Login e Cadastro de Operador sincronizado com o banco oficial do PZHub Website (`https://legqoupwzpdzqqhwuwwv.supabase.co`).
   - Sincronização em tempo real de avatar, nome de exibição (`display_name`), papéis (`ADMIN`, `MOD`, `CRIADOR`, `OPERADOR`) e persistência de sessão.
   - Espelhamento instantâneo no cabeçalho superior direito (`#user-operator-card`).

4. **Hero Play Button & Injeção de Memória RAM no Project Zomboid:**
   - Botão de lançamento primário em verde esmeralda no cabeçalho superior.
   - Menu dropdown tático para alocação de memória RAM (4GB a 32GB) com persistência da preferência do jogador.
   - Injeção atômica dos parâmetros JVM `-Xmx` e `-Xms` no arquivo `ProjectZomboid64.json` pelo backend Rust antes de disparar o protocolo Steam (`steam://run/108600`).

5. **Showcase Carousel Comunitário no Hub:**
   - Carrossel dinâmico na Página 1 (Centro de Operações) exibindo modpacks em destaque da comunidade com paginação, controles manuais e botão de instalação.

6. **Responsividade Blindada & Isolamento de Abas na Página 4 (Radar Tático):**
   - Header superior slim com 44px e ancoragem flexível.
   - Barra lateral tática flutuante de 330px para amigos do radar in-game.
   - Isolamento estrito de abas via CSS (`.tab-pane` com `display: none !important;`).

7. **Motor de Mapa Tático 1:1 Knox County & Live Radar:**
   - Projeção de coordenadas Project Zomboid com suporte a andares (Z-Levels 0 a 7) e cache local de tiles em disco gerenciado pelo Rust.
   - Navegação GPS viária com algoritmo A* por malha de 1.098 ruas, bússola cardeal e HUD superior com ETA.
   - Modo Mini-Radar estilo GTA V ($340\times220\text{px}$) frameless, always-on-top.

8. **Gerenciador de Modpacks & Scanner Local:**
   - Catálogo de modpacks integrado ao Supabase com alternância entre Grade ⊞ e Lista ☰.
   - Scanner assíncrono de mods locais em `%USERPROFILE%/Zomboid/mods` e Steam Workshop (`108600`).
   - Modal tático de detalhes com Markdown renderizado, changelogs e comentários.

9. **Binários e Instaladores Oficiais Gerados (v2.2.2 & v2.2.1):**
   - `src-tauri/target/release/bundle/nsis/PZHub_2.2.2_x64-setup.exe` (Instalador NSIS Oficial v2.2.2 - 4.3 MB)
   - `src-tauri/target/release/tauri-app.exe` (Executável Stand-alone Release v2.2.2 - 13.5 MB)
   - `src-tauri/target/release/bundle/nsis/PZHub_2.2.1_x64-setup.exe` (Instalador NSIS Oficial v2.2.1 - 4.3 MB)
   - `src-tauri/target/release/bundle/msi/PZHub_2.2.1_x64_en-US.msi` (Instalador MSI Corporativo v2.2.1 - 5.9 MB)

10. **Overhaul de Blips Táticos GTA V & Enriquecimento de POIs (v2.2.2):**
    - **Motor Vetorial SVG Estilo GTA V (`src/js/blip_icons.js`):** 20 ícones táticos de alta precisão baseados na documentação FiveM/RAGE:MP (Pistola Ammu-Nation #110, Escudo LSPD #60, Cruz Hospital #61, Pílula Farmácia #51, Chave LS Customs #72, Cifrão Loja 24/7 #52, Bomba Gasolina #361, Spiffo #93, Martelo Hardware #402, etc.).
    - **Estética de Alto Contraste & Efeito Neon Tático (`src/css/map.css`):** Estrutura `.poi-blip-gta` com fundo escuro chanfrado, borda com cor característica de cada blip, aura luminescente e animação de escala suave (`scale(1.35)`) no hover.
    - **Enriquecimento da Base de Dados (`src/data/buildings_index.json` & `meta.json`):** Adição oficial da categoria `mechanic` (`#ffa502`) e catalogação de oficinas mecânicas e funilarias (Fallas Lake `28_32_14-17`, West Point, Muldraugh e Riverside), totalizando 1.017 edifícios mapeados.
    - **Desbloqueio de 537+ Edifícios Ocultos no Mapa:** Expansão de `activeCategories` de 9 para 20 categorias no `map_engine.js`.
    - **Sistema Inteligente de LOD em 3 Camadas:**
      - *Tier 1 (Zoom >= 13):* Serviços vitais (Armarias, Delegacias, Hospitais, Bombeiros, Oficinas, Postos) com 30px.
      - *Tier 2 (Zoom >= 14):* Comércio essencial (Supermercados, Farmácias, Ferramentas, Roupas, Restaurantes, Bancos) com 26px.
      - *Tier 3 (Zoom >= 15):* Galpões, Armazéns, Escolas e Motéis com 22px.
    - **Sincronização de Filtros na Sidebar (`src/js/app.js`):** Lista de 18 categorias táticas com badges de cor e conexão direta com `mapEngine.toggleCategory()`.

## Work-in-Progress Items
- Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canal Realtime.
- Otimização do loop de telemetria multiplayer em servidores densos com mais de 30 jogadores simultâneos no esquadrão.
- Pré-carregamento offline programado de tiles de alta resolução das cidades principais (Louisville, Muldraugh, West Point).

## Known TODOs & Next Steps
- Notificações nativas do Windows quando um amigo entrar no PZHub Desktop ou enviar uma DM.
- Ferramenta de diagnóstico de compatibilidade e conflitos de mods no scanner local.
- Integração de chamadas de voz táticas (estilo rádio de comunicação com efeito de chiado e ruído militar).
