---
title: "Phase 5 — Add User Logins"
category: Build/Execution
project: global
tags: ["build", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Parallel Sub-Agents"
created: 2026-07-12
updated: 2026-07-12
---
Add Supabase Auth to this project.

Requirements:
1. Login page at /login — email and password only
2. Sign up page at /signup — with email confirmation
3. After login, redirect to /dashboard
4. Not logged in → redirect to /login automatically
5. Create users table: id, email, role (admin/manager/rep), created_at
6. Role rules: admin sees all; manager sees team; rep sees own only
7. Logout button in dashboard header
8. Test with one test user account
