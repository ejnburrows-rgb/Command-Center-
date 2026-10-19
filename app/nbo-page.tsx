"use client";
import {usePathname,useRouter} from "next/navigation";
import {sectionPaths,projectPath} from "./route-paths";
import {useEffect,useState} from "react";
import HubShell from "./hub-shell";
import HubContent from "./hub-content";
import type {Feed,Section} from "./hub-data";
export default function NBOPage(){
const pathname=usePathname(),router=useRouter();
const segments=pathname.split("/").filter(Boolean);
const tab:Section=segments[0]==="projects"?"Projects":(Object.keys(sectionPaths) as Section[]).find(s=>sectionPaths[s]==="/"+segments[0])||"Hub";
const project=segments[0]==="projects"?(segments[1]||""):"";
const [theme,setTheme]=useState("purple"),[menu,setMenu]=useState(false),[auto,setAuto]=useState(true);
const [feed,setFeed]=useState<Feed>({projects:[],updatedAt:"",errors:0});
const [busy,setBusy]=useState(true),[error,setError]=useState("");
const navigate=(s:Section)=>{router.push(sectionPaths[s]);setMenu(false)};
async function refresh(){setBusy(true);try{const r=await fetch("/api/hub"+(project?"?project="+encodeURIComponent(project):""),{cache:"no-store"});if(!r.ok)throw Error("GitHub "+r.status);setFeed(await r.json());setError("")}catch(e){setError(e instanceof Error?e.message:"Cannot load data")}finally{setBusy(false)}}
useEffect(()=>{setTheme(localStorage.getItem("nbo-theme")==="teal"?"teal":"purple");setAuto(localStorage.getItem("nbo-auto")!=="off");void refresh()},[]);
useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("nbo-theme",theme)},[theme]);
useEffect(()=>{if(project)void refresh()},[project]);
useEffect(()=>{if(!auto)return;const id=setInterval(()=>void refresh(),120000);return()=>clearInterval(id)},[auto,project]);
return <HubShell tab={tab} theme={theme} setTheme={setTheme} menu={menu} setMenu={setMenu} loading={busy} errors={feed.errors} refresh={()=>void refresh()} navigate={navigate}><HubContent tab={tab} feed={feed} project={project} onBack={()=>router.push("/projects")} onOpen={(slug)=>router.push(projectPath(slug))} navigate={navigate} loading={busy} error={error} refresh={refresh} theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto}/></HubShell>;
}
