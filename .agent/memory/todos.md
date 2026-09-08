# TODOs do Projeto

## Fase 1: Fundação & Scaffolding Desktop
- [x] Inicializar projeto Tauri v2 configurado para Windows x64.
- [x] Configurar dependências e plugins no `Cargo.toml` e `package.json`.
- [x] Configurar `tauri.conf.json` para janela elegante (transparência, Always-on-top, dimensões).
- [x] Integrar favicons e ícones oficiais em todos os formatos nativos.

## Fase 2: Motor de Mapa (PZMap Clone & Cache)
- [x] Implementar projeção do Leaflet para coordenadas do Project Zomboid (X, Y, Chunks de Knox County).
- [x] Implementar motor de Tiles com suporte a Z-Levels (Andares: 0 a 7+) e camadas DZI oficiais do pzmap.net.
- [x] Implementar backend em Rust para cache inteligente de tiles no disco local com comando Tauri `get_tile`.
- [x] Configurar limite inteligente de zoom out e LOD para cidades e prédios de loot.

## Fase 3: UI/UX Tática, GPS e Modo Mini-Radar
- [x] Construir HUD tática com design Liquid Glass e tema Escape from Tarkov.
- [x] Implementar sistema de Rotas GPS animadas estilo GTA V / Waze com HUD de navegação em tempo real.
- [x] Implementar modo Mini-Radar Widescreen estilo GTA V ($340\times220\text{px}$) no canto inferior esquerdo.
- [x] Remover barras de título nativas do explorer no modo mini-radar (`set_decorations(false)`).
- [x] Adicionar controles flutuantes com fade no hover (Expandir, Arrastar, Minimizar, Fechar).
- [x] Implementar barras duplas de status do GTA V (Vida e Vigor) e bússola de Norte `(N)`.

## Fase 4: Sincronização em Tempo Real & Amigos
- [x] Implementar módulo de telemetria em Rust / Tauri com leitura segura do mod Lua.
- [x] Remover jogadores simulados / bots fictícios para manter o modo offline 100% limpo.
- [x] Criar sistema completo de Lista de Amigos com apelidos, cores personalizadas e destaque ⭐ no radar.
- [x] Criar mini-mod Lua para Build 41 e Build 42 com instalador embutido no binário Rust.

## Fase 5: Atualização v2 (PZHub & Tarkov Rework)
- [x] Criar Centro de Operações (Launcher / Hub Inicial) com 3 portais táticos.
- [x] Rework visual Escape from Tarkov (cantos chanfrados, scanlines, acentos em Âmbar e Esmeralda, 100% SVG).
- [x] Scanner assíncrono de mods locais (`Zomboid/mods` e Steam Workshop) com busca em tempo real.
- [x] Gerenciador de modpacks com suporte a links diretos e Pastebin raw.
- [x] Download e descompactação assíncrona de arquivos `.zip` em Rust com barra de progresso com glow.
- [x] Inscrição e abertura automática de itens do Steam Workshop via protocolo nativo.

## Fase 6: Ecossistema Web & Nuvem Supabase
- [x] Criar projeto web `VICCS_PZHub_Website` com Vite e `@supabase/supabase-js`.
- [x] Modelar e documentar schema PostgreSQL no Supabase com RLS (`profiles` e `modpacks`).
- [x] Desenvolver o Estúdio do Criador com formulário visual e Live Preview tático em tempo real.
- [x] Desenvolver a Vitrine Comunitária com filtros por categoria e busca instantânea.
- [x] Integrar autenticação Supabase Auth para criadores.
- [x] Conectar o aplicativo desktop PZHub para consumir a API REST do Supabase automaticamente.
- [x] Configurar rotas e preparar deploy gratuito na Vercel (`vercel.json`).

## Fase 7: Painel Social Riot Client, Autenticação Desktop & Hardening de Layout
- [x] Integrar autenticação e criação de perfil direto no desktop via Supabase Auth.
- [x] Criar botão predominante Hero "JOGAR" com seletor tático de memória RAM na Steam.
- [x] Redesenhar painel social estilo Riot Client (card de operador, sub-toolbar, busca, gaveta retrátil com 6 cores).
- [x] Sincronizar fotos e dados de perfil da tabela `profiles` com fallback para iniciais.
- [x] Integrar presença global em tempo real entre usuários desktop via WebSocket `pzhub-global-presence`.
- [x] Blindar layout responsivo da Página 4 (Radar & Mapa) travando altura do header e folga da sidebar.
- [x] Corrigir especificidade CSS `.tab-pane` eliminando a lacuna de 400px e vazamento de abas.
- [x] Compilar instaladores finais de release Windows (`.exe` NSIS e `.msi` WiX).

## Próximos Passos (Roadmap v2.2+)
- [ ] Implementar chat tático direto por texto entre amigos via canais Realtime.
- [ ] Adicionar notificações nativas do Windows para amigos online.
- [ ] Desenvolver verificador de integridade e incompatibilidade de mods no scanner local.
