import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useAppStore } from '../store/appState.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import { articleUniverseId } from '../universe/article-universes.ts';
import { latestReadingItem } from '../wiki/reading-dashboard.ts';

const featured = [
  { id: 'prime-lesser-evils', eyebrow: 'A Pokol urai', icon: 'fa-fire', description: 'Diablo, Baal és Mephisto: a Nagy Konfliktus legsötétebb hatalmai.' },
  { id: 'sanctuary-full-lexicon', eyebrow: 'Sanctuary', icon: 'fa-map-location-dot', description: 'Az emberiség rejtett világa, két örök háború között.' },
  { id: 'dark-exile', eyebrow: 'Száműzetés', icon: 'fa-feather', description: 'A démoni testvérek száműzetése és a következményei.' },
] as const;

const gateways = [
  { id: 'kozmogonia', label: 'Kozmogónia', icon: 'fa-star' },
  { id: 'sanctuary-full-lexicon', label: 'Sanctuary', icon: 'fa-map-location-dot' },
  { id: 'prime-lesser-evils', label: 'Démonok és angyalok', icon: 'fa-shield-halved' },
  { id: 'dark-exile', label: 'A Sötét Száműzetés', icon: 'fa-hourglass-half' },
] as const;

@customElement('diablo-home')
export class DiabloHome extends LitElement {
  createRenderRoot() { return this; }

  private openArticle(id: string) {
    useAppStore.openArticleRoute(id);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }

  private openTab(tab: 'articles' | 'timeline') {
    useAppStore.setActiveTab(tab);
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.codex-content')?.scrollIntoView({ block: 'start' }));
  }

  render() {
    const records = Object.values(wikiArticles).filter(article => articleUniverseId(article) === 'diablo');
    const articles = records.filter(article => article.type !== 'book' && article.type !== 'chapter');
    const selected = featured.map(item => ({ ...item, article: wikiArticles[item.id] })).filter(item => item.article);
    const continuation = latestReadingItem('diablo', wikiArticles);

    return html`<section class="witcher-home diablo-home" aria-labelledby="diablo-home-title">
      <header class="witcher-hero diablo-hero">
        <img class="witcher-hero-art" src=${`${import.meta.env.BASE_URL}assets/diablo-hero-v3.png`} alt="Diablo egy lávával övezett, romos gótikus erőd fölé magasodik" fetchpriority="high">
        <div class="witcher-hero-copy">
          <p class="witcher-kicker">Lore Nexus · Sanctuary Archívum</p>
          <h1 id="diablo-home-title">Sanctuary kódexe</h1>
          <p class="witcher-lead">Fedezd fel a Nagy Konfliktus történetét, az ég és a Pokol örök háborúját, valamint az emberiség világának elveszett krónikáit.</p>
          <div class="witcher-hero-actions">
            <button class="witcher-primary-action" @click=${() => this.openTab('articles')}><i class="fa-solid fa-book-open" aria-hidden="true"></i> Cikkek böngészése</button>
            <button @click=${() => this.openTab('timeline')}><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i> Idővonal</button>
          </div>
        </div>
      </header>

      <dl class="witcher-stats" aria-label="A Sanctuary Archívum tartalma">
        <div><dt>Szócikk</dt><dd>${articles.length}</dd></div>
        <div><dt>Világ</dt><dd>1</dd></div>
        <div><dt>Konfliktus</dt><dd>Örök</dd></div>
        <div><dt>Nyelv</dt><dd>Magyar</dd></div>
      </dl>

      <section class="witcher-home-section" aria-labelledby="diablo-featured-title">
        <div class="witcher-section-heading"><div><span>Kiemelt krónikák</span><h2 id="diablo-featured-title">A sötétség öröksége</h2></div><button @click=${() => this.openTab('articles')}>Minden cikk ›</button></div>
        <div class="witcher-featured-grid">
          ${selected.map(({ article, eyebrow, icon, description }) => html`<button class="witcher-feature-card" @click=${() => this.openArticle(article.id)}>
            <span class="witcher-card-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
            <small>${eyebrow}</small><strong>${article.title}</strong><span>${description}</span><b>Szócikk megnyitása ›</b>
          </button>`)}
        </div>
      </section>

      <div class="witcher-home-columns">
        <section class="witcher-home-section witcher-gateways" aria-labelledby="diablo-world-title">
          <div class="witcher-section-heading"><div><span>Világkalauz</span><h2 id="diablo-world-title">Fedezd fel Sanctuaryt</h2></div></div>
          <div class="witcher-gateway-list">${gateways.map(item => html`<button @click=${() => this.openArticle(item.id)}><i class="fa-solid ${item.icon}" aria-hidden="true"></i><span>${item.label}</span><b>›</b></button>`)}</div>
        </section>
        <section class="witcher-home-section witcher-reading-start" aria-labelledby="diablo-reading-title">
          <span class="witcher-reading-label">${continuation?'Folytasd innen':'Ajánlott kezdés'}</span>
          <h2 id="diablo-reading-title">${continuation?.title??'A Nagy Konfliktus'}</h2>
          <p>${continuation?.detail??'Ismerd meg, hogyan született Sanctuary, és miért sodródik újra meg újra az angyalok és démonok örök háborújába.'}</p>
          <button class="witcher-primary-action" @click=${() => continuation?.kind==='book' ? useAppStore.openBookRoute(continuation.bookId!,continuation.chapterId) : continuation?.kind==='story' ? useAppStore.openStoryRoute(continuation.articleId) : this.openArticle('kozmogonia')}>${continuation?'Olvasás folytatása ›':'Kozmogónia megnyitása ›'}</button>
        </section>
      </div>

      <nav class="witcher-quick-nav" aria-label="Diablo gyorsnavigáció">
        <button @click=${() => this.openTab('timeline')}><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i><span><strong>Kronológia</strong><small>A Nagy Konfliktus eseményei</small></span></button>
        <button @click=${() => this.openArticle('prime-lesser-evils')}><i class="fa-solid fa-fire" aria-hidden="true"></i><span><strong>Pokoli urak</strong><small>Diablo és testvéreinek története</small></span></button>
        <button @click=${() => this.openArticle('sanctuary-full-lexicon')}><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i><span><strong>Helyszínek</strong><small>Sanctuary régiói és romjai</small></span></button>
      </nav>
    </section>`;
  }
}
