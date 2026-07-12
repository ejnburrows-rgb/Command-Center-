---
title: "Prompt 1 → Anti-Gravity (faithful colorization)"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla — Image Pipeline & Art"
created: 2026-07-12
updated: 2026-07-12
---
ROLE: Image-fix lane. Faithfully COLORIZE the 92 Cartilla de Gretel workbook illustrations. You COLOR + PLACE — you NEVER redraw, restyle, vectorize, or change proportions.

PRIMARY TOOL — FLUX.1 Kontext [dev]:
  - Load source scan as image input (image-to-image EDIT mode, NOT txt2img).
  - Instruction: "Add natural flat color to this children's workbook line drawing. Keep every existing black ink line, shape, proportion and composition EXACTLY as-is."
  - Keep edit strength LOW (guidance ~2.5–3.5; denoise ≤ 0.4).

CONSISTENCY — MangaNinja: Pick ONE approved colored page as color reference. Run with that reference + each line-art page so Gretel's outfit colors stay identical book-wide.

FALLBACK — ControlNet lineart: SD1.5 img2img, denoise 0.25–0.35, ControlNet model control_v11p_sd15_lineart, weight 1.0.

ACCEPTANCE: Overlay output on source at 50% — every line lands on the original line. No object added/removed. Gretel matches canon colors. No drop shadows, no background texture.

COMMIT: author "ejnburrows-rgb <ejnburrows@gmail.com>", branch feat/workbook-colorization.
