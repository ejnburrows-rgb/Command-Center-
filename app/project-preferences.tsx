"use client";
import {useEffect,useState} from "react";
export function useStored<T>(key:string,initial:T){
const [value,setValue]=useState<T>(initial),[ready,setReady]=useState(false),[error,setError]=useState("");
useEffect(()=>{try{const raw=localStorage.getItem(key);setValue(raw!==null?JSON.parse(raw):initial)}catch{setError("Saved preferences could not be read.")}setReady(true)},[key]);
function save(next:T){try{localStorage.setItem(key,JSON.stringify(next));setValue(next);setError("")}catch{setError("Could not save on this device.")}}
return {value,save,ready,error};
}
export function usePins(){return useStored<string[]>("nbo-pins-v1",[])}
export function Pin({slug,pins,toggle}:{slug:string;pins:string[];toggle:(s:string)=>void}){const pinned=pins.includes(slug);return <button className="btn secondary pin" aria-label={(pinned?"Unpin ":"Pin ")+slug} aria-pressed={pinned} onClick={()=>toggle(slug)}>{pinned?"★ Pinned":"☆ Pin"}</button>}
