# Tarefa Ativa

## Status
Atualização **v2.1.1** (Auto-Updater Blindado, Fallback Automático de Branches `master`/`main`, Indicador de Falha na Topbar, Central de Versão Tática e Compilação de Produção) concluída e validada com sucesso.

## Entregas Concluídas (v2.1.1)
- **Auto-Updater Blindado & Migração de Endpoint:** Endpoint oficial migrado para o GitHub Raw (`master/latest.json`) com fallback automático inteligente entre branches `master` e `main` tanto no comando nativo Rust (`fetch_update_manifest`) quanto no fallback JavaScript, prevenindo erros HTTP 404 silenciosos.
- **Eliminação Total de `alert()` Nativos:** Substituição de todos os diálogos bloqueantes do navegador por Toasts Táticos animados (`showTacticalToast`) com barra de tempo e Modal Holográfico com desfoque profundo (`#tactical-version-modal`).
- **Indicador Tático na Topbar:** Badge discreto `#topbar-updater-status` que sinaliza falhas de telemetria com diagnóstico descritivo ao clicar (`HTTP 404`, `HTTP 503`, JSON corrompido) ou notifica novas versões disponíveis sem travar o aplicativo.
- **Card Interativo de Versão no Hero:** Elemento `#hub-updater-box` no cabeçalho com versão instalada (`v2.1.1`), status dinâmico e botão "BUSCAR" com ícone giratório (`#btn-hub-check-updates`).
- **Atalho no Perfil:** Adicionada ação "Buscar Atualizações" no menu dropdown do operador.
- **Notas de Versão Imersivas:** Arquivo `.agent/updates/PATCH_NOTES.md` criado no estilo Riot Games cobrindo todo o histórico do projeto de 1.0.0 a 2.1.1.
- **Compilação e Pacotes de Distribuição v2.1.1:** Gerados com sucesso os pacotes `PZHub_2.1.1_x64-setup.exe` (NSIS), `PZHub_2.1.1_x64_en-US.msi` e o binário direto `tauri-app.exe`.
