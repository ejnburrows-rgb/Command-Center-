"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
export type Palette="blue"|"purple"|"teal"|"mono";
export type Appearance="light"|"dark";
export type WorkspaceMode="overview"|"coding"|"review"|"focus";
const palettes:Palette[]=["blue","purple","teal","mono"];
const appearances:Appearance[]=["light","dark"];
const workspaces:WorkspaceMode[]=["overview","coding","review","focus"];
export const paletteLabels:Record<Palette,string>={blue:"Ocean Blue",purple:"Violet",teal:"Teal",mono:"Monochrome"};
export const workspaceLabels:Record<WorkspaceMode,string>={overview:"Overview",coding:"Coding",review:"Review",focus:"Focus"};
export function isPalette(v:string):v is Palette{return palettes.includes(v as Palette)}
export function isAppearance(v:string):v is Appearance{return appearances.includes(v as Appearance)}
export function isWorkspaceMode(v:string):v is WorkspaceMode{return workspaces.includes(v as WorkspaceMode)}
export function visibleInWorkspace(workspace:WorkspaceMode,state:string){
 if(workspace==="coding")return state==="draft"||state==="active";
 if(workspace==="review")return state==="proof"||state==="owner";
 return true;
}
type Preferences={palette:Palette;setPalette:(p:Palette)=>void;appearance:Appearance;setAppearance:(a:Appearance)=>void;workspace:WorkspaceMode;setWorkspace:(w:WorkspaceMode)=>void};
const Context=createContext<Preferences|null>(null);
export function PremiumProvider({children}:{children:ReactNode}){
 const [palette,setPalette]=useState<Palette>("blue");
 const [appearance,setAppearance]=useState<Appearance>("dark");
 const [workspace,setWorkspace]=useState<WorkspaceMode>("overview");
 useEffect(()=>{
  try{
   const storedPalette=localStorage.getItem("nbo-palette")||localStorage.getItem("nbo-theme")||"blue";
   const storedAppearance=localStorage.getItem("nbo-appearance")||"dark";
   const storedWorkspace=localStorage.getItem("nbo-workspace")||"overview";
   setPalette(isPalette(storedPalette)?storedPalette:"blue");
   setAppearance(isAppearance(storedAppearance)?storedAppearance:"dark");
   setWorkspace(isWorkspaceMode(storedWorkspace)?storedWorkspace:"overview");
  }catch{/* Protected storage may be unavailable; retain functional in-memory defaults. */}
 },[]);
 useEffect(()=>{document.documentElement.dataset.theme=palette;try{localStorage.setItem("nbo-palette",palette)}catch{}},[palette]);
 useEffect(()=>{document.documentElement.dataset.appearance=appearance;document.documentElement.style.colorScheme=appearance;try{localStorage.setItem("nbo-appearance",appearance)}catch{}},[appearance]);
 useEffect(()=>{document.documentElement.dataset.workspace=workspace;try{localStorage.setItem("nbo-workspace",workspace)}catch{}},[workspace]);
 return <Context.Provider value={{palette,setPalette,appearance,setAppearance,workspace,setWorkspace}}>{children}</Context.Provider>;
}
export function usePremium(){const ctx=useContext(Context);if(!ctx)throw new Error("PremiumProvider missing");return ctx}
