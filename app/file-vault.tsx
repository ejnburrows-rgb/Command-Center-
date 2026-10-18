"use client";
import {useState,useEffect} from "react";
export default function FileVault(){
const [enabled,setEnabled]=useState(false);
const [files,setFiles]=useState<{name:string;url:string}[]>([]);
const [status,setStatus]=useState("");
const [chosen,setChosen]=useState<File|null>(null);
const [saving,setSaving]=useState(false);
async function reload(){
try{const r=await fetch("/api/library",{cache:"no-store"});const d=await r.json();
setEnabled(!!d.configured);setFiles(d.files||[]);if(d.error)setStatus(d.error);
}catch{setStatus("Storage connection unavailable")}}
useEffect(()=>{void reload()},[]);
async function save(){
if(!chosen)return;
setSaving(true);setStatus("Saving to GitHub…");
try{
const form=new FormData();form.append("file",chosen);
const r=await fetch("/api/library",{method:"POST",body:form});
const d=await r.json();
if(d.saved){setStatus("Saved permanently in GitHub commit "+d.commit.slice(0,8));setChosen(null);await reload();}
else setStatus(d.error||"File not saved.");
}catch{setStatus("Network error: file not saved.");}
finally{setSaving(false);}
}
return <section className="panel">
<h2>Saved documents</h2><p className="muted">Versioned files in the private NBO GitHub repository.</p>
<p className={enabled?"green":"amber"}>{enabled?"Cloud storage connected":"GitHub storage authorization needed"}</p>
<button className="btn secondary" onClick={()=>void reload()}>Check connection</button>
<div className="vault-controls">
<input aria-label="Choose a file" type="file" accept=".md,.txt,.json,.csv,.png,.jpg,.jpeg,.webp,.pdf" onChange={e=>setChosen(e.target.files?.[0]||null)}/>
<button className="btn primary" disabled={!enabled||!chosen||saving} onClick={()=>void save()}>{saving?"Saving…":"Save file"}</button>
</div>
{files.map(f=><p key={f.url}><a target="_blank" rel="noopener noreferrer" href={f.url}>{f.name}</a></p>)}
{status&&<p role="status">{status}</p>}
</section>
}