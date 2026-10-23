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
const museRequest="MUSE — SEND MY REMAINING HANDOFF PROMPTS\nRead the current repo instructions, approvals, conflicts, agent sessions, Mission Board, open PRs and verified proof. You dispatch Jules directly: do not send me a Jules prompt. Produce individually labeled COMPLETE copy-paste prompts ONLY for the remaining agents I must handle: ChatGPT/audio, Antigravity/games (if currently allowed), and Opus/independent verification. Include exact current task, owning agent, source PR/job links, scope, blocked prerequisites, acceptance checks, and expected evidence. Exclude agents without ready work, and never present old reports, PRs or worker claims as completed. Summarize my required actions in plain English.";

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
     <div><span className="gretel-stat-label">YOUR NEXT MOVE</span><h3>Ask Muse for your handouts.</h3><p>Muse manages Jules. You only copy the remaining prompts for agents that need you.</p></div>
     <button className="gretel-main-action" type="button" onClick={()=>void copy(museRequest)}>Copy Muse request <span aria-hidden="true">↗</span></button>
   </div>
   <div className="gretel-footerline">
    <span className="gretel-fresh">{evidenceOk?"Evidence checked "+checked:"Evidence source unavailable — status unconfirmed"}</span>
    <span className="gretel-finish">End goal: student book + teacher tools + games + approved audio. Release only with your permission.</span>
   </div>
   <section className="gretel-inbox" aria-label="Your remaining handoffs">
      <button type="button" className="gretel-inbox-toggle" onClick={()=>setInboxOpen(v=>!v)} aria-expanded={inboxOpen}>
       <span><strong>My prompt inbox</strong><small>{savedCount} saved handouts · ChatGPT / Antigravity / Opus</small></span><span aria-hidden="true">{inboxOpen?"−":"+"}</span>
      </button>
      {inboxOpen&&<div className="gretel-inbox-content">
       <p className="gretel-inbox-instructions">Copy only the handouts Muse gives you. Jules stays with Muse. Prompts saved here remain on this device.</p>
       {names.map(agent=><div className="gretel-prompt" key={agent.id}>
         <div className="gretel-prompt-head"><div><b>{agent.name}</b><small>{ready&&handoffs[agent.id].trim()?"Saved on this device":"No handout saved"}</small></div>
          <button type="button" onClick={()=>setEditing(editing===agent.id?null:agent.id)} aria-expanded={editing===agent.id}>{editing===agent.id?"Close":"Add / edit"}</button>
          <button type="button" disabled={!handoffs[agent.id].trim()} onClick={()=>void copy(handoffs[agent.id])}>Copy</button>
         </div>
         {editing===agent.id&&<div className="gretel-editor">
           <label htmlFor={"gretel-"+agent.id}>Prompt for {agent.name}</label>
           <textarea id={"gretel-"+agent.id} rows={6} value={handoffs[agent.id]} placeholder="Paste Muse's handout here" onChange={e=>setHandoffs(prev=>({...prev,[agent.id]:e.target.value}))}/>
           <div><button type="button" onClick={()=>save(agent.id,handoffs[agent.id])}>Save on this device</button><button type="button" onClick={()=>save(agent.id,"")}>Clear</button></div>
         </div>}
       </div>)}
       {feedback&&<p className="gretel-feedback" role="status">{feedback}</p>}
      </div>}
   </section>
 </section>;
}