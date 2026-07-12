---
title: "Secrets Audit (Run Monthly)"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY — RUN MONTHLY]

Run a complete secrets audit on Pipeline CRM. Check three layers:

LAYER 1 — CURRENT CODE
Search all files in /app, /lib, /scripts, /docs for:
- Any string starting with: sk_, pk_, rk_, whsec_, eyJ, SB_
- Any assignment like: ="[long string]" or ='[long string]'
- Any file that imports or requires a value that looks like a key

LAYER 2 — ENV FILE PROTECTION
- Confirm .env.local is NOT tracked by git
- Confirm .env.local appears in .gitignore
- Confirm .env.example has no real values — only empty placeholders

LAYER 3 — KEY FRESHNESS CHECK
List every key in .env.example with:
- When it was last rotated
- Whether it is overdue for rotation (90 days for Stripe, 6 months for Supabase read-only keys)
- Flag any key I have never rotated since the project started

Output format:
🔴 CRITICAL ISSUES (fix today): [list]
🟡 OVERDUE ROTATIONS (schedule this week): [list]
✅ ALL CLEAR: [list]

End with: date of this audit saved to /docs/security-reports/[YYYY-MM-DD]-secrets-audit.md
