---
title: "Scheduled Tasks — GitHub Actions (daily briefing)"
category: Build/Execution
project: global
tags: ["deploy", "ops"]
source: "Operator Hub Build Console"
stageGroup: "CI/CD & Scheduled Automation"
created: 2026-07-12
updated: 2026-07-12
---
HOW TO SCHEDULE AI TASKS TO RUN ON THEIR OWN AT SET TIMES:

USING GITHUB ACTIONS (free built-in scheduler inside your project save system):

EXAMPLE — DAILY MORNING BRIEFING:

Create .github/workflows/morning-brief.yml:

name: Morning Briefing
on:
  schedule:
    - cron: '0 12 * * *'  # Runs at 12:00 UTC (8am ET) every day
  workflow_dispatch:       # Allows manual trigger

jobs:
  briefing:
    runs-on: ubuntu-latest
    steps:
      - name: Generate briefing
        run: |
          echo "Generating daily briefing..."
          # Your briefing script here
      - name: Send notification
        run: |
          # Send to email/Slack/Discord

EXAMPLE — WEEKLY DATABASE CLEANUP:

Create .github/workflows/weekly-cleanup.yml:

name: Weekly Database Cleanup
on:
  schedule:
    - cron: '0 6 * * 0'  # Runs at 6:00 UTC every Sunday

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run cleanup script
        run: node scripts/cleanup.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

HOW TO SET UP (no terminal required):
1. Go to your GitHub repo
2. Click Actions tab
3. Click "New workflow" → "Set up a workflow yourself"
4. Paste the YAML above
5. Click "Commit changes"
6. The schedule runs automatically from that point
