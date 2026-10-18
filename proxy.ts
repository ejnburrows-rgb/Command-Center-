import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
// NBO hub is accessible without a site password.
// The legacy CRM demo is intentionally not exposed publicly.
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
export function proxy(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path.startsWith("/crm-core")||path==="/api/auth")return new NextResponse("Not Found",{status:404});
 if(path==="/login")return NextResponse.redirect(new URL("/",req.url));
 return NextResponse.next();
}