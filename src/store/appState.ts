import type { AppState } from "../types";

const hash = typeof window !== 'undefined' ? window.location.hash : '';
const initialTab = hash.startsWith('#tab/') ? hash.split('/')[1] : 'timeline';

const initialState: AppState = {
    activeTab: initialTab,

    searchQuery: "",
    currentSearchQuery: "",

    activeGameTag: "ALL",

    activeEraId: "ALL",

    activeArticleCategory: "ALL",
    activeCategory: null,
    
    activeArticleId: null,

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
    if (typeof window !== 'undefined') {
        window.location.hash = `#tab/${tab}`;
    }
    notify();
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
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#tab/')) {
            const tab = hash.split('/')[1];
            if (state.activeTab !== tab) {
                state = { ...state, activeTab: tab };
                notify();
            }
        }
    });
}
