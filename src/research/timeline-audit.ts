import{diabloTimelineEvents}from'../data/diabloChronology.ts';import type{TimelineEvent,TimelineSource}from'../timeline/types.ts';import{sourceRegistry}from'./registry.ts';
const rules=[
 {from:1,to:26,sourceId:'src-blizzard-d2-story-so-far'},
 {from:88,to:103,sourceId:'src-blizzard-d2-story-so-far'},
 {from:123,to:127,sourceId:'src-blizzard-immortal-overview'},
 {from:128,to:128,sourceId:'src-blizzard-immortal-story-so-far'},
 {from:170,to:175,sourceId:'src-blizzard-voh'},
 {from:179,to:183,sourceId:'src-blizzard-loh'}
];
export const verifiedTimeline:TimelineEvent[]=diabloTimelineEvents.map(event=>{const rule=rules.find(r=>event.eventOrder>=r.from&&event.eventOrder<=r.to);if(!rule)return event;const source=sourceRegistry.find(s=>s.sourceId===rule.sourceId)!;const citation:TimelineSource={sourceId:source.sourceId,label:source.title,url:source.canonicalUrl,kind:source.sourcePriority==='S1'?'primary_blizzard':'secondary_reference'};return{...event,sources:[citation],sourcePriority:citation.kind==='primary_blizzard'?'primary_blizzard':event.sourcePriority,needsSourceAudit:false};});
const primaryAudited=verifiedTimeline.filter(e=>e.sources.some(source=>source.sourceId)).length;
export const timelineAuditReport={eventCount:verifiedTimeline.length,primaryAudited,sourceRequired:verifiedTimeline.length-primaryAudited,conflicts:[] as string[],unplacedEvents:['All Who Lie — Belial visszatérése hivatalos, de a fő kronológia pontos pontja szerkesztői ellenőrzésre vár.','A Light Extinguished — Neyrelle halála hivatalos Lord of Hatred-spoiler; csak a kampány belső sorrendjének további ellenőrzése után illeszthető a fő idővonalba.','Dawn of Hatred — a Vessel of Hatred utáni relatív helyzet igazolt, de az Akarat személyazonosságára vonatkozó történeten belüli bizonytalanság miatt nem képez automatikus történelmi eseményt.','Demonsbane / Blackmarch — a történeti kapcsolat két bibliográfiai összefoglalóval igazolt, de játékbeli vagy Blizzard-primary időpont nélkül nem kap abszolút dátumot.','Morbed — a licencelt történet helyszíne kiadói forrásból igazolt, de a fő kronológia pontos pontja nem.'],gaps:['A forrásaudit eseményszintű folytatása szükséges; a stabil relatív sorrend közben változatlan.'],releaseStatus:'CONDITIONAL_PASS' as const};
