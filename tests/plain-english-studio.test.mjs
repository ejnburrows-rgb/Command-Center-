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

test("BestPractices, RechartsMilestoneTimeline, and LifecycleForceGraph provide horizontal Recharts milestone/status progression timeline and D3.js force-directed graph", () => {
  const bp = read("app/best-practices.tsx");
  const fg = read("app/lifecycle-force-graph.tsx");
  const rmt = read("app/recharts-milestone-timeline.tsx");
  assert.match(bp, /from "recharts"/);
  assert.match(bp, /layout="vertical"/);
  assert.match(bp, /ComposedChart/);
  assert.match(bp, /RechartsMilestoneTimeline/);
  assert.match(bp, /LifecycleForceGraph/);
  assert.match(rmt, /from "recharts"/);
  assert.match(rmt, /cumulativeProgression/);
  assert.match(rmt, /statusLabel/);
  assert.match(rmt, /layout="vertical"/);
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

test("DailyFocusWidget pulls together the next action from each project into a single summary view on Overview", () => {
  const hq = read("app/plain-english-hq.tsx");
  const df = read("app/daily-focus-widget.tsx");
  assert.match(hq, /import DailyFocusWidget from "\.\/daily-focus-widget"/);
  assert.match(hq, /<DailyFocusWidget/);
  assert.match(df, /DAILY FOCUS · ONE NEXT ACTION PER PROJECT/);
  assert.match(df, /Complete Next Action/);
  assert.match(df, /Copy Next AI Prompt/);
  assert.match(df, /TUTOR_1073_ONLY/);
});

test("ProjectProgressBar renders interactive task-based progress bars on project cards in Projects view, Overview, and Project Workspace", () => {
  const pv = read("app/projects-view.tsx");
  const pview = read("app/project-view.tsx");
  const hq = read("app/plain-english-hq.tsx");
  const ppb = read("app/project-progress-bar.tsx");
  assert.match(pv, /<ProjectProgressBar slug=\{p\.slug\}/);
  assert.match(pview, /<ProjectProgressBar slug=\{p\.slug\}/);
  assert.match(hq, /<ProjectProgressBar slug=\{spec\.slug\}/);
  assert.match(ppb, /role="progressbar"/);
  assert.match(ppb, /computeProjectTaskMetrics/);
});



