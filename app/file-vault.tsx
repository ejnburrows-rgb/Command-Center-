"use client";
import {useEffect,useState} from "react";
import {listDocs,saveDoc,removeDoc,type LocalDoc} from "./local-docs";
import {exportBackup,restoreBackup} from "./local-backup";
export default function FileVault(){
const [docs,setDocs]=useState<LocalDoc[]>([]);
const [chosen,setChosen]=useState<File|null>(null);
const [notice,setNotice]=useState("");
useEffect(()=>{void reload()},[]);
async function reload(){try{setDocs(await listDocs())}catch{setNotice("Device storage is unavailable")}}
async function save(){if(!chosen)return;if(chosen.size>10000000){setNotice("10 MB per file maximum");return}try{await saveDoc(chosen);setChosen(null);setNotice("Saved on this device");await reload()}catch{setNotice("Save failed")}}
function download(d:LocalDoc){const url=URL.createObjectURL(d.file);const a=document.createElement("a");a.href=url;a.download=d.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
async function remove(d:LocalDoc){if(!confirm("Remove this document?"))return;await removeDoc(d.id);await reload()}
async function backup(){try{const n=await exportBackup();setNotice("Backup exported with "+n+" documents")}catch{setNotice("Backup export failed")}}
async function restore(file:File){try{const n=await restoreBackup(file);if(n>=0){setNotice("Backup restored");await reload();window.dispatchEvent(new Event("nbo-reset"))}}catch{setNotice("This backup could not be restored")}}
return <section className="panel"><h2>My documents</h2><p className="muted">Saved on this device, not in cloud storage.</p>
<input type="file" aria-label="Choose file" onChange={e=>setChosen(e.target.files?.[0]||null)}/>
<button className="btn primary" disabled={!chosen} onClick={()=>void save()}>Save document</button>
<div className="vault-backup"><button className="btn secondary" onClick={()=>void backup()}>Export complete backup</button><label className="btn secondary">Import backup<input aria-label="Import NBO backup" type="file" accept=".json" onChange={e=>{const file=e.target.files?.[0];if(file)void restore(file)}}/></label></div>
{docs.map(d=><div className="resource-row" key={d.id}><span>{d.name}</span><button className="linkbtn" onClick={()=>download(d)}>Download</button><button className="linkbtn" onClick={()=>void remove(d)}>Remove</button></div>)}{notice&&<p role="status">{notice}</p>}
</section>;
}