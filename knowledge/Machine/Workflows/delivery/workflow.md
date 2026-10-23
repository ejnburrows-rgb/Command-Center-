# Delivery Verification Workflow

1. Identify the user-visible requirement and prior owner approval.
2. Inspect current main plus relevant open PRs and any active agents to avoid duplicated work.
3. Make one bounded change on a branch. Never include demo fixture metrics as real data.
4. Run type checks, full production build, focused tests, and key neighboring regressions.
5. Validate desktop and mobile; provide screenshots/proof of important visual flows.
6. Confirm final deployed preview matches the exact branch SHA. A successful build alone does not prove the UI works.
7. Separate draft, merged, deployed and independently verified statuses.
8. Report RESULT / PROOF / KNOWN LIMITATIONS / READY TO PUSH; stop before production deployment or merge if not expressly authorized.
9. Add a dated item to `findings.md` **only** when backed by evidence URLs and the tested revision.
