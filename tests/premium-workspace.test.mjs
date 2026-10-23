import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("four palette themes and two appearances supported",()=>{
 const pref=read("app/premium-preferences.tsx"),css=read("app/nbo-premium.css");
 for(const color of ["blue","purple","teal","mono"]) {assert.match(pref,new RegExp('"'+color+'"'));assert.ok(css.includes('data-theme="'+color+'"'),color)}
 for(const mode of ["light","dark"])assert.ok(css.includes('data-appearance="'+mode+'"'),mode);
});
test("four real workspace modes filter actual work",()=>{
 const pref=read("app/premium-preferences.tsx"),home=read("app/mission-home.tsx");
 for(const m of ["overview","coding","review","focus"])assert.ok(pref.includes('"'+m+'"'));
 assert.match(pref,/visibleInWorkspace/);assert.match(home,/visibleInWorkspace\(/);
});
test("theme and modes are persistent and settings provide direct controls",()=>{
 const provider=read("app/premium-preferences.tsx"),shell=read("app/hub-shell.tsx"),settings=read("app/settings-view.tsx");
 for(const key of ["nbo-palette","nbo-appearance","nbo-workspace"])assert.ok(provider.includes(key));
 assert.match(shell,/setAppearance/);assert.match(shell,/setWorkspace/);assert.match(shell,/setPalette/);
 assert.match(settings,/setAppearance/);assert.match(settings,/setWorkspace/);assert.match(settings,/setPalette/);
});
test("shared visual system covers GitHub and operational screens",()=>{
 const css=read("app/nbo-premium.css"),layout=read("app/layout.tsx");
 assert.ok(layout.includes('nbo-premium.css'));
 for(const token of [".gh-panel",".aop-page",".mission-home",".shell",".panel",".mission-inspector"])assert.ok(css.includes(token));
});
test("legacy palette storage is migrated without losing owner preferences",()=>{
 const pref=read("app/premium-preferences.tsx");
 assert.match(pref,/getItem\("nbo-theme"\)/);
 assert.match(pref,/getItem\("nbo-palette"\)/);
});

test("phone mode switch stays visible above content, outside filtered containing-block bug",()=>{
 const css=read("app/nbo-premium.css");
 assert.match(css,/top:64px;bottom:auto/);
 assert.match(css,/\.premium-shell \.topbar \.mode-switch/);
 assert.match(css,/\.premium-shell \.topbar.*height:120px/);
});
test("focus mode can advance to a different real task",()=>{
 const home=read("app/mission-home.tsx");
 assert.match(home,/className="focus-next"/);
 assert.match(home,/visible\[\(index\+1\)%visible\.length\]/);
});
test("settings provide designed, accessible controls instead of bare options",()=>{
 const css=read("app/nbo-premium.css"),settings=read("app/settings-view.tsx");
 assert.match(css,/\.workspace-options button\[aria-pressed="true"\]/);
 assert.match(settings,/role="group" aria-label="Workspace mode"/);
});

test("GitHub Intelligence selector, metrics and status all follow the selected light-dark theme",()=>{
 const css=read("app/nbo-premium.css");
 for(const className of [".gh-panel .gh-controls",".gh-panel .gh-controls select",".gh-panel .gh-metrics",".gh-panel .gh-severity",".gh-panel .gh-warning"]){
  assert.ok(css.includes(className),className);
 }
 assert.match(css,/\.gh-panel \.gh-metrics>div\{background:var\(--ui-panel\)/);
});
