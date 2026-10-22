"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import type {Project,Work} from "./hub-data";
import {commitKind,declaredAI,groupForWork,priorityForWork} from "@/lib/github-panel-logic";
import {External} from "./hub-ui";

type Commit={sha:string;title:string;message:string;date:string;url:string;author:string;category:string;declaredAgent:string|null};
type Frame={day:string;count:number;sha:string;title:string};
type History={repo:string;items:Commit[];timeline:Frame[];fetchedAt?:string;stale:boolean;error?:string|null};
type FileInfo={name:string;status:string;additions:number;deletions:number};
type Detail={sha:string;files:FileInfo[];truncated:boolean;error?:string};
type View="Changelog"|"Still needed"|"Health"|"Time-lapse"|"AI attribution";
const VIEWS:View[]=["Changelog","Still needed","Health","Time-lapse","AI attribution"];
const CREDIT=["ChatGPT","Antigravity","Z.ai","Claude","Me"];
function readableDate(date:string){const parsed=new Date(date);return Number.isFinite(parsed.getTime())?parsed.toLocaleString():"Unknown";}
function creditKey(slug:string){return "nbo-github-credit:"+slug;}
function priorityLabel(w:Work){const score=priorityForWork(w);return score===3?"High":score===2?"Review":"Normal";}

export default function GithubPanel({projects}:{projects:Project[]}){
 const [repo,setRepo]=useState("");
 const [view,setView]=useState<View>("Changelog");
 const [history,setHistory]=useState<History|null>(null);
 const [selected,setSelected]=useState<Project|null>(null);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const [credits,setCredits]=useState<Record<string,string>>({});
 const [detail,setDetail]=useState<Detail|null>(null);
 const [detailError,setDetailError]=useState("");
 const [detailPending,setDetailPending]=useState(false);
 const [frame,setFrame]=useState(0);
 const playing=useRef<ReturnType<typeof setInterval>|null>(null);
 const generation=useRef(0);

 useEffect(()=>{if(!repo&&projects.length)setRepo(projects[0].slug)},[repo,projects]);
 useEffect(()=>{if(!repo)return;try{setCredits(JSON.parse(localStorage.getItem(creditKey(repo))||"{}"))}catch{setCredits({})}},[repo]);
 const load=useCallback(async(slug:string,signal?:AbortSignal)=>{
  const seq=++generation.current;setPending(true);setError("");setHistory(null);setSelected(null);
  try{
   const responses=await Promise.all([
    fetch("/api/github-panel?repo="+encodeURIComponent(slug),{cache:"no-store",signal}),
    fetch("/api/hub?project="+encodeURIComponent(slug),{cache:"no-store",signal})
   ]);
   const [h,f]=await Promise.all(responses.map(x=>x.json()));
   if(seq!==generation.current||signal?.aborted)return;
   if(responses[0].ok)setHistory(h as History);
   if(responses[1].ok)setSelected((f.projects as Project[]).find(p=>p.slug===slug)||null);
   const errors=[!responses[0].ok?(h.error||"Commit history unavailable"):"",!responses[1].ok?"Open work unavailable":""].filter(Boolean);
   setError(errors.join("; "));
  }catch(e){if(seq===generation.current&&!signal?.aborted)setError(e instanceof Error?e.message:"GitHub unavailable")}
  finally{if(seq===generation.current&&!signal?.aborted)setPending(false)}
 },[]);
 useEffect(()=>{if(!repo)return;const controller=new AbortController();setDetail(null);setDetailError("");setFrame(0);void load(repo,controller.signal);return()=>{controller.abort();generation.current++}},[repo,load]);
 useEffect(()=>()=>{if(playing.current)clearInterval(playing.current)},[]);
 const work=useMemo(()=>[...(selected?.items||[])].sort((a,b)=>{
  const diff=priorityForWork(b)-priorityForWork(a);return diff||b.updatedAt.localeCompare(a.updatedAt);
 }),[selected]);
 const groups=useMemo(()=>{
  const map=new Map<string,Work[]>();
  for(const w of work){const name=groupForWork(w);map.set(name,[...(map.get(name)||[]),w])}
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
 },[work]);
 const commits=history?.items||[];
 const frames=history?.timeline||[];
 const index=Math.max(0,Math.min(frame,Math.max(0,frames.length-1)));
 const days=useMemo(()=>{
  const map=new Map<string,Commit[]>();
  for(const c of commits){const d=c.date.slice(0,10);map.set(d,[...(map.get(d)||[]),c])}
  return Array.from(map.entries());
 },[commits]);
 function tag(sha:string,name:string){
  const next={...credits};if(name)next[sha]=name;else delete next[sha];
  setCredits(next);try{localStorage.setItem(creditKey(repo),JSON.stringify(next))}catch{setError("Could not save the tag on this device.")}
 }
 async function showFiles(sha:string){
  if(detail?.sha===sha){setDetail(null);return}
  setDetailPending(true);setDetail(null);setDetailError("");
  try{
   const response=await fetch("/api/github-panel?repo="+encodeURIComponent(repo)+"&sha="+encodeURIComponent(sha),{cache:"no-store"});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||"Files unavailable");
   setDetail(data as Detail);
  }catch(e){setDetailError(e instanceof Error?e.message:"Files unavailable")}
  finally{setDetailPending(false)}
 }
 function replay(){
  if(playing.current){clearInterval(playing.current);playing.current=null}
  if(!frames.length)return;
  setFrame(0);let next=0;
  playing.current=setInterval(()=>{
   if(next>=frames.length-1){if(playing.current)clearInterval(playing.current);playing.current=null;return}
   next++;setFrame(next);
  },350);
 }
 const evidence=selected?.fetchedAt||history?.fetchedAt||"";
 const stale=selected?.stale||history?.stale;
 return <div className="gh-panel">
  <section className="panel">
   <div className="panel-head"><div><h2>Live GitHub workspace</h2><p>Public repositories · read-only · no CLI, additional login or API key</p></div>
    <button className="btn secondary" disabled={pending||!repo} onClick={()=>void load(repo)}>Refresh</button></div>
   <div className="gh-toolbar"><label htmlFor="gh-repo">Project</label>
    <select id="gh-repo" value={repo} onChange={e=>setRepo(e.target.value)}>{projects.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
    {selected&&<External href={selected.url}>Open GitHub</External>}
   </div>
   <p className="small muted">Source updated: {evidence?readableDate(evidence):"Not available"}{stale?" · STALE":""}. Commit activity shows at most the latest 100 commits; open-work data comes from the existing Hub feed.</p>
   {error&&<p role="alert" className="warning">{error}</p>}
   {selected?.error&&<p className="warning">{selected.error}</p>}
   {history?.error&&<p className="warning">{history.error}</p>}
  </section>
  <nav className="gh-tabs" aria-label="GitHub views">{VIEWS.map(name=><button key={name} aria-pressed={view===name} className={view===name?"active":""} onClick={()=>{setView(name);if(playing.current){clearInterval(playing.current);playing.current=null}}}>{name}</button>)}</nav>
  {pending&&<p className="panel" role="status">Reading your GitHub project…</p>}
  {!pending&&view==="Changelog"&&<section className="panel"><h2>Daily changes</h2>
   <p className="small muted">Commit descriptions are author claims, not proof a feature was fixed or deployed. Work in progress means an open GitHub PR, not unsaved edits on another machine.</p>
   <div className="gh-counters"><span><b>{selected?.issues??"—"}</b> open issues</span><span><b>{selected?.prs??"—"}</b> open PRs</span><span><b>{selected?.drafts??"—"}</b> draft PRs</span></div>
   {days.map(([day,items])=><div key={day} className="gh-day"><h3>{day} · {items.length} commit{items.length===1?"":"s"}</h3>{items.map(c=><article key={c.sha} className="gh-row"><span className="gh-mark">{commitKind(c.title)}</span><External href={c.url}>{c.title}</External><small>{c.sha.slice(0,7)} · {c.author}</small></article>)}</div>)}
   {!commits.length&&<p className="muted">{history?"No commits returned.":"Commit history unavailable."}</p>}
  </section>}
  {!pending&&view==="Still needed"&&<section className="panel"><h2>Still needed</h2><p className="small muted">Prioritized open GitHub issues and PRs, not inferred from commit wording. Repository code TODOs are not scanned.</p>
   {work.map(w=><article key={w.kind+":"+w.number} className="gh-work"><span className={"gh-priority gh-p"+priorityForWork(w)}>{priorityLabel(w)}</span>
    <span className="gh-mark">{w.kind==="pr"?"Open PR":"Open issue"} #{w.number}</span><External href={w.url}>{w.title}</External>
    <small>{w.labels.join(", ")||"No area label"} · Updated {readableDate(w.updatedAt)}</small></article>)}
   {!work.length&&<p className="muted">{selected?.stale||!selected?"Open-work list unavailable or stale.":"No open issues or PRs were reported."}</p>}
  </section>}
  {!pending&&view==="Health"&&<section className="panel"><h2>Evidence-based health lights</h2>
   <p className="small muted">Red: explicitly labeled bug, security, critical or urgent issue. Yellow: other open work. Green: no open work reported. None of these verify a running app. Feature names appear only when a GitHub label identifies them.</p>
   {!selected||selected.stale?<p className="warning">Health unknown: current GitHub work data unavailable or stale.</p>:groups.length?groups.map(([area,items])=>{
    const high=items.some(w=>w.kind==="issue"&&priorityForWork(w)===3);
    return <article key={area} className="gh-health"><span className={"gh-light "+(high?"red":"yellow")} aria-label={high?"Red":"Yellow"}/><div><b>{area}</b><small>{high?"High-priority issue reported":"Open work to review"} · {items.length} open record{items.length===1?"":"s"}</small></div></article>
   }):<article className="gh-health"><span className="gh-light green" aria-label="Green"/><div><b>No reported open work</b><small>No open issues or PRs in the latest GitHub snapshot. Functionality remains unverified.</small></div></article>}
  </section>}
  {!pending&&view==="Time-lapse"&&<section className="panel"><h2>Project history replay</h2>
   <p className="small muted">Chronological replay of the latest {commits.length} commits returned by GitHub. This is commit activity, not an animation of source files or a lifetime file count.</p>
   {frames.length?<><div className="gh-replay"><button className="btn secondary" onClick={replay}>Play</button><input type="range" min={0} max={frames.length-1} value={index} onChange={e=>{if(playing.current)clearInterval(playing.current);playing.current=null;setFrame(Number(e.target.value))}} aria-label="Replay history"/><span>{index+1} / {frames.length}</span></div>
    <div className="gh-history-chart" aria-hidden="true">{frames.map((f,i)=><span key={f.day} className={i<=index?"active":""} style={{height:String(Math.max(5,Math.round(f.count/Math.max(commits.length,1)*100)))+"%"}}/>)}</div>
    <article className="gh-day"><h3>{frames[index].day}</h3><p>{frames[index].count} commits through this day in the displayed history window.</p><p className="small muted">Latest in frame: {frames[index].title}</p></article></>:<p className="muted">No commit history available.</p>}
  </section>}
  {!pending&&view==="AI attribution"&&<section className="panel"><h2>Which AI worked on it?</h2>
   <p className="small muted">Only explicit attribution in commit messages is automatic. Unknown means there is no evidence. You can manually tag commits on this device; that is a personal label, not independently verified authorship. Open files to see the changed parts.</p>
   <div className="gh-counters"><span><b>{commits.filter(c=>Boolean(credits[c.sha]||c.declaredAgent)).length}</b> labeled commits</span><span><b>{commits.filter(c=>!credits[c.sha]&&!c.declaredAgent).length}</b> unknown</span></div>
   {commits.map(c=><article key={c.sha} className="gh-credit"><div><External href={c.url}>{c.title}</External><small>{c.sha.slice(0,7)} · Git author: {c.author}</small></div>
    <label>Credit <select aria-label={"Attribution for "+c.sha.slice(0,7)} value={credits[c.sha]||c.declaredAgent||""} onChange={e=>tag(c.sha,e.target.value)}><option value="">Unknown</option>{CREDIT.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <button className="btn secondary" disabled={detailPending} onClick={()=>void showFiles(c.sha)}>{detail?.sha===c.sha?"Close files":"Changed files"}</button>
    {detail?.sha===c.sha&&<div className="gh-files">{detail.files.map(f=><p key={f.name}>{f.status} · {f.name} <span className="small muted">(+{f.additions} / -{f.deletions})</span></p>)}{detail.truncated&&<p>First 100 files only.</p>}</div>}
   </article>)}
   {detailError&&<p role="alert" className="warning">{detailError}</p>}
   {!commits.length&&<p className="muted">No commit history available.</p>}
  </section>}
 </div>;
}
