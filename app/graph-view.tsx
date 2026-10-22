"use client";
import {useState} from "react";
import type {Project,Section} from "./hub-data";

type Leaf={id:string;label:string;sub:string;action:()=>void};
type Branch={id:string;label:string;sub:string;leaves:Leaf[]};

const W=360, LW=132, LEAFW=128;

export default function WebGraph({projects,onOpenProject,onSection}:{projects:Project[];onOpenProject:(slug:string)=>void;onSection:(s:Section)=>void}){
 const [open,setOpen]=useState<Record<string,boolean>>({"cartilla-de-gretel":true});
 const toggle=(id:string)=>setOpen(o=>({...o,[id]:!o[id]}));
 const branches:Branch[]=projects.map(p=>{
  const leaves:Leaf[]=[];
  if(p.slug==="cartilla-de-gretel")leaves.push({id:p.slug+"-art",label:"Art inventory",sub:"live page",action:()=>{window.location.href="/art-inventory"}});
  leaves.push({id:p.slug+"-work",label:"Open work",sub:p.accessible?`${p.issues} issues · ${p.prs} PRs`:"restricted",action:()=>onOpenProject(p.slug)});
  leaves.push({id:p.slug+"-repo",label:"Repository",sub:"github.com ↗",action:()=>window.open(p.url,"_blank","noopener")});
  return {id:p.slug,label:p.slug==="cartilla-de-gretel"?"La Cartilla":p.name,sub:(open[p.slug]?"open":"closed")+" · "+leaves.length+" inside",leaves};
 });
 branches.push({id:"library",label:"Library",sub:(open["library"]?"open":"closed")+" · 2 inside",leaves:[
  {id:"lib-prompts",label:"Prompt library",sub:"copy-ready",action:()=>onSection("Prompts")},
  {id:"lib-guides",label:"Playbook",sub:"workflow",action:()=>onSection("Playbook")}
 ]});
 const m=branches.length;
 const xs=(i:number)=>m===1?W/2:m===2?[95,265][i]:[66,183,300][Math.min(i,2)];
 const isOpen=(id:string)=>!!open[id];
 const maxLeaves=Math.max(0,...branches.map(b=>isOpen(b.id)?b.leaves.length:0));
 const H=176+maxLeaves*46+16;
 return <div className="graphwrap"><svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" aria-label="Web graph of the hub">
  {branches.map((b,i)=><line key={"e"+b.id} x1={W/2} y1={52} x2={xs(i)} y2={100} className="edge"/>)}
  {branches.map((b,i)=>isOpen(b.id)&&b.leaves.map((l,k)=><line key={"e"+l.id} x1={xs(i)} y1={136} x2={xs(i)} y2={172+k*46} className="edge leaf-edge"/>))}
  <g className="gnode root" onClick={()=>onSection("Home")} role="button" aria-label="NBO hub home">
   <rect x={W/2-52} y={18} width={104} height={38} rx={19}/><text className="nl root-l" x={W/2} y={42} textAnchor="middle">NBO HUB</text>
  </g>
  {branches.map((b,i)=><g key={b.id} className={"gnode branch"+(isOpen(b.id)?" open":"")} onClick={()=>toggle(b.id)} role="button" aria-expanded={isOpen(b.id)} aria-label={b.label+" - tap to "+(isOpen(b.id)?"collapse":"expand")}>
   <rect x={xs(i)-LW/2} y={100} width={LW} height={40} rx={20}/>
   <text className="nl" x={xs(i)} y={118} textAnchor="middle">{b.label}</text>
   <text className="ns" x={xs(i)} y={132} textAnchor="middle">{b.sub}</text>
  </g>)}
  {branches.map((b,i)=>isOpen(b.id)&&b.leaves.map((l,k)=><g key={l.id} className="gnode leaf" style={{animationDelay:(k*60)+"ms"}} onClick={(e)=>{e.stopPropagation();l.action()}} role="button" aria-label={l.label}>
   <rect x={xs(i)-LEAFW/2} y={172+k*46} width={LEAFW} height={34} rx={17}/>
   <text className="nl leaf-l" x={xs(i)} y={187+k*46} textAnchor="middle">{l.label}</text>
   <text className="ns leaf-s" x={xs(i)} y={199+k*46} textAnchor="middle">{l.sub}</text>
  </g>))}
 </svg><p className="graph-hint">Tap a node to open or close it. Tap a leaf to go there.</p></div>;
}
