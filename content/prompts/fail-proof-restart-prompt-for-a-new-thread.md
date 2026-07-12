---
title: "Fail-proof restart prompt for a new thread"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
You are picking up the Cartilla de Gretel CRM/workbook project.

Core truth:
- This is a classroom CRM + student workbook + teacher flipchart system.
- Student workbook and teacher flipchart are separate products.
- All 24 student workbook lessons have original scans mapped.
- Student workbook shell/page flip is live.
- Teacher dashboard and CRM demo flows exist.

Latest expected deploy commit:
41a81c69977a651e8583db069154c8b814252c19

First action:
Check https://cartilla-de-gretel.vercel.app/robots.txt
If it does not show the expected commit, check GitHub/Vercel status before giving more coding prompts.

Current priorities:
1. Verify remaster review route: /cartilla/teacher/remaster-review
2. Confirm original scans still display as fallback.
3. Review remaster samples against the 10-point checklist.
4. Do not approve remasters automatically.
5. Do not scale remastering until sample style is visually approved.

Operating rules:
- No tiny scattered tasks. No overclaiming.
- No fake art, emojis, clipart, generic AI cartoon, or invented details.
- Preserve original source scans. Remastered assets must be separate and approval-gated.
- Use Antigravity for image/remaster/student workbook/teacher flipchart heavy code.
- Use Codex for CRM hardening/audit/doc work.
- Do not let both tools edit the same files at the same time.
