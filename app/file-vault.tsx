"use client";
import {useEffect,useState} from "react";
export default function FileVault(){
const [docs,setDocs]=useState<{name:string;data:string}[]>([]);
const [chosen,setChosen]=useState<File|null>(null);
const [notice,setNotice]=useState("");
useEffect(()=>{try{setDocs(JSON.parse(localStorage.getItem("nbo-files")||"[]"))}catch{}},[]);
return <section className="panel"><h2>My documents</h2><p className="muted">Saved on this device, not in cloud storage.</p>
<input type="file" aria-label="Choose file" onChange={e=>setChosen(e.target.files?.[0]||null)}/>
<button className="btn primary" disabled={!chosen}>Save document</button>
{docs.map(d=><p key={d.name}>{d.name}</p>)}{notice&&<p role="status">{notice}</p>}
</section>;
}