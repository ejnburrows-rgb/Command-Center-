"use client";
import {usePathname,useRouter} from "next/navigation";
import {sectionPaths,projectPath} from "./route-paths";
import {useEffect,useState,useRef} from "react";
import HubShell from "./hub-shell";
import HubContent from "./hub-content";
import {PremiumProvider,usePremium} from "./premium-preferences";
import type {Feed,Section} from "./hub-data";
function NBOPageCore(){
const {palette:theme,setPalette:setTheme}=usePremium();
const pathname=usePathname(),router=useRouter();
const segments=pathname.split("/").filter(Boolean);
const tab:Section=segments[0]==="projects"?"Projects":(Object.keys(sectionPaths) as Section[]).find(s=>sectionPaths[s]==="/"+segments[0])||"Hub";
const project=segments[0]==="projects"?(segments[1]||""):"";
const [menu,setMenu]=useState(false),[auto,setAuto]=useState(true);
const [feed,setFeed]=useState<Feed>({projects:[],updatedAt:"",errors:0});
const requestGeneration=useRef(0);
const [busy,setBusy]=useState(true),[error,setError]=useState("");
const navigate=(s:Section)=>{router.push(sectionPaths[s]);setMenu(false)};
async function refresh(){const generation=++requestGeneration.current;setBusy(true);try{const r=await fetch("/api/hub"+(project?"?project="+encodeURIComponent(project):""),{cache:"no-store"});if(!r.ok)throw Error("GitHub "+r.status);const next=await r.json();if(generation!==requestGeneration.current)return;setFeed(previous=>({...next,projects:next.projects.map((p:Feed["projects"][number])=>{const old=previous.projects.find(v=>v.slug===p.slug);return p.issues===null&&old?.fetchedAt?{...old,stale:true,error:p.error||"GitHub temporarily unavailable"}:p})}));setError("")}catch(e){if(generation!==requestGeneration.current)return;const message=e instanceof Error?e.message:"Cannot load data";setError(message);setFeed(previous=>({...previous,errors:previous.projects.length,projects:previous.projects.map(p=>({...p,stale:true,error:message}))}))}finally{if(generation===requestGeneration.current)setBusy(false)}}
useEffect(()=>{try{setAuto(localStorage.getItem("nbo-auto")!=="off")}catch{}},[]);

useEffect(()=>{void refresh();return()=>{requestGeneration.current++}},[project]);
useEffect(()=>{if(!auto)return;const id=setInterval(()=>void refresh(),120000);return()=>clearInterval(id)},[auto,project]);
return <HubShell tab={tab} projects={feed.projects} theme={theme} setTheme={setTheme} menu={menu} setMenu={setMenu} loading={busy} errors={feed.errors} refresh={()=>void refresh()} navigate={navigate}><HubContent tab={tab} feed={feed} project={project} onBack={()=>router.push("/projects")} onOpen={(slug)=>router.push(projectPath(slug))} navigate={navigate} loading={busy} error={error} refresh={refresh} theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto}/></HubShell>;
}

export default function NBOPage(){return <PremiumProvider><NBOPageCore/></PremiumProvider>}
