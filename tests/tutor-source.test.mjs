import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchTutorSource, tutorSourceFromPullRequest } from "../lib/tutor-source.mjs";

const sha = "b4439da461239b142bf06970e02870c1e3c45ebc";
const pr = { number: 1073, state: "open", draft: true, updated_at: "2026-10-29T22:00:00Z", head: { sha, ref: "feat/gretel-tutor-l1-3" } };
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Tutor PR source resolves the current verified head as a separate draft source", () => {
  const source = tutorSourceFromPullRequest(pr, "2026-10-30T12:00:00Z");
  assert.equal(source.freshness, "FRESH");
  assert.equal(source.lifecycle, "DRAFT");
  assert.equal(source.headSha, sha);
  assert.equal(source.base, `https://raw.githubusercontent.com/ejnburrows-rgb/cartilla-de-gretel/${sha}/`);
  assert.equal(source.observedAt, "2026-10-30T12:00:00Z");
  const invalid = tutorSourceFromPullRequest({ ...pr, head: { sha: "old-or-missing" } }, "2026-10-30T12:00:00Z");
  assert.equal(invalid.freshness, "UNAVAILABLE");
  assert.equal(invalid.base, "");
});

test("Tutor PR refresh is uncached and unavailable data has no stale source fallback", async () => {
  let request;
  const source = await fetchTutorSource(async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => pr };
  });
  assert.equal(request.url, "https://api.github.com/repos/ejnburrows-rgb/cartilla-de-gretel/pulls/1073");
  assert.equal(request.options.cache, "no-store");
  assert.equal(source.freshness, "FRESH");
  const missing = await fetchTutorSource(async () => ({ ok: false, status: 503 }));
  assert.equal(missing.freshness, "UNAVAILABLE");
  assert.equal(missing.base, "");
  assert.equal(missing.headSha, null);
  assert.match(missing.error, /503/);
});

test("art inventory keeps production main separate, removes the old Tutor SHA, and retains inventory totals", () => {
  const lib = read("lib/art-inventory.ts");
  const view = read("app/art-inventory/inventory-view.tsx");
  assert.match(lib, /const mainBase = `https:\/\/raw\.githubusercontent\.com\/\$\{OWNER\}\/\$\{REPO\}\/\$\{mainSha\}\/`/);
  assert.match(lib, /const tutorBase = tutorSource\.freshness === "FRESH" \? tutorSource\.base : ""/);
  assert.match(lib, /tutorMilestones:\s*1/);
  assert.match(lib, /all:\s*slots\.length/);
  assert.match(lib, /activities:\s*activitiesList/);
  assert.doesNotMatch(lib + view, /bb585e1eb467d57731a666f6690546958ab34890|bb585e1e/);
  assert.match(view, /Tutor PR #1073: \{inv\.tutorSource\.freshness\}/);
  assert.match(view, /Tutor proof is hidden until the current PR head can be verified/);
});
