# Project Overview

## Project Name
PZHub Desktop (Tactical Live Radar, Modpack Manager & Operations Suite)

## Description
Aplicação desktop nativa para Windows desenvolvida em **Tauri v2 + Rust** e **Vanilla JavaScript / Leaflet.js**, projetada como a central tática de inteligência, radar, modpacks e motor de reprodução multimídia para a comunidade de **Project Zomboid (Build 42 & Build 41)**. Na **v2.2.9**, o sistema opera com arquitetura blindada contra encerramentos acidentais através do **Modo Sentinela (System Tray)**, dock de navegação modular expansível, efeitos sonoros puramente sintetizados via Web Audio API e motor de áudio espacial 3D sincronizado para rádios, TVs e veículos. O ecossistema integra:
- **Minimizar para a Bandeja (System Tray - v2.2.9):** Interceptação do evento `WindowEvent::CloseRequested` da janela nativa do Windows [X], mantendo o PZHub vivo em background com restauração em 1 clique no ícone da bandeja e controle via chave comutadora tática padrão ativa (`minimize_to_tray = true`);
- **Menu de Contexto de Bandeja Milspec (v2.2.9):** Menu nativo com opções "Abrir PZHub" e "Encerrar PZHub" (`exit_app`), com persistência estruturada em `UserConfig` (`src-tauri/src/config.rs`) no `config.json`;
- **Cockpit Modular com Topbar Expansível (v2.2.7):** Dock de navegação militar com caixas modulares (`.tarkov-tab`) que revelam índices táticos numéricos (`01` a `05`) e títulos com animação elástica suave no hover, além de destaque esmeralda no Radar;
- **Motor de Efeitos Sonoros Procedurais de Interface (`sound_fx.js` - v2.2.7):** Síntese puramente nativa via Web Audio API (hover metálico, click mecânico e switch) com botão master de silenciamento (`#btn-global-sound-toggle`) na topbar;
- **Sincronia Perfeita & Desmutação Defensiva de Áudio (v2.2.8):** Desmutação forçada via `ytPlayer.unMute()`, seek temporal blindado com `Number.isFinite()` e reativação dinâmica do `AudioContext` suspenso com `ensureContext()`;
- **Subsistema de Transmissão Multimídia & TV PiP (Protocolo VICCS Broadcasting - v2.2.3 / v2.2.5):**
  - **Motor de Áudio Espacial 3D & DSP Acústico (`src/js/spatial_audio_engine.js`):** Web Audio API com HRTF/EqualPower, respostas de impulso (IR) procedurais de ambientes, barramentos de reverberação duplos com crossfade suave entre cômodos, atenuação física por oclusão e compressor/limitador master para múltiplos rádios;
  - **Som Automotivo Sincronizado para Veículos:** Rastreamento espacial e acompanhamento de movimento em tempo real para qualquer carro no jogo com som direto de cabine para passageiros;
  - **Janela Flutuante PiP Always-on-Top (`src/pip.html`):** Moldura estilo monitor CRT dos anos 90, scanlines analógicas e arrasto livre (`data-tauri-drag-region`) para televisores in-game;
  - **Heartbeat TTL & Anti-Reprodução Fantasma:** Interrupção automática da música quando o jogo fecha ou o jogador desconecta, com proteção contra execução indevida com jogo fechado;
  - **Anti-Overlap de Canais Vanilla:** Silenciamento automático das transmissões vanilla em rádios e televisões durante a reprodução do mod;
- **Telemetria de Downloads em Tempo Real & RPCs Atômicas (v2.2.6):** Card "DOWNLOADS GLOBAIS" no Hub conectado via WebSocket Realtime ao Supabase e contagem atômica de downloads via Stored Procedure `increment_modpack_download` com `SECURITY DEFINER`;
- **Motor de Blips Táticos GTA V & Enriquecimento de POIs (v2.2.2):** 20 ícones vetoriais SVG estilo GTA V (FiveM / RAGE:MP), malha de 1.017 edificações catalogadas (oficinas mecânicas e funilarias incluídas) e sistema de LOD em 3 camadas;
- **Painel Social Global Estilo Riot Client 1:1 (v2.2.0 / v2.2.1):** Gaveta lateral retrátil (`#riot-social-drawer`), lista de amigos com detecção de presença dinâmica, chat privado (DM pop-up) com tabela isolada `direct_messages` e alerta sonoro bi-tonal sintetizado;
- **Auto-Updater Blindado & Execução UAC (v2.2.0 / v2.2.1):** Verificação de integridade por Magic Bytes (`MZ` / `OLE`), auto-correção de extensão e elevação UAC nativa no Windows;
- **Hero Play Button & Injeção de RAM no Zomboid:** Botão de lançamento primário na Steam com injeção de parâmetros JVM `-Xmx`/`-Xms` no `ProjectZomboid64.json`;
- **Motor de Mapa Isométrico 1:1 Knox County & Radar:** Projeção Zomboid 1:1, cache de tiles em disco gerenciado pelo Rust e navegação GPS A* por malha viária oficial de 1.098 ruas;
- **Gerenciador de Modpacks & Scanner Local:** Integração Steam Workshop (`steam://`), descompactação assíncrona de `.zip` e alternância Grade ⊞ / Lista ☰.

## Tech Stack
- **Languages:** Rust 1.94+ (Edition 2021), JavaScript (ES2023 Modules), Lua 5.1/JIT (PZ Modding API), HTML5, CSS3, SQL (PostgreSQL DDL/RLS/Stored Procedures)
- **Frameworks:** Tauri v2 (`tauri` 2.x com feature `tray-icon`, `tauri-plugin-opener` 2.x), Leaflet.js v1.9.4, Web Audio API
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
│   │   ├── changelog.md                     # Histórico versionado de releases (até v2.2.9)
│   │   └── todos.md                         # Roadmap e checklist de fases
│   ├── overview/
│   │   └── PROJECT_STATUS.md                # Visão geral unificada e status do projeto
│   └── updates/
│       ├── PATCH_NOTES.md                   # Caderno geral de notas de atualização
│       ├── PATCH_NOTES_2.2.3.md             # Notas detalhadas do motor multimídia
│       ├── PATCH_NOTES_2.2.6.md             # Telemetria de downloads em tempo real & RPCs
│       └── PATCH_NOTES_2.2.7_TO_2.2.9.md    # Notas detalhadas das versões 2.2.7 a 2.2.9
├── scripts/                                 # Scripts utilitários de manutenção
│   └── enrich_pois.js                       # Telemetria e enriquecimento de 1.017 POIs do mapa
├── server-mod/                              # Mini-mod Lua para Project Zomboid (B41 & B42)
├── src/                                     # Frontend Desktop (Vanilla JS + Leaflet)
│   ├── assets/                              # Ícones, logotipos vetoriais e ilustrações SVG
│   ├── css/
│   │   ├── main.css                         # Design System Tarkov, Toasts, Modais, Dock Modular e Switch
│   │   └── map.css                          # Estilos táticos de Radar, Blips GTA V, HUD e Leaflet
│   ├── data/
│   │   ├── buildings_index.json             # Índice de edificações de Knox County (1.017 POIs)
│   │   ├── meta.json                        # Metadados de projeção e categorias de POIs
│   │   ├── streets.json                     # Malha viária oficial (1.098 ruas)
│   │   ├── worldmap_forest.json             # Vetores de floresta
│   │   └── worldmap_water.json              # Vetores de rios e massas d'água
│   ├── js/
│   │   ├── app.js                           # Controlador principal, router, métricas e eventos de tray
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
│   │   ├── sound_fx.js                      # Motor de síntese de efeitos sonoros táteis via Web Audio API
│   │   ├── spatial_audio_engine.js          # Motor Web Audio API de espacialização 3D e DSP acústico
│   │   ├── squad_tracker.js                 # Telemetria e rastreamento de aliados
│   │   ├── supabaseClient.js                # Cliente Supabase singleton
│   │   └── updater.js                       # Auto-updater blindado com Magic Bytes e toasts táticos
│   ├── lib/
│   │   ├── leaflet/                         # Leaflet.js local integrado
│   │   └── supabase/                        # Bundled Supabase client
│   ├── favicon.ico                          # Favicon do aplicativo
│   ├── index.html                           # Layout Desktop, Topbar Modular, Modais e Abas 01 a 05
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
│   │   ├── config.rs                        # Configurações do usuário (`minimize_to_tray`) e JSON
│   │   ├── launcher.rs                      # Configuração de JVM/RAM em ProjectZomboid64.json
│   │   ├── lib.rs                           # Registro de comandos, tray icon e hook CloseRequested
│   │   ├── main.rs                          # Entry point do executável Windows
│   │   ├── mod_installer.rs                 # Instalador automatizado do mod Lua
│   │   ├── mod_manager.rs                   # Varredura do filesystem, unzip assíncrono e Steam
│   │   ├── tracker.rs                       # Leitura segura de telemetria local
│   │   └── updater.rs                       # Downloader nativo com streaming e elevação UAC
│   ├── Cargo.toml                           # Dependências e manifesto Rust (v2.2.9)
│   └── tauri.conf.json                      # Configuração de janelas, tray e alvos nsis/msi (v2.2.9)
├── download_data.js                         # Utilitário para download de mapas e vetores
├── latest.json                              # Manifesto oficial de release remoto
├── package.json                             # Scripts npm e dependências de frontend (v2.2.9)
└── README.md                                # Apresentação do projeto
```

## Key Files
- `src-tauri/src/lib.rs`: Backend Tauri v2 principal registrando comandos nativos, interceptando o evento `WindowEvent::CloseRequested` da janela para o modo sentinela na bandeja do Windows e orquestrando o ciclo de vida do tray icon e do menu de contexto nativo.
- `src-tauri/src/config.rs`: Mapeamento e persistência das configurações de operador na struct `UserConfig`, incluindo o campo nativo `minimize_to_tray: bool` com fallback padrão `true` gravado em `config.json`.
- `src/js/sound_fx.js`: Módulo de síntese sonora procedural via Web Audio API, gerando transientes mecânicos de interruptores, cliques táteis e hover metálico sem dependências de arquivos de áudio externos.
- `src/js/spatial_audio_engine.js`: Motor Web Audio API de espacialização 3D, HRTF, filtros de oclusão acústica e reverberação procedural de cômodos com recuperação dinâmica de contexto via `ensureContext()`.
- `src/js/broadcasting_engine.js`: Orquestrador de transmissões multimídia externas com desmutação compulsória via `ytPlayer.unMute()`, cálculo estrito de sincronia temporal (`Number.isFinite()`) e transmissão de eventos para a janela PiP.
- `src/pip.html`: Janela flutuante Always-on-Top dedicada à reprodução de vídeo para televisores do jogo, equipada com moldura CRT retrô militar, scanlines analógicas e arraste livre (`data-tauri-drag-region`).
- `src-tauri/src/broadcasting.rs`: Módulo Rust de alto desempenho que detecta a presença do mod `VICCS_Broadcasting` e lê atômica e continuamente o IPC `Zomboid/Lua/PZMusic/game_to_app.json`.
- `src/js/blip_icons.js`: Motor vetorial SVG de Blips táticos estilo GTA V (FiveM / RAGE:MP) em 20 categorias com sistema de LOD em 3 camadas.
- `src/js/social_manager.js`: Painel Social estilo Riot Client 1:1 com gaveta retrátil, DM pop-up flutuante, áudio de notificação Web Audio API e tabela isolada `direct_messages`.
- `src/js/app.js`: Controlador principal com router de abas, sincronização de configurações de bandeja do sistema e inscrição WebSocket Realtime.
- `src/css/main.css`: Design System Tactical Liquid Glass com classes completas para a topbar modular expansível (`.tarkov-tab`), switch militar de configurações e modais.

## Current Features Implemented
1. **Modo Sentinela: Minimizar para a Bandeja (System Tray) & Chave Tática (v2.2.9):**
   - **Interceptação do Evento de Janela (`src-tauri/src/lib.rs`):** Hook nativo em `WindowEvent::CloseRequested` na janela `main` invocando `api.prevent_close()` e `window.hide()` quando a opção de bandeja estiver ativa.
   - **Ícone e Menu de Contexto na Área de Notificação:** Ícone nativo do PZHub no Windows com tooltip descritivo e menu de contexto (LMB restaura imediatamente com `show() + unminimize() + set_focus()`; RMB oferece *"Abrir PZHub"* e *"Encerrar PZHub"* via `exit_app`).
   - **Card Tático de Configurações (`src/index.html` & `src/css/main.css`):** Seção *"Comportamento do Sistema & Janela"* na aba 5 com chave comutadora disjuntora militar `#toggle-minimize-tray` ativada por default (`true`).
   - **Persistência Estruturada no Rust (`src-tauri/src/config.rs`):** Campo `minimize_to_tray: bool` salvo no `config.json` via comando `set_user_config` e espelhado localmente.
   - **Áudio Mecânico & i18n:** Disparo de `soundFx.playSwitch()` na alternância e tradução completa das legendas em Português, Inglês e Espanhol.
   - **Binários de Release Compilados:** Gerados instaladores oficiais `PZHub_2.2.9_x64-setup.exe` (NSIS) e `PZHub_2.2.9_x64_en-US.msi`.

2. **Sincronia Perfeita: Desmutação Defensiva & Fim do Silêncio no Multiplayer (v2.2.8):**
   - **Desmutação Defensiva do Player (`src/js/broadcasting_engine.js`):** Invocação de `ytPlayer.unMute()` quando o volume é positivo, superando bloqueios automáticos de autoplay da WebView2.
   - **Sanitização do Seek Temporal:** Proteção com `Number.isFinite()` no cálculo de `offsetSeconds`, eliminando travamentos de áudio provocados por valores `NaN`.
   - **Despertar do Contexto Espacial 3D (`src/js/spatial_audio_engine.js`):** Chamada preventiva a `ensureContext()` dentro de `updateAcoustics()`, restaurando o `AudioContext` suspenso no primeiro pacote de telemetria recebido do jogo.
   - **Paridade Multi-Target com Mod v1.2.3:** Sincronização automatizada e conferência MD5 idêntica entre instalações do cliente e servidor dedicado.

3. **O Cockpit Modular: Topbar Expansível & Áudio Tático de Interface (v2.2.7):**
   - **Dock de Navegação Modular (`.tarkov-tab`):** Caixas modulares minimalistas com ícones vetoriais fixos e sanfona expansível com curva cúbica milspec no hover, revelando o índice numérico (`01` a `05`) e o nome da estação.
   - **Destaque Visual do Radar:** Borda e glow esmeralda neon na aba `04 MAPA & RADAR`.
   - **Motor de Efeitos Sonoros Procedurais (`src/js/sound_fx.js`):** Síntese pura via Web Audio API (zero dependências de arquivos de áudio externos) com perfis para hover metálico (1800Hz), click tático duplo (800/400Hz) e switch mecânico.
   - **Chave Master de Silenciamento na Topbar:** Botão `#btn-global-sound-toggle` com persistência em `localStorage`.

4. **Telemetria de Downloads em Tempo Real & RPCs Atômicas (v2.2.6):**
   - **Card DOWNLOADS GLOBAIS no Hub:** Indicador numérico em tempo real no `hero-metrics-strip` do Centro de Operações (Aba 01) conectado à tabela `app_analytics`.
   - **Contagem Atômica de Modpacks via RPC:** Incremento seguro via Stored Procedure `increment_modpack_download(target_pack_id)` com `SECURITY DEFINER`.
   - **Sincronização WebSocket Realtime:** Canal `pzhub-global-downloads` no `app.js` assinando tabelas `app_analytics` e `modpacks`.

5. **Motor de Transmissão Multimídia & Áudio Espacial 3D (v2.2.3 & v2.2.5):**
   - **Aba 05 TRANSMISSÃO:** Interface tática com badge de status e trava inteligente que só libera ativação caso o mod `VICCS_Broadcasting` esteja instalado.
   - **Motor de Áudio Espacial 3D & DSP Acústico (`spatial_audio_engine.js`):** Panning HRTF / EqualPower, respostas de impulso (IR) procedurais de ambientes, crossfade suave de reverberação entre cômodos, atenuação física de oclusão e limitador/compressor no master.
   - **Som Automotivo Sincronizado para Veículos:** Rastreamento dinâmico em tempo real de carros em movimento com áudio espacializado para motoristas, passageiros e transeuntes.
   - **Janela Flutuante PiP para TVs (`pip.html`):** Janela Always-on-Top estilo monitor CRT com scanlines analógicas e arrasto livre (`data-tauri-drag-region`) para televisores do jogo.
   - **Player Invisível de Áudio Espacial:** O PZHub reproduz áudio posicional 3D sem controles invasivos na tela do jogador.
   - **Heartbeat TTL & Anti-Reprodução Fantasma:** Interrupção automática da música quando o jogo fecha ou o jogador desconecta do servidor.
   - **Anti-Overlap de Canais Vanilla:** Silenciamento automático das transmissões vanilla em rádios e televisões durante a reprodução do mod.

6. **Overhaul de Blips Táticos GTA V & Enriquecimento de POIs (v2.2.2):**
   - 20 ícones vetoriais SVG de alta resolução inspirados nas referências do GTA V (FiveM / RAGE:MP).
   - Catalogação de 1.017 edificações em Knox County com inclusão da categoria `mechanic` (Blip 72 - LS Customs) para Fallas Lake, West Point, Muldraugh e Riverside.
   - Sistema de Level of Detail (LOD) em 3 camadas de zoom e checklist de 18 categorias com badges de cor na sidebar.

7. **Painel Social Global Estilo Riot Client & Chat Privado (v2.2.0 / v2.2.1):**
   - Gaveta lateral retrátil onipresente (`#riot-social-drawer`) acessível via atalho `ESC` ou botão na topbar.
   - 3 abas: *Amigos* (com avatares reais, presença dinâmica e ordenação de online para o topo), *Chat* (recentes e não lidas) e *Solicitações*.
   - Janela flutuante de DM pop-up no canto inferior direito com histórico isolado na tabela `direct_messages`.
   - Notificação acústica bi-tonal suave sintetizada via Web Audio API (F#5 -> C#6).

8. **Auto-Updater Blindado & Execução de Patch (v2.2.0 / v2.2.1):**
   - Validação binária por Magic Bytes (`MZ` / `OLE`), auto-correção dinâmica de extensão (`.exe` vs `.msi`), elevação UAC nativa no Windows e fallback dinâmico entre branches.

9. **Hero Play Button & Injeção de RAM no Zomboid:**
   - Botão de lançamento primário na Steam e injeção atômica de `-Xmx`/`-Xms` no `ProjectZomboid64.json`.

10. **Motor de Mapa Tático 1:1 Knox County & Radar:**
    - Projeção Zomboid 1:1 com 1.017 POIs mapeados, Blips GTA V em 20 categorias, LOD em 3 camadas e navegação GPS A*.

11. **Gerenciador de Modpacks & Scanner Local:**
    - Catálogo integrado ao Supabase com visualizações Grade ⊞ e Lista ☰ e contagem atômica de downloads via RPC.

## Work-in-Progress & Known TODOs
- [ ] Notificações nativas do Windows para novos eventos de áudio/vídeo transmitidos e mensagens de DM quando minimizado na bandeja.
- [ ] Expansão de skins customizadas para a moldura CRT da televisão PiP (madeira vintage anos 70 vs militar anos 90).
- [ ] Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canais Realtime do Supabase.
- [ ] Verificador de integridade e incompatibilidade de mods no scanner local.
- [ ] Integração de chamadas de voz táticas (estilo rádio militar com chiado e ruído configurável).
