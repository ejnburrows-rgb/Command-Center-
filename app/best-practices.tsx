"use client";
import {useEffect,useState} from "react";
import {stages,prompts} from "./hub-data";
import {Icon} from "./hub-ui";
export default function BestPractices(){
const [stage,setStage]=useState(0),[checks,setChecks]=useState<Record<string,boolean>>({}),[notice,setNotice]=useState("");
useEffect(()=>{try{setChecks(JSON.parse(localStorage.getItem("nbo-checks")||"{}"))}catch{}},[]);
const toggle=(key:string)=>{const v={...checks,[key]:!checks[key]};setChecks(v);localStorage.setItem("nbo-checks",JSON.stringify(v))};
const copy=async()=>{try{await navigator.clipboard.writeText(prompts[stages[stage].prompt].text);setNotice("Copied to clipboard")}catch{setNotice("Browser clipboard permission required")}};
const current=stages[stage];
return <><div className="tabs" role="tablist">{stages.map((p,i)=><button key={p.key} role="tab" aria-selected={stage===i} className={stage===i?"selected":""} onClick={()=>setStage(i)}>{p.name}</button>)}</div><section className="panel practice"><div className="practice-head"><span className="round big">{stage+1}</span><div><p className="eyebrow">PROJECT PLAYBOOK</p><h2>{current.name}</h2><p className="muted">Your reusable workflow. Checks are saved in this browser.</p></div></div>{current.steps.map((s,i)=><label className="checkrow" key={s}><input type="checkbox" checked={!!checks[current.key+i]} onChange={()=>toggle(current.key+i)}/><span>{s}</span></label>)}<div className="practice-foot"><span className="muted">{current.steps.filter((s,i)=>checks[current.key+i]).length} of {current.steps.length} completed</span><button className="btn primary" onClick={()=>void copy()}><Icon name="copy"/> Copy stage prompt</button></div>{notice&&<p role="status" className="accent-note">{notice}</p>}</section><section className="panel"><h2>Evidence over labels</h2><p className="muted">Draft, merged, deployed and tested are different milestones. Mark work complete only when you can check the actual functioning result.</p></section></>;
}