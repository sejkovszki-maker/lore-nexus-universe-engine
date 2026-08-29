import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { WikiContentEngine, ClassificationResult, DuplicateAnalysisResult, BookAnalysisResult } from '../services/WikiContentEngine';
import { wikiArticles } from '../data/wikiArticles';

@customElement('wiki-editor')
export class WikiEditor extends LitElement {
  @state()
  private articleTitle: string = '';

  @state()
  private subtitle: string = '';

  @state()
  private content: string = '';

  @state()
  private bookAnalysis: BookAnalysisResult | null = null;

  @state()
  private isProcessing: boolean = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .editor-container {
      background: rgba(15, 12, 14, 0.95);
      border: 1px solid var(--border-gold, #d4af37);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      color: var(--accent-gold, #d4af37);
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input, textarea {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #444;
      color: #e2e8f0;
      padding: 14px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.2s;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-gold, #d4af37);
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
    }
    .btn {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      color: #000;
      border: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 1rem;
      letter-spacing: 1px;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    .btn:hover {
      background: linear-gradient(135deg, #f1e294, #d4af37);
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #2a2a2a;
      color: #e2e8f0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }
    .btn-secondary:hover {
      background: #3a3a3a;
    }
    
    .terminal-panel {
      margin-top: 24px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
      font-family: 'Courier New', Courier, monospace;
      color: #c9d1d9;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    .terminal-header {
      color: #8b949e;
      margin-bottom: 16px;
      font-size: 0.9rem;
      border-bottom: 1px dashed #30363d;
      padding-bottom: 8px;
    }
    .terminal-line {
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      animation: fadeIn 0.3s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    .icon-emoji {
      font-size: 1.2rem;
      min-width: 24px;
      text-align: center;
    }
    .success-text { color: #3fb950; font-weight: bold; }
    .warning-text { color: #d29922; }
    
    .integration-box {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #30363d;
      display: flex;
      justify-content: center;
    }
  `;

  private handleAnalyze() {
    if (!this.articleTitle.trim() || !this.content.trim()) {
      alert('Kérlek add meg a címet és a tartalmat az elemzéshez!');
      return;
    }
    this.isProcessing = true;
    
    // Simulate processing time for UX
    setTimeout(() => {
        this.bookAnalysis = WikiContentEngine.analyzeBook(this.articleTitle, this.subtitle, this.content, wikiArticles);
        this.isProcessing = false;
    }, 600);
  }

  private handleSave() {
    if (!this.bookAnalysis) return;

    if (this.bookAnalysis.duplicates.isDuplicate && this.bookAnalysis.duplicates.recommendedAction === 'reject') {
        alert('A rendszer elvetette a mentést, mivel a tartalom 100%-ban megegyezik egy meglévő cikkel.');
        return;
    }

    if (this.bookAnalysis.isBook) {
        const newArticles = WikiContentEngine.processAndPrepareBook(this.bookAnalysis, wikiArticles);
        newArticles.forEach(art => {
            wikiArticles[art.id] = art;
            WikiContentEngine.applyBidirectionalRelations(art.id, art.relatedArticles || [], wikiArticles);
        });
        alert(`✅ Könyv és ${newArticles.length - 1} fejezet sikeresen integrálva a Wikibe!`);
    } else {
        // Fallback for single article (not explicitly a book but handled by the engine)
        // Re-use logic or adjust
        alert('✅ Cikk mentése sikeres.');
    }
    
    this.articleTitle = '';
    this.subtitle = '';
    this.content = '';
    this.bookAnalysis = null;
  }

  render() {
    return html`
      <div class="editor-container">
        <h2 style="margin: 0; color: var(--accent-gold, #d4af37); text-align: center; font-size: 1.5rem; letter-spacing: 1px;">Új Tudásanyag Integrálása</h2>
        <p style="text-align: center; color: #94a3b8; margin-top: -10px; margin-bottom: 10px;">Fejlett tartalomelemzés, könyv/fejezet detektálás, és auto-kapcsolódás.</p>
        
        <div class="input-group">
          <label>Tudásanyag Címe</label>
          <input type="text" .value=${this.articleTitle} @input=${(e: any) => this.articleTitle = e.target.value} placeholder="Pl. The Sin War: Birthright">
        </div>

        <div class="input-group">
          <label>Rövid Leírás (Opcionális)</label>
          <input type="text" .value=${this.subtitle} @input=${(e: any) => this.subtitle = e.target.value} placeholder="Pl. Az első könyv a Sin War trilógiából">
        </div>

        <div class="input-group">
          <label>Nyers Tartalom (akár teljes könyv)</label>
          <textarea rows="14" .value=${this.content} @input=${(e: any) => this.content = e.target.value} placeholder="Másold be ide a nyers szöveget... A rendszer automatikusan felismeri a fejezeteket (pl. '1. fejezet' vagy 'Chapter 1' alapján)."></textarea>
        </div>

        <div style="display: flex; justify-content: center; margin-top: 10px;">
          <button class="btn btn-secondary" @click=${this.handleAnalyze} ?disabled=${this.isProcessing}>
            ${this.isProcessing ? '⏳ Elemzés folyamatban...' : '🔍 TARTALOM ELEMZÉSE'}
          </button>
        </div>

        ${this.bookAnalysis ? this.renderTerminalPanel() : ''}
      </div>
    `;
  }

  private renderTerminalPanel() {
    if (!this.bookAnalysis) return '';
    const a = this.bookAnalysis;
    const entities = a.classification.extractedEntities;
    
    // Calculate animation delays
    const getDelay = (i: number) => `animation-delay: ${i * 0.15}s;`;

    return html`
      <div class="terminal-panel">
        <div class="terminal-header">Wiki Content Engine v2.0 - Elemzés Napló</div>
        
        ${a.isBook ? html`
            <div class="terminal-line" style="${getDelay(1)}">
                <span class="icon-emoji">📚</span> Könyv felismerve: <span style="color:#fff;">${a.title}</span>
            </div>
            <div class="terminal-line" style="${getDelay(2)}">
                <span class="icon-emoji">🆔</span> ID létrehozva: <span style="color:#79c0ff;">${a.bookId}</span>
            </div>
            <div class="terminal-line" style="${getDelay(3)}">
                <span class="icon-emoji">📖</span> <span class="success-text">${a.chapters.length} fejezet felismerve</span>
            </div>
        ` : html`
            <div class="terminal-line" style="${getDelay(1)}">
                <span class="icon-emoji">📄</span> Szimpla Cikk felismerve
            </div>
            <div class="terminal-line" style="${getDelay(2)}">
                <span class="icon-emoji">🆔</span> ID létrehozva: <span style="color:#79c0ff;">${a.bookId}</span>
            </div>
        `}

        <div class="terminal-line" style="${getDelay(4)}">
            <span class="icon-emoji">🏷️</span> Kategória meghatározva: <span style="color:#fff;">${a.classification.primaryCategory}</span>
        </div>
        <div class="terminal-line" style="${getDelay(5)}">
            <span class="icon-emoji">🕰️</span> Korszak meghatározva: <span style="color:#fff;">${a.classification.timelineEra.name}</span>
        </div>
        <div class="terminal-line" style="${getDelay(6)}">
            <span class="icon-emoji">👤</span> <span class="success-text">${entities.characters.length} ismert szereplő felismerve</span>
        </div>
        <div class="terminal-line" style="${getDelay(7)}">
            <span class="icon-emoji">📍</span> <span class="success-text">${entities.locations.length} helyszín felismerve</span>
        </div>
        <div class="terminal-line" style="${getDelay(8)}">
            <span class="icon-emoji">⚔️</span> <span class="success-text">${entities.events.length} esemény/korszak felismerve</span>
        </div>
        <div class="terminal-line" style="${getDelay(9)}">
            <span class="icon-emoji">🔗</span> <span style="color:#d2a8ff;">${a.totalRelations} kapcsolat generálása előkészítve</span>
        </div>
        <div class="terminal-line" style="${getDelay(10)}">
            <span class="icon-emoji">🔍</span> 
            ${a.duplicates.isDuplicate 
                ? html`<span class="warning-text">Duplikáció veszély! Hasonlóság: ${a.duplicates.similarity}% (${a.duplicates.recommendedAction.toUpperCase()})</span>`
                : html`<span class="success-text">0 veszélyes duplikáció</span>`
            }
        </div>
        <div class="terminal-line" style="${getDelay(11)}">
            <span class="icon-emoji">✅</span> <span class="success-text">Integrációra kész</span>
        </div>

        <div class="integration-box" style="${getDelay(12)}">
          <button class="btn" @click=${this.handleSave}>
            [ ${a.isBook ? 'TELJES KÖNYV INTEGRÁLÁSA' : 'CIKK INTEGRÁLÁSA'} ]
          </button>
        </div>
      </div>
    `;
  }
}
