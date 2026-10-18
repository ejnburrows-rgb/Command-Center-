import {NextResponse} from "next/server";
import type {Lane,LanesFeed,OwnerItem,LaneStatus} from "@/app/lanes-types";
export const dynamic="force-dynamic";
const owner="ejnburrows-rgb",repo="cartilla-de-gretel";
const root="https://github.com/"+owner+"/"+repo;
type Label={name:string};
type Branch={name:string;commit:{sha:string}};
type PR={number:number;title:string;body:string|null;html_url:string;draft:boolean;state:string;merged_at:string|null;updated_at:string;head:{ref:string};labels:Label[]};
type Issue={number:number;title:string;body:string|null;html_url:string;updated_at:string;labels:Label[];pull_request?:unknown};
const words=(s:string)=>s.replace(/[_/]+/g," ").replace(/[-]+/g," ").trim();
const summary=(s:string)=>words(s).replace(/^DRAFT:\s*/i,"").slice(0,155);
const named=(p:PR)=>{const name=p.head.ref||p.title;return /^swarm\/lesson[-/]/.test(name)?words(name.replace(/^swarm\//,"")):summary(p.title).slice(0,86)};
const labels=(a:Label[]=[])=>(a||[]).map(l=>l.name?.toLowerCase()||"");
const waiting=(p:PR)=>{const ls=labels(p.labels).join(" ");const t=p.title+" "+ls+" "+(p.body||"").slice(0,320);return /(?:owner[\s_-]*(?:approval|review|decision|yes)|needs[\s_-]*owner|waiting[\s_-]*(?:on[\s_-]*)?owner|awaiting[\s_-]*owner|approval[\s_-]*pending|ready[\s_-]*for[\s_-]*(?:owner|merge)|merge[\s_-]*decision)/i.test(t)};
const blocked=(ls:string[],title:string)=>ls.some(l=>/^(blocked|blocker|needs[- ]owner|waiting[- ]owner)$/.test(l))||/^\[BLOCKED\]/i.test(title);
function branchLink(name:string){return root+"/tree/"+name.split("/").map(encodeURIComponent).join("/")}
async function read<T>(path:string):Promise<T>{
 const response=await fetch("https://api.github.com/repos/"+owner+"/"+repo+"/"+path,{
 headers:{Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},
 next:{revalidate:240}});
 if(!response.ok)throw new Error(response.status===403||response.status===429?"GitHub rate limit reached":response.status===404?"GitHub resource missing":"GitHub HTTP "+response.status);
 return response.json() as Promise<T>;
}
export async function GET(){
 const tasks=await Promise.allSettled([
 read<Branch[]>("branches?per_page=100"),
 read<PR[]>("pulls?state=open&per_page=100&sort=updated&direction=desc"),
 read<PR[]>("pulls?state=closed&per_page=100&sort=updated&direction=desc"),
 read<Issue[]>("issues?state=open&per_page=100&sort=updated&direction=desc")]);
 const errors:string[]=[];
 const values=tasks.map((t,i)=>{if(t.status==="rejected"){errors.push(["Branches","Open pull requests","Closed pull requests","Issues"][i]+": "+String(t.reason));return []}return t.value});
 const [branches,open,closed,issues]=values as [Branch[],PR[],PR[],Issue[]];
 const partial=values.some(v=>v.length>=100)||errors.length>0;
 const orphanBranches=branches.filter(b=>/^swarm\\/lesson[-/]/.test(b.name)&&!open.some(p=>p.head.ref===b.name));
 const branchTimestamps=new Map<string,string>();
 await Promise.all(orphanBranches.slice(0,15).map(async b=>{try{
  const info=await read<{commit:{committer?:{date?:string};author?:{date?:string}}}>("commits/"+encodeURIComponent(b.commit.sha));
  branchTimestamps.set(b.name,info.commit.committer?.date||info.commit.author?.date||"");
 }catch{branchTimestamps.set(b.name,"")}}));
 const lanes:Lane[]=[];
 const seen=new Set<string>();
 function add(l:Lane){if(seen.has(l.id))return;seen.add(l.id);lanes.push(l)}
 for(const p of open){
   const ls=labels(p.labels);
   const isBlocked=blocked(ls,p.title);
   const status:LaneStatus=isBlocked?"Blocked":p.draft?"Draft":"Open";
   add({id:"pr-"+p.number,name:named(p),status,summary:summary(p.title),updatedAt:p.updated_at,sourceUrl:p.html_url,prUrl:p.html_url,sourceType:"pull request",verified:true,branch:p.head.ref});
 }
 for(const b of branches.filter(b=>/^swarm\/lesson[-/]/.test(b.name))){
   if(open.some(p=>p.head.ref===b.name))continue;
   add({id:"branch-"+b.name,name:words(b.name.replace(/^swarm\//,"")),status:"Open",
      summary:"Lesson branch exists; no matching open pull request.",updatedAt:branchTimestamps.get(b.name)||"",sourceUrl:branchLink(b.name),
      sourceType:"branch",verified:true,branch:b.name});
 }
 for(const p of closed.filter(p=>p.merged_at&&(/^swarm\/lesson[-/]/.test(p.head.ref)||/(?:lesson|lane)\s*\d+/i.test(p.title))).slice(0,18)){
   if(open.some(o=>o.head.ref===p.head.ref))continue;
   add({id:"pr-"+p.number,name:named(p),status:"Merged",summary:summary(p.title),updatedAt:p.merged_at||p.updated_at,sourceUrl:p.html_url,prUrl:p.html_url,sourceType:"pull request",verified:true,branch:p.head.ref});
 }
 for(const i of issues.filter(i=>!i.pull_request)){
   const ls=labels(i.labels),match=/(?:lane|lesson)\s*[-#:]*\s*\d+/i.test(i.title)||ls.some(l=>/lane|lesson|blocked/.test(l));
   if(!match)continue;
   const isBlocked=blocked(ls,i.title);
   add({id:"issue-"+i.number,name:summary(i.title).slice(0,82),status:isBlocked?"Blocked":"Open",summary:summary(i.title),updatedAt:i.updated_at,sourceUrl:i.html_url,sourceType:"issue",verified:true});
 }
 const approvals:OwnerItem[]=open.filter(waiting).map(p=>({id:"approval-"+p.number,title:summary(p.title),reason:p.draft?"Draft waiting for an owner decision":"Open PR requiring an owner decision",url:p.html_url,updatedAt:p.updated_at,verified:true}));
 lanes.sort((a,b)=>{const order={Blocked:0,Draft:1,Open:2,Merged:3};return order[a.status]-order[b.status]||(b.updatedAt||"").localeCompare(a.updatedAt||"")});
 const result:LanesFeed={lanes,approvals,checkedAt:new Date().toISOString(),partial,errors};
 return NextResponse.json(result,{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=120"}});
}
