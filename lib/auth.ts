// The entire auth system: single-owner session authentication using HMAC-SHA256 signed cookies.
// Signed sessions are time-limited, contain random nonces, and are validated using Web Crypto
// so they work in both Edge middleware (proxy.ts) and Node route handlers.

export const COOKIE_NAME = "cc_session";

// Default session duration: 7 days in seconds.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Rate Limiting Limitation Note:
 * This application is a private single-owner Next.js app running without a database, Redis,
 * or persistent memory store. True distributed rate limiting across serverless/edge invocations
 * requires a centralized state store (e.g., Redis / Upstash / KV). Without adding external DB services
 * or paid infrastructure, attempt throttling relies on Vercel platform-level edge protection / WAF
 * and standard client-side state handling.
 */

async function getHmacKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Derive HMAC key from PORTAL_PASSPHRASE with a fixed domain separator
  const keyData = enc.encode(`command-center-v1-key:${passphrase}`);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16);
    if (isNaN(byte)) return null;
    bytes[i / 2] = byte;
  }
  return bytes;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/**
 * Create a time-limited, nonced, signed session token for the current PORTAL_PASSPHRASE.
 */
export async function createSessionToken(
  passphrase = process.env.PORTAL_PASSPHRASE,
  maxAgeSeconds = SESSION_MAX_AGE,
): Promise<string | null> {
  if (!passphrase) return null;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + maxAgeSeconds;
  const nonce = generateNonce();

  const payload = `${now}.${exp}.${nonce}`;
  const key = await getHmacKey(passphrase);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const signature = bufferToHex(signatureBuffer);

  return `${payload}.${signature}`;
}

/**
 * Verify a session token against current PORTAL_PASSPHRASE and current time.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  passphrase = process.env.PORTAL_PASSPHRASE,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!token || !passphrase) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;

  const [iatStr, expStr, nonce, sigHex] = parts;
  const iat = parseInt(iatStr, 10);
  const exp = parseInt(expStr, 10);

  if (isNaN(iat) || isNaN(exp)) return false;
  if (!nonce || nonce.length !== 32) return false;

  // Reject expired tokens or tokens with timestamps too far in the future (5 minutes buffer)
  if (nowSeconds >= exp || iat > nowSeconds + 300) {
    return false;
  }

  const payload = `${iatStr}.${expStr}.${nonce}`;
  const key = await getHmacKey(passphrase);
  const sigBytes = hexToBuffer(sigHex);
  if (!sigBytes) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}
