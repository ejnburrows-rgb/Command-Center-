---
title: "Full CRM Feature Build — 4-Step Prompt Chain"
category: Build/Execution
project: global
tags: ["build", "chain"]
source: "Operator Hub Build Console"
stageGroup: "Prompt Chaining (4-Step Feature Build)"
created: 2026-07-12
updated: 2026-07-12
---
CHAIN STEP 1 OF 4 — GEMINI PRO (Research + Spec)

Feature we are building: [FILL IN FEATURE NAME]
Project: Pipeline CRM — Next.js + Supabase + Tailwind + Stripe

Before writing anything, tell me:
1. Does a proven open-source pattern for this feature exist? If yes, name it.
2. What is the most common way this breaks when built with AI agents?
3. What does a production-ready version need that a demo version skips?

Then write a spec with these sections only:
- Goal (2 sentences)
- Who uses it and what they need to accomplish
- Inputs (what the user provides)
- Outputs (what the system saves or shows)
- Rules (what must always be true)
- Edge cases (what could go wrong)
- Out of scope (what this does NOT do)
- Minimum tests (3–5 things that must work)

End with: "SPEC COMPLETE — ready for build"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAIN STEP 2 OF 4 — ANTIGRAVITY + CLAUDE CODE (Build)

Read CLAUDE.md first.
Here is the approved spec from Step 1:
[PASTE GEMINI SPEC OUTPUT HERE]

Build this feature exactly as specified. Nothing outside the spec.

Rules:
- If the spec is unclear, stop and ask — do not guess
- Show me the database SQL before running it and wait for "APPROVED"
- Build in this order: database → API routes → UI
- Run npm run build after each layer — fix errors before next layer
- Report ✅ or ❌ after each layer

End with: "BUILD COMPLETE — ready for review"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAIN STEP 3 OF 4 — GROK HEAVY (Challenge + Find Gaps)

You are a senior code reviewer. Find what is wrong — not what is right.

Here is the spec: [PASTE STEP 1 OUTPUT]
Here is the code: [PASTE STEP 2 CODE OUTPUT]

Review against the spec only. Flag anything that:
- Does not match the spec
- Has a security gap
- Is missing error handling
- Has TypeScript violations
- Breaks on mobile

Output format:
🔴 CRITICAL (blocks deployment): [list]
🟡 IMPORTANT (fix before handoff): [list]
🔵 MINOR (fix in cleanup): [list]
✅ MATCHES SPEC: [list]

End with: "REVIEW COMPLETE — ready for fixes"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAIN STEP 4 OF 4 — ANTIGRAVITY + CLAUDE CODE (Fix + Lock)

Read CLAUDE.md.
Here is the Grok review from Step 3:
[PASTE STEP 3 REVIEW OUTPUT]

Fix every 🔴 CRITICAL item first.
Then fix every 🟡 IMPORTANT item.
Ignore 🔵 MINOR items — log them in /docs/cleanup-log.md.

After fixing:
1. Run npm run build — must pass with zero errors
2. Run npm run lint — must pass with zero warnings
3. Test the 3–5 minimum tests from the original spec
4. Report ✅ or ❌ for each test

Then fire Phrase 5 (Skill Builder):
"Based on this conversation, build a SKILL.md file. Include a Gotchas section."
Save to /skills/[feature-name].md

End with: "CHAIN COMPLETE — feature locked"
