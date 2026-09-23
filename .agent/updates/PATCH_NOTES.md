# 📜 PZHub — Caderno Oficial de Atualizações (Patch Notes)

> *"Sobreviver ao apocalipse zumbi de Knox County já é difícil o suficiente. O seu rádio de comunicação e o seu gerenciador tático não deveriam ser outro obstáculo."*  
> — **Equipe de Engenharia e Operações do PZHub**

---

## 🛰️ Atualização 2.2.9 — "Modo Sentinela: Minimizar para a Bandeja (System Tray) & Chave Tática"
*Data da Transmissão: 23 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Quem nunca estava no meio de um tiroteio ou fuga desesperada de zumbis em Louisville, foi fechar uma janelinha no [X] e acidentalmente fechou o PZHub inteiro, cortando o som da fita cassete no rádio do carro e desligando o radar do esquadrão?* 🤦‍♂️📻🚗🧟‍♂️  
> O botão `[X]` da barra do Windows tradicionalmente é uma guilhotina: apertou, o processo morre. Mas o **PZHub não é apenas uma interface gráfica comum; ele é o motor acústico e de telemetria** que mantém o mod de transmissão e os rádios funcionando dentro do Project Zomboid.  
> Na **Versão 2.2.9**, nós ensinamos o PZHub a **"se esconder no bolso"**!  
> Implementamos integração nativa de baixo nível com o **Windows System Tray (Área de Notificação do Windows)** via Tauri v2 e Rust. Agora, ao clicar no botão fechar `[X]`, a janela gráfica simplesmente sai de cena (`window.hide()`), enquanto o motor continua 100% ativo em segundo plano mantendo suas músicas, transmissões de rádio e TV sem interrupções.  
> E se você quiser restaurar a tela? Basta **um único clique com o botão esquerdo** no ícone da bandeja. Quer sair de verdade? Clique com o botão direito e selecione *"Encerrar PZHub"*. Tudo isso controlado por um interruptor tático disjuntor na tela de configurações, que já vem ativado por padrão!

### 🛡️ Destaques da Versão 2.2.9
- **Hook no Ciclo de Vida do Windows (`src-tauri/src/lib.rs`):** Interceptação direta de `WindowEvent::CloseRequested` com `api.prevent_close()` e `window.hide()`.
- **Restauração em 1 Clique:** Clique com botão esquerdo no ícone da bandeja traz a janela instantaneamente para foco (`window.show() + window.unminimize() + window.set_focus()`).
- **Tray Menu Nativo:** Clique com botão direito com opções *"Abrir PZHub"* e *"Encerrar PZHub"* (`app.exit(0)`).
- **Disjuntor Tático nas Configurações (`#tab-settings`):** Toggle switch comutador milspec padrão ativo (`checked = true`), com som mecânico e persistência em `UserConfig` (`src-tauri/src/config.rs`).
- **Acesso Rápido no Perfil:** Botão *"Configurações"* integrado diretamente ao menu dropdown do operador no topo direito.
- **Suporte Multilíngue (i18n):** Tags `data-i18n` em Português, Inglês e Espanhol.
- **Binários de Release Oficial:** Gerados `PZHub_2.2.9_x64-setup.exe` (NSIS) e `PZHub_2.2.9_x64_en-US.msi`.

---

## 📻 Atualização 2.2.8 — "Sincronia Perfeita: O Fim do Silêncio no Multiplayer"
*Data da Transmissão: 23 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Você entra no servidor dedicado com seus amigos, coloca uma fita cassete clássica para tocar no rádio da sala... seu amigo do outro lado da floresta avisa no rádio que está ouvindo, mas quem está na frente do aparelho fica num silêncio absoluto?* 📻🤐🔇  
> Na **Atualização 2.2.8**, nós reescrevemos a rotina de despacho de áudio: forçamos a desmutação defensiva ativa (`unMute()`), blindamos o cálculo do relógio de sincronização para garantir que todo o esquadrão ouça exatamente a mesma fração de segundo da música, e conectamos o despertar automático do contexto de áudio 3D!

### 🛡️ Destaques da Versão 2.2.8
- **Extermínio do Silêncio no Player (`src/js/broadcasting_engine.js`):** Desmutação defensiva forçada (`unMute()`) se o player YouTube estiver mutado pelo navegador com volume positivo.
- **Relógio de Sincronia Preciso (`offsetSeconds`):** Cálculo resiliente `Math.max(0, currentTimestamp - startedAt)` com trava anti-`NaN`.
- **Despertador do Contexto Espacial 3D (`src/js/spatial_audio_engine.js`):** Rotina `ensureContext()` acionada dinamicamente no primeiro evento de áudio vindo do Zomboid.
- **Paridade Multi-Target com Mod v1.2.3:** Deploy automatizado com conferência MD5 idêntica para client e server do Project Zomboid.

---

## 🎨 Atualização 2.2.7 — "O Cockpit Modular: Topbar Expansível & Áudio Tático de Interface"
*Data da Transmissão: 22 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Inspirados nas interfaces de alta tecnologia militar (Escape from Tarkov e cockpits de simulação), criamos as Boxes de Ícones Modulares Expansíveis na barra superior e efeitos sonoros procedurais para cada interação.* 🗂️🎛️  

### 🛡️ Destaques da Versão 2.2.7
- **Dock de Abas Dinâmico (`.tarkov-tab`):** Boxes minimalistas que se expandem suavemente no hover revelando o índice numérico (`01` a `05`) e o nome da view.
- **Motor de Áudio Tático Procedural (`src/js/sound_fx.js`):** Síntese Web Audio API nativa com sons de hover metálico, click mecânico e switch.
- **Chave Master de Mute na Topbar (`#btn-global-sound-toggle`):** Controle rápido com persistência no `localStorage`.

---

## 📡 Atualização 2.2.6 — "Telemetria Blindada: Contadores de Downloads em Tempo Real & RPCs Atômicas"
*Data da Transmissão: 20 de Setembro de 2026*

### 🛡️ Destaques da Versão 2.2.6
- **RPC Atômica `increment_modpack_download`:** Bypass de restrições de RLS no PostgreSQL do Supabase via `SECURITY DEFINER`.
- **Supabase Realtime WebSocket:** Replicação instantânea de novos downloads em tempo real no canal `pzhub-global-downloads`.
- **Card de Downloads no Hub:** Faixa operacional com indicadores ao vivo no desktop.

---

## 📻 Atualização 2.2.3 — "Frequência Estendida: O Motor de Transmissão Multimídia & TV PiP dos Anos 90"
*Data da Transmissão: 20 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Você já tentou assistir a um tutorial de mecânica ou botar um rock clássico para tocar na televisão de uma safehouse no Project Zomboid e descobriu que o jogo não sabe o que é a internet? Ou pior: você abriu um rádio, colocou uma música incrível, mas no segundo em que fechou a janelinha do mod para empunhar o machado, o som sumiu e seu personagem ficou no silêncio mortal do apocalipse?* 📺📻🧟‍♂️💥  
> A verdade nua e crua é que a JVM e a biblioteca gráfica do Project Zomboid foram feitas para desenhar zumbis e árvores, não para decodificar vídeos do YouTube ou streams de áudio de alta definição.  
> Na **Atualização 2.2.3**, nós resolvemos esse enigma de uma forma tão elegante que parece mágica: transformamos o **PZHub Desktop** no **Motor Externo Invisível de Transmissão Multimídia (Protocolo VICCS Broadcasting)**!  
> Agora, você controla 100% do som e dos vídeos **de dentro do jogo**, usando os rádios e televisões vanillas. O PZHub cuida da cozinha pesada nos bastidores tocando áudio espacial 3D em segundo plano sem poluir a sua tela. E se você ligar uma televisão? O PZHub projeta instantaneamente uma **Janela Flutuante Always-on-Top (PiP)** com estética de tubo CRT retrô dos anos 90, scanlines autênticas e arrasto livre bem em cima do seu jogo! Prepare o milho de pipoca e ajeite o volume: a televisão de Knox County finalmente ligou!

---

### 🛡️ Destaques da Versão 2.2.3

#### 📻 1. Novo Subsistema Tático: Aba 05 TRANSMISSÃO (`#view-broadcasting`)
- **Design System Tactical Liquid Glass:** Uma interface premium estilizada em Escape from Tarkov (`#0a0e14`, `rgba(18, 26, 38, 0.75)`, `backdrop-filter: blur(14px)` e neon tático).
- **Master Switch com Trava de Segurança:** O interruptor principal só é liberado para o usuário caso o PZHub detecte automaticamente a presença do mod `VICCS_Broadcasting` instalado no seu computador. Sem configurações confusas: o app audita os diretórios do Zomboid e acende a luz verde sozinho.
- **Modal Tático de Boas-Vindas:** Uma mensagem direta e sem enrolação confirmando que a sincronização está ativa e explicando que o jogador não precisa gerenciar players manuais no desktop.
- **Painel de Telemetria e Monitor de Sinal ao Vivo:** Exibe em tempo real o status da ponte de dados atômica (`game_to_app.json`), o aparelho auditado (Rádio vs Televisão), as coordenadas do mundo (`X, Y, Z`), a distância em metros até o seu personagem e uma barra de volume espacial dinâmica com preenchimento em gradiente neon.

#### 📺 2. Janela Flutuante PiP para Televisores: O Monitor CRT dos Anos 90 (`src/pip.html`)
- **Tela de Tubo Retrô Always-on-Top:** Quando o jogador sintoniza uma televisão no Project Zomboid, uma janela flutuante leve e estilizada surge sobre o jogo.
- **Efeito CRT & Scanlines:** Filtro sutil de linhas de varredura analógicas, efeito de fósforo e aviso OSD de canal (`CANAL 03 // TRANSMISSÃO SINCRONIZADA`).
- **Arrasto Livre & Posicionamento Flexível (`data-tauri-drag-region`):** Uma barra tática superior que permite arrastar a TV para qualquer canto do monitor ou para uma segunda tela enquanto joga em janela sem bordas.
- **Modo Auto-PiP Inteligente:** Uma chave configurável que abre a televisão flutuante automaticamente quando o aparelho é ligado no mapa e a fecha imediatamente quando o jogador desliga a TV ou se afasta demais.

#### 🤫 3. Motor de Áudio Invisível em Segundo Plano (`src/js/broadcasting_engine.js`)
- **Zero Poluição Visual:** O player de áudio do PZHub opera de forma totalmente oculta em segundo plano via YouTube IFrame API. Você não precisa ver botões de pausar, pular ou voltar: a interface do media player fica 100% in-game nos menus dos rádios e boomboxes do Zomboid.
- **Sincronização Multiplayer por Timestamp:** Se um amigo ligar uma música na base e você se conectar ao servidor minutos depois, o motor calcula a diferença de tempo (`Date.now() - startedAt`) e faz o `seekTo` exato para que todo mundo no esquadrão escute a mesma estrofe da música ao mesmo tempo.
- **Atenuação Espacial Dinâmica 3D:** O volume do áudio se ajusta dinamicamente conforme o seu personagem se aproxima ou se afasta do rádio no jogo.

#### ⚡ 4. Módulo Rust Nativo de Alta Performance (`src-tauri/src/broadcasting.rs`)
- **Auditoria de Disco com Zero Latência:** Leitura direta do arquivo de telemetria `Zomboid/Lua/PZMusic/game_to_app.json` através do backend Rust em menos de 1 milissegundo.
- **Detecção do Mod no Sistema:** Varredura recursiva inteligente em `%USERPROFILE%/Zomboid/mods/VICCS_Broadcasting`, pastas de documentos e bibliotecas do Steam Workshop (App ID `108600`).
- **Gerenciamento de Multi-Janelas Tauri v2:** Comandos nativos expostos (`check_broadcasting_installed`, `get_broadcasting_data`, `set_pip_window_visible`) com permissões estritas no `capabilities/default.json`.

#### 🎮 5. Correções Críticas In-Game no Mod (Project Zomboid)
- **Fim dos Emojis Quebrados:** Todos os textos e dicionários de localização (`Translate/PT`, `PTBR`, `EN`) foram sanitizados, substituindo emojis que quebravam a fonte BMFont do jogo por ícones vanillas oficiais de TV e Rádio.
- **Blindagem Contra Falhas de Java (`dd:hasBattery`):** Envelopamento seguro com `pcall` que previne erros silenciosos na Build 42.
- **Mundo Persistente:** Fechar a janela do rádio ou televisão no jogo não para mais a música! Ao reabrir o aparelho, todo o estado é recuperado do `ModData`. Se acabar a luz ou a pilha, a reprodução cessa de acordo com as leis do jogo.

#### 📦 6. Instaladores Oficiais Windows v2.2.3 Compilados e Prontos
- **Instalador NSIS Oficial:**
  - `src-tauri/target/release/bundle/nsis/PZHub_2.2.3_x64-setup.exe` (**4.32 MB** — perfil release otimizado, ícone multi-resolução nativo).
- **Instalador Corporativo WiX:**
  - `src-tauri/target/release/bundle/msi/PZHub_2.2.3_x64_en-US.msi` (**5.96 MB** — pacote MSI com validação e suporte corporativo).
- **Manifesto Remoto Sincronizado:** `latest.json` atualizado para distribuição automática pelo auto-updater integrado.

---

## 📻 Atualização 2.2.2 — "GPS de Los Santos: O Overhaul de Blips GTA V & Fim dos Buracos no Mapa"
*Data da Transmissão: 13 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Sabe aquela sensação de abrir o GPS no meio de Fallas Lake precisando trocar o radiador amassado da sua van e dar de cara com um ponto de interrogação vermelho gigante no mapa? Ou de procurar uma loja de armas e ver um emoji genérico que sumia no asfalto?* 🗺️🚗💥  
> Até a versão 2.2.1, o nosso mapa de Knox County sofria de um mal silencioso: ele tinha mais de mil prédios indexados, mas um filtro cego mantinha **mais de 537 edifícios trancados no escuro**, enquanto oficinas mecânicas inteiras ficavam sem categoria, parecendo galpões abandonados.  
> Na **Atualização 2.2.2**, nós importamos diretamente a inteligência e o estilo icônico dos **Blips do GTA V (documentação oficial do FiveM / RAGE:MP)** para o Project Zomboid!  
> Agora o seu radar conta com **20 ícones vetoriais SVG de alta resolução**, auras luminosas em neon tático, uma nova categoria oficial de **Oficinas Mecânicas (Los Santos Customs)** que resolveu os buracos de Fallas Lake e West Point, e um sistema inteligente de **Level of Detail (LOD)** que limpa o mapa no zoom out e revela tudo no zoom in. Prepare a rota, sobrevivente: Knox County nunca teve um radar tão bonito!

---

### 🛡️ Destaques da Versão

#### 🎯 1. Motor de Blips Vetoriais GTA V: Estética Radar de Los Santos (`src/js/blip_icons.js`)
- **Fim dos Emojis Embaçados:** Adeus aos emojis que ficavam pixelados ou distorcidos dependendo do monitor ou do Windows. Implementamos um subsistema 100% vetorial em SVG nativo.
- **20 Ícones Oficiais do GTA V (FiveM / RAGE:MP):**
  - 🔫 **Ammu-Nation (Blip 110):** Pistola tática em Vermelho Vivo (`#ff4757`).
  - 🛡️ **Polícia LSPD (Blip 60):** Escudo com estrela em Azul Policial (`#2e86de`).
  - 🏥 **Hospital & Clínicas (Blip 61):** Cruz médica em Verde Esmeralda (`#2ed573`).
  - 💊 **Farmácias (Blip 51):** Cápsula em Rosa Quente (`#ff6b81`).
  - 🔧 **Los Santos Customs / Oficinas (Blip 72):** Chave inglesa em Laranja Mecânico (`#ffa502`).
  - ⛽ **Postos de Combustível (Blip 361):** Bomba em Ciano Neon (`#00d2d3`).
  - 💲 **Conveniência 24/7 & Mercados (Blip 52):** Cifrão em Ouro Dourado (`#eccc68`).
  - 🔨 **Ferragens & Depósitos (Blip 402):** Martelo em Verde Menta (`#10ac84`).
  - 🍔 **Restaurantes / Spiffo's (Blip 93):** Garfo e faca em Coral (`#ff7f50`).
  - 🍸 **Bares & Bebidas (Blip 84):** Coquetel em Âmbar (`#f39c12`).
  - 👔 **Lojas de Roupas / Suburban (Blip 73):** Cabide em Roxo (`#a55eea`).
  - 🏭 **Galpões & Indústrias (Blip 478):** Silhueta em Grafite (`#57606f`).
  - 🚒 **Bombeiros (Blip 436), Bancos (Blip 108), Bibliotecas (Blip 358), Escolas, Prisões e Safehouses.**
- **Núcleo Chanfrado & Halo Neon (`src/css/map.css`):** Cada blip possui base escura de alto contraste com borda luminescente e um halo radial que brilha sobre qualquer textura de terreno. No hover, o ícone cresce suavemente (`scale(1.35)`) com efeito magnético.

#### 🔧 2. Fim dos Buracos no Mapa & Resgate das Oficinas Mecânicas
- **A Resolução do Caso Fallas Lake:** Identificamos que o misterioso prédio marcado com "?" vermelho nas coordenadas `X: 7315 | Y: 8232` era a grande **Oficina Mecânica & Funilaria de Fallas Lake** (`Auto Repair & Upholstery`), que estava sem categoria na base de dados antiga.
- **Nova Categoria Oficial `mechanic`:** Criada a categoria no [meta.json](file:///g:/GitHub/Vibecoding/VICCS_Git/VICCS_PZHub/VICCS_PZHub/src/data/meta.json) com suporte nativo no motor de mapas.
- **Varredura e Enriquecimento em Knox County:** Executamos script de telemetria que resgatou e catalogou oficinas e funilarias mecânicas em **Fallas Lake**, **West Point**, **Muldraugh** e **Riverside**. O banco agora conta com **1.017 edifícios meticulosamente identificados**.

#### 🗺️ 3. Desbloqueio de 537+ Edifícios & LOD em 3 Camadas
- **Fim da Cegueira Seletiva:** O motor de mapas vinha travado com apenas 9 categorias ativas por padrão. Expandimos para **todas as 20 categorias ativas**, liberando centenas de pontos de interesse que estavam escondidos.
- **Sistema Inteligente de Nível de Detalhe (LOD):**
  - **Tier 1 (Zoom >= 13):** Serviços de emergência e alta prioridade (Armarias, Delegacias, Hospitais, Bombeiros, Oficinas e Postos). Marcadores grandes (**30px**) visíveis à distância.
  - **Tier 2 (Zoom >= 14):** Comércio vital (Supermercados, Farmácias, Ferramentas, Roupas, Restaurantes, Bancos). Marcadores médios (**26px**).
  - **Tier 3 (Zoom >= 15):** Áreas industriais e de apoio (Armazéns, Galpões, Depósitos, Escolas, Motéis). Marcadores compactos (**22px**).

#### 🎛️ 4. Barra Lateral de Filtros Reparada & Completa
- **18 Categorias com Cores Oficiais:** A checklist da barra lateral agora lista todas as categorias táticas com seus respectivos indicadores coloridos de GTA V.
- **Toggle Direto no Motor:** Corrigido o direcionador do evento de clique, que antes chamava o controller de janela em vez de `mapEngine.toggleCategory()`. Desligar e ligar categorias agora é instantâneo e sem travamentos.

#### 📦 5. Instalador Oficial Windows v2.2.2 Gerado
- **Instalador NSIS Pronto para Produção:**
  - `src-tauri/target/release/bundle/nsis/PZHub_2.2.2_x64-setup.exe` (4.3 MB, assinado e otimizado com perfil de release do Rust).
- **Sincronização Total de Metadados:** `Cargo.toml`, `package.json`, `tauri.conf.json`, `updater.js`, `index.html` e `latest.json` unificados na versão **2.2.2**.

---

## 📻 Atualização 2.2.1 — "Linha Segura: Fim do Vazamento, Presença Viva & Alerta Tático"
*Data da Transmissão: 09 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Alguém conectou o cabo do rádio do esquadrão no alto-falante da praça central de West Point!* 📢🤦‍♂️  
> Na versão 2.2.0, nós estávamos tão empolgados com o painel social estilo Riot Client que um detalhe gravíssimo passou despercebido: as conversas privadas de DM estavam sendo salvas no mural público de recados (`profile_scraps`) do perfil do usuário no website! Ou seja, aquele segredo tático que você combinava com o seu parceiro estava virando post no feed público para quem quisesse ver.  
> Além disso, o rádio estava dando "falso online": o cabeçalho dizia com certeza absoluta que você era o "viccs" e estava "Online", enquanto seus amigos reais conectados no jogo apareciam como defuntos offline na lista. E para piorar, as mensagens chegavam no mais absoluto silêncio, te deixando no vácuo no meio de um tiroteio.  
> Na **Atualização 2.2.1**, nós passamos o trator nesses problemas: criamos uma **linha militar 100% criptografada e privada**, ativamos o **radar de presença dinâmico** e adicionamos um **alerta sonoro tático e elegante** a cada nova mensagem!

---

### 🛡️ Destaques da Versão

#### 🔒 1. Linha Segura & Sigilo Militar: Fim Definitivo do Vazamento de DMs
- **Tabela Dedicada `direct_messages`:** Desconectamos 100% o chat do mural de recados. Agora existe uma via expressa segura no banco de dados exclusiva para mensagens diretas privadas.
- **Segurança Máxima via RLS (Row Level Security):** O banco de dados Supabase foi configurado com regras rígidas onde apenas os dois participantes da conversa (remetente e destinatário autenticados) possuem permissão para ler o histórico. Ninguém de fora consegue bisbilhotar.
- **Resiliência e Buffer Local:** O cliente conta com fallback defensivo em cache local (`pzhub_real_chats_cache`) e Realtime Broadcast. Suas conversas continuam fluidas e sem perda de pacotes mesmo se o servidor estiver sob manutenção.

#### 📡 2. Radar de Presença em Tempo Real: Adeus ao "Falso Online"
- **Faxina nos Dados Estáticos:** Exterminamos o texto chumbado no HTML que fingia que todo mundo era "viccs" e estava "Online". Agora o cabeçalho reflete a identidade autêntica do operador autenticado.
- **Algoritmo de Presença Dinâmica (`updateFriendsPresence`):** O PZHub agora escuta ativamente o evento `sync` do WebSocket de presença do Supabase. Assim que um amigo entra no app ou no Zomboid, o status dele vira verde neon e ele é automaticamente promovido para o topo da lista de amigos!
- **Status Reativo no Chat Aberto:** Se você estiver com a janela de DM aberta e o seu parceiro fechar o jogo ou ficar ausente, o cabeçalho do pop-up atualiza o status dele em tempo real na sua frente.
- **Heartbeat Ativo (30s):** Criamos uma rotina periódica de pulso de presença a cada 30 segundos e no retorno de foco da janela, garantindo que a sua conexão não expire e você não suma do radar dos seus aliados.
- **Canal Unificado:** Unificamos o canal de presença do mapa e do painel social sob a mesma frequência global (`pzhub-global-social`).

#### 🔔 3. Alerta Acústico Tático (Sintetizador Web Audio API)
- **Notificação Sonora Suave:** Agora, a cada mensagem recebida de outro sobrevivente, o PZHub toca um acorde bi-tonal elegante e discreto (F#5 para C#6, de 739.99Hz a 1108.73Hz com decaimento suave de 0.28 segundos).
- **Zero Arquivos Externos:** O som é sintetizado puramente em código via Web Audio API do navegador/webview. Sem risco de arquivos `.mp3` corrompidos, sem consumo de dados e sem falhas de carregamento no Windows.
- **Foco no Combate:** O volume e a frequência foram calibrados para chamar a atenção sem estourar os tímpanos de quem está jogando com fone de ouvido imersivo no escuro.

#### 📦 4. Pacotes de Distribuição Oficiais v2.2.1 Compilados
- **Instaladores Prontos para Uso:** Binários de release oficiais de 64 bits compilados via Rust e Tauri v2:
  - `PZHub_2.2.1_x64-setup.exe` (Instalador leve NSIS de 4.3 MB com ícone nativo multi-resolução e atalho limpo).
  - `PZHub_2.2.1_x64_en-US.msi` (Pacote corporativo Windows Installer WiX de 5.9 MB).
- **Website Otimizado:** Build de produção gerada em `VICCS_PZHub_Website/dist/` com bundle Vite ultra-rápido pronto para deploy na Vercel.

---

## 📻 Atualização 2.2.0 — "Frequência Aberta: O Painel Social Tático"
*Data da Transmissão: 09 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> Lembra quando você precisava abrir o mapa, pausar o looting e rezar para nenhum zumbi te morder só para saber se aquele seu amigo atirador estava online? Acabou o perrengue.  
> Na **Atualização 2.2.0**, nós trouxemos uma experiência social de elite, inspirada 1:1 no **Riot Client**, mas com o coração batendo diretamente no banco de dados oficial do ecossistema PZHub.  
> Agora o seu comunicador tático fica no cinto, acessível de qualquer lugar, com chat direto flutuante em tempo real e conexões com pessoas reais que jogam com você!

---

### 🛡️ Destaques da Versão

#### 🪟 1. Gaveta Social Global Estilo Riot Client (`#riot-social-drawer`)
- **Acesso Onipresente:** Um novo botão tático de pelotão na barra superior (`Topbar`) permite abrir e fechar a gaveta lateral em qualquer tela do app (Hub de Operações, Gerenciador de Modpacks, Scanner Local ou Radar do Mapa).
- **Design Fosco de Alta Fidelidade:** Acabamento em preto carvão fosco (`#121316`), iluminação suave nas bordas e atalho rápido na tecla `ESC` para recolher instantaneamente.
- **Header de Identidade:** Seu avatar oficial e seu nome de operador sincronizados diretamente com a sua conta do website.

#### 🎛️ 2. Navegação Segmentada em 3 Abas Táticas
- **Aba 1 (Sobreviventes & Amigos):** Lista limpa agrupada por status ativo (`☣️ PROJECT ZOMBOID` com indicador verde neon pulsante) e sanfona retrátil de aliados `Offline` com contadores em tempo real.
- **Aba 2 (Mensagens & Transmissões):** Canal direto de conversas recentes com o clássico Empty State da Riot (*"Tudo pronto para conversar? Envie uma mensagem para começar."*).
- **Aba 3 (Solicitações & Conexões com Badge Vermelho):** Notificador em pílula vermelha viva indicando pedidos pendentes, campos para adicionar amigos por `Nome` + `#Tagline` e ações rápidas de Aceitar (`✓`) e Dispensar (`✕`).

#### 💬 3. Janela Flutuante de Chat em Tempo Real (`Direct Message`)
- **Comunicação Sem Fricção:** Clicou em qualquer operador na lista? Um pop-up escuro e elegante surge no canto inferior direito para você combinar táticas na hora.
- **Aviso de Privacidade Estilo Riot:** Banner oficial informando que o histórico é salvo e lembrando que administradores nunca solicitarão sua senha.
- **Envio com `Enter` & WebSockets:** Mensagens trafegam em milissegundos através do canal Supabase Realtime Broadcast, com balões personalizados para envio e recebimento com timestamps automáticos.

#### 🌐 4. Conexão com Dados 100% Reais do Supabase (`VICCS_PZHub_Website`)
- **Fim dos Usuários Fictícios:** Adeus dados estáticos! A lista agora consulta diretamente a tabela `public.profiles` e as conexões de `public.follows`.
- **Comunidade Viva:** Quem cria conta no website do PZHub aparece instantaneamente no desktop, com foto de perfil, apelido oficial e tags de papel (`CRIADOR`, `ADMIN`, `B42`).
- **Mural de Recados Persistido:** As mensagens trocadas são gravadas de forma estruturada na nuvem (`public.profile_scraps`), garantindo que seu histórico não evapore ao fechar o app.

---

## 🛰️ Atualização 2.1.1 — "O Fim do Silêncio no Rádio"
*Data da Transmissão: 08 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> Sabe aquele momento tenso em que você manda um sinal no rádio e ninguém responde, mas você não sabe se todo mundo morreu ou se a pilha do seu transmissor que acabou?  
> Pois é. O nosso auto-updater antigo fazia exatamente isso. Se a internet oscilasse ou a rota engasgasse, ele simplesmente ficava quieto e você continuava jogando numa versão antiga achando que estava tudo ótimo.  
> Na atualização **2.1.1**, nós reformamos a torre de transmissão do zero. Agora o sistema te avisa com clareza cristalina, no estilo visual que o PZHub merece!

---

### 🛡️ Destaques da Versão

#### 📡 1. Adeus ao Rádio Quebrado: Auto-Updater 100% Transparente
- **Torre Oficial no GitHub:** Migramos o endereço de checagem direto para o repositório oficial no GitHub (`latest.json`). Menos intermediários, mais velocidade e zero bloqueios chatos.
- **Diagnóstico Tático na Topbar:** Se a sua internet cair ou o servidor tossir (erros 404, 503, JSON corrompido), você não verá mais janelas bloqueantes na cara. Em vez disso, um badge âmbar discreto aparece no topo: `⚠️ FALHA TELEMETRIA`. Clicou nele? Ele te explica em português exatamente o que aconteceu.
- **Botão de Busca Sob Demanda:** Agora você tem controle total. Adicionamos um botão estiloso com ícone giratório **"BUSCAR"** bem no card de versão da tela inicial e uma opção rápida no menu do seu perfil de Operador.

#### 🪟 2. O Fim das Telas Cinzas Feias do Navegador
- **Zero `alert()` Nativos:** Banimos 100% daquelas caixinhas cinzas antiquadas que congelavam a tela.
- **Modal Holográfico com Vidro Líquido:** Quando uma nova versão chega, ela surge num painel tático com desfoque de fundo profundo, bordas metálicas chanfradas e animação fluida.
- **Toasts de Status em Tempo Real:** Notificações discretas que deslizam no canto inferior da tela para confirmar que você já está na versão mais atualizada ou avisar sobre downloads em andamento.

---

### 🛠️ Ajustes Rápidos nos Bastidores
- **Compatibilidade SemVer Blindada:** O cérebro que compara versões (`isNewerVersion`) agora tem garantias matemáticas de que nenhuma versão antiga vai tentar sobrescrever uma mais nova.
- **Pacotes Prontos para Uso:** Geramos os instaladores oficiais de release tanto no formato leve `.exe` (NSIS) quanto no padrão corporativo `.msi`.

---

## 👥 Atualização 2.1.0 — "Reunindo o Pelotão & Faxina no Painel"
*Data da Transmissão: 08 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> Ninguém sobrevive sozinho em Louisville. Nesta versão, trouxemos um ecossistema social completo inspirado no Riot Client para você acompanhar seus aliados em tempo real, além de botar ordem na casa e eliminar sobreposições visuais que estavam incomodando no radar.

---

### 🛡️ Destaques da Versão

#### 🎮 1. Painel Social Estilo Riot Client
- **Lista de Aliados com GPS:** Veja seus amigos online, a distância exata em metros até eles dentro do mapa e traçado automático de rota com apenas um clique no botão `🧭 GPS`.
- **Gaveta de Novos Sobreviventes:** Adicione aliados rapidamente e escolha a cor tática do ícone deles no radar.
- **Presença Global:** Sincronização direta com a nuvem do Supabase. O PZHub reconhece quando seus amigos estão com o aplicativo aberto mesmo antes de entrarem no servidor.

#### ⚡ 2. Botão "JOGAR" com Seletor de Memória RAM
- **Injeção de Performance:** Chega de abrir arquivos `.json` na mão para dar mais memória ao Project Zomboid. Agora há um botão esmeralda no topo onde você escolhe 4GB, 8GB, 16GB ou 32GB de RAM e ele faz a mágica sozinho no launcher oficial da Steam.

#### 🧹 3. Correções Cirúrgicas de Interface
- **Fim da Barra Quebrada:** O cabeçalho da Página 4 foi travado em 44px com alinhamento militar, impedindo que botões se amontoassem em monitores ultrawide ou telas pequenas.
- **O Mistério dos 400px Resolvido:** Eliminamos uma lacuna gigante fantasma na barra lateral. As abas de Cidades, Loot e Configurações agora abrem instantaneamente no topo, sem empurrar nada para fora da tela.

---

## 🎖️ Atualização 2.0.0 — "A Grande Virada Tática: Bem-vindo ao PZHub"
*Data da Transmissão: 01 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> O projeto deixou de ser apenas um visualizador de mapa e foi promovido a uma central completa de sobrevivência para o Project Zomboid (Build 41 e Build 42). Para comemorar essa nova fase, vestimos a farda completa inspirada em Escape from Tarkov.

---

### 🛡️ Destaques da Versão

#### 🪖 1. Identidade Visual Tarkov
- Cores escuras de alta visibilidade, acentos em Âmbar Tático (`#e58e26`) e Verde Esmeralda (`#2ecc71`).
- Painéis angulares, scanlines sutis e ícones vetoriais modernos desenhados sob medida.

#### 🗂️ 2. Gerenciador de Modpacks em 1 Clique
- Importe listas completas de mods a partir de links diretos e URLs do Pastebin.
- Download automático de arquivos `.zip` descompactados diretamente para a sua pasta de mods do Zomboid (`%USERPROFILE%/Zomboid/mods`).
- Integração nativa com a Oficina Steam para assinar dezenas de mods de uma só vez sem esforço manual.

#### 🔍 3. Scanner de Integridade de Mods
- Varredura veloz no seu disco rígido para identificar quais mods estão instalados, lendo títulos, compatibilidade com B41/B42 e posters oficiais em miniatura.

---

## 🚀 Atualização 1.0.0 — "O Primeiro Chamado"
*Data da Transmissão: 31 de Agosto de 2026*

### 🎙️ Palavra dos Devs
> O começo de tudo. O projeto nasceu da necessidade de termos um GPS em tempo real que não engasgasse o computador enquanto fugíamos de uma horda em West Point.

---

### 🛡️ Destaques da Versão
- **Motor Isométrico DZI em Rust:** Projeção precisa de cada quarteirão de Knox County com cache em disco para carregar o mapa na velocidade da luz.
- **Navegação GPS Estilo Waze / GTA V:** Cálculo de rotas neon na estrada, bússola dinâmica com pontos cardeais e previsão de tempo de chegada.
- **Modo Mini-Radar (Picture-in-Picture):** Uma janelinha flutuante Always-On-Top no canto do monitor para quem joga com uma tela só e quer ficar de olho nos arredores sem perder o jogo de vista.
- **Telemetria via Lua:** Ponte leve para ler as coordenadas do jogador diretamente do jogo sem causar quedas de FPS.

---

### 📌 Resumo Rápido para Sobreviventes Apressados

| Versão | O que mudou em uma frase? |
| :---: | :--- |
| **v2.2.1** | Linha segura: DMs 100% isoladas do mural do site, presença viva em tempo real e alerta sonoro tático. |
| **v2.2.0** | Painel social global estilo Riot Client com gaveta retrátil onipresente e pop-up de DM. |
| **v2.1.1** | O auto-updater agora fala sua língua, não trava a tela e avisa se a transmissão falhou. |
| **v2.1.0** | Painel de amigos estilo Riot, botão de Jogar com RAM e layout sem bugs. |
| **v2.0.0** | Nova cara militar no estilo Tarkov, gerenciador de modpacks e scanner de mods. |
| **v1.0.0** | Mapa isométrico fluido, GPS estilo GTA e mini-radar na tela. |

---

*Fim da transmissão. Mantenham suas armas limpas, suas mochilas cheias e o PZHub atualizado.*
