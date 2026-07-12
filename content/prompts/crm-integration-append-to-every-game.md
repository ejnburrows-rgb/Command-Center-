---
title: "CRM integration (append to every game)"
category: Operating
project: cartilla
tags: ["build", "rule"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla — 8-Game Remaster Pack"
created: 2026-07-12
updated: 2026-07-12
---
=== CRM INTEGRATION (applies to every game) ===
- ROUTES: mount each game at /cartilla/student/juego/$gameId. Student lane only.
- PROGRESS: each completion writes to existing progress store (offline-safe fallback).
- TEACHER ASSIGNMENT: games are assignable like lessons.
- LANE LOCKS: touch Reader.tsx, src/routes/_authenticated/**, supabase/** only with explicit EJN approval.
- DEPLOY: commit + push to main (Vercel auto-deploys).
=== END CRM INTEGRATION ===
