import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';

const STORE='lore-nexus-central-knowledge';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const safeId=(value:unknown)=>typeof value==='string'&&/^[a-z0-9][a-z0-9:.-]{0,199}$/i.test(value);

function validateEnvelope(value:unknown):value is {schemaVersion:1;document:{documentId:string;universeId:string;sha256:string;workId:string;segments:unknown[];visibility:string};importRun:{importRunId:string;documentId:string;changeSet:{reversible:true}};articles:unknown[]}{
  if(!value||typeof value!=='object')return false;const item=value as Record<string,any>;
  return item.schemaVersion===1&&safeId(item.document?.documentId)&&safeId(item.document?.universeId)&&/^[a-f0-9]{64}$/.test(item.document?.sha256||'')&&safeId(item.document?.workId)&&Array.isArray(item.document?.segments)&&item.document.segments.length<=5000&&safeId(item.importRun?.importRunId)&&item.importRun?.documentId===item.document.documentId&&item.importRun?.changeSet?.reversible===true&&Array.isArray(item.articles)&&item.articles.length<=5000;
}
async function authorized(req:Request):Promise<boolean>{
  const workToken=process.env.LORE_NEXUS_WORK_TOKEN;const supplied=req.headers.get('authorization');
  if(workToken&&supplied===`Bearer ${workToken}`)return true;
  const user=await getUser();return Boolean(user?.roles.includes('admin'));
}

export default async(req:Request)=>{
  const store=getStore({name:STORE,consistency:'strong'});const url=new URL(req.url);
  if(req.method==='GET'&&url.searchParams.get('scope')==='index')return json((await store.get('public-index',{type:'json',consistency:'strong'}))||{schemaVersion:1,revision:null,documents:[]});
  if(!(await authorized(req)))return json({error:'UNAUTHORIZED'},401);
  if(req.method==='GET'){
    const documentId=url.searchParams.get('documentId');if(!safeId(documentId))return json({error:'INVALID_DOCUMENT_ID'},400);
    const value=await store.get(`document/${documentId}`,{type:'json',consistency:'strong'});return value?json(value):json({error:'NOT_FOUND'},404);
  }
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const length=Number(req.headers.get('content-length')||0);if(length>4_500_000)return json({error:'PAYLOAD_TOO_LARGE'},413);
  let envelope:unknown;try{envelope=await req.json();}catch{return json({error:'INVALID_JSON'},400);}if(!validateEnvelope(envelope))return json({error:'INVALID_ENVELOPE'},422);
  const revision=crypto.randomUUID();const stored={...envelope,centralRevision:revision,storedAtUtc:new Date().toISOString()};
  await store.setJSON(`document/${envelope.document.documentId}`,stored,{metadata:{workId:envelope.document.workId,universeId:envelope.document.universeId,revision}});
  await store.setJSON(`changeset/${envelope.importRun.importRunId}`,envelope.importRun);
  const current=((await store.get('public-index',{type:'json',consistency:'strong'}))||{schemaVersion:1,revision:null,documents:[]}) as {schemaVersion:1;revision:string|null;documents:Array<Record<string,unknown>>};
  const metadata={documentId:envelope.document.documentId,universeId:envelope.document.universeId,workId:envelope.document.workId,sha256:envelope.document.sha256,visibility:envelope.document.visibility,revision};
  current.documents=[...current.documents.filter(item=>item.documentId!==envelope.document.documentId),metadata];current.revision=revision;await store.setJSON('public-index',current);
  return json({status:'synced',revision},201);
};

export const config:Config={path:'/api/knowledge-sync'};
