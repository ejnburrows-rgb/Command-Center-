---
title: "Diaflow — Backup Gate"
category: Build/Execution
project: global
tags: ["deploy", "flow"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
FLOW: Backup Gate — run before any risky batch.

DO:
1. Confirm a fresh Git checkpoint exists.
2. Confirm repo is private and .env is ignored.
3. Run a secret scan on the input diff/changes.
4. If any check fails, BLOCK and report what must be fixed.
5. If all pass, return GO with the restore point reference.

OUTPUT: GO / NO-GO + restore point + what to fix if NO-GO.
