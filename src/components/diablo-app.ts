import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';
import { wikiArticles } from '../data/wikiArticles.ts';
import { articleUniverseId } from '../universe/article-universes.ts';

import './diablo-navigation';
import './story-reader';
import './wiki-article-grid';
import './wiki-article-view';
import './diablo-timeline';
import './canon-conflict-dashboard';
import './book-library';
import './source-library';
import './wiki-search-page';

@customElement('diablo-app')
export class DiabloApp extends LitElement {
  @state()
  private activeTab = useAppStore.getState().activeTab;
  @state()
  private activeUniverseId = useAppStore.getState().activeUniverseId;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
      this.activeUniverseId = state.activeUniverseId;
    });
  }

  createRenderRoot() {
    return this; // Disable shadow DOM for Tailwind inheritance
  }

  private revealContent(selector = '.codex-content') {
    void this.updateComplete.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(selector) ?? document.querySelector<HTMLElement>('.codex-content');
      target?.scrollIntoView({ behavior: 'auto', block: 'start' });
    })));
  }

  private changeTab(tab: string) {
    useAppStore.setActiveTab(tab);
    this.revealContent();
  }

  private showArticles(query = '', category: string | null = null) {
    useAppStore.setSearchQuery(query);
    useAppStore.setActiveCategory(category);
    useAppStore.setActiveTab('articles');
    this.revealContent(query || category ? '.codex-directory' : '.codex-content');
  }

  private openRandomArticle() {
    const articles = Object.values(wikiArticles).filter(article => articleUniverseId(article) === this.activeUniverseId && article.type !== 'chapter' && article.type !== 'book');
    const article = articles[Math.floor(Math.random() * articles.length)];
    if (article) {
      useAppStore.openArticleRoute(article.id);
      this.revealContent();
    }
  }

  render() {
    const state = useAppStore.getState();
    const hasArticleFilter = Boolean(state.currentSearchQuery || state.activeCategory || (state.activeGameTag && state.activeGameTag !== 'ALL'));
    const section = ({
      ...(hasArticleFilter ? { articles: ['Archívum', 'Fedezd fel a világ krónikáit, szereplőit és helyszíneit'] as [string, string] } : {}),
      timeline: ['Kronológia', 'A világ történetei időrendben'],
      story: ['Folyamatos történet', 'Olvasd Sanctuary és a Kontinens történeteit egyetlen ívben'],
      books: ['Könyvtár', 'Regények, novellák és kiegészítő történetek'],
      sources: ['Forrástár', 'Ellenőrzött műjegyzék és hivatkozások'],
      conflicts: ['Kánon áttekintése', 'Eltérő folytonosságok és értelmezések'],
      'article-view': ['Szócikk', 'A világok részletes enciklopédiája'],
      search: ['Keresés', 'Találd meg a keresett történetet vagy szereplőt'],
    } as Record<string, [string, string]>)[this.activeTab];
    return html`
      <div class="codex-app-shell ${this.activeUniverseId === 'witcher' ? 'universe-witcher' : 'universe-diablo'}">
        <diablo-navigation></diablo-navigation>
        ${this.activeUniverseId === 'witcher' ? html`<aside class="codex-sidebar" aria-label="Vaják archívum">
          <h2>Vaják</h2>
          <button class="sidebar-overview" @click=${()=>this.showArticles()}><i class="fa-solid fa-house"></i> Áttekintés</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('', 'Karakterek')}>Szereplők</button>
          <button @click=${()=>this.showArticles('Geralt')}><i class="fa-solid fa-user-shield"></i> Ríviai Geralt</button>
          <button @click=${()=>this.showArticles('Yennefer')}><i class="fa-solid fa-wand-sparkles"></i> Yennefer</button>
          <button @click=${()=>this.showArticles('Ciri')}><i class="fa-solid fa-star"></i> Ciri</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('', 'Világ')}>A Kontinens</button>
          <button @click=${()=>this.showArticles('Kontinens')}><i class="fa-solid fa-earth-europe"></i> A világ</button>
          <button @click=${()=>this.showArticles('Északi')}><i class="fa-solid fa-crown"></i> Északi Királyságok</button>
          <button @click=${()=>this.showArticles('Nilfgaard')}><i class="fa-solid fa-chess-rook"></i> Nilfgaard</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('', 'Játékkódex')}>Játékkódex</button>
          <button @click=${()=>useAppStore.openArticleRoute('witcher-game-codex')}><i class="fa-solid fa-book-journal-whills"></i> Teljes áttekintés</button>
          <button @click=${()=>this.showArticles('', 'Játékkódex – Bestiárium')}><i class="fa-solid fa-dragon"></i> Bestiárium</button>
          <button @click=${()=>this.showArticles('', 'Játékkódex – Alkímia')}><i class="fa-solid fa-flask"></i> Elixírek és alkímia</button>
          <button @click=${()=>this.showArticles('', 'Játékkódex – Olvasmányok')}><i class="fa-solid fa-scroll"></i> Könyvek és iratok</button>
          <button @click=${()=>this.showArticles('', 'Játékkódex – Világpontok')}><i class="fa-solid fa-map-location-dot"></i> Hatalmi helyek</button>
          <button class="sidebar-group-title" @click=${()=>this.changeTab('timeline')}>Történet</button>
          <button @click=${()=>this.changeTab('timeline')}><i class="fa-solid fa-hourglass-half"></i> Kronológia</button>
          <button @click=${()=>this.changeTab('story')}><i class="fa-solid fa-book-open"></i> Folyamatos olvasás</button>
          <button class="sidebar-group-title" @click=${()=>this.changeTab('books')}>Könyvtár</button>
          <button @click=${()=>this.changeTab('books')}><i class="fa-solid fa-book"></i> Vaják-könyvek</button>
          <button class="random-article" @click=${this.openRandomArticle}><i class="fa-solid fa-dice"></i> Véletlen cikk</button>
        </aside>` : html`<aside class="codex-sidebar" aria-label="Diablo kódex">
          <h2>Codex</h2>
          <button class="sidebar-overview" @click=${()=>this.showArticles()}><i class="fa-solid fa-house"></i> Áttekintés</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('Sanctuary')}>Univerzum</button>
          <button aria-label="Sanctuary világa" @click=${()=>this.showArticles('Sanctuary')}><i class="fa-solid fa-globe"></i> Sanctuary világa</button>
          <button aria-label="Angiris Tanács" @click=${()=>this.showArticles('Angiris')}><i class="fa-solid fa-sun"></i> Angiris Tanács</button>
          <button aria-label="Nagy Konfliktus" @click=${()=>this.showArticles('Eternal Conflict')}><i class="fa-solid fa-burst"></i> Nagy Konfliktus</button>
          <button aria-label="Mennyek és Pokol" @click=${()=>this.showArticles('Pokol')}><i class="fa-solid fa-star"></i> Mennyek és Pokol</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('Kicsoda')}>Lények</button>
          <button aria-label="Démonok" @click=${()=>this.showArticles('démon')}><i class="fa-solid fa-fire"></i> Démonok</button>
          <button aria-label="Angyalok" @click=${()=>this.showArticles('angyal')}><i class="fa-solid fa-feather"></i> Angyalok</button>
          <button aria-label="Emberek" @click=${()=>this.showArticles('ember')}><i class="fa-solid fa-user"></i> Emberek</button>
          <button class="sidebar-group-title" @click=${()=>this.showArticles('', 'Helyszínek')}>Helyszínek</button>
          <button aria-label="Kehjistan" @click=${()=>this.showArticles('Kehjistan')}><i class="fa-solid fa-location-dot"></i> Kehjistan</button>
          <button aria-label="Scosglen" @click=${()=>this.showArticles('Scosglen')}><i class="fa-solid fa-tree"></i> Scosglen</button>
          <button aria-label="Egyéb helyszínek" @click=${()=>this.showArticles('', 'Helyszínek')}><i class="fa-solid fa-compass"></i> Egyéb helyszínek</button>
          <button class="sidebar-group-title" aria-label="Események – idővonal megnyitása" @click=${()=>this.changeTab('timeline')}>Események</button>
          <button aria-label="Oldalsáv – teljes idővonal megnyitása" @click=${()=>this.changeTab('timeline')}><i class="fa-solid fa-hourglass-half"></i> Teljes kronológia</button>
          <button aria-label="Oldalsáv – folyamatos olvasás megnyitása" @click=${()=>this.changeTab('story')}><i class="fa-solid fa-book-open"></i> Folyamatos történet</button>
          <button class="sidebar-group-title" aria-label="Oldalsáv – könyvtár megnyitása" @click=${()=>this.changeTab('books')}>Könyvtár</button>
          <button aria-label="Oldalsáv – könyvtár megnyitása" @click=${()=>this.changeTab('books')}><i class="fa-solid fa-book"></i> Könyvek</button>
          <button class="random-article" @click=${this.openRandomArticle}><i class="fa-solid fa-dice"></i> Véletlen cikk</button>
        </aside>`}
        <main class="codex-content">
          ${section ? html`<header class="unified-menu-header">
            <span>${this.activeUniverseId === 'witcher' ? 'Lore Nexus · Vaják Archívum' : 'Lore Nexus · Sanctuary Archívum'}</span>
            <h2>${section[0]}</h2><p>${section[1]}</p>
          </header>` : ''}
          <section class="unified-menu-surface ${section ? 'unified-menu-surface--active' : ''}">
            ${this.activeTab === 'timeline' ? html`<diablo-timeline class="w-full"></diablo-timeline>` : ''}
            ${this.activeTab === 'articles' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
            ${this.activeTab === 'search' ? html`<wiki-search-page class="w-full"></wiki-search-page>` : ''}
            ${this.activeTab === 'story' ? html`<story-reader class="w-full"></story-reader>` : ''}
            ${this.activeTab === 'books' ? html`<book-library class="w-full"></book-library>` : ''}
            ${this.activeTab === 'sources' ? html`<source-library class="w-full"></source-library>` : ''}
            ${this.activeTab === 'article-view' ? html`<wiki-article-view class="w-full"></wiki-article-view>` : ''}
            ${this.activeTab === 'conflicts' ? html`<canon-conflict-dashboard class="w-full"></canon-conflict-dashboard>` : ''}
            ${this.activeTab === 'not-found' ? html`<section role="alert" class="w-full max-w-2xl bg-dark-card border border-blood-red rounded-xl p-8 text-center"><h1 class="text-gold text-3xl font-heading">Az oldal nem található</h1><p>A hivatkozás hibás, vagy a tartalom nem ehhez az univerzumhoz tartozik.</p><button class="mt-4 px-4 py-2 border border-gold rounded text-gold" @click=${()=>this.changeTab('articles')}>Vissza a cikkekhez</button></section>` : ''}
          </section>
        </main>
        <aside class="copyright-notice" aria-labelledby="legal-notice-title">
          <i class="fa-solid fa-scale-balanced copyright-notice-icon" aria-hidden="true"></i>
          <div class="copyright-notice-body">
            <h2 id="legal-notice-title" class="copyright-notice-title">Jogi és szerzői jogi tájékoztató</h2>
            <p class="copyright-notice-text">
              A Lore Nexus független, nem hivatalos, nem kereskedelmi rajongói enciklopédia. Nem áll kapcsolatban a
              Blizzard Entertainmenttel, Andrzej Sapkowskival, a CD PROJEKT RED-del, a Netflixszel vagy kiadóikkal, és egyik jogosult sem hagyta jóvá vagy támogatta az oldalt.
            </p>
            <details class="legal-details">
              <summary>Részletes jogi információk</summary>
              <section><h3>Harmadik felek szellemi tulajdona</h3><p>A Diablo és a Vaják/The Witcher világai, szereplői, történetei, játékai, védjegyei, logói és hivatalos képi anyagai az adott szerzők, kiadók és más jogosultak tulajdonai. A Vaják irodalmi műveinek szerzője Andrzej Sapkowski; a játékokhoz kapcsolódó jogokat a CD PROJEKT RED, a képernyős feldolgozásokhoz kapcsolódó jogokat a Netflix és partnerei kezelik. A regények és novellák eredeti szövegének, valamint hivatalos fordításainak jogai a megjelölt jogosultakat illetik. Mel Odom <em>The Black Road</em> című műve és annak fordítása nem a Lore Nexus szerkesztőjének szellemi tulajdona.</p></section>
              <section><h3>A Lore Nexus saját tartalma</h3><p>A szerkesztő kizárólag az általa önállóan létrehozott, egyéni és eredeti szerkesztői szöveg, adatstruktúra, programkód és grafikai elem jogait tarthatja fenn. Ez nem terjed ki a Diablo-univerzumra, a forrásművekre, harmadik féltől származó képekre, idézetekre vagy más védett elemekre. Egy mű lefordítása, rendszerezése vagy technikai feldolgozása önmagában nem ruházza át az eredeti mű jogait.</p></section>
              <section><h3>Felhasználás és forrásmegjelölés</h3><p>A forrásokra épülő ismertetők, összefoglalók és idézetek célja az enciklopédikus tájékoztatás. Minden felhasználást az alkalmazandó jog, a szükséges forrás- és szerzőmegjelölés, valamint az esetleges jogosulti engedély határoz meg. Az oldal nem ad tovább felhasználási engedélyt harmadik fél tartalmára, és a nem kereskedelmi jelleg önmagában nem tesz automatikusan jogszerűvé bármely felhasználást.</p></section>
              <section><h3>Pontosság, eltávolítás és kapcsolat</h3><p>A kánonbesorolások és fordítások szerkesztői feldolgozások, ezért hibát tartalmazhatnak. Jogosulti vagy helyesbítési kérés a projekt <a href="https://github.com/sejkovszki-maker/lore-nexus-universe-engine/issues" target="_blank" rel="noopener noreferrer">GitHub hibajegyoldalán</a> jelezhető. A vitatott tartalmat a kérés vizsgálata alatt korlátozni vagy eltávolítani lehet.</p></section>
              <section><h3>Helyi működés és telepítés</h3><p>A hordozható kiadás kizárólag a felhasználó saját gépén, loopback címen fut. A telepíthető PWA saját alkalmazásablakot és offline gyorsítótárat ad, de a helyi olvasási állás és a felhasználói tartalom eszközönként külön marad; másik gépre csak kifejezett exporttal vihető át.</p></section>
              <p class="legal-links"><a href="https://www.blizzard.com/legal" target="_blank" rel="noopener noreferrer">Blizzard jogi dokumentumok</a><span aria-hidden="true"> · </span><a href="https://njt.hu/jogszabaly/1999-76-00-00" target="_blank" rel="noopener noreferrer">1999. évi LXXVI. törvény</a></p>
              <p class="legal-advice">Ez a tájékoztató általános információ, nem egyedi jogi tanács.</p>
            </details>
          </div>
        </aside>
        <footer class="codex-footer"><span>Rólunk · Szabályzat · Közreműködők · Kapcsolat</span><strong>✥ Lore Nexus ${this.activeUniverseId === 'witcher' ? 'Vaják' : 'Diablo'} 5.0 ✥</strong><span>${this.activeUniverseId === 'witcher' ? 'A Kontinens privát olvasói archívuma' : 'Sanctuary rajongói enciklopédiája'}</span></footer>
      </div>
    `;
  }
}
