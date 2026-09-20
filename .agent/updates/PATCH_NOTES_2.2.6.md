# 📜 PZHub — Caderno de Atualização: Versão 2.2.6

> *"Um operador tático precisa de dados confiáveis no radar. Se o seu equipamento não registra quem entra na safehouse nem quantos sobreviventes pegaram seu suprimento, você está operando às cegas."*  
> — **Equipe de Engenharia e Operações do PZHub**

---

## 📡 Atualização 2.2.6 — "Telemetria Blindada: Contadores de Downloads em Tempo Real & RPCs Atômicas"
*Data da Transmissão: 20 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Você já publicou um modpack incrível ou recomendou o PZHub para um amigo, olhou para o painel de estatísticas e viu um frustrante "0 downloads", mesmo sabendo que dezenas de jogadores já estavam usando?* 🤦‍♂️📊🧟‍♂️  
> Até a versão 2.2.5, existia um gargalo invisível na nossa ponte de dados: quando o desktop tentava computar a instalação de um pacote, o guardião de segurança do banco de dados (o temido **RLS - Row Level Security**) barrava o pedido silenciosamente porque o jogador não era o dono original do pacote. E no website? O botão de baixar o instalador `.exe` era apenas um link comum que levava ao arquivo sem avisar a central de comando.  
> Na **Atualização 2.2.6**, nós instalamos sensores digitais atômicos de padrão militar em todo o ecossistema!  
> Implementamos **Stored Procedures (RPCs) com permissão `SECURITY DEFINER`** no PostgreSQL do Supabase. Agora, quando alguém clica para baixar o PZHub Desktop no site, o banco registra o novo operador em segundo plano sem travar o download por um único milissegundo. E quando você instala um modpack no desktop? O Rust e o JavaScript acionam a RPC segura, incrementando a contagem oficial na nuvem e transmitindo o novo número instantaneamente para todos os usuários conectados via **Supabase Realtime WebSocket**!  
> Dados reais, seguros, sem fraudes e sincronizados entre Web e Desktop. O radar de inteligência comunitária está 100% operacional!

---

### 🛡️ Destaques da Versão 2.2.6

#### 🚀 1. Telemetria do Software Desktop & Prova Social no Website (`VICCS_PZHub_Website`)
- **Badge Tático no Botão Hero:** O botão principal *"BAIXAR PZHUB DESKTOP (.EXE)"* agora conta com uma insígnia verde esmeralda (`#hero-app-downloads-badge`) exibindo o número real e verificado de downloads do executável.
- **Rastreamento Invisível e Não-Bloqueante (`src/js/admin.js`):** A função `trackAppDownload()` é despachada no momento do clique, garantindo que o download inicie imediatamente enquanto o banco computa o novo operador.
- **Contador no Menu Mobile:** O botão de download dentro da gaveta deslizante para celulares também reflete a contagem atualizada em tempo real.
- **Divisão de Métricas no Dashboard Geral (`view-dashboard`):** O painel agora distingue com clareza *DOWNLOADS DO SOFTWARE (.EXE)* e *DOWNLOADS DE MODPACKS*, com formatação de milhares no padrão brasileiro (`1.250`).

#### 📦 2. Instalação Atômica de Modpacks Sem Bloqueio de RLS (`src/js/modpack_manager.js`)
- **Fim dos Erros de Atualização Silenciosos:** O antigo envio com método `PATCH` (que era bloqueado pelas regras de segurança de linha do Supabase) foi totalmente substituído pela chamada à Stored Procedure `increment_modpack_download(target_pack_id)`.
- **Contagem Imediata na Interface:** Assim que os mods terminam de ser descompactados ou subscritos na Steam com sucesso, o modal do modpack no desktop atualiza seu badge para o novo valor retornado diretamente pelo banco.

#### ⚡ 3. Sincronização em Tempo Real (Supabase Realtime WebSocket)
- **Canal Global Dedicado (`pzhub-global-downloads`):** Tanto o Website quanto o PZHub Desktop assinam o canal de replicação PostgreSQL.
- **Zero F5 Necessário:** Se um sobrevivente no Japão instalar um modpack ou baixar o executável, o contador na sua tela sobe suavemente sem recarregar a página.

#### 🖥️ 4. Novo Card de Métricas no Hub Desktop (`src/index.html` & `src/js/app.js`)
- **Card DOWNLOADS GLOBAIS:** Incorporado diretamente na faixa de indicadores operacionais (`hero-metrics-strip`) do Centro de Operações (Aba 01).
- **Leitura Resiliente:** Sincronizado automaticamente ao abrir o aplicativo e mantido atualizado pelo WebSocket.

#### 📦 5. Pacotes Oficiais Windows v2.2.6 Compilados e Disponíveis
- **Instalador NSIS Oficial:**
  - `src-tauri/target/release/bundle/nsis/PZHub_2.2.6_x64-setup.exe` (Executável instalador com elevação UAC nativa, ícone multi-resolução e atalhos limpos).
- **Pacote MSI Corporativo WiX:**
  - `src-tauri/target/release/bundle/msi/PZHub_2.2.6_x64_en-US.msi` (Pacote MSI validado para implantação automatizada).
- **Manifesto Remoto de Release Atualizado:** `latest.json` sincronizado com os metadados da v2.2.6 para distribuição contínua via auto-updater.
