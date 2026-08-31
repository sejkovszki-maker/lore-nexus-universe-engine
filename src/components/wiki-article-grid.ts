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

  private openArticle(id: string) { useAppStore.openArticleRoute(id); }

  private renderDirectory(filtered: any[]) {
    return html`
      <section class="codex-directory" aria-labelledby="article-library-title">
        <header class="article-library-heading">
          <span aria-hidden="true">— ❖ —</span>
          <h1 id="article-library-title">Sanctuary Kódexe</h1>
          <p>Krónikák, személyek, helyszínek és a Pokol titkai</p>
        </header>
        <div class="article-filters">
          <label class="sr-only" for="article-search">Keresés a cikkek között</label>
          <input id="article-search" type="search" placeholder="Keresés a cikkek között..." .value=${this.searchQuery} @input=${this.handleSearch} />
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
      filtered = filtered.filter((a: any) => a.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((a: any) => 
        a.title.toLowerCase().includes(q) || 
        (a.subtitle && a.subtitle.toLowerCase().includes(q))
      );
    }

    const allArticles = Object.values(wikiArticles).filter(article => articleUniverseId(article) === this.activeUniverseId && article.type !== 'chapter' && article.type !== 'book') as any[];
    const countBy = (term: string) => allArticles.filter(a => String(a.category).toLocaleLowerCase('hu').includes(term)).length;
    const preferredIds = ['prime-lesser-evils', 'sanctuary-full-lexicon', 'dark-exile'];
    const featured = [...preferredIds.map(id => wikiArticles[id]).filter(Boolean), ...allArticles].filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i).slice(0, 4);
    const featuredImages = ['featured-seven-evils-v1.jpg', 'featured-sanctuary-v1.jpg', 'featured-dark-exile-v1.jpg', 'featured-cosmology-v1.jpg'];
    const eras = diabloTimelineEras.slice(0, 6);
    return html`
      <div class="desktop-codex-dashboard">
        <div class="codex-dashboard-main">
          <section id="codex-basic" class="codex-hero" aria-labelledby="codex-hero-title" style=${`background-image:linear-gradient(90deg,rgba(2,3,3,.96) 0%,rgba(3,3,3,.76) 37%,rgba(3,3,3,.08) 72%),url('${import.meta.env.BASE_URL}assets/diablo-hero-v1.png')`}>
            <div><h1 id="codex-hero-title">Diablo</h1><h2>A félelem ura</h2><blockquote>„A félelem az egyetlen igazság, mely minden szívben lakozik.”<cite>— Deckard Cain</cite></blockquote></div>
          </section>
          <dl class="codex-stat-strip">
            ${[['Cikkek', allArticles.length, 'fa-scroll'], ['Karakterek', countBy('karakter'), 'fa-user-shield'], ['Helyszínek', countBy('helyszín'), 'fa-compass'], ['Események', diabloTimelineEvents.length, 'fa-sun'], ['Könyvek', creativeWorkRegistry.length, 'fa-book-open'], ['Források', sourceRegistry.length, 'fa-file-lines']].map(([label,value,icon]) => html`<div><i class="fa-solid ${icon}" aria-hidden="true"></i><dt>${label}</dt><dd>${value}</dd></div>`)}
          </dl>
          <section id="codex-appearances" class="dashboard-section" aria-labelledby="featured-title"><h2 id="featured-title">Kiemelt cikkek</h2><div id="codex-gallery" class="featured-codex-grid">
            ${featured.map((article, index) => html`<button class="featured-codex-card" @click=${() => this.openArticle(article.id)}><img src=${`${import.meta.env.BASE_URL}assets/${featuredImages[index]}`} alt="${article.title} – kiemelt illusztráció" loading="lazy"><span class="featured-card-copy"><small>${article.category}</small><strong>${article.title}</strong><span>${article.subtitle || 'Fedezd fel Sanctuary krónikáját.'}</span></span></button>`)}
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
