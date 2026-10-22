"use client";
import type {Feed,Section} from "./hub-data";
import Home from "./hub-home";
import Projects from "./projects-view";
import ProjectView from "./project-view";
import BestPractices from "./best-practices";
import PromptLibrary from "./prompt-library";
import {AssetsView} from "./resources-view";
import SettingsView from "./settings-view";
import WebGraph from "./graph-view";
const sub:Record<Section,string>={Home:"Projects, knowledge, tools and proof - in one place.",Lanes:"The whole hub as a live map. Tap a node to open or close it.",Projects:"Lany Books and La Cartilla de Gretel, live from GitHub.",Playbook:"A reusable routine from planning to delivery.",Prompts:"Reusable instructions that are easy to copy.",Files:"Direct links to existing project files.",Settings:"Choose your experience and refresh preferences."};
export default function HubContent({tab,feed,project,onBack,onOpen,navigate,loading,error,refresh,theme,setTheme,auto,setAuto}:{tab:Section;feed:Feed;project:string;onBack:()=>void;onOpen:(s:string)=>void;navigate:(t:Section)=>void;loading:boolean;error:string;refresh:()=>void;theme:string;setTheme:(v:string)=>void;auto:boolean;setAuto:(v:boolean)=>void}){
const current=feed.projects.find(p=>p.slug===project);
if(current)return <ProjectView project={current} onBack={onBack}/>;
return <><div className="page-title"><div><p className="eyebrow">NBO · OPERATIONS CONTROL</p><h1>{tab==="Home"?"Your operations hub":tab}</h1><p>{sub[tab]}</p></div></div>
{(error||feed.errors>0)&&<div className="warning">GitHub status {error?"unavailable: "+error:"limited for "+feed.errors+" repositories"}. <button onClick={refresh}>Retry</button></div>}
{tab==="Home"&&<Home projects={feed.projects} busy={loading} onOpen={onOpen} onSection={navigate}/>}
{tab==="Lanes"&&<section className="panel"><div className="panel-head"><div><h2>Web Graph</h2><p>Live from GitHub. Tap a lane to open or close it; tap a leaf to go there.</p></div></div><WebGraph projects={feed.projects} onOpenProject={onOpen} onSection={navigate}/></section>}
{tab==="Projects"&&<Projects projects={feed.projects} busy={loading} onOpen={onOpen} refresh={refresh}/>}
{tab==="Playbook"&&<BestPractices/>}
{tab==="Prompts"&&<PromptLibrary/>}
{tab==="Files"&&<AssetsView/>}
{tab==="Settings"&&<SettingsView theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto} refresh={refresh} busy={loading} errors={feed.errors}/>}</>;
}
