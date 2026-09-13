# Tarefa Ativa

## Status
Concluída com sucesso! A versão **v2.2.2** (Overhaul de Blips Táticos GTA V, Enriquecimento de POIs de Knox County, Sistema de LOD em 3 Camadas e Sincronização de Filtros) foi implementada, testada e homologada.

## Última Entrega Concluída (v2.2.2 - Overhaul de Blips GTA V & POIs)
- **Motor de Blips Vetoriais GTA V (`src/js/blip_icons.js`):** Implementação de ícones vetoriais SVG de alta precisão baseados na documentação oficial de Blips do GTA V (FiveM / RAGE:MP) cobrindo todas as 20 categorias do Project Zomboid (Ammu-Nation, Los Santos Customs, Delegacia, Hospital, 24/7, Posto, Armazéns, Farmácias, etc.).
- **Estilização Visual com Efeito Neon & Halo Tático (`src/css/map.css`):** Estrutura `.poi-blip-gta` com núcleo escuro de alto contraste, borda chanfrada vibrante, aura luminescente e expansão suave ao passar o cursor (`scale(1.35)`).
- **Enriquecimento da Base de POIs (`src/data/buildings_index.json` & `meta.json`):**
  - Identificação e catalogação das oficinas mecânicas e funilarias que estavam sem marcador (como as de Fallas Lake, West Point, Muldraugh e Riverside).
  - Inclusão oficial da categoria `mechanic` com cor tática `#ffa502` e ícone de chave inglesa (Blip 72 - Los Santos Customs).
- **Desbloqueio de 537+ Prédios Ocultos no `map_engine.js`:** Expansão das categorias ativas padrão de 9 para 20, ativando armazéns, garagens, lojas de departamento, confeitarias e prédios cívicos previamente escondidos.
- **Sistema de Level of Detail (LOD) em 3 Tiers:**
  - *Tier 1 (Zoom >= 13):* Serviços vitais (Armarias, Delegacias, Hospitais, Bombeiros, Oficinas, Postos). Marcadores com destaque ampliado (30px).
  - *Tier 2 (Zoom >= 14):* Suprimentos e comércio (Mercados, Farmácias, Ferramental, Roupas, Restaurantes, Bancos, Igrejas). Marcadores padrão (26px).
  - *Tier 3 (Zoom >= 15):* Áreas secundárias (Galpões, Depósitos, Escolas, Motéis). Marcadores compactos (22px).
- **Correção da Interface de Filtros de Categoria (`src/js/app.js`):** Substituição da lista obsoleta de 6 itens pela lista completa de 18 categorias GTA V com indicadores de cor oficiais e correção do binding do evento de toggle diretamente para `mapEngine.toggleCategory()`.
- **Instalador Oficial Windows v2.2.2 Gerado:** Compilado via NSIS em `src-tauri/target/release/bundle/nsis/PZHub_2.2.2_x64-setup.exe` (4.3 MB).

## Próximo Foco Sugerido (Roadmap v2.4+)
- Transmissão de waypoints e marcações táticas personalizadas no mapa entre amigos online via canais Supabase Realtime.
- Notificações nativas do Windows para novas DMs ou alertas de sobreviventes.
- Verificador de compatibilidade e conflitos de mods no scanner local.
