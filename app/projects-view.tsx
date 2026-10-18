"use client";
import {useState} from "react";
import type {Project} from "./hub-data";
import {Icon} from "./hub-ui";
import ProjectMark from "./project-mark";
import ProofTag from "./proof-tag";
export default function Projects({projects,busy,onOpen,refresh}:{projects:Project[];busy:boolean;onOpen:(slug:string)=>void;refresh:()=>void}){
const [q,setQ]=useState("");
const list=projects.filter(p=>(p.name+" "+p.slug+" "+p.description).toLowerCase().includes(q.toLowerCase()));
return <><div className="toolbar"><label className="search"><Icon name="search"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search repositories…" aria-label="Search repositories"/></label><button className="btn secondary" disabled={busy} onClick={refresh}><Icon name="refresh"/> Refresh</button></div><div className="project-grid">{list.map(p=><article className="project-card" key={p.slug}><button className="project-card-click" onClick={()=>onOpen(p.slug)}><div className="card-top"><ProjectMark slug={p.slug} name={p.name}/><span className={p.accessible?"badge green":"badge amber"}>{p.accessible?"Connected":"Restricted"}</span></div><h2>{p.name}</h2><p>{p.description||"GitHub source repository"}</p><div className="counts"><span><b>{p.accessible?p.issues:"—"}</b>Issues</span><span><b>{p.accessible?p.prs:"—"}</b>PRs</span></div><div className="card-bottom"><span>{p.updatedAt?new Date(p.updatedAt).toLocaleDateString():p.visibility}</span><span>Open workspace →</span></div></button><div className="project-proof"><ProofTag verified={p.accessible} href={p.url}/></div></article>)}{!list.length&&<p className="muted">No matching repositories.</p>}</div><p className="muted small">Counts reflect open GitHub records retrieved (up to 30), not a completion percentage.</p></>;
}