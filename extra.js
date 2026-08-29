// ==========================================
// 1. PWA REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker regisztrálva!', reg))
      .catch(err => console.error('Service Worker hiba:', err));
  });
}

// ==========================================
// 2. READING PROGRESS & BOOKMARK
// ==========================================
window.continueReading = function() {
  const lastArticle = localStorage.getItem('diablo_lastArticle');
  if (lastArticle && wikiArticles[lastArticle]) {
    openWikiArticle(lastArticle);
  } else {
    // Default to Sin War Ch1 if no bookmark
    openWikiArticle('sin-war-birthright-ch1');
  }
};

// Point 1: Event Emitter architektúra - nincs több monkey-patching
document.addEventListener('articleOpened', (e) => {
  const articleId = e.detail.articleId;
  
  // Save as last read
  localStorage.setItem('diablo_lastArticle', articleId);
  updateReadingBtnText();

  // Add progress bar if it doesn't exist
  let progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) {
    const barContainer = document.createElement('div');
    barContainer.style.position = 'fixed';
    barContainer.style.top = '0';
    barContainer.style.left = '0';
    barContainer.style.width = '100%';
    barContainer.style.height = '4px';
    barContainer.style.background = 'rgba(255,255,255,0.1)';
    barContainer.style.zIndex = '9999';

    progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    progressBar.style.height = '100%';
    progressBar.style.width = '0%';
    progressBar.style.background = 'var(--accent-red)';
    progressBar.style.transition = 'width 0.2s';
    
    barContainer.appendChild(progressBar);
    document.body.appendChild(barContainer);
  }

  // Restore scroll position
  setTimeout(() => {
    const savedScroll = localStorage.getItem('diablo_scroll_' + articleId);
    if (savedScroll) {
      window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });
    }
  }, 300);
});

// Point 2: Teljesítményoptimalizált Scroll (requestAnimationFrame + Debounce)
let ticking = false;
let scrollSaveTimeout = null;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const lastArticle = localStorage.getItem('diablo_lastArticle');
      if (document.getElementById('view-wiki-articles').style.display !== 'none' && document.getElementById('wiki-article-display').style.display !== 'none') {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
        
        const progressBar = document.getElementById('reading-progress-bar');
        if (progressBar) progressBar.style.width = scrolled + '%';

        // Debounced save (Point 2)
        if (lastArticle) {
          clearTimeout(scrollSaveTimeout);
          scrollSaveTimeout = setTimeout(() => {
            localStorage.setItem('diablo_scroll_' + lastArticle, winScroll);
          }, 500); // 500ms debounce
        }
      }
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

function updateReadingBtnText() {
  const lastArticle = localStorage.getItem('diablo_lastArticle');
  const btn = document.getElementById('reading-btn-text');
  if (btn && lastArticle && typeof wikiArticles !== 'undefined' && wikiArticles[lastArticle]) {
    btn.innerHTML = 'Folytatás: ' + wikiArticles[lastArticle].title;
  }
}
updateReadingBtnText();

// ==========================================
// 3. SMART GLOSSARY TOOLTIPS
// ==========================================
// Point 6: Szótár adatok dinamizálása
const loreGlossary = {};
if (typeof wikiArticles !== 'undefined') {
  Object.keys(wikiArticles).forEach(key => {
    const art = wikiArticles[key];
    if (['Karakterek', 'Főgonoszok', 'Angyalok', 'Démonok', 'Frakciók'].includes(art.category)) {
      // Csak az első nevet vesszük, pl. 'Tyrael (Igazság)' -> 'Tyrael'
      const baseName = art.title.split(' ')[0].replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, '');
      if (baseName.length > 2) {
        loreGlossary[baseName] = art.subtitle || 'Kattints a cikkre a részletekért...';
      }
    }
  });
}

// Point 9: RegExp pre-kompilálás a sebességért
const glossaryTerms = Object.keys(loreGlossary);
// Note: escaping regex special characters if any
const escapedTerms = glossaryTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const glossaryRegex = new RegExp(`\\b(${escapedTerms.join('|')})[a-záéíóöőúüű]*\\b`, 'gi');

// Point 1 & Point 17: Eseményalapú működés és DOM TreeWalker a tooltipekhez HTML törés nélkül
document.addEventListener('articleRendered', (e) => {
  const container = e.detail.container;
  if (!container) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  const nodesToReplace = [];
  
  let node;
  while (node = walker.nextNode()) {
    if (node.parentNode && (node.parentNode.classList.contains('lore-tooltip') || node.parentNode.classList.contains('tooltip-text') || node.parentNode.tagName === 'A')) {
      continue;
    }
    
    // Alap regex test (gyors szűrés)
    glossaryRegex.lastIndex = 0;
    if (glossaryRegex.test(node.nodeValue)) {
      nodesToReplace.push(node);
    }
  }

  nodesToReplace.forEach(textNode => {
    const parent = textNode.parentNode;
    const text = textNode.nodeValue;
    const fragment = document.createDocumentFragment();
    
    let lastIndex = 0;
    let match;
    glossaryRegex.lastIndex = 0;
    
    while ((match = glossaryRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      const matchedWord = match[0];
      // Megkeressük a pontos base termet a glossary-ból
      const baseTerm = glossaryTerms.find(t => matchedWord.toLowerCase().startsWith(t.toLowerCase()));
      
      if (baseTerm) {
        const span = document.createElement('span');
        span.className = 'lore-tooltip';
        span.textContent = matchedWord;
        
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.innerHTML = `<strong>${baseTerm}:</strong> ${loreGlossary[baseTerm]}`;
        span.appendChild(tooltip);
        
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(matchedWord));
      }
      
      lastIndex = glossaryRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    parent.replaceChild(fragment, textNode);
  });
});

// Add touch support for tooltips (Point 11)
window.addEventListener('click', (e) => {
  const isTooltip = e.target.closest('.lore-tooltip');
  document.querySelectorAll('.lore-tooltip').forEach(tt => {
    if (tt !== isTooltip) tt.classList.remove('active');
  });
  if (isTooltip) {
    isTooltip.classList.toggle('active');
  }
});

// ==========================================
// 4. LORE MAP (VIS-NETWORK)
// ==========================================

window.initLoreNetwork = function() {
  const container = document.getElementById('lore-network');
  if (!container) return;
  
  if (typeof vis === 'undefined') {
    container.textContent = 'Hálózat betöltése (Lusta betöltés folyamatban)...';
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    script.onload = () => {
      container.textContent = '';
      window.initLoreNetwork(); // Retry initialization after load
    };
    script.onerror = () => {
      container.textContent = 'Hiba a térkép betöltésekor. Kérjük, ellenőrizd az internetkapcsolatot.';
    };
    document.head.appendChild(script);
    return;
  }

    // Point 7: Dinamikus gráf generálás cikk metaadatokból (hardkódolt élek és csomópontok megszüntetése)
  const dynamicNodes = [];
  const dynamicEdges = [];
  const existingNodes = new Set();

  if (typeof wikiArticles !== 'undefined') {
    Object.keys(wikiArticles).forEach(key => {
      const art = wikiArticles[key];
      // Csak releváns kategóriákat teszünk be alapból, plusz azokat, amiknek van kapcsolatuk
      if (['Karakterek', 'Főgonoszok', 'Angyalok', 'Démonok', 'Helyszínek', 'Tárgyak'].includes(art.category) || (art.relatedArticles && art.relatedArticles.length > 0)) {
        if (!existingNodes.has(key)) {
          dynamicNodes.push({
            id: key,
            label: art.title.split(' ').join('\n'), // Sortörés a jobb olvashatóságért
            group: art.category === 'Angyalok' ? 'angels' : (['Démonok', 'Főgonoszok'].includes(art.category) ? 'demons' : (art.category === 'Helyszínek' ? 'world' : 'humans')),
            title: art.subtitle || art.title,
            articleId: key
          });
          existingNodes.add(key);
        }
        
        if (art.relatedArticles) {
          art.relatedArticles.forEach(rel => {
            dynamicEdges.push({ from: key, to: rel });
            
            // Ha a cél node még nem létezik, létrehozzuk placeholderként, nehogy vis.js hiba legyen
            if (!existingNodes.has(rel) && wikiArticles[rel]) {
              const relArt = wikiArticles[rel];
              dynamicNodes.push({
                id: rel,
                label: relArt.title.split(' ').join('\n'),
                group: relArt.category === 'Angyalok' ? 'angels' : (['Démonok', 'Főgonoszok'].includes(relArt.category) ? 'demons' : 'humans'),
                title: relArt.subtitle,
                articleId: rel
              });
              existingNodes.add(rel);
            }
          });
        }
      }
    });
  }

  const nodes = new vis.DataSet(dynamicNodes);
  const edges = new vis.DataSet(dynamicEdges);

  const data = { nodes: nodes, edges: edges };
  const options = {
    nodes: {
      shape: 'dot',
      size: 22,
      font: { color: '#ffffff', face: 'Arial, Helvetica, sans-serif', size: 16, background: 'rgba(10, 8, 9, 0.75)' },
      borderWidth: 2,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', size: 10, x: 0, y: 0 }
    },
    edges: {
      width: 2,
      smooth: { type: 'cubicBezier', forceDirection: 'none', roundness: 0.5 },
      color: { color: 'rgba(212,175,55,0.3)', highlight: '#d4af37', hover: '#dc2626' },
      font: { color: '#cbd5e1', size: 11, align: 'middle', background: 'rgba(10,8,9,0.8)' },
      arrows: { to: { enabled: true, scaleFactor: 0.6 } }
    },
    groups: {
      gods: { color: { background: '#f59e0b', border: '#b45309' }, shadow: { color: '#f59e0b', size: 15 } },
      angels: { color: { background: '#3b82f6', border: '#1d4ed8' }, shadow: { color: '#3b82f6', size: 15 } },
      demons: { color: { background: '#dc2626', border: '#991b1b' }, shadow: { color: '#dc2626', size: 15 } },
      humans: { color: { background: '#10b981', border: '#047857' }, shadow: { color: '#10b981', size: 15 } },
      world: { color: { background: '#8b5cf6', border: '#6d28d9' }, shadow: { color: '#8b5cf6', size: 20 } }
    },
    physics: {
      barnesHut: { gravitationalConstant: -20000, centralGravity: 0.2, springLength: 150, springConstant: 0.05, damping: 0.09 },
      stabilization: { iterations: 200 }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
      dragView: true
    }
  };

  const network = new vis.Network(container, data, options);
  
  network.on("click", function (params) {
    const infoBox = document.getElementById('node-info-box');
    if (!infoBox) return;
    
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = nodes.get(nodeId);
      
      document.getElementById('node-info-title').textContent = node.label.replace(/\n/g, ' ');
      
      let groupName = 'Egyéb / Frakció';
      if (node.group === 'gods') groupName = 'Istenek / Kozmikus Erők';
      else if (node.group === 'angels') groupName = 'Angyalok (Magas Mennyek)';
      else if (node.group === 'demons') groupName = 'Démonok (Lángoló Poklok)';
      else if (node.group === 'humans') groupName = 'Emberek / Nephalem';
      else if (node.group === 'world') groupName = 'Világok és Helyszínek';
      
      document.getElementById('node-info-group').textContent = groupName;
      document.getElementById('node-info-desc').innerHTML = node.title ? node.title : "Nincs bővebb leírás.";
      
      const btn = document.getElementById('node-info-btn');
      if (node.articleId) {
        btn.style.display = 'block';
        btn.onclick = function() { 
          if(typeof window.openWikiArticle === 'function') window.openWikiArticle(node.articleId); 
        };
      } else {
        btn.style.display = 'none';
      }
      
      infoBox.style.display = 'block';
    } else {
      infoBox.style.display = 'none';
    }
  });

}

// ==========================================
// 5. DEEP LORE ARTICLES (SIN WAR)
// ==========================================
const sinWarArticles = {
  "sin-war-uldyssian": {
    id: "sin-war-uldyssian",
    category: "Szereplők",
    title: "Uldyssian ul-Diomed: A Nephalem Ébredése",
    subtitle: "A farmer, aki megfordította az Örök Konfliktus kimenetelét és felébresztette a Nephalem potenciált.",
    infobox: {
      "Teljes név": "Uldyssian ul-Diomed",
      "Származás": "Seram (Menedék)",
      "Titulus": "Az Első Nephalem (Ébredt)",
      "Kapcsolatok": "Mendeln (öccse), Lylia (szeretője/manipulátora)",
      "Végzet": "Feláldozta magát, hogy megmentse a világot a szakadástól"
    },
    content: `
Egy egyszerű földművesből a világ legerősebb lényévé vált. Uldyssian élete tragikus és epikus, hiszen tudtán kívül lett Inarius és Lilith sakktáblájának legfontosabb figurája.

### A Kezdetek és a Bűn
Uldyssian gyűlölte a szektákat (a Triune-t és a Fény Katedrálisát), miután a családját ért tragédiákért közvetve a vallási fanatizmust okolta. Amikor Lylia (aki valójában Lilith álcázva) megjelent az életében, szándékosan gyilkosságok gyanújába keverte őt. Lylia célja az volt, hogy Uldyssianban a stressz és a manipuláció felélessze a szunnyadó Nephalem erőt.

### Az Edyrem Felemelkedése
Uldyssian rájött, hogy képes manipulálni az anyagot, az időjárást és mások elméjét. Ami még félelmetesebb volt a démonok és angyalok számára: képessé vált arra, hogy más emberekben is felébressze a Nephalem örökséget. Ĺk lettek az Edyrem, a szekták elleni háború hadserege.

### A Világkő és a Végső íldozat
A Bűnök Háborújának csúcspontján Uldyssian ereje már akkora volt, hogy egyedül képes lett volna elpusztítani Inariust, Luciont és talán magukat a Főgonoszokat is. ím rájött, hogy az ereje egyben szét is szakítja Menedék világát. Hogy megmentsen mindenkit, akit szeretett, Uldyssian visszaszívta magába a végtelen energiát, és hagyta, hogy az elpusztítsa az ő fizikai formáját, ezzel resetelve a világ egyensúlyát, és bizonyítva Tyraelnek, hogy az emberiség méltó a túlélésre.
`
  },
  "sin-war-mendeln": {
    id: "sin-war-mendeln",
    category: "Szereplők",
    title: "Mendeln ul-Diomed: Az Első Nekromanta",
    subtitle: "Rathma tanítványa, az Egyensúly őrzője, a halál és élet mágiájának mestere.",
    infobox: {
      "Teljes név": "Mendeln ul-Diomed (Kalan)",
      "Származás": "Seram",
      "Titulus": "Az Első Priests of Rathma (Nekromanta)",
      "Mestere": "Rathma (Linarian) és Trag'Oul",
      "Kapcsolatok": "Uldyssian (bátyja)"
    },
    content: `
Míg bátyja, Uldyssian a fény és a nyers energia útját járta, Mendeln a csendesebb, sötétebb ösvényre lépett. Az ő sorsa nem a pusztítás volt, hanem az Egyensúly megértése.

### Trag'Oul és Rathma
Mendelnt vonzotta a halál misztériuma. Hamarosan találkozott a rejtélyes Rathmával, Inarius és Lilith legelső gyermekével, aki elvezette őt Trag'Oul-hoz, a Menedék védelmező sárkányához. Mendeln itt tanulta meg az Egyensúly (Balance) doktrínáját, miszerint a világnak se a Menny, se a Pokol uralma alá nem szabad kerülnie.

### A Nekromanták Rendje
Mendeln átvette a *Kalan* (Mester) nevet, és ő lett a Priests of Rathma, vagyis a Nekromanták rendjének megalapítója a keleti mocsarakban. Ĺ írta a *Books of Kalan* című grimoire-okat, amikből a Diablo 2 és 3 nekromantái is tanultak. Mendeln képes volt kommunikálni a holtakkal, és olyan csont/vér mágiát használt, amely egyenesen Trag'Oul kozmikus erejéből táplálkozott.
`
  },
  "sin-war-triune": {
    id: "sin-war-triune",
    category: "Frakciók",
    title: "A Triune: A Háromság Sötét Temploma",
    subtitle: "A vallás, ami a Békét hirdette, miközben a Főgonoszokat imádta.",
    infobox: {
      "Vezető": "Lucion (Primus)",
      "Főpap": "Malic",
      "Istenségek": "Dialon (Diablo), Bala (Baal), Mefis (Mephisto)",
      "Ellenpólus": "A Fény Katedrálisa (Inarius)"
    },
    content: `
A Menedék korai történetében az Örök Konfliktus nem csatatereken, hanem az emberek elméjéért vívott vallási háborúban zajlott. Ennek a háborúnak a démoni eszköze volt a Triune.

### A Három Szellem
A szekta kifelé egy békés vallásnak tűnt, amely három istenséget tisztelt:
- **Dialon** (a Határozottság Szelleme, valójában Diablo)
- **Bala** (a Teremtés Szelleme, valójában Baal)
- **Mefis** (a Szerelem Szelleme, valójában Mephisto)

A hívők nem tudták, hogy valójában a Három Főgonoszt imádják.

### Lucion és Malic
A szektát Mephisto fia, Lucion vezette Primus néven, egy alakváltó démon, aki elbűvölő és megnyugtató férfinak álcázta magát. Jobbkeze, Malic, a sötét varázslatok és a bérgyilkosságok mestere volt. A Triune véráldozatokat és agymosást használt a kulisszák mögött, hogy lassan az egész világot a Burning Hells uralma alá hajtsa. A Triune volt az első igazi szervezett démonimádó kultusz a világon, amelynek maradványai egészen a Diablo IV koráig fennmaradtak.
`
  }
};

const demonsbaneArticles = {
  "demonsbane-novel": {
    id: "demonsbane-novel",
    category: "Lore / Könyvek & Regények",
    title: "Demonsbane (A Démonok Csapása)",
    subtitle: "Robert B. Marks első Diablo e-könyve",
    infobox: {
      "Szerző": "Robert B. Marks",
      "Kiadás éve": "2000",
      "Főszereplő": "Siggard",
      "Főgonosz": "Assur (A Pokol Bárója)",
      "Helyszín": "Entsteig, Blackmarch, Brennor"
    },
    content: `
A **Demonsbane** (A Démonok Csapása) a Blizzard Entertainment első Diablo témájú e-könyve, melyet Robert B. Marks írt. A történet a Magas Mennyek és a Lángoló Poklok közötti örök konfliktus halandó birodalomba való beszivárgását mutatja be.

### A Lelkek Éjszakája
Siggard, a bátor katona, aki az *entsteigi* démoni invázió elleni katasztrofális *Blackmarch-i* csata egyetlen túlélője, a mészárlás kísérteties emlékeivel küzd. A csatatéren ébredve találkozik a titokzatos **Tyrael** arkangyallal, aki figyelmezteti őt a természetfeletti veszélyekre. Siggard célja, hogy hazatérjen családjához, feleségéhez, Emilye-hez.

### Az írulás és a Gyász
Útja során találkozik egy *Sarnakyle* nevű Vizjerei varázslóval, aki csatlakozik hozzá. Siggard falujába érve szörnyű látvány fogadja: a falut feldúlták, a lakosokat – köztük feleségét is – brutálisan meggyilkolták. Kiderül a sötét titok: a falu néhány túlélője (köztük egykori barátja, Tylwulf) elárulta őket, és lepaktált a démonokkal hatalomért cserébe. Siggard vak dühében végez az árulókkal.

### A Felkészülés és a Végjáték
Siggard és Sarnakyle *Brennor* erődített városába sietnek, hogy figyelmeztessék Tilgar grófot egy közeledő hatalmas démoni seregre, melyet a Pokol egyik bárója, **Assur** vezet. Siggard egy ősi temetkezési halomban rátalál a legendás **Guthbreoht** nevű kardra, amely elfogadja őt új urának.
A végső csatában Siggard és a varázsló megvédik a várost. Siggard szembeszáll magával Assurral, a fődémonnal, hogy bosszút álljon elesett szeretteiért és megmentse a világot a pusztulástól.
`
  },
  "lore-siggard": {
    id: "lore-siggard",
    category: "Szereplők",
    title: "Siggard, a Démonvadász",
    subtitle: "A Blackmarch-i mészárlás túlélője, a Guthbreoht kard forgatója",
    infobox: {
      "Származás": "Entsteig környéke",
      "Foglalkozás": "Katona, Démonvadász",
      "Család": "Emilye (felesége, elhunyt)",
      "Fegyver": "Guthbreoht (Mágikus kard)"
    },
    content: `
Siggard egy veterán katona, aki Earl Edgewulf seregében szolgált a *Blackmarch* közelében vívott csatában. Miután egy démoni sereg lemészárolta az egységét, ő maradt az egyetlen túlélő.

### A Bosszú Útja
A *Demonsbane* története szerint Siggard amnéziásan és sebesülten ébred a Lelkek Éjszakáján. Útja során hazatér falujába, csak hogy szembesüljön a legrosszabbal: a démonok, néhány áruló falusi segítségével, lemészárolták a lakosságot, köztük szerelmét, Emilye-t is. A gyász és a bosszúvágy hajtja őt tovább.

### A Guthbreoht Kard
Siggard Brennor városa felé tartva egy ősi temetkezési halomban egy különleges, rúnákkal borított fegyverre lel. A kard, melynek neve **Guthbreoht**, mágikus hatalommal bír, és szinte hívja Siggardot. Miután Siggard a nevén szólítja a fegyvert, a csontváz őrök meghajolnak előtte, és ő válik a kard új mesterévé. Ezzel az isteni erővel felvértezve képes szembeszállni a Pokol bárójával, Assurral.
`
  },
  "lore-sarnakyle": {
    id: "lore-sarnakyle",
    category: "Szereplők",
    title: "Sarnakyle",
    subtitle: "A Vizjerei Varázsló, Siggard mentora",
    infobox: {
      "Származás": "Kehjistan",
      "Foglalkozás": "Vizjerei Varázsló",
      "Társ": "Siggard"
    },
    content: `
Sarnakyle egy magas, sötét bőrű *Vizjerei* varázsló, aki a *Demonsbane* regényben Siggard hűséges útitársává és tanácsadójává válik.

### A Bölcs Stratéga
Ahelyett, hogy vakon belemennének a küzdelembe, Sarnakyle stratégiai gondolkodása segíti életben tartani Siggardot. Ĺ figyelmezteti őt az árulásra Tylwulf házában, és ő javasolja, hogy Brennor erődített városában keressenek menedéket és szervezzék meg az ellenállást.

### Mágikus Hatalom
Bár Sarnakyle fizikailag nem tűnik harcosnak, mágiája félelmetes. Képes puszta akaratával tüzet gyújtani, és a csaták során pusztító villámokat idéz meg, amikkel démonok tömegeit hamvasztja el, fedezetet nyújtva Siggard közelharci rohamainak.
`
  },
  "lore-assur": {
    id: "lore-assur",
    category: "Szereplők",
    title: "Assur, a Pokol Bárója",
    subtitle: "A Terror Urának kegyeltje, a Brennor elleni sereg vezére",
    infobox: {
      "Származás": "Lángoló Poklok",
      "Foglalkozás": "Fődémon (Archdemon)",
      "Képesség": "Sebezhetetlenséget adó rúna",
      "Végzete": "Siggard ölte meg"
    },
    content: `
Assur egy hatalmas fődémon (Archdemon), akit a Pokol Bárójaként és a Terror Urának, Diablónak az egyik kegyeltjeként tartanak számon a *Demonsbane* regényben.

### A Sebezhetetlen Démon
Assur igazi ereje nem csak fizikai erejében rejlett, hanem egy különleges varázsjelben (glyph), amely szinte teljesen sebezhetetlenné tette őt a halandók fegyvereivel szemben. Hatalmas, több ezer fős démoni seregével lerohanta és elpusztította a Blackmarch körüli falvakat, majd Brennor városát vette célba.

### A Végzet
Assur végső célja a halandó birodalom destabilizálása volt, ám Brennor ostrománál Siggard, a bosszúszomjas túlélő, a mágikus Guthbreoht kard segítségével képes volt áttörni a démon sebezhetetlenségén. Assur halálakor emberi holttestté változott, ami nyugtalanító kérdéseket vetett fel a démonok és halandók közös természetéről.
`
  },
  "lore-guthbreoht": {
    id: "lore-guthbreoht",
    category: "Tárgyak",
    title: "Guthbreoht",
    subtitle: "Az ősi mágikus rúnakard",
    infobox: {
      "Típus": "Mágikus Kard",
      "Forgató": "Siggard",
      "Lelőhely": "Ĺsi temetkezési halom"
    },
    content: `
A **Guthbreoht** egy ősi, mágikus energiákkal és rúnákkal borított kard, amely kulcsszerepet játszik Siggard küldetésében a *Demonsbane* regényben.

### A Fegyver Megtalálása
Amikor Siggard és Sarnakyle Brennor felé tartva menedéket keresnek egy vihar elől egy barrow-ban (ősi temetkezési halom), Siggard megmagyarázhatatlan vonzódást érez a sírbolt mélyén nyugvó fegyver iránt. Amikor kezébe veszi és a nevén szólítja a kardot, a sírt védelmező csontváz-őrzők fejet hajtanak előtte. A fegyver elfogadja őt új mesterének.

### Hatalom a Démonok Felett
A Guthbreoht nem egy egyszerű kard. Varázslatos tulajdonságai révén képes áthatolni Assur, a fődémon sebezhetetlenséget biztosító rúnáján, így adva esélyt a halandó Siggardnak arra, hogy felvegye a harcot a Pokol seregével.
`
  },
  "lore-brennor": {
    id: "lore-brennor",
    category: "Helyszínek",
    title: "Brennor és Blackmarch",
    subtitle: "A Demonsbane regény kulcsfontosságú helyszínei",
    infobox: {
      "Régió": "Kehjistan határvidéke",
      "Uradalom": "Earl Tilgar",
      "Esemény": "Blackmarch-i mészárlás"
    },
    content: `
A *Demonsbane* eseményei az emberek által lakott vidékeken, elsősorban **Blackmarch** mocsaras vidékein és **Brennor** erődített városában játszódnak.

### Blackmarch
Blackmarch egy komor terület Entsteig közelében. Itt csapott össze Earl Edgewulf emberi serege a váratlanul támadó démoni hordával. Az emberi haderő szinte teljesen megsemmisült, maga az Earl is elesett. Az egyetlen túlélő Siggard volt.

### Brennor
Brennor egy erős kőfalakkal védett város, melynek vezetését Edgewulf halála után fia, Earl Tilgar vette át. A város volt az emberiség utolsó bástyája a régióban Assur több ezer fős démoni seregével szemben. Siggard és Sarnakyle ide vonultak vissza, hogy megszervezzék a védelmet, és itt került sor a végső összecsapásra Assurral.
`
  }
};

(function() {
  if (typeof wikiArticles !== 'undefined') {
    Object.assign(wikiArticles, sinWarArticles, demonsbaneArticles);
  }

  window.loreHighlights = [
    {
      title: "Uldyssian ul-Diomed: A Nephalem Ébredése",
      category: "Szereplők",
      articleId: "sin-war-uldyssian",
      desc: "A farmer, aki megfordította az Örök Konfliktus kimenetelét és felébresztette a Nephalem potenciált."
    },
    {
      title: "Mendeln ul-Diomed: Az Első Nekromanta",
      category: "Szereplők",
      articleId: "sin-war-mendeln",
      desc: "Rathma tanítványa, az Egyensúly őrzője, a halál és élet mágiájának mestere."
    },
    {
      title: "A Triune: A Háromság Sötét Temploma",
      category: "Frakciók",
      articleId: "sin-war-triune",
      desc: "A békés vallásnak álcázott sötét szekta, ami valójában Diablót, Baalt és Mephistót imádta."
    },
    {
      title: "Siggard, a Démonvadász",
      category: "Szereplők",
      articleId: "lore-siggard",
      desc: "A Blackmarch-i mészárlás egyetlen túlélője, aki bosszút esküdött a Pokol seregei ellen."
    }
  ];

  window.diabloWikiHub = {
    title: "Diablo Kánon & Közösségi Tudástár",
    description: "Itt találod a legfontosabb magyar rajongói oldalakat, hivatalos Blizzard linkeket és a Diablo univerzum mélyebb összefüggéseit bemutató adatbázisokat.",
    hungarianSites: [
      { url: "https://diablo.hu", title: "Diablo.hu", desc: "A legnagyobb és legrégebbi magyar Diablo közösségi portál és hírforrás." }
    ],
    games: [
      { url: "https://diablo4.blizzard.com/hu-hu/", title: "Diablo IV", desc: "Hivatalos weboldal" },
      { url: "https://diablo3.blizzard.com/hu-hu/", title: "Diablo III", desc: "Hivatalos weboldal" },
      { url: "https://diablo2.blizzard.com/hu-hu/", title: "Diablo II: Resurrected", desc: "Hivatalos weboldal" }
    ],
    entities: [],
    allClasses: [],
    realms: [],
    factions: [],
    books: [],
    externalLinks: []
  };

  window.diablo1GameWiki = {
    title: "Diablo I (1996) & Hellfire",
    description: "Ahol minden elkezdődött. Tristram városa alatt egy ősi gonosz ébredt fel...",
    releaseDate: "1996. December 31.",
    classes: ["Warrior", "Rogue", "Sorcerer", "Monk (Hellfire)"],
    gameplayFeatures: ["Procedurális dungeonök", "Gótikus atmoszféra", "Nagy kihívás", "PvP lehetőség"],
    keyCharacters: ["Aidan", "Deckard Cain", "Griswold", "Diablo", "Lazarus"]
  };

  window.diablo2GameWiki = {
    title: "Diablo II (2000) & Lord of Destruction",
    description: "A Vándor elindult keletre, maga után pusztulást hagyva. Kísérd el útján és győzd le a Főgonoszokat!",
    releaseDate: "2000. Június 29.",
    classes: ["Amazon", "Necromancer", "Barbarian", "Sorceress", "Paladin", "Druid (LoD)", "Assassin (LoD)"],
    gameplayFeatures: ["Kiterjedt skillfák", "Rúnaszavak", "Act-okra bontott világ", "Kultikus loot rendszer"],
    keyCharacters: ["Tyrael", "Marius", "Baal", "Mephisto", "Diablo", "Deckard Cain"]
  };

  window.diablo3GameWiki = {
    title: "Diablo III (2012) & Reaper of Souls",
    description: "Egy lehulló csillag új Tristramba csapódik. A Nephalemek korszaka visszatér.",
    releaseDate: "2012. Május 15.",
    classes: ["Barbarian", "Witch Doctor", "Wizard", "Monk", "Demon Hunter", "Crusader (RoS)", "Necromancer"],
    gameplayFeatures: ["Rift rendszer", "Dinamikus harcrendszer", "Seasons", "Kána kockája (Kanai's Cube)"],
    keyCharacters: ["Leah", "Tyrael (Halandó)", "Malthael", "Azmodan", "Belial"]
  };

  window.diablo4GameWiki = {
    title: "Diablo IV (2023) & Vessel of Hatred",
    description: "Lilith visszatért Sanctuary-ba. Egy új, komor korszak veszi kezdetét a nyílt világú Menedékben.",
    releaseDate: "2023. Június 6.",
    classes: ["Barbarian", "Sorcerer", "Rogue", "Druid", "Necromancer", "Spiritborn (VoH)"],
    gameplayFeatures: ["Nyílt világ", "Mountok (Hátasok)", "World Bossok", "Helltide események", "Paragon tábla"],
    keyCharacters: ["Lilith", "Inarius", "Elias", "Mephisto", "Neyrelle", "Lorath"]
  };

  window.diabloImmortalGameWiki = {
    title: "Diablo Immortal (2022)",
    description: "A Diablo II és Diablo III közötti eseményeket bemutató, mobilra és PC-re készült MMOARPG.",
    releaseDate: "2022. Június 2.",
    classes: ["Barbarian", "Crusader", "Demon Hunter", "Monk", "Necromancer", "Wizard", "Blood Knight", "Tempest"],
    gameplayFeatures: ["MMO elemek", "Klánok és Frakciók (Shadows/Immortals)", "Raid bossok", "Mobil és PC Cross-play"],
    keyCharacters: ["Deckard Cain", "Skarn", "Charsi", "Zoltun Kulle"]
  };

  // Az utólag betöltött tartalmak is ugyanazzal a javított karakterkódolással jelenjenek meg.
  if (typeof window.restoreDiabloPortalData === 'function') {
    window.restoreDiabloPortalData(wikiArticles);
    if (typeof timelineData !== 'undefined') window.restoreDiabloPortalData(timelineData);
  }

  // Re-render the articles grid and highlights to show new items
  if (typeof renderWikiArticlesGrid === 'function') {
    renderWikiArticlesGrid();
  }
  if (typeof renderLoreHighlights === 'function') {
    renderLoreHighlights();
  }
  
  // Frissítjük a statisztikai számlálót, hogy a dinamikusan betöltött cikkeket is beleszámolja
  const totalArticlesEl = document.getElementById('stat-total-articles');
  if (totalArticlesEl && typeof wikiArticles !== 'undefined') {
    totalArticlesEl.textContent = Object.keys(wikiArticles).length;
  }
})();




