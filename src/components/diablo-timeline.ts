import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { timelineData } from '../data/wikiArticles';

@customElement('diablo-timeline')
export class DiabloTimeline extends LitElement {
  @state() private activeEra: string | null = null;
  @state() private nodes: any[] = [];
  @state() private eras: string[] = [];

  createRenderRoot() {
    return this; // Disable shadow DOM to use Tailwind
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Elrendezzük az idősíkot az előre definiált adatok (timelineData) alapján, ahogy a régi verzióban volt
    if (Array.isArray(timelineData)) {
      this.nodes = timelineData.map((event: any) => {
        return {
          id: event.articleId || event.id,
          title: event.title || 'Ismeretlen Esemény',
          desc: event.summary || event.description || '',
          era: event.eraName || 'Ismeretlen',
          date: event.date || ''
        };
      });
    } else {
      console.warn("A timelineData nem tömb, vagy nem sikerült betölteni!");
      this.nodes = [];
    }

    this.eras = Array.from(new Set(this.nodes.map((n: any) => n.era)));
  }

  private setEra(era: string | null) {
    this.activeEra = era;
  }

  private openArticle(id: string) {
    useAppStore.setActiveArticleId(id);
    useAppStore.setActiveTab('article-view');
  }

  render() {
    const filteredNodes = this.nodes.filter(node => !this.activeEra || node.era === this.activeEra);

    return html`
      <div class="w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <!-- Szűrők -->
        <div class="w-full flex flex-wrap gap-2 justify-center mb-10 bg-[#1a1819] p-4 rounded-xl border border-blood-red/20 shadow-lg">
          <button 
            class="px-4 py-2 rounded text-sm md:text-base border transition-colors ${!this.activeEra ? 'bg-blood-red/20 border-blood-red text-white font-bold' : 'border-gold/30 text-parchment/70 hover:border-gold hover:text-gold'}"
            @click=${() => this.setEra(null)}
          >
            Teljes Történelem
          </button>
          ${this.eras.map(era => html`
            <button 
              class="px-4 py-2 rounded text-sm md:text-base border transition-colors ${this.activeEra === era ? 'bg-blood-red/20 border-blood-red text-white font-bold' : 'border-gold/30 text-parchment/70 hover:border-gold hover:text-gold'}"
              @click=${() => this.setEra(era)}
            >
              ${era}
            </button>
          `)}
        </div>

        <!-- Idővonal -->
        <div class="w-full relative border-l-2 border-blood-red/30 pl-6 md:pl-10 space-y-8">
          ${filteredNodes.map((node, index) => html`
            <div class="relative group cursor-pointer" @click=${() => this.openArticle(node.id)}>
              
              <!-- Pötty -->
              <div class="absolute -left-[31px] md:-left-[47px] top-2 w-4 h-4 bg-[#0a0809] border-2 border-blood-red rounded-full group-hover:bg-blood-red group-hover:shadow-[0_0_10px_#8b0000] transition-all"></div>
              
              <div class="bg-[#1a1819] border border-gold/10 rounded-xl p-5 shadow-lg group-hover:border-blood-red/50 transition-all hover:-translate-y-1">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-heading text-gold group-hover:text-blood-red transition-colors">${node.title}</h3>
                  <span class="text-xs text-parchment/50 font-mono tracking-widest uppercase">${node.date ? `${node.date} &bull; ` : ''}${node.era}</span>
                </div>
                <p class="text-sm text-parchment/80 leading-relaxed">${node.desc}</p>
              </div>
              
            </div>
          `)}
        </div>

      </div>
    `;
  }
}
