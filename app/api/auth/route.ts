import { NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

// In-route session validation guard for protected API endpoints/actions
export async function verifyRequestSession(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return false;
  const token = match.substring(COOKIE_NAME.length + 1);
  return await verifySessionToken(token);
}

// Session status check / in-route session guard verification endpoint
export async function GET(req: Request) {
  const authenticated = await verifyRequestSession(req);
  if (!authenticated) {
    return NextResponse.json({ authenticated: false, error: "Unauthorized session." }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

export async function POST(req: Request) {
  const phrase = process.env.PORTAL_PASSPHRASE;
  if (!phrase) {
    return NextResponse.json(
      { error: "Server has no PORTAL_PASSPHRASE set." },
      { status: 500 },
    );
  }

  let body: { passphrase?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (!body.passphrase || body.passphrase !== phrase) {
    return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
  }

  const token = await createSessionToken(phrase, SESSION_MAX_AGE);
  if (!token) {
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

// Log out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
