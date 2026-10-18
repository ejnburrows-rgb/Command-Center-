# NBO Operations Hub

**NBO — Novo Business Order** · Project operations and evidence dashboard.

**Production:** https://nbo-operations-hub.vercel.app  
**Source:** [Command-Center-](https://github.com/ejnburrows-rgb/Command-Center-) (private GitHub repository)  
**Upgrade under review:** [Draft PR #8](https://github.com/ejnburrows-rgb/Command-Center-/pull/8). **Do not merge or deploy this PR without owner approval.**

This repository powers NBO's internal-facing project overview. The site is accessible without a sign-in, so **only information that is already public in GitHub may be displayed**. The Hub reads GitHub; it does not execute agents, approve work, merge PRs, modify repositories, or provide GitHub write access.

## The dashboard

| Section | Function |
| --- | --- |
| **Hub** | Project summary, real GitHub open-item counts, shortcuts, and project best practices. The proposed upgrade adds a **Needs your YES** strip and a compact **Live work lanes** view. |
| **Projects** | Public repositories, searchable cards, direct GitHub links, and dedicated project workspaces. |
| **Project workspace** | Overview; Work & Evidence; System Map; Resources. A conceptual diagram is not evidence of a deployed feature. |
| **Lanes** *(draft PR #8)* | Visual Cartilla work lanes derived from public `swarm/lesson-*` branches, issues, and PRs; status, activity time, summary, proof link, and direct PR navigation. |
| **Best Practices** | Before / During / After checklists and reusable prompts. |
| **Prompts** | Search, copy, add, and delete personal reusable instructions. |
| **Tools** | Shortcuts to useful external services (a link is not an integration). |
| **Assets** | Project source links, plus personal documents and backup / restore. |
| **Settings** | Theme, refresh, and browser-local preferences. |

### Draft upgrade: owner approvals and proof

- **Needs your YES** lists only open PRs with an explicit GitHub owner-decision signal. Absence from the strip does **not** prove that nobody needs your approval. An accurately empty result says **“Nothing waiting on you.”**
- **Live lanes** derives records from GitHub. Status labels mean: `Draft` (draft PR), `Open` (open PR, issue, or unmatched lesson branch), `Merged` (merged PR), and `Blocked` (explicit blocked signal). These are **GitHub record states**, not assertions that an AI agent is actively running or the app has shipped.
- A **Proof · VERIFIED** badge verifies the **source record or status has a GitHub link**; it does not independently certify that the linked implementation works. `UNVERIFIED` means the UI could not establish its source status.
- GitHub polling is about every **2 minutes** for the existing project overview and about every **4 minutes** for new lanes while the page is open; cache and unauthenticated GitHub rate limits may delay updates. The lane feed reports partial results or errors.
- New color choices: **Light** (soft gray / white cards) and **Dark** (black / silver), plus optional Purple and Teal. A logo placed at `public/brand/nbo-logo.svg` or `public/brand/nbo-logo.png` takes precedence over the verified NBO project-logo fallback. Don't upload a font file as branding.

## Saving and recovery

**Important: the NBO Hub is not cloud file storage.** It has no cross-device account synchronization.

| Item | Stored where | Recovery |
| --- | --- | --- |
| GitHub project information | Original public GitHub repositories; read-only | Open the linked issue, PR, branch or repo |
| Custom prompts and checklists | Your browser's local storage | Export / import the NBO backup |
| Uploaded personal documents | Your browser's IndexedDB on that device | Export / import the NBO backup |
| Chosen theme and refresh preference | That browser | Export / import the NBO backup |

To save a document, use **Assets → My documents → Choose file → Save document**. To recover, use **Export complete backup** and **Import backup**. Save backups outside the browser (for example, in a folder you control), since clearing site data, changing browser or losing the device can erase local information. File saving has a 10 MB per-document limit. Browser download support and device storage availability can vary: verify your exported file before relying on it.

No GitHub token or API key is required to **view public GitHub status**. Private GitHub repositories will not appear in the password-free public Hub. Server-side GitHub write operations are intentionally disabled.

## Build and development

- Next.js App Router, TypeScript, React, Tailwind / CSS, deployed on Vercel.
- Core pages and components are in `app/`; public repo configuration is in `lib/repos.ts`.
- Read-only GitHub endpoints: `app/api/hub/route.ts` and, in the draft, `app/api/lanes/route.ts`.
- Personal file storage and recovery: `app/local-docs.ts`, `app/local-backup.ts`, `app/file-vault.tsx`.
- Draft visual modules: `app/lanes-view.tsx`, `app/needs-your-yes.tsx`, `app/proof-tag.tsx`, `app/project-mark.tsx`, `app/brand-mark.tsx`, and `app/hub-v2.css`.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

### Delivery safeguards

1. Inspect the latest `main` and repository instructions before making changes.
2. Do all nontrivial work on a feature branch with a **DRAFT** pull request, keeping production unchanged.
3. Never merge or publish without the owner's permission; never write to the La Cartilla de Gretel repository from the Hub.
4. Test navigation, responsive layout, themes, search, refresh, project links, document recovery, and GitHub errors at **1280px desktop and 390px phone widths**.
5. Report **VERIFIED** only with exact evidence links and screenshots; otherwise **UNVERIFIED**.
6. Do not add paid services, secrets, private GitHub data, or unnecessary dashboards.

## Related repositories

- [La Cartilla de Gretel](https://github.com/ejnburrows-rgb/cartilla-de-gretel) — classroom product source; **do not modify as part of Hub work**.
- [NBO public website](https://github.com/ejnburrows-rgb/client-project-starter) — separate website and branding source.
- [LANY Books storefront](https://github.com/ejnburrows-rgb/lany-books-web) — separate Cartilla sales/information site; keep separate.
- [OTTO CRM](https://github.com/ejnburrows-rgb/otto) and [Tucker Pool CRM](https://github.com/ejnburrows-rgb/tucker-pool-crm) — independent NBO/client applications.
- [Repository inventory and cleanup review](docs/REPOSITORY-INVENTORY.md) — identifies what to preserve and what needs an owner decision before archiving or deletion.

**Legacy note:** Older sections of the codebase and past documentation reference a passphrase, GitHub write tokens, or GitHub-backed Markdown edits. Those references describe an earlier architecture; the current public Hub does **not** use those flows to save personal files or modify repositories. Do not re-enable them without a new security review.
