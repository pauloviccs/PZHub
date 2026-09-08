# Tarefa Ativa

## Status
Atualização v2.1.0 (PZHub Desktop - Riot Social Panel, Sincronização Supabase Auth, Hero Play & Layout Hardening) implementada e validada com sucesso.

## Entregas Concluídas
- **Blindagem Responsiva da Página 4 (Radar & Mapa):** Header travado em `44px` sem quebra em múltiplas linhas, sidebar com folga de 6px (`top: 58px`) e dock tático centralizado dinamicamente.
- **Isolamento Rígido de Abas e Eliminação do Vácuo de 400px:** Correção de especificidade CSS com `.tab-pane { display: none !important; }`, garantindo que as abas Cidades, Loot, Andar e Config abram alinhadas ao topo sem vazamento do painel social.
- **Painel Social Estilo Riot Client:** Card de operador do usuário, sub-toolbar tática (`Amigos` / `Radar`), busca rápida com clear `✕`, gaveta retrátil com 6 cores luminescentes e agrupamento dinâmico (Online com rotas GPS / Offline com accordion retrátil).
- **Sincronização de Perfis Supabase & Presença Desktop Realtime:** Fotos e nomes oficiais puxados da tabela `profiles` com fallback inteligente para iniciais, sincronização de presença entre instâncias do PZHub Desktop via WebSocket `pzhub-global-presence` e integração com telemetria Lua in-game.
- **Hero Play Button com Seletor de RAM:** Botão predominante com menu tático de memória (4GB a 32GB) com persistência em `localStorage` e disparo via `steam://run/108600`.
- **Compilação e Pacotes de Distribuição:** Gerados instaladores de produção em `src-tauri/target/release/bundle/nsis/PZHub_2.0.0_x64-setup.exe` e `.msi`.
