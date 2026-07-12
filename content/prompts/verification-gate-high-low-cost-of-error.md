---
title: "Verification Gate (High/Low Cost of Error)"
category: Build/Execution
project: global
tags: ["deploy", "action"]
source: "Operator Hub Build Console"
stageGroup: "Pre-Flight & Ship"
created: 2026-07-12
updated: 2026-07-12
---
ALWAYS make the AI verify its own work before calling anything done.

THE EXACT PROMPT:
"Before you build: verify this feature against the High/Low Cost of Error rules. Tell me exactly how you will test this code before marking it complete. List every edge case that could break this, and confirm your plan covers them."

HIGH COST OF ERROR — MANDATORY HUMAN SIGN-OFF:
- Database schema changes
- Row-Level Security (RLS) policies
- Stripe payment logic
- User role permissions
- Any .env secret key

LOW COST OF ERROR — BUILD FAST, ITERATE FREELY:
- Website UI and layout
- Tailwind class changes
- Static copy and placeholder text
