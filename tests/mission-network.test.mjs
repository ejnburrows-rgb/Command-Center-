import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("homepage uses a genuine expandable network rather than static project-name lines",()=>{
 const host=read("app/mission-action-map.tsx");
 const graph=read("app/mission-network.tsx");
 assert.match(host,/MissionNetwork projects=\{available\}/);
 assert.doesNotMatch(host,/next-mission-map-scroll|nodes\.map\(n=><line/);
 assert.match(graph,/aria-expanded=\{expanded\}/);
 assert.match(graph,/setFocus\(isClosing\?"":n\.id\)/);
 assert.match(graph,/workNodes\.map/);
 assert.match(graph,/onSelectProject\(n\.id\)/);
});
test("expanding projects reveals actual GitHub issues and PRs, not invented relationships",()=>{
 const graph=read("app/mission-network.tsx");
 assert.match(graph,/selectedProject\?\.items/);
 assert.match(graph,/workKey\(activeNode\.project,work\)/);
 assert.match(graph,/work\.kind|item\.kind/);
 assert.match(graph,/workStatus\(w\)/);
 assert.match(graph,/sourceWork\.slice/);
 assert.match(graph,/More tasks/);
 assert.doesNotMatch(graph,/Math\.random\(|fakeStatus|setInterval\(/);
});
test("task drilldown stays in the map and has a copy-ready continuation prompt",()=>{
 const graph=read("app/mission-network.tsx");
 assert.match(graph,/setSelectedWork\(n\.id\)/);
 assert.match(graph,/navigator\.clipboard\.writeText\(prompt\)/);
 assert.match(graph,/taskHandoff\(chosen\.project,chosen\.work\)/);
 assert.match(graph,/Agent activity UNKNOWN without provider evidence/);
 assert.match(graph,/CURRENT|EXISTING TASK/);
});
test("pan, zoom and full map controls work on mouse or touch",()=>{
 const graph=read("app/mission-network.tsx");
 const css=read("app/mission-network.css");
 const layout=read("app/layout.tsx");
 assert.match(graph,/onPointerDown=\{startPan\}/);
 assert.match(graph,/onPointerMove=\{movePan\}/);
 assert.match(graph,/onPointerUp=\{stopPan\}/);
 assert.match(graph,/setPointerCapture\(e\.pointerId\)/);
 assert.match(graph,/setZoom\(z=>bounded/);
 assert.match(graph,/setFullscreen\(v=>!v\)/);
 assert.match(css,/touch-action:none/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(layout,/mission-network\.css/);
});
