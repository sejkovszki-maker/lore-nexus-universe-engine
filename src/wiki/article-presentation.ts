import type { WikiArticle } from '../types.ts';

export interface ArticleHeading { id: string; label: string; level: 2 | 3 }

const plain = (value: string) => value.replace(/<[^>]+>/gu, '').replace(/&[a-z]+;/giu, ' ').replace(/\s+/gu, ' ').trim();
const slug = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase('hu-HU').replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 70) || 'szakasz';

export function addStableHeadingIds(html: string): { html: string; headings: ArticleHeading[] } {
  const headings: ArticleHeading[] = []; const used = new Map<string, number>();
  const output = html.replace(/<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/giu, (_match, rawLevel:string, body:string) => {
    const label=plain(body); const base=slug(label); const count=(used.get(base)??0)+1; used.set(base,count);
    const id=count===1?base:`${base}-${count}`; const level=Number(rawLevel) as 2|3;
    headings.push({id,label,level}); return `<h${level} id="${id}">${body}</h${level}>`;
  });
  return {html:output,headings};
}

export interface ArticleQualitySummary { score: number; label: 'Erős'|'Közepes'|'Bővítendő'; checks: string[] }

export function articleQualitySummary(article: WikiArticle, relatedCount: number, backlinkCount: number): ArticleQualitySummary {
  const text=plain(article.content); const checks:string[]=[]; let score=0;
  if(text.length>=1200){score+=35;checks.push('részletes tartalom');}else if(text.length>=400){score+=20;checks.push('alaptartalom');}
  if(article.infobox&&Object.keys(article.infobox).length>=2){score+=20;checks.push('adatlap');}
  if(relatedCount>0){score+=15;checks.push('kapcsolódó lapok');}
  if(backlinkCount>0){score+=10;checks.push('belső hivatkozások');}
  if(/forrás|bibliográfia|hivatkozás/iu.test(text)){score+=20;checks.push('forrásjelzés');}
  score=Math.min(100,score); return {score,label:score>=75?'Erős':score>=45?'Közepes':'Bővítendő',checks};
}
