import { NextRequest, NextResponse } from 'next/server';
import { READ_REPOS } from '@/lib/repos';
import { allPages,github,summarize,errorText,type GitHubRecord } from '@/lib/public-github';
import {serverSnapshot} from '@/lib/server-snapshot';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const selected=request.nextUrl.searchParams.get('project');
 const projects=await Promise.all(READ_REPOS.map(async ref=>{
  const slug=ref.repo,url=`https://github.com/${ref.owner}/${slug}`,base=`/repos/${ref.owner}/${encodeURIComponent(slug)}`;
  try{
   // Repository metadata is validated BEFORE reading work; no authenticated/private data source.
   const result=await serverSnapshot(`public:${slug}`,30*60*1000,async()=>{
    const {data:meta}=await github(base);
    const [issues,pulls]=await Promise.all([allPages<GitHubRecord>(base+'/issues?state=open&sort=created&direction=asc'),allPages<GitHubRecord>(base+'/pulls?state=open&sort=created&direction=asc')]);
    const counts=summarize(issues,pulls);
    if(typeof meta.open_issues_count==='number'&&counts.issues+counts.prs!==meta.open_issues_count)throw new Error('GitHub totals changed during pagination; preserving last successful counts');
    const items=[...issues.filter(i=>!i.pull_request).map(i=>({...i,kind:'issue'})),...pulls.map(i=>({...i,kind:'pr'}))].map(i=>({number:i.number,title:i.title,url:i.html_url,updatedAt:i.updated_at,kind:i.kind,labels:(i.labels||[]).map(l=>typeof l==='string'?l:l.name||'')}));
    items.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
    return {slug,name:ref.label,url:meta.html_url,description:meta.description||'',visibility:'Public',language:meta.language||'',updatedAt:meta.updated_at,...counts,items,accessible:true,limited:false};
   });
   return {...result.value,items:selected===slug?result.value.items:[],fetchedAt:result.fetchedAt,stale:result.stale,error:result.error};
  }catch(e){return {slug,name:ref.label,url,description:'',visibility:'Unavailable',language:'',updatedAt:'',issues:null,prs:null,drafts:null,items:[],accessible:false,limited:true,fetchedAt:'',stale:true,error:errorText(e)};}
 }));
 return NextResponse.json({projects,updatedAt:new Date().toISOString(),errors:projects.filter(p=>p.stale).length},{headers:{'Cache-Control':'private, no-store'}});
}
