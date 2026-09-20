import type { WikiArticle } from '../types.ts';
import type { TimelineEvent } from '../timeline/types.ts';

export type SearchKind='article'|'book'|'chapter'|'event';
export interface PublicSearchDocument {id:string;kind:SearchKind;title:string;subtitle:string;category:string;text:string;universeId:string;articleId?:string;fields:Record<string,string>}
export interface PublicSearchResult {document:PublicSearchDocument;score:number;matchedFields:string[];snippet:string}

const clean=(value:unknown)=>String(value??'').replace(/<[^>]*>/gu,' ').replace(/\s+/gu,' ').trim();
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLocaleLowerCase('hu-HU');

export function buildPublicSearchDocuments(articles:Record<string,WikiArticle>,events:TimelineEvent[]=[]):PublicSearchDocument[]{
  const docs:PublicSearchDocument[]=Object.values(articles).map(article=>({id:article.id,kind:(article.type==='book'||article.type==='chapter'?article.type:'article') as SearchKind,title:article.title,subtitle:article.subtitle??'',category:article.category,text:clean(article.content),universeId:article.universeId||'diablo',articleId:article.id,fields:{title:article.title,subtitle:article.subtitle??'',category:article.category,infobox:Object.entries(article.infobox??{}).map(([k,v])=>`${k} ${v}`).join(' '),relations:(article.relatedArticles??[]).join(' '),content:clean(article.content)}}));
  for(const event of events)docs.push({id:event.id,kind:'event',title:event.title,subtitle:event.dateDisplay,category:event.eraName,text:event.summary,universeId:event.universeId,...(event.articleId?{articleId:event.articleId}:{}),fields:{title:event.title,subtitle:event.dateDisplay,category:event.eraName,content:event.summary,entities:[...event.characters,...event.locations,...event.factions,...event.items,...event.games,...event.books].join(' ')}});
  return docs;
}

export function searchPublicDocuments(documents:PublicSearchDocument[],query:string,universeId:string,kind:'all'|SearchKind='all',category='all'):PublicSearchResult[]{
  const terms=normalize(query).split(/\s+/u).filter(term=>term.length>=2).slice(0,12);if(!terms.length)return[];
  const weights:Record<string,number>={title:12,subtitle:7,category:5,infobox:4,entities:4,relations:3,content:1};
  return documents.filter(doc=>doc.universeId===universeId&&(kind==='all'||doc.kind===kind)&&(category==='all'||doc.category===category)).map(document=>{
    let score=0;const matchedFields:string[]=[];
    const searchable=normalize(Object.values(document.fields).join(' '));
    if(!terms.every(term=>searchable.includes(term)))return{document,score,matchedFields,snippet:''};
    for(const [field,value] of Object.entries(document.fields)){const normalized=normalize(value);const hits=terms.filter(term=>normalized.includes(term));if(hits.length){score+=(weights[field]??1)*hits.length;matchedFields.push(field);}}
    const first=terms.map(term=>normalize(document.text).indexOf(term)).filter(pos=>pos>=0).sort((a,b)=>a-b)[0]??0;
    return{document,score,matchedFields,snippet:document.text.slice(Math.max(0,first-70),first+190)};
  }).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||a.document.title.localeCompare(b.document.title,'hu-HU')).slice(0,100);
}

function distance(a:string,b:string){const x=[...normalize(a)],y=[...normalize(b)],row=Array.from({length:y.length+1},(_,i)=>i);for(let i=1;i<=x.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=y.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(x[i-1]===y[j-1]?0:1));prev=old;}}return row[y.length];}
export function searchSuggestion(documents:PublicSearchDocument[],query:string,universeId:string){const q=query.trim();if(q.length<3)return undefined;return documents.filter(doc=>doc.universeId===universeId).map(doc=>({title:doc.title,distance:distance(q,doc.title)})).filter(item=>item.distance<=Math.max(2,Math.floor(q.length*.35))).sort((a,b)=>a.distance-b.distance||a.title.localeCompare(b.title,'hu-HU'))[0]?.title;}
