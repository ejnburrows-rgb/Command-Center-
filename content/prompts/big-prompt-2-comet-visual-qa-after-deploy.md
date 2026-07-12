---
title: "Big Prompt 2 — Comet: visual QA after deploy"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
Verify production visually after the latest Antigravity commit deploys.

Check:
https://cartilla-de-gretel.vercel.app
https://cartilla-de-gretel.vercel.app/cartilla
https://cartilla-de-gretel.vercel.app/cartilla/leccion/9
https://cartilla-de-gretel.vercel.app/cartilla/leccion/17
https://cartilla-de-gretel.vercel.app/cartilla/teacher/presentacion

Verify:
1. Deployment — robots.txt serves the latest expected commit.
2. Student cover — original cover, no stylized/Pixar/fake cover.
3. Lesson 9 — real physical flip, pages 27–29 scans visible, no emojis/fake art.
4. Lesson 17 — real physical flip, pages 59–61 scans visible, no La Rana Rosa.
5. Teacher presentation — separate from student workbook, honest status language.
6. Mobile/responsive — flip and frame intact, controls usable.

Final report: PASS/FAIL for each item; console errors YES/NO; screenshots YES/NO.
