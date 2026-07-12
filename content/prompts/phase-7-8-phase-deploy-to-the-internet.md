---
title: "Phase 7 (8-Phase) — Deploy to the Internet"
category: Build/Execution
project: global
tags: ["deploy", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Pre-Flight & Ship"
created: 2026-07-12
updated: 2026-07-12
---
We are deploying Pipeline CRM to Vercel. Run this pre-flight checklist:

1. npm run build — fix every error. Zero tolerance.
2. npm run lint — fix every warning.
3. Confirm no Supabase or Stripe secret keys in /app folder.
4. Confirm every page that loads data shows a loading indicator.
5. Confirm every page shows a clear error message if fetch fails.
6. Confirm the app works on mobile (375px wide).

After all 6 pass:
7. Push to main branch on GitHub.
8. Connect GitHub repo to Vercel.
9. Add all .env.local keys to Vercel's Environment Variables dashboard.
10. Visit live URL and confirm login, contact creation, and Stripe test checkout work.

Report the live URL when complete.
