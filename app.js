/**
 * Diablo Universe Timeline & Sanctuary Wiki Portal Interactive Logic
 */

(function() {
  // State variables
  let currentSearchQuery = '';
  let activeGameTag = 'ALL';
  let activeEraId = 'ALL';
  let activeArticleCategory = 'ALL';
  let activePortalTab = 'timeline';

  // A régebbi, eltérő kódolású tartalmak megjelenítés előtti helyreállítása.
  // Az eredeti adatfájl változatlan marad, ezért később biztonságosan cserélhető.
  const legacyByteMap = {
    'í': 0xC3, 'Ä': 0xC4, 'Ĺ': 0xC5, 'Ć': 0xC6, 'Č': 0xC8, 'É': 0xC9,
    'Í': 0xCD, 'Ó': 0xD3, 'Ö': 0xD6, 'Ú': 0xDA, 'Ü': 0xDC, 'Ý': 0xDD,
    'ˇ': 0xA1, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '–': 0x96,
    '—': 0x97, 'đ': 0xF0, 'ď': 0xEF, 'ź': 0x9F, '¸': 0xB8, 'ś': 0x9C,
    'Ť': 0x85, 'Ź': 0x8F
  };
  const mojibakePattern = /[íĹÄĆČ]|â.|đź|ď¸/;
  const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

  function restoreEncoding(value) {
    if (typeof value !== 'string' || !mojibakePattern.test(value)) return value;
    try {
      const bytes = Uint8Array.from([...value], char => legacyByteMap[char] ?? char.codePointAt(0));
      return utf8Decoder.decode(bytes);
    } catch (_) {
      return value;
    }
  }

  function restorePortalData(value, visited = new WeakSet()) {
    if (typeof value === 'string') return restoreEncoding(value);
    if (!value || typeof value !== 'object' || visited.has(value)) return value;
    visited.add(value);
    Object.keys(value).forEach(key => { value[key] = restorePortalData(value[key], visited); });
    return value;
  }

  function repairRenderedText(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script, style')) continue;
      const repaired = restoreEncoding(node.nodeValue);
      if (repaired !== node.nodeValue) textNodes.push([node, repaired]);
    }
    textNodes.forEach(([textNode, repaired]) => { textNode.nodeValue = repaired; });
  }

  if (typeof wikiArticles !== 'undefined') restorePortalData(wikiArticles);
  if (typeof timelineData !== 'undefined') restorePortalData(timelineData);

  function normalizeForSearch(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('hu');
  }

  function matchesSearch(text, query) {
    const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean);
    const searchable = normalizeForSearch(text);
    return terms.every(term => searchable.includes(term));
  }

  // ============================================================
  // Könyvtár és lapozható olvasó
  // A fejezetazonosítók (például sin-war-birthright-ch4) alapján a meglévő
  // cikkadatokból automatikusan épül fel, ezért új könyvekhez elég fejezetet hozzáadni.
  // ============================================================
  const BOOK_TITLES = {
    'sin-war-birthright': 'The Sin War I: Birthright',
    'sin-war-scales': 'The Sin War II: Scales of the Serpent',
    'sin-war-prophet': 'The Sin War III: The Veiled Prophet',
    'black-road': 'The Black Road',
    'demonsbane': 'Demonsbane',
    'kingdom-of-shadow': 'Kingdom of Shadow'
  };
  let activeReader = { bookId: null, chapterId: null, pageIndex: 0 };

  function getBookIdFromArticleId(articleId) {
    const match = String(articleId || '').match(/^(.*)-ch\d+$/);
    return match ? match[1] : null;
  }

  function getBookLibrary() {
    if (typeof wikiArticles === 'undefined') return [];
    const books = new Map();
    Object.keys(wikiArticles).forEach(id => {
      const bookId = getBookIdFromArticleId(id);
      if (!bookId) return;
      const chapter = wikiArticles[id];
      if (!books.has(bookId)) books.set(bookId, []);
      books.get(bookId).push(chapter);
    });
    return [...books.entries()].map(([id, chapters]) => ({
      id,
      title: BOOK_TITLES[id] || id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      chapters: chapters.sort((a, b) => (Number(a.id.match(/-ch(\d+)$/)?.[1]) || 0) - (Number(b.id.match(/-ch(\d+)$/)?.[1]) || 0))
    })).sort((a, b) => a.title.localeCompare(b.title, 'hu'));
  }

  function readStoredJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
  }

  function getBookProgress(bookId) {
    return readStoredJson(`diablo_book_progress_${bookId}`, null);
  }

  function saveBookProgress() {
    if (!activeReader.bookId || !activeReader.chapterId) return;
    try {
      localStorage.setItem(`diablo_book_progress_${activeReader.bookId}`, JSON.stringify({
        chapterId: activeReader.chapterId,
        pageIndex: activeReader.pageIndex,
        updatedAt: Date.now()
      }));
    } catch (_) {}
  }

  function getBookBookmarks(bookId) {
    return readStoredJson(`diablo_book_bookmarks_${bookId}`, []);
  }

  function paginateChapter(chapter) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = formatMarkdownContent(chapter.content, chapter.id);
    const limit = window.innerWidth < 700 ? 900 : 1550;
    const pages = [];
    let page = '';
    let length = 0;
    [...wrapper.children].forEach(element => {
      const item = element.outerHTML;
      const itemLength = element.textContent.length;
      if (page && length + itemLength > limit) {
        pages.push(page);
        page = '';
        length = 0;
      }
      page += item;
      length += itemLength;
    });
    if (page) pages.push(page);
    return pages.length ? pages : ['<p>Ehhez a fejezethez még nincs olvasható tartalom.</p>'];
  }

  function renderBookLibrary() {
    const grid = document.getElementById('book-library-grid');
    const continueBox = document.getElementById('library-continue');
    if (!grid || !continueBox) return;
    const books = getBookLibrary();
    const inProgress = books.map(book => ({ book, progress: getBookProgress(book.id) })).find(item => item.progress);
    continueBox.innerHTML = inProgress ? `
      <div class="library-continue-card">
        <div><span class="library-eyebrow">Folytasd az olvasást</span><h2>${escapeHtml(inProgress.book.title)}</h2><p>Az utoljára megnyitott fejezet és oldal elmentve.</p></div>
        <button type="button" class="reader-primary-btn" onclick="openBookReader('${inProgress.book.id}')">Folytatás <i class="fas fa-arrow-right"></i></button>
      </div>` : `
      <div class="library-intro"><span class="library-eyebrow">Sanctuary könyvtára</span><h2>Olvass fejezetenként, saját tempóban</h2><p>Az olvasó automatikusan megjegyzi, hol tartottál.</p></div>`;
    grid.innerHTML = books.map(book => {
      const progress = getBookProgress(book.id);
      const progressText = progress ? 'Olvasás folyamatban' : 'Még nem kezdted el';
      return `<article class="book-card">
        <div class="book-card-spine"></div>
        <span class="book-card-icon"><i class="fas fa-book-open"></i></span>
        <span class="book-card-count">${book.chapters.length} fejezet</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p>${progressText}</p>
        <button type="button" onclick="openBookReader('${book.id}')">${progress ? 'Folytatás' : 'Olvasás megkezdése'} <i class="fas fa-arrow-right"></i></button>
      </article>`;
    }).join('') || '<p class="no-results">Még nincs fejezetekre bontott könyv a könyvtárban.</p>';
  }

  function openBookReader(bookId, chapterId = null, pageIndex = null) {
    const book = getBookLibrary().find(item => item.id === bookId);
    if (!book) return;
    const stored = getBookProgress(bookId);
    const selectedChapter = book.chapters.find(chapter => chapter.id === chapterId) || book.chapters.find(chapter => chapter.id === stored?.chapterId) || book.chapters[0];
    activeReader = { bookId, chapterId: selectedChapter.id, pageIndex: Number.isInteger(pageIndex) ? pageIndex : (selectedChapter.id === stored?.chapterId ? stored.pageIndex || 0 : 0) };
    setActiveTab('reader');
    renderBookReader();
  }

  function renderBookReader() {
    const container = document.getElementById('book-reader');
    const book = getBookLibrary().find(item => item.id === activeReader.bookId);
    if (!container || !book) return;
    const chapter = book.chapters.find(item => item.id === activeReader.chapterId) || book.chapters[0];
    const pages = paginateChapter(chapter);
    activeReader.pageIndex = Math.max(0, Math.min(activeReader.pageIndex, pages.length - 1));
    saveBookProgress();
    const bookmarks = getBookBookmarks(book.id);
    const currentSaved = bookmarks.some(item => item.chapterId === chapter.id && item.pageIndex === activeReader.pageIndex);
    container.innerHTML = `
      <div class="reader-shell">
        <header class="reader-header">
          <button type="button" class="reader-back-btn" onclick="setActiveTab('library')"><i class="fas fa-arrow-left"></i> Könyvtár</button>
          <div><span class="library-eyebrow">${escapeHtml(book.title)}</span><h1>${escapeHtml(chapter.title)}</h1></div>
          <button type="button" class="reader-bookmark-btn ${currentSaved ? 'saved' : ''}" onclick="toggleBookBookmark()"><i class="fas fa-bookmark"></i> ${currentSaved ? 'Könyvjelzőzve' : 'Könyvjelző'}</button>
        </header>
        <div class="reader-controls">
          <label>Fejezet <select id="reader-chapter-select">${book.chapters.map(item => `<option value="${item.id}" ${item.id === chapter.id ? 'selected' : ''}>${escapeHtml(item.title)}</option>`).join('')}</select></label>
          <span>${activeReader.pageIndex + 1}. oldal / ${pages.length}</span>
        </div>
        <article class="reader-page article-body-content">${pages[activeReader.pageIndex]}</article>
        <nav class="reader-pagination" aria-label="Lapozás">
          <button type="button" onclick="turnBookPage(-1)" ${activeReader.pageIndex === 0 ? 'disabled' : ''}><i class="fas fa-arrow-left"></i> Előző oldal</button>
          <span>${activeReader.pageIndex + 1} / ${pages.length}</span>
          <button type="button" onclick="turnBookPage(1)" ${activeReader.pageIndex === pages.length - 1 ? 'disabled' : ''}>Következő oldal <i class="fas fa-arrow-right"></i></button>
        </nav>
        <section class="reader-bookmarks"><h2>Könyvjelzők</h2>${bookmarks.length ? bookmarks.map((item, index) => `<div><button type="button" onclick="openBookReader('${book.id}', '${item.chapterId}', ${item.pageIndex})">${escapeHtml(item.chapterTitle)} — ${item.pageIndex + 1}. oldal</button><button type="button" class="bookmark-remove" onclick="removeBookBookmark(${index})" aria-label="Könyvjelző törlése">&times;</button></div>`).join('') : '<p>Még nincs könyvjelző ebben a kötetben.</p>'}</section>
      </div>`;
    document.getElementById('reader-chapter-select')?.addEventListener('change', event => openBookReader(book.id, event.target.value, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function turnBookPage(direction) {
    activeReader.pageIndex += direction;
    renderBookReader();
  }

  function toggleBookBookmark() {
    const book = getBookLibrary().find(item => item.id === activeReader.bookId);
    const chapter = book?.chapters.find(item => item.id === activeReader.chapterId);
    if (!book || !chapter) return;
    const bookmarks = getBookBookmarks(book.id);
    const matchIndex = bookmarks.findIndex(item => item.chapterId === chapter.id && item.pageIndex === activeReader.pageIndex);
    if (matchIndex >= 0) bookmarks.splice(matchIndex, 1);
    else bookmarks.push({ chapterId: chapter.id, chapterTitle: chapter.title, pageIndex: activeReader.pageIndex, createdAt: Date.now() });
    try { localStorage.setItem(`diablo_book_bookmarks_${book.id}`, JSON.stringify(bookmarks)); } catch (_) {}
    renderBookReader();
  }

  function removeBookBookmark(index) {
    const bookmarks = getBookBookmarks(activeReader.bookId);
    bookmarks.splice(index, 1);
    try { localStorage.setItem(`diablo_book_bookmarks_${activeReader.bookId}`, JSON.stringify(bookmarks)); } catch (_) {}
    renderBookReader();
  }

  // DOM Elements
  const timelineContainer = document.getElementById('timeline-container');
  const searchInput = document.getElementById('search-input');
  const eraPillsContainer = document.getElementById('era-pills');
  const highlightsContainer = document.getElementById('highlights-grid');
  const wikiArticlesGrid = document.getElementById('wiki-articles-grid');
  const wikiArticleDisplay = document.getElementById('wiki-article-display');
  const articleCategoryPillsContainer = document.getElementById('article-category-pills');
  
  const totalCountEl = document.getElementById('stat-total-events');
  const visibleCountEl = document.getElementById('stat-visible-events');
  const totalArticlesEl = document.getElementById('stat-total-articles');
  const backToTopBtn = document.getElementById('back-to-top');

  // A régi sablonokban maradt feliratok is javulnak, akkor is, ha új elem kerül a lapra.
  repairRenderedText(document.body);
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const repaired = restoreEncoding(node.nodeValue);
        if (repaired !== node.nodeValue) node.nodeValue = repaired;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        repairRenderedText(node);
      }
    }));
  }).observe(document.body, { childList: true, subtree: true });

  // Top Nav Tabs
  const tabTimeline = document.getElementById('tab-timeline-view');
  const tabWikiArticles = document.getElementById('tab-wiki-articles-view');
  const tabLibrary = document.getElementById('tab-library-view');
  const tabWikiHub = document.getElementById('tab-wiki-hub-view');
  const viewTimeline = document.getElementById('view-timeline');
  const viewWikiArticles = document.getElementById('view-wiki-articles');

  // Game Wiki Buttons
  const btnOpenD1 = document.getElementById('btn-open-diablo1-wiki');
  const btnOpenD2 = document.getElementById('btn-open-diablo2-wiki');
  const btnOpenD3 = document.getElementById('btn-open-diablo3-wiki');
  const btnOpenD4 = document.getElementById('btn-open-diablo4-wiki');
  const btnOpenImmortal = document.getElementById('btn-open-immortal-wiki');
  const btnOpenHub = document.getElementById('btn-open-wiki-hub');

  // Modal Elements
  const modal = document.getElementById('lore-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  const GLOBAL_CATEGORY_ORDER = [
    "Fő Enciklopédia",
    "Kozmogónia",
    "Sanctuary Eredete",
    "Történeti Korszakok",
    "Frakciók",
    "Karakterek – Angyalok & Démonok",
    "Karakterek – Emberek & Nephalem",
    "Karakterek – Olvasó",
    "Helyszínek",
    "Ereklyék & Tárgyak",
    "Könyvek – Olvasó",
    "Közösség & Útmutatók",
    "Diablo I (1996)",
    "Diablo I & Hellfire (1996-1997)",
    "Diablo II & LoD (2000-2001)",
    "Diablo II: Resurrected (2021)",
    "Diablo Immortal (2022)",
    "Diablo III & RoS (2012-2014)",
    "Diablo IV & VoH (2023-)"
  ];
  GLOBAL_CATEGORY_ORDER.forEach((category, index) => {
    GLOBAL_CATEGORY_ORDER[index] = restoreEncoding(category);
  });

  function getArticleChronology() {
    if (typeof wikiArticles === 'undefined') return [];
    return Object.keys(wikiArticles).sort((a, b) => {
      const artA = wikiArticles[a];
      const artB = wikiArticles[b];
      let indexA = GLOBAL_CATEGORY_ORDER.indexOf(artA.category);
      let indexB = GLOBAL_CATEGORY_ORDER.indexOf(artB.category);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      if (indexA !== indexB) return indexA - indexB;

      const matchA = a.match(/-ch(\d+)$/);
      const matchB = b.match(/-ch(\d+)$/);
      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      }
      return artA.title.localeCompare(artB.title);
    });
  }

  // ============================================================
  // IndexedDB Storage Manager – replaces localStorage for articles
  // Falls back gracefully if IDB unavailable.
  // ============================================================
  // Point 11: Promise constructor anti-pattern eltávolítva, idb könyvtár használata
  // Point 19: Szigorú típusvizsgálat (db === null)
  const IDB_NAME = 'diabloWikiDB';
  const IDB_VERSION = 1;
  const IDB_STORE_ARTICLES = 'userArticles';
  let _idb = null;

  async function openIDB() {
    if (_idb !== null) return _idb;
    if (typeof window.indexedDB === 'undefined') return null;
    try {
      _idb = await idb.openDB(IDB_NAME, IDB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(IDB_STORE_ARTICLES)) {
            db.createObjectStore(IDB_STORE_ARTICLES, { keyPath: 'id' });
          }
        }
      });
      return _idb;
    } catch(e) {
      return null;
    }
  }

  async function idbPut(value) {
    const db = await openIDB();
    if (db === null) return;
    await db.put(IDB_STORE_ARTICLES, value);
  }

  async function idbPutBatch(values) {
    const db = await openIDB();
    if (db === null || values === undefined || values.length === 0) return;
    const tx = db.transaction(IDB_STORE_ARTICLES, 'readwrite');
    for (const val of values) {
      tx.store.put(val);
    }
    await tx.done;
  }

  async function idbGetAll() {
    const db = await openIDB();
    if (db === null) return [];
    return await db.getAll(IDB_STORE_ARTICLES) || [];
  }

  async function idbDelete(key) {
    const db = await openIDB();
    if (db === null) return;
    await db.delete(IDB_STORE_ARTICLES, key);
  }

  // Read tracking – optimized with memory cache (Point 17)
  let cachedReadArticles = null;

  function getReadArticles() {
    if (cachedReadArticles !== null) return cachedReadArticles;
    try {
      cachedReadArticles = JSON.parse(localStorage.getItem('diablo_wiki_read_articles')) || [];
    } catch(e) {
      cachedReadArticles = [];
    }
    return cachedReadArticles;
  }

  function markArticleAsRead(articleId) {
    let readList = getReadArticles();
    if (!readList.includes(articleId)) {
      readList.push(articleId);
      // Non-blocking write
      setTimeout(() => {
        try {
          localStorage.setItem('diablo_wiki_read_articles', JSON.stringify(readList));
        } catch(e) {}
      }, 0);
    }
    updateReadingButtonText();
  }

  function determineNextArticleAction() {
    const readList = getReadArticles();
    const chronology = getArticleChronology();
    if (!readList || readList.length === 0) {
      return { type: 'start', id: chronology[0] };
    }
    
    let maxReadIdx = -1;
    for (const readId of readList) {
      const idx = chronology.indexOf(readId);
      if (idx > maxReadIdx) maxReadIdx = idx;
    }
    
    let lastUnreadBeforeMax = null;
    for (let i = 0; i <= maxReadIdx; i++) {
      const articleId = chronology[i];
      if (!readList.includes(articleId)) {
        lastUnreadBeforeMax = articleId;
        break;
      }
    }
    
    if (lastUnreadBeforeMax) {
      return { type: 'missed', id: lastUnreadBeforeMax };
    }
    
    if (maxReadIdx + 1 < chronology.length) {
      return { type: 'continue', id: chronology[maxReadIdx + 1] };
    }

    return { type: 'finished', id: null };
  }

  function updateReadingButtonText() {
    const btnText = document.getElementById('reading-btn-text');
    if (!btnText) return;

    const recommendation = determineNextArticleAction();
    if (recommendation.type === 'start') {
      btnText.innerHTML = 'đź“– Olvasás megkezdése a legelejétől (Kronológia)';
    } else if (recommendation.type === 'missed') {
      const article = typeof wikiArticles !== 'undefined' ? wikiArticles[recommendation.id] : null;
      btnText.innerHTML = `âš ď¸Ź Új tartalom! Ajánlott olvasmány: ${article ? escapeHtml(article.title) : 'Ismeretlen'}`;
    } else if (recommendation.type === 'continue') {
      const article = typeof wikiArticles !== 'undefined' ? wikiArticles[recommendation.id] : null;
      btnText.innerHTML = `đź“– Olvasás folytatása: ${article ? escapeHtml(article.title) : 'Következő'}`;
    } else if (recommendation.type === 'finished') {
      btnText.innerHTML = 'âś… Mindent elolvastál a kronológiából!';
    }
  }

  function continueReading() {
    const recommendation = determineNextArticleAction();
    if (recommendation.id) {
      openWikiArticle(recommendation.id);
    }
  };

  // Initialize reading button on load
  updateReadingButtonText();

  // Initialize Ember particles effect
  createEmbers();

  /**
   * Lore terms mapping for automatic internal wiki links
   */
  const loreLinkMap = [
    { term: "Worldstone", target: "sanctuary-relics" },
    { term: "Világkő", target: "sanctuary-relics" },
    { term: "Black Soulstone", target: "sanctuary-relics" },
    { term: "Fekete Lélekkő", target: "sanctuary-relics" },
    { term: "Soulstone-ok", target: "sanctuary-relics" },
    { term: "Soulstone", target: "sanctuary-relics" },
    { term: "Lélekkő", target: "sanctuary-relics" },
    { term: "Elâ€™druin", target: "sanctuary-relics" },
    { term: "Sin War", target: "sin-war-lore" },
    { term: "Bűn Háborúja", target: "sin-war-lore" },
    { term: "Angiris Council", target: "sanctuary-factions" },
    { term: "Cathedral of Light", target: "sanctuary-factions" },
    { term: "High Heavens", target: "kozmogonia" },
    { term: "Magas Mennyek", target: "kozmogonia" },
    { term: "Burning Hells", target: "kozmogonia" },
    { term: "Lángoló Poklok", target: "kozmogonia" },
    { term: "Eternal Conflict", target: "kozmogonia" },
    { term: "Örök Konfliktus", target: "kozmogonia" },
    { term: "Horadrim Rend", target: "horadrim-order" },
    { term: "Horadrim", target: "horadrim-order" },
    { term: "Prime Evilök", target: "prime-lesser-evils" },
    { term: "Prime Evil", target: "prime-lesser-evils" },
    { term: "Lesser Evilök", target: "prime-lesser-evils" },
    { term: "Lesser Evil", target: "prime-lesser-evils" },
    { term: "Triune", target: "sanctuary-factions" },
    { term: "Edyrem", target: "sin-war-lore" },
    { term: "Dark Exile", target: "sin-war-lore" },
    { term: "Tathamet", target: "kozmogonia" },
    { term: "Anu", target: "kozmogonia" },
    { term: "Inarius", target: "sanctuary-origin" },
    { term: "Lilith", target: "sanctuary-origin" },
    { term: "Nephalemek", target: "sanctuary-origin" },
    { term: "Nephalem", target: "sanctuary-origin" },
    { term: "Uldyssian ul-Diomed", target: "lore-uldyssian" },
    { term: "Uldyssian", target: "lore-uldyssian" },
    { term: "Mendeln ul-Diomed", target: "lore-mendeln" },
    { term: "Mendeln", target: "lore-mendeln" },
    { term: "Kalan", target: "lore-mendeln" },
    { term: "Trag'Oul", target: "lore-tragoul" },
    { term: "Trag'oul", target: "lore-tragoul" },
    { term: "Rathma", target: "sanctuary-origin" },
    { term: "Tyrael", target: "sanctuary-characters" },
    { term: "Imperius", target: "sanctuary-characters" },
    { term: "Auriel", target: "sanctuary-characters" },
    { term: "Itherael", target: "sanctuary-characters" },
    { term: "Malthael", target: "sanctuary-characters" },
    { term: "Mephisto", target: "prime-lesser-evils" },
    { term: "Diablo", target: "prime-lesser-evils" },
    { term: "Baal", target: "prime-lesser-evils" },
    { term: "Andariel", target: "prime-lesser-evils" },
    { term: "Duriel", target: "prime-lesser-evils" },
    { term: "Belial", target: "prime-lesser-evils" },
    { term: "Azmodan", target: "prime-lesser-evils" },
    { term: "Leoric", target: "diablo-1-story" },
    { term: "Aidan", target: "diablo-1-story" },
    { term: "Lazarus", target: "diablo-1-story" },
    { term: "Deckard Cain", target: "horadrim-order" },
    { term: "Tal Rasha", target: "horadrim-order" },
    { term: "Zoltun Kulle", target: "horadrim-order" },
    { term: "Book of Cain", target: "sanctuary-novels" },
    { term: "Book of Tyrael", target: "sanctuary-novels" },
    { term: "Book of Adria", target: "sanctuary-novels" },
    { term: "Secret Cow Level", target: "sanctuary-community-hub" },
    { term: "Teényszint", target: "sanctuary-community-hub" },
    { term: "Whimsyshire", target: "sanctuary-community-hub" },
    { term: "Hungarian Heroes", target: "sanctuary-community-hub" },
    { term: "Sötét Száműzetés", target: "lore-dark-exile" },
    { term: "Dark Exile", target: "lore-dark-exile" },
    { term: "Mágusklánok Háborúja", target: "lore-mage-clan-wars" },
    { term: "Mage Clan Wars", target: "lore-mage-clan-wars" },
    { term: "Vizjerei", target: "lore-mage-clan-wars" },
    { term: "Bartuc", target: "lore-mage-clan-wars" },
    { term: "Horazon", target: "lore-mage-clan-wars" },
    { term: "Viz-Jaqtaar", target: "lore-mage-clan-wars" }
  ];

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const sortedLoreLinkMap = [...loreLinkMap].sort((a, b) => b.term.length - a.term.length);
  const hChar = "a-zA-Z0-9áéíóöőúüváÉÍÓÖĹÚÜV_â€™'";
  const termsEscaped = sortedLoreLinkMap.map(i => escapeRegExp(i.term));
  const loreRegex = new RegExp(`(?:^|[^${hChar}])(${termsEscaped.join('|')})(?![${hChar}])`, 'g');

  function linkifyLoreTerms(htmlText, currentArticleId = null) {
    if (!htmlText) return '';

    const tokens = htmlText.split(/(<[^>]+>)/g);
    const linkedTermsInDoc = new Set();
    let insideLink = false;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].startsWith('<')) {
        const tagLower = tokens[i].toLowerCase();
        if (tagLower.startsWith('<a ')) insideLink = true;
        if (tagLower.startsWith('</a>')) insideLink = false;
      } else if (!insideLink && tokens[i].trim().length > 0) {
        let text = tokens[i];

        text = text.replace(loreRegex, (match, p1) => {
          const item = sortedLoreLinkMap.find(i => i.term === p1);
          if (!item || item.target === currentArticleId || linkedTermsInDoc.has(item.term)) {
            return match;
          }
          const prefix = match.substring(0, match.indexOf(p1));
          linkedTermsInDoc.add(item.term);
          return `${prefix}<a href="javascript:void(0)" class="wiki-internal-link" onclick="openWikiArticle('${item.target}')" title="Ugrás a(z) ${item.term} cikkhez">${p1}</a>`;
        });

        tokens[i] = text;
      }
    }

    return tokens.join('');
  }

  /**
   * Intelligent Wiki Article Auto-Formatter Engine
   * Analyzes raw text input and automatically applies Markdown headings, bold lore entities, quote blocks, and structured lists.
   */
  function autoFormatWikiArticle(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText.trim();

    text = text.replace(/\r\n/g, '\n');

    // Point 16: Tipográfiai / OCR hibák javítása
    text = text.replace(/fejezeí/gi, 'fejezet');

    const sectionRules = [
      { pattern: /^(története?|történeti áttekintés):?/im, header: "### đź“ś Története\n" },
      { pattern: /^(eredete?|kezdetei|sanctuary eredete):?/im, header: "### đźŹ›ď¸Ź Eredete & Kezdetei\n" },
      { pattern: /^(képességeki?|erők|mágia|erőforrások):?/im, header: "### âšˇ Erők és Képességek\n" },
      { pattern: /^(főbb események|fő konfliktus|háborúk):?/im, header: "### âš”ď¸Ź Főbb Események\n" },
      { pattern: /^(öröksége?|hatása|következmények):?/im, header: "### đź”® Öröksége & Hatása\n" },
      { pattern: /^(források|kánon források|irodalom):?/im, header: "### đź“š Kánon Források\n" }
    ];

    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
      let l = line.trim();
      if (!l) return '';

      for (const rule of sectionRules) {
        if (rule.pattern.test(l) && !l.startsWith('#')) {
          return '\n' + rule.header + l.replace(rule.pattern, '').trim();
        }
      }

      if (/^[„"Â»](.+)[”"Â«]$/.test(l) || /^"(.+)"$/.test(l)) {
        return `> đź“ś *"${l.replace(/^[„"Â»]|["”Â«]$/g, '').trim()}"*`;
      }

      if (/^[â€˘Â·\-\*]\s*(.+)/.test(l) && !l.startsWith('- ')) {
        return `- ${l.replace(/^[â€˘Â·\-\*]\s*/, '')}`;
      }

      return l;
    });

    text = formattedLines.join('\n');



    keyLoreTerms.forEach(term => {
      const escapedTerm = escapeRegExp(term);
      const regex = new RegExp(`(?<![\\*\\>\\<\\w])(${escapedTerm})(?![\\*\\<\\w])`, 'gi');
      // Fix: Don't format if it's already bolded or inside a header/quote. 
      // The regex already checks for * around it, but let's be careful not to infinite loop.
      text = text.replace(regex, (match, p1) => {
        return `**${p1}**`;
      });
      // Prevent double bolding just in case
      text = text.replace(/\*\*\*\*/g, '**').replace(/\*\*\*\*(.*?)\*\*\*\*/g, '**$1**');
    });

    text = text.replace(/\n{3,}/g, '\n\n');
    return text;
  }



  /**
   * Helper: Basic HTML Sanitizer to prevent XSS (Point 12)
   */
  function sanitizeHtml(html) {
    if (!html) return '';
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    return html;
  }

  /**
   * Helper: Format headings, bold, italic, quotes, & lists in markdown style and linkify terms
   */
  function formatMarkdownContent(text, articleId = null) {
    if (!text) return '';
    
    // First escape the raw text to prevent raw HTML injection, but wait, the text might already have some allowed tags?
    // The previous implementation didn't escape at all. To be safe, we will just sanitize the final output.
    
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="markdown-h3"><i class="fas fa-feather-alt" style="color: var(--accent-gold); font-size: 0.9em; margin-right: 6px;"></i> $1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>')
      .replace(/^> (.*$)/gim, '<blockquote class="markdown-quote">$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li class="markdown-li"><i class="fas fa-caret-right" style="color: var(--accent-gold); font-size: 0.8em; margin-right: 6px;"></i> $1</li>')
      .replace(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="wiki-image">')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    formatted = formatted.replace(/(<li class="markdown-li">.*?<\/li>)+/g, '<ul class="markdown-ul">$&</ul>');
    
    formatted = formatted.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<table') || p.startsWith('<div') || p.startsWith('<img')) return p;
      return `<p class="markdown-p">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    formatted = linkifyLoreTerms(formatted, articleId);
    return sanitizeHtml(formatted);
  }

  /**
   * Helper: Escape HTML string
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Load persistent user edits from localStorage
  loadUserSavedArticles();

  // EXPERIMENTAL: Removed auto-format on load as requested by user to protect Canon data.
  // Initialize Statistics Counters
  if (totalCountEl) totalCountEl.textContent = typeof timelineData !== 'undefined' ? timelineData.length : 0;
  if (totalArticlesEl) totalArticlesEl.textContent = typeof wikiArticles !== 'undefined' ? Object.keys(wikiArticles).length : 0;

  // Render Controls & Grids
  renderEraPills();
  renderLoreHighlights();
  renderArticleCategoryPills();
  renderTimeline();
  renderWikiArticlesGrid();

  // Tab View Switchers
  if (tabTimeline) {
    tabTimeline.addEventListener('click', () => {
      setActiveTab('timeline');
    });
  }
  if (tabWikiArticles) {
    tabWikiArticles.addEventListener('click', () => {
      setActiveTab('articles');
    });
  }
  if (tabLibrary) tabLibrary.addEventListener('click', () => setActiveTab('library'));
  if (tabWikiHub) {
    tabWikiHub.addEventListener('click', () => {
      openDiabloWikiHubModal();
    });
  }
  const tabLoreMap = document.getElementById('tab-lore-map-view');
  const tabNewArticle = document.getElementById('tab-new-article-editor');
  if (tabLoreMap) tabLoreMap.addEventListener('click', () => setActiveTab('lore-map'));
  if (tabNewArticle) tabNewArticle.addEventListener('click', () => setActiveTab('editor'));

  // Debounce utility: prevents firing expensive render calls on every keystroke
  function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Search Input Event Listener (debounced 300ms)
  if (searchInput) {
    const debouncedRender = debounce((query) => {
      currentSearchQuery = query;
      renderTimeline();
      renderWikiArticlesGrid();
    }, 300);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (wikiArticleDisplay && query.length > 0) {
        wikiArticleDisplay.style.display = 'none';
      }
      debouncedRender(query);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // Tag Filter Buttons – event delegation (one listener on parent)
  const tagFiltersContainer = document.querySelector('.tag-filters');
  if (tagFiltersContainer) {
    tagFiltersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-btn');
      if (!btn) return;
      tagFiltersContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGameTag = btn.dataset.tag;
      renderTimeline();
    });
  }

  // Hero Game Wiki Button Listeners
  if (btnOpenD1) btnOpenD1.addEventListener('click', () => renderGameWikiModal(diablo1GameWiki));
  if (btnOpenD2) btnOpenD2.addEventListener('click', () => renderGameWikiModal(diablo2GameWiki));
  if (btnOpenD3) btnOpenD3.addEventListener('click', () => renderGameWikiModal(diablo3GameWiki));
  if (btnOpenD4) btnOpenD4.addEventListener('click', () => renderGameWikiModal(diablo4GameWiki));
  if (btnOpenImmortal) btnOpenImmortal.addEventListener('click', () => renderGameWikiModal(diabloImmortalGameWiki));

  // Open Diablo Wiki Hub Button listener
  if (btnOpenHub) {
    btnOpenHub.addEventListener('click', () => {
      openDiabloWikiHubModal();
    });
  }

  // Modal & Escape Key close handlers
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeWikiArticle();
    }
  });

  // Back to top scroll handler
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // Hash-based Router – Deep Linking & Back/Forward support
  // Tab: #tab/timeline  |  Cikk: #article/tyrael
  // ============================================================

  function parseHashAndNavigate() {
    let hash = window.location.hash.slice(1);
    if (!hash) return;
    
    // Deep Linking: anchor támogatás (Point 14)
    let anchor = null;
    const anchorIdx = hash.indexOf('#');
    if (anchorIdx >= 0) {
      anchor = hash.slice(anchorIdx + 1);
      hash = hash.slice(0, anchorIdx);
    }

    const slashIdx = hash.indexOf('/');
    const type = slashIdx >= 0 ? hash.slice(0, slashIdx) : hash;
    const value = slashIdx >= 0 ? hash.slice(slashIdx + 1) : '';
    if (type === 'tab' && value) {
      setActiveTab(value, false);
    } else if (type === 'article' && value) {
      setActiveTab('articles', false);
      openWikiArticle(decodeURIComponent(value), false);
      
      // Görgessünk az anchorhoz, ha van
      if (anchor) {
        setTimeout(() => {
          const target = document.getElementById(anchor) || document.querySelector(`a[name="${anchor}"]`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500); // 500ms delay to allow DOM render
      }
    }
  }

  window.addEventListener('hashchange', parseHashAndNavigate);

  /**
   * Switch Active Portal Tab View
   * @param {string} tab - 'timeline' | 'articles' | 'lore-map' | 'editor'
   * @param {boolean} pushHash - true: URL frissites, false: router callback (nincs dupla push)
   */
  function setActiveTab(tab, pushHash) {
    if (pushHash === undefined) pushHash = true;
    activePortalTab = tab;

    if (pushHash) {
      const newHash = '#tab/' + tab;
      if (window.location.hash !== newHash) {
        history.pushState({ type: 'tab', value: tab }, '', newHash);
      }
    }

    if (viewTimeline) viewTimeline.style.display = 'none';
    if (viewWikiArticles) viewWikiArticles.style.display = 'none';
    const viewLibrary = document.getElementById('view-library');
    const viewBookReader = document.getElementById('view-book-reader');
    if (viewLibrary) viewLibrary.style.display = 'none';
    if (viewBookReader) viewBookReader.style.display = 'none';
    const viewLoreMap = document.getElementById('view-lore-map');
    if (viewLoreMap) viewLoreMap.style.display = 'none';
    const viewEditor = document.getElementById('view-new-article-editor');
    if (viewEditor) viewEditor.style.display = 'none';

    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

    if (tab === 'timeline') {
      const tabEl = document.getElementById('tab-timeline-view');
      if (tabEl) tabEl.classList.add('active');
      if (viewTimeline) viewTimeline.style.display = 'block';
    } else if (tab === 'articles') {
      const tabEl = document.getElementById('tab-wiki-articles-view');
      if (tabEl) tabEl.classList.add('active');
      if (viewWikiArticles) viewWikiArticles.style.display = 'block';
    } else if (tab === 'library') {
      const tabEl = document.getElementById('tab-library-view');
      if (tabEl) tabEl.classList.add('active');
      if (viewLibrary) viewLibrary.style.display = 'block';
      renderBookLibrary();
    } else if (tab === 'reader') {
      const tabEl = document.getElementById('tab-library-view');
      if (tabEl) tabEl.classList.add('active');
      if (viewBookReader) viewBookReader.style.display = 'block';
    } else if (tab === 'lore-map') {
      const tabEl = document.getElementById('tab-lore-map-view');
      if (tabEl) tabEl.classList.add('active');
      if (viewLoreMap) viewLoreMap.style.display = 'block';
      if (typeof window.initLoreNetwork === 'function' && !window.loreNetworkInitialized) {
        try { 
          window.initLoreNetwork(); 
          window.loreNetworkInitialized = true; 
        } catch(e) {
          console.error('[Vis.js] Hiba a hálózat inicializálásakor:', e);
        }
      }
    } else if (tab === 'editor') {
      const tabEl = document.getElementById('tab-new-article-editor');
      if (tabEl) tabEl.classList.add('active');
      if (viewEditor) viewEditor.style.display = 'block';
    }
  }

  // Make setActiveTab globally available for inline onclick attributes
  window.setActiveTab = setActiveTab;

  window.openBooksOnly = function() {
    window.setActiveTab('articles');
    activeArticleCategory = "Könyvek – Olvasó";
    
    if (articleCategoryPillsContainer) {
      articleCategoryPillsContainer.querySelectorAll('.article-category-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.cat === "Könyvek – Olvasó");
      });
    }
    
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    
    renderWikiArticlesGrid();
    
    const viewSection = document.getElementById('view-wiki-articles');
    if (viewSection) {
      viewSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Render Era Navigation Pills for Timeline
   */
  function renderEraPills() {
    if (!eraPillsContainer || typeof timelineData === 'undefined') return;

    const erasMap = new Map();
    erasMap.set('ALL', 'Összes Korszak');

    timelineData.forEach(item => {
      if (!erasMap.has(item.eraId)) {
        erasMap.set(item.eraId, item.eraName);
      }
    });

    let html = '';
    erasMap.forEach((name, id) => {
      const activeClass = id === activeEraId ? 'active' : '';
      html += `<button class="era-pill ${activeClass}" data-era="${id}">${name}</button>`;
    });

    eraPillsContainer.innerHTML = html;

    // Era pills – event delegation (single listener re-attached after each re-render)
    eraPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.era-pill');
      if (!pill) return;
      eraPillsContainer.querySelectorAll('.era-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeEraId = pill.dataset.era;
      renderTimeline();
    });
  }

  /**
   * Render Category Pills for Wiki Articles View
   */
  function renderArticleCategoryPills() {
    if (!articleCategoryPillsContainer || typeof wikiArticles === 'undefined') return;

    const categoriesSet = new Set(['ALL']);

    Object.keys(wikiArticles).forEach(key => {
      if (wikiArticles[key].category) {
        categoriesSet.add(wikiArticles[key].category);
      }
    });

    const sortedCategories = Array.from(categoriesSet).sort((a, b) => {
      let indexA = GLOBAL_CATEGORY_ORDER.indexOf(a);
      let indexB = GLOBAL_CATEGORY_ORDER.indexOf(b);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    let html = '';
    sortedCategories.forEach(cat => {
      const activeClass = cat === activeArticleCategory ? 'active' : '';
      const label = cat === 'ALL' ? 'Összes kategória' : cat;
      html += `<button class="article-category-pill ${activeClass}" data-cat="${cat}">${label}</button>`;
    });

    articleCategoryPillsContainer.innerHTML = html;

    // Category pills – event delegation
    articleCategoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.article-category-pill');
      if (!pill) return;
      articleCategoryPillsContainer.querySelectorAll('.article-category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeArticleCategory = pill.dataset.cat;
      renderWikiArticlesGrid();
    });
  }

  /**
   * Render Quick Lore Highlight Cards
   */
  function renderLoreHighlights() {
    if (!highlightsContainer || typeof loreHighlights === 'undefined') return;

    let html = '';
    loreHighlights.forEach(card => {
      const clickAction = card.articleId 
        ? `openWikiArticle('${card.articleId}')` 
        : `openHighlightModal('${escapeHtml(card.title)}', '${escapeHtml(card.desc)}')`;

      html += `
        <div class="highlight-card" onclick="${clickAction}">
          <div class="highlight-category">${escapeHtml(card.category)}</div>
          <h3>${escapeHtml(card.title)} <i class="fas fa-external-link-alt" style="font-size: 0.75rem; color: var(--accent-gold); margin-left: 4px;"></i></h3>
          <p>${escapeHtml(card.desc)}</p>
        </div>
      `;
    });
    highlightsContainer.innerHTML = html;
  }

  /**
   * Main Render Timeline Function
   */
  function renderTimeline() {
    if (!timelineContainer || typeof timelineData === 'undefined') return;

    const filtered = timelineData.filter(item => {
      if (activeGameTag !== 'ALL') {
        const normalizedTag = item.gameTag.replace(/\s+/g, '-');
        if (normalizedTag !== activeGameTag) return false;
      }

      if (activeEraId !== 'ALL' && item.eraId !== activeEraId) {
        return false;
      }

      if (currentSearchQuery !== '') {
        const textToSearch = `${item.title} ${item.date} ${item.summary} ${item.description} ${item.source} ${item.details || ''}`;
        if (!matchesSearch(textToSearch, currentSearchQuery)) return false;
      }

      return true;
    });

    if (visibleCountEl) visibleCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      timelineContainer.innerHTML = `
        <div class="no-results" style="text-align: center; padding: 40px; background: rgba(18,14,16,0.6); border: 1px solid var(--border-dark); border-radius: 10px;">
          <i class="fas fa-search-minus" style="font-size: 2.5rem; color: var(--accent-gold); margin-bottom: 15px;"></i>
          <h3 style="font-family: var(--font-title); color: #fff;">Nincs találat a keresési feltételeknek megfelelően.</h3>
          <p style="color: var(--text-secondary); margin-top: 5px;">Próbáld meg megváltoztatni a szűrőket vagy a keresett kifejezést!</p>
        </div>
      `;
      return;
    }

    let html = '<div class="timeline-wrapper"><div class="timeline-track"></div>';

    filtered.forEach(item => {
      const badgeClass = item.gameTag.replace(/\s+/g, '-');

      html += `
        <div class="timeline-item" id="event-${item.id}">
          <div class="timeline-marker"></div>
          <div class="timeline-card">
            <div class="card-header">
              <span class="date-badge">${escapeHtml(item.date)}</span>
              <span class="game-badge ${badgeClass}">${escapeHtml(item.gameTag)}</span>
            </div>
            
            <h2 class="card-title">${escapeHtml(item.title)}</h2>
            
            ${item.source ? `<div class="source-tag"><i class="fas fa-book-open"></i> Forrás: ${escapeHtml(item.source)}</div>` : ''}
            
            <div class="card-summary">${formatMarkdownContent(item.summary)}</div>
            
            <div class="card-full-description">${formatMarkdownContent(item.description)}</div>
            
            ${item.details ? `<div class="card-details-box"><i class="fas fa-info-circle"></i> ${formatMarkdownContent(item.details)}</div>` : ''}
          </div>
        </div>
      `;
    });

    html += '</div>';
    timelineContainer.innerHTML = html;
  }

  /**
   * Render Wiki Articles Grid in View 2
   */
  function renderWikiArticlesGrid() {
    if (!wikiArticlesGrid || typeof wikiArticles === 'undefined') return;

    const filteredKeys = Object.keys(wikiArticles).filter(key => {
      const article = wikiArticles[key];

      // HIDE SUBCHAPTERS FROM MAIN GRID UNLESS SEARCHING
      if (article.id.match(/-ch\d+$/) && currentSearchQuery === '') {
        return false;
      }

      if (activeArticleCategory !== 'ALL' && article.category !== activeArticleCategory) {
        return false;
      }

      if (currentSearchQuery !== '') {
        const textToSearch = `${article.title} ${article.subtitle} ${article.category} ${article.content}`;
        if (!matchesSearch(textToSearch, currentSearchQuery)) return false;
      }

      return true;
    });

    if (filteredKeys.length === 0) {
      wikiArticlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: rgba(18,14,16,0.6); border: 1px solid var(--border-dark); border-radius: 10px;">
          <i class="fas fa-search-minus" style="font-size: 2.5rem; color: var(--accent-gold); margin-bottom: 15px;"></i>
          <h3 style="font-family: var(--font-title); color: #fff;">Nincs találat a Wiki Cikktárban.</h3>
          <p style="color: var(--text-secondary); margin-top: 5px;">Próbálj más kategóriát vagy keresési kifejezést!</p>
        </div>
      `;
      return;
    }

    filteredKeys.sort((a, b) => {
      const artA = wikiArticles[a];
      const artB = wikiArticles[b];
      
      let indexA = GLOBAL_CATEGORY_ORDER.indexOf(artA.category);
      let indexB = GLOBAL_CATEGORY_ORDER.indexOf(artB.category);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      if (indexA !== indexB) return indexA - indexB;

      const matchA = a.match(/-ch(\d+)$/);
      const matchB = b.match(/-ch(\d+)$/);
      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      }

      return artA.title.localeCompare(artB.title);
    });

    wikiArticlesGrid.textContent = '';

    // Virtualization / Lusta renderelés (Point 3)
    let renderIdx = 0;
    const batchSize = 20;
    
    const sentinel = document.createElement('div');
    sentinel.style.gridColumn = '1 / -1';
    sentinel.style.height = '10px';
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && renderIdx < filteredKeys.length) {
        wikiArticlesGrid.removeChild(sentinel);
        renderNextBatch();
      }
    }, { rootMargin: '300px' });
    
    function renderNextBatch() {
      const fragment = document.createDocumentFragment();
      const endIdx = Math.min(renderIdx + batchSize, filteredKeys.length);
      for (let i = renderIdx; i < endIdx; i++) {
        const key = filteredKeys[i];
        const article = wikiArticles[key];

        const card = document.createElement('div');
        card.className = 'wiki-article-card';
        card.addEventListener('click', () => openWikiArticle(article.id));

        const topDiv = document.createElement('div');
        
        const catDiv = document.createElement('div');
        catDiv.className = 'category';
        catDiv.textContent = article.category;
        
        const h3 = document.createElement('h3');
        h3.textContent = article.title;
        
        const p = document.createElement('p');
        p.textContent = article.subtitle;

        topDiv.appendChild(catDiv);
        topDiv.appendChild(h3);
        topDiv.appendChild(p);

        const readMore = document.createElement('div');
        readMore.className = 'read-more';
        readMore.innerHTML = 'Cikk elolvasása <i class="fas fa-arrow-right"></i>';

        card.appendChild(topDiv);
        card.appendChild(readMore);
        fragment.appendChild(card);
      }
      
      wikiArticlesGrid.appendChild(fragment);
      renderIdx = endIdx;

      if (renderIdx < filteredKeys.length) {
        wikiArticlesGrid.appendChild(sentinel);
        observer.observe(sentinel);
      }
    }

    renderNextBatch();
  }

  /**
   * Close Wiki Article Display Box
   */
  function closeWikiArticle() {
    if (wikiArticleDisplay) {
      wikiArticleDisplay.style.display = 'none';
    }
    const grid = document.getElementById('wiki-articles-grid');
    const header = document.querySelector('#view-wiki-articles .wiki-portal-header');
    if (grid) grid.style.display = 'grid';
    if (header) header.style.display = 'block';
  };

  function addArticleReadingTools(article) {
    const body = wikiArticleDisplay?.querySelector('.article-body-content');
    if (!body) return;

    const tools = document.createElement('aside');
    tools.className = 'article-reading-tools';
    tools.setAttribute('aria-label', 'Cikk navigáció');

    const crumb = document.createElement('p');
    crumb.className = 'article-breadcrumb';
    crumb.textContent = `Cikkek  /  ${article.category}  /  ${article.title}`;
    tools.appendChild(crumb);

    const headings = [...body.querySelectorAll('h2')];
    if (headings.length) {
      const title = document.createElement('p');
      title.className = 'article-toc-title';
      title.textContent = 'A cikk tartalma';
      tools.appendChild(title);

      const list = document.createElement('div');
      list.className = 'article-toc';
      headings.forEach((heading, index) => {
        const headingId = `article-section-${article.id}-${index + 1}`;
        heading.id = headingId;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = heading.textContent.trim();
        button.addEventListener('click', () => heading.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        list.appendChild(button);
      });
      tools.appendChild(list);
    }

    body.before(tools);
  }

  /**
   * Open Specific Wiki Article in Display Box
   * @param {string} articleId
   * @param {boolean} pushHash - false when called from the hash router to avoid loop
   */
  function openWikiArticle(articleId, pushHash) {
    if (pushHash === undefined) pushHash = true;
    if (!wikiArticleDisplay || typeof wikiArticles === 'undefined' || !wikiArticles[articleId]) return;

    // URL frissitese (megosztható link)
    if (pushHash) {
      const newHash = '#article/' + encodeURIComponent(articleId);
      if (window.location.hash !== newHash) {
        history.pushState({ type: 'article', value: articleId }, '', newHash);
      }
    }

    // Switch to wiki articles view tab if not already on it
    setActiveTab('articles', false);
    
    // Mark article as read
    markArticleAsRead(articleId);
    
    // Point 1: Event Emitter architektúra
    document.dispatchEvent(new CustomEvent('articleOpened', { detail: { articleId } }));

    const chronology = getArticleChronology();
    const currentIdx = chronology.indexOf(articleId);
    let prevBtnHtml = '';
    let nextBtnHtml = '';

    if (currentIdx > 0) {
      const prevArticleId = chronology[currentIdx - 1];
      const prevTitle = wikiArticles[prevArticleId]?.title || "Előző";
      prevBtnHtml = `<button class="article-nav-btn" onclick="openWikiArticle('${prevArticleId}')" style="background: rgba(212,175,55,0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; text-align: left;"><i class="fas fa-arrow-left"></i> Előző: ${escapeHtml(prevTitle)}</button>`;
    }

    if (currentIdx !== -1 && currentIdx < chronology.length - 1) {
      const nextArticleId = chronology[currentIdx + 1];
      const nextTitle = wikiArticles[nextArticleId]?.title || "Következő";
      nextBtnHtml = `<button class="article-nav-btn" onclick="openWikiArticle('${nextArticleId}')" style="background: rgba(212,175,55,0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; text-align: right;">Következő: ${escapeHtml(nextTitle)} <i class="fas fa-arrow-right"></i></button>`;
    }

    const navigationHtml = (prevBtnHtml || nextBtnHtml) ? `
      <div class="article-nav-buttons" style="display: flex; justify-content: space-between; gap: 15px; margin-top: 30px; border-top: 1px solid var(--border-gold); padding-top: 20px; padding-bottom: 20px;">
        ${prevBtnHtml}
        ${nextBtnHtml}
      </div>
    ` : '';

    const article = wikiArticles[articleId];
    const bookId = getBookIdFromArticleId(articleId);
    const readerButtonHtml = bookId ? `
          <button onclick="openBookReader('${bookId}', '${articleId}')" style="background: rgba(158,61,56,0.25); border: 1px solid var(--accent-red); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-family: var(--font-body);">
            <i class="fas fa-book-open"></i> Olvasó nézet
          </button>` : '';

    let infoboxHtml = '';
    if (article.infobox) {
      infoboxHtml = `
        <div class="wiki-infobox">
          <h3>${escapeHtml(article.title)} Adatlap</h3>
      `;
      Object.keys(article.infobox).forEach(k => {
        infoboxHtml += `
          <div class="wiki-infobox-row">
            <span class="wiki-infobox-label">${escapeHtml(k)}:</span>
            <span class="wiki-infobox-value">${linkifyLoreTerms(escapeHtml(article.infobox[k]), articleId)}</span>
          </div>
        `;
      });
      infoboxHtml += `</div>`;
    }

    const html = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--border-gold); padding-bottom: 15px; flex-wrap: wrap; gap: 10px;">
        <div>
          <span style="font-size: 0.85rem; color: var(--accent-amber); font-weight: 700; text-transform: uppercase;"><i class="fas fa-bookmark"></i> ${escapeHtml(article.category)} Wiki Cikk</span>
          <h1 style="font-family: var(--font-title); color: #fff; font-size: 2rem; margin: 4px 0;">${escapeHtml(article.title)}</h1>
          <p style="color: var(--text-secondary); font-size: 1rem;">${escapeHtml(article.subtitle)}</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${readerButtonHtml}
          <button onclick="openArticleEditor('${articleId}')" style="background: rgba(212,175,55,0.25); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-family: var(--font-body);">
            <i class="fas fa-edit"></i> Szerkesztés
          </button>
          <button onclick="closeWikiArticle()" style="background: rgba(220,38,38,0.25); border: 1px solid var(--accent-red); color: #f87171; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-family: var(--font-body);">
            <i class="fas fa-times"></i> Bezárás
          </button>
        </div>
      </div>

      ${infoboxHtml}

      <div class="article-body-content" style="font-size: 1rem; color: var(--text-primary); line-height: 1.8;">
        ${formatMarkdownContent(article.content, articleId)}
      </div>
      ${navigationHtml}
    `;

    wikiArticleDisplay.innerHTML = html;
    addArticleReadingTools(article);
    
    // Point 1 & Point 17: Esemény kiváltása, hogy a TreeWalker manipulálhassa a DOM-ot
    document.dispatchEvent(new CustomEvent('articleRendered', { 
      detail: { articleId, container: wikiArticleDisplay } 
    }));

    // Render relatedArticles[] chips (relational cross-references from article data)
    const related = article.relatedArticles;
    if (related && related.length > 0 && typeof wikiArticles !== 'undefined') {
      const chips = related
        .filter(rid => wikiArticles[rid])
        .map(rid => {
          const ra = wikiArticles[rid];
          return `<button class="related-article-chip" onclick="openWikiArticle('${ra.id}')">
            <i class="fas fa-link"></i> ${escapeHtml(ra.title)}
          </button>`;
        }).join('');
      if (chips) {
        wikiArticleDisplay.innerHTML += `
          <div class="related-articles-section">
            <div class="related-articles-title"><i class="fas fa-project-diagram"></i> Kapcsolódó Szócikkek</div>
            <div class="related-articles-chips">${chips}</div>
          </div>`;
      }
    }

    wikiArticleDisplay.style.display = 'block';
    const grid = document.getElementById('wiki-articles-grid');
    const header = document.querySelector('#view-wiki-articles .wiki-portal-header');
    if (grid) grid.style.display = 'none';
    if (header) header.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Generic Render Game Wiki Modal
   */
  function renderGameWikiModal(gameData) {
    if (!modal || !gameData) return;

    modalTitle.textContent = gameData.title;

    let html = `
      <div class="wiki-meta-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; background: rgba(10,8,9,0.7); padding: 12px; border-radius: 8px; border: 1px solid var(--border-dark);">
        <div class="wiki-meta-item"><strong>Kiadási Év:</strong> ${gameData.releaseYear || ''}</div>
        <div class="wiki-meta-item"><strong>Fejlesztő:</strong> ${gameData.developer || ''}</div>
        <div class="wiki-meta-item"><strong>Kiadó:</strong> ${gameData.publisher || ''}</div>
        <div class="wiki-meta-item"><strong>Műfaj:</strong> ${gameData.genre || ''}</div>
      </div>

      <div style="font-size: 1rem; color: var(--text-primary); margin-bottom: 20px; line-height: 1.7;">
        ${formatMarkdownContent(gameData.overview)}
      </div>

      <h3 class="wiki-section-title" style="font-family: var(--font-title); color: var(--accent-gold); margin: 20px 0 10px 0; border-bottom: 1px solid var(--border-gold); padding-bottom: 4px;">
        <i class="fas fa-book-open"></i> Történet és Cselekmény (Plot)
      </h3>
      <div style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 25px;">
        ${formatMarkdownContent(gameData.plot)}
      </div>
    `;

    if (gameData.classes && gameData.classes.length > 0) {
      html += `
        <h3 class="wiki-section-title" style="font-family: var(--font-title); color: var(--accent-gold); margin: 20px 0 10px 0; border-bottom: 1px solid var(--border-gold); padding-bottom: 4px;">
          <i class="fas fa-users"></i> Karakterosztályok (Playable Classes)
        </h3>
        <div class="class-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
      `;
      gameData.classes.forEach(c => {
        html += `
          <div class="class-card" style="background: rgba(18,14,16,0.8); border: 1px solid var(--border-dark); padding: 14px; border-radius: 8px;">
            <h4 style="color: #fff; font-size: 1rem; margin-bottom: 4px;">${escapeHtml(c.name)}</h4>
            ${c.specialAbility ? `<span style="font-size: 0.75rem; color: var(--accent-amber); font-weight: 600; display: block; margin-bottom: 4px;">${escapeHtml(c.specialAbility)}</span>` : ''}
            ${c.canonIdentity ? `<p style="font-size: 0.85rem; color: var(--accent-gold); margin-bottom: 5px;"><strong>Eredet/Kánon:</strong> ${escapeHtml(c.canonIdentity)}</p>` : ''}
            <p style="font-size: 0.88rem; color: var(--text-secondary);">${escapeHtml(c.desc)}</p>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (gameData.gameplayFeatures && gameData.gameplayFeatures.length > 0) {
      html += `
        <h3 class="wiki-section-title" style="font-family: var(--font-title); color: var(--accent-gold); margin: 20px 0 10px 0; border-bottom: 1px solid var(--border-gold); padding-bottom: 4px;">
          <i class="fas fa-gamepad"></i> Játékmenet & Egyedi Rendszerek
        </h3>
        <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7;">
      `;
      gameData.gameplayFeatures.forEach(f => {
        html += `<li style="margin-bottom: 6px;">${escapeHtml(f)}</li>`;
      });
      html += `</ul>`;
    }

    modalBody.innerHTML = html;
    modal.classList.add('open');
  }

  /**
   * Open Diablo Fandom Wiki Links & Knowledge Hub Modal
   */
  function openDiabloWikiHubModal() {
    if (!modal || typeof diabloWikiHub === 'undefined') return;

    modalTitle.textContent = diabloWikiHub.title;

    let html = `
      <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
        ${escapeHtml(diabloWikiHub.description)}
      </p>

      <div class="hub-category-title"><i class="fas fa-flag"></i> Magyar Közösségi Portálok & Rajongói Oldalak</div>
      <div class="hub-links-grid">
    `;

    if (diabloWikiHub.hungarianSites) {
      diabloWikiHub.hungarianSites.forEach(s => {
        html += `
          <a class="hub-link-card" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.08);">
            <h4 style="color: var(--accent-gold);">${escapeHtml(s.title)} <i class="fas fa-external-link-alt"></i></h4>
            <p style="color: #fff;">${escapeHtml(s.desc)}</p>
          </a>
        `;
      });
    }

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-gamepad"></i> A Játékok & Kiegészítők (Games & Expansions)</div>
      <div class="hub-links-grid">
    `;

    diabloWikiHub.games.forEach(g => {
      html += `
        <a class="hub-link-card" href="${escapeHtml(g.url)}" target="_blank" rel="noopener">
          <h4>${escapeHtml(g.name)} <i class="fas fa-external-link-alt"></i></h4>
          <p>${escapeHtml(g.desc)}</p>
        </a>
      `;
    });

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-skull"></i> Entitások, Istenségek & Főellenségek</div>
      <div class="hub-links-grid">
    `;

    if (diabloWikiHub.entities) {
      diabloWikiHub.entities.forEach(e => {
        html += `
          <a class="hub-link-card" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">
            <h4>${escapeHtml(e.name)} <i class="fas fa-external-link-alt"></i></h4>
            <p>${escapeHtml(e.desc)}</p>
          </a>
        `;
      });
    }

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-user-shield"></i> Karakterosztályok A Diablo-Sorozatban</div>
      <div class="hub-links-grid">
    `;

    if (diabloWikiHub.allClasses) {
      diabloWikiHub.allClasses.forEach(c => {
        html += `
          <a class="hub-link-card" href="${escapeHtml(c.url)}" target="_blank" rel="noopener">
            <h4>${escapeHtml(c.name)} <i class="fas fa-external-link-alt"></i></h4>
            <p>${escapeHtml(c.desc)}</p>
          </a>
        `;
      });
    }

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-globe-americas"></i> Kozmológia & Birodalmak (Realms & Cosmology)</div>
      <div class="hub-links-grid">
    `;

    diabloWikiHub.realms.forEach(r => {
      html += `
        <a class="hub-link-card" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">
          <h4>${escapeHtml(r.name)} <i class="fas fa-external-link-alt"></i></h4>
          <p>${escapeHtml(r.desc)}</p>
        </a>
      `;
    });

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-shield-alt"></i> Frakciók, Rendek & Szervezetek (Factions & Orders)</div>
      <div class="hub-links-grid">
    `;

    diabloWikiHub.factions.forEach(f => {
      html += `
        <a class="hub-link-card" href="${escapeHtml(f.url)}" target="_blank" rel="noopener">
          <h4>${escapeHtml(f.name)} <i class="fas fa-external-link-alt"></i></h4>
          <p>${escapeHtml(f.desc)}</p>
        </a>
      `;
    });

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-book-dead"></i> Hivatalos Lore Könyvek & Képregények (Lore Books)</div>
      <div class="hub-links-grid">
    `;

    diabloWikiHub.books.forEach(b => {
      html += `
        <a class="hub-link-card" href="${escapeHtml(b.url)}" target="_blank" rel="noopener">
          <h4>${escapeHtml(b.name)} (${escapeHtml(b.year)}) <i class="fas fa-external-link-alt"></i></h4>
          <p style="color: var(--accent-gold); font-size: 0.8rem; margin-bottom: 4px;">Szerző: ${escapeHtml(b.author)}</p>
          <p>${escapeHtml(b.desc)}</p>
        </a>
      `;
    });

    html += `
      </div>

      <div class="hub-category-title"><i class="fas fa-link"></i> Hivatalos Külső Hivatkozások & Források</div>
      <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
    `;

    diabloWikiHub.externalLinks.forEach(l => {
      html += `
        <li style="margin-bottom: 8px;">
          <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener" style="color: var(--accent-gold); font-weight: 600; text-decoration: none;">
            <i class="fas fa-external-link-square-alt"></i> ${escapeHtml(l.title)}
          </a>
        </li>
      `;
    });

    html += `</ul>`;

    modalBody.innerHTML = html;
    modal.classList.add('open');
  }

  /**
   * Ember Particles Background Generator
   */
  function createEmbers() {
    const container = document.getElementById('ember-container');
    if (!container) return;

    for (let i = 0; i < 25; i++) {
      const ember = document.createElement('div');
      ember.className = 'ember';
      
      const size = Math.random() * 5 + 3;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${Math.random() * 100}vw`;
      ember.style.animationDuration = `${Math.random() * 6 + 5}s`;
      ember.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(ember);
    }
  }



  /**
   * Sample test articles for 1-click intelligent classification showcase
   */
  const sampleTestArticles = {
    "tyrael": {
      title: "Tyrael Igazságossága és a Horadrim Rend",
      subtitle: "Az arkangyal halandóvá válása és a mágusok szövetsége",
      content: "Tyrael az Igazságosság Arkangyala, aki szembeszállt az Angiris Council döntésével, hogy megvédje Sanctuaryt. Ĺ hozta létre a Horadrim rendet Tal Rasha és Deckard Cain segítségével. El'druin nevű kardjával sújtott le a sötétségre, majd feláldozta angyali szárnyait és halandóként szállt le a Földre New Tristramnál."
    },
    "mephisto": {
      title: "Mephisto Mesterkedései Kurastban",
      subtitle: "A Gyűlölet Ura és a Zakarum egyház korrupciója",
      content: "Mephisto a Gyűlölet Ura, a három Prime Evil legidősebbike és Lilith apja. Miután a Horadrim Soulstone-ba zárta, Mephisto lassan kisugározta rontását a Zakarum egyház tanácsára Kurast dzsungelében. Miután megrontotta a fópapokat, megszállta Sankekurt és irányította testvéreit, Diablót és Baalt."
    },
    "duplicate_sanctuary": {
      title: "Sanctuary Eredete",
      subtitle: "Új fejezet Lilith és Inarius drámájából",
      content: "A Menedék létrejötte után Lilith szembesült az angyalok és démonok bizonytalanságával. Hogy megvédje nephalem gyermekeit, Lilith egyenként végzett a renegát társaival, amiért Inarius végül az Ürességbe (Void) száműzte őt."
    },
    "duplicate_horadrim": {
      title: "A Horadrim Rend",
      subtitle: "Kiegészítés a mágusrend felbomlásáról",
      content: "A three Prime Evil bezárása után a Horadrim rend lassan elveszítette célját. Tagjai szétszóródtak Kehjistanban, a tudásuk feledésbe merült, míg végül Deckard Cain maradt az utolsó élő Horadrim."
    },
    "soulstone": {
      title: "A Fekete Lélekkő és Zoltun Kulle Titka",
      subtitle: "A hét démoni úr egyesítése egyetlen mágikus kristályban",
      content: "Zoltun Kulle, a renegát Horadrim mágus alkotta meg a Black Soulstone-t (Fekete Lélekkő). Ez a különleges kristály képes volt mind a hét démoni úr esszenciáját magába zárni. A Diablo III során Adria ezt használta fel, hogy feltámassza Diablót mint az egyesült Prime Evilt."
    },
    "raw_unformatted": {
      title: "Malthael a Halál Arkangyala",
      subtitle: "A bölcsesség arkangyalának bukása és a lélekkő megkaparintása",
      content: "Malthael korábban a Bölcsesség Arkangyala és az Angiris Council vezetője volt a High Heavens csarnokaiban.\n\nTörténete:\nMiután a Worldstone elpusztult Mount Arreat csúcsán, Malthael eltűnt a Mennyekből. Évtizedekig tartó bolyongás után arra a következtetésre jutott, hogy minden emberi lény hordozza magában a démoni vért, így el kell pusztítani Sanctuary minden halandóját az Örök Konfliktus lezárásához.\n\n\"And the Heavens shall tremble...\"\n\nErők és Képességek:\nâ€˘ Két kaszájával képes lelkeket elszívni\nâ€˘ Képes az elhunyt nephalemek lelkeit megidézni\nâ€˘ Irányítja a Halál Angyalait (Reapers)\n\nForrások:\nDiablo III Reaper of Souls kánon és Book of Tyrael"
    }
  };

  /**
   * Hungarian morphological stemmer – strips common agglutinative suffixes so
   * inflected forms like "Tyraellel", "DiabloĚnak", "Horadrimok" match base keywords.
   */
  function hungarianStem(word) {
    const suffixes = [
      'képpen','képp','jainak','jeinek','ainak','einek','jaikat','jeiket','aikat','eiket',
      'jának','jének','ának','ének','jával','jével','ával','ével',
      'jaiba','jeibe','aiba','eibe','jaira','jeire','aira','eire',
      'jaik','jeik','aik','eik','jaim','jeim','aim','eim',
      'okat','eket','öket','hoz','hez','höz','val','vel','ban','ben','nak','nek',
      'nál','nél','tól','től','ról','ről','ból','ből','unk','ünk','tok','tek','tök','juk','jük','ink',
      'ja','je','ák','ék','ok','ek','ök','ak','at','et','öt','ot','ba','be','ra','re','on','en','ön','ig',
      'k','t','n','m','d'
    ];
    let w = word;
    for (const suf of suffixes) {
      if (w.length > suf.length + 2 && w.endsWith(suf)) {
        let stemmed = w.slice(0, -suf.length);
        if (stemmed.endsWith('á')) return stemmed.slice(0, -1) + 'a';
        if (stemmed.endsWith('é')) return stemmed.slice(0, -1) + 'e';
        return stemmed;
      }
    }
    return w;
  }

  function tokenizeAndStem(text) {
    return text.toLowerCase()
      .split(/[\s,;:.!?()[\]"'Â«Â»„”–—\-]+/)
      .filter(w => w.length > 2)
      .map(hungarianStem);
  }

  /**
   * Intelligent Wiki Article Auto-Classifier Engine
   * Scans title, subtitle, & text content to automatically determine Wiki Category, Timeline Era, and Infobox metadata.
   */
  function classifyWikiArticle(title = '', subtitle = '', content = '') {
    const combinedText = `${title} ${subtitle} ${content}`.toLowerCase();
    const stemmedTokens = tokenizeAndStem(`${title} ${subtitle} ${content}`);
    
    const categoryRules = [
      {
        category: "Főgonoszok",
        keywords: ["diablo", "mephisto", "baal", "andariel", "duriel", "belial", "azmodan", "astaroth", "prime evil", "lesser evil", "démon", "pokol", "rettegés ura", "gyűlölet ura", "pusztítás ura", "fájdalom ura", "kín úrnője", "hazugság ura", "bűn ura", "tathamet", "skarn"],
        weight: 2.0
      },
      {
        category: "Szereplők",
        keywords: ["tyrael", "imperius", "auriel", "itherael", "malthael", "inarius", "lilith", "rathma", "uldyssian", "deckard cain", "cain", "lorath", "donan", "neyrelle", "leah", "adria", "lazarus", "leoric", "aidan", "lachdanan", "bul-kathos", "vasily", "elias", "prava", "linarian", "jered cain", "arkangyal"],
        weight: 1.9
      },
      {
        category: "Helyszínek",
        keywords: ["tristram", "khanduras", "kehjistan", "caldeum", "kurast", "westmarch", "arreat", "hawezar", "scosglen", "dry steppes", "fractured peaks", "nahantu", "katedrális", "szentély", "város", "régió", "dzsungel", "mocsár", "hegy", "dungeon", "menedék", "sanctuary", "high heavens", "burning hells", "pandemonium"],
        weight: 1.8
      },
      {
        category: "Frakciók",
        keywords: ["horadrim", "zakarum", "vizjerei", "nekromanta", "nekromanták", "druida", "druidák", "angiris council", "cathedral of light", "triune", "edyrem", "viz-jaq'taari", "klán", "rend", "egyház", "szervezet", "kultusz"],
        weight: 1.8
      },
      {
        category: "Ereklyék",
        keywords: ["worldstone", "világkő", "soulstone", "lélekkő", "fekete lélekkő", "black soulstone", "elâ€™druin", "el-druin", "wirt", "horadric cube", "kanai's cube", "harlequin crest", "shako", "rúnaszó", "rúnaszavak", "enigma", "infinity", "grief", "kristály", "ereklye"],
        weight: 2.0
      },
      {
        category: "Kozmogónia",
        keywords: ["anu", "tathamet", "teremtés", "kristályív", "gyöngy", "üresség", "kozmosz", "kozmogónia", "ősprincípium", "első kozmikus háború", "örök konfliktus", "eternal conflict", "fény és sötétség"],
        weight: 2.0
      },
      {
        category: "Sanctuary Eredete",
        keywords: ["renegát", "renegátok", "angyal és démon", "nephalem", "nephalemek", "inarius és lilith", "menedék eredete", "világkő elrablása", "emberiség ősei"],
        weight: 1.9
      },
      {
        category: "Történeti Korszakok",
        keywords: ["sin war", "bűn háborúja", "dark exile", "sötét száműzetés", "korszak", "időszak", "történeti háború"],
        weight: 1.7
      },
      {
        category: "Diablo I (1996)",
        keywords: ["diablo 1", "diablo i", "1258", "1263", "warrior", "rogue", "sorcerer", "monk", "butcher", "archbishop lazarus", "albrecht herceg", "aidan herceg", "csontvázkirály", "skeleton king", "16 szint"],
        weight: 1.9
      },
      {
        category: "Diablo II / D2R",
        keywords: ["diablo 2", "diablo ii", "d2r", "resurrected", "dark wanderer", "sötét vándor", "hellforge", "lut gholein", "lord of destruction", "aranoch", "uber tristram", "torch run"],
        weight: 1.9
      },
      {
        category: "Diablo III / RoS",
        keywords: ["diablo 3", "diablo iii", "reaper of souls", "falling star", "lezuhanó csillag", "malthael", "paragon", "greater rift", "nephalem rift"],
        weight: 1.9
      },
      {
        category: "Diablo IV / VoH",
        keywords: ["diablo 4", "diablo iv", "vessel of hatred", "elias", "vándor", "wanderer", "open world", "helltide", "nightmare dungeon", "the pit", "spiritborn"],
        weight: 1.9
      },
      {
        category: "Könyvtár",
        keywords: ["book of cain", "book of tyrael", "book of adria", "book of lorath", "birthright", "scales of the serpent", "veiled prophet", "regény", "könyv", "trilógia"],
        weight: 1.8
      },
      {
        category: "Közösség & Fórumok",
        keywords: ["hungarian heroes", "hh", "inventory", "d4hungary", "diablo.hu", "diablo2.hu", "diablo3.hu", "cow level", "teényszint", "whimsyshire", "build", "guide"],
        weight: 1.8
      }
    ];

    const scores = {};
    categoryRules.forEach(rule => {
      let score = 0;
      rule.keywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        const kwStemmed = hungarianStem(kwLower);
        // Exact substring match (full weight)
        const exactMatches = (combinedText.match(new RegExp(escapeRegExp(kwLower), 'gi')) || []).length;
        if (exactMatches > 0) {
          score += exactMatches * rule.weight;
        } else {
          // Stemmed token match – catches inflected forms (75% weight)
          const stemLen = Math.max(3, kwStemmed.length - 2);
          const stemMatches = stemmedTokens.filter(tok =>
            tok === kwStemmed || tok.startsWith(kwStemmed.slice(0, stemLen))
          ).length;
          if (stemMatches > 0) {
            score += stemMatches * rule.weight * 0.75;
          } else if (combinedText.includes(kwLower)) {
            score += 0.4 * rule.weight;
          }
        }
      });
      scores[rule.category] = score;
    });

    const sorted = Object.keys(scores)
      .map(cat => ({ category: cat, score: scores[cat] }))
      .sort((a, b) => b.score - a.score);

    const bestMatch = sorted[0].score > 0 ? sorted[0] : { category: "Saját Lore & Észrevétel", score: 1 };
    
    const totalScore = sorted.reduce((acc, curr) => acc + curr.score, 0);
    const confidence = totalScore > 0 ? Math.min(99, Math.max(70, Math.round((bestMatch.score / (totalScore || 1)) * 100 + 30))) : 80;

    // Timeline Era Auto-Detection
    let detectedEra = { id: "lore", name: "íltalános Diablo Lore", gameTag: "Lore" };
    if (combinedText.includes("anu") || combinedText.includes("tathamet") || combinedText.includes("teremtés")) {
      detectedEra = { id: "osidok", name: "1. Ĺsidők & Kozmogónia", gameTag: "Lore" };
    } else if ((combinedText.includes("inarius") && combinedText.includes("lilith")) || combinedText.includes("világkő")) {
      detectedEra = { id: "menedek", name: "2. Sanctuary Létrejötte", gameTag: "Lore" };
    } else if (combinedText.includes("uldyssian") || combinedText.includes("sin war") || combinedText.includes("triune")) {
      detectedEra = { id: "sinwar", name: "3. A Sin War Korszak", gameTag: "Lore" };
    } else if (combinedText.includes("diablo 1") || combinedText.includes("diablo i") || combinedText.includes("leoric") || combinedText.includes("lazarus") || combinedText.includes("tristram")) {
      detectedEra = { id: "diablo1", name: "5. Diablo I Korszak (1258 AK)", gameTag: "Diablo-I" };
    } else if (combinedText.includes("diablo 2") || combinedText.includes("diablo ii") || combinedText.includes("sötét vándor") || combinedText.includes("baal") || combinedText.includes("arreat")) {
      detectedEra = { id: "diablo2", name: "6. Diablo II & LoD Korszak", gameTag: "Diablo-II" };
    } else if (combinedText.includes("diablo 3") || combinedText.includes("diablo iii") || combinedText.includes("malthael") || combinedText.includes("black soulstone")) {
      detectedEra = { id: "diablo3", name: "7. Diablo III & RoS Korszak", gameTag: "Diablo-III" };
    } else if (combinedText.includes("diablo 4") || combinedText.includes("diablo iv") || combinedText.includes("vessel of hatred") || combinedText.includes("neyrelle")) {
      detectedEra = { id: "diablo4", name: "8. Diablo IV & VoH Korszak", gameTag: "Diablo-IV" };
    }

    // Auto-extract infobox key entities
    const detectedEntities = [];
    ["Tyrael", "Diablo", "Mephisto", "Baal", "Lilith", "Inarius", "Horadrim", "Tristram", "Sanctuary", "Zakarum", "Worldstone", "Soulstone"].forEach(ent => {
      if (combinedText.includes(ent.toLowerCase())) detectedEntities.push(ent);
    });

    const infobox = {
      "Besorolt Kategória": bestMatch.category,
      "AI Biztonság": `${confidence}%`,
      "Kapcsolódó Entitások": detectedEntities.length > 0 ? detectedEntities.join(", ") : "íltalános Lore",
      "Szerkesztette": "Okos Cikk Besoroló",
      "Módosítva": new Date().toLocaleDateString('hu-HU')
    };

    return {
      primaryCategory: bestMatch.category,
      confidence: confidence,
      secondaryCategories: sorted.slice(1, 4).filter(s => s.score > 0).map(s => s.category),
      timelineEra: detectedEra,
      extractedInfobox: infobox,
      scores: sorted
    };
  }

  /**
   * Intelligent Duplicate Article Analyzer & Conflict Resolution Engine
   * Determines whether an article already exists and recommends OVERWRITE, MERGE/SUPPLEMENT, or REJECT.
   */
  function analyzeArticleDuplicates(title = '', content = '', editingArticleId = null) {
    if (!title || typeof wikiArticles === 'undefined') {
      return { isDuplicate: false };
    }

    const cleanTitle = title.trim().toLowerCase();
    let matchedArticle = null;
    let maxSimilarity = 0;

    Object.values(wikiArticles).forEach(art => {
      if (editingArticleId && art.id === editingArticleId) return;

      const existingCleanTitle = art.title.trim().toLowerCase();
      
      if (existingCleanTitle === cleanTitle) {
        matchedArticle = art;
        maxSimilarity = 1.0;
      } else if (cleanTitle.length >= 4 && (cleanTitle.includes(existingCleanTitle) || existingCleanTitle.includes(cleanTitle))) {
        const sim = Math.min(cleanTitle.length, existingCleanTitle.length) / Math.max(cleanTitle.length, existingCleanTitle.length);
        if (sim > maxSimilarity && sim >= 0.5) {
          maxSimilarity = sim;
          matchedArticle = art;
        }
      }
    });

    if (!matchedArticle) {
      return { isDuplicate: false };
    }

    const existingContent = (matchedArticle.content || '').trim();
    const newContent = (content || '').trim();

    const existingLen = existingContent.length;
    const newLen = newContent.length;

    let recommendedAction = 'merge';
    let rationale = '';

    if (existingContent === newContent) {
      recommendedAction = 'reject';
      rationale = 'A megadott szöveg 100%-ban megegyezik a meglévő szócikk tartalmával. Az írás elvetése ajánlott.';
    } else if (newLen < existingLen * 0.4 && existingContent.toLowerCase().includes(newContent.toLowerCase().substring(0, Math.min(30, newLen)))) {
      recommendedAction = 'reject';
      rationale = 'Az új bejegyzés sokkal rövidebb az eredetinél és nem tartalmaz új érdemi információt.';
    } else if (newLen > 50 && (!existingContent.includes(newContent.substring(0, Math.min(40, newLen))))) {
      recommendedAction = 'merge';
      rationale = 'Az új bejegyzés értékes új részleteket tartalmaz! A meglévő szócikk kiegészítése (összefűzése) javasolt.';
    } else {
      recommendedAction = 'overwrite';
      rationale = 'Az új szöveg az eredeti szócikk átdolgozott változata. A meglévő cikk felülírása javasolt.';
    }

    return {
      isDuplicate: true,
      matchedArticle: matchedArticle,
      similarity: Math.round(maxSimilarity * 100),
      recommendedAction: recommendedAction,
      rationale: rationale,
      existingContentLength: existingLen,
      newContentLength: newLen
    };
  }

  /**
   * Load Persistent User Articles from IndexedDB (async)
   * Migrates legacy localStorage data on first run.
   */
  async function loadUserSavedArticles() {
    // Migrate legacy localStorage â†’ IndexedDB (Batch transaction)
    try {
      const legacyData = localStorage.getItem('diablo_portal_user_articles');
      if (legacyData) {
        const parsed = JSON.parse(legacyData);
        try { 
          await idbPutBatch(Object.values(parsed)); 
        } catch(e) { 
          console.error('Migration error:', e); 
        }
        localStorage.removeItem('diablo_portal_user_articles');
        console.info('[Wiki] Migrated localStorage articles â†’ IndexedDB via Batch Transaction.');
      }
    } catch(e) {}
    // Load from IndexedDB
    try {
      const articles = await idbGetAll();
      if (articles.length > 0 && typeof wikiArticles !== 'undefined') {
        articles.forEach(art => { wikiArticles[art.id] = art; });
        renderArticleCategoryPills();
        renderWikiArticlesGrid();
        if (totalArticlesEl) totalArticlesEl.textContent = Object.keys(wikiArticles).length;
      }
    } catch(e) {
      console.warn('[Wiki] Could not load from IndexedDB:', e);
    }
  }

  /**
   * Update Smart Classifier & Duplicate Detection Preview UI inside Editor Modal
   */
  function updateSmartClassificationUI(forceAutoSetCategory = false, editingArticleId = null) {
    const titleEl = document.getElementById('editor-title');
    const subtitleEl = document.getElementById('editor-subtitle');
    const contentEl = document.getElementById('editor-content');
    const categoryEl = document.getElementById('editor-category');
    const panelEl = document.getElementById('smart-classifier-panel');

    if (!titleEl || !contentEl || !panelEl) return;

    const result = classifyWikiArticle(titleEl.value, subtitleEl ? subtitleEl.value : '', contentEl.value);
    const dupResult = analyzeArticleDuplicates(titleEl.value, contentEl.value, editingArticleId);

    // Auto-update category input if requested or empty
    if (forceAutoSetCategory || !categoryEl.value.trim() || categoryEl.dataset.autoManaged === "true") {
      categoryEl.value = result.primaryCategory;
      categoryEl.dataset.autoManaged = "true";
    }

    let secondaryChips = '';
    if (result.secondaryCategories && result.secondaryCategories.length > 0) {
      secondaryChips = result.secondaryCategories.map(cat => 
        `<button type="button" onclick="setEditorCategory('${escapeHtml(cat)}')" class="smart-secondary-chip"><i class="fas fa-tag"></i> ${escapeHtml(cat)}</button>`
      ).join(' ');
    }

    let duplicateHtml = '';
    if (dupResult.isDuplicate) {
      duplicateHtml = `
        <div class="duplicate-warning-box">
          <div class="duplicate-header">
            <i class="fas fa-exclamation-triangle" style="color: var(--accent-amber); font-size: 1.1rem;"></i>
            <strong>MEGLÉVĹ SZÓCIKK ÉSZLELVE (Egyezés: ${dupResult.similarity}%):</strong>
          </div>
          <div style="font-size: 0.85rem; color: #fff; margin: 4px 0;">
            A Wikiben már létezik a(z) <strong>"${escapeHtml(dupResult.matchedArticle.title)}"</strong> nevű szócikk (Kategória: <em>${escapeHtml(dupResult.matchedArticle.category)}</em>).
          </div>
          <div class="duplicate-rationale-badge">
            đź§  <strong>Algoritmus Ajánlata:</strong> ${escapeHtml(dupResult.rationale)}
          </div>
          <div class="duplicate-actions-group">
            <label class="dup-radio-label ${dupResult.recommendedAction === 'merge' ? 'selected' : ''}">
              <input type="radio" name="duplicate-resolution-mode" value="merge" ${dupResult.recommendedAction === 'merge' ? 'checked' : ''}>
              <strong>âž• KIEGÉSZÍTÉS (Fűzés):</strong> Új szakasz fűzése a meglévő cikkhez!
            </label>
            <label class="dup-radio-label ${dupResult.recommendedAction === 'overwrite' ? 'selected' : ''}">
              <input type="radio" name="duplicate-resolution-mode" value="overwrite" ${dupResult.recommendedAction === 'overwrite' ? 'checked' : ''}>
              <strong>đź”„ FELÜLÍRíS:</strong> A régi cikk teljes lecserélése az új változatra.
            </label>
            <label class="dup-radio-label ${dupResult.recommendedAction === 'reject' ? 'selected' : ''}">
              <input type="radio" name="duplicate-resolution-mode" value="reject" ${dupResult.recommendedAction === 'reject' ? 'checked' : ''}>
              <strong>â›” ELVETÉS:</strong> Mégsem menti az új szöveget, elveti a módosítást.
            </label>
          </div>
        </div>
      `;
    }

    panelEl.innerHTML = `
      ${duplicateHtml}
      <div class="smart-classifier-box">
        <div class="smart-classifier-header">
          <span class="smart-ai-badge"><i class="fas fa-brain"></i> Algoritmus Döntése</span>
          <span class="smart-confidence-badge">${result.confidence}% Biztonság</span>
        </div>
        <div class="smart-classifier-main">
          <div class="smart-category-result">
            <i class="fas fa-folder-open smart-folder-icon"></i>
            <div>
              <div class="smart-label">Beillesztési Kategória:</div>
              <div class="smart-category-title">${escapeHtml(result.primaryCategory)}</div>
            </div>
          </div>
          <button type="button" onclick="setEditorCategory('${escapeHtml(result.primaryCategory)}')" class="btn-apply-category">
            <i class="fas fa-check"></i> Kategória Elfogadása
          </button>
        </div>

        ${secondaryChips ? `
          <div class="smart-alternatives-row">
            <span class="smart-alt-label">Alternatív javaslatok:</span>
            <div class="smart-chips-container">${secondaryChips}</div>
          </div>
        ` : ''}

        <div class="smart-era-row">
          <i class="fas fa-clock" style="color: var(--accent-gold);"></i> 
          <strong>Idővonal Korszak Ajánlat:</strong> ${escapeHtml(result.timelineEra.name)} 
          <span class="game-badge ${result.timelineEra.gameTag}" style="margin-left: 6px; font-size: 0.7rem;">${result.timelineEra.gameTag}</span>
        </div>
      </div>
    `;
  };

  /**
   * Set category manually via UI pill
   */
  function setEditorCategory(catName) {
    const categoryEl = document.getElementById('editor-category');
    if (categoryEl) {
      categoryEl.value = catName;
      categoryEl.dataset.autoManaged = "false";
      
      categoryEl.classList.remove('flash-success');
      // Trigger reflow to restart animation if clicked repeatedly
      void categoryEl.offsetWidth;
      categoryEl.classList.add('flash-success');
    }
  };

  /**
   * 1-Click Auto-Format Button Handler for the Editor Modal
   * A szovegformazas Web Workerre van kiszervezve, a fonek nem fagy le.
   */
  function autoFormatEditorContent() {
    const contentEl = document.getElementById('editor-content');
    const formatBtn = document.querySelector('.btn-auto-format');
    if (!contentEl) return;

    const raw = contentEl.value;
    if (!raw.trim()) {
      alert('Keerjuk irj be valamilyen szoveget a formatas elott!');
      return;
    }

    // Spinner UI: gomb letiltasa feldolgozas kozben
    if (formatBtn) {
      formatBtn.disabled = true;
      formatBtn.textContent = 'âŹł Formázás folyamatban...';
    }

    // Web Worker elérheto-e?
    if (window.Worker) {
      const worker = new Worker('./format.worker.js');
      const taskId = Date.now();

      worker.onmessage = function(e) {
        if (e.data.taskId !== taskId) return;
        worker.terminate();
        if (e.data.error) {
          console.error('[FormatWorker]', e.data.error);
          // Fallback: fonek feldolgozas
          contentEl.value = sanitizeHtml(autoFormatWikiArticle(raw));
        } else {
          // Point 4: Szanitizálás a szálon kívülről érkező adatokra is
          contentEl.value = sanitizeHtml(e.data.formatted);
        }
        updateSmartClassificationUI(false);
        if (formatBtn) {
          formatBtn.disabled = false;
          formatBtn.textContent = 'âś¨ Automatikus Formázás (Auto-Format)';
        }
        
        contentEl.classList.remove('flash-success');
        void contentEl.offsetWidth;
        contentEl.classList.add('flash-success');
      };

      worker.onerror = function(err) {
        console.error('[FormatWorker] Hiba:', err);
        worker.terminate();
        // Szinkron fallback
        contentEl.value = autoFormatWikiArticle(raw);
        if (formatBtn) {
          formatBtn.disabled = false;
          formatBtn.textContent = 'âś¨ Automatikus Formázás (Auto-Format)';
        }
        updateSmartClassificationUI(false);
      };

      worker.postMessage({ raw, taskId });
    } else {
      // Szinkron fallback ha Worker nem tamogatott
      contentEl.value = autoFormatWikiArticle(raw);
      updateSmartClassificationUI(false);
      if (formatBtn) {
        formatBtn.disabled = false;
        formatBtn.textContent = 'âś¨ Automatikus Formázás (Auto-Format)';
      }
      contentEl.style.borderColor = '#10b981';
      contentEl.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
      setTimeout(() => {
        contentEl.style.borderColor = 'var(--border-gold)';
        contentEl.style.boxShadow = 'none';
      }, 1200);
    }
  };

  /**
   * Load sample test article into editor for 1-click verification
   */
  function loadSampleArticleToEditor(sampleKey) {
    if (!sampleTestArticles[sampleKey]) return;
    const sample = sampleTestArticles[sampleKey];
    
    document.getElementById('editor-title').value = sample.title;
    document.getElementById('editor-subtitle').value = sample.subtitle;
    document.getElementById('editor-content').value = sample.content;

    updateSmartClassificationUI(true);
  };

  /**
   * Open Mobile-Friendly Article Editor Modal with Intelligent Classifier & Duplicate Detector
   */
  function openArticleEditor(articleId = null) {
    if (!modal) return;
    
    const isNew = !articleId || typeof wikiArticles === 'undefined' || !wikiArticles[articleId];
    const article = isNew ? {
      id: '',
      category: '',
      title: 'Tyrael és az Igazságosság Kardja',
      subtitle: 'A Horadrim rend megalapítása és az Angiris Council döntése',
      content: 'Tyrael az Igazságosság Arkangyala, aki szembeszállt az angyali Angiris Council fegyelmével Sanctuary védelmében. Horadrim rendet alapított Deckard Cain és Tal Rasha oldalán, hogy a Lélekkövekkel (Soulstone) elkapják a Pokol három Prime Evil démonurát.'
    } : wikiArticles[articleId];

    const targetId = isNew ? '' : articleId;

    modalTitle.textContent = isNew ? 'Új szócikk írása és besorolása' : `${article.title} szerkesztése`;
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        
        <!-- Smart Classifier Banner -->
        <div style="font-size: 0.88rem; color: #fff; background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(153,27,27,0.25)); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--accent-gold);">
          đź§  <strong>Intelligens Cikk Beillesztő Engine:</strong> Írd be a szócikk nevét és tartalmát! Az algoritmus automatikusan formázza a szöveget, kiszámítja a kategóriát, és ha a cikk már szerepel a Wikiben, eldönti, hogy <strong>kiegészítse (fűzze)</strong>, <strong>felülírja</strong>, vagy <strong>elvesse</strong> az írást!
        </div>

        <!-- Sample Article Test Launcher -->
        <div style="background: rgba(10,8,9,0.7); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-dark);">
          <div style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 700; margin-bottom: 8px;">
            <i class="fas fa-vial"></i> TESZTELÉS 1-KATTINTíSSAL (Új cikkek, formázás és duplikátum vizsgálat):
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" onclick="loadSampleArticleToEditor('tyrael')" class="btn-sample-preset">đź—ˇď¸Ź Új Cikk: Tyrael</button>
            <button type="button" onclick="loadSampleArticleToEditor('mephisto')" class="btn-sample-preset">đźŤ Új Cikk: Mephisto</button>
            <button type="button" onclick="loadSampleArticleToEditor('raw_unformatted')" class="btn-sample-preset" style="border-color: var(--accent-gold); color: #fff; background: rgba(212,175,55,0.2);">âś¨ Nyers Szöveg Formázáshoz</button>
            <button type="button" onclick="loadSampleArticleToEditor('duplicate_sanctuary')" class="btn-sample-preset" style="border-color: var(--accent-amber); color: var(--accent-amber);">đź” Létező: Sanctuary Eredete</button>
          </div>
        </div>

        <!-- Smart Classifier & Duplicate Live Preview Panel -->
        <div id="smart-classifier-panel"></div>

        <div>
          <label style="display: block; color: var(--accent-gold); font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">
            Kategória (Automatikus vagy kézi felülbírálás):
          </label>
          <input type="text" id="editor-category" data-auto-managed="true" value="${escapeHtml(article.category)}" placeholder="Automatikus besorolás folyamatban..." style="width: 100%; padding: 10px; background: rgba(10,8,9,0.9); border: 1px solid var(--border-gold); color: #fff; border-radius: 6px; font-family: var(--font-body); font-size: 0.95rem;">
        </div>

        <div>
          <label style="display: block; color: var(--accent-gold); font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">Szócikk Címe:</label>
          <input type="text" id="editor-title" value="${escapeHtml(article.title)}" oninput="updateSmartClassificationUI(false, '${targetId}')" style="width: 100%; padding: 10px; background: rgba(10,8,9,0.9); border: 1px solid var(--border-gold); color: #fff; border-radius: 6px; font-family: var(--font-body); font-size: 1rem; font-weight: 600;">
        </div>

        <div>
          <label style="display: block; color: var(--accent-gold); font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">Alcím (Rövid összefoglaló):</label>
          <input type="text" id="editor-subtitle" value="${escapeHtml(article.subtitle)}" oninput="updateSmartClassificationUI(false, '${targetId}')" style="width: 100%; padding: 10px; background: rgba(10,8,9,0.9); border: 1px solid var(--border-gold); color: #fff; border-radius: 6px; font-family: var(--font-body); font-size: 0.9rem;">
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="color: var(--accent-gold); font-weight: 600; font-size: 0.85rem;">Cikk Szövege / Tartalma:</label>
            <button type="button" onclick="autoFormatEditorContent()" class="btn-auto-format" title="Nyers szöveg automatikus átalakítása Markdown alcímekké, idézetekké és kiemelésekké">
              âś¨ Automatikus Formázás (Auto-Format)
            </button>
          </div>
          <textarea id="editor-content" rows="8" oninput="updateSmartClassificationUI(false, '${targetId}')" style="width: 100%; padding: 10px; background: rgba(10,8,9,0.9); border: 1px solid var(--border-gold); color: #fff; border-radius: 6px; font-family: var(--font-body); font-size: 0.9rem; line-height: 1.6; resize: vertical;">${escapeHtml(article.content)}</textarea>
        </div>

        <!-- Add to Timeline Checkbox -->
        <div style="background: rgba(18,14,16,0.8); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-dark); display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="editor-add-timeline" checked style="width: 18px; height: 18px; accent-color: var(--accent-gold); cursor: pointer;">
          <label for="editor-add-timeline" style="color: #fff; font-size: 0.9rem; cursor: pointer; font-weight: 600;">
            đź“Ť Beillesztés a Teljes Idővonal streambe is az detektált korszak alapján!
          </label>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; justify-content: space-between;">
          <button onclick="saveArticleFromEditor('${targetId}')" style="background: linear-gradient(135deg, var(--accent-red), #991b1b); border: 1px solid var(--border-gold); color: #fff; padding: 12px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.95rem; flex: 1; min-width: 120px; box-shadow: 0 4px 15px rgba(153,27,27,0.4);">
            <i class="fas fa-save"></i> đź’ľ Cikk Mentése & Feldolgozása
          </button>
          ${!isNew ? `
            <button onclick="resetArticleToCanon('${targetId}')" style="background: rgba(255,255,255,0.08); border: 1px solid var(--border-dark); color: var(--text-muted); padding: 12px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
              <i class="fas fa-undo"></i> Alapértelmezés
            </button>
          ` : ''}
          <button onclick="closeModal()" style="background: rgba(220,38,38,0.2); border: 1px solid var(--accent-red); color: #f87171; padding: 12px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
            Mégse
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    updateSmartClassificationUI(true, targetId);
  };

  /**
   * Check Storage Quota proactively before saving (Point 9)
   */
  async function checkStorageQuota(requiredBytes = 5000) {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.usage) {
        const available = estimate.quota - estimate.usage;
        if (available < requiredBytes) {
          alert(`Kritikus tárhelyhiány! Csak ${(available/1024).toFixed(2)} KB maradt. Kérjük, törölj néhány cikket!`);
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Save Article Changes to memory & localStorage with Duplicate Handling & Timeline Auto-Insertion
   */
  async function saveArticleFromEditor(articleId) {
    if (!(await checkStorageQuota(10000))) return;

    const title = document.getElementById('editor-title').value.trim();
    const subtitle = document.getElementById('editor-subtitle').value.trim();
    const content = document.getElementById('editor-content').value;
    let category = document.getElementById('editor-category').value.trim();
    const addToTimeline = document.getElementById('editor-add-timeline')?.checked;

    if (!title || !content) {
      alert('Kérjük töltsd ki a cikk címét és tartalmát!');
      return;
    }

    const classification = classifyWikiArticle(title, subtitle, content);
    if (!category) {
      category = classification.primaryCategory;
    }

    // Duplicate Check & Resolution Logic
    const dupResult = analyzeArticleDuplicates(title, content, articleId);

    if (dupResult.isDuplicate) {
      const selectedMode = document.querySelector('input[name="duplicate-resolution-mode"]:checked')?.value || dupResult.recommendedAction;
      const matchedArt = dupResult.matchedArticle;

      if (selectedMode === 'reject') {
        alert(`â›” ELVETVE: A(z) "${matchedArt.title}" szócikk már megtalálható a Wikiben! Az új bejegyzés nem lett elmentve.`);
        closeModal();
        openWikiArticle(matchedArt.id);
        return;
      }

      if (selectedMode === 'merge') {
        const dateStr = new Date().toLocaleDateString('hu-HU');
        const appendedContent = `${matchedArt.content}\n\n---\n### đź“ť Kiegészítés (${dateStr}):\n${content}`;
        
        wikiArticles[matchedArt.id].content = appendedContent;
        if (subtitle) wikiArticles[matchedArt.id].subtitle = subtitle;
        if (!wikiArticles[matchedArt.id].infobox) wikiArticles[matchedArt.id].infobox = {};
        wikiArticles[matchedArt.id].infobox["Utolsó Kiegészítés"] = dateStr;

        try {
          await idbPut(wikiArticles[matchedArt.id]);
        } catch(e) {
          alert('Tárhely hiba! Nem sikerült elmenteni a cikket (lehet hogy megtelt a kvóta?). Hiba: ' + e.message);
          return;
        }

        renderArticleCategoryPills();
        renderWikiArticlesGrid();
        closeModal();
        openWikiArticle(matchedArt.id);
        return;
      }

      if (selectedMode === 'overwrite') {
        wikiArticles[matchedArt.id].title = title;
        wikiArticles[matchedArt.id].subtitle = subtitle || matchedArt.subtitle;
        wikiArticles[matchedArt.id].content = content;
        wikiArticles[matchedArt.id].category = category;

        try {
          await idbPut(wikiArticles[matchedArt.id]);
        } catch(e) {
          alert('Tárhely hiba! Nem sikerült elmenteni a cikket. Hiba: ' + e.message);
          return;
        }

        renderArticleCategoryPills();
        renderWikiArticlesGrid();
        closeModal();
        openWikiArticle(matchedArt.id);
        return;
      }
    }

    const idToSave = articleId || ('user-article-' + Date.now());

    if (typeof wikiArticles !== 'undefined') {
      const existingInfobox = wikiArticles[idToSave]?.infobox || classification.extractedInfobox;

      wikiArticles[idToSave] = {
        id: idToSave,
        category: category,
        title: title,
        subtitle: subtitle || title,
        infobox: existingInfobox,
        content: content
      };

      // Persist to IndexedDB (non-blocking, but wrapped in try/catch for transparent UI error handling)
      try {
        await idbPut(wikiArticles[idToSave]);
      } catch(e) {
        alert('Végzetes hiba! Nem sikerült az adatbázisba írni. Hiba: ' + e.message);
        return;
      }
    }

    // Add to timeline stream if checked
    if (addToTimeline && typeof timelineData !== 'undefined') {
      const timelineEvent = {
        id: 'user-event-' + Date.now(),
        eraId: classification.timelineEra.id,
        eraName: classification.timelineEra.name,
        date: 'Új Lore Bejegyzés',
        title: title,
        gameTag: classification.timelineEra.gameTag,
        source: 'Saját Wiki Bejegyzés',
        summary: subtitle || title,
        description: content,
        details: `Automatikusan beillesztve a [${category}] kategóriába és a [${classification.timelineEra.name}] idővonalra.`
      };

      // Insert at beginning of timeline
      timelineData.unshift(timelineEvent);
      renderEraPills();
      renderTimeline();
    }

    // Update statistics counter
    if (totalArticlesEl) totalArticlesEl.textContent = Object.keys(wikiArticles).length;
    if (totalCountEl) totalCountEl.textContent = typeof timelineData !== 'undefined' ? timelineData.length : 0;

    renderArticleCategoryPills();
    renderWikiArticlesGrid();
    closeModal();

    // Show saved article in display box
    openWikiArticle(idToSave);
  };

  /**
   * Reset user article to canon – removes from IndexedDB then reloads page.
   */
  function resetArticleToCanon(articleId) {
    if (!articleId) return;
    idbDelete(articleId).then(() => {
      if (typeof wikiArticles !== 'undefined' && wikiArticles[articleId]) {
        location.reload();
      }
    });
  };

  /**
   * Open Lore Highlight Modal
   */
  function openHighlightModal(title, desc) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary);">${formatMarkdownContent(desc)}</p>`;
    modal.classList.add('open');
  }
  function closeModal() {
    if (modal) modal.classList.remove('open');
  }

  // Expose all inline event handler functions to the global window object
  // This is required because the script is wrapped in an IIFE.
  window.continueReading = continueReading;
  window.restoreDiabloPortalData = restorePortalData;
  window.openBookReader = openBookReader;
  window.turnBookPage = turnBookPage;
  window.toggleBookBookmark = toggleBookBookmark;
  window.removeBookBookmark = removeBookBookmark;
  window.openWikiArticle = openWikiArticle;
  window.closeWikiArticle = closeWikiArticle;
  window.openArticleEditor = openArticleEditor;
  window.saveArticleFromEditor = saveArticleFromEditor;
  window.resetArticleToCanon = resetArticleToCanon;
  window.openHighlightModal = openHighlightModal;
  window.closeModal = closeModal;
  window.openDiabloWikiHubModal = openDiabloWikiHubModal;
  window.loadSampleArticleToEditor = loadSampleArticleToEditor;
  window.autoFormatEditorContent = autoFormatEditorContent;
  window.setEditorCategory = setEditorCategory;

})();



