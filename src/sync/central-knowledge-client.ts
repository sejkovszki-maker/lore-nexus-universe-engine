import type { DocumentRecord, ImportRun } from './knowledge-sync.ts';
import type { WikiArticle } from '../types.ts';

export interface CentralSyncEnvelope {schemaVersion:1;document:DocumentRecord;importRun:ImportRun;articles:WikiArticle[]}
export interface CentralSyncResult {status:'synced'|'local-only';revision?:string;reason?:string}

export async function pushCentralKnowledge(envelope:CentralSyncEnvelope):Promise<CentralSyncResult>{
  const configured=(import.meta.env.VITE_KNOWLEDGE_API_URL as string|undefined)?.trim();
  const endpoint=configured||(`${location.origin}/api/knowledge-sync`);
  if(!configured&&!location.hostname.endsWith('.netlify.app'))return{status:'local-only',reason:'A központi API csak a hitelesített Netlify kiadáson érhető el.'};
  try{
    const response=await fetch(endpoint,{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify(envelope)});
    if(response.status===401||response.status===403)return{status:'local-only',reason:'Tulajdonosi bejelentkezés szükséges a központi mentéshez.'};
    if(!response.ok)return{status:'local-only',reason:`A központi API ${response.status} hibát adott.`};
    const result=await response.json() as {revision:string};return{status:'synced',revision:result.revision};
  }catch(error){return{status:'local-only',reason:error instanceof Error?error.message:'A központi API nem érhető el.'};}
}
