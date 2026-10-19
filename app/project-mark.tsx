"use client";
import {useState} from "react";
const logos:Record<string,string>={
 "cartilla-de-gretel":"public/favicon.svg",
 "otto":"logo.jpg",
 "tucker-pool-crm":"public/nbo-logo.png",
 "otto-plumbing-site":"logo.webp",
 "dbarrera-y-mas":"logo.png"
};
export default function ProjectMark({slug,name,large=false}:{slug:string;name:string;large?:boolean}){
 const [bad,setBad]=useState(false);
 const path=logos[slug];
 const src=path?"https://raw.githubusercontent.com/ejnburrows-rgb/"+encodeURIComponent(slug)+"/main/"+path:"";
 const initials=name.split(/\s+/).filter(w=>/[a-zA-ZÀ-ÿ]/.test(w)).slice(0,2).map(w=>w[0]?.toUpperCase()).join("")||"NB";
 return <span className={"project-mark "+(large?"project-mark-large":"")} aria-label={name+" logo"}>
 {src&&!bad?<img src={src} alt="" loading="lazy" onError={()=>setBad(true)}/>:<strong aria-hidden="true">{initials}</strong>}
 </span>;
}
