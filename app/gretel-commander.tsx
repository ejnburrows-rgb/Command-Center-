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
 const recent=useMemo(()=>proposed.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3),[proposed]);
 const evidenceOk=!loading&&!stale;
 const verified=evidenceOk?jobs.filter(job=>job.status === "VERIFIED" && !(job.missingEvidence||[]).length):[];
 const gaps=evidenceOk?jobs.filter(job=>job.status!=="VERIFIED"||(job.missingEvidence||[]).length):[];
 const decisions=evidenceOk?approvals.length:0;
 const checked=fetchedAt&&!Number.isNaN(new Date(fetchedAt).valueOf())?new Date(fetchedAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"Time unknown";
 const steps=[
  {title:"Plan",detail:"Source rules",tone:"neutral"},
  {title:"Build",detail:current?proposed.length+" open PRs":"No current source",tone:current&&proposed.length?"blue":"neutral"},
  {title:"Verify",detail:evidenceOk?verified.length+" proven jobs":"Evidence unavailable",tone:verified.length?"green":gaps.length?"amber":"neutral"},
  {title:"Decision",detail:evidenceOk?decisions+" verified requests":"Unknown",tone:decisions?"amber":"neutral"},
  {title:"Release",detail:"Not confirmed live",tone:"neutral"}];
 return <section className="gretel-owner" aria-labelledby="gretel-title">
  <header className="gretel-head"><div><p className="gretel-eyebrow">YOUR GRETEL MISSION</p><h2 id="gretel-title">La Cartilla de Gretel</h2><p>Plain-English progress, actual proof, and your remaining prompts.</p></div><a href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877" target="_blank" rel="noopener noreferrer">View source ↗</a></header>
  <div className="gretel-goal"><div><small>END GOAL</small><strong>Student book · Teacher tools · Four games · Approved audio</strong><span>Works on phone, checked independently, released only with your approval.</span></div><div className="gretel-deadline"><small>PLAN TARGET</small><strong>4:54 PM ET</strong><span>October 23, 2026 · original target only</span></div></div>
  <div className="gretel-timeline" aria-label="Five delivery stages">{steps.map((step,i)=><div className={"gretel-step gretel-"+step.tone} key={step.title}><b>{i+1}. {step.title}</b><span>{step.detail}</span></div>)}</div>
  <div className="gretel-metrics" aria-label="Current GitHub evidence"><div><strong>{current?proposed.length:"—"}</strong><span>Open code changes</span></div><div><strong>{evidenceOk?verified.length:"—"}</strong><span>Verified job reports</span></div><div><strong>{evidenceOk?gaps.length:"—"}</strong><span>Jobs missing proof</span></div></div>
  <div className="gretel-columns">
   <section className="gretel-section"><h3>Agent status</h3><p className="gretel-caption">No agent session is assumed from a PR.</p>
    <div className="gretel-agent"><span className="gretel-dot gretel-blue-dot"/><div><b>Muse → Jules</b><small>Jules is handled directly by Muse</small></div><em>Controller-managed</em></div>
    {names.map(agent=><div className="gretel-agent" key={agent.id}><span className="gretel-dot"/><div><b>{agent.name}</b><small>{agent.role}</small></div><em>{ready&&handoffs[agent.id].trim()?"Prompt saved":"Dispatch unconfirmed"}</em></div>)}
    <p className="gretel-note">A saved prompt is not a live agent connection or proof of work.</p>
   </section>
   <section className="gretel-section"><h3>What happens next</h3><p className="gretel-caption">{evidenceOk?"Evidence source checked "+checked:"Evidence source unavailable"}</p>
    <p className="gretel-next"><i className="gretel-amber-dot"/> {evidenceOk?gaps.length+" jobs require acceptance proof.":"Recheck the source job board."}</p>
    <p className="gretel-next"><i className="gretel-blue-dot"/> {current?proposed.length+" proposed changes still need reconciliation.":"Current PRs unavailable."}</p>
    <p className="gretel-next"><i className="gretel-amber-dot"/> {evidenceOk?decisions+" source-qualified decisions await you.":"Owner decisions unknown."}</p>
    {recent.length>0&&<div className="gretel-recent"><b>RECENT PROPOSED CHANGES</b>{recent.map(item=><a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a>)}</div>}
   </section>
  </div>
  <section className="gretel-inbox"><div className="gretel-inbox-title"><div><h3>Your copy-and-paste inbox</h3><p>Muse handles Jules. Keep only your other handouts here.</p></div><button type="button" onClick={()=>setInboxOpen(v=>!v)} aria-expanded={inboxOpen}>{inboxOpen?"Close inbox":"Open inbox"}</button></div>
   {inboxOpen&&<div className="gretel-inbox-content"><button className="gretel-copy-muse" type="button" onClick={()=>void copy(museRequest)}>Copy request for Muse →</button>
    <p className="gretel-caption">Paste the complete prompts Muse sends. <b>This browser only:</b> your saved handouts are not sent to the website server or GitHub.</p>
    {names.map(agent=><div className="gretel-prompt" key={agent.id}><div className="gretel-prompt-head"><b>{agent.name}</b><span>{ready&&handoffs[agent.id].trim()?"Saved here":"No handout saved"}</span><button type="button" onClick={()=>setEditing(editing===agent.id?null:agent.id)} aria-expanded={editing===agent.id}>{editing===agent.id?"Close":"Edit"}</button><button type="button" disabled={!handoffs[agent.id].trim()} onClick={()=>void copy(handoffs[agent.id])}>Copy</button></div>
     {editing===agent.id&&<div className="gretel-editor"><label htmlFor={"gretel-"+agent.id}>Muse's complete prompt for {agent.name}</label><textarea id={"gretel-"+agent.id} value={handoffs[agent.id]} rows={5} placeholder="Paste the complete Muse handout" onChange={e=>setHandoffs(prev=>({...prev,[agent.id]:e.target.value}))}/><div><button type="button" onClick={()=>save(agent.id,handoffs[agent.id])}>Save handoff</button><button type="button" onClick={()=>save(agent.id,"")}>Clear</button></div></div>}
    </div>)}
    {feedback&&<p role="status" className="gretel-feedback">{feedback}</p>}
   </div>}
  </section>
  <p className="gretel-key">Green = proof verified · Blue = open proposal · Amber = needs evidence or decision · Gray = unconfirmed. Open PRs are not completed releases.</p>
 </section>;
}