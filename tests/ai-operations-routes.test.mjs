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

test("main home uses the supplied three-zone cockpit instead of the generic hero-card layout",()=>{
 const shell=read("app/hub-shell.tsx");
 const home=read("app/hub-home.tsx");
 const cockpit=read("app/mission-home.tsx");
 const css=read("app/mission-home.css");
 assert.match(shell,/mission-shell/);
 assert.match(home,/mission-home/);
 assert.match(cockpit,/mission-center/);
 assert.match(cockpit,/mission-inspector/);
 assert.match(cockpit,/mission-tasklist/);
 assert.match(cockpit,/mission-mobile-dock/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 352px/);
 assert.match(css,/@media\(max-width:620px\)/);
});
test("cockpit sources real repository and canonical job data, not design-demo fixtures",()=>{
 const ui=read("app/mission-home.tsx");
 assert.match(ui,/projects\.flatMap/);
 assert.match(ui,/useJobs\(/);
 assert.match(ui,/\.missingEvidence/);
 assert.match(ui,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(ui,/NBO_TASKS|NBO_PROJECTS|MOCK_TASKS|simulateSync|fakeAgent|mockAgent/);
});

test("mobile task inspection is an actual dismissible overlay",()=>{
 const ui=read("app/mission-home.tsx"),css=read("app/mission-home.css");
 assert.match(ui,/setMobileInspect\(true\)/);
 assert.match(ui,/setMobileInspect\(false\)/);
 assert.match(ui,/aria-label="Close task inspector"/);
 assert.match(css,/\.mission-inspector\.mission-inspector-open/);
 assert.match(css,/max-height:min\(84dvh,720px\)/);
});

test("unscoped GitHub feed includes issue and PR records for the cockpit",()=>{
 const route=read("app/api/hub/route.ts");
 const expression=route.match(/items:([^\\n]+),fetchedAt:result\\.fetchedAt/);
 assert.ok(expression,"Live work-scoping expression must be present");
 const scope=new Function("selected","slug","result","return ("+expression[1]+");");
 const records=[{kind:"issue",number:77},{kind:"pr",number:12,draft:true}];
 const result={value:{items:records}};
 assert.deepEqual(scope(null,"cartilla-de-gretel",result),records,"Unscoped home must receive all public work");
 assert.deepEqual(scope("cartilla-de-gretel","cartilla-de-gretel",result),records,"Project-specific work must be retained");
 assert.deepEqual(scope("otto","cartilla-de-gretel",result),[],"Other repositories must remain excluded from a scoped request");
});
