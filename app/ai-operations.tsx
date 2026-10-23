"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import type {Project,Work} from "./hub-data";
import {useJobs} from "./evidence-panels";
import {External} from "./hub-ui";
import FileVault from "./file-vault";
import {projectPath} from "./route-paths";

type Focus="all"|"pr"|"issue"|"draft";
function sourceTime(value?:string){if(!value)return "Not recorded";const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString():"Not recorded";}
function status(p:Project){return !p.accessible?"Source unavailable":p.stale||p.limited?"Partial / stale GitHub data":"GitHub source";}
function workLabel(w:Work){return w.kind==="pr"?(w.draft?"Draft PR":"Open PR"):"Open issue";}
function entries(projects:Project[]){return projects.flatMap(p=>p.items.map(w=>({project:p,work:w}))).sort((a,b)=>b.work.updatedAt.localeCompare(a.work.updatedAt));}

export function OperationsBrief({projects,loading}:{projects:Project[];loading:boolean}){
 const jobs=useJobs();
 const fresh=projects.filter(p=>p.accessible&&!p.stale&&!p.limited&&p.issues!==null&&p.prs!==null);
 const complete=fresh.length===projects.length&&projects.length>0&&!loading;
 const issues=fresh.reduce((n,p)=>n+(p.issues??0),0);
 const prs=fresh.reduce((n,p)=>n+(p.prs??0),0);
 const draft=fresh.reduce((n,p)=>n+(p.drafts??0),0);
 const knownApprovals=!jobs.loading&&!jobs.error&&!jobs.stale;
 return <section className="aop-overview" aria-label="Software operations snapshot">
  <div className="aop-hero"><p className="aop-eyebrow">AI-FIRST SOFTWARE OPERATIONS</p><h2>Make the work visible.<br/><span>Verify the result.</span></h2><p>Real GitHub work, evidence and owner decisions. An AI completion claim is not proof.</p><Link className="aop-primary" href="/ai-operations">Open AI operations <span aria-hidden="true">→</span></Link></div>
  <div className="aop-overview-side">
    <div className="aop-tiles">
      <div><small>OPEN ISSUES</small><strong>{complete?issues:"—"}</strong><span>{complete?"All listed projects":"Complete source required"}</span></div>
      <div><small>OPEN PRs</small><strong>{complete?prs:"—"}</strong><span>{complete?draft+" drafts included":"Complete source required"}</span></div>
      <div><small>NEEDS YOUR DECISION</small><strong>{knownApprovals?jobs.approvals.length:"—"}</strong><span>{knownApprovals?"Evidence-qualified only":"Evidence source unavailable"}</span></div>
      <div><small>UNVERIFIED JOB REPORTS</small><strong>{knownApprovals?jobs.jobs.filter(j=>j.status!=="VERIFIED").length:"—"}</strong><span>{knownApprovals?"Cartilla evidence feed":"Evidence source unavailable"}</span></div>
    </div>
    <p className="aop-fresh">GitHub repositories: {fresh.length} of {projects.length} complete · Job evidence: {sourceTime(jobs.fetchedAt)}{jobs.stale?" · STALE":""}</p>
  </div>
 </section>;
}

export default function AIOperations({projects,view}:{projects:Project[];view:"operations"|"evidence"|"knowledge"}){
 const jobs=useJobs();
 const [focus,setFocus]=useState<Focus>("all");
 const [term,setTerm]=useState("");
 const all=useMemo(()=>entries(projects),[projects]);
 const work=all.filter(({project,work})=>(focus==="all"||focus==="draft"&&work.kind==="pr"&&work.draft||focus===work.kind)&&[project.name,work.title,String(work.number)].join(" ").toLowerCase().includes(term.trim().toLowerCase()));
 const isEvidence=view==="evidence",isKnowledge=view==="knowledge";
 const title=isKnowledge?"Knowledge & Memory":isEvidence?"Delivery evidence":"AI Operations";
 const description=isKnowledge?"Your local documents and the protected project-memory source.":isEvidence?"Check the evidence before accepting an AI completion claim.":"The live GitHub work queue and evidenced AI work. Agent presence is not inferred.";
 return <div className="aop-page">
  <header className="aop-pagehead"><div><p className="aop-eyebrow">NBO / MISSION CONTROL</p><h1>{title}</h1><p>{description}</p></div><div className="aop-source"><b>DATA INTEGRITY</b><span>Verified GitHub source only</span><small>No simulated activity or progress</small></div></header>
  {isKnowledge?<div className="aop-knowledge">
   <section className="aop-card"><p className="aop-eyebrow">PROJECT MEMORY</p><h2>Owner instructions are authoritative.</h2><p>Shared workflow instructions and AI findings are stored in the private Command Center repository. These links open GitHub with your own access permissions; the public dashboard never fetches private documents.</p><div className="aop-linkgrid"><External href="https://github.com/ejnburrows-rgb/Command-Center-/tree/feature/nbo-ai-ops-cockpit-20261023/knowledge/Human">Human / owner notes</External><External href="https://github.com/ejnburrows-rgb/Command-Center-/tree/feature/nbo-ai-ops-cockpit-20261023/knowledge/Machine">Machine / verified findings</External><External href="https://github.com/ejnburrows-rgb/Command-Center-/blob/feature/nbo-ai-ops-cockpit-20261023/knowledge/AGENT.md">Agent operating rules</External></div><p className="aop-caution">These documents remain GitHub-only until private server-side authentication is verified.</p></section>
   <FileVault/>
  </div>:<div className="aop-columns">
   <div className="aop-maincol">
    <section className="aop-card aop-work">
     <div className="aop-headline"><div><p className="aop-eyebrow">01 / REAL WORK</p><h2>{isEvidence?"Open work and proof":"Across your repositories"}</h2></div><span>{projects.filter(p=>p.stale||p.limited||!p.accessible).length?"Some sources partial":"Source: GitHub"}</span></div>
     <div className="aop-toolbar"><label className="aop-search"><span className="sr-only">Search GitHub work</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Find work, project or issue number" /></label><label><span className="sr-only">Filter work</span><select value={focus} onChange={e=>setFocus(e.target.value as Focus)}><option value="all">All open work</option><option value="issue">Issues</option><option value="pr">Pull requests</option><option value="draft">Draft PRs</option></select></label></div>
     <p className="aop-subtle">Open GitHub records are not proof of successful delivery. Results may be partial where GitHub reports a limit or stale source.</p>
     {work.slice(0,35).map(({project:p,work:w})=><article className="aop-task" key={p.slug+":"+w.kind+":"+w.number}><span className={"aop-flag "+(w.draft?"aop-flag-draft":"")}>{workLabel(w)}</span><div><External href={w.url}>{w.title}</External><p><Link href={projectPath(p.slug)}>{p.name}</Link> · #{w.number} · Updated {sourceTime(w.updatedAt)}</p></div></article>)}
     {!work.length&&<p className="aop-empty">{projects.length?"No matching records were returned.":"Loading projects or no accessible GitHub source."}</p>}
     {work.length>35&&<p className="aop-subtle">{work.length-35} additional matching records. Open the GitHub Intelligence view for further inspection.</p>}
    </section>
    <section className="aop-card"><div className="aop-headline"><div><p className="aop-eyebrow">02 / EVIDENCE</p><h2>Canonical job reports</h2></div><External href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877">Source issue</External></div>
     <p className="aop-subtle">These are jobs from the Cartilla evidence source, not inferred statuses for other agents or projects.</p>
     {jobs.loading?<p className="aop-empty">Loading evidence…</p>:jobs.error?<p role="alert" className="aop-caution">{jobs.error}</p>:jobs.jobs.length?jobs.jobs.map(j=><article key={j.id} className="aop-job"><div><span className={"aop-flag "+(j.status==="VERIFIED"?"aop-flag-good":"aop-flag-warn")}>{j.status}</span><strong>{j.title}</strong></div><p>Job {j.id} · GitHub: {j.githubState||"Unknown"} · {j.missingEvidence?.length||0} listed proof gaps</p><div className="aop-links"><External href={j.sourceUrl}>Job record</External>{j.prUrl&&<External href={j.prUrl}>Related PR</External>}{j.proofUrl&&<External href={j.proofUrl}>Evidence</External>}</div>{j.ownerDecision&&<p>{j.ownerDecision}</p>}{j.missingEvidence?.map(m=><p className="aop-gap" key={m}>Missing: {m}</p>)}</article>):<p className="aop-empty">No job reports in the current feed.</p>}
     {jobs.stale&&<p className="aop-caution">Evidence is stale. Do not treat any status as freshly verified.</p>}
    </section>
   </div>
   <aside className="aop-rail" aria-label="Operational intelligence">
    <section className="aop-card"><p className="aop-eyebrow">NEEDS YOU</p><h2>Owner decisions</h2>{jobs.loading?<p className="aop-empty">Checking approval evidence…</p>:jobs.error||jobs.stale?<p className="aop-caution">Approval evidence unavailable or stale.</p>:jobs.approvals.length?jobs.approvals.map(a=><article key={a.id} className="aop-railrow"><b>{a.title}</b><p>{a.project} · {a.state}</p><External href={a.proofUrl}>Review proof</External><External href={a.sourceUrl}>Decision context</External></article>):<p className="aop-empty">No evidenced approvals awaiting your decision.</p>}</section>
    <section className="aop-card"><p className="aop-eyebrow">PROJECT SOURCES</p><h2>Data health</h2>{projects.map(p=><div className="aop-railrow" key={p.slug}><Link href={projectPath(p.slug)}><b>{p.name}</b></Link><p>{status(p)} · {sourceTime(p.fetchedAt)}</p></div>)}</section>
    <section className="aop-card"><p className="aop-eyebrow">MEMORY</p><h2>Keep decisions intact</h2><p>Read project rules and findings before issuing corrective prompts.</p><Link className="aop-textlink" href="/knowledge">Open Knowledge & Memory →</Link></section>
   </aside>
  </div>}
 </div>;
