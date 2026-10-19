"use client";
import {useEffect,useState} from "react";
import type {LanesFeed} from "./lanes-types";
const initial:LanesFeed={lanes:[],approvals:[],checkedAt:"",partial:false,errors:[]};
export function useLanes(){
 const [feed,setFeed]=useState<LanesFeed>(initial);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 async function refresh(){
  setLoading(true);
  try{
   const r=await fetch("/api/lanes",{cache:"no-store"});
   if(!r.ok)throw Error("GitHub lane feed HTTP "+r.status);
   const v:LanesFeed=await r.json();
   setFeed(v);
   setError(v.errors.length?v.errors.join(" · "):"");
  }catch(e){setError(e instanceof Error?e.message:"GitHub lane data unavailable")}
  finally{setLoading(false)}
 }
 useEffect(()=>{void refresh();const timer=setInterval(()=>void refresh(),240000);return()=>clearInterval(timer)},[]);
 return {feed,loading,error,refresh};
}
