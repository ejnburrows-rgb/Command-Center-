import { NextResponse } from "next/server";
import { READ_REPOS } from "@/lib/repos";
export const dynamic = "force-dynamic";
type GHIssue={number:number;title:string;html_url:string;updated_at:string;labels:{name:string}[];pull_request?:unknown};
async function get(path:string){
 const r=await fetch("https://api.github.com"+path,{headers:{Accept:"application/vnd.github+json"},next:{revalidate:900}});
 if(!r.ok)throw new Error("GitHub "+r.status);
 return r.json();
}
export async function GET(){
 const projects=await Promise.all(READ_REPOS.map(async r=>{
 const slug=r.repo,url="https://github.com/"+r.owner+"/"+slug;
 try{
 const meta=await get("/repos/"+r.owner+"/"+encodeURIComponent(slug));
 const all:GHIssue[]=await get("/repos/"+r.owner+"/"+encodeURIComponent(slug)+"/issues?state=open&per_page=30&sort=updated");
 const items=all.map(i=>({number:i.number,title:i.title,url:i.html_url,updatedAt:i.updated_at,kind:i.pull_request?"pr":"issue",labels:(i.labels||[]).map(l=>typeof l==="string"?l:l.name)}));
 return {slug,name:r.label,url:meta.html_url,description:meta.description||"",visibility:meta.private?"Private":"Public",language:meta.language||"",updatedAt:meta.updated_at,issues:items.filter(i=>i.kind==="issue").length,prs:items.filter(i=>i.kind==="pr").length,items,accessible:true,limited:items.length>=30};
 }catch(e){return{slug,name:r.label,url,description:"",visibility:"Restricted",language:"",updatedAt:"",issues:0,prs:0,items:[],accessible:false,limited:false,error:e instanceof Error?e.message:"GitHub unavailable"}}
 }));
 return NextResponse.json({projects,updatedAt:new Date().toISOString(),errors:projects.filter(p=>!p.accessible).length},{headers:{"Cache-Control":"private, no-store"}});
}