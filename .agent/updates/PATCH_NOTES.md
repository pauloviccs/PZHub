# 📜 PZHub — Caderno Oficial de Atualizações (Patch Notes)

> *"Sobreviver ao apocalipse zumbi de Knox County já é difícil o suficiente. O seu rádio de comunicação e o seu gerenciador tático não deveriam ser outro obstáculo."*  
> — **Equipe de Engenharia e Operações do PZHub**

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
| **v2.1.1** | O auto-updater agora fala sua língua, não trava a tela e avisa se a transmissão falhou. |
| **v2.1.0** | Painel de amigos estilo Riot, botão de Jogar com RAM e layout sem bugs. |
| **v2.0.0** | Nova cara militar no estilo Tarkov, gerenciador de modpacks e scanner de mods. |
| **v1.0.0** | Mapa isométrico fluido, GPS estilo GTA e mini-radar na tela. |

---

*Fim da transmissão. Mantenham suas armas limpas, suas mochilas cheias e o PZHub atualizado.*
