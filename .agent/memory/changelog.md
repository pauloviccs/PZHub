# Changelog

## [2.1.1] - 2026-09-08 (Auto-Updater Hardening, Master/Main Fallback, Topbar Indicator & Tactical UI)

### Adicionado
- **Migração para GitHub Raw Oficial:** Manifesto remoto apontado para `https://raw.githubusercontent.com/pauloviccs/PZHub/master/latest.json`.
- **Auto-Fallback Resiliente de Branches:** Rust nativo e JS agora alternam dinamicamente entre `master` e `main` em caso de erro HTTP 404, garantindo disponibilidade mesmo com divergência de branch.
- **Indicador Tático de Status na Topbar:** Badge discreto `#topbar-updater-status` com diagnóstico de erros (ex: HTTP 404, 503, JSON inválido) sem uso de `alert()` bloqueante.
- **Card de Versão Interativo no Hero:** Elemento `#hub-updater-box` com status dinâmico e botão com ícone giratório "BUSCAR" (`#btn-hub-check-updates`).
- **Ação no Menu de Operador:** Opção "Buscar Atualizações" adicionada ao dropdown de perfil.
- **Modal Holográfico e Toasts Táticos:** Sistema completo de notificações visuais no padrão Tarkov / Liquid Glass (`showTacticalToast` e `#tactical-version-modal`).
- **Notas de Versão Imersivas:** Arquivo `.agent/updates/PATCH_NOTES.md` criado em formato descontraído estilo Riot Games cobrindo todo o histórico do projeto.
- **Compilação de Release v2.1.1:** Gerados os instaladores oficiais `PZHub_2.1.1_x64-setup.exe` (NSIS) e `PZHub_2.1.1_x64_en-US.msi`.

### Corrigido
- **Eliminação de Falhas Silenciosas no Updater:** A checagem de atualizações agora persiste logs em `localStorage` (`pzhub_last_update_check`) e emite eventos globais `updater-check-failed` e `updater-check-success`.
- **Prevenção de Regressão de Versão:** Garantida a integridade da função `isNewerVersion()` com comparação estrita SemVer.

## [2.1.0] - 2026-09-08 (Riot Social, Supabase Auth Sync, Hero Play & Layout Hardening)

### Adicionado
- **Painel Social Estilo Riot Client:**
  - Card de perfil do Operador (`.riot-user-card`) com status neon verde, avatar e botão rápido `+` para adicionar amigos.
  - Sub-toolbar tática de abas `Amigos (N)` e `Radar Ao Vivo (M)` com badges luminescentes e linha dourada ativa.
  - Barra de busca instantânea com botão de limpeza `✕`.
  - Gaveta retrátil de novo sobrevivente com 6 swatches circulares de cores táticas.
  - Agrupamento dinâmico: lista de aliados online com cálculo de distância em metros, botão `🧭 GPS` e remoção com hover suave; accordion recolhível para offline com animação de chevron.
  - Sincronização de fotos de perfil oficiais via tabela `profiles` do Supabase e anel de foco tático, com fallback para iniciais estilizadas.
- **Presença Global em Tempo Real (Supabase Realtime Presence):**
  - Canal WebSocket `pzhub-global-presence` que detecta instâncias ativas do PZHub Desktop abertas por outros usuários.
  - Transição de status automática entre `🟢 ONLINE NO PZHUB DESKTOP` e `🟢 ONLINE NO RADAR • Xm`.
- **Hero Play Button com Seletor de Memória RAM:**
  - Botão de destaque proeminente no cabeçalho superior direito em verde esmeralda vibrante.
  - Dropdown tático com opções de alocação de memória RAM (4GB, 6GB, 8GB, 12GB, 16GB, 24GB, 32GB) com persistência em `localStorage`.
- **Autenticação Supabase Integrada:**
  - Modal tático de login e criação de conta sincronizado diretamente com o banco de dados do website PZHub.
  - Sincronização de sessão, avatar e apelido no topo da tela e no card do operador.

### Corrigido
- **Eliminação de Sobreposição na Página 4 (Radar Tático):**
  - Trava rígida em `.tactical-header` com `44px` de altura e `flex-wrap: nowrap !important;`, impedindo quebra de layout em telas widescreen e monitores verticais.
  - Ajuste de `.tactical-sidebar` para `top: 58px`, mantendo folga precisa de 6px abaixo do cabeçalho.
  - Centralização adaptativa do `.tactical-dock` no espaço remanescente do mapa com ancoragem à direita em telas menores.
- **Correção da Lacuna de 400px e Isolamento das Abas da Barra Lateral:**
  - Aplicação de regra de especificidade com `.tab-pane { display: none !important; }` e `.tab-pane.active.riot-social-pane { display: flex !important; height: auto; }`.
  - Abas `Cidades`, `Loot`, `Andar` e `Config` agora abrem alinhadas diretamente ao topo, sem espaçamentos gigantes ou vazamento do painel social.

## [2.0.0] - 2026-09-01 (PZHub Operations Suite)

### Adicionado
- **Renomeação para PZHub:** Evolução da plataforma para suite completa de operações e gerenciamento do Project Zomboid (B42 & B41).
- **UI/UX Rework Estilo Escape from Tarkov:**
  - Design militar escuro, acentos em Âmbar Tático (`#e58e26`) e Verde Esmeralda (`#2ecc71`).
  - Painéis com cantos chanfrados, scanlines sutis, slots operacionais e 100% de ícones vetoriais SVG (zero emojis de sistema).
- **Dashboard / Centro de Operações (Hub Inicial):**
  - Portal 1: *Mapa Tático & Live Radar* (Ação primária em verde esmeralda com retorno `[ 🔙 MENU PRINCIPAL ]`).
  - Portal 2: *Gerenciador de Modpacks* (Catálogo de pacotes táticos).
  - Portal 3: *Scanner de Mods Locais* (Auditoria de arquivos e integridade).
- **Gerenciador de Modpacks & Feeds Remotos:**
  - Importação de manifestos JSON via URLs e Pastebin raw (`pastebin.com/raw/ID`).
  - Detecção automática de status de sincronização (Instalado vs Pendente).
  - Instalação e atualização em 1 clique com barra de progresso com glow e console de logs táticos.
  - Subscrição em lote para itens do Steam Workshop via protocolo nativo `steam://url/CommunityFilePage/<id>`.
  - Download e descompactação assíncrona de mods diretos (.zip) para `%USERPROFILE%/Zomboid/mods`.
- **Scanner de Mods Locais:**
  - Varredura de `%USERPROFILE%/Zomboid/mods` e `steamapps/workshop/content/108600`.
  - Leitura de metadados `mod.info` (título, versão mínima B42/B41, posters/ícones em Base64).
  - Busca instantânea e filtros rápidos (Todos, Locais, Workshop) com botão de abrir pasta no Windows Explorer.

## [1.0.0] - 2026-08-31

### Adicionado
- **Motor Isométrico DZI:** Projeção matemática 1:1 de Knox County compatível com Build 41 e Build 42, com cache local em disco gerenciado pelo Rust.
- **Navegação GPS Estilo GTA V / Waze:** Traçado de rotas neon animadas, cálculo de distância em metros, bússola/rumo cardeal e tempo estimado de viagem.
- **Modo Mini-Radar Widescreen GTA V (Frameless):** Janela Always-On-Top ($340\times220\text{px}$) no canto inferior esquerdo com controles por Fade no hover.
- **Gerenciador de Amigos & Telemetria Lua:** Sincronização ao vivo de aliados.
