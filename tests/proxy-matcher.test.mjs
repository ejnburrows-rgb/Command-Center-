import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Pure matcher regression test; no Next.js runtime or external services required.
const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
const match = source.match(/matcher:\s*\[("[^"\n]+")\]/);
assert.ok(match, "Next.js proxy matcher must exist");

const matcher = new RegExp("^" + JSON.parse(match[1]) + "$");

const privatePaths = [
  "/", "/settings", "/api/private", "/api/authority", "/api/authz",
  "/logins", "/faviconx.ico", "/_next/statics", "/api/content",
];
const publicPaths = [
  "/login", "/login/help", "/api/auth", "/api/auth/logout",
  "/_next/static/chunk.js", "/_next/image", "/favicon.ico",
];

for (const path of privatePaths) {
  test("proxy must authenticate " + path, () => {
    assert.equal(matcher.test(path), true);
  });
}
for (const path of publicPaths) {
  test("proxy intentionally bypasses " + path, () => {
    assert.equal(matcher.test(path), false);
  });
}
