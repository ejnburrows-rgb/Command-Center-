"use client";
import {useEffect,useRef,useState} from "react";
import {usePremium} from "./premium-preferences";
declare global {interface Window {NBOGraphMount?:(root:HTMLElement)=>()=>void}}
type Skin="studio"|"tokyo"|"onedark"|"catppuccin"|"dracula"|"nord"|"monokai"|"github";
const themes:{id:Skin;name:string;swatches:[string,string,string]}[]=[
{id:"studio",name:"NBO Studio",swatches:["#0a1120","#5fa9ff","#5ed5bb"]},
{id:"tokyo",name:"Tokyo Night",swatches:["#1a1b26","#7aa2f7","#bb9af7"]},
{id:"onedark",name:"One Dark",swatches:["#282c34","#61afef","#98c379"]},
{id:"catppuccin",name:"Catppuccin Mocha",swatches:["#1e1e2e","#cba6f7","#89b4fa"]},
{id:"dracula",name:"Dracula",swatches:["#282a36","#bd93f9","#50fa7b"]},
{id:"nord",name:"Nord",swatches:["#2e3440","#88c0d0","#a3be8c"]},
{id:"monokai",name:"Monokai",swatches:["#272822","#a6e22e","#f92672"]},
{id:"github",name:"GitHub Dark",swatches:["#0d1117","#58a6ff","#3fb950"]},
];
export default function DataVisualizer(){
 const root=useRef<HTMLElement>(null),searchRef=useRef<HTMLInputElement>(null),menuRef=useRef<HTMLDivElement>(null);
 const {palette,appearance}=usePremium();
 const [skin,setSkin]=useState<Skin>("studio"),[appearanceOpen,setAppearanceOpen]=useState(false),[toolsOpen,setToolsOpen]=useState(false),[search,setSearch]=useState("");
 const [running,setRunning]=useState(true);
 useEffect(()=>{try{const stored=localStorage.getItem("nbo-visualizer-skin") as Skin;if(themes.some(t=>t.id===stored))setSkin(stored)}catch{}},[]);
 useEffect(()=>{const el=root.current;if(!el)return;el.dataset.skin=skin;el.dataset.theme=palette;el.dataset.appearance=appearance;el.dispatchEvent(new Event("visualizer-skin-change"));try{localStorage.setItem("nbo-visualizer-skin",skin)}catch{}},[skin,palette,appearance]);
 useEffect(()=>{
  const el=root.current;if(!el)return;let disposed=false;let stop:(()=>void)|undefined;
  const script=document.createElement("script");script.src="/visualizer/scene.js";script.async=true;
  script.onload=()=>{if(disposed)return;try{if(!window.NBOGraphMount)throw Error("Missing visualizer engine");stop=window.NBOGraphMount(el);el.dispatchEvent(new Event("visualizer-skin-change"))}catch(error){console.error(error);setRunning(false)}};
  script.onerror=()=>setRunning(false);document.head.appendChild(script);
  return()=>{disposed=true;stop?.();script.remove()};
 },[]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setAppearanceOpen(false);setToolsOpen(false)}};const outside=(e:PointerEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setAppearanceOpen(false)};document.addEventListener("keydown",onKey);document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("keydown",onKey);document.removeEventListener("pointerdown",outside)}},[]);
 const clearSearch=()=>{if(!searchRef.current)return;searchRef.current.value="";searchRef.current.dispatchEvent(new Event("input",{bubbles:true}));setSearch("");searchRef.current.focus()};
 return <section ref={root} id="universe" className="universe" aria-label="NBO knowledge visualizer" data-theme={palette} data-appearance={appearance} data-skin={skin}>
  <div className="vu-ambient" aria-hidden="true"/>
  <canvas id="plane" aria-hidden="true"/>
  <canvas id="scene" aria-label="Interactive knowledge graph. Use Browse for a keyboard-accessible list."/>
  <header className="vu-header">
    <div className="vu-identity">
      <span className="vu-kicker">NBO / KNOWLEDGE</span>
      <h1>Data universe<span className="vu-title-pulse" aria-hidden="true"/></h1>
      <p id="source-label">Connecting public GitHub…</p>
      <p className="vu-meta"><strong id="node-count">—</strong> visible · <strong id="link-count">—</strong> connections <span id="freshness">Checking sources</span></p>
    </div>
    <div className="vu-commandbar">
      <div className="vu-search" id="search-wrap">
        <label htmlFor="search" className="vu-search-icon" aria-label="Search">⌕</label>
        <input ref={searchRef} id="search" type="search" autoComplete="off" placeholder="Find a project or task…" aria-controls="suggestions" aria-expanded="false" onChange={e=>setSearch(e.target.value)}/>
        {search&&<button type="button" className="vu-clear" onClick={clearSearch} aria-label="Clear search">×</button>}
        <div id="suggestions" className="suggestions" role="listbox" hidden/>
      </div>
      <div className="vu-theme-anchor" ref={menuRef}>
        <button type="button" className="vu-button vu-theme-button" onClick={()=>{setAppearanceOpen(!appearanceOpen);setToolsOpen(false)}} aria-expanded={appearanceOpen} aria-label="Choose coding color theme">
          <span className="vu-theme-dot" aria-hidden="true"/> <span className="vu-button-word">Theme</span>
        </button>
        {appearanceOpen&&<div className="vu-theme-menu" role="group" aria-label="IDE-inspired color themes">
          <div className="vu-popup-title">COLOR THEME <button type="button" onClick={()=>setAppearanceOpen(false)} aria-label="Close themes">×</button></div>
          {themes.map(t=><button key={t.id} type="button" className={"vu-theme-option"+(skin===t.id?" chosen":"")} aria-pressed={skin===t.id} onClick={()=>{setSkin(t.id);setAppearanceOpen(false)}}>
            <span className="vu-swatches" aria-hidden="true">{t.swatches.map((c,i)=><i key={i} style={{backgroundColor:c}}/>)}</span><span>{t.name}</span>{skin===t.id&&<span className="vu-check" aria-hidden="true">✓</span>}
          </button>)}
          <p>Applies to this view. Your existing dashboard theme stays intact.</p>
        </div>}
      </div>
      <button type="button" className="vu-button" aria-label="Toggle advanced controls" aria-expanded={toolsOpen} onClick={()=>{setToolsOpen(!toolsOpen);setAppearanceOpen(false)}}><span aria-hidden="true">☷</span><span className="vu-button-word">Options</span></button>
      {toolsOpen&&<div className="vu-options" role="group" aria-label="Graph options">
        <label>Show<select id="category" defaultValue="all"><option value="all">All groups</option><option value="Projects">Projects</option><option value="Resources">Resources</option><option value="Archives">Archives</option><option value="Hubs">Hubs</option></select></label>
        <label>Sort<select id="sort" defaultValue="name"><option value="name">Name</option><option value="date">Date</option><option value="weight">Weight</option></select></label>
        <div className="vu-options-actions">
          <button id="fit" type="button">Fit</button><button id="reset" type="button">Reset</button><button id="pause" type="button" aria-pressed="false" aria-label="Pause motion"><span id="pause-icon" aria-hidden="true">Ⅱ</span> Motion</button>
        </div>
        <label className="vu-file-import">Import .md or .json <input id="import" type="file" accept=".md,.markdown,.json,text/markdown,application/json" multiple/></label>
      </div>}
    </div>
  </header>
  <div className="vu-focus">
     <button id="focus-chip" className="vu-focus-chip" hidden type="button">← All projects <span id="focus-name"/></button>
  </div>
  <div id="status" className="scene-status" aria-live="polite" role="status" hidden/>
  <div id="compass" className="vu-hint" aria-hidden="true" style={{display:"none"}}>Drag to orbit · Scroll to zoom</div>
  <div className="vu-lower">
    <button type="button" id="list-toggle" className="vu-browse" aria-expanded="false" aria-controls="node-list">Browse <span id="list-count">0</span> <span aria-hidden="true">↗</span></button>
    <nav className="vu-modes" aria-label="Graph visualization style">
      <button type="button" data-view="web" className="dock-item active" aria-pressed="true"><span aria-hidden="true">◎</span> Network</button>
      <button type="button" data-view="galaxy" className="dock-item" aria-pressed="false"><span aria-hidden="true">✦</span> Galaxy</button>
      <button type="button" data-view="god" className="dock-item" aria-pressed="false"><span aria-hidden="true">▤</span> Timeline</button>
      <button type="button" data-view="grid" className="dock-item" aria-pressed="false"><span aria-hidden="true">▦</span> Grid</button>
    </nav>
  </div>
  <section id="node-list" className="node-list" aria-label="Browse knowledge items" hidden>
    <header><h2>Browse items</h2><button type="button" id="list-close" aria-label="Close browser">×</button></header><div id="list-content"/>
  </section>
  <button id="panel-shade" className="panel-shade" type="button" aria-label="Close item details" hidden/>
  <aside id="inspector" className="inspector" aria-label="Selected item details" aria-hidden="true">
    <div className="inspector-head"><span>ITEM DETAILS</span><button type="button" id="close-inspector" aria-label="Close details">×</button></div>
    <div className="inspector-main" id="inspector-main"/>
  </aside>
  <div id="hover-label" className="hover-label" hidden/>
  {!running&&<div role="alert" className="vu-fatal">The visualizer could not start. Reload to retry.</div>}
 </section>;
}
