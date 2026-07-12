---
title: "Big Prompt 1 — Antigravity: premium student workbook shell"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
ACTIVE LANE: ANTIGRAVITY

Do a focused visual-quality upgrade. Do not add new lessons. Do not invent art. Do not mix teacher workbook with student workbook.

Repo:
C:\Users\enovo\OneDrive\Desktop\cartilla-de-gretel-live

Current production commit:
85a129552cfd517be847972b530d58f36137284b

GOALS:
1. Replace cheap slide transition with real book-page flip.
2. Improve student workbook background/frame so it does not look like a pasted scan.
3. Remove remaining emoji/fake-art hints from student-facing activities/data.
4. Keep teacher presentation separate from student workbook.
5. Preserve original source scans and honest statuses.

PART A — REAL BOOK PAGE FLIP
Replace the current cheap slide transition with a realistic full-page flip effect.
Requirements:
- Manual only: Anterior / Siguiente.
- Use 3D perspective. transform-style: preserve-3d.
- rotateY around 160–180 degrees during transition.
- Duration: 700ms–1000ms. Easing: cubic-bezier(0.22, 1, 0.36, 1) or similar.
- Subtle page shadow during flip; slight paper highlight/gradient on the flipping page.
- backface-visibility correct. Keep page chips working. Responsive/mobile-friendly.
Preferred: create src/components/cartilla/BookPageFlip.tsx

PART B — STUDENT WORKBOOK FRAME / BACKGROUND
Warm desk/book background, realistic workbook frame, soft paper shadow, off-white paper surface, subtle paper texture/gradient, rounded page edges, scan centered and scaled beautifully.

PART C — STUDENT VS TEACHER SEPARATION
- Student side: "Cuaderno del estudiante"
- Teacher side: "Presentación del maestro"

PART D — REMOVE EMOJIS FROM STUDENT-FACING EXPERIENCE
PART E — DO NOT OVERCLAIM
PART F — VALIDATION: npm run typecheck / npm run lint / npm run build
PART G — COMMIT: feat: upgrade student workbook page flip and book shell
