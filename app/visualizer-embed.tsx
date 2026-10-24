"use client";
import {useEffect,useRef,type CSSProperties} from "react";
import {usePremium} from "./premium-preferences";
declare global { interface Window { NBOGraphMount?: (root:HTMLElement)=>()=>void; } }
export default function DataVisualizer(){
 const root=useRef<HTMLElement>(null);
 const {appearance,palette}=usePremium();
 useEffect(()=>{const el=root.current;if(el){el.dataset.theme=palette;el.dataset.appearance=appearance;}},[appearance,palette]);
 useEffect(()=>{
   const el=root.current;if(!el)return;
   let cancelled=false;let dispose:(()=>void)|undefined;
   const script=document.createElement("script");script.src="/visualizer/scene.js";script.async=true;
   script.onload=()=>{if(cancelled)return;try{if(!window.NBOGraphMount)throw Error("Graph engine unavailable");dispose=window.NBOGraphMount(el)}catch(e){console.error(e);const status=el.querySelector<HTMLElement>("#status");if(status){status.hidden=false;status.textContent="Unable to start the visualizer. Refresh to retry.";}}};
   script.onerror=()=>{const status=el.querySelector<HTMLElement>("#status");if(status){status.hidden=false;status.textContent="Visualizer failed to load. Refresh to retry.";}}; 
   document.head.appendChild(script);
   return()=>{cancelled=true;dispose?.();script.remove();};
 },[]);
 return <section ref={root} id="universe" className="universe" aria-label="NBO Data Universe" data-theme={palette} data-appearance={appearance}>

  <div className="backdrop" aria-hidden="true"><div className="nebula nebula-a"></div><div className="nebula nebula-b"></div><div className="stars"></div></div>
  <canvas id="plane" aria-hidden="true"></canvas>
  <canvas id="scene" aria-label="Interactive graph canvas; use the searchable node list for keyboard access"></canvas>
  <div className="top-fade" aria-hidden="true"></div>
  <header className="hud glass-flat">
    <p className="eyebrow"><span className="signal"></span> NBO <span className="slash">/</span> DATA UNIVERSE</p>
    <h1>Explore your <em>knowledge.</em></h1>
    <p className="subtitle" id="source-label">Loading public GitHub records…</p>
    <div className="counts"><span><strong id="node-count">—</strong> nodes</span><span className="count-div"></span><span><strong id="link-count">—</strong> links</span><span className="count-div"></span><span id="freshness" className="freshness">Checking source</span></div>
  </header>
  <div className="top-actions">
    <div className="search-wrap glass" id="search-wrap">
      <label htmlFor="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search knowledge nodes</span></label>
      <input id="search" type="search" autoComplete="off" placeholder="Search the universe…" aria-controls="suggestions" aria-expanded="false"/>
      <div id="suggestions" role="listbox" className="suggestions" hidden></div>
    </div>
    <div className="toolbar glass" aria-label="Universe controls">
      <label className="select-control"><span className="sr-only">Filter category</span><select id="category"><option value="all">All categories</option><option value="Projects">Projects</option><option value="Resources">Resources</option><option value="Archives">Archives</option><option value="Hubs">Hubs</option></select></label>
      <label className="select-control"><span className="sr-only">Sort nodes</span><select id="sort"><option value="name">Name</option><option value="date">Date</option><option value="weight">Weight</option></select></label>
      <button id="fit" title="Fit the entire graph" aria-label="Fit view"><svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg></button>
      <button id="reset" title="Reset camera" aria-label="Reset camera"><svg viewBox="0 0 24 24"><path d="M3 10a9 9 0 1 1 0 5M3 4v6h6"/></svg></button>
      <button id="pause" title="Pause motion" aria-label="Pause motion" aria-pressed="false"><svg viewBox="0 0 24 24"><path id="pause-icon" d="M8 5v14M16 5v14"/></svg></button>
      <label className="import-btn" tabIndex={0} role="button" aria-label="Import Markdown or JSON files, locally on this device"><svg viewBox="0 0 24 24"><path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/></svg><span>Import</span><input id="import" type="file" accept=".md,.markdown,.json,text/markdown,application/json" multiple hidden/></label>
    </div>
  </div>
  <div className="legend glass"><span><i style={{"--dot":"#00ffff"} as CSSProperties}></i>Projects</span><span><i style={{"--dot":"#bf00ff"} as CSSProperties}></i>Resources</span><span><i style={{"--dot":"#8392a9"} as CSSProperties}></i>Archives</span><span><i style={{"--dot":"#ffd700"} as CSSProperties}></i>Hubs</span></div>
  <div className="scene-status" id="status" role="status" aria-live="polite" hidden></div>
  <div id="compass" className="compass" aria-hidden="true"><span>↔ DRAG TO ORBIT</span><span>+ SCROLL TO ZOOM</span></div>
  <div className="dock-outer"><nav className="dock glass" aria-label="Visualization mode">
     <button className="dock-item active" data-view="galaxy" aria-pressed="true"><span className="dock-icon">✧</span><span>GALAXY</span></button>
     <button className="dock-item" data-view="god" aria-pressed="false"><span className="dock-icon">▥</span><span>GOD VIEW</span></button>
     <button className="dock-item" data-view="web" aria-pressed="false"><span className="dock-icon">⌘</span><span>WEB GRAPH</span></button>
     <button className="dock-item" data-view="grid" aria-pressed="false"><span className="dock-icon">▦</span><span>GRID</span></button>
  </nav></div>
  <button id="list-toggle" className="list-toggle glass" aria-expanded="false" aria-controls="node-list">Browse items <span id="list-count">0</span> ↗</button>
  <section id="node-list" className="node-list glass" aria-label="Accessible knowledge list" hidden><header><h2>All items</h2><button id="list-close" aria-label="Close item list">×</button></header><div id="list-content"></div></section>
  <div id="panel-shade" className="panel-shade" hidden></div>
  <aside id="inspector" className="inspector glass" aria-label="Selected item details" aria-hidden="true"><div className="inspector-head"><span className="eyebrow">NODE INSPECTOR / SOURCE EVIDENCE</span><button id="close-inspector" title="Close details" aria-label="Close details">×</button></div><div className="inspector-main" id="inspector-main"></div></aside>
  <div id="hover-label" className="hover-label glass" hidden></div>

 </section>
}
