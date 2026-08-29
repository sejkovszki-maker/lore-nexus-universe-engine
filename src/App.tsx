import { Component, createSignal, onMount } from 'solid-js';
import { useAppStore } from './store/appState';
import { db } from './db/database';

import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { WikiArticleGrid } from './components/WikiArticleGrid';
import { LoreNetwork } from './components/LoreNetwork';
import { ArticleView } from './components/ArticleView';
import { Editor } from './components/Editor';

const App: Component = () => {
  const [isDbReady, setIsDbReady] = createSignal(false);
  const activeTab = () => useAppStore.getState().activeTab;

  onMount(async () => {
    try {
      await db.open();
      setIsDbReady(true);
    } catch (err) {
      console.error('Dexie DB hiba:', err);
    }
  });

  return (
    <div class="app-container">
      <header class="main-header">
        <h1>Diablo Lore Portal</h1>
        <p>A Teljes Magyar Enciklopédia</p>
      </header>

      <Navigation />
      
      <main class="content-area">
        {!isDbReady() ? (
          <div class="loading-state">Adatbázis betöltése folyamatban...</div>
        ) : (
          <>
            {activeTab() === 'timeline' && <Timeline />}
            {activeTab() === 'articles' && <WikiArticleGrid />}
            {activeTab() === 'lore-map' && <LoreNetwork />}
            {activeTab() === 'editor' && <Editor />}
            {activeTab() === 'article-view' && <ArticleView />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;


