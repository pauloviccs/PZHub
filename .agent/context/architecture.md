# Arquitetura do Sistema: Ecossistema PZHub

## 1. Visão Geral
O ecossistema **PZHub** integra duas frentes coordenadas:
1. **PZHub Desktop (Tauri v2 + Rust + Leaflet):** 
   - Visualizador tático de mapa de Knox County com cache local em disco.
   - Live Squad Radar conectado com o mod Lua do Project Zomboid (Build 42 & Build 41).
   - Scanner assíncrono de mods locais (`Zomboid/mods` e Steam Workshop).
   - Gerenciador de modpacks com instalação e subscrição em lote com 1 clique.
   - UI/UX militar estilizada em **Escape from Tarkov**.
2. **PZHub Web Platform (`VICCS_PZHub_Website` - Vite + Vercel):**
   - Catálogo Comunitário Público (Workshop) para exploração de modpacks.
   - Estúdio do Criador com formulário visual e Live Preview dinâmico.
   - Autenticação e armazenamento em nuvem gratuito via **Supabase**.

## 2. Componentes Principais & Fluxo de Dados
- **Rust Core (src-tauri):** Gerenciamento de cache de tiles, scanner de arquivos locais, conexão de telemetria e download/extração assíncrona de `.zip`.
- **Frontend Desktop (src):** Vanilla JavaScript modular (`app.js`, `modpack_manager.js`, `local_mods_scanner.js`, `map_engine.js`) com suspensão inteligente de recursos.
- **Frontend Web (`VICCS_PZHub_Website`):** SPA responsiva em Vite com `@supabase/supabase-js`, Design System Tarkov e suporte a deep linking (`pzhub://`).
- **Supabase Cloud Backend:** PostgreSQL com RLS para armazenamento de manifestos e perfis, acessível via REST API pública (`GET /rest/v1/modpacks`).
- **Mod Lua (server-mod):** Transmissor de telemetria leve para Build 42 e Build 41.
