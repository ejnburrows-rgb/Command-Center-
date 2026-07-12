---
title: "Action 2 — Demand Implementation Spec Before Code"
category: Build/Execution
project: global
tags: ["build", "action"]
source: "Operator Hub Build Console"
stageGroup: "Spec Before Code"
created: 2026-07-12
updated: 2026-07-12
---
ALWAYS demand a written plan (implementation spec) before a single line of code is written. Without it, the AI has to guess — and guessing is statistically guaranteed to produce the wrong result.

THE EXACT PROMPT:
"Write me an implementation spec to build [FEATURE NAME]. For each step, show me the key decisions you would make and why. Do not write any code until I approve this plan."

WHY THIS MATTERS:
With hundreds of possible decisions in any build, guessing is statistically guaranteed to produce the wrong result. The spec forces the AI to show its work before committing to it.

HOW TO USE:
1. Paste the prompt
2. Review the plan the AI produces
3. Ask questions about any decision you disagree with
4. Only after you type "APPROVED" does the AI start building

VARIATION (for new features):
"Read crm_harness.md and the relevant feature spec in /docs/feature-specs/. Write an implementation plan for: [FEATURE NAME]. For each step, show the key decisions you'd make and why. Do not write any code until I approve this plan."
