import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("NBO keeps the existing screen and provides three GitHub-derived Cartilla actions",()=>{
 const ui=read("app/mission-home.tsx");
 assert.match(ui,/Three things that matter now/);
 assert.match(ui,/cartilla\?\.items\.find/);
 assert.match(ui,/w\.number===1073/);
 assert.match(ui,/w\.number===1203/);
 assert.match(ui,/jobs\.media\?\.find/);
 assert.match(ui,/<video src=\{playbackProof\.src\} controls playsInline/);
 assert.doesNotMatch(ui,/simulateSync|fakeAgent|mockAgent/);
});
test("canonical jobs accept the current stage format and expose real data freshness",()=>{
 const lib=read("lib/job-evidence.ts");
 assert.match(lib,/currentQueueJobs/);
 assert.match(lib,/## Current next product deliverable/);
 assert.match(lib,/publicProofMedia/);
 assert.match(lib,/10\*60\*1000/);
 const route=read("app/api/hub/route.ts");
 assert.match(route,/cartilla-de-gretel'\?15\*60\*1000:45\*60\*1000/);
});

test("current owner scope prevents false product dispatch and exposes credit limits as unknown",()=>{
 const evidence=read("lib/job-evidence.ts");
 const home=read("app/mission-home.tsx");
 const panel=read("app/ai-operations.tsx");
 assert.match(evidence,/currentExecutionAuthority\(issue\.body\|\|''\)/);
 assert.match(evidence,/if\(!authority\.productWorkAuthorized\)return \{jobs:\[\],approvals:\[\],media:\[\],execution\}/);
 assert.match(home,/productAuthorized=jobs\.execution\?\.mode==="PRODUCT_DEVELOPMENT"/);
 assert.match(home,/PARKED · NOT AUTHORIZED NOW/);
 assert.match(panel,/Remaining Astra \/ Opus credits/);
 assert.match(panel,/Running agent sessions/);
});

test("Gretel Commander cannot copy a stale Tutor launcher or imply Antigravity authorization",()=>{
 const commander=read("app/gretel-commander.tsx");
 const home=read("app/mission-home.tsx");
 assert.doesNotMatch(commander,/const checkpointRequest=|Copy current checkpoint|void copy\(checkpointRequest\)/);
 assert.match(commander,/Archived handoff notes/);
 assert.match(commander,/Open current assignment/);
 assert.match(commander,/execution\?\.mode==="ORGANIZATION_ONLY"/);
 assert.match(home,/execution=\{jobs\.execution\}/);
 assert.match(commander,/Antigravity not authorized/);
});
