import {NextRequest,NextResponse} from "next/server";
import {READ_REPOS} from "@/lib/repos";
import {github,errorText} from "@/lib/public-github";
import {serverSnapshot} from "@/lib/server-snapshot";
import {declaredAI,commitKind,timelineForCommits} from "@/lib/github-panel-logic";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(req:NextRequest){
 const slug=req.nextUrl.searchParams.get("repo")||"";
 const ref=READ_REPOS.find(r=>r.repo===slug);
 if(!ref)return NextResponse.json({error:"Repository not in the public project list."},{status:400,headers});
 const base="/repos/"+ref.owner+"/"+ref.repo;
 const sha=req.nextUrl.searchParams.get("sha");
 if(sha!==null){
  if(!/^[a-f0-9]{40}$/i.test(sha))return NextResponse.json({error:"Invalid commit identifier."},{status:400,headers});
  try{
   const {data}=await github(base+"/commits/"+sha);
   if(!Array.isArray(data.files))throw new Error("Changed-file list unavailable");
   return NextResponse.json({sha,files:data.files.slice(0,100).map((f:{filename:string;status:string;additions:number;deletions:number})=>({
    name:f.filename,status:f.status,additions:f.additions,deletions:f.deletions
   })),truncated:data.files.length>100},{headers});
  }catch(e){return NextResponse.json({error:errorText(e)},{status:503,headers});}
 }
 try{
  const result=await serverSnapshot("github-panel:"+slug,30*60*1000,async()=>{
   const {data}=await github(base+"/commits?per_page=100");
   if(!Array.isArray(data))throw new Error("GitHub did not return a commit history");
   const items=data.map((item:{
    sha:string;html_url:string;commit:{message:string;author?:{date?:string;name?:string}};
    author?:{login?:string}
   })=>{
    const message=item.commit?.message||"";
    const title=message.split("\n")[0].slice(0,240);
    return {sha:item.sha,url:item.html_url,title,message,date:item.commit?.author?.date||"",
     author:item.author?.login||item.commit?.author?.name||"Unknown",
     category:commitKind(title),declaredAgent:declaredAI(message)};
   }).filter((c:{sha:string;date:string})=>/^[a-f0-9]{40}$/i.test(c.sha)&&!!c.date);
   return {items,timeline:timelineForCommits(items)};
  });
  return NextResponse.json({repo:slug,...result.value,fetchedAt:result.fetchedAt,stale:result.stale,error:result.error||null},{headers});
 }catch(e){return NextResponse.json({error:errorText(e),repo:slug,items:[],timeline:[],stale:true},{status:503,headers});}
}
