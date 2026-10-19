"use client";
import type {Feed,Section} from "./hub-data";
import {Icon} from "./hub-ui";
import Home from "./hub-home";
import LanesView from "./lanes-view";
import NeedsYourYes from "./needs-your-yes";
import type {LanesFeed} from "./lanes-types";
import Projects from "./projects-view";
import ProjectView from "./project-view";
import BestPractices from "./best-practices";
import PromptLibrary from "./prompt-library";
import {ToolsView,AssetsView} from "./resources-view";
import SettingsView from "./settings-view";
const sub:Record<Section,string>={Hub:"Projects, knowledge, tools and proof — in one place.",Projects:"Your repositories, with direct GitHub links.",Lanes:"Cartilla branches, PRs, blockers and recent activity.","Best Practices":"A reusable playbook from planning to delivery.",Prompts:"Reusable instructions that are easy to copy.",Tools:"Your useful services, one tap away.",Assets:"Direct links to existing project files.",Settings:"Choose your experience and refresh preferences."};
export default function HubContent({tab,feed,project,onBack,onOpen,navigate,loading,error,refresh,theme,setTheme,auto,setAuto,lanes,lanesLoading,lanesError,refreshLanes}:{tab:Section;feed:Feed;project:string;onBack:()=>void;onOpen:(s:string)=>void;navigate:(t:Section)=>void;loading:boolean;error:string;refresh:()=>void;theme:string;setTheme:(v:string)=>void;auto:boolean;setAuto:(v:boolean)=>void;lanes:LanesFeed;lanesLoading:boolean;lanesError:string;refreshLanes:()=>void}){
const current=feed.projects.find(p=>p.slug===project);
if(current)return <ProjectView project={current} onBack={onBack}/>;
return <><div className="page-title"><div><p className="eyebrow">NBO · OPERATIONS CONTROL</p><h1>{tab==="Hub"?"Your operations hub":tab}</h1><p>{sub[tab]}</p></div><span className="theme-chip"><Icon name={theme==="dark"||theme==="purple"?"moon":"sun"}/>{theme.toUpperCase()+" MODE"}</span></div>{(error||feed.errors>0)&&<div className="warning">GitHub status {error?"unavailable: "+error:"limited for "+feed.errors+" repositories"}. <button onClick={refresh}>Retry</button></div>}
{tab==="Hub"&&<><NeedsYourYes feed={lanes} loading={lanesLoading} error={lanesError}/><Home projects={feed.projects} busy={loading} onOpen={onOpen} onSection={navigate} lanes={lanes} lanesLoading={lanesLoading} lanesError={lanesError} refreshLanes={refreshLanes}/></>}
{tab==="Lanes"&&<LanesView feed={lanes} loading={lanesLoading} error={lanesError} refresh={refreshLanes}/>}
{tab==="Projects"&&<Projects projects={feed.projects} busy={loading} onOpen={onOpen} refresh={refresh}/>}
{tab==="Best Practices"&&<BestPractices/>}
{tab==="Prompts"&&<PromptLibrary/>}
{tab==="Tools"&&<ToolsView/>}
{tab==="Assets"&&<AssetsView/>}
{tab==="Settings"&&<SettingsView theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto} refresh={refresh} busy={loading} errors={feed.errors}/>}</>;
}