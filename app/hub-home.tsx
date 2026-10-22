"use client";
import {prompts} from "./hub-data";
import type {Project,Section} from "./hub-data";
import {Stat} from "./hub-ui";
import WebGraph from "./graph-view";
export default function Home({projects,busy,onOpen,onSection}:{projects:Project[];busy:boolean;onOpen:(s:string)=>void;onSection:(s:Section)=>void}){
const active=projects.filter(p=>p.accessible);
return <><div className="stats"><Stat label="Projects tracked" value={projects.length||"…"} /><Stat label="Open issues shown" value={busy?"…":active.reduce((a,b)=>a+b.issues,0)}/><Stat label="Open PRs shown" value={busy?"…":active.reduce((a,b)=>a+b.prs,0)}/><Stat label="Repositories readable" value={busy?"…":active.length}/></div>
<section className="panel"><div className="panel-head"><div><h2>Web Graph</h2><p>Live from GitHub. Tap a node to open or close it.</p></div><button className="linkbtn" onClick={()=>onSection("Lanes")}>Open lanes →</button></div><WebGraph projects={projects} onOpenProject={onOpen} onSection={onSection}/></section>
<section className="panel"><div className="panel-head"><div><h2>Active projects</h2><p>Tap a repository to open its workspace.</p></div><button className="linkbtn" onClick={()=>onSection("Projects")}>View all →</button></div><div className="mini-grid">{projects.map(p=><button key={p.slug} className="mini-card" onClick={()=>onOpen(p.slug)}><span className="tile-icon">▣</span><b>{p.name}</b><small>{p.description||"GitHub repository"}</small><span>{p.accessible?p.issues+" issues · "+p.prs+" PRs":"Private repo"} →</span></button>)}{!projects.length&&<p className="muted">{busy?"Loading GitHub…":"No readable repositories."}</p>}</div></section>
<section className="panel"><div className="panel-head"><div><h2>Prompt library</h2><p>Reusable instructions, easy to copy.</p></div><button className="linkbtn" onClick={()=>onSection("Prompts")}>Browse all →</button></div><div className="quick-prompts">{prompts.slice(0,4).map(p=><button key={p.name} onClick={()=>onSection("Prompts")}><b>{p.name}</b><small>{p.desc}</small><span>Open library →</span></button>)}</div></section>
</>;
}
