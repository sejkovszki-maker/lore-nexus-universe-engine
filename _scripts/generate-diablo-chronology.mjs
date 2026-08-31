import fs from 'node:fs';
import path from 'node:path';

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) throw new Error('Usage: node generate-diablo-chronology.mjs <note.txt> <output.ts>');
const text = fs.readFileSync(sourcePath, 'utf8');
const block = text.split('4. FŐ ESEMÉNYSORREND')[1]?.split('5. FORRÁSBIZTONSÁGI RENDSZER')[0];
if (!block) throw new Error('Chronology block not found');
const eraNames = [
  'Kozmogónia / The Dawn','Eternal Conflict','Sanctuary megteremtése','A korai emberiség','Sin War','Age of Magic','Mage Clan Wars','Age of Faith','Dark Exile','Horadrim és a Főgonoszok bebörtönzése','Tristram bukása / Diablo I','Diablo II','Diablo II: Lord of Destruction','Diablo Immortal','Diablo III / End of Days','Diablo III: Reaper of Souls','A Diablo III utáni hanyatlás / Great Enmity','Diablo IV / Age of Hatred','Vessel of Hatred','Lord of Hatred / jelenlegi fő történetszál'
];
const eraIds = ['cosmology','eternal-conflict','sanctuary-creation','early-humanity','sin-war','age-of-magic','mage-clan-wars','age-of-faith','dark-exile','horadrim','diablo-1','diablo-2','lord-of-destruction','diablo-immortal','diablo-3','reaper-of-souls','great-enmity','diablo-4','vessel-of-hatred','lord-of-hatred'];
const roman = new Map('I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX'.split(' ').map((value, index) => [value, index + 1]));
let eraOrder = 0;
const rows = [];
for (const raw of block.split(/\r?\n/)) {
  const heading = raw.trim().match(/^([IVX]+)\.\s/);
  if (heading && roman.has(heading[1])) { eraOrder = roman.get(heading[1]); continue; }
  const match = raw.trim().match(/^(\d{3})\.\s+(.+)$/);
  if (!match || !eraOrder) continue;
  const eventOrder = Number(match[1]);
  const original = match[2].trim();
  const dateMatch = original.match(/^(?:kb\.\s*)?(-?\d{1,4})(?:\s*AK)?\s*[–—-]\s*(.+)$/i);
  const relativeMatch = original.match(/^(.+?)(?:\s*[–—-]\s*)(öt évvel|közvetlenül|modern kronológia szerint)(.+)$/i);
  let title = dateMatch?.[2] || original;
  let dateDisplay = dateMatch ? original.slice(0, original.length - title.length).replace(/[–—-]\s*$/, '').trim() : '';
  if (!dateMatch && relativeMatch) dateDisplay = relativeMatch[2] + relativeMatch[3];
  const dateSortKey = dateMatch ? Number(dateMatch[1]) : undefined;
  const approximate = /^kb\./i.test(original) || /körül|modern kronológia/i.test(original);
  const dateStatus = dateMatch ? (approximate ? 'approximate' : 'exact') : (/után|előtt|közvetlenül|kezdet|következmény/i.test(original) ? 'relative' : 'unknown');
  const canonStatus = eventOrder >= 183 ? 'canon_with_uncertainty' : (dateStatus === 'exact' && eventOrder < 123 ? 'canon_with_uncertainty' : 'canon');
  const primaryUrl = eventOrder >= 123 && eventOrder <= 127 ? 'https://news.blizzard.com/en-us/article/23557147/diablo-immortal-gameplay-overview-everything-you-need-to-know' : eventOrder >= 179 ? 'https://diablo4.blizzard.com/lord-of-hatred' : undefined;
  const keywords = (values) => values.filter(value => original.toLocaleLowerCase('hu').includes(value.toLocaleLowerCase('hu')));
  const characters = keywords(['Anu','Tathamet','Inarius','Lilith','Uldyssian','Mephisto','Diablo','Baal','Tyrael','Tal Rasha','Leoric','Lazarus','Albrecht','Aidan','Andariel','Duriel','Bartuc','Horazon','Skarn','Deckard Cain','Leah','Zoltun Kulle','Belial','Azmodan','Adria','Malthael','Lorath','Donan','Elias','Rathma','Neyrelle','Eru','Akarat']);
  const locations = keywords(['High Heavens','Burning Hells','Pandemonium','Sanctuary','Viz-jun','Kehjistan','Kurast','Khanduras','Tristram','Lut Gholein','Mount Arreat','Harrogath','Westmarch','Nahantu','Skovos']);
  const factions = keywords(['Angiris Council','Prime Evils','Lesser Evils','Triune','Cathedral of Light','Edyrem','Vizjerei','Ennead','Ammuit','Viz-Jaq\'taar','Zakarum','Horadrim']);
  const items = keywords(['Worldstone','Soulstone','Black Soulstone']);
  const games = eraOrder === 11 ? ['Diablo I'] : eraOrder === 12 ? ['Diablo II'] : eraOrder === 13 ? ['Diablo II: Lord of Destruction'] : eraOrder === 14 ? ['Diablo Immortal'] : eraOrder === 15 ? ['Diablo III'] : eraOrder === 16 ? ['Diablo III: Reaper of Souls'] : eraOrder >= 18 ? ['Diablo IV'] : [];
  const articleId = eventOrder <= 10 ? 'kozmogonia' : eventOrder >= 88 && eventOrder <= 103 ? 'tristram' : eventOrder >= 156 && eventOrder <= 169 ? 'lilith' : eventOrder >= 170 && eventOrder <= 178 ? 'nahantu' : eventOrder >= 179 ? 'mephisto' : undefined;
  rows.push({ id: `diablo-event-${String(eventOrder).padStart(3,'0')}`, universeId:'diablo', eraId:eraIds[eraOrder-1], eraName:eraNames[eraOrder-1], eraOrder, eventOrder, title, summary:title, dateDisplay, ...(dateSortKey === undefined ? {} : {dateSortKey}), dateStatus, canonStatus, sourcePriority: primaryUrl ? 'primary_blizzard' : 'secondary_reference', retconned:false, characters, locations, factions, items, games, books:[], relatedEvents:[], ...(articleId ? {articleId} : {}), sources: primaryUrl ? [{label:'Blizzard hivatalos történeti tájékoztató',url:primaryUrl,kind:'primary_blizzard'}] : [{label:'Lore Nexus kronológiai ellenőrzési jegyzet (2026-08-30)',kind:'editorial_audit'}], needsSourceAudit:!primaryUrl, spoilerLevel: eventOrder >= 170 ? 2 : eventOrder >= 156 ? 1 : 0 });
}
if (rows.length !== 184 || eraOrder !== 20) throw new Error(`Expected 184 events/20 eras, got ${rows.length}/${eraOrder}`);
for (let i=0;i<rows.length;i++) { if (i) rows[i].previousEventId=rows[i-1].id; if (i<rows.length-1) rows[i].nextEventId=rows[i+1].id; }
const eras = eraNames.map((name,index)=>({id:eraIds[index],name,order:index+1}));
const output = `import type { TimelineEra, TimelineEvent } from '../timeline/types.ts';\n\nexport const diabloTimelineEras: TimelineEra[] = ${JSON.stringify(eras,null,2)};\n\nexport const diabloTimelineEvents: TimelineEvent[] = ${JSON.stringify(rows,null,2)};\n`;
fs.mkdirSync(path.dirname(outputPath), {recursive:true});
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${rows.length} events in ${eras.length} eras.`);
