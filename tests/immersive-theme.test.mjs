import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("every day/night color theme has complete canvas and surface tokens",()=>{
 const css=read("app/nbo-premium.css");
 for(const appearance of ["light","dark"])for(const palette of ["blue","purple","teal","mono"]){
  const start=css.indexOf(':root[data-appearance="'+appearance+'"][data-theme="'+palette+'"]{--ui-bg:');
  assert.ok(start>0,appearance+" / "+palette+" surface palette missing");
  const rule=css.slice(start,css.indexOf("}",start));
  for(const token of ["--ui-bg:","--ui-side:","--ui-panel:","--ui-raised:","--ui-hover:","--ui-border:","--ui-text:","--ui-topbar:","--ui-scene:","--ui-accent:"])assert.ok(rule.includes(token),appearance+"/"+palette+" missing "+token);
 }
});
test("visible day and night toggle changes shared appearance instead of a letter",()=>{
 const shell=read("app/hub-shell.tsx"),prefs=read("app/premium-preferences.tsx");
 assert.match(shell,/className="daynight-toggle"/);
 assert.match(shell,/onClick=\{\(\)=>setAppearance\(appearance==="light"\?"dark":"light"\)\}/);
 assert.match(shell,/Switch to day mode/);
 assert.match(shell,/Switch to night mode/);
 assert.match(prefs,/document\.documentElement\.dataset\.appearance=appearance/);
});
test("Gretel is part of the main canvas with one primary action and clean timeline",()=>{
 const css=read("app/gretel-commander.css"),src=read("app/gretel-commander.tsx");
 assert.match(css,/\.gretel-owner\{[^}]*background:transparent/);
 assert.match(src,/One clear path/);
 assert.match(src,/gretel-progress/);
 assert.match(src,/CURRENT AUTHORIZED SCOPE/);
 assert.doesNotMatch(src,/Copy current checkpoint/);
 assert.match(src,/Codex coordinates existing assignments/);
 assert.doesNotMatch(src,/Muse manages Jules|Ask Muse for your handouts/);
 assert.match(src,/gretel-inbox-toggle/);
});
test("inbox remains device-local and is closed by default",()=>{
 const src=read("app/gretel-commander.tsx");
 assert.match(src,/useState\(false\)/);
 assert.match(src,/localStorage\.setItem/);
 assert.doesNotMatch(src,/fetch\(/);
 assert.doesNotMatch(src,/navigator\.clipboard\.writeText/);
});
test("palette colors change on the actual shell, sidebar, topbar, and the work surface",()=>{
 const css=read("app/nbo-premium.css");
 for(const sel of ['.mission-home{background:var(--ui-scene)', '.mission-shell .sidebar{background:var(--ui-side)', '.mission-shell .topbar{background:var(--ui-topbar)', '.mission-panel{background:var(--ui-panel)'])assert.ok(css.includes(sel),sel);
});
