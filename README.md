# Command Center

The existing public NBO project hub. **GitHub supplies project evidence**; there is no new database. Repository code and the public read routes define current behavior. Follow `AGENTS.md` for execution and approval rules.

- **Dev status** comes from public GitHub API snapshots. Source timestamps and stale/error indicators matter; a browser refresh does not guarantee a new GitHub fetch.
- **Portal content** (prompts, research, decisions, checklists, readiness) lives
  as Markdown files in this repo under `content/`, also read live via the API.
- **Adding content** commits a new file to this repo — the next page load shows
  it, with no redeploy.

## Stack

Next.js (App Router) + TypeScript + Tailwind + Octokit. Deploys on Vercel Hobby
(free). No Supabase, no ORM, no external database.

## Public access and private data

Current `proxy.ts` allows the hub without a site password, redirects `/login` to `/`, and blocks the legacy `/crm-core` and `/api/auth` routes. Public evidence requests in `lib/public-github.ts` do not use authenticated content tokens. Do not treat the historical passphrase helper as an active access gate or put private owner material in this public repository/client bundle.

Legacy content clients and environment-variable helpers below are implementation references, not proof that public pages are authenticated. Adding private data requires separately authorized and verified server-side protection.

## Environment variables

See `.env.local.example`. Two GitHub tokens keep writes off the CRM repos at the
credential level:

| Var | What it can touch |
|-----|-------------------|
| `PORTAL_PASSPHRASE` | the login passphrase |
| `GITHUB_TOKEN_READ` | read-only: otto, cartilla-de-gretel, lany-books-web |
| `GITHUB_TOKEN_WRITE` | read+write: command-center only |

### Creating GitHub Tokens

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. **Read token**: Grant read access to `otto`, `cartilla-de-gretel`, `lany-books-web`
   - Permissions: Metadata, Issues, Pull requests, Contents (all Read-only)
3. **Write token**: Grant read+write access to `command-center` only
   - Permissions: Metadata (Read), Contents (Read and write)

## Run locally

```bash
npm install
cp .env.local.example .env.local   # then fill in values
npm run dev                        # http://localhost:3000
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables from `.env.local.example` in Vercel dashboard
4. Deploy

## Repos it reads

Configured in `lib/repos.ts` (`READ_REPOS`). Add another (e.g. the Psychiatry
site) by appending one line.

## Content shapes

Markdown + YAML front-matter under `content/<kind>/<slug>.md` for `prompts`,
`research`, `decisions`, `checklists`, `readiness`. See existing files for the
exact fields.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
/workspace
├── app/              # Next.js App Router pages & layouts
├── content/          # Markdown content (prompts, research, decisions, etc.)
├── lib/              # Core utilities (auth, GitHub API, content parsing)
└── proxy.ts          # Public hub routing; legacy CRM/auth paths blocked
```
