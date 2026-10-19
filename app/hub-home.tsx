"use client";
import Link from "next/link";
import {prompts,tools} from "./hub-data";
import type {Project,Section} from "./hub-data";
import {External} from "./hub-ui";
import {usePins,Pin} from "./project-preferences";
import {projectPath} from "./route-paths";
import {NeedsYou} from "./evidence-panels";
export default function Home({projects,busy,onOpen,onSection}:{projects:Project[];busy:boolean;onOpen:(s:string)=>void;onSection:(s:Section)=>void}){
const pins=usePins(),active=projects.filter(p=>pins.value.includes(p.slug));
return <><NeedsYou/><section className="panel"><div className="panel-head"><div><h2>Pinned projects</h2><p>Your selection on this device.</p></div><Link className="linkbtn" href="/projects">All projects →</Link></div><div className="mini-grid">{active.map(p=><article className="mini-card" key={p.slug}><Link href={projectPath(p.slug)}><h2>{p.name} →</h2></Link><p className="small muted">{p.description}</p><p>{p.issues??"—"} issues · {p.prs??"—"} PRs · {p.drafts??"—"} drafts</p><p className="small muted">Last refreshed: {p.fetchedAt?new Date(p.fetchedAt).toLocaleString():"Never"}{p.stale?" · STALE":""}</p><Pin slug={p.slug} pins={pins.value} toggle={slug=>pins.save(pins.value.filter(s=>s!==slug))}/></article>)}</div>{!active.length&&<p className="muted">{busy||!pins.ready?"Loading projects…":<>No pinned projects yet. <Link className="linkbtn" href="/projects">Choose projects</Link></>}</p>}{pins.error&&<p role="alert">{pins.error}</p>}</section><p className="lead muted"><Link href="/best-practices">Before, during and after a project →</Link></p><div className="dash-grid"><section className="panel"><div className="panel-head"><h2>Prompt library</h2><Link className="linkbtn" href="/prompts">Browse all →</Link></div><div className="quick-prompts">{prompts.slice(0,4).map(p=><Link href="/prompts" key={p.name}><b>{p.name}</b><small>{p.desc}</small></Link>)}</div></section><section className="panel"><h2>Tool stack</h2><div className="quick-tools">{tools.slice(0,6).map(t=><External href={t.url} key={t.name}>{t.name}</External>)}</div></section></div></>;
}
