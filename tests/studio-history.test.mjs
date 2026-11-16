import test from "node:test";
import assert from "node:assert/strict";
import {sanitizeHistory,mergeHistory,keepSafePath} from "../lib/studio-history.ts";
const msg=(id,text,time)=>({id,role:"user",text,time});
const thread=(id,entries,updated)=>({id,name:id,recipients:["zai"],entries,updated});
test("history sanitization rejects invalid input and oversized messages",()=>{
 assert.equal(sanitizeHistory({threads:"bad",current:"t"}),null);
 assert.equal(sanitizeHistory({threads:[thread("t",[msg("a","x".repeat(20000),1)],1)],current:"t"}),null);
 assert.equal(sanitizeHistory({threads:[thread("t",[msg("a","hello",1)],1)],current:"t"})?.threads[0].entries[0].text,"hello");
});
test("cross-device merge preserves distinct message IDs",()=>{
 const a={threads:[thread("t",[msg("a","first",1)],2)],current:"t"};
 const b={threads:[thread("t",[msg("b","second",2)],3)],current:"t"};
 const merged=mergeHistory(a,b);
 assert.deepEqual(merged.threads[0].entries.map(e=>e.id),["a","b"]);
});
test("redirect after login cannot escape origin",()=>{
 assert.equal(keepSafePath("/studio?tab=agents"),"/studio?tab=agents");
 for(const p of ["https://evil.test","//evil.test","\\evil","/%5c%5cevil","javascript:alert(1)"])assert.equal(keepSafePath(p),"/");
});

test("importing the starter Agent team backup preserves its original messages",()=>{
 const initial={threads:[thread("team",[],0)],current:"team"};
 const backedUp={threads:[thread("team",[msg("saved","A saved conversation",123)],123)],current:"team"};
 const restored=mergeHistory(initial,backedUp);
 assert.equal(restored.threads.length,1);
 assert.equal(restored.threads[0].entries[0].text,"A saved conversation");
 assert.equal(restored.current,"team");
});

test("public GitHub desk conversations survive local/cloud history sanitization",()=>{
 const original={threads:[{id:"desk",name:"Project Desk",recipients:["github"],entries:[{id:"e1",role:"assistant",provider:"github",text:"Read-only GitHub evidence",time:42}],updated:42}],current:"desk"};
 assert.deepEqual(sanitizeHistory(original),original);
});
