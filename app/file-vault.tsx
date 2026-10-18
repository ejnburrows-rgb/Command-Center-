"use client";
import {useState} from "react";
export default function FileVault(){
 const [status,setStatus]=useState("Not configured");
 return <section className="panel"><h2>Saved documents</h2><p>{status}</p><button onClick={()=>setStatus("GitHub authorization is needed for cloud storage.")}>Check storage</button></section>
}