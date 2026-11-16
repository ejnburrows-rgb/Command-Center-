import test from "node:test";
import assert from "node:assert/strict";
import {trimHistoryForRequest} from "../lib/history-budget.mjs";
const bytes=x=>new TextEncoder().encode(JSON.stringify(x)).byteLength;
test("retained long conversations fit within the provider request limit",()=>{
 const old=Array.from({length:12},(_,i)=>({role:i%2?"assistant":"user",content:"x".repeat(5500)}));
 const history=trimHistoryForRequest("Continue",["zai"],old);
 assert.ok(history.length<12);
 assert.ok(history.length>0);
 assert.equal(history.at(-1),old.at(-1));
 assert.ok(bytes({text:"Continue",recipients:["zai"],history,allowProviderCharges:true})<=36000);
});
test("byte budgeting correctly handles non-ASCII Unicode messages",()=>{
 const old=Array.from({length:12},()=>({role:"user",content:"😀".repeat(2800)}));
 const history=trimHistoryForRequest("😀".repeat(2000),["openai"],old);
 assert.ok(bytes({text:"😀".repeat(2000),recipients:["openai"],history,allowProviderCharges:true})<=36000);
 assert.ok(history.length<12);
});
test("normal short conversations retain their original order and entries",()=>{
 const entries=[{role:"user",content:"Hello"},{role:"assistant",content:"Hi"}];
 assert.deepEqual(trimHistoryForRequest("Next",["zai"],entries),entries);
});
test("a single oversized message is rejected instead of failing unexpectedly later",()=>{
 assert.throws(()=>trimHistoryForRequest("😀".repeat(12000),["zai"],[]),/exceeds/);
});
