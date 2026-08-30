import Dexie, { type Table } from 'dexie';

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  content: string;
  lastEdited: number;
  relatedArticles?: string[];
  type?: 'article' | 'book' | 'chapter';
  parentBook?: string;
}

export class DiabloDatabase extends Dexie {
  articles!: Table<Article, string>;

  constructor() {
    super('DiabloWikiDB');
    this.version(1).stores({
      articles: 'id, title, category, lastEdited' // Indexed fields
    });
  }
}

export const db = new DiabloDatabase();
