"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import type {Project,Work} from "./hub-data";
import {commitKind,priorityForWork,groupForWork} from "@/lib/github-panel-logic";
import {External} from "./hub-ui";

type Commit={sha:string;title:string;message:string;date:string;url:string;author:string;category:string;declaredAgent:string|null};
type History={repo:string;items:Commit[];fetchedAt?:string;stale:boolean;error?:string|null};
type FileInfo={name:string;status:string;additions:number;deletions:number};
type Detail={sha:string;files:FileInfo[];truncated:boolean};
type Filter="all"|"issue"|"pr";
const CREDIT=["ChatGPT","Antigravity","Z.ai","Claude","Me"];
const DAY_MS=86400000;
function formatDate(value?:string){if(!value)return "Unavailable";const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Unavailable";}
function formatShort(value?:string){if(!value)return "—";const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—";}
function creditKey(slug:string){return "nbo-github-credit:"+slug;}
function score(w:Work){return priorityForWork(w)}
function priorityName(w:Work){return score(w)===3?"High priority":score(w)===2?"Needs review":w.kind==="pr"?"Open PR":"Open issue"}
function sortWork(a:Work,b:Work){return score(b)-score(a)||b.updatedAt.localeCompare(a.updatedAt)}
function Trend({commits}:{commits:Commit[]}){
 const series=useMemo(()=>{
  const dates=commits.map(c=>Date.parse(c.date)).filter(Number.isFinite);
  if(!dates.length)return [];
  const anchor=new Date(Math.max(...dates));anchor.setUTCHours(0,0,0,0);
  const end=anchor.getTime();
  const map=new Map<string,number>();
  for(const c of commits){const date=new Date(c.date);if(!Number.isFinite(date.getTime()))continue;const key=date.toISOString().slice(0,10);map.set(key,(map.get(key)||0)+1)}
  return Array.from({length:14},(_,i)=>{
   const date=new Date(end-(13-i)*DAY_MS);
   const day=date.toISOString().slice(0,10);
   return {day,value:map.get(day)||0};
  });
 },[commits]);
 if(!series.length)return <div className="gh-empty">No commit history available for the selected repository.</div>;
 const max=Math.max(1,...series.map(p=>p.value));
 const height=216,width=620,left=38,right=15,top=20,bottom=34;
 const innerH=height-top-bottom,innerW=width-left-right;
 const x=(i:number)=>left+i*innerW/13;
 const y=(value:number)=>top+innerH-(value/max)*innerH;
 const path=series.map((point,i)=>(i===0?"M":"L")+x(i).toFixed(2)+" "+y(point.value).toFixed(2)).join(" ");
 const sum=series.reduce((total,p)=>total+p.value,0);
 const ticks=[0,0.5,1];
 return <div className="gh-trend">
  <div className="gh-trend-meta"><span className="gh-trend-total">{sum.toLocaleString()}</span><span>commits in the displayed 14-day sample</span></div>
  <svg className="gh-line" role="img" aria-label={"Commit activity: "+sum+" commits across 14 days in the last 100 returned commits"} viewBox={"0 0 "+width+" "+height} preserveAspectRatio="xMidYMid meet">
   {ticks.map(t=><g key={t}><line className="gh-gridline" x1={left} x2={width-right} y1={y(t*max)} y2={y(t*max)}/><text className="gh-axis" x={left-12} y={y(t*max)+4} textAnchor="end">{Number((t*max).toFixed(1))}</text></g>)}
   <path className="gh-line-stroke" d={path} fill="none" vectorEffect="non-scaling-stroke"/>
   {series.map((p,i)=><circle key={p.day} className="gh-line-point" cx={x(i)} cy={y(p.value)} r={i===13?4.7:2.3}><title>{formatDate(p.day)+": "+p.value+" sampled commits"}</title></circle>)}
   <text className="gh-axis" x={left} y={height-9}>{formatShort(series[0].day)}</text>
   <text className="gh-axis" x={width-right} y={height-9} textAnchor="end">{formatShort(series[13].day)}</text>
  </svg>
  <p className="gh-fine">Actual GitHub timestamps · latest 100 commits maximum. Earlier commits may be outside the sample.</p>
 </div>;
}
export default function GithubPanel({projects}:{projects:Project[]}){
 const [repo,setRepo]=useState("");
 const [history,setHistory]=useState<History|null>(null);
 const [selected,setSelected]=useState<Project|null>(null);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const [filter,setFilter]=useState<Filter>("all");
 const [expanded,setExpanded]=useState(false);
 const [credits,setCredits]=useState<Record<string,string>>({});
 const [detail,setDetail]=useState<Detail|null>(null);
 const [detailPending,setDetailPending]=useState(false);
 const [detailError,setDetailError]=useState("");
 const [showAllHistory,setShowAllHistory]=useState(false);
 const generation=useRef(0);
 const fileGeneration=useRef(0);
 useEffect(()=>{if(!repo&&projects.length)setRepo(projects[0].slug)},[repo,projects]);
 useEffect(()=>{if(!repo)return;try{const raw=JSON.parse(localStorage.getItem(creditKey(repo))||"{}");setCredits(raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{})}catch{setCredits({})}},[repo]);
 const load=useCallback(async(slug:string,signal?:AbortSignal)=>{
  const seq=++generation.current;setPending(true);setError("");
  try{
   const [hResponse,fResponse]=await Promise.all([
    fetch("/api/github-panel?repo="+encodeURIComponent(slug),{cache:"no-store",signal}),
    fetch("/api/hub?project="+encodeURIComponent(slug),{cache:"no-store",signal})
   ]);
   const [h,f]=await Promise.all([hResponse.json(),fResponse.json()]);
   if(seq!==generation.current||signal?.aborted)return;
   setHistory(hResponse.ok?h as History:null);
   setSelected(fResponse.ok?(f.projects as Project[]).find(p=>p.slug===slug)||null:null);
   const errors=[!hResponse.ok?h.error||"Commit activity unavailable":"",!fResponse.ok?"Open issues and pull requests unavailable":""].filter(Boolean);
   setError(errors.join(". "));
  }catch(e){if(seq===generation.current&&!signal?.aborted)setError(e instanceof Error?e.message:"GitHub data unavailable")}
  finally{if(seq===generation.current&&!signal?.aborted)setPending(false)}
 },[]);
 useEffect(()=>{if(!repo)return;const controller=new AbortController();setHistory(null);setSelected(null);setFilter("all");setExpanded(false);setShowAllHistory(false);setDetail(null);setDetailError("");fileGeneration.current++;void load(repo,controller.signal);return()=>{controller.abort();generation.current++;fileGeneration.current++}},[repo,load]);
 const allWork=useMemo(()=>[...(selected?.items||[])].sort(sortWork),[selected]);
 const filtered=useMemo(()=>allWork.filter(w=>filter==="all"||w.kind===filter),[allWork,filter]);
 const issues=allWork.filter(w=>w.kind==="issue");
 const flagged=issues.filter(w=>score(w)===3);
 const commits=history?.items||[];
 const visibleHistory=showAllHistory?commits:commits.slice(0,8);
 const hasFreshWork=Boolean(selected&&!selected.stale&&!selected.limited&&selected.accessible);
 const freshness=selected?.fetchedAt||history?.fetchedAt;
 const scope=projects.find(p=>p.slug===repo);
 function tag(sha:string,name:string){
  const next={...credits};if(name)next[sha]=name;else delete next[sha];
  setCredits(next);try{localStorage.setItem(creditKey(repo),JSON.stringify(next))}catch{setError("Credit cannot be saved in this browser.")}
 }
 async function showFiles(sha:string){
  if(detail?.sha===sha){setDetail(null);setDetailError("");return}
  const seq=++fileGeneration.current;setDetailPending(true);setDetail(null);setDetailError("");
  try{
   const response=await fetch("/api/github-panel?repo="+encodeURIComponent(repo)+"&sha="+encodeURIComponent(sha),{cache:"no-store"});
   const data=await response.json();
   if(seq!==fileGeneration.current)return;
   if(!response.ok)throw Error(data.error||"File details unavailable");
   setDetail(data as Detail);
  }catch(e){if(seq===fileGeneration.current)setDetailError(e instanceof Error?e.message:"File details unavailable")}
  finally{if(seq===fileGeneration.current)setDetailPending(false)}
 }
 return <div className="gh-panel">
  <section className="gh-head">
   <div className="gh-heading">
    <p className="gh-eyebrow">GITHUB INTELLIGENCE <span className="gh-head-rule"/></p>
    <h2>What&apos;s moving.<br/><span>What still needs work.</span></h2>
    <p className="gh-intro">A clear view of real repository activity and outstanding work.</p>
   </div>
   <div className="gh-controls">
    <label htmlFor="gh-repo">SELECT PROJECT</label>
    <select id="gh-repo" value={repo} onChange={e=>setRepo(e.target.value)} disabled={!projects.length}>{projects.map(p=><option value={p.slug} key={p.slug}>{p.name}</option>)}</select>
    <div className="gh-control-actions">
     <button type="button" onClick={()=>void load(repo)} disabled={pending||!repo}>↻ Refresh</button>
     {scope&&<External href={scope.url}>Open repository</External>}
    </div>
    <small>{pending?"Syncing with GitHub…":freshness?"Source: "+formatDate(freshness):"Awaiting GitHub data"}{selected?.stale||history?.stale?" · STALE":""}</small>
   </div>
  </section>
  {error&&<p role="alert" className="gh-warning">{error}</p>}
  {selected?.error&&<p role="alert" className="gh-warning">{selected.error}</p>}
  {history?.error&&<p role="alert" className="gh-warning">{history.error}</p>}
  <div className="gh-metrics" aria-label="GitHub project status">
   <div><span>OPEN ISSUES</span><strong>{hasFreshWork?selected?.issues??"—":"—"}</strong><small>{hasFreshWork?flagged.length+" marked high priority":"Status unavailable"}</small></div>
   <div><span>OPEN PULL REQUESTS</span><strong>{hasFreshWork?selected?.prs??"—":"—"}</strong><small>Proposed code changes</small></div>
   <div><span>IN DRAFT</span><strong>{hasFreshWork?selected?.drafts??"—":"—"}</strong><small>Not marked ready</small></div>
   <div><span>LATEST COMMIT</span><strong className="gh-last-date">{commits.length?formatShort(commits[0].date):"—"}</strong><small>{commits.length?commits[0].sha.slice(0,8):"Not available"}</small></div>
  </div>
  <div className="gh-main-grid">
   <section className="gh-surface gh-attention">
    <header className="gh-section-head">
     <div><p className="gh-overline">01 / PRIORITIES</p><h3>Work that needs attention</h3></div>
     <span className="gh-tally">{hasFreshWork?allWork.length:"—"} open</span>
    </header>
    <div className="gh-filters" role="group" aria-label="Filter work">
     {([["all","All work"],["issue","Issues"],["pr","Pull requests"]] as const).map(([key,label])=><button type="button" key={key} onClick={()=>{setFilter(key);setExpanded(false)}} aria-pressed={filter===key}>{label}</button>)}
    </div>
    {pending?<div className="gh-empty" role="status">Loading open work…</div>:!hasFreshWork?<div className="gh-empty">Open work is not currently verified. Refresh to retry.</div>:filtered.length===0?<div className="gh-empty">No open {filter==="all"?"work":filter==="issue"?"issues":"pull requests"} reported.</div>:
    <div className="gh-work-list">{filtered.slice(0,expanded?40:7).map(w=><article className="gh-work-item" key={w.kind+":"+w.number}>
      <div className="gh-row-main"><span className={"gh-severity "+(w.kind==="issue"&&score(w)===3?"urgent":w.draft?"draft":"ordinary")}>{w.kind==="issue"&&score(w)===3?"HIGH":w.draft?"DRAFT":w.kind==="pr"?"PR":"ISSUE"}</span>
      <div className="gh-work-copy"><External href={w.url}>{w.title}</External><p>#{w.number} <span>·</span> {groupForWork(w)==="Uncategorized work"?w.kind==="pr"?"Pull request":"Issue":groupForWork(w)} <span>·</span> {formatShort(w.updatedAt)}</p></div></div>
     </article>)}</div>}
    {hasFreshWork&&filtered.length>7&&<button className="gh-more" type="button" onClick={()=>setExpanded(x=>!x)}>{expanded?"Show fewer":("View more work ("+filtered.length+")")} <span aria-hidden="true">→</span></button>}
   </section>
   <div className="gh-right-col">
    <section className="gh-surface gh-activity">
     <header className="gh-section-head"><div><p className="gh-overline">02 / ACTIVITY</p><h3>Commit activity</h3></div><span className="gh-unit">LAST 14 DAYS IN SAMPLE</span></header>
     {pending?<div className="gh-empty">Loading history…</div>:<Trend commits={commits}/>}
    </section>
    <section className="gh-surface gh-ship">
     <header className="gh-section-head"><div><p className="gh-overline">03 / CHANGELOG</p><h3>Latest changes</h3></div></header>
     {commits.slice(0,6).map(c=><article key={c.sha} className="gh-change">
      <span className="gh-change-dot"/>
      <div><External href={c.url}>{c.title}</External><p>{commitKind(c.title)} <span>·</span> {formatShort(c.date)} <span>·</span> {c.sha.slice(0,7)}</p></div>
     </article>)}
     {!commits.length&&!pending&&<div className="gh-empty">No recent commits returned.</div>}
    </section>
   </div>
  </div>
  <section className="gh-surface gh-records">
   <header className="gh-section-head">
    <div><p className="gh-overline">04 / TRACEABILITY</p><h3>Change history &amp; AI attribution</h3><p className="gh-section-sub">Inspect what changed. Identify an AI only when a commit names it; personal labels stay on this device.</p></div>
    <span className="gh-tally">{commits.length} recent commits</span>
   </header>
   <div className="gh-record-heading"><span>COMMIT</span><span>ATTRIBUTION</span><span>CHANGED FILES</span></div>
   {visibleHistory.map(c=><article className="gh-record" key={c.sha}>
    <div className="gh-record-name"><External href={c.url}>{c.title}</External><small>{c.author} · {formatShort(c.date)} · {c.sha.slice(0,7)}</small></div>
    <label className="gh-select-credit"><span>AI attribution</span><select value={credits[c.sha]||c.declaredAgent||""} onChange={e=>tag(c.sha,e.target.value)} aria-label={"Attribution for "+c.sha.slice(0,7)}><option value="">Unknown</option>{CREDIT.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
    <button className="gh-inspect" type="button" onClick={()=>void showFiles(c.sha)} disabled={detailPending}>{detail?.sha===c.sha?"Hide files":"Inspect files"} <span aria-hidden="true">↗</span></button>
    {detail?.sha===c.sha&&<div className="gh-file-list">{detail.files.map(f=><p key={f.name}><b>{f.status}</b> {f.name}<small>+{f.additions} / −{f.deletions}</small></p>)}{detail.truncated&&<p>Showing the first 100 changed files.</p>}</div>}
   </article>)}
   {detailError&&<p className="gh-warning" role="alert">{detailError}</p>}
   {commits.length>8&&<button className="gh-more" type="button" onClick={()=>setShowAllHistory(v=>!v)}>{showAllHistory?"Show recent only":"View all "+commits.length+" available commits"} <span aria-hidden="true">→</span></button>}
   {!commits.length&&!pending&&<div className="gh-empty">History unavailable.</div>}
   <p className="gh-fine">Source: GitHub. Commit text and labels are not evidence that an application was tested or deployed. Unknown AI attribution is intentionally not guessed.</p>
  </section>
 </div>;
}
