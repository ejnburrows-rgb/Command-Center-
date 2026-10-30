import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("Overview (/) renders the Cartilla-First 10-Second Command Header with Project Switcher, 3 Quick Actions, and 4 Primary Status Cards (NOW / NEXT / BLOCKERS / PROGRESS)", () => {
  const home = read("app/mission-home.tsx");
  assert.match(home, /cartilla-command-deck/);
  assert.match(home, /★ La Cartilla de Gretel/);
  assert.match(home, /LANY Books/);
  assert.match(home, /NBO Operations Hub/);
  assert.match(home, /All 8 Projects/);
  // Three Quick Actions
  assert.match(home, /1\. Open Working Preview/);
  assert.match(home, /Live Mariposas c670ff04/);
  assert.match(home, /Cartilla Visual Studio/);
  assert.match(home, /2\. Open Relevant GitHub Work/);
  assert.match(home, /3\. Copy Agent Handoff/);
  assert.match(home, /copyHeaderHandoff/);
  // Four Primary Status Cards
  assert.match(home, /🟠 NOW/);
  assert.match(home, /🔵 NEXT/);
  assert.match(home, /🔴 BLOCKERS/);
  assert.match(home, /🟢 PROGRESS/);
  assert.match(home, /StubEars/);
  assert.match(home, /162\/199/);
  assert.match(home, /88\/90/);
});

test("GretelCommander replaces misleading 115 CODE CHANGES stat with 7-stage delivery breakdown", () => {
  const commander = read("app/gretel-commander.tsx");
  assert.doesNotMatch(commander, />CODE CHANGES</);
  assert.match(commander, /gretel-seven-stage/);
  assert.match(commander, /1\. DEPLOYED LIVE/);
  assert.match(commander, /2\. MERGED · MOTION/);
  assert.match(commander, /3\. MERGED · CROPS/);
  assert.match(commander, /4\. MERGED · AUDIO/);
  assert.match(commander, /5\. MERGED · WORKBOOK/);
  assert.match(commander, /6\. MERGED · FLIP CHART/);
  assert.match(commander, /7\. ACTIVE PR · TUTOR/);
});

test("JulesAssignment collapses into a 1-line summary banner by default and MissionHome + AIOperations filter bot micro-PRs by default", () => {
  const jules = read("app/jules-assignment.tsx");
  const home = read("app/mission-home.tsx");
  const ops = read("app/ai-operations.tsx");
  assert.match(jules, /const \[expanded,\s*setExpanded\]\s*=\s*useState\(false\)/);
  assert.match(jules, /Expand 11-point evidence ▾/);
  assert.match(jules, /Live session UNKNOWN/);
  assert.match(home, /Hide unapproved bot micro-PRs/);
  assert.match(home, /const \[hideBotMicroPrs,setHideBotMicroPrs\]=useState\(true\)/);
  assert.match(ops, /Hide unapproved bot micro-PRs/);
  assert.match(ops, /const \[hideBotMicroPrs,setHideBotMicroPrs\]=useState\(true\)/);
});

test("MissionNetwork colors nodes by verified semantic state (green, orange, red, gray) and renders collapsible vertical tree on mobile (< 640px)", () => {
  const net = read("app/mission-network.tsx");
  const css = read("app/mission-network.css");
  assert.match(net, /resolveProjectTone/);
  assert.match(net, /resolveWorkTone/);
  assert.match(net, /Green \(Verified Complete\)/);
  assert.match(net, /Orange \(In Progress \/ Needs Review\)/);
  assert.match(net, /Red \(Confirmed Blocker\)/);
  assert.match(net, /Gray \(Paused \/ Draft \/ Unverified\)/);
  assert.match(net, /network-mobile-tree/);
  assert.match(css, /@media\(max-width:639px\)/);
});
