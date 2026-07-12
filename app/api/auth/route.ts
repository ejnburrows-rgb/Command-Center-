import { NextResponse } from "next/server";
import { COOKIE_NAME, sha256hex } from "@/lib/auth";

export const runtime = "nodejs";

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

  if (!body.passphrase || body.passphrase !== phrase) {
    return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
  }

  const token = await sha256hex(phrase);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

// Log out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
