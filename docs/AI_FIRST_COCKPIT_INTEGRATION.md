# NBO AI-first cockpit integration

## Source and design

User-provided file: `nbo-operations-hub-—-ai-software-command-center.zip` (Google AI Studio / Vite React design prototype).

**Adapted**: premium dark operations hero, actionable statistics, work queue, decision/evidence rail, knowledge and workflow navigation, phone-friendly stacking.

**Intentionally rejected**: hardcoded `NBO_TASKS` / `NBO_PROJECTS`, simulated API sync delays, fabricated agent names, static metric counters, client Google Gemini API key dependency, and replacing the existing Next.js application.

## Implemented surfaces

- Hub: evidence-backed AI software operations overview, only full-scope GitHub totals when source is complete.
- AI Operations: real GitHub work across configured public repositories and the canonical Cartilla jobs feed.
- Evidence: searchable GitHub work and canonical job proof gaps; no fake verified statuses.
- Knowledge: existing device-local document vault, with authenticated GitHub source links for repository knowledge notes. GitHub-private document content is **not** fetched by the public website.
- Existing GitHub Intelligence, project views, preferences, and current routes remain intact.

## Source and behavior contract

- `/api/hub`: open issues and PRs, partial/stale indicators, per-repo freshness.
- `/api/jobs`: canonical issue-based Cartilla jobs and owner approvals.
- A task status is shown only as reported by its source.
- No inference of AI agent identity or active sessions.
- Any private GitHub notes remain GitHub-authenticated; a future browser editor requires explicit server-side identity and authorization.
- User documents in FileVault remain local to a single device; they do not magically sync between devices.
- An open or draft PR must never be rendered as verified completion.

## Acceptance checklist

- [ ] Production build and type checking pass at **latest** feature branch SHA.
- [ ] /, /projects, /github, /ai-operations, /evidence, /knowledge, /prompts and /settings work on a direct reload and browser back/forward.
- [ ] Empty, stale and unavailable GitHub responses never appear as successful results or fabricated zeros.
- [ ] Filtering/search updates displayed real open work.
- [ ] Owner decisions have actual evidence and cannot merge or deploy from anonymous UI.
- [ ] Evidence links open actual source URLs and missing proof remains visible.
- [ ] Private GitHub knowledge is not returned in public endpoint responses or bundled in the client.
- [ ] Phone width 390px and desktop 1440px have no horizontal overflow and links are touch accessible.
- [ ] Final preview SHA and screenshot evidence are captured before owner requests main push.
- [ ] `main` remains unchanged until owner approval after preview check.

No claim of completing these checklist items is made by this document.
