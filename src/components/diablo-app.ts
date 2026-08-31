import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';

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

  render() {
    return html`
      <div class="codex-app-shell">
        <diablo-navigation></diablo-navigation>
        <aside class="codex-sidebar" aria-label="Diablo kódex">
          <h2>Diablo Kódex</h2>
          <button aria-label="Wiki tartalomjegyzék" @click=${()=>useAppStore.setActiveTab('articles')}><i class="fa-solid fa-book-journal-whills"></i> Wiki</button>
          <button aria-label="Időrendi áttekintés" @click=${()=>useAppStore.setActiveTab('timeline')}><i class="fa-solid fa-hourglass-half"></i> Kronológia</button>
          <button aria-label="Folyamatos olvasási útvonal" @click=${()=>useAppStore.setActiveTab('story')}><i class="fa-solid fa-book-open"></i> Teljes történet</button>
          <button aria-label="Kódex könyvtára" @click=${()=>useAppStore.setActiveTab('books')}><i class="fa-solid fa-book"></i> Könyvtár</button>
          <button aria-label="Kutatási forrástár" @click=${()=>useAppStore.setActiveTab('sources')}><i class="fa-solid fa-link"></i> Forrástár</button>
          <button aria-label="Szerkesztői eszközök" @click=${()=>useAppStore.setActiveTab('editor')}><i class="fa-solid fa-pen-nib"></i> Eszközök</button>
          <div class="codex-motto"><span aria-hidden="true">❖</span><p>„Maradj egy ideig, és hallgass.”</p><small>— Deckard Cain</small></div>
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
        </main><footer class="codex-footer">Lore Nexus Universe Engine · Sanctuary tudástára</footer>
      </div>
    `;
  }
}
