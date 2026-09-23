# 📜 PZHub — Caderno de Atualizações: Versões 2.2.7 a 2.2.9

> *"No meio de uma horda, você não quer que a sua janela de radar feche acidentalmente, nem quer um menu confuso roubando sua atenção. Equipamento militar precisa ser preciso, sonoro e resistente a falhas."*  
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

#### 🗔 1. Interceptação Nativa do Fechamento de Janela (`src-tauri/src/lib.rs`)
- **Hook no Ciclo de Vida do Windows:** Interceptação direta do evento `WindowEvent::CloseRequested`. Se a preferência estiver ativa, o Tauri invoca `api.prevent_close()` e oculta a janela visual (`window.hide()`).
- **Preservação de Serviços em Segundo Plano:** O Web Audio API, conexões Supabase Realtime WebSocket e os ciclos de leitura do arquivo `game_to_app.json` continuam operando normalmente sem consumir recursos gráficos da GPU.
- **Restauração em 1 Clique:** Clique com o botão esquerdo sobre o ícone do PZHub na bandeja traz a janela instantaneamente para a frente, remove minimização e aplica foco (`window.show() + window.unminimize() + window.set_focus()`).

#### 📋 2. Menu de Contexto Nativo da Bandeja (Tray Menu)
- **Menu Milspec Limpo:** Clique com o botão direito revela ações diretas do sistema:
  - 🖥️ **Abrir PZHub:** Restaura a janela na tela em qualquer monitor.
  - 🛑 **Encerrar PZHub:** Comando nativo `exit_app` chamando `app.exit(0)`, garantindo liberação imediata de memória e término gracioso do processo.
- **Tooltip Informativo:** Exibição do status `"PZHub - Tactical Live Radar & Broadcasting"` ao pairar sobre o ícone na bandeja.

#### ⚙️ 3. Disjuntor Tático nas Configurações (`#tab-settings`)
- **Novo Card de Preferências de Sistema:** Seção *"Comportamento do Sistema & Janela"* incorporada na aba 5 de configurações do aplicativo.
- **Switch Estilo Disjuntor Militar (`#toggle-minimize-tray`):** Interruptor tático com corpo grafite, slider com borda esmeralda e halo neon ao ligar, vindo **ativado por default (`checked = true`)**.
- **Persistência Confiável no Rust (`src-tauri/src/config.rs`):** A preferência é armazenada no campo `minimize_to_tray: bool` dentro da struct `UserConfig`, salva no `config.json` nativo via comando Tauri `set_user_config` e espelhada no `localStorage`.
- **Feedback Auditivo Mecânico:** Ao alternar o switch, a interface dispara o efeito sonoro mecânico sutil de comutação (`soundFx.playSwitch()`).
- **Acesso Rápido nas Views:** Inclusão de atalho rápido *"Configurações"* no dropdown do perfil de Operador no canto superior direito, permitindo navegação direta para as opções sem precisar abrir o mapa manualmente.

#### 🌐 4. Suporte Multilíngue Completo (`src/js/i18n.js`)
- Dicionários atualizados com tags `data-i18n` para **Português (Brasil)**, **English (US)** e **Español (ES)** cobrindo títulos, descrições e tooltips do novo comportamento de bandeja.

#### 📦 5. Binários de Release Oficial v2.2.9
- **Instalador NSIS:** `src-tauri/target/release/bundle/nsis/PZHub_2.2.9_x64-setup.exe`
- **Pacote MSI Corporativo:** `src-tauri/target/release/bundle/msi/PZHub_2.2.9_x64_en-US.msi`

---

## 📻 Atualização 2.2.8 — "Sincronia Perfeita: O Fim do Silêncio no Multiplayer"
*Data da Transmissão: 23 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Você entra no servidor dedicado com seus amigos, coloca uma fita cassete clássica para tocar no rádio da sala... seu amigo do outro lado da floresta avisa no rádio que está ouvindo, mas quem está na frente do aparelho fica num silêncio absoluto?* 📻🤐🔇  
> Esse foi um dos bugs mais traiçoeiros do motor de som! Nos bastidores, navegadores modernos (e o motor Chromium embutido no webview do Tauri) possuem políticas agressivas de bloqueio de áudio (autoplay) que às vezes colocavam o player do YouTube em estado `muted = true` sem avisar ninguém. Para piorar, quando múltiplos sobreviventes estavam conectados, o cálculo do tempo inicial da música (`startedAt`) sofria desvios de precisão, gerando valores indefinidos que faziam o player travar o áudio no segundo zero.  
> Na **Atualização 2.2.8**, nós reescrevemos a rotina de despacho de áudio: forçamos a desmutação defensiva ativa (`unMute()`), blindamos o cálculo do relógio de sincronização para garantir que todo o esquadrão ouça exatamente a mesma fração de segundo da música, e conectamos o despertar automático do contexto de áudio 3D!

### 🛡️ Destaques da Versão 2.2.8

#### 🔊 1. Extermínio do Bug do Silêncio no Player (`src/js/broadcasting_engine.js`)
- **Desmutação Defensiva Obrigatória:** A rotina `setSmoothVolume()` agora verifica se o player interno do YouTube caiu em estado mutado (`isMuted()`). Caso o jogo solicite volume maior que zero, o PZHub aciona imediatamente `unMute()`, garantindo que o som saia das caixas sem exigir que o usuário abra e mexa no aplicativo.
- **Relógio de Sincronia Preciso (`offsetSeconds`):** Adicionado cálculo defensivo `Math.max(0, currentTimestamp - startedAt)` com verificação estrita `Number.isFinite()`, prevenindo que leituras assíncronas do arquivo `game_to_app.json` causem valores `NaN` no seek do player.

#### 🎛️ 2. Despertador do Contexto Espacial 3D (`src/js/spatial_audio_engine.js`)
- **Rotina `ensureContext()` Dinâmica:** A função `updateAcoustics()` agora invoca preventivamente a recuperação do `AudioContext`. Se o motor de áudio Web Audio API estiver suspenso pelas políticas de economia de energia do sistema operacional, ele é reativado no primeiro evento de telemetria recebido do jogo.

#### 🎮 3. Paridade Multi-Target com o Mod VICCS Broadcasting v1.2.3
- Deploy sincronizado com 100% de conferência hash MD5 entre as instalações locais do cliente (`%USERPROFILE%\Zomboid\mods\VICCS_Broadcasting`) e as pastas do servidor dedicado (`C:\pzserver\mods\VICCS_Broadcasting`), eliminando incompatibilidades de versão entre clientes e host.

---

## 🎨 Atualização 2.2.7 — "O Cockpit Modular: Topbar Expansível & Áudio Tático de Interface"
*Data da Transmissão: 22 de Setembro de 2026*

### 🎙️ Palavra dos Devs
> *Olhando para o menu superior do PZHub, parecia que tínhamos colocado botões demais em uma barra só: Centro de Operações, Modpacks, Mods Locais, Mapa, Transmissão... tudo espremido disputando espaço.* 🗂️🎛️  
> Inspirados nas interfaces de alta tecnologia militar (Escape from Tarkov e cockpits de simulação), decidimos fazer uma cirurgia completa na barra superior: criamos as **Boxes de Ícones Modulares Expansíveis**.  
> Em repouso, a barra superior é limpa e minimalista, exibindo apenas as insígnias vetoriais de cada subsistema. Mas ao passar o mouse sobre qualquer box, o botão desliza suavemente para o lado, revelando o número tático da estação (`01`, `02`, `03`...) e o nome completo da página! E para completar a imersão sensorial, desenvolvemos um sintetizador de efeitos sonoros leves para que cada toque e hover no aplicativo soem como o acionamento de um equipamento militar de verdade!

### 🛡️ Destaques da Versão 2.2.7

#### 🎛️ 1. Navegação Tática Modular Expansível (`src/index.html` & `src/css/main.css`)
- **Dock de Abas Dinâmico (`.tarkov-tab`):** Estrutura dividida em ícone minimalista fixo (`.tab-box-icon`) e container expansível sanfonado (`.tab-box-expand`).
- **Animação Fluida Milspec:** Ao passar o cursor, a largura se expande suavemente com curva cúbica tática (`cubic-bezier(0.4, 0, 0.2, 1)`), revelando o identificador numérico neon e o título traduzido.
- **Aba Destacada do Radar:** A aba `04 MAPA & RADAR` possui borda e realce em esmeralda tático vibrante, demarcando a ferramenta principal de sobrevivência.

#### 🔔 2. Motor de Áudio Tático de Interface Procedural (`src/js/sound_fx.js`)
- **Zero Arquivos de Áudio Pesados:** Implementado 100% com a Web Audio API nativa através de osciladores sintetizados proceduralmente. O aplicativo ganha som sem aumentar em um único byte o peso do instalador com arquivos `.mp3` ou `.wav`.
- **Perfis Acústicos Projetados:**
  - *Hover Metálico Suave:* Frequência limpa de 1800Hz com atenuação e decaimento instantâneo de 45ms.
  - *Click Tático Mecânico:* Transiente com tom duplo (800Hz e 400Hz) simulando clique de relé/disjuntor industrial.
  - *Switch Deslizante:* Modulação com queda suave simulando comutação de chaves blindadas.

#### 🔇 3. Chave Master de Áudio da UI na Barra Superior (`#btn-global-sound-toggle`)
- **Controle Rápido de Silenciamento:** Botão de volume discreto no cluster superior direito.
- **Persistência Imediata:** Salva a preferência em `localStorage` (`pzhub_ui_sound_muted`), mantendo a interface silenciosa ou ruidosa conforme o gosto do operador.
