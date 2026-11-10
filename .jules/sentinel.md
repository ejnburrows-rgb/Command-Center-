## 2024-05-24 - [Secure Passphrase Comparison]
**Vulnerability:** Timing attack vulnerability in passphrase comparison during authentication.
**Learning:** Comparing sensitive passphrases or hashes using standard string comparison `!==` exposes the length of the matching prefix because standard comparisons fail fast.
**Prevention:** Always hash the user-provided passphrase and compare it against the hashed expected passphrase using `crypto.timingSafeEqual` when performing comparisons on sensitive credentials to prevent timing attacks. Ensure the length of the strings are matching before using `timingSafeEqual`.
