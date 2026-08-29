export interface WikiInfobox {
    [key: string]: string;
}

export interface WikiArticle {
    id: string;
    title: string;
    subtitle?: string;
    category: string;
    content: string;

    infobox?: WikiInfobox;

    relatedArticles?: string[];

    type?: 'article' | 'book' | 'chapter';
    parentBook?: string;

    lastEdited?: number;

    [key: string]: unknown;
}

export type WikiArticles =
    Record<string, WikiArticle>;

export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    date?: string;
    era?: string;
    category?: string;

    [key: string]: unknown;
}

export interface AppState {
    activeTab: string;
    searchQuery: string;
    currentSearchQuery: string;
    activeGameTag: string;
    activeEraId: string;
    activeArticleCategory: string;
    activeCategory: string | null;
    activeArticleId: string | null;

    reader: {
        bookId: string | null;
        chapterId: string | null;
        pageIndex: number;
    };
}
