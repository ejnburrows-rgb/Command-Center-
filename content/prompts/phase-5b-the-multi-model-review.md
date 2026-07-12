---
title: "Phase 5B — The Multi-Model Review"
category: Build/Execution
project: global
tags: ["build", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Prompt Chaining (4-Step Feature Build)"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO GROK HEAVY — AFTER ANTIGRAVITY FINISHES EACH PHASE]

You are a senior code reviewer.
I used Claude Code and Antigravity to build this.
Your job is to find what they got wrong, not confirm what they got right.

Here is the code: [PASTE THE CODE ANTIGRAVITY GENERATED]

Review for:
1. Security gaps — any route accessible without login?
2. Data leaks — could one user see another user's data?
3. Missing error handling — what crashes silently?
4. TypeScript violations — any "any" types or type mismatches?
5. Mobile layout — any elements that break on small screens?
6. Performance — any obvious slow queries or missing indexes?

Format:
🔴 CRITICAL (fix before moving on) — [list]
🟡 IMPORTANT (fix before deploying) — [list]
🔵 MINOR (fix in cleanup) — [list]
✅ CONFIRMED CORRECT — [list]
