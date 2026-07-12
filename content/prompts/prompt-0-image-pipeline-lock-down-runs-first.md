---
title: "Prompt 0 — Image pipeline lock-down (RUNS FIRST)"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
TASK: Lock down the flip-book image pipeline so every page renders faithfully at professional quality. Do ONLY this.

EXACT FILES (only these):
- CREATE src/utils/buildPageArray.ts
- src/routes/workbook.tsx
- src/components/StudentBook/StudentWorkbookFlip.tsx

DO:
1. buildPageArray.ts: import page-bindings.json; export a builder returning the full 95-entry WorkbookPageEntry[].
2. ASPECT RATIO: PNGs are 816x1056 portrait (US Letter). Set the two-page spread container to aspect-[2/1.414].
3. SPINE + SHADOW: strengthen the center spine gradient; add a drop-shadow on the outer book container.
4. PRELOAD: on each page turn, inject <link rel="preload" as="image"> for current + next 2 pages.
5. PAGE PAIRING: expose an initialPage prop (0 or 1) controlling recto/verso; keep step=2.
6. FALLBACK: onError handler swaps in a page-colored rectangle with the page number centered.

OUT OF SCOPE: activities, Gretel, rewards, Supabase, audio, teacher dashboard, auth.

COMMIT: feat(workbook): faithful 95-page image pipeline (builder, ratio, spine, preload, fallback)

STOP after this commit.
