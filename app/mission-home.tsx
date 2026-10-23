"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import type {Project,Work,Section} from "./hub-data";
import {useJobs} from "./evidence-panels";
import {usePins} from "./project-preferences";
import {External} from "./hub-ui";
import {projectPath} from "./route-paths";

type State="owner"|"proof"|"draft"|"verified"|"active";
type Filter="all"|State;
type Panel="inspector"|"decisions"|"blocked"|"memory";
type RecordItem={
 id:string;title:string;project:string;slug:string;state:State;
 source:string;proof?:string;updatedAt?:string;summary:string;next:string;
 missing:string[];agent?:string;kind:string;
};
const color:Record<State,string>={owner:"violet",proof:"amber",draft:"amber",verified:"teal",active:"slate"};
const label:Record<State,string>={owner:"NEEDS YOU",proof:"MISSING PROOF",draft:"DRAFT · NOT DONE",verified:"VERIFIED",active:"OPEN WORK"};
const tabs:{key:Panel;label:string}[]=[{key:"inspector",label:"Inspector"},{key:"decisions",label:"Needs You"},{key:"blocked",label:"Blocked"},{key:"memory",label:"Memory"}];
const fmt=(input?:string)=>{if(!input)return "Not reported";const d=new Date(input);return Number.isFinite(d.getTime())?d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Not reported"};
const alertText=(n:number|undefined)=>n===1?"1 missing item":(n||0)+" missing items";
function fromWork(p:Project,w:Work):RecordItem{
 const draft=w.kind==="pr"&&Boolean(w.draft);
 return {id:p.slug+"/"+w.kind+"/"+w.number,title:w.title,project:p.name,slug:p.slug,
 state:draft?"draft":"active",source:w.url,updatedAt:w.updatedAt,kind:w.kind==="pr"?"Pull request":"Issue",missing:[],
 summary:draft?"A code change is proposed, but its pull request remains a draft. A draft is not a finished delivery.":w.kind==="pr"?"A code change is open for review. Its successful release has not been verified.":"An open issue remains in the project work queue.",
 next:draft?"Have the coding agent finish and test the draft, then attach proof.":"Open the GitHub record to review the latest evidenced work."};
}
export default function MissionHome({projects,busy}:{projects:Project[];busy:boolean;onOpen:(s:string)=>void;onSection:(s:Section)=>void}){
 const jobs=useJobs();
 const pins=usePins();
 const [filter,setFilter]=useState<Filter>("all");
 const [query,setQuery]=useState("");
 const [scope,setScope]=useState("all");
 const [panel,setPanel]=useState<Panel>("inspector");
 const [selected,setSelected]=useState("");
 const [copied,setCopied]=useState<"yes"|"error"|"">("");
 const [mobileInspect,setMobileInspect]=useState(false);
 const available=projects.filter(p=>p.accessible&&!p.stale&&!p.limited&&p.prs!==null&&p.issues!==null&&p.drafts!==null);
 const fullyLoaded=!busy&&projects.length>0&&available.length===projects.length;
 const dataValid=!jobs.loading&&!jobs.error&&!jobs.stale;
 const all=useMemo(()=>{
  const work=projects.flatMap(p=>p.items.map(w=>fromWork(p,w)));
  const reports:RecordItem[]=(jobs.jobs||[]).map(j=>({
    id:"job/"+j.id,title:j.title,project:"La Cartilla de Gretel",slug:"cartilla-de-gretel",
    state:j.status==="VERIFIED"?(j.missingEvidence?.length?"proof":"verified"):"proof",
    source:j.sourceUrl,proof:j.proofUrl,updatedAt:j.updatedAt,kind:"Agent job report",
    missing:j.missingEvidence||[],summary:j.status==="VERIFIED"?"The source reports verified work; review linked acceptance evidence.":"Reported work is not verified as delivered.",
    next:j.missingEvidence?.length?"Ask the assigned agent for the missing evidence.":"Review the canonical job and require acceptance proof before approval."}));
  const approvals:RecordItem[]=(jobs.approvals||[]).map(a=>({
    id:"approval/"+a.id,title:a.title,project:a.project,slug:"",
    state:"owner",source:a.sourceUrl,proof:a.proofUrl,updatedAt:a.updatedAt,
    kind:"Owner approval",missing:[],summary:"A source-qualified owner decision is awaiting review.",
    next:"Inspect the visual proof and decision context before granting approval."}));
  const priority:Record<State,number>={owner:5,proof:4,draft:3,active:2,verified:1};
  return [...approvals,...reports,...work].sort((a,b)=>priority[b.state]-priority[a.state]||String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
 },[projects,jobs.jobs,jobs.approvals]);
 const visible=all.filter(item=>(filter==="all"||item.state===filter)&&(scope==="all"||item.slug===scope)&&[item.title,item.project,item.kind,item.id].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
 const selectedItem=all.find(x=>x.id===selected)||visible[0]||null;
 const blocked=all.filter(x=>x.state==="proof");
 const decisions=all.filter(x=>x.state==="owner");
 const drafts=fullyLoaded?projects.reduce((sum,p)=>sum+(p.drafts||0),0):null;
 const issues=fullyLoaded?projects.reduce((sum,p)=>sum+(p.issues||0),0):null;
 const pinned=projects.filter(p=>pins.value.includes(p.slug));
 const tiles=[
  {key:"owner" as Filter,name:"NEEDS YOUR DECISION",value:dataValid?decisions.length:null,desc:"Proof-qualified approvals",tone:"violet"},
  {key:"proof" as Filter,name:"BLOCKED / MISSING PROOF",value:dataValid?blocked.length:null,desc:"Unverified Cartilla jobs",tone:"amber"},
  {key:"draft" as Filter,name:"DRAFT PRs · NOT DONE",value:drafts,desc:"Across accessible repositories",tone:"amber"},
  {key:"verified" as Filter,name:"VERIFIED JOB REPORTS",value:dataValid?jobs.jobs.filter(j=>j.status==="VERIFIED"&&!j.missingEvidence?.length).length:null,desc:"Canonical job evidence only",tone:"teal"}
 ];
 function choose(f:Filter){setFilter(f);setPanel("inspector");document.getElementById("mission-work")?.scrollIntoView({block:"nearest",behavior:"smooth"});}
 async function copyPrompt(item:RecordItem){
  const prompt=["Review and complete this AI software development task using the project's AGENTS.md and applicable findings.md.","Project: "+item.project,"Task: "+item.title,"Canonical source: "+item.source,"Current state: "+label[item.state],"Observed: "+item.summary,"Required next action: "+item.next,...item.missing.map(s=>"Missing evidence: "+s),"Do not call it complete without actual tests, proof links, screenshots where visual, and a clear READY TO PUSH assessment."].join("\n");
  try{await navigator.clipboard.writeText(prompt);setCopied("yes")}catch{setCopied("error")}
 }
 return <div className="mission-home" data-visual-reference="uploaded-nbo-three-zone-cockpit">
  <div className="mission-center">
   <header className="mission-heading">
    <div><p className="mission-eyebrow"><span className="mission-pulse"/> NBO / SOFTWARE OPERATIONS</p>
    <h1>AI Development <span>Mission Control</span></h1>
    <p className="mission-description">Your projects, AI work, decisions and evidence. One operational view—not another coding terminal.</p></div>
    <div className="mission-fresh"><span className="mission-datalight"/><span>{busy?"Checking GitHub…":fullyLoaded?"GITHUB LIVE":"PARTIAL GITHUB DATA"}</span><small>{available.length} of {projects.length} complete · {fmt(jobs.fetchedAt)}</small></div>
   </header>
   <div className="mission-metrics" aria-label="Actionable delivery statistics">
    {tiles.map(t=><button key={t.key} type="button" className={"mission-metric mission-tone-"+t.tone+(filter===t.key?" chosen":"")} onClick={()=>choose(t.key)} aria-pressed={filter===t.key}>
     <span>{t.name}</span><strong>{t.value===null?"—":t.value}</strong><small>{t.value===null?"Source incomplete":t.desc}</small>
    </button>)}
   </div>
   <section className="mission-panel mission-work" id="mission-work">
    <div className="mission-panel-head">
      <div><p className="mission-eyebrow">01 / OPERATIONS QUEUE</p><h2>What still needs work</h2><p>Select a task to inspect what happened and what to do next.</p></div>
      <span className="mission-panel-count">{dataValid&&fullyLoaded?all.length+" source records":"Partial source"}</span>
    </div>
    <div className="mission-filterbar" role="group" aria-label="Filter work queue">
     {([{key:"all",name:"All work"},{key:"owner",name:"Needs You"},{key:"proof",name:"Missing proof"},{key:"draft",name:"Draft PRs"},{key:"verified",name:"Verified"}] as {key:Filter;name:string}[]).map(f=><button key={f.key} type="button" onClick={()=>setFilter(f.key)} aria-pressed={filter===f.key} className={filter===f.key?"active":""}>{f.name}</button>)}
    </div>
    <div className="mission-worktools">
      <label className="mission-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a project, PR or task" aria-label="Find a project, pull request or task"/></label>
      <select value={scope} onChange={e=>setScope(e.target.value)} aria-label="Filter by repository"><option value="all">All repositories</option>{projects.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
    </div>
    <div className="mission-tablehead"><span>WORK ITEM</span><span>PROJECT</span><span>STATE</span><span>UPDATED</span></div>
    <div className="mission-tasklist">
      {visible.slice(0,40).map(item=><button key={item.id} type="button" className={"mission-task"+(selectedItem?.id===item.id?" selected":"")} onClick={()=>{setSelected(item.id);setPanel("inspector");setCopied("");setMobileInspect(true)}} aria-pressed={selectedItem?.id===item.id}>
       <span className="mission-task-title"><b>{item.title}</b><small>{item.kind} · {item.id}</small></span>
       <span className="mission-task-project">{item.project}</span>
       <span className={"mission-status mission-tone-"+color[item.state]}>{label[item.state]}</span>
       <span className="mission-task-time">{fmt(item.updatedAt)}</span>
      </button>)}
      {!visible.length&&<p className="mission-empty">{busy||jobs.loading?"Loading source records…":"No records match these filters."}</p>}
    </div>
    {visible.length>40&&<p className="mission-footnote">Showing first 40 matching entries. Use search or project filters to narrow the queue.</p>}
    <div className="mission-panel-bottom"><span>Open PRs and draft changes are not completed releases.</span><Link href="/github">Explore GitHub Intelligence ↗</Link></div>
   </section>
   <div className="mission-lower">
    <section className="mission-panel mission-projects"><div className="mission-panel-head"><div><p className="mission-eyebrow">02 / ACTIVE REPOSITORIES</p><h2>Your projects</h2></div><Link href="/projects">View all ↗</Link></div>
     <div className="mission-project-grid">{(pinned.length?pinned:projects).slice(0,4).map(p=><Link href={projectPath(p.slug)} key={p.slug} className="mission-project"><span className="mission-repo-icon">▣</span><strong>{p.name}</strong><small>{p.stale||p.limited?"Partial source":p.issues===null?"Unavailable":p.issues+" issues · "+(p.prs??"—")+" PRs"}</small><span>OPEN PROJECT →</span></Link>)}</div>
     {!projects.length&&<p className="mission-empty">Loading GitHub projects…</p>}
    </section>
    <section className="mission-panel mission-history"><div className="mission-panel-head"><div><p className="mission-eyebrow">03 / RECENT CHANGES</p><h2>Updated work</h2></div></div>
     {all.filter(i=>i.kind==="Pull request"||i.kind==="Issue").sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,4).map(x=><article key={x.id}><span className="mission-history-dot"/><div><External href={x.source}>{x.title}</External><p>{x.project} · {fmt(x.updatedAt)}</p></div></article>)}
     <Link href="/github" className="mission-history-link">View GitHub activity →</Link>
    </section>
   </div>
  </div>
  {mobileInspect&&<button type="button" className="mission-rail-shade" aria-label="Close inspector" onClick={()=>setMobileInspect(false)}/>}
  <aside className={"mission-inspector"+(mobileInspect?" mission-inspector-open":"")} aria-label="Intelligence and task inspector">
    <button className="mission-rail-close" type="button" onClick={()=>setMobileInspect(false)} aria-label="Close task inspector">×</button>
    <div className="mission-inspector-tabs" role="group" aria-label="Inspector sections">
      {tabs.map(t=><button type="button" key={t.key} onClick={()=>{setPanel(t.key);setCopied("")}} aria-pressed={panel===t.key}>{t.label}</button>)}
    </div>
    {panel==="inspector"&&<div className="mission-inspector-content">
      <p className="mission-eyebrow">TASK INSPECTOR / LIVE EVIDENCE</p>
      {selectedItem?<><div className={"mission-status mission-tone-"+color[selectedItem.state]}>{label[selectedItem.state]}</div>
       <h2>{selectedItem.title}</h2><p className="mission-inspector-meta">{selectedItem.project} · {selectedItem.kind}</p>
       <div className="mission-inspector-block"><h3>WHAT WE KNOW</h3><p>{selectedItem.summary}</p></div>
       <div className="mission-inspector-block"><h3>NEXT ACTION</h3><p>{selectedItem.next}</p></div>
       {selectedItem.missing.length>0&&<div className="mission-inspector-block mission-missing"><h3>MISSING PROOF · {alertText(selectedItem.missing.length)}</h3>{selectedItem.missing.map(m=><p key={m}>• {m}</p>)}</div>}
       <div className="mission-inspector-actions"><External href={selectedItem.source}>Open source ↗</External>{selectedItem.proof&&<External href={selectedItem.proof}>View proof ↗</External>}
        <button type="button" onClick={()=>void copyPrompt(selectedItem)}>{copied==="yes"?"✓ Handoff copied":copied==="error"?"Copy unavailable":"Copy corrective AI handoff"}</button></div>
       <p className="mission-inspector-note">Source evidence only. No merge, deployment or AI task is launched by this panel.</p>
      </>:<p className="mission-empty">Choose a work item to inspect verified source records.</p>}
    </div>}
    {panel==="decisions"&&<div className="mission-inspector-content"><p className="mission-eyebrow">OWNER CHECKPOINT</p><h2>Needs your decision</h2>{!dataValid?<p className="mission-empty">Approval source unavailable or refreshing.</p>:decisions.length?decisions.map(d=><button key={d.id} className="mission-minirow" onClick={()=>{setSelected(d.id);setPanel("inspector");setMobileInspect(true)}}>{d.title}<small>{d.project} · Review proof</small></button>):<p className="mission-empty">No decisions with qualified evidence are waiting.</p>}<p className="mission-inspector-note">Draft or unverified jobs do not qualify for owner approval.</p></div>}
    {panel==="blocked"&&<div className="mission-inspector-content"><p className="mission-eyebrow">EVIDENCE GAPS</p><h2>Blocked or unverified</h2>{!dataValid?<p className="mission-empty">Job evidence unavailable or refreshing.</p>:blocked.length?blocked.map(x=><button key={x.id} className="mission-minirow" onClick={()=>{setSelected(x.id);setPanel("inspector");setMobileInspect(true)}}>{x.title}<small>{alertText(x.missing.length)} · {x.project}</small></button>):<p className="mission-empty">No unverified job reports in the source feed.</p>}<Link href="/evidence" className="mission-inspector-cta">Open all evidence →</Link></div>}
    {panel==="memory"&&<div className="mission-inspector-content"><p className="mission-eyebrow">OBSIDIAN-STYLE KNOWLEDGE</p><h2>Human authority. Machine findings.</h2><p className="mission-inspector-meta">The owner decides. AI agents document evidence.</p><div className="mission-memory-links"><Link href="/knowledge">▤ Knowledge & Memory →</Link><External href="https://github.com/ejnburrows-rgb/Command-Center-/blob/main/knowledge/AGENT.md">↳ AGENT.md source</External><External href="https://github.com/ejnburrows-rgb/Command-Center-/tree/main/knowledge/Machine">↳ Verified findings</External></div><p className="mission-inspector-note">Private documents require your GitHub sign-in; they are not leaked to anonymous viewers.</p></div>}
    <div className="mission-inspector-bottom"><span className="mission-datalight"/><div><strong>GITHUB-BACKED SOURCES</strong><small>{fullyLoaded?"All six sources current":"Source may be limited"} · {dataValid?"Evidence fetched":"Evidence status unknown"}</small></div></div>
  </aside>
  <nav className="mission-mobile-dock" aria-label="Mobile shortcuts"><Link href="/ai-operations">◈<span>AI Ops</span></Link><Link href="/projects">▣<span>Projects</span></Link><Link href="/evidence">✓<span>Proof</span></Link><Link href="/knowledge">▤<span>Memory</span></Link></nav>
 </div>;
}
