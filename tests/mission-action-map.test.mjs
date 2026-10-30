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
test("mind map connects real loaded repositories, not decorative hardcoded project counts",()=>{
 const view=read("app/mission-action-map.tsx");
 assert.match(view,/projects\.filter\(p=>p\.accessible\)/);
 assert.match(view,/nodes\.map\(n=><line/);
 assert.match(view,/aria-pressed=\{chosen\?\.slug===n\.project\.slug\}/);
 assert.match(view,/GitHub project data unavailable/);
 assert.doesNotMatch(view,/Math\.random|setInterval|fakeProgress/);
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
 assert.match(view,/do not dispatch another/i);
 assert.match(view,/SOURCE NOT VERIFIED FRESH/);
 assert.match(view,/Copying a prompt does not assign work or start an agent/);
 assert.doesNotMatch(view,/api\/dispatch|api\/jules\/start/);
});
test("map CSS is phone-accessible and reduced-motion safe",()=>{
 const css=read("app/mission-action-map.css");
 const layout=read("app/layout.tsx");
 assert.match(layout,/mission-action-map\.css/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
