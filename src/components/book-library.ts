import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import DOMPurify from 'dompurify';
import { useAppStore } from '../store/appState.ts';
import { storyBooks } from '../wiki/story-order.ts';
import { renderWikiLinks } from '../wiki/link-engine.ts';
import { wikiArticles } from '../data/wikiArticles.ts';

@customElement('book-library')
export class BookLibrary extends LitElement {
  @state() private universeId = useAppStore.getState().activeUniverseId;
  @state() private bookId = useAppStore.getState().reader.bookId;
  @state() private chapterId = useAppStore.getState().reader.chapterId;
  private unsubscribe?: () => void;

  static styles = css`
    :host{display:block;width:100%;max-width:1000px;color:#eaddc5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}.card,.reader{background:#151011;border:1px solid #d4af3744;border-radius:1rem;padding:1.25rem}.card button,.controls button{min-height:48px;width:100%;border:1px solid #d4af3766;background:#d4af3712;color:#f0dfbc;border-radius:.6rem;padding:.7rem;cursor:pointer}.chapters{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.chapters button{min-height:44px;border:1px solid #d4af3755;background:#211718;color:#eaddc5;border-radius:.5rem;padding:.55rem}.chapters button[aria-current="page"]{border-color:#d4af37;color:#d4af37}.content{font-size:1.08rem;line-height:1.85}.context{color:#d4af37;font-weight:700}.controls{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem}@media(max-width:600px){.controls{grid-template-columns:1fr}}
  `;

  connectedCallback(){ super.connectedCallback(); this.unsubscribe = useAppStore.subscribe(state => { this.universeId=state.activeUniverseId; this.bookId=state.reader.bookId; this.chapterId=state.reader.chapterId; }); }
  disconnectedCallback(){ this.unsubscribe?.(); super.disconnectedCallback(); }
  private openWikiLink(event:MouseEvent){ const anchor=(event.target as HTMLElement).closest<HTMLElement>('[data-wiki-id]'); if(!anchor)return; event.preventDefault(); useAppStore.openArticleRoute(anchor.dataset.wikiId||''); }

  render(){
    const books=storyBooks(this.universeId);
    const book=books.find(item=>item.id===this.bookId);
    if(!book) return html`<section aria-labelledby="books-title"><h1 id="books-title">Könyvek</h1><p>A könyvek külön is olvashatók. A történetolvasóban a megadott kronológiai ponton jelennek meg.</p><div class="grid">${books.map(item=>html`<article class="card"><h2>${item.title}</h2><p>${item.chapters.length} fejezet${item.after?` • a történetben „${wikiArticles[item.after]?.title || item.after}” után`:''}</p><button @click=${()=>useAppStore.openBookRoute(item.id,item.chapters[0]?.id)}>Könyv olvasása</button></article>`)}</div>${books.length?'':html`<p>Ehhez az univerzumhoz még nincs külön olvasható könyv.</p>`}</section>`;
    const index=Math.max(0,book.chapters.findIndex(item=>item.id===this.chapterId)); const chapter=book.chapters[index];
    if(!chapter) return html`<p>A könyvnek nincs olvasható fejezete.</p>`;
    const scopedArticles=Object.fromEntries(Object.entries(wikiArticles).filter(([,article])=>(article.universeId||'diablo')===this.universeId));
    const content=DOMPurify.sanitize(renderWikiLinks(chapter.content,scopedArticles),{ADD_ATTR:['data-wiki-id','data-relation']});
    return html`<section class="reader" aria-labelledby="book-title"><button @click=${()=>useAppStore.setActiveTab('books')}>← Vissza a könyvekhez</button><p class="context">${book.after?`A történetben itt következik: ${wikiArticles[book.after]?.title || book.after} után.`:'A történeti hely később szerkeszthető.'}</p><h1 id="book-title">${book.title}</h1><div class="chapters" aria-label="Könyv fejezetei">${book.chapters.map((item,i)=>html`<button aria-current=${i===index?'page':'false'} @click=${()=>useAppStore.openBookRoute(book.id,item.id)}>${i+1}. fejezet</button>`)}</div><h2>${chapter.title}</h2><div class="content" @click=${this.openWikiLink} .innerHTML=${content}></div><nav class="controls" aria-label="Könyv lapozása"><button ?disabled=${index===0} @click=${()=>useAppStore.openBookRoute(book.id,book.chapters[index-1]?.id)}>← Előző</button><button ?disabled=${index===book.chapters.length-1} @click=${()=>useAppStore.openBookRoute(book.id,book.chapters[index+1]?.id)}>Következő →</button></nav></section>`;
  }
}
