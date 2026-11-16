import {NextResponse} from "next/server";
import {get,put} from "@vercel/blob";
import {randomUUID} from "node:crypto";
import {studioAuthorized} from "@/lib/studio-auth";
import {sanitizeHistory,type StudioHistory} from "@/lib/studio-history";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const path="nbo/owner-agent-history.json",headers={"Cache-Control":"private, no-store"};
type Stored={revision:string;updatedAt:number;history:StudioHistory};
const empty:Stored={revision:"0",updatedAt:0,history:{threads:[],current:""}};
const configured=()=>Boolean(process.env.BLOB_READ_WRITE_TOKEN||process.env.VERCEL_OIDC_TOKEN);
async function stored():Promise<Stored>{
 const res=await get(path,{access:"private",useCache:false});
 if(!res)return empty;
 if(res.statusCode!==200||!res.stream)throw Error("Unreadable private history");
 const payload=await new Response(res.stream).json() as Partial<Stored>;
 const history=sanitizeHistory(payload.history);
 if(!history||typeof payload.revision!=="string")throw Error("Invalid stored history");
 return {revision:payload.revision,updatedAt:typeof payload.updatedAt==="number"?payload.updatedAt:0,history};
}
export async function GET(){
 if(!(await studioAuthorized()))return NextResponse.json({error:"Sign in required."},{status:401,headers});
 if(!configured())return NextResponse.json({available:false,error:"Cloud storage unavailable."},{status:503,headers});
 try{return NextResponse.json({available:true,...await stored()},{headers});}catch{return NextResponse.json({available:false,error:"Cloud history could not be loaded."},{status:502,headers});}
}
export async function POST(request:Request){
 if(!(await studioAuthorized()))return NextResponse.json({error:"Sign in required."},{status:401,headers});
 const origin=request.headers.get("origin"),host=request.headers.get("host");
 if(origin){try{if(!host||new URL(origin).host!==host)return NextResponse.json({error:"Origin rejected."},{status:403,headers});}catch{return NextResponse.json({error:"Origin rejected."},{status:403,headers});}}
 if(!configured())return NextResponse.json({error:"Cloud storage unavailable."},{status:503,headers});
 if(Number(request.headers.get("content-length")||0)>900000)return NextResponse.json({error:"History too large."},{status:413,headers});
 let payload:{revision?:unknown;history?:unknown};
 try{const body=await request.text();if(body.length>900000)return NextResponse.json({error:"History too large."},{status:413,headers});payload=JSON.parse(body);}catch{return NextResponse.json({error:"Invalid history."},{status:400,headers});}
 const history=sanitizeHistory(payload?.history);
 if(!history||typeof payload?.revision!=="string"||payload.revision.length>100)return NextResponse.json({error:"Invalid conversations."},{status:400,headers});
 try{
  const old=await stored();
  if(payload.revision!==old.revision)return NextResponse.json({code:"CONFLICT",error:"A newer version exists.",...old},{status:409,headers});
  const next:Stored={revision:randomUUID(),updatedAt:Date.now(),history};
  await put(path,JSON.stringify(next),{access:"private",allowOverwrite:true,contentType:"application/json",cacheControlMaxAge:60});
  return NextResponse.json({saved:true,revision:next.revision,updatedAt:next.updatedAt},{headers});
 }catch{return NextResponse.json({error:"Private history could not be saved."},{status:502,headers});}
}
