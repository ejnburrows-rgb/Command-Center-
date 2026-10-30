"use client";
import {useMemo,useState} from "react";
import type {Project,Work} from "./hub-data";
import {useJobs} from "./evidence-panels";

type Task={id:string;title:string;project:string;agent:string;kind:"resume"|"review";item:Work;context:string;rules:string[]};
type MapNode={project:Project;x:number;y:number};

function taskPrompt(task:Task,sourceFresh:boolean,authority:string):string{
 const warning=sourceFresh?"Check the latest head, exact ownership and test evidence before changing anything.":"SOURCE NOT VERIFIED FRESH: first recover the current GitHub state. Do not edit or dispatch until verified.";
 return [
  "MISSION — "+task.title,
  "SUGGESTED AGENT: "+task.agent+" (suggestion, not an automatic assignment)",
  "PROJECT: "+task.project,
  "EXISTING WORK: "+task.item.kind.toUpperCase()+" #"+task.item.number+" — "+task.item.title,
  "EXACT SOURCE: "+task.item.url,
  "SOURCE LAST UPDATED: "+(task.item.updatedAt||"UNKNOWN"),
  "CURRENT AUTHORIZATION: "+authority,
  "",
  "OBJECTIVE: "+task.context,
  "",
  "REQUIRED EXECUTION:",
  "1. "+warning,
  "2. Recover the existing branch, task/session owner and applicable AGENTS.md. Continue the existing work; no new duplicate branch, agent or controller.",
  "3. Inspect only the files and behavior needed for this specific outcome. Reuse verified earlier work and do not repeat broad audits.",
  "4. Make and test the smallest eligible fix, document real device/browser proof when visual, and obtain independent review where required.",
  "5. Preserve unrelated Cartilla, LANY and NBO functionality. Do not auto-merge, deploy production, spend money, weaken security or launch additional workers.",
  ...task.rules.map((rule,index)=>String(index+6)+". "+rule),
  "",
  "DELIVER: Current SHA | What changed | Exact tests and results | Phone/desktop proof if applicable | Actual task/PR/session link | What is next.",
  "Do not claim success or a running provider session without direct evidence."
 ].join("\n");
}

function projectPrompt(project:Project):string{
 const issue=project.items.find(item=>item.kind==="issue")||project.items.find(item=>item.kind==="pr");
 return [
  "MISSION — Resume verified existing work in "+project.name,
  "REPOSITORY: "+project.url,
  "SOURCE STATE: "+(project.stale||project.limited||!project.accessible?"STALE / PARTIAL — INSPECT ONLY":"GitHub source fetched "+(project.fetchedAt||"timestamp unknown")),
  "NEXT EXISTING RECORD: "+(issue?issue.title+" — "+issue.url:"No current eligible work identified; verify assignments before proposing work."),
  "First identify current authorization, assignee, open PR, proof, and exact next eligible action. Do not create tasks or start product work solely from this copy.",
  "If work is authorized, continue the existing branch with focused tests and real proof. Do not duplicate work, merge, spend money or deploy without applicable permission.",
  "Return: Verified state | Accountable worker | What is missing | One next action."
 ].join("\n");
}

export default function MissionActionMap({projects,busy}:{projects:Project[];busy:boolean}){
 const jobs=useJobs();
 const [selected,setSelected]=useState("");
 const [expanded,setExpanded]=useState("");
 const [copied,setCopied]=useState("");
 const [copyFailure,setCopyFailure]=useState("");
 const [selectedPrompt,setSelectedPrompt]=useState(false);
 const available=projects.filter(p=>p.accessible).slice(0,9);
 const chosen=available.find(p=>p.slug===selected)||available[0];
 const nodes:MapNode[]=useMemo(()=>available.map((project,i)=>{
   const angle=(-Math.PI/2)+(i*Math.PI*2/Math.max(available.length,1));
   return {project,x:50+Math.cos(angle)*39,y:50+Math.sin(angle)*36};
 }),[available]);
 const sourceFresh=!busy&&!jobs.loading&&!jobs.stale&&!jobs.error;
 const scope=jobs.execution?.mode==="TUTOR_1073_ONLY"?"Tutor #1073 development/qualification only; other Cartilla product lanes parked":jobs.execution?.mode==="PRODUCT_DEVELOPMENT"?"Confirm exact currently authorized job with #877 before product edits":jobs.execution?.mode==="ORGANIZATION_ONLY"?"Product changes paused; source/review work only":"Authorization UNKNOWN — inspect only; no new product dispatch";
 const nbo=projects.find(p=>p.slug==="Command-Center-");
 const cartilla=projects.find(p=>p.slug==="cartilla-de-gretel");
 const assigned=nbo?.items.find(i=>i.kind==="issue"&&i.number===18);
 const tutor=cartilla?.items.find(i=>i.kind==="pr"&&i.number===1073);
 const policy=cartilla?.items.find(i=>i.kind==="pr"&&i.number===1218);
 const cards:Task[]=[];
 if(assigned)cards.push({id:"jules18",title:"Finish real agent ownership on the Board",project:nbo?.name||"NBO Operations Hub",agent:"Jules — resume existing task, do not dispatch another",kind:"resume",item:assigned,context:"Continue NBO issue #18. Make the Board display who assigned a task, its actual Jules acceptance, worker, PR and source freshness. Show unverified session status as UNKNOWN. Preserve this new mind map and prompt panel; coordinate file ownership.",rules:["Check Jules task 10892341679603989202 and the bot acceptance in issue #18 before resuming. Do not treat issue labels as proof of execution.","Because Jules is winding down, preserve task and PR evidence in GitHub; do not create a new Jules-only dependency."]});
 if(tutor&&jobs.execution?.productWorkAuthorized)cards.push({id:"tutor1073",title:"Prove Gretel Tutor Lección 1 on a real device",project:cartilla?.name||"La Cartilla de Gretel",agent:"Codex — existing Tutor worker only",kind:"resume",item:tutor,context:"Qualify existing Gretel Tutor PR #1073, first Lección 1. Focus on actual phone-width interaction and real microphone/approved voice behavior; preserve the existing Tutor branch.",rules:["Use Cartilla queue #877; no replacement Tutor, cloud AI ears, TTS fallback, art regeneration or unrelated lesson changes.","Keep Tutor draft until required speech, offline, privacy and owner acceptance proof exists."]});
 if(policy)cards.push({id:"policy1218",title:"Review current Tutor operating instructions",project:cartilla?.name||"La Cartilla de Gretel",agent:"Codex reviewer / independent reviewer",kind:"review",item:policy,context:"Review existing documentation-only PR #1218 for obsolete organization-only instructions versus the latest #877 scope. Correct only proven contradictions; no product implementation.",rules:["Respect independent review and repository branch protection before a merge.","Ensure documentation changes cannot automatically trigger an unauthorized Cartilla production release."]});
 if(cards.length<3){
  const prior=projects.flatMap(p=>p.items.filter(i=>i.kind==="pr"&&!i.draft&&p.slug==="Command-Center-").map(i=>({p,i})))
   .filter(({i})=>i.number!==17&&i.number!==15).sort((a,b)=>String(b.i.updatedAt).localeCompare(String(a.i.updatedAt)));
  for(const {p,i} of prior){if(cards.length>=3)break;cards.push({id:"review"+i.number,title:"Review existing NBO PR #"+i.number,project:p.name,agent:"Codex independent reviewer",kind:"review",item:i,context:"Check existing NBO PR #"+i.number+" against current main, task priority, overlap and real acceptance evidence. Avoid unnecessary merges or optimization-only distractions.",rules:["Reject security regressions, stale branches, and changes that replace verified current Board functionality."]});}
 }
 async function copy(id:string,value:string){
  try{await navigator.clipboard.writeText(value);setCopied(id);setCopyFailure("");}
  catch{setCopyFailure(id);setCopied("");}
 }
 const projectCopy=chosen?projectPrompt(chosen):"No verified project source. Refresh GitHub before assigning work.";
 return <section className="next-mission" aria-labelledby="next-mission-title">
  <div className="next-mission-intro">
   <div><p className="next-mission-kicker">YOUR PROJECT NETWORK · START HERE</p><h2 id="next-mission-title">Project mind map <span>& next agent prompts</span></h2>
    <p>Select a connected project, or copy an actual next-task handoff below. No GitHub navigation required to obtain the prompt.</p></div>
   <span className="next-mission-source">{busy?"Checking GitHub…":available.length?available.length+" connected projects":"Project source unavailable"}</span>
  </div>
  <div className="next-mission-map-section">
    <div className="next-mission-map-scroll" role="region" aria-label="Interactive project mind map; scroll horizontally on narrow screens" tabIndex={0}>
     <div className="next-mission-stage">
      <svg className="next-mission-lines" aria-hidden="true" viewBox="0 0 1000 380" preserveAspectRatio="none">
       {nodes.map(n=><line key={n.project.slug} x1="500" y1="190" x2={n.x*10} y2={n.y*3.8} stroke={selected===n.project.slug?"#7ce6d0":"#505e83"} strokeWidth={selected===n.project.slug?3:1.6} strokeDasharray={n.project.stale?"5 7":undefined}/>)}
      </svg>
      <div className="next-mission-center-node"><strong>NBO</strong><span>CONTROL HUB</span></div>
      {nodes.map(n=><button key={n.project.slug} type="button" className={"next-mission-map-node"+(chosen?.slug===n.project.slug?" selected":"")} style={{left:n.x+"%",top:n.y+"%"}} aria-pressed={chosen?.slug===n.project.slug} onClick={()=>{setSelected(n.project.slug);setSelectedPrompt(false);setCopied("");}}>
       <strong>{n.project.name}</strong><span>{n.project.stale||n.project.limited?"STALE / PARTIAL":n.project.prs===null?"SOURCE UNKNOWN":n.project.prs+" PRs · "+(n.project.issues??"—")+" issues"}</span>
      </button>)}
      {!available.length&&<div className="next-mission-map-empty">{busy?"Loading connected projects…":"GitHub project data unavailable. No project statuses have been invented."}</div>}
     </div>
    </div>
    <div className="next-mission-quicknodes" aria-label="Choose project">
     {available.map(p=><button type="button" key={p.slug} aria-pressed={chosen?.slug===p.slug} onClick={()=>{setSelected(p.slug);setSelectedPrompt(false)}}>{p.name}</button>)}
    </div>
    {chosen&&<div className="next-mission-selected">
       <div><small>SELECTED PROJECT</small><strong>{chosen.name}</strong><span>{chosen.stale||chosen.limited?"Source is stale or partial":"Updated from GitHub: "+(chosen.fetchedAt?new Date(chosen.fetchedAt).toLocaleString():"Time unknown")}</span></div>
       <button type="button" onClick={()=>{setSelectedPrompt(v=>!v);setCopied("");}}>{selectedPrompt?"Hide project handoff":"View project handoff"}</button>
       <button type="button" className="next-mission-copy" onClick={()=>void copy("project",projectCopy)}>{copied==="project"?"Copied project prompt":"Copy project prompt"}</button>
    </div>}
    {selectedPrompt&&chosen&&<textarea className="next-mission-prompt-text" aria-label="Project prompt ready to copy" readOnly value={projectCopy} rows={7}/>}
    {copyFailure==="project"&&<p className="next-mission-error">Clipboard permission unavailable. Select and copy the visible prompt text below.</p>}
    {copyFailure==="project"&&!selectedPrompt&&chosen&&<textarea className="next-mission-prompt-text" readOnly value={projectCopy} rows={7}/>}
   </div>
  <div className="next-mission-task-heading">
   <div><p className="next-mission-kicker">COPY · PASTE · CONTINUE EXISTING WORK</p><h3>Your next coding-agent prompts</h3></div>
   <span>{sourceFresh?"GitHub and #877 checked":"Source refreshing / partially unavailable"}</span>
  </div>
  {!cards.length&&<div className="next-mission-no-tasks">{busy||jobs.loading?"Loading verified work and owner authorization…":"No eligible task identified from accessible records. Refresh sources before dispatch."}</div>}
  <div className="next-mission-tasks">
   {cards.slice(0,3).map((t,i)=>{
     const prompt=taskPrompt(t,sourceFresh,scope);
     const open=expanded===t.id||copyFailure===t.id;
     return <article key={t.id} className="next-mission-task">
      <div className="next-mission-task-top"><span className="next-mission-task-number">0{i+1}</span><span className="next-mission-state">{t.kind==="resume"?"CONTINUE EXISTING TASK":"REVIEW EXISTING PR"}</span></div>
      <h4>{t.title}</h4>
      <p className="next-mission-agent">{t.agent}</p>
      <p className="next-mission-task-context">{t.context}</p>
      <p className="next-mission-item">Source: {t.project} · {t.item.kind.toUpperCase()} #{t.item.number} · {t.item.updatedAt?new Date(t.item.updatedAt).toLocaleString():"Update UNKNOWN"}</p>
      <div className="next-mission-task-controls">
       <button type="button" className="next-mission-copy" aria-label={"Copy complete coding-agent prompt for "+t.title} onClick={()=>void copy(t.id,prompt)}>{copied===t.id?"✓ Copied — paste into agent":"Copy full agent prompt"}</button>
       <button type="button" className="next-mission-toggle" aria-expanded={open} onClick={()=>setExpanded(open?"":t.id)}>{open?"Hide prompt":"Read prompt"}</button>
      </div>
      {open&&<textarea className="next-mission-prompt-text" aria-label={"Complete handoff prompt for "+t.title} readOnly value={prompt} rows={12}/>}
      {copyFailure===t.id&&<p className="next-mission-error">Clipboard blocked. Copy directly from the prompt above.</p>}
     </article>;
   })}
  </div>
  <p className="next-mission-disclaimer">Copying a prompt does not assign work or start an agent. Existing assignments must be checked first; no automatic merges, deployments, or spending.</p>
 </section>;
}
