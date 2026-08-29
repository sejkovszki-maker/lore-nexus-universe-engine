import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import Graph from 'graphology';
import Sigma from 'sigma';
import { wikiArticles } from '../data/wikiArticles';

@customElement('lore-network')
export class LoreNetwork extends LitElement {
  @query('#sigma-container')
  container!: HTMLDivElement;

  private sigmaInstance: Sigma | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 80vh;
      background: #0a0809;
    }
    #sigma-container {
      width: 100%;
      height: 100%;
    }
  `;

  firstUpdated() {
    this.initGraph();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.sigmaInstance) {
      this.sigmaInstance.kill();
    }
  }

  private initGraph() {
    const graph = new Graph();
    const existingNodes = new Set<string>();

    // 1. Csomópontok hozzáadása
    Object.keys(wikiArticles).forEach(key => {
      const art = wikiArticles[key];
      if (['Karakterek', 'Főgonoszok', 'Angyalok', 'Démonok', 'Helyszínek', 'Tárgyak'].includes(art.category) || (art.relatedArticles && art.relatedArticles.length > 0)) {
        if (!existingNodes.has(key)) {
          graph.addNode(key, {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 10,
            label: art.title,
            color: this.getColorForCategory(art.category)
          });
          existingNodes.add(key);
        }

        // 2. Élek hozzáadása
        if (art.relatedArticles) {
          art.relatedArticles.forEach((rel: string) => {
            if (!existingNodes.has(rel) && wikiArticles[rel]) {
              const relArt = wikiArticles[rel];
              graph.addNode(rel, {
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 10,
                label: relArt.title,
                color: this.getColorForCategory(relArt.category)
              });
              existingNodes.add(rel);
            }
            if (existingNodes.has(key) && existingNodes.has(rel) && !graph.hasEdge(key, rel)) {
              graph.addEdge(key, rel, { color: 'rgba(212, 175, 55, 0.4)', size: 1 });
            }
          });
        }
      }
    });

    // 3. Sigma.js (WebGL) inicializálása
    this.sigmaInstance = new Sigma(graph, this.container, {
      renderEdgeLabels: true,
      defaultNodeColor: '#f8fafc',
      labelFont: 'Outfit, sans-serif'
    });
  }

  private getColorForCategory(category: string): string {
    switch (category) {
      case 'Angyalok': return '#38bdf8';
      case 'Démonok':
      case 'Főgonoszok': return '#ef4444';
      case 'Helyszínek': return '#8b5cf6';
      default: return '#f59e0b'; // Humans/Nephalem
    }
  }

  render() {
    return html`<div id="sigma-container"></div>`;
  }
}
