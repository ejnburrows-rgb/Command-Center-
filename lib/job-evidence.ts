import {allPages,github,type GitHubRecord} from './public-github';
import {currentExecutionAuthority} from './execution-authority.mjs';
import {serverSnapshot} from './server-snapshot';
const repo='/repos/ejnburrows-rgb/cartilla-de-gretel';
export const jobSource='https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877';
export type JobStatus='NOT STARTED'|'IN PROGRESS'|'PR OPEN'|'VERIFIED'|'MERGED'|'LIVE'|'UNVERIFIED';
export type Job={id:number;title:string;status:JobStatus;githubState?:'PR OPEN'|'MERGED'|'PR CLOSED';sourceUrl:string;prUrl?:string;proofUrl?:string;updatedAt?:string;ownerDecision?:string;missingEvidence:string[]};
export type Approval={id:string;title:string;project:string;sourceUrl:string;proofUrl:string;updatedAt:string;state:string};
export type Comment={id:number;body:string;html_url:string;updated_at:string;user?:{login:string}};
export function canonicalJobs(body:string,updatedAt:string):Job[]{
 const section=body.split(/^##\s+Jobs\s*$/im)[1];
 if(!section)throw new Error('Canonical Jobs section is missing from issue #877');
 const jobs=[...section.matchAll(/^\s*(\d+)\.\s+\*\*([^\n]+?)\*\*([^\n]*)/gm)].map(m=>({id:Number(m[1]),title:m[2].trim().replace(/\.$/,''),status:'UNVERIFIED' as JobStatus,sourceUrl:jobSource,updatedAt,ownerDecision:/waiting on the owner|owner.s pick/i.test(m[3])?m[3].trim():undefined,missingEvidence:['No verified matching PR','No verification artifact']}));
 if(!jobs.length)throw new Error('Canonical job definitions could not be read');
 return jobs;
}
export function explicitJobIds(body:string):number[]{
 // Require JOB 1 / JOB #1 / JOB: 1, rather than matching loose lesson numbers.
 return [...new Set([...body.matchAll(/\bJOB\s*(?:#|:|-)?\s*(\d+)\b/gi)].map(m=>Number(m[1])))];
}
export function urls(body:string):string[]{return [...new Set((body.match(/https:\/\/[^\s<>\[\]()"']+/g)||[]).map(url=>url.replace(/[.,;]+$/,'')))];}
export function matchingPr(body:string):string|undefined{return urls(body).find(u=>/^https:\/\/github\.com\/ejnburrows-rgb\/cartilla-de-gretel\/pull\/\d+(?:#.*)?$/.test(u));}
export function approvalType(body:string):'pictures'|'merge'|'voice'|undefined{
 // A generic "needs owner" or a draft PR is insufficient.
 const question=body.match(/(?:NEEDS FROM OWNER|OWNER DECISION|OWNER APPROVAL|AWAITING OWNER APPROVAL|WAITING FOR OWNER APPROVAL)\s*[:|/—-]?\s*([^\n]+)/i)?.[1]||'';
 if(/^(?:none|nothing|no|n\/a)\b/i.test(question.trim()))return;
 if(/(?:approve|approval|decision|select|choose|pick|confirm)/i.test(question)){
  if(/(?:picture|artwork|image).*(?:live|publish)|(?:live|publish).*(?:picture|artwork|image)/i.test(question))return 'pictures';
  if(/merg(?:e|ing).*main|main.*merg/i.test(question))return 'merge';
  if(/final.*voice|voice.*final/i.test(question))return 'voice';
 }
}
export function eligibleApproval(comment:Comment,proofUrl:string|undefined):Approval|undefined{
 const type=approvalType(comment.body);if(!type||!proofUrl)return;
 return {id:String(comment.id),title:type==='pictures'?'Approve pictures going live?':type==='merge'?'Approve merge to main?':'Approve the final voice?',project:'cartilla-de-gretel',sourceUrl:comment.html_url,proofUrl,updatedAt:comment.updated_at,state:'Awaiting owner approval'};
}
export async function visualArtifact(url:string):Promise<boolean>{
 try{
  const parsed=new URL(url);
  const allowed=parsed.hostname==='user-images.githubusercontent.com'||(parsed.hostname==='github.com'&&(parsed.pathname.startsWith('/user-attachments/assets/')||/^\/ejnburrows-rgb\/cartilla-de-gretel\/(?:blob|raw)\//.test(parsed.pathname)));
  if(!allowed||parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.port)return false;
  const response=await fetch(url,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(6000),cache:'no-store'});
  // Do not follow untrusted redirects. GitHub blob pages are valid image artifacts only with image suffixes.
  return response.ok&&(response.headers.get('content-type')?.startsWith('image/')===true||/\.(png|jpe?g|webp|gif)(?:\?|$)/i.test(parsed.pathname));
 }catch{return false;}
}
export type EvidenceDependencies={pr:(number:number)=>Promise<GitHubRecord>;artifact:(url:string)=>Promise<boolean>};
export async function buildEvidence(body:string,updatedAt:string,comments:Comment[],dependencies:EvidenceDependencies){
 const jobs=canonicalJobs(body,updatedAt);const approvals:Approval[]=[];
 const prCache=new Map<number,Promise<GitHubRecord>>();const artifactCache=new Map<string,Promise<boolean>>();
 const latest=new Map<number,Comment>();
 for(const comment of [...comments].sort((a,b)=>a.updated_at.localeCompare(b.updated_at))){
  const ids=explicitJobIds(comment.body).filter(id=>jobs.some(job=>job.id===id));
  if(ids.length===1)latest.set(ids[0],comment);
 }
 for(const comment of latest.values()){
  const ids=explicitJobIds(comment.body).filter(id=>jobs.some(job=>job.id===id));
  if(ids.length!==1)continue; // Ambiguous multi-job reports cannot establish one job's proof.
  const job=jobs.find(job=>job.id===ids[0])!;
  const links=urls(comment.body);let proof:string|undefined;
  for(const link of links){if(!artifactCache.has(link))artifactCache.set(link,dependencies.artifact(link));if(await artifactCache.get(link)){proof=link;break;}}
  const prLink=matchingPr(comment.body);let pr:GitHubRecord|undefined;
  if(prLink){const number=Number(prLink.match(/\/pull\/(\d+)/)![1]);try{if(!prCache.has(number))prCache.set(number,dependencies.pr(number));pr=await prCache.get(number);}catch{/* A claimed PR is not verified when GitHub cannot establish it. */}}
  const claimsDone=/\b(done|complete[d]?|verified|merged|live|finished)\b/i.test(comment.body);
  const progress=/\b(in progress|working|implementing|started)\b/i.test(comment.body);
  const notStarted=/\bNOT STARTED\b/i.test(comment.body);
  const githubState=pr?.merged_at?'MERGED':pr?.state==='open'?'PR OPEN':pr?.state==='closed'?'PR CLOSED':undefined;
  // Repository state is independent from acceptance of the canonical job. A merge
  // proves the merge only; a completion claim still requires verified acceptance.
  const status:JobStatus=claimsDone?'UNVERIFIED':notStarted?'NOT STARTED':githubState==='PR OPEN'?'PR OPEN':githubState==='MERGED'?'MERGED':progress?'IN PROGRESS':'UNVERIFIED';
  // A screenshot establishes a visual artifact, not all job acceptance checks. Keep
  // PR/merge states factual; never promote a comment's self-reported test claim to VERIFIED.
  const verified=false; // A comment claiming tests passed does not independently verify the job.
  Object.assign(job,{status:verified?'VERIFIED':status,githubState,sourceUrl:comment.html_url,prUrl:pr?.html_url,proofUrl:proof,updatedAt:comment.updated_at,missingEvidence:[...(!pr?['No verified matching PR']:[]),...(!proof?['No verification artifact']:[]),...(claimsDone&&!verified?['Completion claim lacks confirmed acceptance evidence']:[])]});
  const type=approvalType(comment.body);
  if(type)job.ownerDecision=type==='pictures'?'Approve pictures going live':type==='merge'?'Approve merge to main':'Approve final voice';
  // Keep at most the latest explicit owner-decision state for each job. A newer comment
  // with no owner request removes an older request, preventing resolved cards resurfacing.
  for(let i=approvals.length-1;i>=0;i--)if(approvals[i].id.startsWith(`job-${job.id}-`))approvals.splice(i,1);
  const approval=eligibleApproval(comment,proof);if(approval&&(type!=='merge'||pr?.state==='open'))approvals.push({...approval,id:`job-${job.id}-${comment.id}`});
 }
 return {jobs,approvals};
}

/** Current #877 is a stage-based execution queue, not the historical ## Jobs list. */
export function currentQueueJobs(body:string,updatedAt:string):Job[]{
 // Never turn a historical backlog into new work while the owner has paused product development.
 if(!currentExecutionAuthority(body).productWorkAuthorized)return [];
 const tutorHeading=/^## Current next product deliverable[^\n]*#1073/m.test(body);
 const stage=body.match(/^## Stage 1[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1]||'';
 if(!tutorHeading&&!stage)throw new Error('Current Cartilla execution queue is unavailable');
 const jobs:Job[]=[];
 const add=(id:number,title:string,detail:string,sourceUrl:string)=>{
  if(jobs.some(j=>j.id===id))return;
  const proof=(detail.match(/https:\/\/github\.com\/ejnburrows-rgb\/cartilla-de-gretel\/(?:blob|tree)\/[^\s)]+/)||[])[0];
  jobs.push({id,title,status:'UNVERIFIED',sourceUrl,prUrl:sourceUrl.includes('/pull/')?sourceUrl:undefined,
   proofUrl:proof,updatedAt,missingEvidence:proof?['Linked report is not independently confirmed runtime acceptance']:['Current running-build and review proof not established']});
 };
 if(tutorHeading)add(1073,'Gretel Tutor — Lecciones 1–3','',repo.replace('/repos/','https://github.com/')+'/pull/1073');
 for(const match of stage.matchAll(/^\|\s*#(\d+)\s+([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/gm)){
  const id=Number(match[1]),name=match[2].trim(),status=match[3].trim(),detail=match[4].trim();
  if(/\bMERGED\b/i.test(status)||/\bMERGED INTO MAIN\b/i.test(detail))continue;
  if(id===1073)continue;
  add(id,name,detail,'https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/'+id);
 }
 return jobs;
}
/** Only public GitHub repository proof media. A link is evidence to inspect, not proof of completion. */
export function publicProofMedia(body:string,prNumber:number){
 const found=[...body.matchAll(/https:\/\/github\.com\/ejnburrows-rgb\/cartilla-de-gretel\/blob\/([^\s)\]]+?\.(?:mp4|webm|png|jpe?g|webp))(?=[\s)\]]|$)/gi)];
 return found.slice(0,4).map(m=>({prNumber,type:/\.(mp4|webm)$/i.test(m[1])?'video':'image',
  src:'https://raw.githubusercontent.com/ejnburrows-rgb/cartilla-de-gretel/'+m[1],
  sourceUrl:m[0]}));
}

export async function getJobEvidence(){return serverSnapshot('cartilla-jobs-877-v4',10*60*1000,async()=>{
 const {data:meta}=await github(repo);if(meta.private!==false)throw new Error('Public repository metadata unavailable');
 const {data:issue}=await github(repo+'/issues/877');
 const authority=currentExecutionAuthority(issue.body||'');
 const execution={...authority,sourceUrl:jobSource,sourceUpdatedAt:issue.updated_at||'',agentActivity:'UNKNOWN' as const,creditsRemaining:'UNKNOWN' as const};
 if(!authority.productWorkAuthorized)return {jobs:[],approvals:[],media:[],execution};
 if(!/^##\\s+Jobs\\s*$/im.test(issue.body||'')){
  const jobs=currentQueueJobs(issue.body||'',issue.updated_at||new Date().toISOString());
  let media:ReturnType<typeof publicProofMedia>=[];
  for(const job of jobs.filter(j=>j.id===1073||j.id===1203)){
   try{
    const {data:pr}=await github(repo+'/pulls/'+job.id);
    job.githubState=pr.merged_at?'MERGED':pr.state==='open'?'PR OPEN':'PR CLOSED';
    job.status=pr.merged_at?'MERGED':pr.state==='open'?'PR OPEN':'UNVERIFIED';
    job.prUrl=pr.html_url;
    // An open/merged PR is not automatically verified, integrated into a release, or deployed.
    if(job.id===1203)media=publicProofMedia(pr.body||'',job.id);
   }catch{/* Keep source-derived queue visible; never invent a PR state. */}
  }
  return {jobs,approvals:[],media,execution};
 }
 const comments=await allPages<Comment>(repo+'/issues/877/comments');
 if(comments.length!==issue.comments)throw new Error('Issue comments changed during pagination; evidence refresh required');
 const evidence=await buildEvidence(issue.body||'',issue.updated_at,comments,{pr:async number=>(await github(repo+'/pulls/'+number)).data,artifact:visualArtifact});
 return {...evidence,execution};
});}
