---
title: "Local Backup Routine (For Your PC)"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY]

Create a local backup script at /scripts/local-backup.js

When I run this script it should:
1. Create a zip file of the entire project folder (excluding node_modules and .env files)
2. Name it: pipeline-crm-backup-[YYYY-MM-DD-HH-MM].zip
3. Save it to: C:/Backups/pipeline-crm/
4. Print a confirmation with the file size and location when done

Also tell me:
- How to set this to run automatically on my Windows PC once a week using Task Scheduler (GUI only)
- How to point the backup destination to my OneDrive folder instead
