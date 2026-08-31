import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles.ts';

import './diablo-navigation';
import './story-reader';
import './wiki-article-grid';
import './wiki-article-view';
import './wiki-editor';
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

  private showArticles(query = '', category: string | null = null) {
    useAppStore.setSearchQuery(query);
    useAppStore.setActiveCategory(category);
    useAppStore.setActiveTab('articles');
  }

  private openRandomArticle() {
    const articles = Object.values(wikiArticles).filter(article => article.type !== 'chapter' && article.type !== 'book');
    const article = articles[Math.floor(Math.random() * articles.length)];
    if (article) useAppStore.openArticleRoute(article.id);
  }

  render() {
    return html`
      <div class="codex-app-shell">
        <diablo-navigation></diablo-navigation>
        <aside class="codex-sidebar" aria-label="Diablo kódex">
          <h2>Codex</h2>
          <button class="sidebar-overview" @click=${()=>this.showArticles()}><i class="fa-solid fa-house"></i> Áttekintés</button>
          <div class="sidebar-group-title">Univerzum</div>
          <button @click=${()=>this.showArticles('Sanctuary')}><i class="fa-solid fa-globe"></i> Sanctuary világa</button>
          <button @click=${()=>this.showArticles('Angiris')}><i class="fa-solid fa-sun"></i> Angiris Tanács</button>
          <button @click=${()=>this.showArticles('Konfliktus')}><i class="fa-solid fa-burst"></i> Nagy Konfliktus</button>
          <button @click=${()=>this.showArticles('Mennyek Pokol')}><i class="fa-solid fa-star"></i> Mennyek és Pokol</button>
          <div class="sidebar-group-title">Lények</div>
          <button @click=${()=>this.showArticles('', 'Démonok')}><i class="fa-solid fa-fire"></i> Démonok</button>
          <button @click=${()=>this.showArticles('', 'Angyalok')}><i class="fa-solid fa-feather"></i> Angyalok</button>
          <button @click=${()=>this.showArticles('ember')}><i class="fa-solid fa-user"></i> Emberek</button>
          <div class="sidebar-group-title">Helyszínek</div>
          <button @click=${()=>this.showArticles('Kehjistan')}><i class="fa-solid fa-location-dot"></i> Kehjistan</button>
          <button @click=${()=>this.showArticles('Scosglen')}><i class="fa-solid fa-tree"></i> Scosglen</button>
          <button @click=${()=>this.showArticles('', 'Helyszínek')}><i class="fa-solid fa-compass"></i> Egyéb helyszínek</button>
          <div class="sidebar-group-title">Események</div>
          <button aria-label="Oldalsáv – teljes idővonal megnyitása" @click=${()=>useAppStore.setActiveTab('timeline')}><i class="fa-solid fa-hourglass-half"></i> Teljes kronológia</button>
          <button aria-label="Oldalsáv – folyamatos olvasás megnyitása" @click=${()=>useAppStore.setActiveTab('story')}><i class="fa-solid fa-book-open"></i> Folyamatos történet</button>
          <div class="sidebar-group-title">Könyvek és források</div>
          <button aria-label="Oldalsáv – könyvtár megnyitása" @click=${()=>useAppStore.setActiveTab('books')}><i class="fa-solid fa-book"></i> Könyvek</button>
          <button aria-label="Oldalsáv – forrástár megnyitása" @click=${()=>useAppStore.setActiveTab('sources')}><i class="fa-solid fa-link"></i> Forrástár</button>
          <button class="random-article" @click=${this.openRandomArticle}><i class="fa-solid fa-dice"></i> Véletlen cikk</button>
        </aside>
        <main class="codex-content">
          ${this.activeTab === 'timeline' ? html`<diablo-timeline class="w-full"></diablo-timeline>` : ''}
          ${this.activeTab === 'articles' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
          ${this.activeTab === 'search' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
          ${this.activeTab === 'story' ? html`<story-reader class="w-full"></story-reader>` : ''}
          ${this.activeTab === 'books' ? html`<book-library class="w-full"></book-library>` : ''}
          ${this.activeTab === 'sources' ? html`<source-library class="w-full"></source-library>` : ''}
          ${this.activeTab === 'editor' ? html`<wiki-editor class="w-full max-w-4xl mx-auto"></wiki-editor>` : ''}
          ${this.activeTab === 'article-view' ? html`<wiki-article-view class="w-full"></wiki-article-view>` : ''}
          ${this.activeTab === 'conflicts' ? html`<canon-conflict-dashboard class="w-full"></canon-conflict-dashboard>` : ''}
          ${this.activeTab === 'not-found' ? html`<section role="alert" class="w-full max-w-2xl bg-dark-card border border-blood-red rounded-xl p-8 text-center"><h1 class="text-gold text-3xl font-heading">Az oldal nem található</h1><p>A hivatkozás hibás, vagy a tartalom nem ehhez az univerzumhoz tartozik.</p><button class="mt-4 px-4 py-2 border border-gold rounded text-gold" @click=${()=>useAppStore.setActiveTab('articles')}>Vissza a cikkekhez</button></section>` : ''}
        </main><footer class="codex-footer"><span>Rólunk · Szabályzat · Források · Közreműködők · Kapcsolat</span><strong>✥ Lore Nexus Diablo 5.0 ✥</strong><span>Sanctuary rajongói enciklopédiája</span></footer>
      </div>
    `;
  }
}
