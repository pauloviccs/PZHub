# Project Overview

## Project Name
PZHub Desktop (Tactical Live Radar, Modpack Manager & Operations Suite)

## Description
Aplicação desktop nativa para Windows desenvolvida em **Tauri v2 + Rust** e **Vanilla JavaScript / Leaflet.js**, projetada como a central tática de inteligência, radar, modpacks e motor de reprodução multimídia para a comunidade de **Project Zomboid (Build 42 & Build 41)**. Na **v2.2.6**, o sistema ganhou telemetria de downloads em tempo real com RPCs atômicas PostgreSQL `SECURITY DEFINER` e sincronização via Supabase Realtime WebSocket. O ecossistema integra:
- Motor de mapa isométrico 1:1 de Knox County com cache de tiles em disco gerenciado pelo Rust;
- Motor de Blips táticos vetoriais SVG estilo GTA V (FiveM / RAGE:MP) com 20 categorias e sistema de LOD em 3 camadas;
- Malha de 1.017 POIs enriquecidos (incluindo oficinas mecânicas de Fallas Lake, West Point, Muldraugh e Riverside);
- Telemetria e radar ao vivo via mini-mod Lua e navegação GPS A* por malha viária oficial de 1.098 ruas;
- Catálogo e instalador de modpacks com integração ao Steam Workshop (`steam://`), descompactação assíncrona de `.zip` e **contagem atômica de downloads via RPC `increment_modpack_download` com `SECURITY DEFINER`**;
- Scanner local de mods com alternância Grade ⊞ / Lista ☰;
- Autenticação integrada com Supabase Auth/PostgreSQL e painel social global estilo Riot Client (gaveta lateral retrátil, lista de amigos com detecção de presença dinâmica, DM pop-up com notificação acústica tática sintetizada e tabela isolada `direct_messages`);
- Botão hero de lançamento na Steam com injeção de parâmetros JVM de memória RAM no `ProjectZomboid64.json`;
- Sistema de auto-atualização blindado com validação binária por Magic Bytes (`MZ` / `OLE`) e elevação UAC nativa no Windows;
- **Subsistema de Transmissão Multimídia & TV PiP (Protocolo VICCS Broadcasting - v2.2.3 / v2.2.5):**
  - **Motor de Áudio Espacial 3D & DSP Acústico (`src/js/spatial_audio_engine.js`):** Web Audio API com HRTF/EqualPower, respostas de impulso (IR) procedurais de ambientes, barramentos de reverberação duplos com crossfade suave entre cômodos, atenuação por oclusão e compressor/limitador master para múltiplos rádios.
  - **Som Automotivo Sincronizado para Veículos:** Rastreamento espacial e acompanhamento de movimento em tempo real para qualquer carro no jogo com som direto de cabine para passageiros.
  - **Janela Flutuante PiP Always-on-Top (`src/pip.html`):** Moldura estilo monitor CRT dos anos 90, scanlines analógicas e arrasto livre (`data-tauri-drag-region`) para televisores in-game.
  - **Heartbeat TTL & Anti-Reprodução Fantasma:** Interrupção automática da música quando o jogo fecha ou o jogador desconecta, além de proteção contra execução indevida com jogo fechado.
  - **Anti-Overlap de Canais Vanilla:** Silenciamento automático das transmissões vanilla em rádios e televisões durante a reprodução do mod.

## Tech Stack
- **Languages:** Rust 1.94+ (Edition 2021), JavaScript (ES2023 Modules), Lua 5.1/JIT (PZ Modding API), HTML5, CSS3, SQL (PostgreSQL DDL/RLS/Stored Procedures)
- **Frameworks:** Tauri v2 (`tauri` 2.x, `tauri-plugin-opener` 2.x), Leaflet.js v1.9.4, Web Audio API
- **Tools:** Cargo, Node.js / npm, NSIS (Windows Installer Toolset), WiX Toolset (MSI), Tauri CLI v2
- **Services:** Supabase (PostgreSQL + Auth + Storage + Realtime Presence Channels + Realtime Postgres Changes + REST API + RPC), Steam Workshop Protocol (`steam://`), YouTube IFrame API, Vercel (Hospedagem da plataforma web `VICCS_PZHub_Website`), GitHub Raw & Releases (Distribuição oficial de manifestos e instaladores binários)

## Folder Structure
- ```text
VICCS_PZHub/ (Desktop App Workspace Root)
├── .agent/                                  # Cortex de Memória e Contexto do Agente
│   ├── assets/                              # Brand assets (Logos SVG, ícones e referências)
│   ├── context/                             # Especificações de arquitetura, schema e stack
│   │   ├── architecture.md                  # Arquitetura do ecossistema Desktop + Web
│   │   ├── database_schema.md               # Schema Supabase e políticas RLS
│   │   └── stack.md                         # Especificação técnica da stack
│   ├── guidelines/                          # Diretrizes de desenvolvimento e código
│   │   ├── code_style.md                    # Padrões de código JavaScript/Rust
│   │   └── ui_ux.md                         # Diretrizes Tarkov, Tactical Liquid Glass e Riot Client
│   ├── logs/                                # Registros de execução de servidores e consoles
│   ├── memory/                              # Memória operacional do projeto
│   │   ├── active_task.md                   # Tarefa ativa e entregas imediatas
│   │   ├── changelog.md                     # Histórico versionado de releases
│   │   └── todos.md                         # Roadmap e checklist de fases
│   ├── overview/
│   │   └── PROJECT_STATUS.md                # Visão geral unificada e status do projeto
│   └── updates/
│       ├── PATCH_NOTES.md                   # Caderno geral de notas de atualização
│       ├── PATCH_NOTES_2.2.3.md             # Notas detalhadas do motor multimídia
│       └── PATCH_NOTES_2.2.6.md             # Telemetria de downloads em tempo real & RPCs
├── scripts/                                 # Scripts utilitários de manutenção
│   └── enrich_pois.js                       # Telemetria e enriquecimento de 1.017 POIs do mapa
├── server-mod/                              # Mini-mod Lua para Project Zomboid (B41 & B42)
├── src/                                     # Frontend Desktop (Vanilla JS + Leaflet)
│   ├── assets/                              # Ícones, logotipos vetoriais e ilustrações SVG
│   ├── css/
│   │   ├── main.css                         # Design System Tarkov, Toasts, Modais, Aba 05 e Gaveta Riot
│   │   └── map.css                          # Estilos táticos de Radar, Blips GTA V, HUD e Leaflet
│   ├── data/
│   │   ├── buildings_index.json             # Índice de edificações de Knox County (1.017 POIs)
│   │   ├── meta.json                        # Metadados de projeção e categorias de POIs
│   │   ├── streets.json                     # Malha viária oficial (1.098 ruas)
│   │   ├── worldmap_forest.json             # Vetores de floresta
│   │   └── worldmap_water.json              # Vetores de rios e massas d'água
│   ├── js/
│   │   ├── app.js                           # Controlador principal, router, métricas globais e Realtime
│   │   ├── auth.js                          # Autenticação e perfis sincronizados com Supabase Auth
│   │   ├── blip_icons.js                    # Motor vetorial de Blips GTA V (FiveM / RAGE:MP)
│   │   ├── broadcasting_engine.js           # Motor de áudio em segundo plano e sincronização TV PiP
│   │   ├── friends_manager.js               # Painel social local do radar
│   │   ├── gps_router.js                    # A* Pathfinding viário e cálculo de distâncias
│   │   ├── i18n.js                          # Dicionários de tradução (PT-BR, EN-US, ES-ES)
│   │   ├── launcher.js                      # Lançador Steam com seletor de alocação de RAM
│   │   ├── local_mods_scanner.js            # Scanner com modos Grade ⊞ e Lista ☰
│   │   ├── map_engine.js                    # Motor isométrico 1:1 Knox County com Z-levels e LOD
│   │   ├── markdown_parser.js               # Parser Markdown nativo zero-dependency
│   │   ├── modpack_manager.js               # Gerenciador de Modpacks com RPC atômica de downloads
│   │   ├── overlay.js                       # HUD flutuante e atalhos globais
│   │   ├── pz_projection.js                 # Projeção matemática de coordenadas Zomboid
│   │   ├── social_manager.js                # Painel social estilo Riot Client 1:1 e Supabase Realtime
│   │   ├── spatial_audio_engine.js          # Motor Web Audio API de espacialização 3D e DSP acústico
│   │   ├── squad_tracker.js                 # Telemetria e rastreamento de aliados
│   │   ├── supabaseClient.js                # Cliente Supabase singleton
│   │   └── updater.js                       # Auto-updater blindado v2.2.6 e toasts táticos
│   ├── lib/
│   │   ├── leaflet/                         # Leaflet.js local integrado
│   │   └── supabase/                        # Bundled Supabase client
│   ├── favicon.ico                          # Favicon do aplicativo
│   ├── index.html                           # Layout Desktop, Topbar, Métricas Globais, Modais e Abas 01 a 05
│   ├── main.js                              # Entry script
│   ├── pip.html                             # Janela Flutuante PiP Always-on-Top para TV CRT
│   ├── site.webmanifest                     # Manifesto web de metadados
│   └── styles.css                           # Estilos base
├── src-tauri/                               # Backend Nativo Rust (Tauri v2)
│   ├── capabilities/
│   │   └── default.json                     # Permissões das janelas 'main' e 'pip_player'
│   ├── icons/                               # Ícones oficiais multi-resolução
│   ├── src/
│   │   ├── broadcasting.rs                  # Detecção nativa do mod e leitura atômica de game_to_app.json
│   │   ├── cache.rs                         # Cache local assíncrono de tiles em disco
│   │   ├── config.rs                        # Configurações do usuário, amigos e JSON
│   │   ├── launcher.rs                      # Configuração de JVM/RAM em ProjectZomboid64.json
│   │   ├── lib.rs                           # Registro dos comandos nativos Tauri
│   │   ├── main.rs                          # Entry point do executável Windows
│   │   ├── mod_installer.rs                 # Instalador automatizado do mod Lua
│   │   ├── mod_manager.rs                   # Varredura do filesystem, unzip assíncrono e Steam
│   │   ├── tracker.rs                       # Leitura segura de telemetria local
│   │   └── updater.rs                       # Downloader nativo em streaming e elevação UAC
│   ├── Cargo.toml                           # Dependências e manifesto Rust (v2.2.6)
│   └── tauri.conf.json                      # Configuração de janelas, alvos nsis/msi e bundle (v2.2.6)
├── download_data.js                         # Utilitário para download de mapas e vetores
├── latest.json                              # Manifesto oficial de release remoto (v2.2.6)
├── package.json                             # Scripts npm e dependências de frontend (v2.2.6)
└── README.md                                # Apresentação do projeto
```

## Key Files
- `src/js/spatial_audio_engine.js`: Motor Web Audio API de espacialização 3D, HRTF, filtros de oclusão e reverberação procedural com barramentos duplos para múltiplos rádios e veículos.
- `src/js/broadcasting_engine.js`: Orquestrador do motor de reprodução externa. Conecta-se à YouTube IFrame API de forma invisível, realiza seek temporal de multiplayer via `startedAt` e transmite eventos para a janela PiP.
- `src/pip.html`: Janela flutuante Always-on-Top dedicada à reprodução de vídeo para televisores do jogo, equipada com moldura CRT retrô militar, scanlines e arraste livre (`data-tauri-drag-region`).
- `src-tauri/src/broadcasting.rs`: Módulo Rust de alto desempenho que detecta a presença de `VICCS_Broadcasting` nas pastas do jogo e lê o IPC atômico `Zomboid/Lua/PZMusic/game_to_app.json`.
- `src/js/blip_icons.js`: Motor vetorial SVG de Blips táticos estilo GTA V (FiveM / RAGE:MP) em 20 categorias com sistema de LOD em 3 camadas.
- `src/js/social_manager.js`: Painel Social estilo Riot Client 1:1 com gaveta retrátil, DM pop-up flutuante, áudio de notificação Web Audio API e tabela isolada `direct_messages`.
- `src-tauri/src/lib.rs`: Registra comandos nativos de tiles, telemetria, janelas, modpacks, launcher de RAM e broadcasting.
- `src/js/app.js`: Controlador principal com router de abas (`view-hub`, `view-modpacks`, `view-local-mods`, `view-map` e `view-broadcasting`).
- `src/css/main.css`: Design System Tactical Liquid Glass com classes completas para a visualização tática de broadcasting e modais.

## Current Features Implemented
1. **Telemetria de Downloads em Tempo Real & RPCs Atômicas (v2.2.6):**
   - **Card DOWNLOADS GLOBAIS no Hub:** Indicador visual no `hero-metrics-strip` do Centro de Operações (Aba 01) com contagem verificada de downloads do software (`#hub-global-downloads-count`).
   - **Contagem Atômica de Modpacks via RPC:** Substituição do `PATCH` bloqueado por RLS pela Stored Procedure `increment_modpack_download(target_pack_id)` com `SECURITY DEFINER`.
   - **Sincronização WebSocket Realtime:** Canal `pzhub-global-downloads` no `app.js` assinando tabelas `app_analytics` e `modpacks` para updates zero-refresh.
   - **Tabela `app_analytics`:** Registro centralizado de telemetria do software desktop (`id = 'pzhub_desktop'`, `total_downloads`).

2. **Motor de Transmissão Multimídia & Áudio Espacial 3D (v2.2.3 & v2.2.5):**
   - **Aba 05 TRANSMISSÃO:** Nova interface tática integrada à navbar com badge de status do motor.
   - **Master Switch com Trava:** O toggle de ativação só é liberado se o mod `VICCS_Broadcasting` for detectado no computador do usuário.
   - **Modal de Boas-Vindas Tático:** Janela com orientações claras explicando que o motor roda em segundo plano e que o controle é 100% in-game.
   - **Motor de Áudio Espacial 3D & DSP Acústico (`spatial_audio_engine.js`):** Panning HRTF / EqualPower, respostas de impulso (IR) procedurais de ambientes, crossfade suave de reverberação entre cômodos, atenuação física de oclusão e limitador/compressor no master.
   - **Som Automotivo Sincronizado para Veículos:** Rastreamento dinâmico em tempo real de carros em movimento com áudio espacializado para motoristas, passageiros e transeuntes.
   - **Janela Flutuante PiP para TVs (`pip.html`):** Janela Always-on-Top com estética de tubo CRT que abre automaticamente ao sintonizar uma televisão e fecha ao desligar (Auto-PiP).
   - **Player Invisível de Áudio Espacial:** O PZHub reproduz áudio posicional 3D sem exibir controles invasivos na tela do jogador.
   - **Sincronização Multiplayer por Timestamp:** O motor calcula a diferença temporal `currentTimestamp - startedAt` para posicionar novos jogadores no segundo exato da transmissão.
   - **Heartbeat TTL & Anti-Reprodução Fantasma:** Interrupção automática da música quando o jogo fecha ou o jogador desconecta do servidor, além de proteção contra reprodução indevida ao abrir o PZHub com o jogo fechado.
   - **Anti-Overlap de Canais Vanilla:** Silenciamento automático das transmissões vanilla em rádios e televisores durante a reprodução do mod, com restauração automática ao finalizar.

3. **Overhaul de Blips Táticos GTA V & Enriquecimento de POIs (v2.2.2):**
   - 20 ícones vetoriais SVG de alta resolução inspirados no FiveM / RAGE:MP.
   - Catalogação de 1.017 edificações em Knox County com inclusão da categoria `mechanic` (Blip 72 - LS Customs) para Fallas Lake, West Point, Muldraugh e Riverside.
   - Sistema de Level of Detail (LOD) em 3 camadas de zoom e checklist com badges de cores na sidebar.

4. **Painel Social Global Estilo Riot Client & Chat Privado (v2.2.1):**
   - Gaveta lateral retrátil onipresente (`#riot-social-drawer`) acessível via atalho `ESC` ou botão na topbar.
   - 3 abas: *Amigos* (com avatares reais, status Zomboid dinâmico e ordenação de online para o topo), *Chat* (recentes e não lidas) e *Solicitações*.
   - Janela flutuante de DM (Direct Message) pop-up no canto inferior direito com histórico isolado na tabela `direct_messages`.
   - Notificação acústica bi-tonal suave sintetizada via Web Audio API (F#5 -> C#6).

5. **Auto-Updater Blindado & Execução de Patch (v2.2.1):**
   - Validação binária por Magic Bytes (`MZ` / `OLE`), auto-correção dinâmica de extensão (`.exe` vs `.msi`), elevação UAC nativa no Windows e fallback dinâmico entre branches.

6. **Hero Play Button & Injeção de RAM no Zomboid:**
   - Botão de lançamento primário e injeção atômica de `-Xmx`/`-Xms` no `ProjectZomboid64.json`.

7. **Motor de Mapa Tático 1:1 Knox County & Radar:**
   - Projeção Zomboid 1:1 com 1.017 POIs mapeados, Blips GTA V em 20 categorias, LOD em 3 camadas e navegação GPS A*.

8. **Gerenciador de Modpacks & Scanner Local:**
   - Catálogo integrado ao Supabase com visualizações Grade ⊞ e Lista ☰ e contagem atômica de downloads via RPC.

## Work-in-Progress & Known TODOs
- [ ] Notificações nativas do Windows para novos eventos de áudio/vídeo transmitidos e mensagens de DM.
- [ ] Expansão de skins customizadas para a moldura CRT da televisão PiP (madeira vintage anos 70 vs militar anos 90).
- [ ] Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canais Realtime.
- [ ] Verificador de integridade e incompatibilidade de mods no scanner local.
