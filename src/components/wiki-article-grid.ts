import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles';
import './wiki-article-card';
import { articleUniverseId } from '../universe/article-universes.ts';
import { diabloTimelineEras, diabloTimelineEvents } from '../data/diabloChronology.ts';
import { creativeWorkRegistry, sourceRegistry } from '../research/registry.ts';

@customElement('wiki-article-grid')
export class WikiArticleGrid extends LitElement {
  @state() private searchQuery = useAppStore.getState().currentSearchQuery;
  @state() private activeCategory = useAppStore.getState().activeCategory;
  @state() private categories: string[] = [];
  @state() private activeUniverseId = useAppStore.getState().activeUniverseId;
  @state() private currentHeroIndex = 0;
  private heroInterval: ReturnType<typeof setInterval> | undefined;
  @state() private heroPaused = false;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.searchQuery = state.currentSearchQuery;
      this.activeCategory = state.activeCategory;
      this.activeUniverseId = state.activeUniverseId;
      this.categories = Array.from(new Set(Object.values(wikiArticles).filter(article => articleUniverseId(article) === state.activeUniverseId && article.type !== 'chapter' && article.type !== 'book').map(article => article.category)));
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const cats = Array.from(new Set(Object.values(wikiArticles).filter(article => articleUniverseId(article) === this.activeUniverseId && article.type !== 'chapter' && article.type !== 'book').map((a: any) => a.category)));
    this.categories = cats;

    this.heroInterval = setInterval(() => {
      if (!this.heroPaused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !this.querySelector('.hero-slider')?.contains(document.activeElement)) this.currentHeroIndex = (this.currentHeroIndex + 1) % 4;
    }, 6000);
  }

  disconnectedCallback() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    super.disconnectedCallback();
  }

  createRenderRoot() {
    return this; // Disable shadow DOM for grid layout so Tailwind can easily size it
  }

  private handleSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    useAppStore.setSearchQuery(target.value);
  }

  private setCategory(cat: string | null) {
    useAppStore.setActiveCategory(cat);
  }

  private openArticle(id: string) { useAppStore.openArticleRoute(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  private renderDirectory(filtered: any[]) {
    return html`
      <section class="codex-directory" aria-labelledby="article-library-title">
        <header class="article-library-heading">
          <span aria-hidden="true">— ❖ —</span>
          <h1 id="article-library-title">Sanctuary Kódexe</h1>
          <p>Krónikák, személyek, helyszínek és a Pokol titkai</p>
        </header>
        <div class="article-filters" style="display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <label class="sr-only" for="article-search">Keresés a cikkek között</label>
            <input id="article-search" type="search" placeholder="Keresés a cikkek között..." .value=${this.searchQuery} @input=${this.handleSearch} style="flex: 1; min-width: min(250px, 100%);" />
            <div class="article-category-list" aria-label="Játék-szűrők" style="background: rgba(139,0,0,0.15); border: 1px solid rgba(139,0,0,0.3); border-radius: 6px; padding: 4px;">
              ${[
                { id: 'ALL', label: 'Minden játék' },
                { id: 'Diablo I', label: 'D1' },
                { id: 'Diablo II', label: 'D2' },
                { id: 'Diablo III', label: 'D3' },
                { id: 'Diablo IV', label: 'D4' },
                { id: 'Immortal', label: 'Immortal' }
              ].map(g => html`<button class=${useAppStore.getState().activeGameTag === g.id ? 'active' : ''} style="padding: 5px 12px; font-size: 0.8rem;" @click=${() => { useAppStore.setGameTag(g.id); this.requestUpdate(); }}>${g.label}</button>`)}
            </div>
          </div>
          <div class="article-category-list" aria-label="Cikk-kategóriák">
            <button class=${!this.activeCategory ? 'active' : ''} aria-pressed=${!this.activeCategory} @click=${() => this.setCategory(null)}>Összes</button>
            ${this.categories.map(cat => html`<button class=${this.activeCategory === cat ? 'active' : ''} aria-pressed=${this.activeCategory === cat} @click=${() => this.setCategory(cat)}>${cat}</button>`)}
          </div>
        </div>
        <p class="directory-result-count" aria-live="polite">${filtered.length} cikk</p>
        <div class="article-card-grid">
          ${filtered.map((article: any) => html`<wiki-article-card .id=${article.id} .title=${article.title} .subtitle=${article.subtitle} .category=${article.category}></wiki-article-card>`)}
        </div>
      </section>`;
  }

  render() {
    let filtered = Object.values(wikiArticles).filter(article => articleUniverseId(article) === this.activeUniverseId && article.type !== 'chapter' && article.type !== 'book');

    if (this.activeCategory) {
      filtered = filtered.filter((a: any) => a.category === this.activeCategory || (this.activeCategory === 'Karakterek' && /^(Karakterek|Szereplők)/.test(a.category)));
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((a: any) =>
        a.title.toLowerCase().includes(q) || 
        (a.subtitle && a.subtitle.toLowerCase().includes(q))
      );
    }

    const activeGameTag = useAppStore.getState().activeGameTag;
    if (activeGameTag && activeGameTag !== 'ALL') {
      const tagLower = activeGameTag.toLowerCase();
      filtered = filtered.filter((a: any) =>
        (a.category && a.category.toLowerCase().includes(tagLower)) ||
        (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(tagLower))) ||
        (a.title && a.title.toLowerCase().includes(tagLower)) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(tagLower))
      );
    }

    const allArticles = Object.values(wikiArticles).filter(article => articleUniverseId(article) === this.activeUniverseId && article.type !== 'chapter' && article.type !== 'book') as any[];
    const countBy = (term: string) => allArticles.filter(a => String(a.category).toLocaleLowerCase('hu').includes(term)).length;
    const featuredItems = [
      { articleId: 'prime-lesser-evils', image: 'featured-seven-evils-v1.jpg' },
      { articleId: 'sanctuary-full-lexicon', image: 'featured-sanctuary-v1.jpg' },
      { articleId: 'dark-exile', image: 'featured-dark-exile-v1.jpg' },
      { articleId: 'kozmogonia', image: 'featured-cosmology-v1.jpg' },
    ].map(item => ({ ...item, article: wikiArticles[item.articleId] })).filter(item => Boolean(item.article));
    const eras = diabloTimelineEras.slice(0, 6);
    return html`
      <div class="desktop-codex-dashboard">
        <div class="codex-dashboard-main">

          <!-- 1. Hero Slider (Forgó Kiemelt Cikk Banner) -->
          <div class="hero-slider" aria-label="Kiemelt tartalmak">
            <button class="hero-pause" aria-pressed=${this.heroPaused} @click=${() => this.heroPaused = !this.heroPaused}>${this.heroPaused ? 'Vetítés folytatása' : 'Vetítés szüneteltetése'}</button>
            ${featuredItems.map(({ article, image }, index) => html`
              <div ?inert=${this.currentHeroIndex !== index} aria-hidden=${this.currentHeroIndex !== index} class="hero-slide ${this.currentHeroIndex === index ? 'hero-slide--active' : ''}" style="background-image: url('${import.meta.env.BASE_URL}assets/${image}')">
                <div class="hero-slide-content">
                  <span class="hero-slide-badge">${article.category}</span>
                  <h2 class="hero-slide-title">${article.title}</h2>
                  <p class="hero-slide-subtitle">${article.subtitle || 'Fedezd fel Sanctuary világának titkait.'}</p>
                  <button class="hero-slide-btn" @click=${() => this.openArticle(article.id)}>Cikk olvasása ›</button>
                </div>
              </div>
            `)}
          </div>

          <!-- 2. Vizuális Kategória Könyvtár (Fandom-stílusú belépő) -->
          <section class="visual-directory" aria-label="Főkategóriák">
            <button type="button" class="v-category-card" @click=${() => { this.setCategory('Karakterek'); document.querySelector('.codex-directory')?.scrollIntoView({behavior:'smooth'}); }} style="background-image: url('${import.meta.env.BASE_URL}assets/featured-seven-evils-v1.jpg')">
              <div class="v-category-content">
                <i class="fa-solid fa-users v-category-icon"></i>
                <h3 class="v-category-title">Karakterek</h3>
              </div>
            </button>
            <button type="button" class="v-category-card" @click=${() => { this.setCategory('Helyszínek'); document.querySelector('.codex-directory')?.scrollIntoView({behavior:'smooth'}); }} style="background-image: url('${import.meta.env.BASE_URL}assets/featured-sanctuary-v1.jpg')">
              <div class="v-category-content">
                <i class="fa-solid fa-map-location-dot v-category-icon"></i>
                <h3 class="v-category-title">Helyszínek</h3>
              </div>
            </button>
            <button type="button" class="v-category-card" @click=${() => { this.setCategory('Frakciók'); document.querySelector('.codex-directory')?.scrollIntoView({behavior:'smooth'}); }} style="background-image: url('${import.meta.env.BASE_URL}assets/featured-cosmology-v1.jpg')">
              <div class="v-category-content">
                <i class="fa-solid fa-shield-halved v-category-icon"></i>
                <h3 class="v-category-title">Frakciók</h3>
              </div>
            </button>
            <button type="button" class="v-category-card" @click=${() => { this.setCategory('Karakterek – Angyalok & Démonok'); document.querySelector('.codex-directory')?.scrollIntoView({behavior:'smooth'}); }} style="background-image: url('${import.meta.env.BASE_URL}assets/featured-dark-exile-v1.jpg')">
              <div class="v-category-content">
                <i class="fa-solid fa-dragon v-category-icon"></i>
                <h3 class="v-category-title">Szörnyek</h3>
              </div>
            </button>
          </section>
          <dl class="codex-stat-strip">
            ${[['Cikkek', allArticles.length, 'fa-scroll'], ['Karakterek', countBy('karakter'), 'fa-user-shield'], ['Helyszínek', countBy('helyszín'), 'fa-compass'], ['Események', diabloTimelineEvents.length, 'fa-sun'], ['Könyvek', creativeWorkRegistry.length, 'fa-book-open'], ['Források', sourceRegistry.length, 'fa-file-lines']].map(([label,value,icon]) => html`<div><i class="fa-solid ${icon}" aria-hidden="true"></i><dt>${label}</dt><dd>${value}</dd></div>`)}
          </dl>
          <section id="codex-appearances" class="dashboard-section" aria-labelledby="featured-title"><h2 id="featured-title">Kiemelt cikkek</h2><div id="codex-gallery" class="featured-codex-grid">
            ${featuredItems.map(({ article, image }) => html`<button class="featured-codex-card" @click=${() => this.openArticle(article.id)}><img src=${`${import.meta.env.BASE_URL}assets/${image}`} alt="${article.title} – kiemelt illusztráció" loading="lazy"><span class="featured-card-copy"><small>${article.category}</small><strong>${article.title}</strong><span>${article.subtitle || 'Fedezd fel Sanctuary krónikáját.'}</span></span></button>`)}
          </div></section>
          <div class="dashboard-compendium">
            <section id="codex-powers" class="engraved-panel"><h2>Képességei és hatalma</h2><p>Diablo a rettegést fegyverként használja: félelmet kelt, megrontja az emberi akaratot, és a Pokol erejével formálja át környezetét.</p><button class="panel-action" @click=${() => this.openArticle('prime-lesser-evils')}>A pokoli urak képességei</button></section>
            <section id="codex-relations" class="engraved-panel"><h2>Kapcsolatai</h2><p>Mephisto és Baal testvére, az Angiris Tanács ősi ellenfele, Sanctuary hőseinek és a Horadrim rendnek visszatérő nemezise.</p><button class="panel-action" @click=${() => this.openArticle('prime-lesser-evils')}>Kapcsolati áttekintés</button></section>
          </div>
          <div class="dashboard-lower-grid">
            <section id="codex-history" class="engraved-panel"><h2>Története és frissítései</h2><ul>${allArticles.slice(-4).reverse().map(article => html`<li><button @click=${() => this.openArticle(article.id)}><span>✥ ${article.title}</span><small>megnyitás ›</small></button></li>`)}</ul><button class="panel-action" @click=${() => document.querySelector('.codex-directory')?.scrollIntoView({behavior:'smooth'})}>Összes cikk megtekintése</button></section>
            <section id="codex-sources" class="engraved-panel featured-source"><h2>Kiemelt forrás</h2><div><span class="book-cover" aria-hidden="true">DIABLO<br><small>THE SIN WAR</small></span><p><strong>${creativeWorkRegistry[0]?.title ?? 'The Sin War'}</strong><br><small>${creativeWorkRegistry[0]?.authors.join(', ')}</small></p></div><button class="panel-action" @click=${() => useAppStore.setActiveTab('sources')}>Forrás megnyitása</button></section>
            <blockquote id="codex-quotes" class="engraved-panel dashboard-quote">„Az emberek azt hiszik, a pokol mélyén lakozunk. Nem. A pokol bennük van.”<cite>— Mephisto</cite></blockquote>
          </div>
        </div>
        <aside class="codex-dashboard-rail" aria-label="Codex gyorsnavigáció">
          <section class="engraved-panel"><h2>Tartalomjegyzék</h2><nav>${[['Alapinformációk','codex-basic'],['Megjelenései','codex-appearances'],['Története','codex-history'],['Képességei és hatalma','codex-powers'],['Kapcsolatai','codex-relations'],['Idézetek','codex-quotes'],['Források','codex-sources'],['Galéria','codex-gallery']].map(([item,target]) => html`<button @click=${() => document.getElementById(target)?.scrollIntoView({behavior:'smooth', block:'start'})}>◇ ${item}</button>`)}</nav></section>
          <section class="engraved-panel mini-timeline"><h2>Idővonal <button @click=${() => useAppStore.setActiveTab('timeline')}>Teljes idővonal ›</button></h2><ol>${eras.map(era => html`<li><span>${era.name}</span><small>${diabloTimelineEvents.filter(event => event.eraId === era.id).length} esemény</small></li>`)}</ol><button class="panel-action" @click=${() => useAppStore.setActiveTab('timeline')}>Időgép megnyitása</button></section>
        </aside>
      </div>
      <div class="article-codex-frame">${this.renderDirectory(filtered)}</div>`;
  }
}
