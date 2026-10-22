"use client";
import type {ReactNode} from "react";
import {useState} from "react";
import type {Section} from "./hub-data";
import {sections} from "./hub-data";
import {Icon,External} from "./hub-ui";
export default function HubShell({tab,current,theme,setTheme,loading,errors,refresh,navigate,children}:{tab:Section;current?:string;theme:string;setTheme:(v:string)=>void;loading:boolean;errors:number;refresh:()=>void;navigate:(v:Section)=>void;children:ReactNode}){
const [menu,setMenu]=useState(false);
const go=(s:Section)=>{navigate(s);setMenu(false)};
return <div className="shell"><aside className={"sidebar "+(menu?"expanded":"")}><button className="brand" onClick={()=>go("Home")}><span className="brand-line"><svg viewBox="0 0 24 38" aria-hidden="true"><path d="M15.1 0 2.7 21.4h8.1L7.7 38 21.3 15.2h-8.1z"/></svg>NBO</span><small>NOVO BUSINESS ORDER</small></button><p className="side-label">WORKSPACE</p><nav aria-label="Main navigation">{sections.map(s=><button key={s} className={"navlink "+(tab===s?"active":"")} onClick={()=>go(s)}><Icon name={s}/>{s}</button>)}</nav><div className="sidebar-bottom"><p className="side-label">CONNECTED SOURCE</p><External href="https://github.com/ejnburrows-rgb" className="side-source"><Icon name="github"/> GitHub</External><small>NBO · Owner workspace</small></div></aside>{menu&&<button className="shade" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
<div className="shell-main"><header className="topbar"><div className="top-left"><button className="iconbtn mobile-menu" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}><Icon name={menu?"close":"menu"}/></button><span>NBO <i>/</i> {current||tab}</span></div><div className="top-right"><span className="live-status"><b className={errors?"amber":""}/>{loading?"Refreshing":errors?"Limited data":"GitHub live"}</span><button className="iconbtn" aria-label="Refresh data" disabled={loading} onClick={refresh}><Icon name="refresh"/></button><button className="iconbtn" aria-label="Switch theme" onClick={()=>setTheme(theme==="chrome"?"light":"chrome")}><Icon name={theme==="chrome"?"sun":"moon"}/></button><span className="avatar">N</span></div></header><main className="main">{children}<footer><span>© {new Date().getFullYear()} NBO · Novo Business Order</span><span>Live from GitHub · Preferences stored locally</span></footer></main></div></div>;
}
