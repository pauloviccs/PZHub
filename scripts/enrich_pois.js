import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('src/data/buildings_index.json');
const metaPath = path.resolve('src/data/meta.json');

const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

// 1. Garante que 'mechanic' exista em meta.json
if (!meta.categories.mechanic) {
  meta.categories.mechanic = {
    label: "Auto Repair / Mechanic",
    emoji: "🔧"
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  console.log('[OK] Categoria mechanic adicionada ao meta.json');
}

// 2. POIs de Oficinas Mecânicas de Fallas Lake identificados na célula 28_32
// e oficinas adicionais mapeadas
const additionalPois = [
  { id: "28_32_14", cat: "mechanic", x: 7303.5, y: 8233.0, cell: [28, 32] },
  { id: "28_32_15", cat: "mechanic", x: 7323.0, y: 8206.0, cell: [28, 32] },
  { id: "28_32_16", cat: "mechanic", x: 7325.0, y: 8244.0, cell: [28, 32] },
  { id: "28_32_17", cat: "mechanic", x: 7333.5, y: 8228.0, cell: [28, 32] },
  // West Point auto mechanic workshop
  { id: "46_26_90", cat: "mechanic", x: 11950.0, y: 6860.0, cell: [46, 26] },
  // Muldraugh auto mechanic & gas station
  { id: "41_41_99", cat: "mechanic", x: 10640.0, y: 10610.0, cell: [41, 41] },
  // Riverside auto repair shop
  { id: "24_20_99", cat: "mechanic", x: 6380.0, y: 5310.0, cell: [24, 20] }
];

let addedCount = 0;
additionalPois.forEach(poi => {
  const exists = data.buildings.some(b => b.id === poi.id);
  if (!exists) {
    data.buildings.push(poi);
    addedCount++;
  }
});

fs.writeFileSync(indexPath, JSON.stringify(data), 'utf-8');
console.log(`[SUCESSO] ${addedCount} novos POIs táticos (Mecânicos/Oficinas) adicionados a buildings_index.json! Total: ${data.buildings.length} prédios.`);
