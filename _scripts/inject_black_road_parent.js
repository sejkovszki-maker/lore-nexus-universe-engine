const fs = require('fs');

const parentArticle = {
  "book-the-black-road-reader": {
    id: "book-the-black-road-reader",
    category: "Lore / Könyvek - Olvasó",
    title: "A Gonosz Ösvénye",
    subtitle: "Mel Odom teljes regénye – Fejezetek",
    infobox: {
      "Szerző": "Mel Odom",
      "Eredeti cím": "The Black Road (2002)",
      "Főszereplő": "Darrick Lang",
      "Helyszín": "Westmarch, Tauruk kikötője"
    },
    content: `
      <h2>A regényről</h2>
      <p><strong>Diablo: A gonosz ösvénye</strong> (The Black Road) Mel Odom 2002-es Diablo regénye, a sorozat harmadik kötete. A cselekmény <em>Darrick Lang</em> westmarch-i tengerészkapitány körül forog, aki visszatér szülővárosába, ahol egy sötét démoni összeesküvéssel kerül szembe.</p>
      <p><em>Buyard Cholik</em>, egy korrupt Zakarum pap az elhagyatott Tauruk kikötője alatt rejtőző ősi romvárosban – Ransimban – dolgozik, hogy megnyissa a Gonosz Ösvényét (<em>The Black Road</em>), egy dimenzióközi kaput, amelyen át <strong>Kabraxis</strong>, egy hatalmas démon betörhet a halandók világába.</p>
      
      <h2>Fejezetek</h2>
      <div class="chapter-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-top: 15px;">
        ${Array.from({length: 25}, (_, i) => i + 1).map(n => {
          const id = `black-road-ch${n}`;
          return `<div onclick="openWikiArticle('${id}')" style="cursor:pointer; background: rgba(180,30,30,0.15); border: 1px solid rgba(180,30,30,0.4); border-radius: 8px; padding: 12px; text-align:center; transition: all 0.2s;" onmouseover="this.style.background='rgba(180,30,30,0.35)'" onmouseout="this.style.background='rgba(180,30,30,0.15)'">
            <i class="fas fa-book-open" style="color:#c0922a; margin-bottom:6px; display:block;"></i>
            <span style="font-family: var(--font-title); color: #fff; font-size:0.85rem;">${n}. Fejezet</span>
          </div>`;
        }).join('\n        ')}
        <div onclick="openWikiArticle('black-road-epilogue')" style="cursor:pointer; background: rgba(100,60,120,0.25); border: 1px solid rgba(150,80,180,0.4); border-radius: 8px; padding: 12px; text-align:center; transition: all 0.2s;" onmouseover="this.style.background='rgba(100,60,120,0.45)'" onmouseout="this.style.background='rgba(100,60,120,0.25)'">
          <i class="fas fa-scroll" style="color:#c0922a; margin-bottom:6px; display:block;"></i>
          <span style="font-family: var(--font-title); color: #fff; font-size:0.85rem;">Epilógus</span>
        </div>
      </div>
    `
  }
};

let d = fs.readFileSync('data.js', 'utf8');

// Find the position right before black-road-ch1
const insertBefore = '  "black-road-ch1":';
const idx = d.indexOf(insertBefore);
if (idx === -1) {
  console.error('Could not find black-road-ch1!');
  process.exit(1);
}

const articleStr = JSON.stringify(parentArticle["book-the-black-road-reader"], null, 4);
const toInsert = `  "book-the-black-road-reader": ${articleStr},\n\n`;

d = d.substring(0, idx) + toInsert + d.substring(idx);

fs.writeFileSync('data.js', d, 'utf8');
console.log("Parent Black Road article injected!");
