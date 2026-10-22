"use client";
import type {Feed,Section} from "./hub-data";
import Home from "./hub-home";
import Projects from "./projects-view";
import ProjectView from "./project-view";
import PromptLibrary from "./prompt-library";
import SettingsView from "./settings-view";
import WebGraph from "./graph-view";
const sub:Record<Section,string>={Home:"Your two projects, live from GitHub.",Graph:"The whole hub as a map. Tap nodes to open or close them.",Projects:"Lany Books and La Cartilla de Gretel - nothing else.",Library:"Reusable instructions that are easy to copy.",Settings:"Appearance and refresh preferences."};
export default function HubContent({tab,feed,project,onBack,onOpen,navigate,loading,error,refresh,theme,setTheme,auto,setAuto}:{tab:Section;feed:Feed;project:string;onBack:()=>void;onOpen:(s:string)=>void;navigate:(t:Section)=>void;loading:boolean;error:string;refresh:()=>void;theme:string;setTheme:(v:string)=>void;auto:boolean;setAuto:(v:boolean)=>void}){
const current=feed.projects.find(p=>p.slug===project);
if(current)return <ProjectView project={current} onBack={onBack}/>;
return <><div className="page-title"><div><p className="eyebrow">NBO · OPERATIONS HUB</p><h1>{tab==="Home"?"Your operations hub":tab}</h1><p>{sub[tab]}</p></div></div>
{(error||feed.errors>0)&&<div className="warning">GitHub status {error?"unavailable: "+error:"limited for "+feed.errors+" repositories"}. <button onClick={refresh}>Retry</button></div>}
{tab==="Home"&&<Home projects={feed.projects} busy={loading} onOpen={onOpen} onSection={navigate}/>}
{tab==="Graph"&&<WebGraph projects={feed.projects} onOpenProject={onOpen} onSection={navigate}/>}
{tab==="Projects"&&<Projects projects={feed.projects} busy={loading} onOpen={onOpen} refresh={refresh}/>}
{tab==="Library"&&<PromptLibrary/>}
{tab==="Settings"&&<SettingsView theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto} refresh={refresh} busy={loading} errors={feed.errors}/>}</>;
}
