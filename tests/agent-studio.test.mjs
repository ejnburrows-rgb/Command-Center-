import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("the primary workspace is the private agent studio, and the old overview survives", () => {
  assert.match(read("app/page.tsx"), /agent-studio/);
  assert.match(read("app/[...screen]/page.tsx"), /"overview"/);
  assert.match(read("app/agent-studio.tsx"), /Conversation/);
  assert.match(read("app/agent-studio.tsx"), /localStorage/);
});
test("Jules is absent from active UI and navigation", () => {
  for (const path of ["app/hub-content.tsx", "app/hub-shell.tsx", "app/mission-action-map.tsx", "app/gretel-commander.tsx"]) {
    assert.doesNotMatch(read(path), /Jules|jules/i, path);
  }
});
test("private chat uses server-side authentication, never browser API keys", () => {
  assert.match(read("proxy.ts"), /api\/studio/);
  assert.match(read("lib/studio-auth.ts"), /COOKIE_NAME/);
  assert.match(read("lib/auth.ts"), /PORTAL_PASSPHRASE/);
  assert.doesNotMatch(read("app/agent-studio.tsx"), /NEXT_PUBLIC_.*KEY|localStorage\.setItem\([^)]*key/i);
});
test("provider responses are real, not simulated", () => {
  const route = read("app/api/studio/chat/route.ts");
  assert.match(route, /fetch\(/);
  assert.match(route, /Not connected/);
  assert.doesNotMatch(route, /fakeAgent|mockReply|setTimeout\(/);
});
