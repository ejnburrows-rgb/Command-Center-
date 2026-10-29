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
