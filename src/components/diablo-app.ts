import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';

import './diablo-navigation';
import './lore-network';
import './wiki-article-grid';
import './wiki-article-view';
import './wiki-editor';
import './diablo-timeline';
import './canon-conflict-dashboard';

@customElement('diablo-app')
export class DiabloApp extends LitElement {
  @state()
  private activeTab = useAppStore.getState().activeTab;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
    });
  }

  createRenderRoot() {
    return this; // Disable shadow DOM for Tailwind inheritance
  }

  render() {
    return html`
      <div class="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-24 md:pb-12 flex flex-col items-center">
        <diablo-navigation></diablo-navigation>
        
        <main class="w-full flex justify-center mt-6 relative">
          ${this.activeTab === 'timeline' ? html`<diablo-timeline class="w-full"></diablo-timeline>` : ''}
          ${this.activeTab === 'articles' ? html`<wiki-article-grid class="w-full"></wiki-article-grid>` : ''}
          ${this.activeTab === 'lore-map' ? html`<lore-network class="w-full rounded-xl overflow-hidden shadow-2xl border border-blood-red/30"></lore-network>` : ''}
          ${this.activeTab === 'editor' ? html`<wiki-editor class="w-full max-w-4xl mx-auto"></wiki-editor>` : ''}
          ${this.activeTab === 'article-view' ? html`<wiki-article-view class="w-full"></wiki-article-view>` : ''}
          ${this.activeTab === 'conflicts' ? html`<canon-conflict-dashboard class="w-full"></canon-conflict-dashboard>` : ''}
        </main>
      </div>
    `;
  }
}
