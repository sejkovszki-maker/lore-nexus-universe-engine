import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles';
import './wiki-article-card';
import { articleUniverseId } from '../universe/article-universes.ts';

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

    return html`
      <div class="w-full flex flex-col items-center">
        <!-- Szűrők és Kereső -->
        <div class="w-full max-w-4xl mb-10 flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-card p-6 rounded-xl border border-blood-red/20 shadow-lg">
          <input 
            type="text" 
            placeholder="Keresés a cikkek között..." 
            .value=${this.searchQuery}
            @input=${this.handleSearch}
            class="w-full md:w-1/3 bg-dark-bg text-parchment border border-gold/40 rounded px-4 py-2 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
          
          <div class="flex flex-wrap gap-2 justify-center md:justify-end flex-1">
            <button 
              class="px-3 py-1 rounded text-sm md:text-base border transition-colors ${!this.activeCategory ? 'bg-blood-red/20 border-blood-red text-white' : 'border-gold/30 text-parchment/70 hover:border-gold hover:text-gold'}"
              @click=${() => this.setCategory(null)}
            >
              Összes
            </button>
            ${this.categories.map(cat => html`
              <button 
                class="px-3 py-1 rounded text-sm md:text-base border transition-colors ${this.activeCategory === cat ? 'bg-blood-red/20 border-blood-red text-white' : 'border-gold/30 text-parchment/70 hover:border-gold hover:text-gold'}"
                @click=${() => this.setCategory(cat)}
              >
                ${cat}
              </button>
            `)}
          </div>
        </div>

        <!-- Cikk Rács (Point 3: Reszponzív Grid hálózata) -->
        <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${filtered.map((article: any) => html`
            <wiki-article-card
              .id=${article.id}
              .title=${article.title}
              .subtitle=${article.subtitle}
              .category=${article.category}
            ></wiki-article-card>
          `)}
        </div>
      </div>
    `;
  }
}
