# Command Center

The existing NBO project hub, now with a separate private agent studio at `/` and the public GitHub overview at `/overview`. **GitHub supplies project evidence**; there is no new database. Repository code and the public read routes define current behavior. Follow `AGENTS.md` for execution and approval rules.

- **Dev status** comes from public GitHub API snapshots. Source timestamps and stale/error indicators matter; a browser refresh does not guarantee a new GitHub fetch.
- **Portal content** (prompts, research, decisions, checklists, readiness) lives
  as Markdown files in this repo under `content/`, also read live via the API.
- **Adding content** commits a new file to this repo — the next page load shows
  it, with no redeploy.

## Stack

Next.js (App Router) + TypeScript + Tailwind + Octokit. Deploys on Vercel Hobby
(free). No Supabase, no ORM, no external database.

## Public access and private data

Current `proxy.ts` protects `/`, `/studio`, and `/api/studio/*` with the existing owner passphrase. `/login` and `/api/auth` are enabled for sign-in. The old overview remains public at `/overview`; `/crm-core` stays blocked. Public evidence requests in `lib/public-github.ts` do not use authenticated content tokens. Do not treat the historical passphrase helper as an active access gate or put private owner material in this public repository/client bundle.

Studio conversation drafts are stored on the current browser only; there is no cross-device chat storage. Only server-configured API providers can respond; links to consumer web accounts are not connections. Provider calls require an explicit usage/charge acknowledgment in the composer. Never put account secrets into browser storage or the repository.

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

## Owner agent studio integrations

The private Agent Studio opens at `/`, while the public GitHub overview remains at `/overview`. The studio only calls providers whose credentials have been configured on the Vercel server. No API keys are stored in the browser.

- `ZAI_API_KEY`: optional model chat through the official Z.ai general API using the GLM-5.3-Flash model. Coding Plan subscriptions are **not** automatically interchangeable with the general API.
- `ZAI_CODING_PLAN_KEY`: optional **coding-only** model requests through `https://api.z.ai/api/coding/paas/v4`; do not use this for general conversations. Separate from the general Z.ai API key.
- `OPENAI_API_KEY`: optional paid OpenAI API chat; separate from a ChatGPT subscription.
- `GEMINI_API_KEY`: optional Google Gemini API chat; separate from a web login.
- `ZENZAP_API_KEY` and `ZENZAP_API_SECRET`: optional static bot credentials for browsing real Zenzap channels and sending messages. Both are required.
- Alternatively, `ZENZAP_CLIENT_ID` and `ZENZAP_CLIENT_SECRET`: OAuth bot client credentials. Use the scopes `channel:list`, `message:read`, and `message:send`.

Zenzap bot access is limited to channels the bot belongs to; browser account login is not the same as bot API authorization. Zenzap messages persist in Zenzap. Model conversations currently persist **only in this browser**. Users can download and import a JSON history backup for another device; this is not automatic cross-device syncing. No coding-agent execution runtime is included. No API provider will be shown as connected solely because a web subscription exists.
