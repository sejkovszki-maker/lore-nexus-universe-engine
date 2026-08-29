const fs = require('fs');

// Normalize all category names in data.js to a clean, consistent set
let d = fs.readFileSync('data.js', 'utf8');

const categoryMap = {
  // Broken / duplicate / messy -> clean
  'Lore / Könyvek - Olvasó': 'Könyvek – Olvasó',
  'Lore / Könyvek & Regények': 'Könyvek – Olvasó',
  'Lore / Könyvek': 'Könyvek – Olvasó',
  'Könyvtár': 'Könyvek – Olvasó',
  'Könyvek, Iratok & Lore': 'Könyvek – Olvasó',
  'Lore / Karakterek - Olvasó': 'Karakterek – Olvasó',
  'Lore / Szereplők': 'Karakterek – Olvasó',
  'Lore / Történelem': 'Történeti Korszakok',
  'Lore / Könyvek & Regények': 'Könyvek – Olvasó',
  'Karakterek - Angyalok': 'Karakterek – Angyalok & Démonok',
  'Karakterek - Démonok': 'Karakterek – Angyalok & Démonok',
  'Karakterek - Nephalem & Emberek': 'Karakterek – Emberek & Nephalem',
  'Tárgyak & Ereklyék': 'Ereklyék & Tárgyak',
  'Világ & Helyszínek': 'Helyszínek',
  'Főgonoszok': 'Karakterek – Angyalok & Démonok',
  'Szereplők': 'Karakterek – Emberek & Nephalem',
  'Ereklyék': 'Ereklyék & Tárgyak',
  'Játékmechanika & Ereklyék': 'Ereklyék & Tárgyak',
  'Fogalmak': 'Fő Enciklopédia',
  'Közösség & Fórumok': 'Közösség & Útmutatók',
};

let count = 0;
for (const [from, to] of Object.entries(categoryMap)) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`"category":\\s*"${escaped}"`, 'g');
  const matches = (d.match(re) || []).length;
  if (matches > 0) {
    d = d.replace(re, `"category": "${to}"`);
    console.log(`  "${from}" -> "${to}" (${matches} changes)`);
    count += matches;
  }
}
// Also fix category inside template literals (category: "...")
for (const [from, to] of Object.entries(categoryMap)) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`category:\\s*"${escaped}"`, 'g');
  const matches = (d.match(re) || []).length;
  if (matches > 0) {
    d = d.replace(re, `category: "${to}"`);
    console.log(`  (template) "${from}" -> "${to}" (${matches} changes)`);
    count += matches;
  }
}

fs.writeFileSync('data.js', d, 'utf8');
console.log(`\nTotal: ${count} category renames done.`);
