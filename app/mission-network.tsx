"use client";
import {useMemo,useRef,useState} from "react";
import type {Project,Work} from "./hub-data";

const CW=1500,CH=1220,CX=CW/2,CY=CH/2;
const PROJECT_RADIUS=295,WORK_RADIUS=545,PAGE_SIZE=7;
type Node={id:string;x:number;y:number;kind:"project"|"work";project:Project;work?:Work;index?:number};
type Point={x:number;y:number};
const fmt=(raw?:string)=>raw&&!Number.isNaN(Date.parse(raw))?new Date(raw).toLocaleString():"Unknown";
const workKey=(p:Project,w:Work)=>p.slug+"/"+w.kind+"/"+w.number;
const bounded=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
function path(a:Point,b:Point){
 const dx=b.x-a.x,dy=b.y-a.y;
 const start={x:a.x+dx*.23,y:a.y+dy*.23},end={x:b.x-dx*.23,y:b.y-dy*.23};
 return "M "+a.x+" "+a.y+" C "+start.x+" "+start.y+" "+end.x+" "+end.y+" "+b.x+" "+b.y;
}
function workStatus(w:Work){
 return w.kind==="pr"?(w.draft?"DRAFT · NOT INTEGRATED":"OPEN PR · NOT VERIFIED LIVE"):"OPEN ISSUE · NOT COMPLETE";
}
function taskHandoff(p:Project,w:Work){
 const sourceOK=p.accessible&&!p.stale&&!p.limited;
 return [
  "EXISTING TASK — "+w.title,
  "PROJECT: "+p.name,
  "SOURCE RECORD: "+w.url,
  "GITHUB STATUS: "+workStatus(w),
  "LAST UPDATED: "+(w.updatedAt||"UNKNOWN"),
  "SOURCE FRESHNESS: "+(sourceOK?"Current GitHub snapshot as observed by NBO":"STALE OR PARTIAL — INSPECT ONLY"),
  "AGENT / OWNER: UNKNOWN unless current authenticated provider evidence confirms assignment.",
  "",
  "MISSION: Continue this exact existing work without starting a duplicate agent or branch.",
  "1. Inspect the latest repository main, existing issue/PR head, AGENTS.md, task owner, linked proof, and any assigned agent session.",
  "2. Confirm the latest owner-authorized scope. For Cartilla, issue #877 governs work; other product lanes must not be silently resumed.",
  "3. If authorized, make only the smallest targeted repair needed. Do not duplicate work or initiate unrelated tests, services or agents.",
  "4. Prove actual behavior with focused tests and phone/browser evidence as applicable, retaining previous valid results.",
  "5. Respect independent review, merge protections and separate production permission. Never infer a provider is running from a GitHub label.",
  "RETURN: Owner | Latest SHA | Change | Proof | Open blocker | Single next executable action."
 ].join("\n");
}
export default function MissionNetwork({projects,onSelectProject}:{projects:Project[];onSelectProject:(slug:string)=>void}){
 const [focus,setFocus]=useState("");
 const [selectedWork,setSelectedWork]=useState("");
 const [page,setPage]=useState(0);
 const [zoom,setZoom]=useState(.55);
 const [pan,setPan]=useState<Point>({x:0,y:0});
 const [copied,setCopied]=useState(false);
 const [promptOpen,setPromptOpen]=useState(false);
 const [fullscreen,setFullscreen]=useState(false);
 const drag=useRef<{id:number;x:number;y:number;pan:Point}|null>(null);
 const selectedProject=projects.find(p=>p.slug===focus);
 const repoNodes:Node[]=useMemo(()=>projects.map((project,i)=>{
  const a=-Math.PI/2+(Math.PI*2*i/Math.max(projects.length,1));
  return {id:project.slug,x:CX+Math.cos(a)*PROJECT_RADIUS,y:CY+Math.sin(a)*PROJECT_RADIUS,kind:"project",project,index:i};
 }),[projects]);
 const activeNode=repoNodes.find(n=>n.id===focus);
 const sourceWork=selectedProject?.items||[];
 const maxPages=Math.max(1,Math.ceil(sourceWork.length/PAGE_SIZE));
 const safePage=bounded(page,0,maxPages-1);
 const slice=sourceWork.slice(safePage*PAGE_SIZE,(safePage+1)*PAGE_SIZE);
 const workNodes:Node[]=activeNode?slice.map((work,i)=>{
  const base=-Math.PI/2+2*Math.PI*(activeNode.index||0)/Math.max(projects.length,1);
  const spread=slice.length===1?0:(i/(slice.length-1)-.5)*.96;
  const angle=base+spread;
  return {id:workKey(activeNode.project,work),project:activeNode.project,work,kind:"work",x:CX+Math.cos(angle)*WORK_RADIUS,y:CY+Math.sin(angle)*WORK_RADIUS};
 }):[];
 const chosen=workNodes.find(n=>n.id===selectedWork);
 const prompt=chosen?.work?taskHandoff(chosen.project,chosen.work):"";
 function expand(n:Node){
  const isClosing=focus===n.id;
  onSelectProject(n.id);
  setFocus(isClosing?"":n.id);setPage(0);setSelectedWork("");setCopied(false);setPromptOpen(false);
  if(!isClosing){
    setPan({x:-Math.cos(-Math.PI/2+2*Math.PI*(n.index||0)/Math.max(projects.length,1))*145,y:-Math.sin(-Math.PI/2+2*Math.PI*(n.index||0)/Math.max(projects.length,1))*115});
  }else setPan({x:0,y:0});
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
 return <div className={"network-explorer"+(fullscreen?" network-fullscreen":"")} aria-label="Expandable project, tasks, and pull request network">
  <div className="network-toolbar">
   <div><strong>LIVE PROJECT NETWORK</strong><span>{projects.length} repositories · {sourceWork.length&&selectedProject?sourceWork.length+" loaded records for "+selectedProject.name:"Select a project to expand its tasks"}</span></div>
   <div className="network-buttons">
    <button type="button" onClick={()=>setZoom(z=>bounded(+(z-.12).toFixed(2),.35,1.65))} aria-label="Zoom out">−</button>
    <span aria-live="polite">{Math.round(zoom*100)}%</span>
    <button type="button" onClick={()=>setZoom(z=>bounded(+(z+.12).toFixed(2),.35,1.65))} aria-label="Zoom in">+</button>
    <button type="button" onClick={()=>{setPan({x:0,y:0});setZoom(.55)}}>Fit</button>
    <button type="button" onClick={()=>setFullscreen(v=>!v)} aria-pressed={fullscreen}>{fullscreen?"Close full map":"Expand map"}</button>
   </div>
  </div>
  <div className="network-viewport" onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} role="region" aria-label="Pan the graph with a finger or mouse. Use zoom buttons to enlarge. Select project nodes to open related tasks.">
   <div className="network-stage" style={{transform:"translate(-50%, -50%) translate("+pan.x+"px, "+pan.y+"px) scale("+zoom+")"}}>
    <svg className="network-edges" viewBox={"0 0 "+CW+" "+CH} aria-hidden="true">
     <defs><linearGradient id="network-edge-color" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#65c5e9"/><stop offset="1" stopColor="#b49afc"/></linearGradient></defs>
     {repoNodes.map(n=><path key={n.id} d={path({x:CX,y:CY},n)} className={focus===n.id?"network-edge-active":"network-edge"} stroke={focus===n.id?"url(#network-edge-color)":"#56647e"}/>)}
     {workNodes.map(n=><path key={n.id} d={path(activeNode!,n)} className={selectedWork===n.id?"network-edge-active":"network-edge-task"} stroke={selectedWork===n.id?"#8aedd7":"#6194b2"}/>)}
    </svg>
    <div className="network-hub" style={{left:CX,top:CY}}><b>NBO</b><small>OPERATIONS HUB</small><span>{projects.length} connected repos</span></div>
    {repoNodes.map(n=>{
     const expanded=focus===n.id;
     const {project}=n;
     return <button type="button" key={n.id} style={{left:n.x,top:n.y}} className={"network-project"+(expanded?" expanded":"")} onClick={()=>expand(n)} aria-expanded={expanded} aria-label={(expanded?"Collapse ":"Expand ")+project.name+" tasks"}>
      <span className="network-project-top"><i aria-hidden="true">{expanded?"−":"+"}</i><small>PROJECT</small></span>
      <strong>{project.name}</strong>
      <span>{project.stale||project.limited?"Source partial":(project.prs??"—")+" PRs · "+(project.issues??"—")+" issues"}</span>
     </button>;
    })}
    {workNodes.map(n=>{
     const item=n.work!;
     return <button type="button" key={n.id} style={{left:n.x,top:n.y}} className={"network-work"+(selectedWork===n.id?" chosen":"")+(item.draft?" draft":"")} aria-pressed={selectedWork===n.id} onClick={()=>{setSelectedWork(n.id);setCopied(false);setPromptOpen(false)}}>
      <small>{item.kind==="pr"?"PULL REQUEST":"ISSUE"} #{item.number}{item.draft?" · DRAFT":""}</small>
      <strong title={item.title}>{item.title}</strong>
      <span>{item.kind==="pr"?"Review code / proof":"Open work · not complete"}</span>
     </button>;
    })}
   </div>
  </div>
  <div className="network-below">
   <div className="network-legend"><span><i className="network-key repo"/> Projects</span><span><i className="network-key task"/> Real GitHub tasks</span><span><i className="network-key draft"/> Draft / not finished</span></div>
   <p>Tap a project to unfold its actual issues and pull requests. Tap a task for details and a copy-ready handoff. Drag to pan; zoom to explore. No work is dispatched by opening nodes.</p>
  </div>
  {selectedProject&&<div className="network-project-inspector">
   <div><small>EXPANDED PROJECT</small><strong>{selectedProject.name}</strong><p>{selectedProject.stale||selectedProject.limited?"Partial/stale GitHub data; do not assume missing tasks are completed.":sourceWork.length+" currently loaded issue/PR records. Counts may include additional records not loaded in this view."}</p></div>
   {maxPages>1&&<div className="network-pagination"><button type="button" disabled={safePage===0} onClick={()=>switchPage(safePage-1)}>Previous tasks</button><span>{safePage*PAGE_SIZE+1}–{Math.min((safePage+1)*PAGE_SIZE,sourceWork.length)} of {sourceWork.length}</span><button type="button" disabled={safePage===maxPages-1} onClick={()=>switchPage(safePage+1)}>More tasks →</button></div>}
   {!sourceWork.length&&<p>No open task records are loaded for this project; this does not prove the repository is finished.</p>}
  </div>}
  {chosen?.work&&<div className="network-work-inspector" aria-live="polite">
   <div><small>SELECTED TASK · {workStatus(chosen.work)}</small><h3>{chosen.work.title}</h3><p>{chosen.project.name} · Last source update {fmt(chosen.work.updatedAt)} · Agent activity UNKNOWN without provider evidence.</p></div>
   <div className="network-task-actions">
    <button type="button" className="next-mission-copy" onClick={()=>void copy()}>{copied?"Copied — ready to paste":"Copy task handoff"}</button>
    <button type="button" onClick={()=>setPromptOpen(v=>!v)}>{promptOpen?"Hide full handoff":"Read full handoff"}</button>
    <a href={chosen.work.url} target="_blank" rel="noopener noreferrer">Evidence source</a>
   </div>
   {promptOpen&&<textarea aria-label="Full next agent handoff" readOnly value={prompt} rows={12}/>}
  </div>}
 </div>;
}
