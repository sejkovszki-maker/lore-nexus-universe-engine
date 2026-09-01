import Dexie, { type Table } from 'dexie';

import type { DocumentRecord, ExportSnapshot, ImportRun } from '../sync/knowledge-sync.ts';

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
  universeId?: string;
  universeLabel?: string;
  storyAfter?: string;
  publicationStatus?: 'local-draft' | 'published';
  version?: number;
}

export class DiabloDatabase extends Dexie {
  articles!: Table<Article, string>;
  documents!: Table<DocumentRecord, string>;
  importRuns!: Table<ImportRun, string>;
  exportSnapshots!: Table<ExportSnapshot, string>;

  constructor() {
    super('DiabloWikiDB');
    this.version(1).stores({
      articles: 'id, title, category, lastEdited' // Indexed fields
    });
    this.version(2).stores({
      articles: 'id, title, category, lastEdited',
      documents: 'documentId, universeId, sha256, workId, instanceId, importedAtUtc, previousDocumentId',
      importRuns: 'importRunId, documentId, previousDocumentId, status, completedAtUtc',
      exportSnapshots: 'exportId, universeId, knowledgeSnapshotId, generatedAtUtc'
    });
  }
}

export const db = new DiabloDatabase();
