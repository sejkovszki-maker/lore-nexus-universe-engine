import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mode=process.argv[2];
const endpoint=(process.env.LORE_NEXUS_API_URL||'https://lambent-chaja-045017.netlify.app/api/knowledge-sync').replace(/\/$/,'');
const token=process.env.LORE_NEXUS_WORK_TOKEN;
const headers=token?{authorization:`Bearer ${token}`}:{ };
const cacheRoot=path.resolve('knowledge','central-cache');
const safeId=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9:.-]{0,199}$/i.test(value);
async function atomicJson(file,value){await mkdir(path.dirname(file),{recursive:true});const temporary=`${file}.${process.pid}.tmp`;await writeFile(temporary,JSON.stringify(value,null,2),'utf8');await rename(temporary,file);}
async function request(url,options={}){const response=await fetch(url,{...options,headers:{...headers,...options.headers}});if(!response.ok)throw new Error(`Central Knowledge API ${response.status}: ${await response.text()}`);return response.json();}

if(mode==='pull'){
  const index=await request(`${endpoint}?scope=index`);if(index?.schemaVersion!==1||!Array.isArray(index.documents))throw new Error('INVALID_CENTRAL_INDEX');
  await atomicJson(path.join(cacheRoot,'index.json'),index);
  let downloaded=0;
  if(token)for(const item of index.documents){if(!safeId(item.documentId))throw new Error('UNSAFE_DOCUMENT_ID');const document=await request(`${endpoint}?documentId=${encodeURIComponent(item.documentId)}`);await atomicJson(path.join(cacheRoot,'documents',`${item.sha256}.json`),document);downloaded+=1;}
  console.log(JSON.stringify({status:'ok',revision:index.revision,documents:index.documents.length,downloaded,cacheRoot}));
}else if(mode==='push'){
  if(!token)throw new Error('LORE_NEXUS_WORK_TOKEN is required for push');const input=process.argv[3];if(!input)throw new Error('Usage: npm run knowledge:push -- <changeset.json>');
  const envelope=JSON.parse(await readFile(path.resolve(input),'utf8'));const result=await request(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(envelope)});console.log(JSON.stringify(result));
}else throw new Error('Usage: central-knowledge-cli.mjs pull|push [file]');
