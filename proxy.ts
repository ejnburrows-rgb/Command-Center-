import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, expectedToken } from "@/lib/auth";

export const config = {matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
function equalTokens(a: string, b: string) {
  // Fixed-work XOR comparison: never short-circuit on the first unequal character.
  let diff = a.length ^ b.length;
  for (let i=0;i<Math.max(a.length,b.length);i++) diff |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0);
  return diff===0;
}
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/crm-core")) return new NextResponse("Not Found",{status:404});
  const protectedPath = path==="/" || path==="/studio" || path.startsWith("/api/studio");
  if (!protectedPath) return NextResponse.next();
  const expected = await expectedToken();
  const actual = req.cookies.get(COOKIE_NAME)?.value || "";
  if (expected && equalTokens(actual, expected)) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({error:"Sign in required."},{status:401});
  const url = new URL("/login",req.url);
  url.searchParams.set("from",path);
  if (!expected) url.searchParams.set("setup","1");
  return NextResponse.redirect(url);
}
