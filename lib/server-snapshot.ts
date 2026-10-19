import {unstable_cache} from 'next/cache';
import {snapshot} from './public-github';
// Next's incremental cache shares successful public snapshots across serverless cold starts.
// Timestamp is created INSIDE the cached function, so client polls never manufacture freshness.
export async function serverSnapshot<T>(key:string,ttl:number,read:()=>Promise<T>){
 return snapshot(key,60*1000,async()=>{
  const cached=unstable_cache(async()=>({data:await read(),sourceFetchedAt:new Date().toISOString()}),['nbo-public-snapshot-v1',key],{revalidate:Math.max(60,Math.floor(ttl/1000))});
  return cached();
 }).then(result=>{
  const expired=Date.now()-Date.parse(result.value.sourceFetchedAt)>ttl;
  return {value:result.value.data,fetchedAt:result.value.sourceFetchedAt,stale:result.stale||expired,error:result.error||(expired?'Cached GitHub snapshot is stale; refresh is pending or GitHub is unavailable':undefined)};
 });
}
