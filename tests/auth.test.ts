import assert from "node:assert";
import { createSessionToken, verifySessionToken, COOKIE_NAME } from "../lib/auth";
import { verifyRequestSession, POST, GET, DELETE } from "../app/api/auth/route";

async function runTests() {
  console.log("Running Auth & Session Security Tests...\n");

  const passphrase = "test-secret-passphrase-123!";
  process.env.PORTAL_PASSPHRASE = passphrase;

  // 1. Valid Token Verification
  console.log("Test 1: Valid session token passes verification");
  const validToken = await createSessionToken(passphrase, 3600);
  assert.ok(validToken, "Token should be generated");
  const isValid = await verifySessionToken(validToken, passphrase);
  assert.strictEqual(isValid, true, "Valid token should verify successfully");

  // 2. Unpredictable nonces across calls
  console.log("Test 2: Two tokens generated in same second have different nonces & signatures");
  const tokenA = await createSessionToken(passphrase, 3600);
  const tokenB = await createSessionToken(passphrase, 3600);
  assert.notStrictEqual(tokenA, tokenB, "Tokens should contain unique nonces");

  // 3. Reject static raw hash / legacy cookie formats
  console.log("Test 3: Reject legacy static SHA-256 raw passphrase hashes");
  const rawHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // static hex hash
  const legacyValid = await verifySessionToken(rawHash, passphrase);
  assert.strictEqual(legacyValid, false, "Static raw hash must be rejected");

  // 4. Reject tampered signature
  console.log("Test 4: Reject token with tampered signature");
  const [iat, exp, nonce, sig] = validToken!.split(".");
  const tamperedSig = sig.substring(0, sig.length - 2) + "00";
  const tamperedToken = `${iat}.${exp}.${nonce}.${tamperedSig}`;
  const isTamperedValid = await verifySessionToken(tamperedToken, passphrase);
  assert.strictEqual(isTamperedValid, false, "Tampered signature must be rejected");

  // 5. Reject tampered payload
  console.log("Test 5: Reject token with modified expiration timestamp");
  const extendedExp = (parseInt(exp, 10) + 10000).toString();
  const payloadTamperedToken = `${iat}.${extendedExp}.${nonce}.${sig}`;
  const isPayloadTamperedValid = await verifySessionToken(payloadTamperedToken, passphrase);
  assert.strictEqual(isPayloadTamperedValid, false, "Modified expiration payload must be rejected");

  // 6. Reject expired token
  console.log("Test 6: Reject expired session token");
  const now = Math.floor(Date.now() / 1000);
  const expiredToken = await createSessionToken(passphrase, -100); // expired 100s ago
  const isExpiredValid = await verifySessionToken(expiredToken, passphrase, now);
  assert.strictEqual(isExpiredValid, false, "Expired token must be rejected");

  // 7. Reject malformed tokens
  console.log("Test 7: Reject malformed token strings");
  assert.strictEqual(await verifySessionToken("invalid.token", passphrase), false);
  assert.strictEqual(await verifySessionToken("", passphrase), false);
  assert.strictEqual(await verifySessionToken(null, passphrase), false);

  // 8. Reject valid token if server PORTAL_PASSPHRASE changes
  console.log("Test 8: Token invalid if PORTAL_PASSPHRASE changes");
  const passphraseChangedValid = await verifySessionToken(validToken, "different-passphrase");
  assert.strictEqual(passphraseChangedValid, false, "Token must be rejected if passphrase changes");

  // 9. API Auth Route Positive & Negative Login Tests
  console.log("Test 9: POST /api/auth returns signed cookie on correct passphrase");
  const postReqSuccess = new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase }),
  });
  const postResSuccess = await POST(postReqSuccess);
  assert.strictEqual(postResSuccess.status, 200, "POST with valid passphrase returns 200");
  const setCookieHeader = postResSuccess.headers.get("set-cookie");
  assert.ok(setCookieHeader?.includes(`${COOKIE_NAME}=`), "Response sets session cookie");
  assert.ok(setCookieHeader?.includes("HttpOnly"), "Cookie is HttpOnly");
  assert.ok(setCookieHeader?.includes("SameSite=lax"), "Cookie has SameSite=lax");

  console.log("Test 10: POST /api/auth rejects incorrect passphrase");
  const postReqFail = new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase: "wrong-passphrase" }),
  });
  const postResFail = await POST(postReqFail);
  assert.strictEqual(postResFail.status, 401, "POST with invalid passphrase returns 401");

  console.log("Test 10b: POST /api/auth handles null JSON body correctly");
  const postReqNull = new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "null",
  });
  const postResNull = await POST(postReqNull);
  assert.strictEqual(postResNull.status, 400, "POST with null body returns 400");

  // 10. Protection Guard via verifyRequestSession / GET /api/auth
  console.log("Test 11: verifyRequestSession and GET /api/auth enforce in-route session guard");
  // Extract token from successful set-cookie header
  const cookieValueMatch = setCookieHeader?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const issuedCookieValue = cookieValueMatch ? cookieValueMatch[1] : "";

  const authedReq = new Request("http://localhost/api/auth", {
    method: "GET",
    headers: { cookie: `${COOKIE_NAME}=${issuedCookieValue}` },
  });
  const authedRes = await GET(authedReq);
  assert.strictEqual(authedRes.status, 200, "In-route guard accepts valid cookie");

  const unauthedReq = new Request("http://localhost/api/auth", {
    method: "GET",
    headers: { cookie: `${COOKIE_NAME}=invalid.tampered.token.123` },
  });
  const unauthedRes = await GET(unauthedReq);
  assert.strictEqual(unauthedRes.status, 401, "In-route guard rejects tampered cookie");

  // 11. DELETE /api/auth clears session cookie
  console.log("Test 12: DELETE /api/auth clears session cookie");
  const deleteRes = await DELETE();
  assert.strictEqual(deleteRes.status, 200);
  const deleteCookieHeader = deleteRes.headers.get("set-cookie");
  assert.ok(deleteCookieHeader?.includes("Max-Age=0"), "DELETE expires cookie immediately");

  console.log("\nAll 12 authentication & session security tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
