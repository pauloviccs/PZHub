# Tech Stack: Ecossistema PZHub

## 1. Desktop Application (`VICCS_PZMap`)
- **Core Engine:** Tauri v2 (Rust 1.94+ & WebView2)
- **Frontend:** Vanilla JavaScript (ES2023 Modules), Leaflet.js
- **Styling:** Vanilla CSS (Escape from Tarkov Tactical Design System)
- **Game Bridge:** Lua 5.1/JIT (Project Zomboid B42 & B41)
- **Empacotamento:** Cargo, npm, NSIS Windows Installer

## 2. Web Application (`VICCS_PZHub_Website`)
- **Bundler & Dev Server:** Vite 6
- **Frontend:** JavaScript ES2023, HTML5, CSS3
- **Data Client:** `@supabase/supabase-js` v2.49+
- **Hospedagem & CDN:** Vercel (Free Tier)

## 3. Backend & Cloud Infrastructure (100% Free Tier)
- **Database:** Supabase PostgreSQL com Row Level Security (RLS)
- **Auth:** Supabase Authentication (Email/Password, OAuth)
- **Storage:** Supabase Storage (Capas e Banners de modpacks)
- **Protocols:** Steam Workshop Protocol (`steam://`), REST API (`https://<project>.supabase.co/rest/v1`)
