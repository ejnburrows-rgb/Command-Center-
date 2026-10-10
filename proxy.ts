import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Gate every route on the session cookie, except /login and the auth API.
// (Next 16 renamed the "middleware" convention to "proxy".)
export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(req: NextRequest) {
  const passphrase = process.env.PORTAL_PASSPHRASE;

  // If no passphrase is configured yet, send the user to /login which explains
  // the setup instead of hard-failing.
  if (!passphrase) {
    return NextResponse.redirect(new URL("/login?setup=1", req.url));
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(cookie);
  if (isValid) {
    return NextResponse.next();
  }

  const url = new URL("/login", req.url);
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
