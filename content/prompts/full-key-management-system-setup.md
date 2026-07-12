---
title: "Full Key Management System Setup"
category: Template
project: global
tags: ["setup", "template"]
source: "Operator Hub Build Console"
stageGroup: "New Project Scaffolding"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY — RUN ONCE AT PROJECT START]

Read CLAUDE.md. Set up the full API key management system for Pipeline CRM.

STEP 1 — CREATE THE PROTECTION FILES
Create .gitignore in the project root if it does not exist.
Add these lines to .gitignore:
.env
.env.local
.env.development
.env.staging
.env.production
.env*.local

STEP 2 — CREATE THE KEY TEMPLATE FILE
Create .env.example in the project root.
Populate it with every key this project needs:
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
# App
NEXT_PUBLIC_APP_URL=

STEP 3 — CREATE THE ACTUAL KEY FILE
Create .env.local — leave all values blank for now.
Confirm this file is blocked from GitHub by .gitignore.

STEP 4 — ADD RUNTIME VALIDATION
Create /lib/env.ts — a file that checks all required keys are present when the app starts.
If any required key is missing, the app should print a clear error message and refuse to start.

STEP 5 — CONFIRM PROTECTION
Search the entire codebase for any string matching: sk_, pk_, eyJ, Bearer, password=, secret=
Report every match with file name and line number.
If any live values found hardcoded — flag as 🔴 CRITICAL immediately.
