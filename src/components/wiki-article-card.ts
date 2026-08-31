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
    .card { box-sizing:border-box;width:100%;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden;cursor:pointer;text-align:left;padding:1.25rem;border:1px solid rgba(184,134,11,.4);border-radius:.5rem;background:#1a1819;color:#eaddc5;transition:border-color .25s,box-shadow .25s,transform .25s; }
    .card:hover,.card:focus-visible{border-color:#d4af37;box-shadow:0 0 15px rgba(212,175,55,.3);outline:none}.card:focus-visible{outline:2px solid #d4af37;outline-offset:3px}
    h3{position:relative;z-index:1;margin:0 0 .5rem;color:#d4af37;font:700 clamp(1.15rem,2vw,1.45rem) 'Cinzel',serif}h4{position:relative;z-index:1;margin:0 0 1rem;color:rgba(234,221,197,.8);font:400 .95rem 'Outfit',sans-serif;line-height:1.5}.meta{position:relative;z-index:1;margin-top:auto;padding-top:1rem;display:flex;align-items:center;justify-content:space-between;gap:.5rem}.badge{padding:.3rem .5rem;border:1px solid rgba(139,0,0,.55);border-radius:.25rem;background:rgba(139,0,0,.18);color:#d65b4e;font:600 .7rem 'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.08em}.arrow{color:#d4af37;transition:transform .2s}.card:hover .arrow{transform:translateX(4px)}
    @media(min-width:1024px){.card{border-radius:1px;padding:1.15rem;background:linear-gradient(145deg,rgba(13,13,11,.98),rgba(7,8,7,.98));border-color:rgba(174,116,43,.46);box-shadow:inset 0 0 0 4px #050605,inset 0 0 0 5px rgba(174,116,43,.16),0 7px 20px rgba(0,0,0,.45)}.card::before,.card::after{content:'◆';position:absolute;color:#9c6427;font-size:.5rem}.card::before{top:5px;left:6px}.card::after{right:6px;bottom:5px}.card:hover{transform:translateY(-2px);background:linear-gradient(145deg,rgba(29,17,10,.98),rgba(7,8,7,.98));box-shadow:inset 0 0 0 4px #050605,inset 0 0 0 5px rgba(218,157,69,.3),0 10px 25px rgba(0,0,0,.7)}h3{color:#d6aa61;font-size:1.15rem;letter-spacing:.035em}h4{font-family:Georgia,'Times New Roman',serif;color:#bba98c}.badge{border-radius:1px;color:#c69850;border-color:#75451f;background:#130c08}}
    @media(prefers-reduced-motion:reduce){.card,.arrow{transition:none}}
  `;

  private handleClick() {
    useAppStore.openArticleRoute(this.id);
  }

  render() {
    return html`
      <button type="button" aria-label=${`${this.title} cikk megnyitása`} class="card"
        @click=${this.handleClick}
      >
        <h3>${this.title}</h3>
        ${this.subtitle ? html`<h4>${this.subtitle}</h4>` : ''}
        <div class="meta">
          <span class="badge">${this.category}</span>
          <i aria-hidden="true" class="arrow fa-solid fa-arrow-right"></i>
        </div>
      </button>
    `;
  }
}
