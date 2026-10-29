import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Gretel remains integrated into the existing Overview",()=>{
 const home=read("app/mission-home.tsx");
 assert.match(home,/import GretelCommander from "\.\/gretel-commander"/);
 assert.match(home,/<GretelCommander project=\{projects\.find/);
});
test("status depends on real GitHub and accepted evidence rather than a guess",()=>{
 const view=read("app/gretel-commander.tsx");
 assert.match(view,/project\?\.items/);
 assert.match(view,/job\.status === "VERIFIED"/);
 assert.match(view,/job\.missingEvidence/);
 assert.match(view,/Not confirmed/);
 assert.match(view,/evidenceOk/);
});
test("current coordinator guidance cannot resurrect retired dispatch or make owner carry prompts",()=>{
 const view=read("app/gretel-commander.tsx");
 for(const name of ["ChatGPT","Antigravity","Opus"])assert.ok(view.includes(name));
 assert.doesNotMatch(view,/Muse manages Jules|Jules stays with Muse|MUSE — SEND|Ask Muse for your handouts/);
 assert.match(view,/Open current assignment/);
 assert.match(view,/Archived handoff notes/);
 assert.doesNotMatch(view,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(view,/setInterval/);
});
test("owner prompt content stays on the device",()=>{
 const view=read("app/gretel-commander.tsx");
 assert.match(view,/localStorage\.getItem/);
 assert.match(view,/localStorage\.setItem/);
 assert.match(view,/Saved on this device/);
 assert.doesNotMatch(view,/fetch\(/);
});
test("clean open-canvas Gretel section responds to narrow screens",()=>{
 const css=read("app/gretel-commander.css");
 const layout=read("app/layout.tsx");
 assert.match(layout,/gretel-commander\.css/);
 assert.match(css,/\.gretel-owner\{[^}]*background:transparent/);
 assert.match(css,/@media\(max-width:430px\)/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});
