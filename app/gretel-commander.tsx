"use client";
import {useEffect,useMemo,useState} from "react";
import type {Project} from "./hub-data";
import type {Job,Approval,Execution} from "./evidence-panels";

type Agent="chatgpt"|"antigravity"|"opus";
const names:{id:Agent;name:string;role:string}[]=[
{id:"chatgpt",name:"ChatGPT",role:"Audio, voice and playback"},
{id:"antigravity",name:"Antigravity",role:"Historical notes only — Antigravity not authorized"},
{id:"opus",name:"Opus",role:"Independent verification"}];
const storageKey="nbo-gretel-owner-handoffs-v1";
const blank:Record<Agent,string>={chatgpt:"",antigravity:"",opus:""};

export default function GretelCommander({project,jobs,approvals,loading,stale,fetchedAt,execution}:{project?:Project;jobs:Job[];approvals:Approval[];loading:boolean;stale:boolean;fetchedAt?:string;execution?:Execution}){
 const [handoffs,setHandoffs]=useState<Record<Agent,string>>(blank);
 const [ready,setReady]=useState(false);
 const [inboxOpen,setInboxOpen]=useState(false);
 const [editing,setEditing]=useState<Agent|null>(null);
 const [feedback,setFeedback]=useState("");
 useEffect(()=>{
  try{const value=JSON.parse(localStorage.getItem(storageKey)||"null");
   if(value&&typeof value==="object")setHandoffs({
    chatgpt:typeof value.chatgpt==="string"?value.chatgpt:"",
    antigravity:typeof value.antigravity==="string"?value.antigravity:"",
    opus:typeof value.opus==="string"?value.opus:""});
  }catch{/* Keep the panel usable when this device has no saved prompts. */}
  setReady(true);
 },[]);
 function save(agent:Agent,text:string){const next={...handoffs,[agent]:text};setHandoffs(next);
  try{localStorage.setItem(storageKey,JSON.stringify(next));setFeedback(text.trim()?"Saved on this device":"Removed from this device");}
  catch{setFeedback("Could not save. Copy the prompt before closing.");}}
 const current=Boolean(project&&project.accessible&&!project.stale&&!project.limited&&project.prs!==null);
 const proposed=useMemo(()=>current?(project?.items||[]).filter(item=>item.kind==="pr"):[],[current,project]);
 const evidenceOk=!loading&&!stale;
 const verified=evidenceOk?jobs.filter(job=>job.status === "VERIFIED" && !(job.missingEvidence||[]).length):[];
 const gaps=evidenceOk?jobs.filter(job=>job.status!=="VERIFIED"||(job.missingEvidence||[]).length):[];
 const decisions=evidenceOk?approvals.length:0;
 const checked=fetchedAt&&!Number.isNaN(new Date(fetchedAt).valueOf())?new Date(fetchedAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"Time unknown";
 const steps=[
  {name:"Plan",detail:"Source checked",tone:"neutral"},
  {name:"Build",detail:execution?.productWorkAuthorized?(current?proposed.length+" open PRs":"Source unavailable"):"Not authorized to start",tone:execution?.productWorkAuthorized&&current&&proposed.length?"blue":"neutral"},
  {name:"Verify",detail:evidenceOk?verified.length+" confirmed":"Not checked",tone:verified.length?"green":gaps.length?"amber":"neutral"},
  {name:"Approve",detail:evidenceOk?decisions+" requests":"Unknown",tone:decisions?"amber":"neutral"},
  {name:"Release",detail:"Not confirmed",tone:"neutral"}];
 const savedCount=names.filter(agent=>ready&&handoffs[agent.id].trim()).length;
 return <section className="gretel-owner" aria-labelledby="gretel-title">
   <header className="gretel-head">
     <div className="gretel-headline"><p className="gretel-eyebrow">LA CARTILLA DE GRETEL / MISSION VIEW</p><h2 id="gretel-title">One clear path <span>to launch.</span></h2>
       <p>See what is moving, what needs proof, and what needs you.</p></div>
     <a className="gretel-source" href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877" target="_blank" rel="noopener noreferrer">Project evidence ↗</a>
   </header>
   <div className="gretel-progress" aria-label="Release journey">{steps.map((step,i)=><div key={step.name} className={"gretel-progress-item gretel-"+step.tone}>
      <div className="gretel-progress-track" aria-hidden="true"/><strong>{step.name}</strong><small>{step.detail}</small></div>)}</div>
   <div className="gretel-snapshot">
     <div><span className="gretel-stat-label">CODE CHANGES</span><strong>{current?proposed.length:"—"}</strong><small>Open, not released</small></div>
     <div><span className="gretel-stat-label">NEED PROOF</span><strong>{evidenceOk?gaps.length:"—"}</strong><small>Unverified jobs</small></div>
     <div><span className="gretel-stat-label">NEED YOUR YES</span><strong>{evidenceOk?decisions:"—"}</strong><small>Evidence-backed decisions</small></div>
   </div>
   <div className="gretel-nextmove">
     <div><span className="gretel-stat-label">CURRENT AUTHORIZED SCOPE</span><h3>{execution?.mode==="ORGANIZATION_ONLY"?"Organization only. Product work paused.":execution?.mode==="TUTOR_1073_ONLY"?"Tutor #1073 only · Lección 1 qualification":"Read the current owner directive."}</h3><p>{!evidenceOk?"Source unavailable: do not dispatch a new agent.":execution?.nextStep||"Owner scope UNKNOWN. Do not turn a stale model handoff into a new task."} Live agent activity and remaining model credits: UNKNOWN unless verified directly with that provider.</p></div>
     <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",alignItems:"center"}}>
       <a className="gretel-main-action" href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877" target="_blank" rel="noopener noreferrer">Open current assignment <span aria-hidden="true">↗</span></a>
       <a className="gretel-main-action" href="/art-inventory" style={{background:"#0284c7",color:"#ffffff",borderColor:"#0284c7"}}>Visual Inventory (Activities · Art · Motion) <span aria-hidden="true">→</span></a>
     </div>
   </div>
   <div className="gretel-footerline">
    <span className="gretel-fresh">{evidenceOk?"Evidence checked "+checked:"Evidence source unavailable — status unconfirmed"}</span>
    <span className="gretel-finish">End goal: student book + teacher tools + games + approved audio. Release only with your permission.</span>
   </div>
   <section className="gretel-inbox" aria-label="Archived handoff notes stored locally">
      <button type="button" className="gretel-inbox-toggle" onClick={()=>setInboxOpen(v=>!v)} aria-expanded={inboxOpen}>
       <span><strong>Archived handoff notes</strong><small>{savedCount} local notes · Not active assignments</small></span><span aria-hidden="true">{inboxOpen?"−":"+"}</span>
      </button>
      {inboxOpen&&<div className="gretel-inbox-content">
       <p className="gretel-inbox-instructions">These are historical notes saved on this device, not agent instructions or proof of an active session. Current assignments come only from the live GitHub source above.</p>
       {names.map(agent=><div className="gretel-prompt" key={agent.id}>
         <div className="gretel-prompt-head"><div><b>{agent.name}</b><small>{ready&&handoffs[agent.id].trim()?"Saved on this device":"No handout saved"}</small></div>
          <button type="button" onClick={()=>setEditing(editing===agent.id?null:agent.id)} aria-expanded={editing===agent.id}>{editing===agent.id?"Close":"Add / edit"}</button>
          
         </div>
         {editing===agent.id&&<div className="gretel-editor">
           <label htmlFor={"gretel-"+agent.id}>Prompt for {agent.name}</label>
           <textarea id={"gretel-"+agent.id} rows={6} value={handoffs[agent.id]} placeholder="Paste an authorized task checkpoint here" onChange={e=>setHandoffs(prev=>({...prev,[agent.id]:e.target.value}))}/>
           <div><button type="button" onClick={()=>save(agent.id,handoffs[agent.id])}>Save on this device</button><button type="button" onClick={()=>save(agent.id,"")}>Clear</button></div>
         </div>}
       </div>)}
       {feedback&&<p className="gretel-feedback" role="status">{feedback}</p>}
      </div>}
   </section>
 </section>;
}
