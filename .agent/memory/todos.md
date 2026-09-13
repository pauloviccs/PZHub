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

## Fase 8: Painel Social Riot Client 1:1, DM Pop-up, Linha Segura & Hardening de Update (v2.2.0 & v2.2.1)
- [x] Criar gaveta retrátil lateral onipresente (`#riot-social-drawer`) acessível em todas as telas com atalho `ESC`.
- [x] Implementar janela flutuante de Direct Message (DM Pop-up) no canto inferior direito com histórico persistente e envio via `Enter`.
- [x] Isolar mensagens privadas com tabela dedicada `public.direct_messages` e RLS restrito a remetente/destinatário (zero vazamento para o mural público `profile_scraps`).
- [x] Implementar sintetizador sonoro de alerta tático bi-tonal suave (F#5 para C#6) via Web Audio API.
- [x] Desenvolver algoritmo de presença dinâmica (`updateFriendsPresence`) com promoção de amigos online para o topo e sincronização de status in-game vs desktop.
- [x] Implementar validação de integridade por Magic Bytes (`MZ` / `OLE`) no auto-updater em Rust para evitar erros Win32 de 16-bits.
- [x] Adicionar auto-correção de extensão de instalador (`.exe` / `.msi`) e disparo desanexado com elevação UAC.
- [x] Compilar instaladores oficiais de release Windows v2.2.1 (`PZHub_2.2.1_x64-setup.exe` e `PZHub_2.2.1_x64_en-US.msi`).

## Fase 9: Overhaul de Blips Táticos GTA V & Enriquecimento de POIs (v2.2.2)
- [x] Criar motor de blips vetoriais SVG de alta resolução (`src/js/blip_icons.js`) baseado na documentação oficial de Blips do GTA V (FiveM / RAGE:MP).
- [x] Aplicar estética de alto contraste (núcleo chanfrado escuro, borda neon tática e aura de iluminação radial `.poi-blip-gta`).
- [x] Identificar e enriquecer prédios sem categoria (oficinas mecânicas e funilarias de Fallas Lake, West Point, Muldraugh e Riverside) com nova categoria `mechanic` (Blip 72 - LS Customs).
- [x] Ativar todas as 20 categorias no motor de mapa (`map_engine.js`), liberando 537+ edifícios que estavam ocultos.
- [x] Implementar sistema inteligente de LOD em 3 camadas (Tier 1 para serviços vitais a zoom >= 13, Tier 2 para comércio a zoom >= 14, Tier 3 para armazéns a zoom >= 15).
- [x] Integrar checklist da sidebar (`app.js`) com 18 categorias completas e conectar evento de toggle diretamente a `mapEngine.toggleCategory()`.

## Próximos Passos (Roadmap v2.4+)
- [ ] Adicionar notificações nativas do Windows para novos operadores e mensagens quando minimizado.
- [ ] Implementar transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canais Realtime.
- [ ] Desenvolver verificador de integridade e incompatibilidade de mods no scanner local.
- [ ] Integrar chamadas de voz táticas (estilo rádio militar com chiado e ruído configurável).
