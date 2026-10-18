"use client";
import {useEffect,useState} from "react";
import HubShell from "./hub-shell";
import HubContent from "./hub-content";
import type {Feed,Section} from "./hub-data";
export default function NBOPage(){
const [tab,setTab]=useState<Section>("Hub"),[project,setProject]=useState("");
const [theme,setTheme]=useState("purple"),[menu,setMenu]=useState(false),[auto,setAuto]=useState(true);
const [feed,setFeed]=useState<Feed>({projects:[],updatedAt:"",errors:0});
const [busy,setBusy]=useState(true),[error,setError]=useState("");
const navigate=(s:Section)=>{setTab(s);setProject("");setMenu(false)};
async function refresh(){setBusy(true);try{const r=await fetch("/api/hub",{cache:"no-store"});if(!r.ok)throw Error("GitHub "+r.status);setFeed(await r.json());setError("")}catch(e){setError(e instanceof Error?e.message:"Cannot load data")}finally{setBusy(false)}}
useEffect(()=>{setTheme(localStorage.getItem("nbo-theme")==="teal"?"teal":"purple");setAuto(localStorage.getItem("nbo-auto")!=="off");void refresh()},[]);
useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("nbo-theme",theme)},[theme]);
useEffect(()=>{if(!auto)return;const id=setInterval(()=>void refresh(),120000);return()=>clearInterval(id)},[auto]);
return <HubShell tab={tab} theme={theme} setTheme={setTheme} menu={menu} setMenu={setMenu} loading={busy} errors={feed.errors} refresh={()=>void refresh()} navigate={navigate}><HubContent tab={tab} feed={feed} project={project} onBack={()=>setProject("")} onOpen={(slug)=>{setTab("Projects");setProject(slug);window.scrollTo(0,0)}} navigate={navigate} loading={busy} error={error} refresh={refresh} theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto}/></HubShell>;
}