import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useAppStore } from '../store/appState.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import { articleUniverseId } from '../universe/article-universes.ts';

// A kezdőlap tartalma ezen a két listán egyszerűen bővíthető vagy átrendezhető.
export const witcherFeatured = [
  { id: 'witcher-geralt', eyebrow: 'Vaják', icon: 'fa-wolf-pack-battalion', description: 'A Fehér Farkas útja, választásai és kötelékei.' },
  { id: 'witcher-ciri', eyebrow: 'Ősi Vér', icon: 'fa-star', description: 'Cintra örököse és a világok között járó főhős.' },
  { id: 'witcher-yennefer', eyebrow: 'Varázslónő', icon: 'fa-wand-sparkles', description: 'Hatalom, függetlenség és a választott család.' },
] as const;

export const witcherGateways = [
  { id: 'witcher-world', label: 'A Kontinens', icon: 'fa-earth-europe' },
  { id: 'witcher-conjunction', label: 'A Szférák Együttállása', icon: 'fa-circle-nodes' },
  { id: 'witcher-witchers', label: 'A vajákok', icon: 'fa-shield-halved' },
  { id: 'witcher-nilfgaard', label: 'Nilfgaard', icon: 'fa-chess-rook' },
] as const;

@customElement('witcher-home')
export class WitcherHome extends LitElement {
  createRenderRoot() { return this; }

  private openArticle(id: string) {
    useAppStore.openArticleRoute(id);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }

  private openTab(tab: 'articles' | 'story' | 'books' | 'timeline') {
    useAppStore.setActiveTab(tab);
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.codex-content')?.scrollIntoView({ block: 'start' }));
  }

  render() {
    const records = Object.values(wikiArticles).filter(article => articleUniverseId(article) === 'witcher');
    const articles = records.filter(article => article.type !== 'book' && article.type !== 'chapter');
    const books = records.filter(article => article.type === 'book');
    const featured = witcherFeatured.map(item => ({ ...item, article: wikiArticles[item.id] })).filter(item => item.article);
    const firstBook = wikiArticles['witcher-book-last-wish'];

    return html`<section class="witcher-home" aria-labelledby="witcher-home-title">
      <header class="witcher-hero">
        <img class="witcher-hero-art" src=${`${import.meta.env.BASE_URL}assets/witcher-home-geralt.png`} alt="Geralt egy holdfényes hegyvidéken, egy távoli vár romjai előtt" fetchpriority="high">
        <div class="witcher-hero-copy">
          <p class="witcher-kicker">Lore Nexus · Vaják Archívum</p>
          <h1 id="witcher-home-title">A Kontinens krónikái</h1>
          <p class="witcher-lead">Lépj Geralt, Ciri és Yennefer világába. Kövesd a könyvek történetét, fedezd fel a királyságokat, és válaszd külön a regények, a játékok és a képernyős feldolgozások eseményeit.</p>
          <div class="witcher-hero-actions">
            <button class="witcher-primary-action" @click=${() => this.openTab('story')}><i class="fa-solid fa-book-open" aria-hidden="true"></i> Történet olvasása</button>
            <button @click=${() => this.openTab('books')}><i class="fa-solid fa-book" aria-hidden="true"></i> Könyvespolc</button>
          </div>
        </div>
      </header>

      <dl class="witcher-stats" aria-label="A Vaják Archívum tartalma">
        <div><dt>Szócikk</dt><dd>${articles.length}</dd></div>
        <div><dt>Könyv</dt><dd>${books.length}</dd></div>
        <div><dt>Folytonosság</dt><dd>3</dd></div>
        <div><dt>Nyelv</dt><dd>Magyar</dd></div>
      </dl>

      <section class="witcher-home-section" aria-labelledby="witcher-featured-title">
        <div class="witcher-section-heading"><div><span>Kiemelt szereplők</span><h2 id="witcher-featured-title">A sors által összekötve</h2></div><button @click=${() => this.openTab('articles')}>Minden cikk ›</button></div>
        <div class="witcher-featured-grid">
          ${featured.map(({ article, eyebrow, icon, description }) => html`<button class="witcher-feature-card" aria-label=${`Kiemelt cikk: ${article.title}`} @click=${() => this.openArticle(article.id)}>
            <span class="witcher-card-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
            <small>${eyebrow}</small><strong>${article.title}</strong><span>${description}</span><b>Szócikk megnyitása ›</b>
          </button>`)}
        </div>
      </section>

      <div class="witcher-home-columns">
        <section class="witcher-home-section witcher-gateways" aria-labelledby="witcher-world-title">
          <div class="witcher-section-heading"><div><span>Világkalauz</span><h2 id="witcher-world-title">Fedezd fel a Kontinenst</h2></div></div>
          <div class="witcher-gateway-list">${witcherGateways.map(item => html`<button @click=${() => this.openArticle(item.id)}><i class="fa-solid ${item.icon}" aria-hidden="true"></i><span>${item.label}</span><b>›</b></button>`)}</div>
        </section>
        <section class="witcher-home-section witcher-reading-start" aria-labelledby="witcher-reading-title">
          <span class="witcher-reading-label">Ajánlott kezdés</span>
          <h2 id="witcher-reading-title">${firstBook?.title ?? 'Az utolsó kívánság'}</h2>
          <p>Geralt korai történetei bemutatják a vaják hivatását, Yennefert és a világ erkölcsi szürkezónáit. Első olvasásra innen érdemes elindulni.</p>
          <button class="witcher-primary-action" @click=${() => this.openTab('books')}>Olvasási sorrend megnyitása ›</button>
        </section>
      </div>

      <nav class="witcher-quick-nav" aria-label="Vaják gyorsnavigáció">
        <button @click=${() => this.openTab('timeline')}><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i><span><strong>Kronológia</strong><small>A történet eseményei sorrendben</small></span></button>
        <button @click=${() => this.openArticle('witcher-games-branch')}><i class="fa-solid fa-gamepad" aria-hidden="true"></i><span><strong>Játékok</strong><small>A CD PROJEKT RED történeti ága</small></span></button>
        <button @click=${() => this.openArticle('witcher-screen-branch')}><i class="fa-solid fa-film" aria-hidden="true"></i><span><strong>Feldolgozások</strong><small>A képernyős változatok külön ága</small></span></button>
      </nav>
    </section>`;
  }
}
