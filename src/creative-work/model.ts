export type CreativeWorkType = 'wikiArticle'|'article'|'newsArticle'|'blog'|'essay'|'research'|'interview'|'book'|'novel'|'bookSeries'|'volume'|'chapter'|'shortStory'|'novella'|'anthology'|'anthologyStory'|'sourcebook'|'encyclopedia'|'encyclopediaEntry'|'manual'|'strategyGuide'|'bestiary'|'codex'|'codexEntry'|'inGameBook'|'journalEntry'|'letter'|'note'|'scroll'|'prophecy'|'chronicle'|'tale'|'myth'|'poem'|'hymn'|'script'|'cinematicTranscript'|'dialogue'|'quest'|'questline'|'officialWebpage'|'patchLore'|'expansionStory'|'comic'|'graphicNovel'|'comicIssue'|'comicStory'|'manuscript';
export type WorkLayer = 'work'|'instance'|'item';
export interface CreativeWorkMetadata { id:string; type:CreativeWorkType; layer:WorkLayer; title:string; alternateTitles?:string[]; originalTitle?:string; subtitle?:string; authors?:string[]; editors?:string[]; translators?:string[]; publisher?:string; publicationDate?:string; language?:string; originalLanguage?:string; description?:string; content?:string; wordCount?:number; canonStatus?:string; sourcePriority?:string; copyright?:string; isbn?:string; doi?:string; url?:string; edition?:string; volume?:string; issue?:string; pages?:string; seriesId?:string; parentWorkId?:string; hasParts?:string[]; timelinePlacement?:string; sources?:string[]; }

export function detectCreativeWorkType(title:string,content:string,chapterCount=0):CreativeWorkType{
  const value=`${title}\n${content.slice(0,12000)}`.toLocaleLowerCase('hu');
  if(/antológia|anthology|történetgyűjtemény|short stor(?:y|ies) collection/.test(value))return'anthology';
  if(/novella|kisregény/.test(value))return'novella';
  if(/short story|rövid történet|novella/.test(value)&&chapterCount<=1)return'shortStory';
  if(/manual|kézikönyv/.test(value))return'manual';
  if(/sourcebook|lore book|háttérkönyv/.test(value))return'sourcebook';
  if(/comic|képregény/.test(value))return'comic';
  if(/interjú|interview/.test(value))return'interview';
  if(/developer blog|fejlesztői blog/.test(value))return'blog';
  if(/research|tanulmány/.test(value))return'research';
  if(chapterCount>0||/(^|\n)\s*(chapter|fejezet)\s+[\divxlcdm]+/im.test(value))return'novel';
  return'wikiArticle';
}

export function createWorkIdentity(baseId:string,type:CreativeWorkType){return{workId:`work:${baseId}`,instanceId:`instance:${baseId}:original`,itemId:`item:${baseId}:local`};}
