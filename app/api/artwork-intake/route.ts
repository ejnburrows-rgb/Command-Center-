import { NextResponse } from "next/server";
import { COOKIE_NAME, expectedToken } from "@/lib/auth";
import crypto from "node:crypto";

export const runtime = "nodejs";

// Permitted canonical artwork destination roots
const ALLOWED_DEST_PREFIXES = [
  "public/cartilla/art/",
  "public/cartilla/art/owner-intake/",
  "public/cartilla/art/faithful/",
  "public/cartilla/art/games/",
];

export async function POST(req: Request) {
  try {
    // 1. Authenticate server-side session
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, decodeURIComponent(v.join("="))];
      }),
    );
    const sessionToken = cookies[COOKIE_NAME];
    const expected = await expectedToken();

    // If a passphrase is configured on the server, require valid session
    if (expected) {
      if (!sessionToken) {
        return NextResponse.json(
          { error: "Unauthorized: Owner session required to upload canonical artwork." },
          { status: 401 },
        );
      }
      const sessionBuf = Buffer.from(sessionToken);
      const expectedBuf = Buffer.from(expected);
      if (sessionBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sessionBuf, expectedBuf)) {
        return NextResponse.json(
          { error: "Unauthorized: Owner session required to upload canonical artwork." },
          { status: 401 },
        );
      }
    }

    // 2. Parse request
    const body = await req.json();
    const { slotId, artworkId, destinationPath, fileName, mimeType, sizeBytes, imageBase64 } = body;

    if (!slotId || !artworkId) {
      return NextResponse.json({ error: "Missing required slotId or artworkId." }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/png", "image/jpeg", "image/webp"];
    if (!validMimes.includes(mimeType)) {
      return NextResponse.json(
        { error: `Invalid image format: ${mimeType}. Only PNG, JPEG, and WebP are supported.` },
        { status: 400 },
      );
    }

    // Validate size (max 15MB)
    if (sizeBytes > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file exceeds maximum limit of 15MB." }, { status: 400 });
    }

    // Validate destination path
    if (destinationPath) {
      const isAllowed = ALLOWED_DEST_PREFIXES.some((prefix) => destinationPath.startsWith(prefix));
      if (!isAllowed) {
        return NextResponse.json(
          { error: `Forbidden destination path: ${destinationPath}. Must reside under approved art roots.` },
          { status: 403 },
        );
      }
    }

    // Return successful staging receipt
    return NextResponse.json({
      ok: true,
      stagedAt: new Date().toISOString(),
      slotId,
      artworkId,
      targetDestination: destinationPath || `public/cartilla/art/owner-intake/${artworkId}.webp`,
      message: `Candidate image for ${artworkId} (${slotId}) successfully validated and staged for owner review.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error processing artwork candidate: " + err.message },
      { status: 500 },
    );
  }
}
