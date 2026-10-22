"use client";
import {useEffect,useState,useCallback} from "react";
import HubShell from "./hub-shell";
import HubContent from "./hub-content";
import type {Feed,Section} from "./hub-data";
const valid:Section[]=["Home","Lanes","Projects","Playbook","Prompts","Files","Settings"];
export default function NBOPage(){
const [tab,setTab]=useState<Section>("Home"),[project,setProject]=useState("");
const [theme,setTheme]=useState("chrome"),[auto,setAuto]=useState(true);
const [feed,setFeed]=useState<Feed>({projects:[],updatedAt:"",errors:0});
const [busy,setBusy]=useState(true),[error,setError]=useState("");
const applyHash=useCallback(()=>{const h=window.location.hash.replace(/^#\/?/,"");const [t,p]=h.split("/");setTab(valid.includes(t as Section)?t as Section:"Home");setProject(t==="Projects"&&p?decodeURIComponent(p):"")},[]);
useEffect(()=>{applyHash();window.addEventListener("hashchange",applyHash);return()=>window.removeEventListener("hashchange",applyHash)},[applyHash]);
const navigate=(s:Section)=>{window.location.hash=s};
const openProject=(slug:string)=>{window.location.hash="Projects/"+encodeURIComponent(slug)};
async function refresh(){setBusy(true);try{const r=await fetch("/api/hub",{cache:"no-store"});if(!r.ok)throw Error("GitHub "+r.status);setFeed(await r.json());setError("")}catch(e){setError(e instanceof Error?e.message:"Cannot load data")}finally{setBusy(false)}}
useEffect(()=>{setTheme(localStorage.getItem("nbo-theme-v2")==="light"?"light":"chrome");setAuto(localStorage.getItem("nbo-auto")!=="off");void refresh()},[]);
useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("nbo-theme-v2",theme)},[theme]);
useEffect(()=>{if(!auto)return;const id=setInterval(()=>void refresh(),120000);return()=>clearInterval(id)},[auto]);
return <HubShell tab={tab} current={project?feed.projects.find(p=>p.slug===project)?.name:undefined} theme={theme} setTheme={setTheme} loading={busy} errors={feed.errors} refresh={()=>void refresh()} navigate={navigate}><HubContent tab={tab} feed={feed} project={project} onBack={()=>navigate("Projects")} onOpen={openProject} navigate={navigate} loading={busy} error={error} refresh={refresh} theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto}/></HubShell>;
}
