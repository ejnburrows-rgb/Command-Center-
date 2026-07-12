---
title: "Set Up Code Protection"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY]

Set up full code protection for Pipeline CRM. Do each step and confirm ✅ or ❌:

1. PRIVATE REPO CHECK
   Confirm the GitHub repo is set to Private.

2. SECRET SCAN
   Search every file for strings that look like API keys, passwords, or tokens.
   Check for patterns like: "sk-", "Bearer", "password=", "secret=", "key="
   Report every match with file name and line number.
   If any found — flag as 🔴 CRITICAL and stop.

3. GITIGNORE CHECK
   Confirm these files are listed in .gitignore:
   .env.local
   .env
   .env.production
   node_modules/

4. COPILOT TRAINING OPT-OUT
   Remind me to go to:
   github.com → Settings → Copilot → "Allow GitHub to use my data for product improvements" → set to OFF

Report all 4 steps with clear pass/fail.
