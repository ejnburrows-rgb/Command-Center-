# NBO Project Knowledge — AI Operating Rules

This private repository contains owner-authoritative guidance and machine-generated verified findings.

## Source of truth and access

- `Human/`: owned by the project owner. AI may read instructions relevant to a task; never overwrite or rewrite owner-authored notes without specific approval.
- `Machine/`: work instructions, evidence and findings created by AI. Agents may propose changes on a review branch, never silently override Human decisions.
- These Markdown files are **not** a permission system. GitHub repository rights and server-side route authentication determine who can read/write them.
- The NBO Hub's unauthenticated website must not expose private notes. For now, browse the knowledge in GitHub using the owner's GitHub authentication.
- Do not store secrets, passwords, PATs, or personal account identifiers in source-controlled notes.

## Before working

1. Read the repository root `AGENTS.md`.
2. Read relevant Human owner guidance without modifying it.
3. Read relevant `Machine/Workflows/*/workflow.md` and `findings.md`.
4. Inspect live source and related issue/PR before making any claim.
5. Work on an appropriate feature branch, test, and provide owner-readable evidence.
6. Report RESULT, PROOF, KNOWN LIMITATIONS, READY TO PUSH; never infer success.

## After working

Record **only verifiable** lessons in Machine findings with date, source URLs, tested commit, outcome and limitations. Never invent historical findings to fill the interface.
