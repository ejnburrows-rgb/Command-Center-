import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
function read(path){return readFileSync(new URL("../"+path,import.meta.url),"utf8");}
test("new operations routes survive deep-link reload",()=>{
 const gate=read("app/[...screen]/page.tsx");
 for(const path of ["ai-operations","knowledge","evidence"])assert.ok(gate.includes('"'+path+'"'),"Route missing: "+path);
});
test("navigation labels and route paths are coherent",()=>{
 const data=read("app/hub-data.ts"),routes=read("app/route-paths.ts");
 for(const label of ["AI Operations","Knowledge","Evidence"]){assert.ok(data.includes('"'+label+'"'),"Missing nav: "+label);assert.ok(routes.includes(label+':')||routes.includes('"'+label+'":'),"Missing mapping: "+label);}
});
test("real work and evidence are used instead of imported demo fixtures",()=>{
 const ui=read("app/ai-operations.tsx");
 assert.match(ui,/useJobs\(/);
 assert.match(ui,/projects\.flatMap/);
 assert.doesNotMatch(ui,/NBO_TASKS|NBO_PROJECTS|MOCK_TASKS|simulateSync|Synced just now via Octokit/);
});
test("anonymous knowledge page does not query private GitHub content",()=>{
 const ui=read("app/ai-operations.tsx");
 assert.match(ui,/<FileVault\/>/);
 assert.match(ui,/never fetches private documents/);
 assert.doesNotMatch(ui,/GITHUB_TOKEN_WRITE|process\.env\.PORTAL_PASSPHRASE/);
});

test("knowledge links survive feature-branch cleanup after main merge",()=>{
 const ui=read("app/ai-operations.tsx");
 assert.doesNotMatch(ui,/feature\/nbo-ai-ops-cockpit-20261023\/knowledge/);
 assert.match(ui,/\/blob\/main\/knowledge\/AGENT\.md/);
});
