export type StudioEntry={id:string;role:"user"|"assistant"|"error";text:string;provider?:"zai"|"zai-coding"|"openai"|"gemini";time:number};
export type StudioThread={id:string;name:string;recipients:("zai"|"zai-coding"|"openai"|"gemini")[];entries:StudioEntry[];updated:number};
export type StudioHistory={threads:StudioThread[];current:string};
const ids=new Set(["zai","zai-coding","openai","gemini"]);
const validId=(v:unknown)=>typeof v==="string"&&/^[A-Za-z0-9_-]{1,90}$/.test(v);
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
export function sanitizeHistory(v:unknown):StudioHistory|null{
 if(!record(v)||!Array.isArray(v.threads)||v.threads.length>80||typeof v.current!=="string")return null;
 const threads:StudioThread[]=[],seen=new Set<string>();
 for(const t of v.threads){
  if(!record(t)||!validId(t.id)||seen.has(String(t.id))||typeof t.name!=="string"||t.name.length>140||!Array.isArray(t.recipients)||t.recipients.length>4||!Array.isArray(t.entries)||t.entries.length>150||typeof t.updated!=="number"||!Number.isFinite(t.updated))return null;
  seen.add(String(t.id));
  const recipients=t.recipients.filter((r):r is StudioThread["recipients"][number]=>typeof r==="string"&&ids.has(String(r)));
  if(recipients.length!==t.recipients.length)return null;
  const entries:StudioEntry[]=[],used=new Set<string>();
  for(const e of t.entries){
   if(!record(e)||!validId(e.id)||used.has(String(e.id))||!["user","assistant","error"].includes(String(e.role))||typeof e.text!=="string"||e.text.length>10000||typeof e.time!=="number"||!Number.isFinite(e.time)||(e.provider!==undefined&&!ids.has(String(e.provider))))return null;
   used.add(String(e.id));
   entries.push({id:String(e.id),role:e.role as StudioEntry["role"],text:e.text,time:e.time,provider:e.provider as StudioEntry["provider"]});
  }
  threads.push({id:String(t.id),name:t.name,recipients,entries,updated:t.updated});
 }
 if(threads.length&&!threads.some(t=>t.id===v.current))return null;
 return {threads,current:threads.length?v.current:""};
}
export function mergeHistory(first:StudioHistory,second:StudioHistory):StudioHistory{
 const map=new Map<string,StudioThread>();
 for(const t of [...second.threads,...first.threads]){
  const old=map.get(t.id);
  if(!old){map.set(t.id,{...t,entries:[...t.entries]});continue;}
  const entries=new Map<string,StudioEntry>();
  for(const e of [...old.entries,...t.entries])entries.set(e.id,e);
  const latest=t.updated>=old.updated?t:old;
  map.set(t.id,{...latest,entries:[...entries.values()].sort((a,b)=>a.time-b.time).slice(-150),updated:Math.max(t.updated,old.updated)});
 }
 const threads=[...map.values()].sort((a,b)=>b.updated-a.updated).slice(0,80);
 const selected=first.current||second.current;
 return {threads,current:threads.some(t=>t.id===selected)?selected:(threads[0]?.id||"")};
}
export function keepSafePath(value:unknown):string{
 if(typeof value!=="string"||value.length>512)return "/";
 let d:string;try{d=decodeURIComponent(value)}catch{return "/";}
 return d.startsWith("/")&&!d.startsWith("//")&&!d.includes("\\")&&!d.includes("\0")&&!d.startsWith("/api/")?value:"/";
}
