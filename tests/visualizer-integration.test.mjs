import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => readFileSync(p, "utf8");
test("Visualizer is registered in navigation and routes", () => {
 assert.ok(read("app/hub-data.ts").includes('"Visualizer"'));
 assert.ok(read("app/route-paths.ts").includes('Visualizer:"/visualizer"'));
 assert.ok(read("app/hub-content.tsx").includes('tab==="Visualizer"'));
 assert.ok(read("app/[...screen]/page.tsx").includes('"visualizer"'));
});
test("Production visualizer reads real public sources only", () => {
 const scene=read("public/visualizer/scene.js");
 const page=read("public/visualizer/index.html");
 assert.ok(scene.includes('fetch("/api/hub"'));
 assert.ok(scene.includes('file.text()'));
 assert.ok(!scene.includes('window.fetch ='));
 assert.ok(!scene.includes('GITHUB_TOKEN'));
 assert.ok(!page.includes('SYNTHETIC SAMPLE DATA'));
 assert.ok(!page.includes('window.fetch ='));
});
test("Four modes, controls, inspector and accessible list are present", () => {
 const html=read("public/visualizer/index.html");
 for (const mode of ["galaxy","god","web","grid"]) assert.ok(html.includes('data-view="'+mode+'"'), mode);
 for (const id of ["scene","plane","search","inspector","node-list","category","sort","import","pause"]) assert.ok(html.includes('id="'+id+'"'), id);
});
