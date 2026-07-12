# Command Center

A private, single-user developer command center. **The GitHub repo is the only
backend** — no database. Every read asks GitHub live; every "add" is a commit.

- **Dev status** (issues/PRs) is read live from the GitHub API on each page load.
- **Portal content** (prompts, research, decisions, checklists, readiness) lives
  as Markdown files in this repo under `content/`, also read live via the API.
- **Adding content** commits a new file to this repo — the next page load shows
  it, with no redeploy.

## Stack
Next.js (App Router) + TypeScript + Tailwind + Octokit. Deploys on Vercel Hobby
(free). No Supabase, no ORM, no external database.

## Auth
One passphrase (`PORTAL_PASSPHRASE`) checked by `middleware.ts`, which sets an
httpOnly cookie and gates every route. That's the whole auth system.

## Environment variables
See `.env.local.example`. Two GitHub tokens keep writes off the CRM repos at the
credential level:

| Var | What it can touch |
|-----|-------------------|
| `PORTAL_PASSPHRASE` | the login passphrase |
| `GITHUB_TOKEN_READ` | read-only: otto, cartilla-de-gretel, lany-books-web |
| `GITHUB_TOKEN_WRITE` | read+write: command-center only |

## Run locally
```bash
npm install
cp .env.local.example .env.local   # then fill in values
npm run dev                        # http://localhost:3000
```

## Repos it reads
Configured in `lib/repos.ts` (`READ_REPOS`). Add another (e.g. the Psychiatry
site) by appending one line.

## Content shapes
Markdown + YAML front-matter under `content/<kind>/<slug>.md` for `prompts`,
`research`, `decisions`, `checklists`, `readiness`. See existing files for the
exact fields.
