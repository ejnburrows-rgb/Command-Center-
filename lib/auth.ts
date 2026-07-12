// The entire auth system: one passphrase (PORTAL_PASSPHRASE), one cookie.
// The cookie holds a SHA-256 hash of the passphrase so the raw phrase is never
// stored in the browser. Uses Web Crypto so it runs in both the Edge
// middleware and Node route handlers.

export const COOKIE_NAME = "cc_session";

export async function sha256hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// The expected cookie value for the current PORTAL_PASSPHRASE.
export async function expectedToken(): Promise<string | null> {
  const phrase = process.env.PORTAL_PASSPHRASE;
  if (!phrase) return null;
  return sha256hex(phrase);
}
