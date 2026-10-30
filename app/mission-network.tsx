"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import type {Project,Work} from "./hub-data";
import type {Job,Approval,Execution} from "./evidence-panels";
import type {JulesAssignmentEvidence} from "@/lib/jules-assignment-contract";

const CW=1580,CH=1280,CX=CW/2,CY=CH/2;
const PROJECT_RADIUS=275,WORK_RADIUS=515,DETAIL_RADIUS=705,PAGE_SIZE=5;
type NodeKind="project"|"work"|"assignment"|"evidence"|"deployment";
type Node={id:string;x:number;y:number;kind:NodeKind;project:Project;work?:Work;index?:number;angle:number;parentId?:string;title?:string;subtitle?:string;status?:string;url?:string;freshness?:string};
type Point={x:number;y:number};
const fmt=(raw?:string|null)=>raw&&!Number.isNaN(Date.parse(raw))?new Date(raw).toLocaleString():"Unknown";
const workKey=(p:Project,w:Work)=>p.slug+"/"+w.kind+"/"+w.number;
const bounded=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

function path(a:Point,b:Point){
 const dx=b.x-a.x,dy=b.y-a.y;
 const start={x:a.x+dx*.23,y:a.y+dy*.23},end={x:b.x-dx*.23,y:b.y-dy*.23};
 return "M "+a.x+" "+a.y+" C "+start.x+" "+start.y+" "+end.x+" "+end.y+" "+b.x+" "+b.y;
}

export function projectFreshness(p:Project){
 if(!p.accessible)return "SOURCE UNAVAILABLE";
 if(p.stale||p.limited)return "STALE OR PARTIAL SNAPSHOT"+(p.fetchedAt?" · Last observed "+fmt(p.fetchedAt):"");
 return "SNAPSHOT OBSERVED "+(p.fetchedAt?fmt(p.fetchedAt):"TIME UNKNOWN")+" (cached TTL)";
}

export function workStatus(w:Work,assignment?:JulesAssignmentEvidence|null){
 if(w.kind==="issue"&&w.number===18&&assignment){
  if(assignment.status?.startsWith("FAILED")||/FAILED/i.test(assignment.latestOutcome||""))return "FAILED ASSIGNMENT · DO NOT RESUME BLINDLY";
  if(assignment.status)return assignment.status;
 }
 return w.kind==="pr"?(w.draft?"DRAFT · NOT INTEGRATED":"OPEN PR · NOT VERIFIED LIVE"):"OPEN ISSUE · NOT COMPLETE";
}

function taskHandoff(p:Project,w:Work,assignment?:JulesAssignmentEvidence|null,jobs?:Job[],execution?:Execution){
 const sourceOK=p.accessible&&!p.stale&&!p.limited;
 const isJules18=p.slug==="Command-Center-"&&w.kind==="issue"&&w.number===18;
 const julesFailed=isJules18&&Boolean(assignment&&(assignment.status?.startsWith("FAILED")||/FAILED/i.test(assignment.latestOutcome||"")||assignment.error));
 const jobMatch=p.slug==="cartilla-de-gretel"?jobs?.find(j=>j.id===w.number):undefined;
 const agentLine=isJules18
  ?(assignment&&!assignment.stale&&!assignment.error
    ?`${assignment.assignedAgent||"Jules"} · Assigned by ${assignment.assignedBy||"UNKNOWN"} · Latest outcome: ${assignment.latestOutcome||"UNKNOWN"} · Live session: UNKNOWN`
    :"Jules assignment status UNKNOWN / STALE — inspect GitHub issue #18 before acting.")
  :p.slug==="cartilla-de-gretel"&&w.number===1073
    ?"Codex (existing Gretel Tutor branch owner per #877) · Live session UNKNOWN without provider telemetry"
    :"UNKNOWN unless current authenticated provider evidence confirms assignment.";
 const proofLine=jobMatch?.proofUrl||"None linked in current snapshot — verify PR/issue comments directly.";
 return [
  (julesFailed?"FAILED ASSIGNMENT (INSPECT ONLY — DO NOT DISPATCH DUPLICATE) — ":"EXISTING TASK — ")+w.title,
  "PROJECT: "+p.name+" ("+p.url+")",
  "SOURCE RECORD: "+w.url,
  "GITHUB STATUS: "+workStatus(w,isJules18?assignment:null),
  "LAST SOURCE UPDATE: "+(w.updatedAt||"UNKNOWN"),
  "PROJECT DATA FRESHNESS: "+(sourceOK?"Cached GitHub snapshot observed "+fmt(p.fetchedAt)+" (not freshly verified live execution)":"STALE OR PARTIAL — INSPECT ONLY"),
  "AGENT / OWNER: "+agentLine,
  "LINKED EVIDENCE: "+proofLine,
  "DEPLOYMENT STATE: Build age & deployed commit UNKNOWN without live deployment telemetry.",
  ...(p.slug==="cartilla-de-gretel"?["CARTILLA AUTHORITY (#877): "+(execution?.nextStep||"Inspect #877 before any product work.")]:[]),
  "",
  "MISSION: "+(julesFailed?"Do NOT suggest or start this failed Jules task as active work. Inspect the existing task evidence only; do not resume or dispatch from this Board.":"Continue this exact existing work without starting a duplicate agent or branch."),
  "1. Inspect the latest repository main, existing issue/PR head, AGENTS.md, task owner, linked proof, and any assigned agent session.",
  "2. Confirm the latest owner-authorized scope. For Cartilla, issue #877 governs work; other product lanes must not be silently resumed.",
  "3. If authorized, make only the smallest targeted repair needed. Do not duplicate work or initiate unrelated tests, services or agents.",
  "4. Prove actual behavior with focused tests and phone/browser evidence as applicable, retaining previous valid results.",
  "5. Respect independent review, merge protections and separate production permission. Never infer a provider is running from a GitHub label.",
  "RETURN: Owner | Latest SHA | Change | Proof | Open blocker | Single next executable action."
 ].join("\n");
}

function buildConnectedNodes(activeNode:Node,slice:Work[],jobs:Job[],approvals:Approval[],execution:Execution|undefined,assignment:JulesAssignmentEvidence|null|undefined):Node[]{
 const p=activeNode.project;
 const base=activeNode.angle;
 const nodes:Node[]=[];
 slice.forEach((work,i)=>{
  const spread=slice.length===1?0:(i/(slice.length-1)-.5)*1.28;
  const angle=base+spread;
  const wid=workKey(p,work);
  nodes.push({id:wid,project:p,work,kind:"work",angle,parentId:activeNode.id,x:CX+Math.cos(angle)*WORK_RADIUS,y:CY+Math.sin(angle)*WORK_RADIUS});
 });
 const subItems:{kind:NodeKind;id:string;title:string;subtitle:string;status:string;url:string;freshness:string;parentId:string}[]=[];
 if(p.slug==="Command-Center-"){
  const w18=slice.find(w=>w.kind==="issue"&&w.number===18);
  const parentId=w18?workKey(p,w18):activeNode.id;
  const aFresh=assignment?.fetchedAt&&!assignment.stale?"Observed "+fmt(assignment.fetchedAt):"STALE / UNKNOWN";
  subItems.push({
   kind:"assignment",id:p.slug+"/assignment/jules-18",parentId,
   title:assignment?.assignedAgent?`Agent: ${assignment.assignedAgent}`:"Agent Assignment #18",
   subtitle:assignment?.latestOutcome||"Jules outcome UNKNOWN",
   status:assignment?.status||"SESSION UNKNOWN",
   url:assignment?.taskUrl||assignment?.issueUrl||"https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
   freshness:aFresh
  });
  if(assignment?.pullRequest){
   subItems.push({
    kind:"evidence",id:p.slug+"/evidence/pr-"+assignment.pullRequest.number,parentId,
    title:`Linked PR #${assignment.pullRequest.number}`,
    subtitle:assignment.pullRequest.title,
    status:assignment.pullRequest.state,
    url:assignment.pullRequest.url,
    freshness:aFresh
   });
  }else{
   subItems.push({
    kind:"evidence",id:p.slug+"/evidence/issue-18",parentId,
    title:"Evidence: Issue #18 Bot Log",
    subtitle:assignment?.accepted?"Accepted by official bot; later failed":"Acceptance not verified",
    status:assignment?.latestOutcome||"NO COMPLETION PR",
    url:assignment?.latestEventUrl||"https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
    freshness:aFresh
   });
  }
  subItems.push({
   kind:"deployment",id:p.slug+"/deployment/nbo",parentId:activeNode.id,
   title:"Deployment: NBO Hub",
   subtitle:"Production commit & build age UNKNOWN",
   status:"LIVE · NOT FRESHLY VERIFIED",
   url:p.url,
   freshness:projectFreshness(p)
  });
 }else if(p.slug==="cartilla-de-gretel"){
  const tutor=slice.find(w=>w.kind==="pr"&&w.number===1073);
  const parentId=tutor?workKey(p,tutor):activeNode.id;
  subItems.push({
   kind:"assignment",id:p.slug+"/assignment/877",parentId,
   title:"Authority: Queue #877",
   subtitle:execution?.mode==="TUTOR_1073_ONLY"?"Tutor #1073 only · Codex worker":"Scope: "+(execution?.mode||"UNKNOWN"),
   status:"LIVE SESSION UNKNOWN",
   url:execution?.sourceUrl||"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
   freshness:execution?.sourceUpdatedAt?"Updated "+fmt(execution.sourceUpdatedAt):"FRESHNESS UNKNOWN"
  });
  const jobWithProof=jobs.find(j=>j.proofUrl)||jobs[0];
  subItems.push({
   kind:"evidence",id:p.slug+"/evidence/inventory",parentId,
   title:jobWithProof?.proofUrl?`Evidence: Job #${jobWithProof.id}`:"Evidence: Visual Inventory",
   subtitle:jobWithProof?.missingEvidence?.[0]||"24 lessons · 330 art slots · 22 motions",
   status:jobWithProof?.status||"INSPECTABLE ARTIFACT",
   url:jobWithProof?.proofUrl||"/art-inventory",
   freshness:projectFreshness(p)
  });
  subItems.push({
   kind:"deployment",id:p.slug+"/deployment/vercel",parentId:activeNode.id,
   title:"Deployment: Cartilla Live",
   subtitle:"https://cartilla-de-gretel.vercel.app/",
   status:"BUILD AGE UNKNOWN",
   url:"https://cartilla-de-gretel.vercel.app/",
   freshness:"HTTP status requires live check"
  });
 }else{
  const firstWork=slice[0];
  const parentId=firstWork?workKey(p,firstWork):activeNode.id;
  const labelList=firstWork?.labels?.length?firstWork.labels.join(", "):"No verified agent label";
  subItems.push({
   kind:"assignment",id:p.slug+"/assignment/state",parentId,
   title:"Agent Assignment",
   subtitle:labelList,
   status:"PROVIDER SESSION UNKNOWN",
   url:firstWork?.url||p.url,
   freshness:projectFreshness(p)
  });
  subItems.push({
   kind:"evidence",id:p.slug+"/evidence/state",parentId:activeNode.id,
   title:"Verification Evidence",
   subtitle:p.prs?`${p.prs} open PR(s) · ${p.drafts||0} draft(s)`:"No open PR artifacts loaded",
   status:p.stale||p.limited?"SOURCE STALE / PARTIAL":"SNAPSHOT ONLY · NOT VERIFIED",
   url:p.url+"/pulls",
   freshness:projectFreshness(p)
  });
  subItems.push({
   kind:"deployment",id:p.slug+"/deployment/state",parentId:activeNode.id,
   title:"Deployment Status",
   subtitle:p.slug==="client-project-starter"?"https://nbo-website.vercel.app":"No verified live URL configured",
   status:"BUILD AGE UNKNOWN",
   url:p.slug==="client-project-starter"?"https://nbo-website.vercel.app":p.url,
   freshness:"Not freshly verified"
  });
 }
 subItems.forEach((item,idx)=>{
  const spread=subItems.length===1?0:(idx/(subItems.length-1)-.5)*.78;
  const angle=base+spread;
  nodes.push({
   id:item.id,project:p,kind:item.kind,angle,parentId:item.parentId,
   title:item.title,subtitle:item.subtitle,status:item.status,url:item.url,freshness:item.freshness,
   x:CX+Math.cos(angle)*DETAIL_RADIUS,y:CY+Math.sin(angle)*DETAIL_RADIUS
  });
 });
 return nodes;
}

export default function MissionNetwork({projects,selectedProjectSlug,onSelectProject,jobs=[],approvals=[],execution,assignment}:{projects:Project[];selectedProjectSlug?:string;onSelectProject:(slug:string)=>void;jobs?:Job[];approvals?:Approval[];execution?:Execution;assignment?:JulesAssignmentEvidence|null}){
 const [expandedSlugs,setExpandedSlugs]=useState<string[]>([]);
 const [focus,setFocus]=useState("");
 const [selectedWork,setSelectedWork]=useState("");
 const [page,setPage]=useState(0);
 const [zoom,setZoom]=useState(.52);
 const [pan,setPan]=useState<Point>({x:0,y:0});
 const [copied,setCopied]=useState(false);
 const [promptOpen,setPromptOpen]=useState(false);
 const [fullscreen,setFullscreen]=useState(false);
 const drag=useRef<{id:number;x:number;y:number;pan:Point}|null>(null);

 useEffect(()=>{
  if(typeof window!=="undefined"&&window.innerWidth<640){
   setZoom(.42);
  }
 },[]);

 useEffect(()=>{
  if(selectedProjectSlug&&projects.some(p=>p.slug===selectedProjectSlug)){
   setFocus(selectedProjectSlug);
   setExpandedSlugs(prev=>prev.includes(selectedProjectSlug)?prev:[...prev,selectedProjectSlug]);
  }
 },[selectedProjectSlug,projects]);

 const selectedProject=projects.find(p=>p.slug===focus);
 const repoNodes:Node[]=useMemo(()=>projects.map((project,i)=>{
  const a=-Math.PI/2+(Math.PI*2*i/Math.max(projects.length,1));
  return {id:project.slug,x:CX+Math.cos(a)*PROJECT_RADIUS,y:CY+Math.sin(a)*PROJECT_RADIUS,kind:"project",project,index:i,angle:a};
 }),[projects]);

 const activeNode=repoNodes.find(n=>n.id===focus);
 const isExpanded=Boolean(focus&&expandedSlugs.includes(focus));
 const sourceWork=selectedProject?.items||[];
 const maxPages=Math.max(1,Math.ceil(sourceWork.length/PAGE_SIZE));
 const safePage=bounded(page,0,maxPages-1);
 const slice=sourceWork.slice(safePage*PAGE_SIZE,(safePage+1)*PAGE_SIZE);

 const childNodes:Node[]=useMemo(()=>{
  if(!activeNode||!isExpanded)return [];
  return buildConnectedNodes(activeNode,slice,jobs,approvals,execution,assignment);
 },[activeNode,isExpanded,slice,jobs,approvals,execution,assignment]);

 const workNodes=childNodes.filter(n=>n.kind==="work");
 const detailNodes=childNodes.filter(n=>n.kind!=="work");
 const nodeById=useMemo(()=>new Map<string,Node>([...repoNodes,...childNodes].map(n=>[n.id,n])),[repoNodes,childNodes]);
 const chosen=childNodes.find(n=>n.id===selectedWork);
 const prompt=chosen?.work?taskHandoff(chosen.project,chosen.work,assignment,jobs,execution):"";

 function expand(n:Node){
  const isClosing=focus===n.id&&expandedSlugs.includes(n.id);
  onSelectProject(n.id);
  setPage(0);setSelectedWork("");setCopied(false);setPromptOpen(false);
  setFocus(isClosing?"":n.id);
  if(isClosing){
   setExpandedSlugs(prev=>prev.filter(s=>s!==n.id));
   setPan({x:0,y:0});
  }else{
   setExpandedSlugs(prev=>prev.includes(n.id)?prev:[...prev,n.id]);
   setPan({x:-Math.cos(n.angle)*155,y:-Math.sin(n.angle)*125});
  }
 }

 function collapseAll(){
  setFocus("");
  setExpandedSlugs([]);
  setSelectedWork("");
  setCopied(false);
  setPromptOpen(false);
  setPan({x:0,y:0});
 }

 function switchPage(next:number){setPage(next);setSelectedWork("");setCopied(false);setPromptOpen(false)}
 function startPan(e:React.PointerEvent<HTMLDivElement>){
  if((e.target as HTMLElement).closest("button,textarea,a"))return;
  drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,pan};
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function movePan(e:React.PointerEvent<HTMLDivElement>){
  const d=drag.current;
  if(d?.id===e.pointerId)setPan({x:d.pan.x+e.clientX-d.x,y:d.pan.y+e.clientY-d.y});
 }
 function stopPan(e:React.PointerEvent<HTMLDivElement>){if(drag.current?.id===e.pointerId)drag.current=null}
 async function copy(){
  if(!prompt)return;
  try{await navigator.clipboard.writeText(prompt);setCopied(true);setPromptOpen(false)}
  catch{setCopied(false);setPromptOpen(true)}
 }

 return <div className={"network-explorer"+(fullscreen?" network-fullscreen":"")} aria-label="Expandable project, tasks, pull requests, assignments, evidence, and deployment network">
  <div className="network-toolbar">
   <div>
    <strong>LIVE PROJECT NETWORK</strong>
    <span>{projects.length} repositories · {isExpanded&&selectedProject?`${sourceWork.length} issue/PR records + assignment, evidence & deployment nodes for ${selectedProject.name}`:"Select a project node to expand its tasks, PRs, assignments, evidence & deployments"}</span>
   </div>
   <div className="network-buttons">
    {isExpanded&&<button type="button" onClick={collapseAll}>Collapse project</button>}
    <button type="button" onClick={()=>setZoom(z=>bounded(+(z-.12).toFixed(2),.35,1.65))} aria-label="Zoom out">−</button>
    <span aria-live="polite">{Math.round(zoom*100)}%</span>
    <button type="button" onClick={()=>setZoom(z=>bounded(+(z+.12).toFixed(2),.35,1.65))} aria-label="Zoom in">+</button>
    <button type="button" onClick={()=>{setPan({x:0,y:0});setZoom(.52)}}>Fit</button>
    <button type="button" onClick={()=>setFullscreen(v=>!v)} aria-pressed={fullscreen}>{fullscreen?"Close full map":"Expand map"}</button>
   </div>
  </div>
  <div className="network-viewport" onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} role="region" aria-label="Pan the graph with a finger or mouse. Use zoom buttons to enlarge. Select project nodes to open related tasks, PRs, assignments, evidence, and deployments.">
   <div className="network-stage" style={{transform:"translate(-50%, -50%) translate("+pan.x+"px, "+pan.y+"px) scale("+zoom+")"}}>
    <svg className="network-edges" viewBox={"0 0 "+CW+" "+CH} aria-hidden="true">
     <defs><linearGradient id="network-edge-color" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#65c5e9"/><stop offset="1" stopColor="#b49afc"/></linearGradient></defs>
     {repoNodes.map(n=><path key={n.id} d={path({x:CX,y:CY},n)} className={focus===n.id&&isExpanded?"network-edge-active":"network-edge"} stroke={focus===n.id&&isExpanded?"url(#network-edge-color)":"#56647e"}/>)}
     {childNodes.map(n=>{
      const parent=nodeById.get(n.parentId||"")||activeNode!;
      return <path key={n.id} d={path(parent,n)} className={selectedWork===n.id?"network-edge-active":"network-edge-task"} stroke={selectedWork===n.id?"#8aedd7":n.kind==="work"?"#6194b2":"#8b7ec8"}/>;
     })}
    </svg>
    <div className="network-hub" style={{left:CX,top:CY}}><b>NBO</b><small>OPERATIONS HUB</small><span>{projects.length} connected repos</span></div>
    {repoNodes.map(n=>{
     const expanded=focus===n.id&&isExpanded;
     const {project}=n;
     const freshLabel=project.stale||project.limited?"STALE / PARTIAL":project.fetchedAt?"Cached snapshot":"Freshness unknown";
     return <button type="button" key={n.id} style={{left:n.x,top:n.y}} className={"network-project"+(expanded?" expanded":"")+(project.stale||project.limited?" stale":"")} onClick={()=>expand(n)} aria-expanded={expanded} aria-label={(expanded?"Collapse ":"Expand ")+project.name+" tasks"}>
      <span className="network-project-top"><i aria-hidden="true">{expanded?"−":"+"}</i><small>{freshLabel}</small></span>
      <strong>{project.name}</strong>
      <span>{project.stale||project.limited?"Source partial · inspect only":(project.prs??"—")+" PRs · "+(project.issues??"—")+" issues"}</span>
     </button>;
    })}
    {workNodes.map(n=>{
     const item=n.work!;
     const isFailedJules=n.project.slug==="Command-Center-"&&item.kind==="issue"&&item.number===18&&Boolean(assignment&&(assignment.status?.startsWith("FAILED")||/FAILED/i.test(assignment.latestOutcome||"")));
     return <button type="button" key={n.id} style={{left:n.x,top:n.y}} className={"network-work"+(selectedWork===n.id?" chosen":"")+(item.draft?" draft":"")+(isFailedJules?" failed":"")} aria-pressed={selectedWork===n.id} onClick={()=>{setSelectedWork(n.id);setCopied(false);setPromptOpen(false)}}>
      <small>{item.kind==="pr"?"PULL REQUEST":"ISSUE"} #{item.number}{item.draft?" · DRAFT":""}{isFailedJules?" · FAILED":""}</small>
      <strong title={item.title}>{item.title}</strong>
      <span>{isFailedJules?"Failed assignment · do not dispatch":item.kind==="pr"?"Review code / proof":"Open work · not complete"}</span>
     </button>;
    })}
    {detailNodes.map(n=>{
     return <button type="button" key={n.id} style={{left:n.x,top:n.y}} className={"network-work network-detail network-"+n.kind+(selectedWork===n.id?" chosen":"")} aria-pressed={selectedWork===n.id} onClick={()=>{setSelectedWork(n.id);setCopied(false);setPromptOpen(false)}}>
      <small>{n.kind.toUpperCase()} · {n.status}</small>
      <strong title={n.title}>{n.title}</strong>
      <span>{n.subtitle}</span>
     </button>;
    })}
   </div>
  </div>
  <div className="network-below">
   <div className="network-legend">
    <span><i className="network-key repo"/> Projects</span>
    <span><i className="network-key task"/> Issues & PRs</span>
    <span><i className="network-key draft"/> Draft / failed</span>
    <span><i className="network-key meta"/> Assignment · Evidence · Deployment</span>
   </div>
   <p>Tap a project to expand or collapse its actual issues, PRs, agent assignments, verification evidence, and deployment status. Data reflects cached GitHub snapshots unless live-verified.</p>
  </div>
  {selectedProject&&isExpanded&&<div className="network-project-inspector">
   <div>
    <small>EXPANDED PROJECT · {projectFreshness(selectedProject)}</small>
    <strong>{selectedProject.name}</strong>
    <p>{selectedProject.stale||selectedProject.limited?"Partial/stale GitHub data; do not treat cached or unavailable information as freshly verified.":`${sourceWork.length} loaded issue/PR records plus connected assignment, evidence, and deployment nodes. Cached snapshot from ${fmt(selectedProject.fetchedAt)} — not a live agent execution stream.`}</p>
   </div>
   {maxPages>1&&<div className="network-pagination"><button type="button" disabled={safePage===0} onClick={()=>switchPage(safePage-1)}>Previous tasks</button><span>{safePage*PAGE_SIZE+1}–{Math.min((safePage+1)*PAGE_SIZE,sourceWork.length)} of {sourceWork.length}</span><button type="button" disabled={safePage===maxPages-1} onClick={()=>switchPage(safePage+1)}>More tasks →</button></div>}
   {!sourceWork.length&&<p>No open issue/PR records are loaded for this project; this does not prove the repository is finished.</p>}
  </div>}
  {chosen?.work&&<div className="network-work-inspector" aria-live="polite">
   <div>
    <small>SELECTED TASK · {workStatus(chosen.work,chosen.project.slug==="Command-Center-"&&chosen.work.number===18?assignment:null)}</small>
    <h3>{chosen.work.title}</h3>
    <p>{chosen.project.name} · Last source update {fmt(chosen.work.updatedAt)} · {projectFreshness(chosen.project)} · Agent activity UNKNOWN without provider evidence.</p>
   </div>
   <div className="network-task-actions">
    <button type="button" className="next-mission-copy" onClick={()=>void copy()}>{copied?"Copied — ready to paste":"Copy task handoff"}</button>
    <button type="button" onClick={()=>setPromptOpen(v=>!v)}>{promptOpen?"Hide full handoff":"Read full handoff"}</button>
    <a href={chosen.work.url} target="_blank" rel="noopener noreferrer">Evidence source</a>
   </div>
   {promptOpen&&<textarea aria-label="Full next agent handoff" readOnly value={prompt} rows={12}/>}
  </div>}
  {chosen&&!chosen.work&&<div className="network-work-inspector" aria-live="polite">
   <div>
    <small>CONNECTED {chosen.kind.toUpperCase()} NODE · {chosen.status}</small>
    <h3>{chosen.title}</h3>
    <p>{chosen.project.name} · {chosen.subtitle} · Freshness: {chosen.freshness}. Cached or unverified state is never reported as freshly verified live execution.</p>
   </div>
   <div className="network-task-actions">
    {chosen.url&&<a href={chosen.url} target="_blank" rel="noopener noreferrer">Inspect source record ↗</a>}
   </div>
  </div>}
 </div>;
}
