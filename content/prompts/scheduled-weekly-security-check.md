---
title: "Scheduled Weekly Security Check"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "CI/CD & Scheduled Automation"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY]

Create a second GitHub Actions file at: .github/workflows/security.yml

This automation runs every Monday at 9am automatically.

It should:
1. Scan all installed packages for known security vulnerabilities
2. Run GitHub's built-in secret scanner
3. Create a simple report showing: what was scanned, what was found, what needs to be fixed

Rules:
- Fail loudly if anything rated CRITICAL is found
- Never print any actual secret values in the log — flag as [REDACTED]
- Write results to /docs/security-reports/[date]-scan.md
