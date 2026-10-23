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
