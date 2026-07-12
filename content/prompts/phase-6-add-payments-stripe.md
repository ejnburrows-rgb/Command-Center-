---
title: "Phase 6 — Add Payments (Stripe)"
category: Build/Execution
project: global
tags: ["build", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Payments (Stripe) — Build Phase"
created: 2026-07-12
updated: 2026-07-12
---
Add Stripe subscription billing to this CRM.

STOP before writing any code. Show me this plan first:
1. What Stripe products and prices you will create
2. What database columns you will add
3. How the webhook will work in plain English

Rules — no exceptions:
- Never process credit cards directly — always Stripe Checkout
- Use a Stripe Webhook to verify payment server-side
- Only update subscription_status to "active" AFTER webhook verifies
- Never hard-code Stripe secret keys — store in .env.local only

Build after approval:
1. Pricing page at /pricing — Free ($0), Pro ($29/mo), Enterprise ($99/mo)
2. Stripe Checkout session API at /api/stripe/checkout
3. Stripe Webhook handler at /api/stripe/webhook
4. Billing management page at /billing
5. Feature gating: Free = contacts only. Pro = contacts + deals + tasks. Enterprise = everything.

Test with Stripe test mode cards only.
