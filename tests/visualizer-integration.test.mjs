import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("visualizer navigation and route registered",()=>{assert.match(read("app/hub-data.ts"),/\\|"Visualizer";/);assert.match(read("app/route-paths.ts"),/Visualizer:"\\/visualizer"/);assert.match(read("app/hub-content.tsx"),/tab==="Visualizer"/);assert.match(read("app/[...screen]/page.tsx"),/"visualizer"/)});
test("production graph uses real feed and cannot override fetch with demo",()=>{const source=read("public/visualizer/scene.js");assert.match(source,/fetch\\("\\/api\\/hub"/);assert.doesNotMatch(source,/window\\.fetch\\s*=/);assert.doesNotMatch(source,/GITHUB_TOKEN|PORTAL_PASSPHRASE|Bearer /);assert.doesNotMatch(read("public/visualizer/index.html"),/SYNTHETIC SAMPLE DATA|SAMPLE \\u00b7 NOT LIVE/)});
test("all four mode controls and accessible alternative exist",()=>{const text=read("public/visualizer/index.html");for(const mode of ["galaxy","god","web","grid"])assert.match(text,new RegExp('data-view="'+mode+'"'));for(const id of ["scene","plane","search","inspector","node-list","category","sort","import","pause"])assert.match(text,new RegExp('id="'+id+'"'))});
