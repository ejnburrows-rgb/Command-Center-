import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, sha256hex } from "@/lib/auth";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const phrase = process.env.PORTAL_PASSPHRASE;
  if (!phrase) return NextResponse.json({error:"Server has no PORTAL_PASSPHRASE set."},{status:500});
  let body: {passphrase?: string};
  try {body = await req.json();} catch {return NextResponse.json({error:"Bad request."},{status:400});}
  if (typeof body.passphrase!=="string" || body.passphrase.length>4096) return NextResponse.json({error:"Incorrect passphrase."},{status:401});
  const given = createHash("sha256").update(body.passphrase).digest();
  const expected = createHash("sha256").update(phrase).digest();
  if (!timingSafeEqual(given,expected)) return NextResponse.json({error:"Incorrect passphrase."},{status:401});
  const res = NextResponse.json({ok:true});
  res.cookies.set(COOKIE_NAME,await sha256hex(phrase),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30});
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ok:true});
  res.cookies.set(COOKIE_NAME,"",{path:"/",maxAge:0});
  return res;
}
