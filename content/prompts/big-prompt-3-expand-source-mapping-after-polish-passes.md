---
title: "Big Prompt 3 — Expand source mapping (after polish passes)"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
Only run this after the premium student workbook shell passes visual QA.

Goal: Scale source-page mapping beyond Lessons 9 and 17 without lowering quality.

Rules: original source scans only; no fake art; no emojis; no invented text; no hotspot claims unless coordinates verified.

For each lesson:
1. Locate exact source PDF/page scan.
2. Extract page scan at high quality.
3. Save under public/cartilla/images/source/[lesson-key]/
4. Update lessons.json with scan paths and verified text only.
5. Update workbook-interactions.json only where source-backed.
6. Update source-art-inventory.json.
7. Keep cutouts/hotspots pending unless actually mapped.
8. Run typecheck/lint/build.
9. Commit/push in one coherent batch.
