---
title: "Prompt B — Animate Gretel end-to-end"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
TASK: Make Gretel fully animated and reactive. Make gretelMachine.ts + useGretelAnimation.ts the single source of truth driving all Gretel UI.

WIRING:
1. useGretelAnimation reads gretelMachine state -> selects sprite sequence from gretelPoses.ts
2. GretelMascot cycles the correct WebP frames per state (idle/blink, talk, cheer, error)
3. GretelSpeechBubble text from gretel-feedback.ts; error lines from error-messages.ts
4. Activity components dispatch CORRECT / INCORRECT / CELEBRATE / SPEAK on answer

HARD RULE: Gretel's spoken text comes ONLY from gretel-feedback.ts and error-messages.ts.

COMMIT: feat(gretel): drive all Gretel UI from gretelMachine + animation hook

STOP after this commit.
