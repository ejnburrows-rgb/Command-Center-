"use client";
import {useState} from "react";
import type {Lane,LanesFeed,LaneStatus} from "./lanes-types";
import ProofTag,{Skeleton} from "./proof-tag";
const filters=["All","Blocked","Draft","Open","Merged"] as const;
function date(iso:string){if(!iso)return "Branch activity date unavailable";const d=new Date(iso);return Number.isNaN(d.getTime())?"Time unavailable":d.toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}
function Row({lane}:{lane:Lane}){return <article className="lane-card" data-lane-status={lane.status}>
 <div className="lane-status-rail" aria-hidden="true"/>
 <div className="lane-details"><div className="lane-topline"><span className={"lane-status status-"+lane.status.toLowerCase()}>{lane.status}</span><span className="lane-updated">{date(lane.updatedAt)}</span></div>
 <h3>{lane.name}</h3><p>{lane.summary}</p><div className="lane-source"><ProofTag verified={lane.verified} href={lane.sourceUrl}/><span>{lane.sourceType==="pull request"?"GitHub pull request":lane.sourceType==="branch"?"GitHub branch":"GitHub issue"}</span></div></div>
 <a className="lane-open" href={lane.prUrl||lane.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={"Open "+lane.name+" in GitHub"}>{lane.prUrl?"Open PR ↗":"View source ↗"}</a>
 </article>}
export default function LanesView({feed,loading,error,refresh,compact=false,onExpand}:{feed:LanesFeed;loading:boolean;error:string;refresh:()=>void;compact?:boolean;onExpand?:()=>void}){
 const [filter,setFilter]=useState<(typeof filters)[number]>("All"),[search,setSearch]=useState("");
 const candidates=feed.lanes.filter(l=>(filter==="All"||l.status===filter)&&(l.name+" "+l.summary).toLowerCase().includes(search.toLowerCase()));
 const shown=compact?candidates.slice(0,5):candidates;
 return <section className={"panel lanes-panel "+(compact?"lanes-compact":"")}>
 <div className="panel-head lanes-head"><div><p className="eyebrow">LA CARTILLA DE GRETEL</p><h2>{compact?"Live work lanes":"Live lanes"}</h2><p>GitHub branches, pull requests, and issue work — updated approximately every four minutes.</p></div>
 <div className="lanes-actions">{compact?<button className="btn secondary" onClick={onExpand}>See all lanes →</button>:<button className="btn secondary" disabled={loading} onClick={refresh}>Refresh lanes ↻</button>}</div></div>
 {!compact&&<div className="lanes-toolbar"><label className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a lane…" aria-label="Find a lane"/></label><div className="lane-filters" aria-label="Filter lane status">{filters.map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)} aria-pressed={filter===s}>{s}</button>)}</div></div>}
 {error&&<div className="lanes-error" role="alert">GitHub lane data may be incomplete. {error} <button onClick={refresh}>Retry</button></div>}
 {feed.partial&&<p className="lanes-note">Some GitHub results may not be included. Open the source links for the full list.</p>}
 {loading&&!feed.checkedAt?<div className="lanes-loading"><Skeleton lines={4}/><Skeleton lines={4}/></div>:shown.length?<div className="lane-list">{shown.map(l=><Row lane={l} key={l.id}/>)}</div>:<p className="lane-empty">{error?"Could not confirm active lanes. Please retry.":"No lanes match this view."}</p>}
 <div className="lanes-bottom"><span>{feed.checkedAt?"Checked "+date(feed.checkedAt):"Waiting for GitHub"}</span><span>{feed.lanes.length} GitHub records displayed {compact?"· Latest 5 shown":""}</span></div>
 </section>
}
