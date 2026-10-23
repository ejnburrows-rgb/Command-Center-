"use client";
import {useState} from "react";
import type {Project} from "./hub-data";
import Link from "next/link";
import {projectPath} from "./route-paths";
import {Pin,usePins} from "./project-preferences";
import {Icon} from "./hub-ui";
export default function Projects({projects,busy,onOpen,refresh}:{projects:Project[];busy:boolean;onOpen:(slug:string)=>void;refresh:()=>void}){
const pins=usePins();
const toggle=(slug:string)=>pins.save(pins.value.includes(slug)?pins.value.filter(s=>s!==slug):[...pins.value,slug]);
const [q,setQ]=useState("");
const list=projects.filter(p=>(p.name+" "+p.slug+" "+p.description).toLowerCase().includes(q.toLowerCase()));
return <><div className="toolbar"><label className="search"><Icon name="search"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search repositories…" aria-label="Search repositories"/></label><button className="btn secondary" disabled={busy} onClick={refresh}><Icon name="refresh"/> Refresh</button></div><div className="project-grid">{list.map(p=><article className="project-card" key={p.slug}><div className="card-top"><span className="tile-icon"><Icon name="Projects"/></span><span className={p.accessible?"badge green":"badge amber"}>{p.accessible?"Connected":"Restricted"}</span></div><h2><Link href={projectPath(p.slug)}>{p.name} →</Link></h2><Pin slug={p.slug} pins={pins.value} toggle={toggle}/><p>{p.description||"GitHub source repository"}</p><div className="counts"><span><b>{p.issues??"—"}</b>Issues</span><span><b>{p.prs??"—"}</b>PRs</span></div><div className="card-bottom"><span>{p.updatedAt?new Date(p.updatedAt).toLocaleDateString():p.visibility}</span><Link href={projectPath(p.slug)}>Open workspace →</Link></div><p className="small muted">Last refreshed: {p.fetchedAt?new Date(p.fetchedAt).toLocaleString():"Never"}{p.stale?" · STALE":""}</p></article>)}{!list.length&&<p className="muted">No matching repositories.</p>}</div>{pins.error&&<p role="alert">{pins.error}</p>}<p className="muted small">Totals include all pages from the last successful GitHub fetch. Stale values retain their original timestamp.</p></>;
}
