---
title: "Action 1 — Launch Multiple Workers at Once"
category: Build/Execution
project: global
tags: ["build", "action"]
source: "Operator Hub Build Console"
stageGroup: "Parallel Sub-Agents"
created: 2026-07-12
updated: 2026-07-12
---
ALWAYS launch multiple workers at once (separate AI sessions running simultaneously on different tasks). Never wait.

THE EXACT PROMPT:
"Launch [X] sub agents to handle this. Give one the Database context, one the Backend context, and one the Frontend context so they can work simultaneously."

WHEN TO USE:
- When you need multiple opinions on the same problem
- When tasks are independent of each other
- When a single task would take too long alone

WARNING: This only works if your instructions are crystal clear — vague instructions given to five workers produces five bad results instead of one.

EXAMPLE (for large features):
"Launch 3 sub-agents to handle this simultaneously.
Give AGENT-ARCHITECT the database context.
Give AGENT-DESIGNER the UI spec.
Give AGENT-MESSENGER the API contract.
Report back when all three are ready for integration."
