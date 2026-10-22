"use client";
import type {Project,Section} from "./hub-data";
import WebGraph from "./graph-view";
export default function Home({projects,busy,onOpen,onSection}:{projects:Project[];busy:boolean;onOpen:(s:string)=>void;onSection:(s:Section)=>void}){
const items=projects.reduce((a,b)=>a+(b.accessible?b.issues+b.prs:0),0);
return <>
<section className="summary-card">
 <h2>{busy?"Reading GitHub…":projects.length+" projects on the board, all in one place."}</h2>
 <p>Only Lany Books and La Cartilla de Gretel live here now. Everything below is read live from GitHub.</p>
 <div className="chips">
  <span className="chip">{busy?"…":projects.length+" projects"}</span>
  <span className="chip">{busy?"…":items+" open items"}</span>
  <span className="chip">Art inventory live</span>
 </div>
</section>
<section className="sect"><h3>WEB GRAPH <span>tap a node to open or close it</span></h3>
<WebGraph projects={projects} onOpenProject={onOpen} onSection={onSection}/>
</section>
<section className="sect"><h3>PROJECTS <span>only these two, nothing else</span></h3>
{projects.map(p=><button key={p.slug} className="gcard" onClick={()=>onOpen(p.slug)}>
 <span className={"badge "+(p.accessible?"green":"amber")}>{p.accessible?"CONNECTED":"RESTRICTED"}</span>
 <h4><span className={"dot"+(p.slug==="cartilla-de-gretel"?" green":"")}></span>{p.name}</h4>
 <p>{p.description||"GitHub source repository"}</p>
 <div className="row"><span><b>{p.accessible?p.issues:"—"}</b> issues · <b>{p.accessible?p.prs:"—"}</b> PRs</span><span>Open →</span></div>
</button>)}
{!projects.length&&<p className="muted">{busy?"Loading GitHub…":"No readable repositories."}</p>}
</section>
</>;
}
