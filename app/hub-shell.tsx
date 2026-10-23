"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
import Link from "next/link";
import {sectionPaths,projectPath} from "./route-paths";
import type {Section,Project} from "./hub-data";
import {sections} from "./hub-data";
import {usePins} from "./project-preferences";
import {usePremium,workspaceLabels,paletteLabels,type Palette,type Appearance,type WorkspaceMode} from "./premium-preferences";
import {Icon,External} from "./hub-ui";
const mainNav:Section[]=["Hub","Projects","AI Operations","GitHub","Evidence","Knowledge"];
const secondaryNav:Section[]=["Prompts","Best Practices","Tools","Assets","Settings"];
const modes:WorkspaceMode[]=["overview","coding","review","focus"];
const colors:Palette[]=["blue","purple","teal","mono"];
export default function HubShell({tab,current,projects,menu,setMenu,loading,errors,refresh,children}:{tab:Section;current?:string;projects?:Project[];theme:string;setTheme:(v:string)=>void;menu:boolean;setMenu:(v:boolean)=>void;loading:boolean;errors:number;refresh:()=>void;navigate:(v:Section)=>void;children:ReactNode}){
 const {palette,setPalette,appearance,setAppearance,workspace,setWorkspace}=usePremium();
 const [open,setOpen]=useState(false),prefs=usePins(),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{function close(e:KeyboardEvent){if(e.key==="Escape")setOpen(false)}function outside(e:PointerEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}window.addEventListener("keydown",close);document.addEventListener("pointerdown",outside);return()=>{window.removeEventListener("keydown",close);document.removeEventListener("pointerdown",outside)}},[]);
 const nav=(items:Section[])=>items.map(s=><Link key={s} href={sectionPaths[s]} aria-current={tab===s?"page":undefined} className={"navlink "+(tab===s?"active":"")} onClick={()=>setMenu(false)}><Icon name={s}/><span>{s==="Hub"?"Overview":s}</span></Link>);
 return <div className="shell mission-shell premium-shell">
  <aside className={"sidebar "+(menu?"expanded":"")}>
   <Link className="brand" href="/" onClick={()=>setMenu(false)} aria-label="NBO home"><span className="brand-line"><svg viewBox="0 0 24 38" aria-hidden="true"><path d="M15.1 0 2.7 21.4h8.1L7.7 38 21.3 15.2h-8.1z"/></svg>NBO <span style={{fontSize:12,letterSpacing:".02em",marginLeft:9,fontWeight:650,color:"var(--ui-subtle)"}}>STUDIO</span></span><small>AI DEVELOPMENT CONTROL</small></Link>
   <p className="side-label">WORKSPACE</p><nav aria-label="Primary navigation">{nav(mainNav)}</nav>
   <div className="mission-pinned"><p className="side-label">YOUR PROJECTS</p>{(projects||[]).filter(p=>prefs.value.includes(p.slug)).slice(0,4).map(p=><Link href={projectPath(p.slug)} key={p.slug} onClick={()=>setMenu(false)}><span>{p.name}</span><small>{p.stale?"Source partial":p.issues===null?"Source unavailable":p.issues+" issues · "+(p.prs??"—")+" PRs"}</small></Link>)}{!prefs.value.length&&<Link href="/projects" onClick={()=>setMenu(false)}><span>Pin favorite projects</span><small>Quick access from every page →</small></Link>}</div>
   <p className="side-label">LIBRARY & TOOLS</p><nav aria-label="Secondary navigation">{nav(secondaryNav)}</nav>
   <div className="sidebar-bottom"><p className="side-label">CONNECTED SOURCE</p><External href="https://github.com/ejnburrows-rgb" className="side-source"><Icon name="github"/> GitHub · Read only</External><small>Owner decisions always require proof</small></div>
  </aside>
  {menu&&<button className="shade" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
  <div className="shell-main"><header className="topbar">
   <div className="top-left"><button type="button" className="iconbtn mobile-menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Icon name={menu?"close":"menu"}/></button><span>NBO <i>/</i> <strong>{current|| (tab==="Hub"?"Overview":tab)}</strong></span></div>
   <div className="top-right">
    <div className="mode-switch" role="group" aria-label="Workspace modes">{modes.map(m=><button type="button" key={m} aria-pressed={workspace===m} title={workspaceLabels[m]+" workspace"} onClick={()=>{setWorkspace(m);if(tab!=="Hub")window.location.assign("/")}}><span>{workspaceLabels[m]}</span></button>)}</div>
    <span className="live-status"><b className={errors?"amber":""}/>{loading?"Syncing":errors?"Partial source":"GitHub connected"}</span>
    <button className="iconbtn" type="button" aria-label="Refresh GitHub data" title="Refresh GitHub data" disabled={loading} onClick={refresh}><Icon name="refresh"/></button>
    <div className="appearance-anchor" ref={ref}>
     <button type="button" className="mode appearance-trigger" aria-label="Appearance and color settings" aria-expanded={open} aria-controls="premium-appearance-menu" onClick={()=>setOpen(!open)}><span className="palette-dot"/><span>{paletteLabels[palette]}</span><Icon name="sun"/></button>
     {open&&<div id="premium-appearance-menu" className="appearance-popover" role="group" aria-label="Choose appearance and color"><h3>Appearance</h3><p>Choose your workspace style. Saved automatically.</p>
      <div className="appearance-options" role="group" aria-label="Light or dark">{(["light","dark"] as Appearance[]).map(a=><button type="button" key={a} aria-pressed={appearance===a} onClick={()=>setAppearance(a)}>{a==="light"?"☀ Light":"◐ Dark"}</button>)}</div>
      <h3>Accent color</h3><div className="palette-options" role="group" aria-label="Accent palette">{colors.map(c=><button key={c} type="button" data-color={c} aria-pressed={palette===c} onClick={()=>setPalette(c)}><i/>{paletteLabels[c]}</button>)}</div>
      <Link href="/settings" onClick={()=>setOpen(false)} style={{display:"block",marginTop:14,fontSize:12,color:"var(--ui-accent)"}}>All preferences →</Link>
     </div>}
    </div>
   </div>
  </header><main className="main">{children}<footer><span>© {new Date().getFullYear()} NBO Studio</span><span>Real GitHub data · Owner-first approvals</span></footer></main></div>
 </div>;
}
