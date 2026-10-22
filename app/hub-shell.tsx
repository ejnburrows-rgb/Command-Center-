"use client";
import type {ReactNode} from "react";
import type {Section} from "./hub-data";
import {sections} from "./hub-data";
import {Icon} from "./hub-ui";
export default function HubShell({tab,current,theme,loading,errors,refresh,navigate,children}:{tab:Section;current?:string;theme:string;loading:boolean;errors:number;refresh:()=>void;navigate:(v:Section)=>void;children:ReactNode}){
return <div className="app">
<header className="topbar">
 <button className="brand" onClick={()=>navigate("Home")} aria-label="NBO home">
  <span className="brand-line">NBO</span><small>NOVO BUSINESS ORDER</small>
 </button>
 <div className="top-right">
  <span className="live-status"><b className={errors?"amber":""}/>{loading?"Refreshing":errors?"Limited":"GitHub live"}</span>
  <button className="iconbtn" aria-label="Refresh data" disabled={loading} onClick={refresh}><Icon name="refresh"/></button>
  <button className={"iconbtn gear"+(tab==="Settings"?" on":"")} aria-label="Settings" onClick={()=>navigate("Settings")}><Icon name="gear"/></button>
 </div>
</header>
<main className="main">{children}
 <footer><span>© {new Date().getFullYear()} NBO · Novo Business Order</span><span>Live from GitHub</span></footer>
</main>
<nav className="tabbar" aria-label="Main navigation">
 {sections.map(s=><button key={s} className={"tab"+(tab===s?" active":"")} onClick={()=>navigate(s)}><Icon name={s}/><span>{s}</span></button>)}
</nav>
</div>;
}
