import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles';
import DOMPurify from 'dompurify';
import { buildBacklinkIndex, relatedArticlesFor, renderWikiLinks } from '../wiki/link-engine';
import { diabloTimelineEvents } from '../data/diabloChronology.ts';

@customElement('wiki-article-view')
export class WikiArticleView extends LitElement {
  @state() private activeArticleId = useAppStore.getState().activeArticleId;

  // Point 2: Shadow DOM izoláció - Teljes tartalom védelem a Markdown-nál
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
    }
    .markdown-content {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      font-size: 1.1rem;
      color: #d9c9ad;
    }
    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
      font-family: 'Cinzel', serif;
      color: #c99b4c;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .markdown-content h1 { font-size: 2.5rem; border-bottom: 1px solid #8b0000; padding-bottom: 0.5rem; }
    .markdown-content h2 { font-size: 2rem; }
    .markdown-content h3 { font-size: 1.5rem; }
    .markdown-content p { margin-bottom: 1.25rem; }
    .markdown-content em { color: #b8860b; }
    .markdown-content strong { color: #f8fafc; font-weight: 600; }
    .infobox { float: right; width: min(320px, 42%); margin: 0 0 1.5rem 1.5rem; padding: 1.2rem; border: 1px solid #9d6b2e77; border-radius: 1px; background: #080807ee; box-shadow: inset 0 0 0 5px #030303, inset 0 0 0 6px #9d6b2e33; }
    .infobox dl { margin: 0; }
    .infobox dt { color: #d4af37; font-weight: 700; margin-top: .75rem; }
    .infobox dd { margin: .15rem 0 0; color: #eaddc5; }
    .relations { clear: both; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #8b000066; }
    .relation-list { display: flex; flex-wrap: wrap; gap: .6rem; }
    .relation-button { border: 1px solid #9d6b2e77; background: #d4af3710; color: #eaddc5; border-radius: 1px; padding: .55rem .9rem; cursor: pointer; font-family: 'Cinzel', serif; }
    .relation-button:hover, .relation-button:focus-visible { border-color: #d4af37; color: #d4af37; outline: none; }
    .markdown-content .wiki-link { color: #e6c65c; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: .2em; }
    .markdown-content .wiki-link-broken { color: #ff8a8a; text-decoration: underline wavy; }
    @media (max-width: 700px) { .infobox { float: none; width: auto; margin: 0 0 1.5rem; } :host { max-width: 100%; } }
  `;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeArticleId = state.activeArticleId;
    });
  }

  private handleBack() {
    useAppStore.setActiveTab('articles');
  }

  private openArticle(articleId: string) {
    if (!wikiArticles[articleId] || (wikiArticles[articleId].universeId || 'diablo') !== useAppStore.getState().activeUniverseId) return;
    useAppStore.openArticleRoute(articleId);
  }

  private handleContentClick(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-wiki-id]');
    if (!anchor) return;
    event.preventDefault();
    this.openArticle(anchor.dataset.wikiId || '');
  }

  render() {
    if (!this.activeArticleId || !wikiArticles[this.activeArticleId]) {
      return html`<div>Cikk nem található.</div>`;
    }

    const article = wikiArticles[this.activeArticleId];
    const universeId = useAppStore.getState().activeUniverseId;
    const scopedArticles = Object.fromEntries(Object.entries(wikiArticles).filter(([, item]) => (item.universeId || 'diablo') === universeId));
    
    // Egyszerűsített parser
    let htmlContent = article.content
      .replace(/!\[[^\]]*\]\(file:\/\/\/[^)]+\)/gim, '')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n$/gim, '<br />');
      
    htmlContent = renderWikiLinks(htmlContent, scopedArticles);
    htmlContent = DOMPurify.sanitize(htmlContent, { ADD_ATTR: ['data-wiki-id', 'data-relation', 'data-missing-id'] });
    const related = relatedArticlesFor(article, scopedArticles);
    const backlinks = (buildBacklinkIndex(scopedArticles).get(article.id) || []).map(id => scopedArticles[id]).filter(Boolean);
    const timelineEvents = universeId === 'diablo' ? diabloTimelineEvents.filter(event => event.articleId === article.id) : [];

    return html`
      <div class="mb-6">
        <button 
          @click=${this.handleBack}
          class="px-4 py-2 border border-blood-red bg-blood-red/10 text-gold rounded hover:bg-blood-red/30 transition-colors"
        >
          <i class="fa-solid fa-arrow-left mr-2"></i> Vissza a cikkekhez
        </button>
      </div>
      <article class="bg-dark-card p-6 md:p-12 rounded-xl shadow-2xl border border-gold/20">
        <h1 class="text-4xl md:text-5xl text-gold font-heading font-bold mb-2">${article.title}</h1>
        ${article.subtitle ? html`<h2 class="text-xl text-parchment/70 font-heading italic mb-8 border-b border-blood-red/40 pb-4">${article.subtitle}</h2>` : ''}
        
        ${article.infobox ? html`<aside class="infobox" aria-label="Cikkadatok"><h2>Adatlap</h2><dl>${Object.entries(article.infobox).map(([key, value]) => html`<dt>${key}</dt><dd>${value}</dd>`)}</dl></aside>` : ''}
        <div class="markdown-content" @click=${this.handleContentClick} .innerHTML=${htmlContent}></div>
        ${related.length ? html`<section class="relations" aria-labelledby="related-heading"><h2 id="related-heading">Kapcsolódó szócikkek</h2><div class="relation-list">${related.map(item => html`<button class="relation-button" @click=${() => this.openArticle(item.id)}>${item.title}</button>`)}</div></section>` : ''}
        ${backlinks.length ? html`<section class="relations" aria-labelledby="backlinks-heading"><h2 id="backlinks-heading">Erre a lapra hivatkozik</h2><div class="relation-list">${backlinks.map(item => html`<button class="relation-button" @click=${() => this.openArticle(item.id)}>${item.title}</button>`)}</div></section>` : ''}
        ${timelineEvents.length ? html`<section class="relations" aria-labelledby="timeline-links-heading"><h2 id="timeline-links-heading">Kapcsolódó idővonalesemények</h2><div class="relation-list">${timelineEvents.map(event => html`<button class="relation-button" @click=${() => useAppStore.openTimelineRoute(event.id)}>${String(event.eventOrder).padStart(3,'0')}. ${event.title}</button>`)}</div></section>` : ''}
      </article>
    `;
  }
}
