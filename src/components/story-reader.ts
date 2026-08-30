import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import DOMPurify from 'dompurify';
import { storyBooks, storyReadingPath } from '../wiki/story-order';
import { renderWikiLinks } from '../wiki/link-engine';
import { wikiArticles } from '../data/wikiArticles';
import { useAppStore } from '../store/appState.ts';

const STORAGE_KEY = 'lore-nexus:story-progress:v1';
const BOOKS_SETTING_KEY = 'lore-nexus:story-books:v1';

interface SavedProgress { articleId: string; scrollY: number; updatedAt: number }

@customElement('story-reader')
export class StoryReader extends LitElement {
  @state() private chapterIndex = 0;
  @state() private booksEnabled = true;
  @state() private universeId = useAppStore.getState().activeUniverseId;
  private restoreScrollY = 0;
  private saveTimer?: number;
  private unsubscribe?: () => void;
  private get chapters() { return storyReadingPath(this.booksEnabled, this.universeId); }

  static styles = css`
    :host { display:block; width:100%; max-width:900px; margin:0 auto; color:#eaddc5; }
    .reader { background:#151011; border:1px solid #d4af3733; border-radius:1rem; padding:clamp(1.25rem,4vw,3rem); box-shadow:0 20px 60px #0008; }
    .toolbar { position:sticky; top:0; z-index:4; background:#0a0809ee; backdrop-filter:blur(10px); border:1px solid #8b000055; border-radius:.75rem; padding:.8rem; margin-bottom:1.5rem; }
    .progress { height:.35rem; background:#2b2021; border-radius:99px; overflow:hidden; margin:.7rem 0; }
    .progress span { display:block; height:100%; background:linear-gradient(90deg,#8b0000,#d4af37); }
    .meta { display:flex; justify-content:space-between; gap:1rem; color:#cbbd9f; font-size:.9rem; }
    h1 { color:#d4af37; font-family:'Cinzel',serif; font-size:clamp(2rem,6vw,3.2rem); line-height:1.15; }
    .content { font-family:'Outfit',sans-serif; font-size:1.08rem; line-height:1.85; }
    .content h2,.content h3 { color:#d4af37; font-family:'Cinzel',serif; margin-top:2rem; }
    .content a { color:#e6c65c; text-decoration:underline dotted; text-underline-offset:.2em; }
    .controls { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:2.5rem; }
    .book-tools { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin:1rem 0; padding:.85rem; border:1px solid #d4af3744; border-radius:.65rem; background:#d4af370a; }
    .book-badge { color:#d4af37; font-weight:800; }
    .toggle { display:flex; align-items:center; gap:.55rem; cursor:pointer; }
    .toggle input { inline-size:1.15rem; block-size:1.15rem; accent-color:#d4af37; }
    button { min-height:48px; border:1px solid #d4af3766; border-radius:.65rem; background:#d4af3712; color:#f0dfbc; padding:.75rem 1rem; cursor:pointer; font-weight:700; }
    button:hover,button:focus-visible { border-color:#d4af37; color:#d4af37; outline:2px solid transparent; }
    button:disabled { opacity:.35; cursor:not-allowed; }
    select { width:100%; background:#171112; color:#f0dfbc; border:1px solid #d4af3755; border-radius:.5rem; padding:.6rem; }
    @media(max-width:600px){ .meta{font-size:.8rem}.reader{border-radius:.6rem}.controls{grid-template-columns:1fr} }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.booksEnabled = localStorage.getItem(BOOKS_SETTING_KEY) !== 'false';
    this.unsubscribe = useAppStore.subscribe(state => {
      if (state.activeUniverseId !== this.universeId) this.universeId = state.activeUniverseId;
      if (state.activeTab === 'story' && state.activeArticleId) {
        const index = this.chapters.findIndex(chapter => chapter.article.id === state.activeArticleId);
        if (index >= 0 && index !== this.chapterIndex) this.chapterIndex = index;
      }
    });
    const requested = useAppStore.getState().activeArticleId;
    const saved = this.loadProgress();
    const requestedIndex = this.chapters.findIndex(chapter => chapter.article.id === requested);
    if (requestedIndex >= 0) this.chapterIndex = requestedIndex;
    else if (saved) {
      const index = this.chapters.findIndex(chapter => chapter.article.id === saved.articleId);
      if (index >= 0) this.chapterIndex = index;
      this.restoreScrollY = Math.max(0, saved.scrollY);
    }
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.unsubscribe?.();
    this.saveProgress();
    super.disconnectedCallback();
  }

  protected firstUpdated() { this.restorePosition(); }

  private handleScroll = () => {
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.saveProgress(), 250);
  };

  private loadProgress(): SavedProgress | null {
    try { return JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${this.universeId}`) || 'null'); } catch { return null; }
  }

  private saveProgress() {
    const chapter = this.chapters[this.chapterIndex];
    if (!chapter) return;
    const progress: SavedProgress = { articleId: chapter.article.id, scrollY: window.scrollY, updatedAt: Date.now() };
    localStorage.setItem(`${STORAGE_KEY}:${this.universeId}`, JSON.stringify(progress));
  }

  private restorePosition() {
    requestAnimationFrame(() => window.scrollTo({ top: this.restoreScrollY, behavior: 'auto' }));
  }

  private goTo(index: number) {
    this.chapterIndex = Math.min(this.chapters.length - 1, Math.max(0, index));
    this.restoreScrollY = 0;
    this.saveProgress();
    useAppStore.openStoryRoute(this.chapters[this.chapterIndex].article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private toggleBooks(event: Event) {
    const enabled = (event.target as HTMLInputElement).checked;
    const currentChapter = this.chapters[this.chapterIndex];
    const currentId = currentChapter?.article.id;
    this.booksEnabled = enabled;
    localStorage.setItem(BOOKS_SETTING_KEY, String(enabled));
    const nextPath = storyReadingPath(enabled, this.universeId);
    const sameArticle = nextPath.findIndex(item => item.article.id === currentId);
    if (sameArticle >= 0) this.chapterIndex = sameArticle;
    else if (!enabled && currentChapter?.segmentId) {
      const segment = storyBooks(this.universeId).find(item => item.id === currentChapter.segmentId);
      const anchor = nextPath.findIndex(item => item.article.id === segment?.after);
      this.chapterIndex = Math.min(nextPath.length - 1, Math.max(0, anchor + 1));
    } else this.chapterIndex = Math.min(this.chapterIndex, nextPath.length - 1);
    this.saveProgress();
  }

  private skipCurrentBook() {
    const currentSegment = this.chapters[this.chapterIndex]?.segmentId;
    if (!currentSegment) return;
    const next = this.chapters.findIndex((chapter, index) => index > this.chapterIndex && chapter.segmentId !== currentSegment);
    this.goTo(next >= 0 ? next : this.chapters.length - 1);
  }

  private articleHtml(content: string) {
    const scopedArticles = Object.fromEntries(Object.entries(wikiArticles).filter(([, article]) => (article.universeId || 'diablo') === this.universeId));
    const linked = renderWikiLinks(content, scopedArticles);
    return DOMPurify.sanitize(linked, { ADD_ATTR: ['data-wiki-id', 'data-relation'] });
  }

  private openWikiLink(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest<HTMLElement>('[data-wiki-id]');
    if (!anchor) return;
    event.preventDefault();
    useAppStore.openArticleRoute(anchor.dataset.wikiId || '');
  }

  render() {
    const chapter = this.chapters[this.chapterIndex];
    const article = chapter?.article;
    if (!article) return html`<p>A történet jelenleg nem érhető el.</p>`;
    const percent = Math.round(((this.chapterIndex + 1) / this.chapters.length) * 100);
    return html`<section class="reader" aria-labelledby="story-title">
      <div class="toolbar">
        <label for="story-chapter">Fejezet</label>
          <select id="story-chapter" aria-label="Történeti fejezet" .value=${String(this.chapterIndex)} @change=${(event: Event) => this.goTo(Number((event.target as HTMLSelectElement).value))}>
            ${this.chapters.map((item, index) => html`<option value=${index}>${index + 1}. ${item.segmentId ? '📖 ' : ''}${item.article.title}</option>`)}
          </select>
        <div class="book-tools">
          <label class="toggle"><input type="checkbox" .checked=${this.booksEnabled} @change=${this.toggleBooks}> Könyvek beillesztése a történetbe</label>
          ${chapter.segmentId ? html`<button @click=${this.skipCurrentBook}>A teljes könyv átugrása →</button>` : html`<span>A könyvek a megfelelő történeti ponton jelennek meg.</span>`}
        </div>
        <div class="progress" role="progressbar" aria-label="Olvasási előrehaladás" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${percent} aria-valuetext=${`${this.chapterIndex + 1}/${this.chapters.length}. fejezet`}><span style=${`width:${percent}%`}></span></div>
        <div class="meta"><span>${this.chapterIndex + 1}/${this.chapters.length}. fejezet</span><span>${percent}% – a pozíció automatikusan mentve</span></div>
      </div>
      <article>
        ${chapter.segmentTitle ? html`<p class="book-badge">📖 Könyvszakasz: ${chapter.segmentTitle}</p>` : ''}
        <p>${article.category}</p>
        <h1 id="story-title">${article.title}</h1>
        ${article.subtitle ? html`<p><em>${article.subtitle}</em></p>` : ''}
        <div class="content" @click=${this.openWikiLink} .innerHTML=${this.articleHtml(article.content)}></div>
      </article>
      <nav class="controls" aria-label="Történet fejezetei">
        <button ?disabled=${this.chapterIndex === 0} @click=${() => this.goTo(this.chapterIndex - 1)}>← Előző fejezet</button>
        <button ?disabled=${this.chapterIndex === this.chapters.length - 1} @click=${() => this.goTo(this.chapterIndex + 1)}>Következő fejezet →</button>
      </nav>
    </section>`;
  }
}
