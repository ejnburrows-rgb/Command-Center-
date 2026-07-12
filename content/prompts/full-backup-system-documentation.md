---
title: "Full Backup System Documentation"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO CLAUDE PRO]

Create a backup system documentation file at /docs/backup-system.md for Pipeline CRM.

Document the complete 3-2-1 backup strategy:

COPY 1 — GITHUB (Code Only)
- What is backed up: all code, docs, skill files, commit history
- How it updates: automatically every time I push code
- Recovery steps: git clone [repo URL] on any new machine

COPY 2 — ONEDRIVE / GOOGLE DRIVE (Code + Database Exports)
- What is backed up: full project zip + weekly Supabase database export
- How it updates: automated script runs every Sunday at 8am
- Recovery steps: download zip, extract, run npm install, add .env.local keys

COPY 3 — LOCAL MACHINE (Working Copy)
- What is backed up: the live working version of the project
- Recovery steps: this IS the recovery source — push to GitHub from here

SUPABASE DATABASE BACKUP (Separate Track)
- What is backed up: all database tables
- How it updates: automated GitHub Action every Sunday at midnight
- Recovery steps: download JSON files, re-import to Supabase via dashboard

KEY ROTATION SCHEDULE
- Stripe keys: rotate every 90 days
- Supabase service role key: rotate every 6 months
- NextAuth secret: rotate every 6 months

EMERGENCY CHECKLIST:
1. Is the code still on GitHub? → git clone to new machine
2. Is the database intact in Supabase? → check Supabase dashboard
3. Are the backups current in OneDrive? → check last Sunday's zip
4. Are the .env.local keys documented securely? → retrieve from secure location

Save as /docs/backup-system.md and upload to NotebookLM.
