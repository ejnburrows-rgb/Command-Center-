---
title: "Automated OneDrive Backup (Windows + Copilot Pro)"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Secrets, Code Protection & Backups"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY OR GEMINI PRO]

I am on Windows. I have OneDrive through my Microsoft 365 / Copilot Pro subscription.
I want my entire Pipeline CRM project folder automatically backed up to OneDrive.

Walk me through these steps using Windows GUI only:

OPTION A — SIMPLE FOLDER SYNC:
1. How do I move my project folder inside the OneDrive folder so it syncs automatically
2. What is the risk of having a live code project inside OneDrive
3. How do I exclude node_modules from syncing using OneDrive's selective sync settings

OPTION B — SCHEDULED ZIP BACKUP:
1. Create a PowerShell script at C:\Scripts\backup-pipeline-crm.ps1 that:
   - Creates a zip of the entire project folder (excluding node_modules and .git)
   - Names it: pipeline-crm-[YYYY-MM-DD].zip
   - Saves it to: [My OneDrive Folder]\Backups\pipeline-crm\
   - Deletes any backup older than 30 days
   - Prints a confirmation message with file size when done
2. Tell me exactly how to schedule this script every Sunday at 8am using Windows Task Scheduler — GUI steps only

Give me both options and tell me which one you recommend and why.
