---
title: "Phase 4 — Build the Core CRM Features (3 sub-agents)"
category: Build/Execution
project: global
tags: ["build", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Parallel Sub-Agents"
created: 2026-07-12
updated: 2026-07-12
---
We are building the 3 core modules of Pipeline CRM. Launch 3 sub-agents simultaneously:

[AGENT-ARCHITECT] — Build the Supabase database tables:
contacts: id, full_name, email, phone, company, status, created_at, assigned_to
deals: id, contact_id, title, stage, value, close_date, notes, assigned_to
tasks: id, deal_id, title, due_date, completed, assigned_to
Add Row-Level Security so users only see their own data.
Output SQL for me to review BEFORE running.

[AGENT-DESIGNER] — Build the UI screens:
Contacts list with search and filter
Deal pipeline board with drag-and-drop stages (Lead, Qualified, Proposal, Won, Lost)
Tasks list with checkboxes and due date display
Tailwind CSS — clean, minimal. Phone and desktop.

[AGENT-MESSENGER] — Build the API connections:
API route to fetch all contacts for logged-in user
API route to create, update, and delete a contact
API route to move a deal between stages
API route to mark a task complete
Every route must check user is logged in.

Do not write any code until AGENT-ARCHITECT shows me the SQL and I type "APPROVED".
