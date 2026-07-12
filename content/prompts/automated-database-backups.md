---
title: "Automated Database Backups"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY]

Set up automated database backups for Pipeline CRM.

Method 1 — Supabase Built-In (do this first):
Walk me through enabling Point-in-Time Recovery in my Supabase project settings.

Method 2 — Weekly Export Script:
Create a script at /scripts/backup-db.js that:
1. Connects to Supabase using the service role key from .env.local
2. Exports all tables (contacts, deals, tasks, profiles) as JSON files
3. Saves each export to /backups/[YYYY-MM-DD]/[table-name].json
4. Logs the backup completion with a timestamp

Create a GitHub Actions file at .github/workflows/backup.yml that:
- Runs this script every Sunday at midnight automatically
- Stores the backup files as GitHub Action artifacts
- Sends me a notification if the backup fails

Rules:
- Never log or expose the service role key
- Keep the last 4 weeks of backups — delete anything older
- After setting up, run a manual test backup
