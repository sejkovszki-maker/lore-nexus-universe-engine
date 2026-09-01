import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { WikiContentEngine, ClassificationResult, DuplicateAnalysisResult, BookAnalysisResult } from '../services/WikiContentEngine';
import { wikiArticles } from '../data/wikiArticles';
import { extractBookFile, type ExtractedBook } from '../document/browser-book-extractor.ts';
import { translateBookToHungarian } from '../document/browser-translator.ts';
import { exportUserArticles, importUserArticles, persistUserArticles } from '../wiki/user-article-store.ts';
import { detectArticleUniverse, registerUniverse, type ArticleUniverse } from '../universe/article-universes.ts';
import { useAppStore } from '../store/appState.ts';
import { createWorkIdentity, detectCreativeWorkType, type CreativeWorkType } from '../creative-work/model.ts';

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

  @state()
  private extraction: ExtractedBook | null = null;

  @state()
  private extractionError: string = '';

  @state()
  private autoTranslate = true;

  @state()
  private translationStatus = '';

  @state() private detectedUniverse: (ArticleUniverse & { confidence: number; reason: string }) | null = null;
  @state() private storyAfter = '';
  @state() private backupStatus = '';
  @state() private creativeWorkType: CreativeWorkType|'auto' = 'auto';

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
    .drop-zone {
      border: 2px dashed #665526;
      border-radius: 10px;
      padding: 22px;
      text-align: center;
      background: rgba(212, 175, 55, 0.05);
    }
    .drop-zone input { display: block; width: 100%; margin-top: 12px; }
    .file-result { color: #cbd5e1; line-height: 1.6; margin-top: 10px; }
    .error { color: #fca5a5; margin-top: 10px; }
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
    setTimeout(() => {
      this.analyzeCurrentContent();
      this.isProcessing = false;
    }, 600);
  }

  private analyzeCurrentContent() {
    const detected = detectArticleUniverse(this.articleTitle, this.content, useAppStore.getState().activeUniverseId);
    this.detectedUniverse = { ...detected.universe, confidence: detected.confidence, reason: detected.reason };
    const scopedArticles = Object.fromEntries(Object.entries(wikiArticles).filter(([, article]) => (article.universeId || 'diablo') === detected.universe.id));
    this.bookAnalysis = WikiContentEngine.analyzeBook(this.articleTitle, this.subtitle, this.content, scopedArticles);
  }

  private async handleDocument(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isProcessing = true;
    this.extractionError = '';
    this.extraction = null;
    this.bookAnalysis = null;
    this.translationStatus = '';
    this.content = '';
    try {
      const result = await extractBookFile(file);
      this.extraction = result;
      this.content = result.text;
      if (!this.articleTitle.trim()) this.articleTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      if (this.autoTranslate) await this.translateContent();
      this.analyzeCurrentContent();
    } catch (error) {
      this.extractionError = error instanceof Error ? error.message : 'Ismeretlen dokumentumfeldolgozási hiba.';
    } finally {
      this.isProcessing = false;
      input.value = '';
    }
  }

  private async translateContent() {
    if (!this.content.trim()) return;
    this.isProcessing = true;
    this.translationStatus = 'A dokumentum nyelvének felismerése…';
    try {
      const result = await translateBookToHungarian(this.content, (completed, total) => {
        this.translationStatus = `Magyar fordítás: ${completed}/${total}. szövegrész`;
      });
      this.content = result.text;
      this.translationStatus = result.translated ? `✅ Automatikusan magyarra fordítva (${result.sourceLanguage}).` : '✅ A dokumentum már magyar nyelvű.';
    } catch (error) {
      this.translationStatus = `⚠️ ${error instanceof Error ? error.message : 'A fordítás nem sikerült.'} Az eredeti szöveg megmaradt.`;
    } finally {
      this.isProcessing = false;
    }
  }

  private async downloadBackup() {
    try {
      const serialized = await exportUserArticles();
      const blob = new Blob([serialized], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lore-nexus-draft-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.backupStatus = '✅ A helyi draftok ellenőrzött biztonsági mentése elkészült.';
    } catch (error) { this.backupStatus = `❌ A mentés exportálása nem sikerült: ${error instanceof Error ? error.message : 'ismeretlen hiba'}`; }
  }

  private async restoreBackup(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.backupStatus = 'A biztonsági mentés ellenőrzése…';
    try {
      if (file.size > 50_000_000) throw new Error('A fájl nagyobb 50 MB-nál.');
      const result = await importUserArticles(await file.text());
      useAppStore.setState({});
      this.backupStatus = `✅ ${result.imported} draft visszaállítva (${result.universes.join(', ')}).`;
    } catch (error) { this.backupStatus = `❌ A visszaállítás elutasítva: ${error instanceof Error ? error.message : 'ismeretlen hiba'}`; }
    finally { input.value = ''; }
  }

  private async handleSave() {
    if (!this.bookAnalysis) return;

    if (this.bookAnalysis.existingBook && this.bookAnalysis.newChapterCount === 0 && this.bookAnalysis.changedChapterCount === 0) {
      alert('✅ Ezt a könyvet és minden fejezetét a rendszer már változatlan formában tárolja. Nem készült duplikáció.');
      return;
    }

    if (this.bookAnalysis.duplicates.isDuplicate && this.bookAnalysis.duplicates.recommendedAction === 'reject') {
        alert('A rendszer elvetette a mentést, mivel a tartalom 100%-ban megegyezik egy meglévő cikkel.');
        return;
    }

    const universe = this.detectedUniverse ?? { id: useAppStore.getState().activeUniverseId, label: useAppStore.getState().activeUniverseId, confidence: 1, reason: 'kiválasztott univerzum' };
    const newArticles = this.bookAnalysis.isBook
      ? WikiContentEngine.processAndPrepareBook(this.bookAnalysis, wikiArticles, universe)
      : [WikiContentEngine.processAndPrepareArticle(this.articleTitle, this.subtitle, this.content, wikiArticles, universe)];
    const workType=this.creativeWorkType==='auto'?detectCreativeWorkType(this.articleTitle,this.content,this.bookAnalysis.chapters.length):this.creativeWorkType;
    const identity=createWorkIdentity(newArticles[0].id,workType);
    newArticles[0].creativeWorkType=workType;Object.assign(newArticles[0],identity);
    for(const chapter of newArticles.slice(1)){chapter.creativeWorkType='chapter';chapter.workId=identity.workId;chapter.instanceId=identity.instanceId;chapter.itemId=`item:${chapter.id}:local`;}
    if (this.storyAfter) newArticles[0].storyAfter = this.storyAfter;
    try {
      await persistUserArticles(newArticles);
      newArticles.forEach(article => { wikiArticles[article.id] = article; });
      registerUniverse(universe);
      useAppStore.setState({});
      const switchUniverse = universe.id !== useAppStore.getState().activeUniverseId;
      alert(this.bookAnalysis.isBook
        ? `✅ A könyv és ${newArticles.length - 1} fejezete a(z) ${universe.label} univerzumba került, tartósan mentve ezen az eszközön.`
        : `✅ A cikk a(z) ${universe.label} univerzumba került, tartósan mentve ezen az eszközön.`);
      if (switchUniverse) useAppStore.setActiveUniverse(universe.id);
    } catch (error) {
      alert(`❌ A mentés nem sikerült, ezért a wiki nem módosult. ${error instanceof Error ? error.message : ''}`);
      return;
    }
    
    this.articleTitle = '';
    this.subtitle = '';
    this.content = '';
    this.bookAnalysis = null;
    this.extraction = null;
    this.detectedUniverse = null;
    this.storyAfter = '';
  }

  render() {
    return html`
      <div class="editor-container">
        <h2 style="margin: 0; color: var(--accent-gold, #d4af37); text-align: center; font-size: 1.5rem; letter-spacing: 1px;">Új Tudásanyag Integrálása</h2>
        <p style="text-align: center; color: #94a3b8; margin-top: -10px; margin-bottom: 10px;">Fejlett tartalomelemzés, könyv/fejezet detektálás, és auto-kapcsolódás.</p>

        <section class="drop-zone" aria-labelledby="draft-backup-title">
          <strong id="draft-backup-title">🛡️ Helyi draftok biztonsági mentése</strong>
          <p style="color:#94a3b8">Az exportált, SHA-256-tal védett JSON-fájl másik eszközön is visszaállítható. A visszaállítás nem írhatja felül a beépített Wiki-cikkeket.</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"><button class="btn btn-secondary" @click=${this.downloadBackup}>Biztonsági mentés letöltése</button><label style="display:inline-flex;align-items:center" class="btn btn-secondary">Biztonsági mentés visszaállítása<input style="position:absolute;inline-size:1px;block-size:1px;opacity:0" aria-label="Draft biztonsági mentés kiválasztása" type="file" accept="application/json,.json" @change=${this.restoreBackup}></label></div>
          ${this.backupStatus ? html`<div role=${this.backupStatus.startsWith('❌') ? 'alert' : 'status'} class="file-result">${this.backupStatus}</div>` : ''}
        </section>

        ${this.detectedUniverse ? html`<div class="file-result" role="status"><strong>Felismert univerzum: ${this.detectedUniverse.label}</strong> – ${Math.round(this.detectedUniverse.confidence * 100)}% (${this.detectedUniverse.reason}). ${this.detectedUniverse.id !== useAppStore.getState().activeUniverseId ? 'A tartalom külön univerzumfület kap.' : ''}</div>` : ''}

        ${this.bookAnalysis?.isBook ? html`<div class="input-group"><label for="story-after">A könyv helye a történetben</label><select id="story-after" .value=${this.storyAfter} @change=${(event: Event) => this.storyAfter = (event.target as HTMLSelectElement).value}><option value="">A történet végén / később rendezem</option>${Object.values(wikiArticles).filter(article => (article.universeId || 'diablo') === (this.detectedUniverse?.id || useAppStore.getState().activeUniverseId) && article.type !== 'chapter' && article.type !== 'book').map(article => html`<option value=${article.id}>${article.title} után</option>`)}</select></div>` : ''}

        <div class="drop-zone">
          <strong>📥 Könyvdokumentum bedobása</strong>
          <div style="color:#94a3b8; margin-top:6px;">EPUB, PDF, DOCX, TXT, Markdown vagy HTML – a feldolgozás ezen az eszközön történik.</div>
          <input aria-label="Könyvdokumentum kiválasztása" type="file" accept=".epub,.pdf,.docx,.txt,.md,.html,.htm" @change=${this.handleDocument} ?disabled=${this.isProcessing}>
          <label class="toggle" style="display:flex;justify-content:center;gap:.5rem;margin-top:10px;text-transform:none;">
            <input type="checkbox" .checked=${this.autoTranslate} @change=${(event: Event) => this.autoTranslate = (event.target as HTMLInputElement).checked}>
            Idegen nyelvű könyv automatikus fordítása magyarra
          </label>
          ${this.isProcessing ? html`<div style="margin-top:10px;">⏳ A teljes szöveg kinyerése folyamatban…</div>` : ''}
          ${this.extractionError ? html`<div class="error" role="alert">${this.extractionError}</div>` : ''}
          ${this.extraction ? html`
            <div class="file-result" role="status">
              ✅ ${this.extraction.fileName}: ${this.extraction.wordCount.toLocaleString('hu-HU')} szó,
              ${this.extraction.characterCount.toLocaleString('hu-HU')} karakter${this.extraction.pageCount ? `, ${this.extraction.pageCount} oldal` : ''}.
              ${this.extraction.warnings.map((warning) => html`<div class="warning-text">⚠️ ${warning}</div>`)}
            </div>
          ` : ''}
          ${this.translationStatus ? html`<div class="file-result" aria-live="polite">${this.translationStatus}</div>` : ''}
        </div>
        <div class="input-group"><label for="work-type">Dokumentumtípus</label><select id="work-type" .value=${this.creativeWorkType} @change=${(e:Event)=>this.creativeWorkType=(e.target as HTMLSelectElement).value as CreativeWorkType|'auto'}><option value="auto">Automatikus felismerés</option><option value="wikiArticle">Wiki-cikk</option><option value="article">Külső cikk</option><option value="newsArticle">Hírcikk</option><option value="essay">Esszé</option><option value="research">Tanulmány</option><option value="book">Könyv</option><option value="novel">Regény</option><option value="novella">Kisregény</option><option value="shortStory">Novella / rövid történet</option><option value="anthology">Antológia</option><option value="sourcebook">Lore-könyv</option><option value="manual">Kézikönyv</option><option value="comic">Képregény</option><option value="manuscript">Kézirat</option></select></div>
        
        <div class="input-group">
          <label for="knowledge-title">Tudásanyag Címe</label>
          <input id="knowledge-title" type="text" .value=${this.articleTitle} @input=${(e: any) => this.articleTitle = e.target.value} placeholder="Pl. The Sin War: Birthright">
        </div>

        <div class="input-group">
          <label for="knowledge-subtitle">Rövid Leírás (Opcionális)</label>
          <input id="knowledge-subtitle" type="text" .value=${this.subtitle} @input=${(e: any) => this.subtitle = e.target.value} placeholder="Pl. Az első könyv a Sin War trilógiából">
        </div>

        <div class="input-group">
          <label for="knowledge-content">Nyers Tartalom (akár teljes könyv)</label>
          <textarea id="knowledge-content" rows="14" .value=${this.content} @input=${(e: any) => this.content = e.target.value} placeholder="Másold be ide a nyers szöveget... A rendszer automatikusan felismeri a fejezeteket (pl. '1. fejezet' vagy 'Chapter 1' alapján)."></textarea>
          <button class="btn btn-secondary" @click=${this.translateContent} ?disabled=${this.isProcessing || !this.content.trim()}>🌐 FORDÍTÁS MAGYARRA</button>
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
            ${a.existingBook ? html`<div class="terminal-line" style="${getDelay(3)}"><span class="icon-emoji">♻️</span><span class="success-text">Meglévő work felismerve:</span> ${a.existingBook.title} — ${a.newChapterCount} új, ${a.changedChapterCount} módosult, ${a.unchangedChapterCount} változatlan fejezet</div>` : ''}
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
          <button class="btn" @click=${this.handleSave} ?disabled=${this.isProcessing}>
            [ ${a.isBook ? 'TELJES KÖNYV INTEGRÁLÁSA' : 'CIKK INTEGRÁLÁSA'} ]
          </button>
        </div>
      </div>
    `;
  }
}
