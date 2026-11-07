## 2024-03-24 - [Timing Attack in Auth Route]
**Vulnerability:** Found a timing attack vulnerability in `app/api/auth/route.ts` where string comparison was being used (`body.passphrase !== phrase`) instead of `crypto.timingSafeEqual` for checking the passphrase.
**Learning:** This exposes the application to timing attacks because string comparison (`!==`) returns early as soon as a mismatch is found, leaking information about the passphrase length and content.
**Prevention:** Always use `crypto.timingSafeEqual` (from `node:crypto`) to compare secure tokens or passwords, and ensure that both buffers being compared are of equal length (such as by hashing them first).
