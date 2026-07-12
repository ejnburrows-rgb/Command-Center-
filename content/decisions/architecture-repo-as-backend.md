---
title: "Architecture: the GitHub repo is the only backend (no database)"
date: 2026-07-12
status: active
context: "Single user, a handful of requests a day. A live read is simpler than a live read PLUS a database that mirrors it."
tags: [architecture, command-center]
---

## Decision
No database. No Supabase, Postgres, or external data service. The GitHub repo is
the only backend for the Command Center.

- **Dev status** (issues/PRs) — read live from the GitHub API on every page load.
- **Portal content** (prompts, research, decisions, checklists, readiness) — stored
  as Markdown files in this repo, also read live via the API.
- **Adding content** — a form commits a new file via Octokit; the next page load
  reflects it because nothing is cached or pre-built.
- No webhook receiver, no sync worker, no reconciliation job.

## Why
One user, tiny traffic, GitHub rate limits are nowhere near a concern. A mirror
database would add moving parts with no benefit at this scale.

## Consequences
- Writes never touch the CRM repos: a read-only token covers them, a separate
  write token covers only this repo.
- "Live" depends on GitHub API availability; acceptable for a personal tool.
