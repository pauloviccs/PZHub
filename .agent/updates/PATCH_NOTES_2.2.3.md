# 📜 PZHub — Caderno de Atualização: Versão 2.2.3

> *"Sobreviver ao apocalipse zumbi de Knox County já é difícil o suficiente. O seu rádio de comunicação e o seu gerenciador tático não deveriam ser outro obstáculo."*  
> — **Equipe de Engenharia e Operações do PZHub**

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
