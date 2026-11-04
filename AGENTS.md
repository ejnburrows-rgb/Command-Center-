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

<!-- OWNER_IN_CHAT_VISUAL_EXPLORER_BEGIN: 2026-11-04 -->
## Owner-approved in-chat visual repository explorer (mandatory reporting)

**This is an instruction for the agent's reply inside the current ChatGPT conversation.** It is NOT a request to build, open, or update NBO Operations Hub, an external website, a separate dashboard, a graph file, or a new service. Never substitute a link to another dashboard for the in-chat visual.

- For **every project-related owner update, decision, review, or handoff**, begin with a mobile-readable GitDiagram-inspired visual map **inside the chat reply**. Show the whole repository/project structure at a useful overview level, and automatically highlight the feature, dependency, issue, or change under discussion. Use interactive native chat components if supported: click-to-expand nodes, zoom/pan, search, and a right-side or below-map detail inspector. Offer four navigable layers: **Experience map**, **Under the hood** (real repository paths and contents), **Changes & release** (branches, PRs, checks, deployments), and **Browse everything** (full indexed feature/asset inventory). On a short update the first view may be compact, but the full map must remain accessible. Do not crowd hundreds of items into unreadable nodes.
- Discover feature areas and their connected components from **current verified source**, including entry points, screens, games, activities, data, assets, media, tests, dependencies, unmounted features, branches and PRs. Include every discovered lesson/page/sheet or other indexed item via drilldown when relevant; label the inventory **partial** if exhaustive discovery was not done. Do not invent missing contents.
- Each feature's detail should explain in plain English: what exists, what it does, its dependent parts, source paths, proposed/current changes, what remains, exact version checked, and proof. Keep code and raw logs behind optional links/details; the owner must not need to read GitHub.
- Distinguish **agent claim → independently tested → merged into main → deployed → actually observed working live** as separate evidence milestones. Use project-specific owner status labels (for Cartilla: **DONE and live / DONE but not live / WAITING / NOT TESTED**); give dates and source links. Do not invent percentages, worker activity, screenshots, tests or live states. Mark stale, missing or inaccessible evidence as **unknown/not tested**.
- Include genuine screenshots, playable videos, before/after comparisons or working previews directly in chat **when available**; identify which version and device each proves. For consequential owner choices, show the actual proposed result and evidence, then a clear **YES / NO** decision where the UI supports it. A click alone does not authorize a merge/release outside its explicitly stated scope. Record an approved decision in the project's **existing** canonical issue or PR only with permitted authenticated write access and a confirmed successful write; do not claim persistence otherwise.
- Finish with **STATUS / RESULT / PROOF / WHAT REMAINS** and one clear next step. Preserve all existing product, security, privacy, independent-review, merging, spending, source-fidelity and deployment restrictions. No new dashboards, agents, duplicate queues, databases, monitoring, or unrelated changes solely to satisfy this reporting format.
- If the chat interface cannot render interactive visuals, show an actual readable diagram (Mermaid or a simple connected text map), structured expandable-equivalent detail and source links in the **same answer**. Be explicit that it is a static fallback; do not claim that unsupported controls work.
<!-- OWNER_IN_CHAT_VISUAL_EXPLORER_END -->
