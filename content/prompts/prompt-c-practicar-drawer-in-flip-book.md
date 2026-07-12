---
title: "Prompt C — ¡Practicar! drawer in flip-book"
category: Build/Execution
project: global
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
TASK: Add the ¡Practicar! button + bottom drawer to the flip-book so activities open without leaving the page.

BEHAVIOR:
1. On page change, check workbook-interactions.json; resolve lessonNumber via page-bindings.json
2. If activities exist -> show floating ¡Practicar! button (Framer Motion slide-up)
3. Tapping opens Framer Motion bottom drawer rendering InteractiveWorkbookLayer
4. Closing returns to SAME flip-book page
5. No activities -> button does not render

COMMIT: feat(workbook): add ¡Practicar! activity drawer driven by page-bindings

STOP after this commit.
