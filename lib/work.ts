import { readClient } from "./github";
import { READ_REPOS, type RepoRef } from "./repos";

// A unified work item = an open issue or PR from one of the read-repos.
export type WorkItem = {
  id: string;
  repoLabel: string;
  owner: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  isPR: boolean;
  labels: string[];
  updatedAt: string;
  priorityRank: number; // higher = more important
  blocked: boolean;
};

const BLOCK_LABELS = ["blocked", "wontfix", "on-hold", "waiting"];
// Priority label -> rank. Higher wins. Tune freely.
const PRIORITY_RANK: Record<string, number> = {
  p0: 5,
  critical: 5,
  urgent: 5,
  p1: 4,
  high: 4,
  "priority: high": 4,
  p2: 3,
  medium: 2,
  p3: 1,
  low: 1,
};

function rankFor(labels: string[]): number {
  let best = 0;
  for (const raw of labels) {
    const l = raw.toLowerCase().trim();
    if (PRIORITY_RANK[l] !== undefined) best = Math.max(best, PRIORITY_RANK[l]);
  }
  return best;
}

function isBlocked(labels: string[]): boolean {
  return labels.some((l) => BLOCK_LABELS.includes(l.toLowerCase().trim()));
}

async function fetchRepo(ref: RepoRef): Promise<WorkItem[]> {
  const gh = readClient();
  // "issues" endpoint returns PRs too; we keep both and flag PRs.
  const res = await gh.issues.listForRepo({
    owner: ref.owner,
    repo: ref.repo,
    state: "open",
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  return res.data.map((it) => {
    const labels = (it.labels ?? []).map((l) =>
      typeof l === "string" ? l : (l.name ?? ""),
    );
    return {
      id: `${ref.owner}/${ref.repo}#${it.number}`,
      repoLabel: ref.label,
      owner: ref.owner,
      repo: ref.repo,
      number: it.number,
      title: it.title,
      url: it.html_url,
      isPR: Boolean((it as { pull_request?: unknown }).pull_request),
      labels,
      updatedAt: it.updated_at,
      priorityRank: rankFor(labels),
      blocked: isBlocked(labels),
    };
  });
}

// All open issues/PRs across the read-repos. Errors per repo are surfaced so one
// bad repo (e.g. missing token access) doesn't blank the whole screen.
export async function getAllWork(): Promise<{
  items: WorkItem[];
  errors: { repoLabel: string; message: string }[];
}> {
  const results = await Promise.allSettled(READ_REPOS.map(fetchRepo));
  const items: WorkItem[] = [];
  const errors: { repoLabel: string; message: string }[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else
      errors.push({
        repoLabel: READ_REPOS[i].label,
        message: r.reason?.message ?? String(r.reason),
      });
  });
  return { items, errors };
}

// The single highest-priority unblocked item = the Today card.
// Rule: drop blocked items, rank by priority label, then most-recently-updated.
export function pickToday(items: WorkItem[]): WorkItem | null {
  const eligible = items.filter((i) => !i.blocked);
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => {
    if (b.priorityRank !== a.priorityRank) return b.priorityRank - a.priorityRank;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  return eligible[0];
}
