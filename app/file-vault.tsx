"use client";
import {useState,useEffect} from "react";
export default function FileVault(){
const [enabled,setEnabled]=useState(false);
const [files,setFiles]=useState<{name:string;url:string}[]>([]);
const [status,setStatus]=useState("");
async function reload(){
try{const r=await fetch("/api/library",{cache:"no-store"});const d=await r.json();
setEnabled(!!d.configured);setFiles(d.files||[]);if(d.error)setStatus(d.error);
}catch{setStatus("Storage connection unavailable")}}
useEffect(()=>{void reload()},[]);
return <section className="panel">
<h2>Saved documents</h2><p className="muted">Versioned files in the private NBO GitHub repository.</p>
<p className={enabled?"green":"amber"}>{enabled?"Cloud storage connected":"GitHub storage authorization needed"}</p>
<button className="btn secondary" onClick={()=>void reload()}>Check connection</button>
{files.map(f=><p key={f.url}><a target="_blank" rel="noopener noreferrer" href={f.url}>{f.name}</a></p>)}
{status&&<p role="status">{status}</p>}
</section>
}