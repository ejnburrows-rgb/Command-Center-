# NBO Repository Inventory — Owner Cleanup Review

**Audit date:** 2026-10-17  
**Scope:** 16 GitHub repositories visible in `ejnburrows-rgb`.  
**Status:** Review only. **No repositories have been archived, renamed, merged, or deleted.**

## Preserve — current products, infrastructure, or source of truth

| Repository | What the current README says it contains | Recommendation |
| --- | --- | --- |
| [Command-Center-](https://github.com/ejnburrows-rgb/Command-Center-) | Source of the **NBO Operations Hub** at `nbo-operations-hub.vercel.app`. | **KEEP**. Do not rename or delete while deployment and links depend on it. |
| [cartilla-de-gretel](https://github.com/ejnburrows-rgb/cartilla-de-gretel) | Teaching product, student/teacher application, classroom assets, PRs/issues and lessons. | **KEEP**. Separate source; never touch during Hub work. |
| [client-project-starter](https://github.com/ejnburrows-rgb/client-project-starter) | The separate public **NBO business website**, not the Hub. | **KEEP**. Not a duplicate of the Hub. |
| [lany-books-web](https://github.com/ejnburrows-rgb/lany-books-web) | The LANY Books storefront for La Cartilla de Gretel. | **KEEP** pending owner's storefront decision. |
| [otto](https://github.com/ejnburrows-rgb/otto) | OTTO Plumbing CRM, NBO's reusable operations archetype. | **KEEP**. Distinct CRM product. |
| [otto-plumbing-site](https://github.com/ejnburrows-rgb/otto-plumbing-site) | OTTO Plumbing public website. | **KEEP**. Different from CRM. |
| [tucker-pool-crm](https://github.com/ejnburrows-rgb/tucker-pool-crm) | Bilingual pool service CRM. | **KEEP** unless the client/project has ended. |
| [db-backups](https://github.com/ejnburrows-rgb/db-backups) | Private encrypted-backup workflow configuration and backup materials. README warns the workflow is not verified as active. | **PROTECT**. Do not delete without reviewing retention and recovery requirements. |

## Review — potentially independent client/demo work

These are **not demonstrated to be abandoned**. A repository name or README cannot establish whether an active client, domain, contract, or deployment still depends on it.

| Repository | What it is | Suggested decision |
| --- | --- | --- |
| [dev-firm-compass](https://github.com/ejnburrows-rgb/dev-firm-compass) | Older firm operations dashboard / playbook / prompts. | **Review for consolidation** with NBO Hub. Keep its unique operating documents until migrated; archive only if replaced and approved. |
| [agency-agents](https://github.com/ejnburrows-rgb/agency-agents) | AI specialist / agent library resembling upstream `msitarzewski/agency-agents`. | **Review for archive** if no custom local changes, automation, or references depend on this copy. |
| [Remax](https://github.com/ejnburrows-rgb/Remax) | RE/MAX QR business-card landing page. | **Owner review**; check project delivery and active QR/domain first. |
| [PeteStore](https://github.com/ejnburrows-rgb/PeteStore) | Peterbilt sales, catalog and lead-generation prototype. | **Owner review**; check clients/leads/domain before archival. |
| [Onesixthgiants-](https://github.com/ejnburrows-rgb/Onesixthgiants-) | Collectible-figure showcase and demo. | **Owner review**; check future value and active clients. |
| [Locks](https://github.com/ejnburrows-rgb/Locks) | South Florida locksmith pre-production website. | **Owner review**; do not delete if pending a real client or launch. |
| [VD-](https://github.com/ejnburrows-rgb/VD-) | Viajera Digital, cultural preservation / décima research platform. | **Owner review**; independent product, not a Hub duplicate. |
| [dbarrera-y-mas](https://github.com/ejnburrows-rgb/dbarrera-y-mas) | Spanish-language business services website. | **Owner review**; check client/production usage. |

## Safe cleanup order

1. **Decide specifically which named repositories are no longer needed.** Prefer archiving (reversible) over permanent deletion.
2. Check open PRs, branches, releases, GitHub Pages, connected hosting, active URLs and external references **for each selected repo**.
3. Save a repository export or clone and any necessary secret-free customer deliverables elsewhere. A backup should be proven retrievable before deleting the original.
4. Confirm the **exact full repository names** and whether the action is **Archive** or **Delete permanently**.
5. Perform approved changes one repository at a time; verify GitHub state afterwards and report proof links. Do not touch active client systems, classroom code, or backup infrastructure.

## Other hosting projects (not GitHub repositories)

The connected Vercel account contains the separate projects `nbo-operations-hub`, `nbo-website`, `cartilla-de-gretel`, `cartilla-controller`, `cartilla-miro-sync`, `cartilla-binary-probe-918`, `cartilla-raw-probe`, `cartilla-recovery-probe`, `otto-ezar`, `otto`, `otto-plumbing-site`, and `lany-books-web`. These are **deployment projects, not additional GitHub repositories**. Temporary-looking probe projects should be investigated separately; do not delete deployment infrastructure as part of GitHub repository cleanup without explicit approval.

**Action needed:** The owner must select exact archive/delete candidates. This document is a decision log, not deletion authorization.
