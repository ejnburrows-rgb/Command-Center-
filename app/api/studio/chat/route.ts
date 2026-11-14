import { NextResponse } from "next/server";
import { studioAuthorized } from "@/lib/studio-auth";
import { isStudioProvider, providerReady, studioProviders, type StudioProviderId } from "@/lib/studio-providers";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };
const safeMessages = (value: unknown): ChatMessage[] => Array.isArray(value)
  ? value.slice(-12).filter((m):m is ChatMessage => m && typeof m === "object" &&
    (m.role === "user" || m.role === "assistant") && typeof m.content === "string" &&
    m.content.length > 0 && m.content.length <= 6000)
  : [];

async function talk(id: StudioProviderId, messages: ChatMessage[]) {
  const provider = studioProviders[id];
  const key = process.env[provider.env];
  if (!key) return { id, error: "Not connected. No message was sent." };
  try {
    const url = id === "zai" ? "https://api.z.ai/api/paas/v4/chat/completions" :
      id === "openai" ? "https://api.openai.com/v1/chat/completions" :
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const body = id === "gemini" ?
      {contents: messages.map(m => ({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:1000}} :
      {model:provider.model,messages,max_tokens:1000,...(id==="zai"?{thinking:{type:"disabled"}}:{})};
    const response = await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json",...(id==="gemini"?{"x-goog-api-key":key}:{"Authorization":"Bearer "+key})},
      body:JSON.stringify(body),
      signal:AbortSignal.timeout(48000),
      cache:"no-store"
    });
    if (!response.ok) return {id,error:"Provider request failed (HTTP "+response.status+"). Check connection and quota."};
    const data = await response.json();
    const answer:unknown = id==="gemini"
      ? data?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")
      : data?.choices?.[0]?.message?.content;
    return typeof answer==="string" && answer.trim()
      ? {id,content:answer.trim()}
      : {id,error:"Provider returned no text."};
  } catch (err) {
    return {id,error:err instanceof Error && err.name==="TimeoutError"?"Provider timed out.":"Provider unavailable. Try again later."};
  }
}

export async function POST(request: Request) {
  if (!(await studioAuthorized())) return NextResponse.json({error:"Sign in required."},{status:401});
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && (!host || new URL(origin).host !== host)) return NextResponse.json({error:"Origin rejected."},{status:403});
  if (Number(request.headers.get("content-length")||0)>40000) return NextResponse.json({error:"Request too large."},{status:413});
  let body: {text?:unknown; recipients?:unknown; history?:unknown; allowProviderCharges?:unknown};
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid message."},{status:400}); }
  const text = typeof body.text==="string"?body.text.trim():"";
  const recipients = Array.isArray(body.recipients)
    ? [...new Set(body.recipients.filter((id):id is StudioProviderId => typeof id==="string" && isStudioProvider(id)))].slice(0,3)
    : [];
  if (!text || text.length>6000 || recipients.length===0) return NextResponse.json({error:"Choose a provider and enter a message (maximum 6,000 characters)."},{status:400});
  if (body.allowProviderCharges!==true) return NextResponse.json({error:"Confirm API usage authorization before sending."},{status:403});
  const history = safeMessages(body.history);
  const messages:ChatMessage[] = [...history,{role:"user",content:text}];
  const results = await Promise.all(recipients.map(id=>providerReady(id)?talk(id,messages):Promise.resolve({id,error:"Not connected. No message was sent."})));
  return NextResponse.json({results},{headers:{"Cache-Control":"private, no-store"}});
}
