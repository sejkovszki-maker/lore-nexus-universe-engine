import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { availableUniverses } from '../universe/article-universes.ts';
import { wikiArticles } from '../data/wikiArticles.ts';

@customElement('diablo-navigation')
export class DiabloNavigation extends LitElement {
  @state()
  private activeTab = useAppStore.getState().activeTab;
  @state() private activeUniverseId = useAppStore.getState().activeUniverseId;
  @state() private contentRevision = 0;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
      this.activeUniverseId = state.activeUniverseId;
      this.contentRevision += 1;
    });
  }

  createRenderRoot() {
    return this; // Disable shadow DOM to inherit global Tailwind
  }

  private handleTabClick(tab: 'timeline' | 'articles' | 'story' | 'books' | 'sources' | 'conflicts') {
    useAppStore.setActiveTab(tab);
  }

  render() {
    const universes = availableUniverses(wikiArticles);
    const btnClass = "flex-1 flex flex-col md:flex-row items-center justify-center py-3 md:py-4 px-2 text-xs md:text-sm lg:text-base font-heading font-semibold uppercase tracking-wider transition-colors duration-300 md:border-b-2";
    const iconClass = "text-lg md:text-base mb-1 md:mb-0 md:mr-2";

    return html`<header class="codex-header">
      <button class="codex-brand" @click=${() => this.handleTabClick('articles')} aria-label="Lore Nexus – Wiki megnyitása"><span class="brand-sigil" aria-hidden="true">✥</span><span><strong>Lore Nexus</strong><small>Universe Engine</small></span></button>
      <nav aria-label="Fő navigáció" class="codex-topnav">
        <button 
          aria-pressed=${this.activeTab === 'timeline'}
          class="${btnClass} ${this.activeTab === 'timeline' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('timeline')}
        >
          <i class="fa-solid fa-hourglass-half ${iconClass}"></i> <span>Kronológia</span>
        </button>
        <button aria-pressed=${this.activeTab === 'books'} class="${btnClass} ${this.activeTab === 'books' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}" @click=${() => this.handleTabClick('books')}>
          <i class="fa-solid fa-book ${iconClass}"></i> <span>Könyvek</span>
        </button>
        <button aria-pressed=${this.activeTab === 'sources'} class="${btnClass} ${this.activeTab === 'sources' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}" @click=${() => this.handleTabClick('sources')}><i class="fa-solid fa-link ${iconClass}"></i><span>Források</span></button>
        <button 
          aria-pressed=${this.activeTab === 'articles'}
          class="${btnClass} ${this.activeTab === 'articles' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('articles')}
        >
          <i class="fa-solid fa-book-journal-whills ${iconClass}"></i> <span>Cikkek</span>
        </button>
        <button 
          aria-pressed=${this.activeTab === 'story'}
          class="${btnClass} ${this.activeTab === 'story' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('story')}
        >
          <i class="fa-solid fa-book-open ${iconClass}"></i> <span>Történet</span>
        </button>
        <button aria-pressed=${this.activeTab === 'conflicts'} class="${btnClass} ${this.activeTab === 'conflicts' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}" @click=${() => this.handleTabClick('conflicts')}>
          <i class="fa-solid fa-scale-balanced ${iconClass}"></i> <span>Kánonellenőrzés</span>
        </button>
      </nav>
      <div class="universe-switch"><label for="universe-select">Univerzum</label><select id="universe-select" aria-label="Olvasott univerzum" .value=${this.activeUniverseId} @change=${(event: Event) => useAppStore.setActiveUniverse((event.target as HTMLSelectElement).value)}>${universes.map(universe => html`<option value=${universe.id}>${universe.label}</option>`)}</select></div>
    </header>
    `;
  }
}
