"use client";
import {useState} from "react";
import HubShell from "./hub-shell";
import HubContent from "./hub-content";
import type {Feed,Section} from "./hub-data";
export default function NBOPage(){
const [tab,setTab]=useState<Section>("Hub"),[project,setProject]=useState("");
const [theme,setTheme]=useState("purple"),[menu,setMenu]=useState(false),[auto,setAuto]=useState(true);
const [feed]=useState<Feed>({projects:[],updatedAt:"",errors:0});
const navigate=(s:Section)=>{setTab(s);setProject("");setMenu(false)};
const refresh=()=>{};
return <HubShell tab={tab} theme={theme} setTheme={setTheme} menu={menu} setMenu={setMenu} loading={false} errors={0} refresh={refresh} navigate={navigate}><HubContent tab={tab} feed={feed} project={project} onBack={()=>setProject("")} onOpen={setProject} navigate={navigate} loading={false} error="" refresh={refresh} theme={theme} setTheme={setTheme} auto={auto} setAuto={setAuto}/></HubShell>;
}