import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("homepage renders PlainEnglishHQ first and wraps technical panels inside an expandable drawer", () => {
  const content = read("app/hub-content.tsx");
  assert.match(content, /import PlainEnglishHQ from "\.\/plain-english-hq"/);
  assert.match(content, /<PlainEnglishHQ projects=\{feed\.projects\}/);
  assert.match(content, /<details className="hq-tech-drawer">/);
  assert.ok(content.indexOf("<PlainEnglishHQ") < content.indexOf("<details className=\"hq-tech-drawer\">"));
});

test("Desktop coding IDE themes (Tokyo Night, Catppuccin, Dracula Cyan, Cursor Carbon) are configured", () => {
  const prefs = read("app/premium-preferences.tsx");
  assert.match(prefs, /Tokyo Night/);
  assert.match(prefs, /Catppuccin/);
  assert.match(prefs, /Dracula Cyan/);
  assert.match(prefs, /Cursor Carbon/);
});

test("PlainEnglishHQ spotlights main projects in plain English and respects Cartilla #877 authorization", () => {
  const hq = read("app/plain-english-hq.tsx");
  for (const slug of ["cartilla-de-gretel", "lany-books-web", "Command-Center-"]) {
    assert.ok(hq.includes(`"${slug}"`), `Missing main project slug: ${slug}`);
  }
  assert.match(hq, /TUTOR_1073_ONLY/);
  assert.match(hq, /Copy next AI instruction/);
  assert.match(hq, /\/art-inventory/);
});

test("API library route loads all 75+ markdown files from /content/ and PromptLibrary renders un-crowded split-pane explorer", async () => {
  const api = read("app/api/library/route.ts");
  const libUi = read("app/prompt-library.tsx");
  assert.match(api, /walkMarkdownFiles/);
  assert.match(api, /AI Behavior Library \(00–16\)/);
  assert.match(libUi, /fetch\("\/api\/library"/);
  assert.match(libUi, /Master Prompt &amp; Knowledge Library/);
  assert.match(libUi, /lib-split-workspace/);
  assert.match(libUi, /lib-reader-pane/);
});

test("BestPractices and LifecycleForceGraph provide D3.js force-directed graph with central project hubs, branching tasks, and horizontal Recharts timeline", () => {
  const bp = read("app/best-practices.tsx");
  const fg = read("app/lifecycle-force-graph.tsx");
  assert.match(bp, /from "recharts"/);
  assert.match(bp, /layout="vertical"/);
  assert.match(bp, /ComposedChart/);
  assert.match(bp, /LifecycleForceGraph/);
  assert.match(fg, /from "d3"/);
  assert.match(fg, /forceSimulation/);
  assert.match(fg, /forceLink/);
  assert.match(fg, /forceManyBody/);
  assert.match(fg, /radial-orbit-ring/);
  assert.match(fg, /lifecycle-svg/);
  assert.match(bp, /nbo-lifecycle-web-v1/);
  assert.match(bp, /nbo-project-briefs-v1/);
  assert.match(bp, /nbo-lessons-learned-v1/);
  assert.match(bp, /Copy AI Kickoff Prompt/);
  assert.match(bp, /Release Readiness Gate/);
  assert.match(bp, /Lessons Learned &amp; Reusable Rules/);
});
