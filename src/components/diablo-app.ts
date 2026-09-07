import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles.ts';

import './diablo-navigation';
import './story-reader';
import './wiki-article-grid';
import './wiki-article-view';
import './diablo-timeline';
import './canon-conflict-dashboard';
import './book-library';
import './source-library';

@customElement('diablo-app')
export class DiabloApp extends LitElement {
  @state()
  private activeTab = useAppStore.getState().activeTab;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
    });
  }

  createRenderRoot() {
    return this; // Disable shadow DOM for Tailwind inheritance
  }

  private changeTab(tab: string) {
    useAppStore.setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private showArticles(query = '', category: string | null = null) {
    useAppStore.setSearchQuery(query);
    useAppStore.setActiveCategory(category);
    useAppStore.setActiveTab('articles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private openRandomArticle() {
    const articles = Object.values(wikiArticles).filter(article => article.type !== 'chapter' && article.type !== 'book');
    const article = articles[Math.floor(Math.random() * articles.length)];
    if (article) {
      useAppStore.openArticleRoute(article.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  render() {
    return html`
      <div class="codex-app-shell">
        <diablo-navigation></diablo-navigation>
        <aside class="codex-sidebar" aria-label="Diablo kódex">
          <h2>Codex</h2>
          <button class="sidebar-overview" @click=${()=>this.showArticles()}><i class="fa-solid fa-house"></i> Áttekintés</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('Sanctuary')}>Univerzum</button>
          <button aria-label="Sanctuary világa" @click=${()=>this.showArticles('Sanctuary')}><i class="fa-solid fa-globe"></i> Sanctuary világa</button>
          <button aria-label="Angiris Tanács" @click=${()=>this.showArticles('Angiris')}><i class="fa-solid fa-sun"></i> Angiris Tanács</button>
          <button aria-label="Nagy Konfliktus" @click=${()=>this.showArticles('Eternal Conflict')}><i class="fa-solid fa-burst"></i> Nagy Konfliktus</button>
          <button aria-label="Mennyek és Pokol" @click=${()=>this.showArticles('Pokol')}><i class="fa-solid fa-star"></i> Mennyek és Pokol</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('Kicsoda')}>Lények</button>
          <button aria-label="Démonok" @click=${()=>this.showArticles('démon')}><i class="fa-solid fa-fire"></i> Démonok</button>
          <button aria-label="Angyalok" @click=${()=>this.showArticles('angyal')}><i class="fa-solid fa-feather"></i> Angyalok</button>
          <button aria-label="Emberek" @click=${()=>this.showArticles('ember')}><i class="fa-solid fa-user"></i> Emberek</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('', 'Helyszínek')}>Helyszínek</button>
          <button aria-label="Kehjistan" @click=${()=>this.showArticles('Kehjistan')}><i class="fa-solid fa-location-dot"></i> Kehjistan</button>
          <button aria-label="Scosglen" @click=${()=>this.showArticles('Scosglen')}><i class="fa-solid fa-tree"></i> Scosglen</button>
          <button aria-label="Egyéb helyszínek" @click=${()=>this.showArticles('', 'Helyszínek')}><i class="fa-solid fa-compass"></i> Egyéb helyszínek</button>
          <button class="sidebar-group-title" aria-label="Események – idővonal megnyitása" @click=${()=>this.changeTab('timeline')}>Események</button>
          <button aria-label="Oldalsáv – teljes idővonal megnyitása" @click=${()=>this.changeTab('timeline')}><i class="fa-solid fa-hourglass-half"></i> Teljes kronológia</button>
          <button aria-label="Oldalsáv – folyamatos olvasás megnyitása" @click=${()=>this.changeTab('story')}><i class="fa-solid fa-book-open"></i> Folyamatos történet</button>
          <button class="sidebar-group-title" aria-label="Oldalsáv – gyűjtemények megnyitása" @click=${()=>this.changeTab('books')}>Könyvek és források</button>
          <button aria-label="Oldalsáv – könyvtár megnyitása" @click=${()=>this.changeTab('books')}><i class="fa-solid fa-book"></i> Könyvek</button>
          <button aria-label="Oldalsáv – forrástár megnyitása" @click=${()=>this.changeTab('sources')}><i class="fa-solid fa-link"></i> Forrástár</button>
          <button class="random-article" @click=${this.openRandomArticle}><i class="fa-solid fa-dice"></i> Véletlen cikk</button>
        </aside>
        <main class="codex-content">
          ${this.activeTab === 'timeline' ? html`<diablo-timeline class="w-full"></diablo-timeline>` : ''}
          ${this.activeTab === 'articles' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
          ${this.activeTab === 'search' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
          ${this.activeTab === 'story' ? html`<story-reader class="w-full"></story-reader>` : ''}
          ${this.activeTab === 'books' ? html`<book-library class="w-full"></book-library>` : ''}
          ${this.activeTab === 'sources' ? html`<source-library class="w-full"></source-library>` : ''}
          ${this.activeTab === 'article-view' ? html`<wiki-article-view class="w-full"></wiki-article-view>` : ''}
          ${this.activeTab === 'conflicts' ? html`<canon-conflict-dashboard class="w-full"></canon-conflict-dashboard>` : ''}
          ${this.activeTab === 'not-found' ? html`<section role="alert" class="w-full max-w-2xl bg-dark-card border border-blood-red rounded-xl p-8 text-center"><h1 class="text-gold text-3xl font-heading">Az oldal nem található</h1><p>A hivatkozás hibás, vagy a tartalom nem ehhez az univerzumhoz tartozik.</p><button class="mt-4 px-4 py-2 border border-gold rounded text-gold" @click=${()=>this.changeTab('articles')}>Vissza a cikkekhez</button></section>` : ''}
        </main>
        <div class="copyright-notice" role="note" aria-label="Szerzői jogi nyilatkozat">
          <i class="fa-solid fa-scale-balanced copyright-notice-icon" aria-hidden="true"></i>
          <div class="copyright-notice-body">
            <div class="copyright-notice-title">⚖ Szerzői jogi nyilatkozat – Rajongói ismeretterjesztő projekt</div>
            <p class="copyright-notice-text">
              Ez az oldal egy <strong>nem kereskedelmi, magáncélú rajongói enciklopédia</strong>, amelyet kizárólag a Diablo-univerzum
              ismeretterjesztése, oktatása és dokumentálása céljából hoztunk létre. Az oldalon szereplő regények,
              novellák és egyéb írásos anyagok ismertető, összefoglaló vagy jogszerűen idézett formában jelenhetnek meg – ezek szerzői joga
              és minden szellemi tulajdonjog kizárólag a <strong>Blizzard Entertainment, Inc.</strong> és az eredeti szerzők
              (<strong>Mel Odom, Richard A. Knaak, Nate Kenyon, Robert B. Marks</strong> és mások) tulajdona.
            </p>
            <p class="copyright-notice-text">
              A tartalom közlése kizárólag a vonatkozó idézési és szabad felhasználási szabályok keretein belül történik.
              Az oldal semmilyen kereskedelmi hasznot nem termel,
              reklámot nem tartalmaz, és díjat nem számít fel. Ha bármely jogosult törlést vagy módosítást kér,
              a tartalom haladéktalanul eltávolításra kerül –
              <a href="mailto:kapcsolat@lorenexus.hu">kapcsolat felvétele itt</a>.
            </p>
          </div>
        </div>
        <footer class="codex-footer"><span>Rólunk · Szabályzat · Források · Közreműködők · Kapcsolat</span><strong>✥ Lore Nexus Diablo 5.0 ✥</strong><span>Sanctuary rajongói enciklopédiája</span></footer>
      </div>
    `;
  }
}
