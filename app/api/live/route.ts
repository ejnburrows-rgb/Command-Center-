import {NextRequest,NextResponse} from "next/server";
import {checkWebsite} from "@/lib/live-check";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const checks=new Map<string,{at:number;result:unknown}>();
export async function GET(req:NextRequest){const url=req.nextUrl.searchParams.get("url")||"";if(url.length>2048)return NextResponse.json({error:"URL is too long"},{status:400});
const cached=checks.get(url);if(cached&&Date.now()-cached.at<30000)return NextResponse.json(cached.result,{headers:{"Cache-Control":"no-store"}});
try{const result=await checkWebsite(url);if(checks.size>200)checks.clear();checks.set(url,{at:Date.now(),result});return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}})}catch(e){return NextResponse.json({url,checkedAt:new Date().toISOString(),status:null,success:false,buildAge:"BUILD AGE UNKNOWN",error:e instanceof Error?e.message:"Website unavailable"},{headers:{"Cache-Control":"no-store"}})}}
