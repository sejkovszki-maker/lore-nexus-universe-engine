import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';

@customElement('wiki-article-card')
export class WikiArticleCard extends LitElement {
  @property({ type: String }) id = '';
  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: String }) category = '';

  // Point 2: Shadow DOM izoláció - A kártya belső stílusai nem szivárognak ki
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;

  private handleClick() {
    useAppStore.setActiveArticleId(this.id);
    useAppStore.setActiveTab('article-view');
  }

  render() {
    return html`
      <link rel="stylesheet" href="/src/index.css" />
      <div 
        @click=${this.handleClick}
        class="group flex flex-col h-full bg-dark-card border border-gold-dark/40 hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 rounded-lg p-5 cursor-pointer relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-blood-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <h3 class="text-xl md:text-2xl text-gold font-heading font-bold mb-2 z-10">${this.title}</h3>
        ${this.subtitle ? html`<h4 class="text-sm md:text-base text-parchment/80 font-body mb-4 z-10">${this.subtitle}</h4>` : ''}
        
        <div class="mt-auto pt-4 flex items-center justify-between z-10">
          <span class="text-xs tracking-wider uppercase bg-blood-red/20 text-blood-red border border-blood-red/50 px-2 py-1 rounded">
            ${this.category}
          </span>
          <i class="fa-solid fa-arrow-right text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1"></i>
        </div>
      </div>
    `;
  }
}
