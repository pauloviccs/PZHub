# 📜 PZHub — Caderno Oficial de Atualizações (Patch Notes)

> *"Sobreviver ao apocalipse zumbi de Knox County já é difícil o suficiente. O seu rádio de comunicação e o seu gerenciador tático não deveriam ser outro obstáculo."*  
> — **Equipe de Engenharia e Operações do PZHub**

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
