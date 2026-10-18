"use client";
import {useState} from "react";
const candidates=["/brand/nbo-logo.svg","/brand/nbo-logo.png","/brand/logo.svg","/brand/logo.png","https://raw.githubusercontent.com/ejnburrows-rgb/cartilla-de-gretel/main/src/assets/nbo-logo.png"];
export default function BrandMark(){
 const [index,setIndex]=useState(0);
 return <span className="brand-line"><span className="nbo-logo-frame">{index<candidates.length?<img src={candidates[index]} alt="" onError={()=>setIndex(i=>i+1)}/>:<svg viewBox="0 0 24 38" aria-hidden="true"><path d="M15.1 0 2.7 21.4h8.1L7.7 38 21.3 15.2h-8.1z"/></svg>}</span><strong>NBO</strong></span>;
}
