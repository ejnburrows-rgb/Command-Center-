import { NextRequest, NextResponse } from "next/server";
import { studioAuthorized } from "@/lib/studio-auth";
import { requestZenzap, zenzapConfigured } from "@/lib/zenzap";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const headers={"Cache-Control":"private, no-store"};

export async function GET(request:NextRequest) {
  if (!(await studioAuthorized())) return NextResponse.json({error:"Sign in required."},{status:401,headers});
  if (!zenzapConfigured()) return NextResponse.json({error:"Zenzap is not connected."},{status:503,headers});
  const topic=request.nextUrl.searchParams.get("topic");
  if (topic && !uuid.test(topic)) return NextResponse.json({error:"Invalid topic."},{status:400,headers});
  const uri=topic?"/v2/topics/"+topic+"/messages?limit=50&order=asc":"/v2/topics?limit=50";
  try{
    const data=await requestZenzap("GET",uri);
    return NextResponse.json(topic?{messages:data.messages||[]}:{topics:data.topics||[]},{headers});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Zenzap unavailable."},{status:502,headers});}
}

export async function POST(request:NextRequest) {
  if (!(await studioAuthorized())) return NextResponse.json({error:"Sign in required."},{status:401,headers});
  const origin=request.headers.get("origin"),host=request.headers.get("host");
  if (origin && (!host || new URL(origin).host!==host)) return NextResponse.json({error:"Origin rejected."},{status:403,headers});
  let payload:{topicId?:unknown;text?:unknown};
  try{payload=await request.json();}catch{return NextResponse.json({error:"Invalid message."},{status:400,headers});}
  if(typeof payload.topicId!=="string"||!uuid.test(payload.topicId)||typeof payload.text!=="string"||!payload.text.trim()||payload.text.length>6000)return NextResponse.json({error:"Choose a valid topic and message."},{status:400,headers});
  try{
    const data=await requestZenzap("POST","/v2/messages",{topicId:payload.topicId,text:payload.text.trim()});
    return NextResponse.json({id:data.id||null,sent:true},{status:201,headers});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Zenzap unavailable."},{status:502,headers});}
}
