import { db, type Article } from '../db/database.ts';
import type { DocumentRecord, ImportMode, ImportRun } from './knowledge-sync.ts';
import { KnowledgeSyncEngine } from './knowledge-sync.ts';
import type { WikiArticle } from '../types.ts';
import { isStoredArticle } from '../wiki/user-article-store.ts';

export async function findLatestWorkDocument(workId:string):Promise<DocumentRecord|undefined>{
  const records=await db.documents.where('workId').equals(workId).toArray();
  return records.sort((a,b)=>b.importedAtUtc.localeCompare(a.importedAtUtc))[0];
}

export async function persistDocumentImport(record:DocumentRecord,mode:ImportMode):Promise<ImportRun>{
  const exact=await db.documents.where('sha256').equals(record.sha256).first();
  if(exact){const run=KnowledgeSyncEngine.compare(exact,record,mode);await db.importRuns.put(run);return run;}
  const previous=record.previousDocumentId?await db.documents.get(record.previousDocumentId):await findLatestWorkDocument(record.workId);
  const run=KnowledgeSyncEngine.compare(previous,record,mode);
  await db.transaction('rw',db.documents,db.importRuns,async()=>{await db.documents.put(record);await db.importRuns.put(run);});
  return run;
}

export async function persistSynchronizedImport(record:DocumentRecord,mode:ImportMode,articles:WikiArticle[]):Promise<ImportRun>{
  if(!articles.length)throw new Error('EMPTY_SYNC_ARTICLE_BATCH');
  if(articles.some(article=>!isStoredArticle(article)))throw new Error('INVALID_SYNC_ARTICLE');
  if(new Set(articles.map(article=>article.id)).size!==articles.length)throw new Error('DUPLICATE_SYNC_ARTICLE_ID');
  const previous=record.previousDocumentId?await db.documents.get(record.previousDocumentId):await findLatestWorkDocument(record.workId);
  const run=KnowledgeSyncEngine.compare(previous,record,mode);
  await db.transaction('rw',db.documents,db.importRuns,db.articles,async()=>{
    await db.documents.put(record);await db.importRuns.put(run);await db.articles.bulkPut(articles as Article[]);
  });
  return run;
}

export async function rollbackDocumentImport(importRunId:string):Promise<boolean>{
  const run=await db.importRuns.get(importRunId);if(!run)return false;
  await db.transaction('rw',db.documents,db.importRuns,async()=>{await db.documents.delete(run.documentId);await db.importRuns.delete(run.importRunId);});
  return true;
}
