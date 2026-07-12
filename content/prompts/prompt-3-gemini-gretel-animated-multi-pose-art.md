---
title: "Prompt 3 → Gemini (Gretel animated multi-pose art)"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla — Image Pipeline & Art"
created: 2026-07-12
updated: 2026-07-12
---
ROLE: Produce a clean multi-pose sprite set of Gretel for the live character (welcome / read / celebrate / try-again / idle / point / wave).

CANON (match exactly): golden wavy blonde hair with a RED BOW on top; blue eyes; pink blush cheeks; NO freckles; blue pinafore with orange-floral embroidered hem; orange-and-pale-orange striped long-sleeve shirt; white knee-high socks with a red-yellow band + scalloped red-dot lace; black mary-jane shoes; age ~5–7.

TOOL: Use the supplied Gretel image as a locked character reference. Generate ONLY new poses/expressions, same outfit and proportions. Each pose: transparent background, 1024px tall.
DELIVER: welcome, point, read, celebrate, think, wave → public/cartilla/images/gretel/<pose>.webp
REJECT: any outfit/color/proportion change, freckles, dragonfly/mascot, generic kid avatar.
