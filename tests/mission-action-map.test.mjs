import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("the home route renders the project mind map before the existing mission dashboard",()=>{
 const entry=read("app/hub-content.tsx");
 assert.match(entry,/import MissionActionMap from "\.\/mission-action-map"/);
 assert.match(entry,/tab==="Hub"&&<MissionActionMap projects=\{feed\.projects\} busy=\{loading\}\/>/);
 assert.ok(entry.indexOf("<MissionActionMap")<entry.indexOf("<Home projects="));
});
test("mind map expands real GitHub task branches instead of static project label lines",()=>{
 const view=read("app/mission-action-map.tsx");
 const graph=read("app/mission-network.tsx");
 assert.match(view,/projects\.filter\(p=>p\.accessible\)/);
 assert.match(view,/<MissionNetwork projects=\{available\}/);
 assert.match(graph,/repoNodes\.map/);
 assert.match(graph,/workNodes\.map/);
 assert.match(graph,/aria-expanded=\{expanded\}/);
 assert.doesNotMatch(graph,/Math\.random|setInterval|fakeProgress/);
});
test("next tasks have real source records, copy-ready prompts and inspectable full text",()=>{
 const view=read("app/mission-action-map.tsx");
 assert.match(view,/navigator\.clipboard\.writeText\(value\)/);
 assert.match(view,/value=\{prompt\}/);
 assert.match(view,/item\.url/);
 assert.match(view,/item\.updatedAt/);
 assert.match(view,/Copy full agent prompt/);
 assert.match(view,/tasks?\b|cards\.slice\(0,3\)/);
});
test("existing Tutor permission and Jules duplicate guard prevent blind dispatch",()=>{
 const view=read("app/mission-action-map.tsx");
 assert.match(view,/jobs\.execution\?\.productWorkAuthorized/);
 assert.match(view,/Do not launch, resume, or duplicate a Jules task/i);
 assert.match(view,/SOURCE NOT VERIFIED FRESH/);
 assert.match(view,/Copying a prompt does not assign work or start an agent/);
 assert.doesNotMatch(view,/api\/dispatch|api\/jules\/start/);
});
test("Jules task prompts require fresh assignment evidence and failure becomes read-only review",()=>{
 const view=read("app/mission-action-map.tsx");
 const source=read("lib/jules-assignment.mjs");
 assert.match(view,/fetch\("\/api\/assignment"/);
 assert.match(view,/assignmentFresh=Boolean\(assignment\?\.fetchedAt&&!assignment\.stale&&!assignment\.error\)/);
 assert.match(view,/assignmentEvidence\.status\.startsWith\("FAILED"\)/);
 assert.match(view,/Review Jules task failure \(not active\)/);
 assert.match(view,/Do not resume or dispatch from this Board/);
 assert.match(view,/Read-only review of NBO ownership and project evidence/);
 assert.match(view,/STALE \/ UNAVAILABLE — current Jules assignment state is UNKNOWN/);
 assert.match(view,/projectPrompt\(chosen,assignment,assignmentFresh\)/);
 assert.match(view,/Do not resume, edit, or dispatch an agent from this prompt/);
 assert.doesNotMatch(view,/Jules — resume existing task/);
 assert.match(source,/FAILED — PROVIDER REPORTED TASK FAILURE/);
 assert.match(source,/Do not resume or dispatch from this Board/);
});
test("interactive map is phone-accessible and reduced-motion safe",()=>{
 const css=read("app/mission-network.css");
 const layout=read("app/layout.tsx");
 assert.match(layout,/mission-network\.css/);
 assert.match(css,/touch-action:none/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("never suggest stale PRs and hide the obsolete GitHub-only next-action cards",()=>{
 const view=read("app/mission-action-map.tsx");
 const css=read("app/mission-action-map.css");
 assert.match(view,/p\.accessible&&!p\.stale&&!p\.limited/);
 assert.match(css,/:has\(\.next-mission\) \.mission-now\{display:none\}/);
});
