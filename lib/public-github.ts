// Public, read-only GitHub data. Never use the authenticated content client here.
export type GitHubRecord = {number:number;title:string;html_url:string;updated_at:string;body?:string;state?:string;draft?:boolean;merged_at?:string|null;pull_request?:unknown;labels?:Array<string|{name?:string}>;[key:string]:unknown};
type Cached<T>={value:T;fetchedAt:string;expires:number;stale?:boolean;error?:string};
const snapshots=new Map<string,Cached<unknown>>();
const pending=new Map<string,Promise<Snapshot<unknown>>>();
export type Snapshot<T>={value:T;fetchedAt:string;stale:boolean;error?:string};
export function errorText(e:unknown){return e instanceof Error?e.message:'GitHub unavailable';}
export async function github<T = unknown>(path:string):Promise<{data:T;headers:Headers}>{
 if(!path.startsWith('/repos/ejnburrows-rgb/'))throw new Error('Repository outside public hub scope');
 const response=await fetch('https://api.github.com'+path,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(15000),cache:'no-store'});
 if(!response.ok)throw new Error(response.status===403||response.status===429?'GitHub rate limit or access restriction; showing last successful data when available':`GitHub HTTP ${response.status}`);
 const data=await response.json();
 if(data?.private===true)throw new Error('Private repositories are not available in this public hub');
 return {data,headers:response.headers};
}
export async function allPages<T>(path:string,request=github):Promise<T[]>{
 const output:T[]=[];const seen=new Set<number>();
 for(let page=1;page<=100;page++){
  const {data,headers}=await request(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);
  if(!Array.isArray(data))throw new Error('Incomplete GitHub list response');
  for(const item of data){if(typeof item.number==='number'){if(seen.has(item.number))throw new Error('GitHub list changed during pagination; refresh required');seen.add(item.number);}output.push(item);}
  const next=/<[^>]+>;\s*rel="next"/.test(headers.get('link')||'');
  if(!next&&data.length<100)return output;
  if(!next&&data.length===100)continue; // full pages must be followed, even without Link
 }
 throw new Error('GitHub pagination limit reached; totals unavailable');
}
export async function snapshot<T>(key:string,ttl:number,read:()=>Promise<T>):Promise<Snapshot<T>>{
 const old=snapshots.get(key) as Cached<T>|undefined;
 if(old&&old.expires>Date.now())return {value:old.value,fetchedAt:old.fetchedAt,stale:old.stale||false,error:old.error};
 if(pending.has(key))return pending.get(key) as Promise<Snapshot<T>>;
 const work=(async()=>{try{const value=await read();const fetchedAt=new Date().toISOString();snapshots.set(key,{value,fetchedAt,expires:Date.now()+ttl});return {value,fetchedAt,stale:false};}catch(e){if(old){old.expires=Date.now()+60000;old.stale=true;old.error=errorText(e);return {value:old.value,fetchedAt:old.fetchedAt,stale:true,error:errorText(e)};}throw e;}finally{pending.delete(key);}})();
 pending.set(key,work);return work;
}
export function summarize(issues:GitHubRecord[],pulls:GitHubRecord[]){return {issues:issues.filter(i=>!i.pull_request).length,prs:pulls.length,drafts:pulls.filter(p=>p.draft===true).length};}
