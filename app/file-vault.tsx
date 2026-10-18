"use client";
import {useEffect,useState} from "react";
import {listDocs,saveDoc,removeDoc,type LocalDoc} from "./local-docs";
export default function FileVault(){
const [docs,setDocs]=useState<LocalDoc[]>([]);
const [chosen,setChosen]=useState<File|null>(null);
const [notice,setNotice]=useState("");
useEffect(()=>{void reload()},[]);
async function reload(){try{setDocs(await listDocs())}catch{setNotice("Device storage is unavailable")}}
return <section className="panel"><h2>My documents</h2><p className="muted">Saved on this device, not in cloud storage.</p>
<input type="file" aria-label="Choose file" onChange={e=>setChosen(e.target.files?.[0]||null)}/>
<button className="btn primary" disabled={!chosen}>Save document</button>
{docs.map(d=><p key={d.name}>{d.name}</p>)}{notice&&<p role="status">{notice}</p>}
</section>;
}