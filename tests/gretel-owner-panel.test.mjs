import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Gretel is part of the existing Overview, not a separate app",()=>{
 const home=read("app/mission-home.tsx");
 assert.match(home,/import GretelCommander from "\.\/gretel-commander"/);
 assert.match(home,/<GretelCommander project=\{projects\.find/);
});
test("Shows evidence-backed progress rather than fabricated completion",()=>{
 const view=read("app/gretel-commander.tsx");
 assert.match(view,/project\?\.items/);
 assert.match(view,/job\.status === "VERIFIED"/);
 assert.match(view,/job\.missingEvidence/);
 assert.match(view,/Not confirmed live/);
 assert.match(view,/A saved prompt is not a live agent connection/);
});
test("Muse dispatches Jules and only manual remaining agent handouts appear",()=>{
 const view=read("app/gretel-commander.tsx");
 for(const name of ["ChatGPT","Antigravity","Opus"])assert.ok(view.includes(name));
 assert.match(view,/Jules is handled directly by Muse/);
 assert.match(view,/navigator\.clipboard\.writeText/);
});
test("Prompt content is device-only, not written to GitHub or an API",()=>{
 const view=read("app/gretel-commander.tsx");
 assert.match(view,/localStorage\.getItem/);
 assert.match(view,/localStorage\.setItem/);
 assert.match(view,/This browser only/);
 assert.doesNotMatch(view,/fetch\(/);
});
test("The component is responsive and respects the existing visual system",()=>{
 const css=read("app/gretel-commander.css");
 const layout=read("app/layout.tsx");
 assert.match(layout,/gretel-commander\.css/);
 assert.match(css,/--ui-panel/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});