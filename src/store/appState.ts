import type { AppState } from "../types";
import { navigate, parseRoute, type AppRoute } from '../router.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import { articleUniverseId, availableUniverses } from '../universe/article-universes.ts';
import { storyBooks } from '../wiki/story-order.ts';

const hash = typeof window !== 'undefined' ? window.location.hash : '';
const initialRoute = parseRoute(hash);
const routeTab = (route: AppRoute) => route.view === 'article-view' ? 'article-view' : route.view === 'book' ? 'books' : route.view;

const initialState: AppState = {
    activeTab: routeTab(initialRoute),
    activeUniverseId: initialRoute.universeId,
    routeStatus: initialRoute.view === 'not-found' ? 'not-found' : 'ready',

    searchQuery: "",
    currentSearchQuery: "",

    activeGameTag: "ALL",

    activeEraId: "ALL",

    activeArticleCategory: "ALL",
    activeCategory: null,
    
    activeArticleId: initialRoute.articleId ?? initialRoute.chapterId ?? null,

    reader: {
        bookId: null,
        chapterId: null,
        pageIndex: 0
    }
};

let state: AppState = {
    ...initialState,

    reader: {
        ...initialState.reader
    }
};

const listeners = new Set<
    (state: AppState) => void
>();

export function getAppState(): AppState {
    return state;
}

export function setAppState(
    patch: Partial<AppState>
): void {

    state = {
        ...state,
        ...patch
    };

    notify();
}

export function setActiveTab(
    tab: string
): void {
    state = {
        ...state,
        activeTab: tab
    };
    if (typeof window !== 'undefined') navigate({ view: tab === 'articles' ? 'articles' : tab as AppRoute['view'], universeId: state.activeUniverseId });
    else notify();
}

export function setActiveUniverse(universeId: string): void {
    state = { ...state, activeUniverseId: universeId, activeArticleId: null, activeCategory: null, searchQuery: '', currentSearchQuery: '' };
    if (typeof window !== 'undefined') navigate({ view: 'timeline', universeId });
    else notify();
}

export function openArticleRoute(articleId: string): void {
    if (typeof window !== 'undefined') navigate({ view: 'article-view', universeId: state.activeUniverseId, articleId });
    else { state = { ...state, activeTab: 'article-view', activeArticleId: articleId }; notify(); }
}

export function openStoryRoute(articleId?: string): void {
    if (typeof window !== 'undefined') navigate({ view: 'story', universeId: state.activeUniverseId, articleId });
}

export function openBookRoute(bookId: string, chapterId?: string): void {
    if (typeof window !== 'undefined') navigate({ view: 'book', universeId: state.activeUniverseId, bookId, chapterId });
}

export function setSearchQuery(
    query: string
): void {

    state = {
        ...state,
        searchQuery: query,
        currentSearchQuery: query
    };

    notify();
}

export function setGameTag(
    tag: string
): void {

    state = {
        ...state,
        activeGameTag: tag
    };

    notify();
}

export function setEra(
    eraId: string
): void {

    state = {
        ...state,
        activeEraId: eraId
    };

    notify();
}

export function setArticleCategory(
    category: string
): void {

    state = {
        ...state,
        activeArticleCategory: category
    };

    notify();
}

export function setActiveCategory(
    category: string | null
): void {
    state = {
        ...state,
        activeCategory: category
    };
    notify();
}

export function setActiveArticleId(
    id: string | null
): void {
    state = {
        ...state,
        activeArticleId: id
    };
    notify();
}

export function openReader(
    bookId: string,
    chapterId: string | null = null
): void {

    state = {
        ...state,

        reader: {
            bookId,
            chapterId,
            pageIndex: 0
        }
    };

    notify();
}

export function closeReader(): void {

    state = {
        ...state,

        reader: {
            bookId: null,
            chapterId: null,
            pageIndex: 0
        }
    };

    notify();
}

export function setReaderPage(
    pageIndex: number
): void {

    state = {
        ...state,

        reader: {
            ...state.reader,
            pageIndex: Math.max(0, pageIndex)
        }
    };

    notify();
}

export function subscribe(
    listener: (state: AppState) => void
): () => void {

    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function notify(): void {

    for (const listener of listeners) {
        listener(state);
    }
}

export function resetAppState(): void {

    state = {
        ...initialState,

        reader: {
            ...initialState.reader
        }
    };

    notify();
}

export const useAppStore = {
    getState: getAppState,
    setState: setAppState,
    subscribe: subscribe,
    setActiveTab: setActiveTab,
    setActiveUniverse,
    openArticleRoute,
    openStoryRoute,
    openBookRoute,
    setSearchQuery: setSearchQuery,
    setGameTag: setGameTag,
    setEra: setEra,
    setArticleCategory: setArticleCategory,
    setActiveCategory: setActiveCategory,
    setActiveArticleId: setActiveArticleId,
    openReader: openReader,
    closeReader: closeReader,
    setReaderPage: setReaderPage
};

if (typeof window !== 'undefined') {
    history.scrollRestoration = 'manual';
    const applyRoute = (route: AppRoute) => {
        let status: AppState['routeStatus'] = route.view === 'not-found' ? 'not-found' : 'ready';
        if (!availableUniverses(wikiArticles).some(universe => universe.id === route.universeId)) status = 'not-found';
        const requestedId = route.articleId ?? route.chapterId ?? route.eventId;
        if (requestedId && (!wikiArticles[requestedId] || articleUniverseId(wikiArticles[requestedId]) !== route.universeId)) status = 'not-found';
        if (route.bookId && !storyBooks(route.universeId).some(book => book.id === route.bookId && (!route.chapterId || book.chapters.some(chapter => chapter.id === route.chapterId)))) status = 'not-found';
        state = { ...state, activeTab: status === 'not-found' ? 'not-found' : routeTab(route), activeUniverseId: route.universeId, routeStatus: status, activeArticleId: status === 'ready' ? requestedId ?? null : null, reader: { ...state.reader, bookId: route.bookId ?? null, chapterId: route.chapterId ?? null } };
        notify();
        const saved = sessionStorage.getItem(`lore-scroll:${location.hash}`);
        requestAnimationFrame(() => window.scrollTo({ top: saved ? Number(saved) || 0 : 0 }));
    };
    window.addEventListener('hashchange', (event) => {
        try { const oldHash = new URL((event as HashChangeEvent).oldURL).hash; sessionStorage.setItem(`lore-scroll:${oldHash}`, String(window.scrollY)); } catch { /* synthetic event */ }
        applyRoute(parseRoute(window.location.hash));
    });
    applyRoute(initialRoute);
}
