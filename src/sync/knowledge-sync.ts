import { detectStructure } from '../document/structure.ts';
import { createWorkIdentity, detectCreativeWorkType, type CreativeWorkType } from '../creative-work/model.ts';

export type ImportMode = 'metadata-only'|'library-import'|'knowledge-extraction'|'full-lore-ingestion'|'re-import'|'document-sync';
export type DocumentVisibility = 'private'|'local'|'metadata-only'|'public';

export interface TranslationProvenance { sourceLanguage:string; targetLanguage:'hu'; method:string; translatedAtUtc:string; confidence:number|null }
export interface DocumentSegment { segmentId:string; parentSegmentId:string|null; order:number; title:string|null; kind:'front-matter'|'chapter'|'section'|'appendix'|'bibliography'|'body'; startOffset:number; endOffset:number; originalText:string; translatedText?:string; translation?:TranslationProvenance }
export interface DocumentRecord { documentId:string; universeId:string; fileName:string; originalFileName:string; mediaType:string; fileSize:number; sha256:string; importedAtUtc:string; sourceId:string; workId:string; instanceId:string; itemId:string; creativeWorkType:CreativeWorkType; language:string; extractionStatus:'pending'|'processing'|'completed'|'partial'|'failed'; visibility:DocumentVisibility; extractionVersion:string; previousDocumentId?:string; derivedKnowledgeIds:string[]; segments:DocumentSegment[] }
export interface SegmentChange { kind:'added'|'changed'|'removed'|'unchanged'; segmentId:string; previousSegmentId?:string }
export interface ImportChangeSet { changeSetId:string; importRunId:string; createdIds:string[]; updatedIds:string[]; removedIds:string[]; segmentChanges:SegmentChange[]; reversible:true }
export interface ImportRun { importRunId:string; mode:ImportMode; documentId:string; previousDocumentId?:string; startedAtUtc:string; completedAtUtc:string; status:'completed'|'review-required'; changeSet:ImportChangeSet }
export interface ExportSnapshot { exportId:string; generatedAtUtc:string; knowledgeSnapshotId:string; universeId:string; schemaVersion:1; profile:'encyclopedia-article'|'research-dossier'|'timeline-dossier'|'source-canon-report'|'codex'; articleIds:string[]; factIds:string[]; eventIds:string[]; sourceIds:string[]; sha256:string }

const slug=(value:string)=>value.toLocaleLowerCase('hu-HU').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'document';
const normalized=(value:string)=>value.replace(/\s+/gu,' ').trim();
const segmentKind=(heading:string|null,order:number):DocumentSegment['kind']=>{
  const value=(heading||'').toLocaleLowerCase('hu-HU');
  if(order===0&&!heading)return'front-matter'; if(/appendix|függelék/.test(value))return'appendix';
  if(/bibliography|bibliográfia|forrásjegyzék/.test(value))return'bibliography';
  if(/chapter|fejezet|prol[oó]gus|epil[oó]gus/.test(value))return'chapter'; return heading?'section':'body';
};

export class KnowledgeIngestionEngine {
  static async fingerprint(value:string|Uint8Array):Promise<string>{const bytes=typeof value==='string'?new TextEncoder().encode(value):Uint8Array.from(value);const hash=await crypto.subtle.digest('SHA-256',bytes.buffer);return[...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
  static structure(documentId:string,originalText:string,translatedText?:string,translation?:TranslationProvenance):DocumentSegment[]{
    let original=detectStructure(originalText);let translated=translatedText?detectStructure(translatedText):[];
    if(original[0]?.startOffset>0)original=[{ordinal:0,level:1,heading:null,startOffset:0,endOffset:original[0].startOffset},...original];
    if(translated[0]?.startOffset>0)translated=[{ordinal:0,level:1,heading:null,startOffset:0,endOffset:translated[0].startOffset},...translated];
    return original.map((section,index)=>({segmentId:`segment:${documentId}:${index}`,parentSegmentId:null,order:index,title:section.heading,kind:segmentKind(section.heading,index),startOffset:section.startOffset,endOffset:section.endOffset,originalText:originalText.slice(section.startOffset,section.endOffset).trim(),...(translatedText?{translatedText:translated[index]?translatedText.slice(translated[index].startOffset,translated[index].endOffset).trim():translatedText,translation}: {})}));
  }
  static async createRecord(input:{universeId:string;fileName:string;mediaType:string;fileSize:number;title:string;originalText:string;translatedText?:string;language?:string;translation?:TranslationProvenance;visibility?:DocumentVisibility;previous?:DocumentRecord}):Promise<DocumentRecord>{
    const sha256=await this.fingerprint(input.originalText);const documentId=`document:${sha256}`;const base=slug(input.title);const identity=input.previous?{workId:input.previous.workId,instanceId:`instance:${base}:${sha256.slice(0,12)}`,itemId:`item:${base}:${sha256.slice(0,12)}`} : createWorkIdentity(base,detectCreativeWorkType(input.title,input.originalText,detectStructure(input.originalText).length));
    const creativeWorkType=detectCreativeWorkType(input.title,input.originalText,detectStructure(input.originalText).length);
    return{documentId,universeId:input.universeId,fileName:input.fileName,originalFileName:input.fileName,mediaType:input.mediaType,fileSize:input.fileSize,sha256,importedAtUtc:new Date().toISOString(),sourceId:`source:${sha256}`,...identity,creativeWorkType,language:input.language||'und',extractionStatus:'completed',visibility:input.visibility||'private',extractionVersion:'knowledge-sync-1',...(input.previous?{previousDocumentId:input.previous.documentId}:{}),derivedKnowledgeIds:[],segments:this.structure(documentId,input.originalText,input.translatedText,input.translation)};
  }
}

export class KnowledgeSyncEngine {
  static compare(previous:DocumentRecord|undefined,current:DocumentRecord,mode:ImportMode):ImportRun{
    const runId=`import:${current.documentId.split(':')[1].slice(0,16)}:${Date.now()}`;const old=previous?.segments||[];const changes:SegmentChange[]=[];const count=Math.max(old.length,current.segments.length);
    for(let index=0;index<count;index+=1){const before=old[index],after=current.segments[index];if(!before&&after)changes.push({kind:'added',segmentId:after.segmentId});else if(before&&!after)changes.push({kind:'removed',segmentId:before.segmentId});else if(before&&after)changes.push({kind:normalized(before.originalText)===normalized(after.originalText)?'unchanged':'changed',segmentId:after.segmentId,previousSegmentId:before.segmentId});}
    const created=changes.filter(change=>change.kind==='added').map(change=>change.segmentId);const updated=changes.filter(change=>change.kind==='changed').map(change=>change.segmentId);const removed=changes.filter(change=>change.kind==='removed').map(change=>change.segmentId);
    const changeSet:ImportChangeSet={changeSetId:`changeset:${runId}`,importRunId:runId,createdIds:created,updatedIds:updated,removedIds:removed,segmentChanges:changes,reversible:true};
    return{importRunId:runId,mode,documentId:current.documentId,...(previous?{previousDocumentId:previous.documentId}:{}),startedAtUtc:current.importedAtUtc,completedAtUtc:new Date().toISOString(),status:updated.length||removed.length?'review-required':'completed',changeSet};
  }
}

export class KnowledgePublishingEngine {
  static async markdown(input:{title:string;universeId:string;profile:ExportSnapshot['profile'];knowledgeSnapshotId:string;sections:Array<{title:string;content:string}>;articleIds?:string[];factIds?:string[];eventIds?:string[];sourceIds?:string[]}):Promise<{content:string;snapshot:ExportSnapshot}>{
    const exportId=`export:${slug(input.title)}:${Date.now()}`;const metadata={loreNexusExportId:exportId,universeId:input.universeId,snapshotId:input.knowledgeSnapshotId,schemaVersion:1};const body=`---\n${Object.entries(metadata).map(([key,value])=>`${key}: ${value}`).join('\n')}\n---\n\n# ${input.title}\n\n${input.sections.map(section=>`## ${section.title}\n\n${section.content}`).join('\n\n')}\n`;
    const sha256=await KnowledgeIngestionEngine.fingerprint(body);return{content:body,snapshot:{exportId,generatedAtUtc:new Date().toISOString(),knowledgeSnapshotId:input.knowledgeSnapshotId,universeId:input.universeId,schemaVersion:1,profile:input.profile,articleIds:input.articleIds||[],factIds:input.factIds||[],eventIds:input.eventIds||[],sourceIds:input.sourceIds||[],sha256}};
  }
  static detectReverseImport(text:string):{exportId:string;snapshotId:string;universeId:string}|null{const exportId=text.match(/^loreNexusExportId:\s*(.+)$/m)?.[1]?.trim();const snapshotId=text.match(/^snapshotId:\s*(.+)$/m)?.[1]?.trim();const universeId=text.match(/^universeId:\s*(.+)$/m)?.[1]?.trim();return exportId&&snapshotId&&universeId?{exportId,snapshotId,universeId}:null;}
}
