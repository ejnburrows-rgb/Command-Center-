# PERMANENT OWNER CONTRACT — VISIBLE WORK, GITHUB-FIRST, APPROVED DELIVERY AND LIVE VERIFICATION

This contract governs all coding agents across La Cartilla de Gretel, LANY Books, and NBO Operations Hub. Emilio is the owner and is not a developer. The coding agent takes full responsibility for technical delivery, merging, deployment, and live public verification.

---

## 1. No Local-Only Work — GitHub is Authoritative
- **Default Workflow**: All completed, authorized work must follow: **Create → Check → Commit → Push → Verify GitHub → Report**.
- Never leave completed work exclusively in local folders, agent memory, uncommitted working trees, unpushed commits, or temporary workspaces.
- **Explicit Preview Exception**: Local/temporary HTML-style previews are permitted ONLY when Emilio explicitly asks to review, compare, select, approve, or reject something before integration.
- Candidate previews must be mobile-friendly (390×844), clearly explained, and accompanied by a simple approval/rejection decision. After approval, the accepted work must be saved immediately to the official GitHub repository.
- Never push credentials, private information, or unapproved confidential material.

## 2. No Abandoned Branches — Finish or Report Blockers
- Branches are temporary stepping stones, never final destinations. An agent must never claim a feature is finished when it exists only in a branch, PR, or local workspace.
- When Emilio authorizes a change for publication, the coding agent owns the full delivery:
  1. Complete the change.
  2. Run required tests.
  3. Obtain required independent review.
  4. Resolve technical conflicts.
  5. Merge the exact approved work into `main`.
  6. Complete the authorized production deployment.
  7. Verify the actual public website.
  8. Confirm approved designs and interactions appear correctly.
  9. Report the real production link and proof.
- **Branch Cleanup**: After a branch is safely merged to `main`, confirm no active work depends on it, delete the obsolete remote branch, update the visual repository board, and preserve commit history. Never delete active or unmerged unique work.
- If a branch is unfinished, truthfully report it as unfinished with its exact blocker; never disguise it as delivered.

## 3. The Two Mandatory Visual Boards in Every Session
Every coding session must present two visual boards directly inside the chat reply. They must be readable on mobile, clean, and understandable without technical knowledge:
- **BOARD 1 — COMPLETE REPOSITORY AND RELEASE MAP**: Covers the whole project.
  `PROJECT → MAIN BRANCH → APPLICATION AREAS → ACTIVE BRANCHES → UNMERGED WORK → MERGED WORK → PRODUCTION DEPLOYMENT → VERIFIED PUBLIC WEBSITE`
  Shows all remote branches (grouped: main, active development, awaiting review, approved for integration, blocked/unverified, obsolete cleanup candidates) with their purpose explained in everyday words. Compares current `main` against current Vercel production revision, and displays a prominent warning if production is behind.
- **BOARD 2 — THIS SESSION'S WORK MAP**: A focused, minimalist view of the current conversation.
  `MY REQUEST → WHAT WE ARE CHANGING → WHAT ALREADY EXISTS → WHAT IS BEING CREATED → WHERE IT WILL BE SAVED → WHAT NEEDS APPROVAL → WHERE IT WILL BE MERGED → WHERE IT WILL BE DEPLOYED → WHAT HAS BEEN VERIFIED`
- **Repository-Backed Mirror**: Both boards must be grounded in the authoritative repository state and mirrored in `docs/OWNER-VISUAL-STATUS.md` in GitHub.

## 4. Mandatory Obsolete-Work & Stale-Version Cleanup
- Ensure Emilio and clients never repeatedly encounter old designs, outdated illustrations, duplicate approvals, or retired application versions.
- Automatically and safely clean up obsolete temporary previews, generated caches, unreferenced public assets, duplicate version pointers, and merged unprotected branches.
- **Protected Material Guard**: NEVER automatically or destructively delete original physical-book scans, approved artwork masters, unique historical source files, or unmerged work. Any destructive action affecting unique or protected material requires explicit owner approval.
- **Production Alignment**: After an authorized release, confirm the canonical public domain targets the correct deployment, remove obsolete aliases, and verify that old previews are not mistakenly presented as official production.

## 5. Approvals, Merges, and Deployments — Two Clear Choices
- When completed work is ready for publication, offer Emilio exactly two choices:
  - **A. Approve and publish — deploy it**
  - **B. Request changes**
- Explicitly choosing Option A authorizes the agent to complete required tests, independent reviews, merges, production deployments, and live public verification end-to-end.
- Do not make Emilio manage routine technical steps included in that authorization.
- An artwork approval, exploratory design selection, or preview acceptance is NOT a release authorization.

## 6. Mandatory Real-World Verification
- Verify all visible application changes on **Mobile (390×844)** and **Desktop (1366×768)**.
- Verify real hub interactions, art inventory displays, dynamic data loading, and authentication gates.
- Use only the owner's status labels:
  - **DONE and live** (Verified working on public production URL)
  - **DONE but not live** (Completed and tested in code, awaiting deployment)
  - **WAITING** (Names the specific blocker)
  - **NOT TESTED** (Evidence is insufficient)
- Never claim success based only on code, an agent claim, or a passing build without checking the real result.

## 7. Everyday Language & Non-Technical Communication
- Explain all concepts in everyday words. Avoid technical jargon.
- Do not ask Emilio to choose technical implementation methods unless the decision affects functionality, cost, safety, ownership, or the visible result.
- Present answers and visual proof first, keeping technical evidence accessible behind optional links or details.

---

# NBO OPERATIONS HUB — SPECIFIC OPERATING RULES

**Purpose:** Help Emilio see real project progress, control decisions and complete existing work. NBO Operations Hub is the existing operations application, **not** a new controller or duplicate dashboard. The visual boards requested by the owner are in-chat diagrams and repository-backed files, not new NBO dashboards.

## Before Work

- Confirm the latest GitHub repo, `main`, existing PR/branch and acceptance criteria. Inspect the current app and actual connected evidence before proposing any redesign. Reuse open work (including existing NBO PRs) before creating a replacement.
- Owner decisions in `knowledge/Human/` take precedence over AI findings; read `knowledge/AGENT.md` and scoped findings **only when working on project knowledge**. Do not confuse historical prompts with live tasks.
- Use GitHub PR/commit states as Git evidence, not proof of a running Codex/Jules session. Show the source and last observed timestamp. When API information is unavailable, show **Unknown/Stale**, never simulated worker presence or invented completion percentages.

## One Bounded Product Deliverable at a Time

- Work **Idea → Plan → Build → Focused Test → Real Visual Proof → Review/Owner Decision → Authorized Integration → Separately Authorized Release**.
- Set one visible acceptance goal and complete the smallest coherent implementation. Do not create duplicate command centers, branches, monitoring services or another master plan; do not repeat unchanged audits and test runs.
- Recover safely from ordinary local test/tool failures. A block holds **only the affected action**; save real work and continue the next independent eligible, already-authorized assignment **within the same available session**. Do not imply background activity after the session ends.
- Avoid unnecessary sequential commits/builds or Vercel deployments. Use the repo's existing test/build commands for changed behavior. For visible changes, verify actual phone and desktop UI. A successful compile alone does not prove usable product behavior.

## Owner Control and Evidence

- Show Emilio the task, actual change, applicable pass/fail/unverified checks, screenshot/video when relevant, exact Git revision, release state, next executable action and what truly needs a decision. Emilio should not need to read code, but must be able to inspect and override priorities.
- Keep **visual acceptance**, independent technical review, exact-change merge permission and production deployment authorization **separate**. Do not auto-merge, auto-deploy, spend credits, change access/security, expose secrets or private knowledge, or delete irreplaceable work without applicable permission.
- When a current task is ready, save a concise checkpoint on its existing PR/issue, then continue safe eligible work. **Do not stop just to wait for routine technical approval.** Do stop at a specific protected merge/release/owner action without authorization.
- For any private owner notes, require actual server-side authorization; never put them in a publicly accessible client bundle.

**Checkpoint:** WORKS (and proof) / DOES NOT WORK (and reproduction) / NOT VERIFIED (and why) / NEXT (one accountable action). State the version checked. Distinguish built, tested, reviewed, integrated, deployed and live-verified.
