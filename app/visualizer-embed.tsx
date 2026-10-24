"use client";
import {useEffect,useRef} from "react";
import {usePremium} from "./premium-preferences";
export default function DataVisualizer(){
 const frame=useRef<HTMLIFrameElement>(null);
 const {appearance,palette}=usePremium();
 useEffect(()=>{const el=frame.current;if(!el)return;const send=()=>el.contentWindow?.postMessage({type:"NBO_THEME",appearance,palette},window.location.origin);el.addEventListener("load",send);send();return()=>el.removeEventListener("load",send)},[appearance,palette]);
 return <section className="visualizer-embed" aria-label="Interactive data visualizer"><iframe ref={frame} src="/visualizer/index.html" title="NBO interactive data universe" loading="eager" allow="fullscreen"/></section>;
}
