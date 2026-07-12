---
title: "Generate Your Automation File (GitHub Actions CI)"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "CI/CD & Scheduled Automation"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY]

Read CLAUDE.md. Create a GitHub Actions automation file for Pipeline CRM.
Save it at: .github/workflows/ci.yml

The automation should run automatically every time I push code to GitHub.

It should do these things in order:
1. INSTALL — Set up Node.js version 20 and install all project dependencies
2. LINT — Run npm run lint and fail if there are any warnings or errors
3. BUILD — Run npm run build and fail if there are any TypeScript errors
4. SECURITY SCAN — Check all dependencies for known security vulnerabilities

Rules:
- If any step fails, stop immediately
- Never expose any .env keys or secrets in the automation logs
- Show me a plain English summary of what passed and what failed
