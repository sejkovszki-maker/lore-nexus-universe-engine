import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAppStore } from '../store/appState.ts';
import { diabloTimelineEras } from '../data/diabloChronology.ts';
import { verifiedTimeline } from '../research/timeline-audit.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import { articleUniverseId } from '../universe/article-universes.ts';
import { sortTimelineEvents, type TimelineEvent } from '../timeline/types.ts';

@customElement('diablo-timeline')
export class DiabloTimeline extends LitElement {
  @state() private activeEra=''; @state() private query=''; @state() private character='';
  @state() private location=''; @state() private game=''; @state() private showSpoilers=false;
  @state() private activeUniverseId=useAppStore.getState().activeUniverseId; @state() private activeEventId=useAppStore.getState().activeArticleId;
  private unsubscribe?:()=>void;
  createRenderRoot(){return this;}
  connectedCallback(){super.connectedCallback();this.unsubscribe=useAppStore.subscribe(s=>{this.activeUniverseId=s.activeUniverseId;this.activeEventId=s.activeArticleId;});}
  protected firstUpdated(){if(this.activeEventId)requestAnimationFrame(()=>this.querySelector(`#timeline-${CSS.escape(this.activeEventId!)}`)?.scrollIntoView({block:'center'}));}
  disconnectedCallback(){this.unsubscribe?.();super.disconnectedCallback();}

  private get events():TimelineEvent[]{
    if(this.activeUniverseId==='diablo')return sortTimelineEvents(verifiedTimeline);
    return Object.values(wikiArticles).filter(a=>articleUniverseId(a)===this.activeUniverseId&&a.type!=='chapter'&&a.type!=='book').sort((a,b)=>(a.lastEdited||0)-(b.lastEdited||0)||a.title.localeCompare(b.title,'hu')).map((a,i)=>({id:`${this.activeUniverseId}-event-${i+1}`,universeId:'diablo',eraId:'story',eraName:'Történeti sorrend',eraOrder:1,eventOrder:i+1,title:a.title,summary:a.subtitle||'',dateDisplay:'',dateStatus:'unknown',canonStatus:'canon_with_uncertainty',sourcePriority:'secondary_reference',retconned:false,characters:[],locations:[],factions:[],items:[],games:[],books:[],relatedEvents:[],articleId:a.id,sources:[],needsSourceAudit:true,spoilerLevel:0}));
  }
  private values(field:'characters'|'locations'|'games'){return [...new Set(this.events.flatMap(e=>e[field]))].sort((a,b)=>a.localeCompare(b,'hu'));}
  private visible(e:TimelineEvent){const h=[e.title,e.summary,e.eraName,...e.characters,...e.locations,...e.factions,...e.games,...e.books].join(' ').toLocaleLowerCase('hu');return(!this.activeEra||e.eraId===this.activeEra)&&(!this.query.trim()||h.includes(this.query.trim().toLocaleLowerCase('hu')))&&(!this.character||e.characters.includes(this.character))&&(!this.location||e.locations.includes(this.location))&&(!this.game||e.games.includes(this.game))&&(this.showSpoilers||e.spoilerLevel===0);}
  private confidence(e:TimelineEvent){if(e.canonStatus==='disputed'||e.canonStatus==='retconned')return'Vitatott';if(e.dateStatus==='approximate'||e.canonStatus==='canon_with_uncertainty')return'Közelítő';if(e.dateStatus==='unknown')return'Ismeretlen dátum';return'Biztos';}
  private select(label:string,value:string,values:string[],set:(v:string)=>void){return html`<select aria-label=${label} class="bg-[#111] border border-gold/30 rounded p-2" .value=${value} @change=${(x:Event)=>set((x.target as HTMLSelectElement).value)}><option value="">Minden ${label.toLocaleLowerCase('hu')}</option>${values.map(v=>html`<option value=${v}>${v}</option>`)}</select>`;}

  render(){const events=this.events.filter(e=>this.visible(e));const eras=this.activeUniverseId==='diablo'?diabloTimelineEras:[{id:'story',name:'Történeti sorrend',order:1}];return html`
    <section class="w-full max-w-6xl mx-auto" aria-labelledby="timeline-title">
      <h1 id="timeline-title" class="font-heading text-3xl text-gold text-center mb-2">Kronológia</h1><p class="text-center text-parchment/70 mb-6">${events.length} esemény · stabil korszak- és eseménysorrendben.</p>
      <div class="sticky top-0 z-10 bg-[#1a1819] border border-gold/20 rounded-xl p-4 mb-6 shadow-lg" aria-label="Idővonal szűrői">
        <label class="block mb-3"><span class="sr-only">Keresés az eseményekben</span><input class="w-full bg-black/30 border border-gold/30 rounded p-3 text-white" type="search" placeholder="Esemény, szereplő, helyszín keresése…" .value=${this.query} @input=${(x:InputEvent)=>this.query=(x.target as HTMLInputElement).value}></label>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3"><select aria-label="Korszak" class="bg-[#111] border border-gold/30 rounded p-2" @change=${(x:Event)=>this.activeEra=(x.target as HTMLSelectElement).value}><option value="">Minden korszak</option>${eras.map(e=>html`<option value=${e.id}>${String(e.order).padStart(2,'0')}. ${e.name}</option>`)}</select>${this.select('Szereplő',this.character,this.values('characters'),v=>this.character=v)}${this.select('Helyszín',this.location,this.values('locations'),v=>this.location=v)}${this.select('Játék',this.game,this.values('games'),v=>this.game=v)}</div>
        <label class="inline-flex items-center gap-2 mt-3"><input type="checkbox" .checked=${this.showSpoilers} @change=${(x:Event)=>this.showSpoilers=(x.target as HTMLInputElement).checked}> Diablo IV és újabb történeti spoilerek megjelenítése</label>
      </div>
      ${events.length===0?html`<p role="status" class="text-center p-8 border border-gold/20 rounded">Nincs a szűrésnek megfelelő esemény.</p>`:eras.map(era=>{const eraEvents=events.filter(e=>e.eraId===era.id);if(!eraEvents.length)return'';return html`<details class="mb-5 border border-gold/20 rounded-xl bg-[#151314]" open><summary class="cursor-pointer p-4 font-heading text-xl text-gold focus:outline-none focus:ring-2 focus:ring-gold rounded-xl">${String(era.order).padStart(2,'0')}. ${era.name} <span class="text-sm text-parchment/60">(${eraEvents.length})</span></summary><ol class="relative border-l-2 border-blood-red/40 ml-6 md:ml-10 mr-3 pb-5 space-y-5">${eraEvents.map(e=>html`<li id=${`timeline-${e.id}`} class="relative pl-6 md:pl-9"><span aria-hidden="true" class="absolute -left-[9px] top-6 w-4 h-4 bg-[#0a0809] border-2 border-blood-red rounded-full"></span><article class="bg-[#1a1819] border border-gold/15 rounded-xl p-4 md:p-5"><div class="flex flex-col md:flex-row md:justify-between gap-2"><h2 class="font-heading text-xl text-gold">${String(e.eventOrder).padStart(3,'0')}. ${e.title}</h2><span class="text-xs uppercase tracking-wide text-parchment/60">${e.dateDisplay||'Relatív sorrend'}</span></div><div class="flex flex-wrap gap-2 mt-3 text-xs"><span class="border border-gold/30 rounded px-2 py-1">${this.confidence(e)}</span><span class="border border-gold/30 rounded px-2 py-1">${e.sourcePriority==='primary_blizzard'?'Blizzard-forrás':'Forrásaudit szükséges'}</span>${e.games.map(v=>html`<span class="border border-white/15 rounded px-2 py-1">${v}</span>`)}</div>${e.articleId&&wikiArticles[e.articleId]?html`<button class="mt-4 text-gold underline underline-offset-4" @click=${()=>useAppStore.openArticleRoute(e.articleId!)}>Kapcsolódó wiki-cikk megnyitása →</button>`:''}${e.sources.filter(s=>s.url).map(s=>html`<a class="mt-3 block text-sm text-gold underline" href=${s.url!} target="_blank" rel="noopener noreferrer">Forrás: ${s.label}</a>`)}</article></li>`)}</ol></details>`;})}
    </section>`;}
}
