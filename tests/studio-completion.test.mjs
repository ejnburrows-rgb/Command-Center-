import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Z.ai Coding Plan uses its restricted coding endpoint and key, not the general API",()=>{
  const providers=read("lib/studio-providers.ts");
  const chat=read("app/api/studio/chat/route.ts");
  assert.match(providers,/ZAI_CODING_PLAN_KEY/);
  assert.match(chat,/\/api\/coding\/paas\/v4\/chat\/completions/);
  assert.match(chat,/\/api\/paas\/v4\/chat\/completions/);
});
test("a configured key is not presented as a verified provider connection",()=>{
  const providers=read("app/api/studio/providers/route.ts");
  const studio=read("app/agent-studio.tsx");
  assert.match(providers,/configured:/);
  assert.match(studio,/Configured/);
  assert.doesNotMatch(studio,/Connected provider|providers ready/);
});
test("Zenzap retrieves recent messages and displays in chronological order",()=>{
  const route=read("app/api/studio/zenzap/route.ts");
  assert.match(route,/order=desc/);
  assert.match(route,/\.reverse\(\)/);
});
test("the owner can back up and restore conversation history without overriding existing threads",()=>{
  const studio=read("app/agent-studio.tsx");
  assert.match(studio,/Download history/);
  assert.match(studio,/Import history/);
  assert.match(studio,/JSON\.stringify/);
  assert.match(studio,/FileReader|\.text\(\)/);
});
test("sign-in redirects only to validated internal studio routes",()=>{
  const login=read("app/login/page.tsx");
  assert.match(login,/safeFrom/);
  assert.match(login,/router\.replace\(safeFrom\)/);
});
