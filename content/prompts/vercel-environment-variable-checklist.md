---
title: "Vercel Environment Variable Checklist"
category: Template
project: global
tags: ["deploy", "template"]
source: "Operator Hub Build Console"
stageGroup: "Pre-Flight & Ship"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE INTO ANTIGRAVITY OR CLAUDE PRO — BEFORE EVERY VERCEL DEPLOY]

Generate the complete Vercel environment variable setup checklist for Pipeline CRM.

For each variable in .env.example, tell me:
1. The exact variable name to type in Vercel
2. Where to find the value
3. Which Vercel environment it applies to: Production / Preview / Development / All
4. Whether it needs NEXT_PUBLIC_ prefix (public) or no prefix (private, server-only)

Format as a numbered checklist I can follow in the Vercel dashboard.
Include the exact Vercel path: vercel.com → Project → Settings → Environment Variables

Warning at the bottom:
⚠️ STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY must be set to Production ONLY. Never set them to Preview or Development — those environments use test keys only.
