"use client";
import {useEffect,useMemo,useState} from "react";
import type {Project} from "./hub-data";
import type {Job,Approval} from "./evidence-panels";

type Agent="chatgpt"|"antigravity"|"opus";
const names:{id:Agent;name:string;role:string}[]=[
{id:"chatgpt",name:"ChatGPT",role:"Audio, voice and playback"},
{id:"antigravity",name:"Antigravity",role:"Games — only after current authorization"},
{id:"opus",name:"Opus",role:"Independent verification"}];
const storageKey="nbo-gretel-owner-handoffs-v1";
const blank:Record<Agent,string>={chatgpt:"",antigravity:"",opus:""};
const checkpointRequest="CARTILLA — CONTINUE THE EXISTING ASSIGNMENT\\nCodex coordinates existing assignments under current AGENTS.md and GitHub issue #877. Reuse the existing Tutor #1073 branch and valid proof. Finish one authentic Lesson 1 interaction; hold only genuinely blocked actions and continue independent authorized work within this session. Report the exact revision, tests, real screenshots/recordings, remaining holds and next action. Do not create a new controller, duplicate task or provider session. Muse is historical support only; Antigravity requires fresh task-specific owner authorization. No merge, production release, spending or security change without its applicable authorization.";

export default function GretelCommander({project,jobs,approvals,loading,stale,fetchedAt}:{project?:Project;jobs:Job[];approvals:Approval[];loading:boolean;stale:boolean;fetchedAt?:string}){
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
 async function copy(value:string){try{await navigator.clipboard.writeText(value);setFeedback("Copied — ready to paste");}catch{setFeedback("Clipboard unavailable. Select and copy the text instead.");}}
 const current=Boolean(project&&project.accessible&&!project.stale&&!project.limited&&project.prs!==null);
 const proposed=useMemo(()=>current?(project?.items||[]).filter(item=>item.kind==="pr"):[],[current,project]);
 const evidenceOk=!loading&&!stale;
 const verified=evidenceOk?jobs.filter(job=>job.status === "VERIFIED" && !(job.missingEvidence||[]).length):[];
 const gaps=evidenceOk?jobs.filter(job=>job.status!=="VERIFIED"||(job.missingEvidence||[]).length):[];
 const decisions=evidenceOk?approvals.length:0;
 const checked=fetchedAt&&!Number.isNaN(new Date(fetchedAt).valueOf())?new Date(fetchedAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"Time unknown";
 const steps=[
  {name:"Plan",detail:"Source checked",tone:"neutral"},
  {name:"Build",detail:current?proposed.length+" proposed":"Source unavailable",tone:current&&proposed.length?"blue":"neutral"},
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
     <div><span className="gretel-stat-label">YOUR NEXT MOVE</span><h3>Review actual proof.</h3><p>Codex coordinates existing assignments. Review the result and decide only when your approval is needed.</p></div>
     <button className="gretel-main-action" type="button" onClick={()=>void copy(checkpointRequest)}>Copy current checkpoint <span aria-hidden="true">↗</span></button>
   </div>
   <div className="gretel-footerline">
    <span className="gretel-fresh">{evidenceOk?"Evidence checked "+checked:"Evidence source unavailable — status unconfirmed"}</span>
    <span className="gretel-finish">End goal: student book + teacher tools + games + approved audio. Release only with your permission.</span>
   </div>
   <section className="gretel-inbox" aria-label="Your remaining handoffs">
      <button type="button" className="gretel-inbox-toggle" onClick={()=>setInboxOpen(v=>!v)} aria-expanded={inboxOpen}>
       <span><strong>My prompt inbox</strong><small>{savedCount} saved handoffs · Existing assignments</small></span><span aria-hidden="true">{inboxOpen?"−":"+"}</span>
      </button>
      {inboxOpen&&<div className="gretel-inbox-content">
       <p className="gretel-inbox-instructions">Use current authorized assignments only; saved prompts do not launch workers. Historical handoffs saved here remain on this device.</p>
       {names.map(agent=><div className="gretel-prompt" key={agent.id}>
         <div className="gretel-prompt-head"><div><b>{agent.name}</b><small>{ready&&handoffs[agent.id].trim()?"Saved on this device":"No handout saved"}</small></div>
          <button type="button" onClick={()=>setEditing(editing===agent.id?null:agent.id)} aria-expanded={editing===agent.id}>{editing===agent.id?"Close":"Add / edit"}</button>
          <button type="button" disabled={!handoffs[agent.id].trim()} onClick={()=>void copy(handoffs[agent.id])}>Copy</button>
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