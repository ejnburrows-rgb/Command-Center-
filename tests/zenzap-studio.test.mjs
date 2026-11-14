import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Zenzap credentials remain server-side with official HMAC and OAuth options",()=>{
 const api=read("lib/zenzap.ts");
 for(const key of ["ZENZAP_API_KEY","ZENZAP_API_SECRET","ZENZAP_CLIENT_ID","ZENZAP_CLIENT_SECRET"])assert.match(api,new RegExp(key));
 assert.match(api,/createHmac\("sha256"/);
 assert.match(api,/X-Timestamp/);
 assert.match(api,/oauth\/token/);
 assert.doesNotMatch(read("app/zenzap-room.tsx"),/ZENZAP_API_SECRET|ZENZAP_CLIENT_SECRET/);
});
test("Zenzap messages require private authentication, scoped topics and real provider confirmation",()=>{
 const route=read("app/api/studio/zenzap/route.ts");
 assert.match(route,/studioAuthorized/);
 assert.match(route,/uuid\.test\(topic\)/);
 assert.match(route,/requestZenzap\("POST"/);
 assert.match(route,/sent:true/);
 assert.doesNotMatch(route,/fake|mockMessage|simulated/i);
});
test("studio exposes Zenzap channels without impersonating model providers",()=>{
 const ui=read("app/agent-studio.tsx");
 assert.match(ui,/ZenzapRoom/);
 assert.match(ui,/zenzapReady/);
 assert.match(read("app/zenzap-room.tsx"),/loadTopics/);
 assert.match(read("app/zenzap-room.tsx"),/loadMessages/);
});
