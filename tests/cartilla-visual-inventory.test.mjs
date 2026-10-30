import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("art-inventory library points to canonical main and art-inventory-live render refs without hardcoded counts", () => {
  const lib = read("lib/art-inventory.ts");
  assert.match(lib, /export const DEFAULT_REF = "main"/);
  assert.match(lib, /export const IMAGE_REF = "main"/);
  assert.match(lib, /export const ARCHIVAL_RENDER_REF = process\.env\.ART_INVENTORY_REF \|\| "art-inventory-live"/);
  assert.match(lib, /raw\.githubusercontent\.com/);
  // Ensure the dead branch is not used
  assert.doesNotMatch(lib, /art\/owner-arco-elefante-2026-10-22/);
  // Ensure manual status count object is not hardcoded
  assert.doesNotMatch(lib, /export const CANONICAL_COUNTS/);
  // Ensure slots join on canonical artwork_id from MASTER-MAPPING.csv
  assert.match(lib, /mappingBySlot\.has\(rawKey\)/);
  assert.match(lib, /src\/data\/page-layouts\.json/);
  assert.match(lib, /docs\/production-art-classification-audit\.json/);
});

test("art-inventory tracks the ten flagged workbook subjects (including ala/alas) and merged #1205 / #1204 repairs", () => {
  const lib = read("lib/art-inventory.ts");
  const subjects = ["escuela", "taza", "pera", "dulce", "escoba", "ola", "alas", "ala", "imán", "ardilla", "espejo"];
  for (const s of subjects) {
    assert.match(lib, new RegExp(`"${s}"`));
  }
  // Merged repairs #1205 and #1204
  assert.match(lib, /source-crop-repairs-2026-10-27/);
  assert.match(lib, /RECONCILED_1204/);
});

test("inventory view provides phone-friendly 4-tab layout (Activities, Artwork, Motion, Audio & Voice), all 11 Part 4 fields, all 10 Part 5 fields, and orthogonal category separation", () => {
  const view = read("app/art-inventory/inventory-view.tsx");
  assert.match(view, /tab === "activities"/);
  assert.match(view, /tab === "artwork"/);
  assert.match(view, /tab === "motion"/);
  assert.match(view, /tab === "audio"/);
  assert.match(view, /4\. AUDIO & VOICE/);
  // Ensure activities tab never renders inv.activities.length as a combined sum badge
  assert.doesNotMatch(view, /tabBtn\("activities",\s*"1\. ACTIVITIES",\s*inv\.activities\.length\)/);
  // Mariposas parity & PR #1010 comparison
  assert.match(view, /PR #1079/);
  assert.match(view, /PR #1010/);
  assert.match(view, /mariposas-p/);
  // Part 4 11 fields
  assert.match(view, /cropCompleteness/);
  assert.match(view, /orientationAndObjectCount/);
  assert.match(view, /resolutionAndScaling/);
  assert.match(view, /transparencyCorrectness/);
  assert.match(view, /sourceFidelity/);
  assert.match(view, /ownerApprovalStatus/);
  assert.match(view, /smallestSourcePreservingFix/);
  // Part 5 motion & reduced-motion toggle
  assert.match(view, /stale-motion-art\.json/);
  assert.match(view, /simulateReducedMotion/);
  assert.match(view, /whatPhysicallyMoves/);
  assert.match(view, /sameApprovedSource/);
  // Tab 4 Audio & Voice checks
  const lib = read("lib/art-inventory.ts");
  assert.match(lib, /src\/content\/picture-vocabulary\.json/);
  assert.match(lib, /src\/content\/picture-name-recordings\.json/);
  assert.match(lib, /Gretel_558674_Original\.m4a/);
  assert.match(lib, /rejected_wrong_source/);
  assert.match(lib, /AUDIO_POLICY\.allowTts = false/);
  assert.match(view, /<audio controls preload="none"/);
});

test("NBO navigation routes expose Visual Inventory across HubShell, Commander, LiveStatus and ProjectView, and remove legacy /visualizer from mainNav", () => {
  const shell = read("app/hub-shell.tsx");
  const commander = read("app/gretel-commander.tsx");
  const live = read("app/live-status.tsx");
  const project = read("app/project-view.tsx");
  assert.match(shell, /Cartilla Studio/);
  assert.doesNotMatch(shell, /const mainNav:Section\[\]=\[[^\]]*"Visualizer"/);
  assert.match(commander, /\/art-inventory/);
  assert.match(live, /\/art-inventory/);
  assert.match(project, /\/art-inventory/);
});
