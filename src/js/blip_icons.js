/**
 * PZHub - Tactical GTA V Blips SVG Engine
 * Baseado na documentação oficial de Blips do GTA V (FiveM / RAGE:MP)
 * https://docs.fivem.net/docs/game-references/blips/
 */

export const GTA_BLIP_COLORS = {
  gun: '#ff4757',          // Vermelho Vivo Ammu-Nation (Blip 110)
  police: '#2e86de',       // Azul Policial Los Santos PD (Blip 60)
  prison: '#747d8c',       // Cinza Chumbo Penitenciária
  fire: '#eb4d4b',         // Vermelho Bombeiros (Blip 436)
  medical: '#2ed573',      // Verde Esmeralda Hospital (Blip 61)
  pharmacy: '#ff6b81',     // Rosa Farmácia (Blip 51)
  mechanic: '#ffa502',     // Laranja Los Santos Customs / Oficina (Blip 72)
  gas: '#00d2d3',          // Ciano Posto de Combustível (Blip 361)
  grocery: '#eccc68',      // Dourado Cifrão $ / Loja de Conveniência 24/7 (Blip 52)
  hardware: '#10ac84',     // Verde Ferramentas (Blip 402)
  restaurant: '#ff7f50',   // Coral Lanchonete / Spiffo's / Fast Food (Blip 93)
  bar: '#f39c12',          // Âmbar Bar / Bebidas (Blip 84)
  clothing: '#a55eea',     // Roxo Cabide / Binco / Suburban (Blip 73)
  warehouse: '#57606f',    // Grafite Galpão / Storage (Blip 478)
  selfstorage: '#8395a7',  // Cinza Claro Depósito
  bank: '#1dd1a1',         // Verde Dólar Banco (Blip 108)
  church: '#ced6e0',       // Branco Gelo Cruz
  library: '#c8d6e5',      // Azul Giz Livro / Estudo (Blip 358)
  school: '#ff9f43',       // Laranja Escola
  motel: '#48dbfb',        // Azul Piscina Motel
  safehouse: '#7bed9f'     // Verde Limão Base Segura (Blip 40)
};

export const GTA_BLIP_SVGS = {
  // Blip 110: Pistola Ammu-Nation
  gun: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 9h16l1.5 2.5H22V13h-3.5L17 11.5H13v3h-2l-1.5 5.5H6.5L7.8 14.5H2V9z"/></svg>`,
  
  // Blip 60: Escudo Policial com Estrela
  police: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L4 5v6.1c0 5.5 3.4 10.7 8 11.9 4.6-1.2 8-6.4 8-11.9V5l-8-3zm0 5.2l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4 1.3-2.7z"/></svg>`,
  
  // Blip 61: Cruz Hospital / Clínica
  medical: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/></svg>`,
  
  // Blip 51: Pílula Farmácia
  pharmacy: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h4V3H6zm6 0v10h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4h-4zm-8 8v6a4 4 0 0 0 4 4h4V11H4zm12 0v10h2a4 4 0 0 0 4-4v-6h-6z"/></svg>`,
  
  // Blip 72: Los Santos Customs / Oficina Mecânica (Chave Inglesa)
  mechanic: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22.7 19.3l-6.4-6.4a7 7 0 0 0 1.2-4.9 7 7 0 0 0-7-7 6.9 6.9 0 0 0-5.1 2.3l4.5 4.5-2.8 2.8-4.5-4.5A6.9 6.9 0 0 0 0 6.2a7 7 0 0 0 7 7 7 7 0 0 0 4.9-1.2l6.4 6.4a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0 0-1.4z"/></svg>`,
  
  // Blip 361: Bomba de Combustível / Posto
  gas: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h8v18H4V3zm2 2v5h4V5H6zm11 1l3 3c.6.6.9 1.3.9 2v8a3 3 0 0 1-6 0v-4h-1.5v-2h1.5V9l-1.4-1.5 3-1.5zM17 14h2v5a1 1 0 1 1-2 0v-5z"/></svg>`,
  
  // Blip 52: Cifrão de Loja de Conveniência 24/7 / Supermercado
  grocery: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 16.9v1.1h-2v-1.1c-2.2-.3-3.6-1.7-3.7-3.4h2.2c.1 1 1 1.6 2.3 1.6 1.4 0 2.2-.7 2.2-1.7 0-1-.8-1.5-2.6-1.9-2.7-.6-4.2-1.5-4.2-3.6 0-1.7 1.4-3.1 3.8-3.4V5.5h2v1.1c2 .3 3.3 1.6 3.4 3.2h-2.1c-.1-.8-.8-1.4-2.1-1.4-1.3 0-2 .6-2 1.5 0 .9.7 1.3 2.5 1.8 2.8.7 4.3 1.6 4.3 3.7 0 1.9-1.4 3.2-3.7 3.5z"/></svg>`,
  
  // Blip 402: Martelo e Ferramentas
  hardware: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.7 2.3a3.5 3.5 0 0 0-4.9 0l-9.8 9.8a2 2 0 0 0 0 2.8l3.9 3.9a2 2 0 0 0 2.8 0l9.8-9.8a3.5 3.5 0 0 0 0-4.9l-1.8-1.8zm-1.4 1.4l1.8 1.8a1.5 1.5 0 0 1 0 2.1l-1.4 1.4-3.9-3.9 1.4-1.4a1.5 1.5 0 0 1 2.1 0zM3.5 17.7l2.8 2.8-4.2 1.4 1.4-4.2z"/></svg>`,
  
  // Blip 73: Cabide de Loja de Roupas
  clothing: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a3 3 0 0 0-3 3c0 .7.2 1.3.6 1.8L2 14.5A2 2 0 0 0 3.3 18H20.7a2 2 0 0 0 1.3-3.5L14.4 8.8c.4-.5.6-1.1.6-1.8a3 3 0 0 0-3-3zm0 2a1 1 0 0 1 1 1c0 .6-.4 1-1 1s-1-.4-1-1a1 1 0 0 1 1-1zm0 4.8l7.5 5.2H4.5L12 10.8z"/></svg>`,
  
  // Blip 93: Restaurante / Garfo e Faca
  restaurant: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.1 1.6 3.8 3.6 4v8h2.8v-8c2-.2 3.6-1.9 3.6-4V2h-2v7zm7-7c-1.7 0-3 1.8-3 4v7h3v9h2V2h-2z"/></svg>`,
  
  // Blip 84: Bar / Bebidas / Coquetel
  bar: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.4 7l-1.8-2h12.8l-1.8 2H7.4z"/></svg>`,
  
  // Blip 478: Galpão Industrial / Warehouse
  warehouse: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L2 8v13h20V8L12 3zm0 2.5l7 3.5v1.2l-7 3.5-7-3.5V9l7-3.5zM4 11.5l7 3.5v6.5H4v-10zm16 10h-7v-6.5l7-3.5v10z"/></svg>`,
  
  // Depósito / Self Storage
  selfstorage: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 4H6V5h12v2zm0 4H6V9h12v2zm0 4H6v-2h12v2zm0 4H6v-2h12v2z"/></svg>`,

  // Blip 436: Bombeiros
  fire: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C9.5 6 6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-3.5-8-6-12zm0 16a4 4 0 0 1-4-4c0-2.3 1.8-4.7 4-7.2 2.2 2.5 4 4.9 4 7.2a4 4 0 0 1-4 4z"/></svg>`,
  
  // Blip 108: Banco / Cofre
  bank: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7v3h20V7L12 2zm-8 9v8h3v-8H4zm6 0v8h3v-8h-3zm6 0v8h3v-8h-3zM2 20v2h20v-2H2z"/></svg>`,
  
  // Blip Igreja / Capela
  church: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 2h2v4h4v2h-4v3l7 4v7h-5v-4a3 3 0 0 0-6 0v4H4v-7l7-4V8H7V6h4V2z"/></svg>`,
  
  // Blip 358: Biblioteca / Livraria
  library: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-1 16H6V4h12v14zM8 6h8v2H8V6zm0 3h8v2H8V9zm0 3h5v2H8v-2z"/></svg>`,

  // Escola / Faculdade
  school: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`,

  // Cadeia / Prisão
  prison: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 2v20h2V2H4zm5 0v20h2V2H9zm5 0v20h2V2h-2zm5 0v20h2V2h-2z"/></svg>`,

  // Motel
  motel: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4z"/></svg>`,

  // Safehouse / Base Segura
  safehouse: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
};

/**
 * Retorna o markup HTML completo para um Blip GTA V no Leaflet
 * @param {string} catId Categoria do POI
 * @param {string} [tier='tier-2'] Tier de tamanho ('tier-1', 'tier-2', 'tier-3')
 * @returns {string}
 */
export function getGtaBlipHtml(catId, tier = 'tier-2') {
  const color = GTA_BLIP_COLORS[catId] || '#ffffff';
  const svg = GTA_BLIP_SVGS[catId] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>`;
  
  return `
    <div class="poi-blip-gta ${tier}" style="--blip-color: ${color};">
      <div class="blip-halo"></div>
      <div class="blip-core">
        ${svg}
      </div>
    </div>
  `;
}
