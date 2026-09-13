# Changelog

## [2.2.2] - 2026-09-13 (Overhaul de Blips Táticos GTA V, Enriquecimento de POIs & Sistema de LOD)

### Adicionado
- **Motor de Blips Vetoriais SVG Estilo GTA V (`src/js/blip_icons.js`):** Conjunto completo de ícones SVG baseados nas referências oficiais de Blips do GTA V (FiveM / RAGE:MP) para todas as 20 categorias do Project Zomboid (Pistola Ammu-Nation #110, Escudo Policial LSPD #60, Cruz Hospitalar #61, Pílula Farmácia #51, Chave Inglesa LS Customs #72, Cifrão Loja 24/7 #52, Bomba de Gasolina #361, Garfo e Faca Spiffo #93, Martelo Hardware #402, etc.).
- **Estética Visual de Alto Contraste & Efeito Neon Tático (`src/css/map.css`):** Estrutura `.poi-blip-gta` com fundo escuro chanfrado, borda com a cor característica de cada blip, efeito de brilho halo neon e animação de expansão suave ao passar o cursor (`transform: scale(1.35)`).
- **Enriquecimento da Base de Dados de POIs (`src/data/buildings_index.json` & `meta.json`):**
  - Criação da categoria oficial `mechanic` com cor `#ffa502` e ícone de Chave Inglesa (Blip 72 - LS Customs).
  - Identificação e catalogação dos prédios de reparo automotivo e funilarias que estavam sem ícone no mapa (incluindo o complexo de Fallas Lake `28_32_14-17`, oficinas de West Point, Muldraugh e Riverside). Total indexado: 1.017 edifícios.
- **Desbloqueio de 537+ Edifícios no Motor de Mapa (`src/js/map_engine.js`):** Expansão do conjunto `activeCategories` padrão de 9 para 20 categorias, exibindo armazéns, garagens, lojas de departamento e prédios cívicos previamente escondidos.
- **Sistema Inteligente de Level of Detail (LOD) em 3 Camadas:**
  - *Tier 1 (Zoom >= 13):* Serviços de emergência e alta prioridade (Armarias, Delegacias, Hospitais, Bombeiros, Oficinas Mecânicas, Postos de Gasolina). Marcadores grandes (30px).
  - *Tier 2 (Zoom >= 14):* Comércio essencial e suprimentos (Supermercados, Farmácias, Ferramentas, Roupas, Restaurantes, Bancos, Igrejas). Marcadores médios (26px).
  - *Tier 3 (Zoom >= 15):* Áreas industriais e de apoio (Armazéns, Galpões, Depósitos, Escolas, Motéis). Marcadores compactos (22px).

### Corrigido
- **Filtros de Categoria da Barra Lateral (`src/js/app.js`):** Substituição da lista obsoleta de 6 categorias pela listagem completa de 18 categorias com suas cores táticas de GTA V e correção do binding do evento de toggle de `overlayController` para `this.mapEngine.toggleCategory(catId, enabled)`.
- **Implementação do Método Faltante `updateLOD()` (`src/js/map_engine.js`):** Criação da rotina que ajusta os marcadores em tempo real durante os eventos de zoom do Leaflet.

## [2.2.1] - 2026-09-09 (Linha Segura: Isolamento de DMs, Presença Viva, Alerta Acústico & Validação Magic Bytes)

### Adicionado
- **Isolamento de Mensagens Privadas (`direct_messages`):** Desacoplamento total do chat de mensagens diretas em relação ao mural comunitário do website (`profile_scraps`). Criação de fluxo dedicado para a tabela `public.direct_messages` no Supabase com Row Level Security (RLS) restrito estritamente a remetente e destinatário.
- **Radar de Presença em Tempo Real Dinâmico:** Algoritmo `updateFriendsPresence()` conectado ao evento `sync` do canal Supabase Realtime (`pzhub-global-social`). Aliados online são promovidos em tempo real para o topo da lista de amigos com badge verde neon e atualização dinâmica no cabeçalho do pop-up de DM.
- **Status Operacional `in_game` vs `online`:** Detecção inteligente de status in-game (`window.__PZHUB_IN_GAME__`), alternando entre "Online no PZHub" e "Em Project Zomboid".
- **Alerta Acústico Tático Sintetizado (Web Audio API):** Som bi-tonal suave de notificação de alta fidelidade (F#5 a 739.99Hz e C#6 a 1108.73Hz com decaimento suave de 0.28s) reproduzido a cada nova mensagem privada recebida, com 100% de código nativo (zero dependências de assets de áudio externos).
- **Validação de Integridade por Magic Bytes no Updater Nativo (Rust):** Verificação de cabeçalho binário dos instaladores baixados antes da execução: assinatura PE Executable (`MZ`) e MSI OLE Compound File (`0xD0CF11E0A1B11AE1`). Extermina definitivamente o erro Win32 de "Aplicativo de 16 bits não suportado" decorrente de respostas parciais ou arquivos corrompidos.
- **Auto-Correção Dinâmica de Extensão de Instalador:** O backend Rust detecta e renomeia automaticamente arquivos entre `.exe` e `.msi` conforme os Magic Bytes reais recebidos.
- **Compilação e Pacotes Oficiais v2.2.1:** Gerados com sucesso os pacotes `PZHub_2.2.1_x64-setup.exe` (NSIS) e `PZHub_2.2.1_x64_en-US.msi`.

### Corrigido
- **Falso Online e Nomes Estáticos:** Remoção de dados fictícios no cabeçalho do painel social; agora reflete a sessão real do usuário autenticado no Supabase.
- **Prevenção de Auto-Notificação:** O sistema ignora transmissões geradas pelo próprio usuário remetente, evitando eco e alertas sonoros indevidos.

## [2.2.0] - 2026-09-09 (Painel Social Riot Client Onipresente, DM Pop-up & Disparo UAC Desanexado)

### Adicionado
- **Painel Social Global Estilo Riot Client:** Gaveta lateral retrátil (`#riot-social-drawer`) integrada à Topbar com atalho `ESC`, dividida em 3 abas táticas: *Amigos* (com sanfona para offline), *Chat* (conversas recentes) e *Solicitações* (gestão de amizades com badge contador).
- **Janela Flutuante de DM (Direct Message Pop-up):** Chat direto no canto inferior direito estilo Riot Client com cabeçalho de status, histórico persistente, scroll automático e envio por `Enter`.
- **Sincronização 100% Real com Supabase:** Consulta e persistência direta nas tabelas `public.profiles` e `public.follows` do ecossistema PZHub.
- **Disparo de Atualizador com Elevação UAC no Windows:** Execução desanexada via Shell (`cmd.exe /C start ""` e fallback PowerShell `-Verb RunAs`), contornando o erro Win32 `ERROR_ELEVATION_REQUIRED (740)`.
- **Isolamento de Arquivos Temporários de Update:** Gravação com timestamp atômico (`PZHub_Update_Setup_<timestamp>.exe`) e fechamento prévio de handles de disco antes da inicialização do instalador.

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
