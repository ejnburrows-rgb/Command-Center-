## 2024-11-09 - Secure Passphrase Comparison
**Vulnerability:** Timing attack vulnerability in passphrase comparison during authentication.
**Learning:** String comparisons (`body.passphrase !== phrase`) for authentication logic are vulnerable to timing attacks since they exit early upon the first mismatched character. This could allow an attacker to guess the secret character by character by measuring the response time.
**Prevention:** Use `crypto.timingSafeEqual` on hashes or fixed-length buffers for securely comparing passwords/passphrases. Ensure Next.js API routes run in the `nodejs` runtime since `node:crypto` is not available in the edge runtime.
