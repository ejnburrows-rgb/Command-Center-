# NBO Operations Hub — agent working rules

**Purpose:** Help the owner see real project progress, control decisions and complete existing work. This is the existing Command Center, **not** a new controller or dashboard.

## Before work

- Confirm the latest GitHub repo, `main`, existing PR/branch and acceptance criteria. Inspect the current app and actual connected evidence before proposing any redesign. Reuse open work (including existing NBO PRs) before creating a replacement.
- Owner decisions in `knowledge/Human/` take precedence over AI findings; read `knowledge/AGENT.md` and scoped findings **only when working on project knowledge**. Do not confuse historical prompts with live tasks.
- Use GitHub PR/commit states as Git evidence, not proof of a running Codex/Jules session. Show the source and last observed timestamp. When API information is unavailable, show **Unknown/Stale**, never simulated worker presence or invented completion percentages.

## One bounded product deliverable at a time

- Work **Idea → Plan → Build → Focused Test → Real Visual Proof → Review/Owner Decision → Authorized Integration → Separately Authorized Release**.
- Set one visible acceptance goal and complete the smallest coherent implementation. Do not create duplicate command centers, branches, monitoring services or another master plan; do not repeat unchanged audits and test runs.
- Recover safely from ordinary local test/tool failures. A block holds **only the affected action**; save real work and continue the next independent eligible, already-authorized assignment **within the same available session**. Do not imply background activity after the session ends.
- Avoid unnecessary sequential commits/builds or Vercel deployments. Use the repo's existing test/build commands for changed behavior. For visible changes, verify actual phone and desktop UI. A successful compile alone does not prove usable product behavior.

## Owner control and evidence

- Show the owner the task, actual change, applicable pass/fail/unverified checks, screenshot/video when relevant, exact Git revision, release state, next executable action and what truly needs a decision. The owner should not need to read code, but must be able to inspect and override priorities.
- Keep **visual acceptance**, independent technical review, exact-change merge permission and production deployment authorization **separate**. Do not auto-merge, auto-deploy, spend credits, change access/security, expose secrets or private knowledge, or delete irreplaceable work without applicable permission.
- When a current task is ready, save a concise checkpoint on its existing PR/issue, then continue safe eligible work. **Do not stop just to wait for routine technical approval.** Do stop at a specific protected merge/release/owner action without authorization.
- For any private owner notes, require actual server-side authorization; never put them in a publicly accessible client bundle.

**Checkpoint:** WORKS (and proof) / DOES NOT WORK (and reproduction) / NOT VERIFIED (and why) / NEXT (one accountable action). State the version checked. Distinguish built, tested, reviewed, integrated, deployed and live-verified.
