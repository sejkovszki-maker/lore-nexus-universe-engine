import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { availableUniverses } from '../universe/article-universes.ts';
import { wikiArticles } from '../data/wikiArticles.ts';

@customElement('diablo-navigation')
export class DiabloNavigation extends LitElement {
  @state() private activeTab = useAppStore.getState().activeTab;
  @state() private activeUniverseId = useAppStore.getState().activeUniverseId;
  @state() private activeGameTag = useAppStore.getState().activeGameTag;
  @state() private searchValue = '';
  @state() private searchOpen = false;
  @state() private articleCount = 0;
  @state() private contentRevision = 0;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
      this.activeUniverseId = state.activeUniverseId;
      this.activeGameTag = state.activeGameTag;
      this.contentRevision += 1;
    });
    this.articleCount = Object.values(wikiArticles).filter(a => a.type !== 'chapter' && a.type !== 'book').length;
  }

  createRenderRoot() {
    return this; // Disable shadow DOM to inherit global Tailwind
  }

  private handleTabClick(tab: 'timeline' | 'articles' | 'story' | 'books' | 'sources' | 'conflicts') {
    useAppStore.setActiveTab(tab);
  }

  private handleSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value;
    this.searchValue = q;
    useAppStore.setSearchQuery(q);
    if (q.length > 0) useAppStore.setActiveTab('articles');
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
      <div class="universe-switch" style="display: flex; align-items: center; gap: 15px;">
        <!-- Keresőmező -->
        <div style="display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 20px; border: 1px solid var(--border-gold);">
          <i class="fa-solid fa-magnifying-glass" style="color: var(--accent-gold);"></i>
          <input
            type="search"
            aria-label="Keresés az enciklopédiában"
            placeholder="Keresés..."
            .value=${this.searchValue}
            @input=${this.handleSearch}
            style="background: transparent; border: none; outline: none; color: white; width: 120px; font-size: 0.8rem;"
          />
        </div>

        <!-- Cikkszámláló -->
        <div title="Enciklopédia-cikkek száma" style="display: flex; align-items: center; gap: 5px; color: var(--accent-gold); font-size: 0.8rem; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 15px;">
          <i class="fa-solid fa-database"></i>
          <strong style="font-family: var(--font-title); font-size: 1rem;">${this.articleCount}</strong>
          <span style="color: var(--text-secondary); text-transform: uppercase; font-size: 0.65rem;">cikk</span>
        </div>

        <div style="display: flex; align-items: center; gap: 5px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 15px;">
          <label for="universe-select" style="display: none;">Univerzum</label>
          <select id="universe-select" aria-label="Olvasott univerzum" .value=${this.activeUniverseId} @change=${(event: Event) => useAppStore.setActiveUniverse((event.target as HTMLSelectElement).value)}>
            ${universes.map(universe => html`<option value=${universe.id}>${universe.label}</option>`)}
          </select>
        </div>
      </div>
    </header>
    `;
  }
}
