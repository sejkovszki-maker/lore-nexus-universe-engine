import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState';

@customElement('diablo-navigation')
export class DiabloNavigation extends LitElement {
  @state()
  private activeTab = useAppStore.getState().activeTab;

  constructor() {
    super();
    useAppStore.subscribe((state) => {
      this.activeTab = state.activeTab;
    });
  }

  createRenderRoot() {
    return this; // Disable shadow DOM to inherit global Tailwind
  }

  private handleTabClick(tab: 'timeline' | 'articles' | 'lore-map' | 'editor' | 'conflicts') {
    useAppStore.setActiveTab(tab);
  }

  render() {
    const btnClass = "flex-1 flex flex-col md:flex-row items-center justify-center py-3 md:py-4 px-2 text-xs md:text-sm lg:text-base font-heading font-semibold uppercase tracking-wider transition-colors duration-300 md:border-b-2";
    const iconClass = "text-lg md:text-base mb-1 md:mb-0 md:mr-2";

    return html`
      <nav class="flex w-full bg-dark-bg border-t md:border-t-0 md:border-b border-blood-red/30 fixed bottom-0 md:sticky md:top-0 md:bottom-auto left-0 z-50 shadow-[0_-4px_10px_rgba(139,0,0,0.1)] md:shadow-[0_4px_10px_rgba(139,0,0,0.1)]">
        <button 
          class="${btnClass} ${this.activeTab === 'timeline' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('timeline')}
        >
          <i class="fa-solid fa-hourglass-half ${iconClass}"></i> <span>Kronológia</span>
        </button>
        <button 
          class="${btnClass} ${this.activeTab === 'articles' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('articles')}
        >
          <i class="fa-solid fa-book-journal-whills ${iconClass}"></i> <span>Cikkek</span>
        </button>
        <button 
          class="${btnClass} ${this.activeTab === 'lore-map' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('lore-map')}
        >
          <i class="fa-solid fa-project-diagram ${iconClass}"></i> <span>Hálózat</span>
        </button>
        <button 
          class="${btnClass} ${this.activeTab === 'editor' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}"
          @click=${() => this.handleTabClick('editor')}
        >
          <i class="fa-solid fa-pen-nib ${iconClass}"></i> <span>Új Cikk</span>
        </button>
        <button class="${btnClass} ${this.activeTab === 'conflicts' ? 'text-blood-red border-blood-red bg-blood-red/10' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}" @click=${() => this.handleTabClick('conflicts')}>
          <i class="fa-solid fa-scale-balanced ${iconClass}"></i> <span>Konfliktusok</span>
        </button>
      </nav>
    `;
  }
}
