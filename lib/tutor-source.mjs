const API = "https://api.github.com/repos/ejnburrows-rgb/cartilla-de-gretel/pulls/1073";
const RAW = "https://raw.githubusercontent.com/ejnburrows-rgb/cartilla-de-gretel";

/** @typedef {{ freshness: "FRESH" | "UNAVAILABLE", lifecycle: "DRAFT" | "OPEN" | "MERGED" | "CLOSED" | "UNKNOWN", headSha: string | null, headRef: string | null, sourceUpdatedAt: string | null, observedAt: string | null, prUrl: string, base: string, error: string | null }} TutorSource */

/** @param {Record<string, any>} pr @param {string} observedAt @returns {TutorSource} */
export function tutorSourceFromPullRequest(pr, observedAt) {
  const sha = typeof pr?.head?.sha === "string" && /^[a-f0-9]{40}$/i.test(pr.head.sha) ? pr.head.sha : null;
  if (pr?.number !== 1073 || !sha) return unavailableTutorSource("Tutor PR #1073 did not provide a verified current head.");
  const lifecycle = pr.merged_at ? "MERGED" : pr.state === "open" ? (pr.draft ? "DRAFT" : "OPEN") : pr.state === "closed" ? "CLOSED" : "UNKNOWN";
  return {
    freshness: "FRESH",
    lifecycle,
    headSha: sha,
    headRef: typeof pr.head?.ref === "string" ? pr.head.ref : null,
    sourceUpdatedAt: typeof pr.updated_at === "string" ? pr.updated_at : null,
    observedAt,
    prUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073",
    // This is the PR head snapshot, never the production main source.
    base: `${RAW}/${sha}/`,
    error: null,
  };
}

/** @param {string} [reason] @returns {TutorSource} */
export function unavailableTutorSource(reason = "Tutor PR #1073 could not be refreshed.") {
  return {
    freshness: "UNAVAILABLE",
    lifecycle: "UNKNOWN",
    headSha: null,
    headRef: null,
    sourceUpdatedAt: null,
    observedAt: null,
    prUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073",
    base: "",
    error: reason,
  };
}

/** @param {typeof fetch} fetcher @param {Record<string, string>} headers @returns {Promise<TutorSource>} */
export async function fetchTutorSource(fetcher = fetch, headers = {}) {
  try {
    const response = await fetcher(API, { headers, cache: "no-store" });
    if (!response.ok) return unavailableTutorSource(`Tutor PR #1073 refresh failed (${response.status}).`);
    const pr = await response.json();
    return tutorSourceFromPullRequest(pr, new Date().toISOString());
  } catch {
    return unavailableTutorSource("Tutor PR #1073 could not be refreshed.");
  }
}
