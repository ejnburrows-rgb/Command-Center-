---
title: "Phase 2 — Set Your Rules File (CLAUDE.md)"
category: Operating
project: global
tags: ["setup", "guide"]
source: "Operator Hub Build Console"
stageGroup: "Project Rules File (CLAUDE.md)"
created: 2026-07-12
updated: 2026-07-12
---
[PASTE THIS INTO ANTIGRAVITY — SAVE AS CLAUDE.md IN YOUR PROJECT ROOT]

# Project Rules — Pipeline CRM

## What This Project Is
A B2B CRM for small sales teams (3–20 reps).
Stack: Next.js 15 (App Router) + Tailwind CSS + TypeScript + Supabase + Stripe + Vercel.
Builder: Non-technical solo operator using AI agents.

## Hard Rules — Never Break These
- Never write code before a spec exists in /docs/feature-specs/
- Never modify the database schema without showing SQL first and waiting for human approval
- Never hard-code any API keys, passwords, or secret tokens in any file
- Never deploy to Vercel without running npm run build and npm run lint first with zero errors
- Never skip loading states or error states on any page that fetches data
- Never process payments directly — always use Stripe Checkout redirect

## Code Style
- TypeScript strict mode — no "any" types ever
- Tailwind CSS only — no inline styles, no separate CSS files
- All async functions must have try/catch error handling
- All API routes must verify the user is logged in before doing anything
- Mobile-first responsive design on every component

## Tool Routing
- Gemini: specs and planning only
- Claude Code / Antigravity: all coding tasks
- Qwen Code: boilerplate only
- Grok: second-opinion code review after Claude builds
- Perplexity: research before starting any new feature

## File Structure
/app          → pages and UI components
/app/api      → all backend routes
/skills       → saved AI instruction files
/docs/feature-specs → one spec file per feature
CLAUDE.md     → this file

## Forbidden Patterns
- No class components
- No inline event handlers that belong in a separate function
- No console.log left in production code
- No magic numbers — use named constants

## When Something Breaks
Stop. Do not click around. Paste the error using the Red Screen Protocol.
