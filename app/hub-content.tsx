"use client";
import type {Feed,Section} from "./hub-data";
import Home from "./hub-home";
import DataVisualizer from "./visualizer-embed";
import Projects from "./projects-view";
import ProjectView from "./project-view";
import BestPractices from "./best-practices";
import PromptLibrary from "./prompt-library";
import {ToolsView,AssetsView} from "./resources-view";
import SettingsView from "./settings-view";
import GithubPanel from "./github-panel";
import AIOperations from "./ai-operations";
import MissionActionMap from "./mission-action-map";
import JulesAssignment from "./jules-assignment";
export default function HubContent({tab,feed,project,onBack,onOpen,navigate,loading,error,refresh,theme,setTheme,auto,setAuto}:{tab:Section;feed:Feed;project:string;onBack:()=>void;onOpen:(s:string)=>void;navigate:(t:Section)=>void;loading:boolean;error:string;refresh:()=>void;theme:string;setTheme:(v:string)=>void;auto:boolean;setAuto:(v:boolean)=>void}){
const current=feed.projects.find(p=>p.slug===project);
if(current)return <ProjectView project={current} onBack={onBack}/>;
if(tab==="Visualizer")return <DataVisualizer/>;
if(tab==="GitHub")return <GithubPanel projects={feed.projects}/>;
if(tab==="AI Operations"||tab==="Evidence"||tab==="Knowledge")return <AIOperations projects={feed.projects} view={tab==="AI Operations"?"operations":tab==="Evidence"?"evidence":"knowledge"}/>;
return <>{(error||feed.errors>0)&&<div className="warning">GitHub status {error?"unavailable: "+error:"limited for "+feed.errors+" repositories"}. <button onClick={refresh}>Retry</button></div>}
{tab==="Hub"&&<Home projects={feed.projects} busy={loading} onOpen={onOpen} onSection={navigate}/>}
{tab==="Hub"&&<JulesAssignment/>}
{tab==="Hub"&&<MissionActionMap projects={feed.projects} busy={loading}/>}
{tab==="Projects"&&<Projects projects={feed.projects} busy={loading} onOpen={onOpen} refresh={refresh}/>}

{tab==="Best Practices"&&<BestPractices/>}
{tab==="Prompts"&&<PromptLibrary/>}
{tab==="Tools"&&<ToolsView/>}
{tab==="Assets"&&<AssetsView/>}
{tab==="Settings"&&<SettingsView theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto} refresh={refresh} busy={loading} errors={feed.errors}/>}</>;
}
