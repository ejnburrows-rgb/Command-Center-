import matter from "gray-matter";
import { readClient } from "./github";
import { CONTENT_REPO, CONTENT_BRANCH } from "./repos";

// Content is read LIVE from the command-center repo via the GitHub Contents API
// on every request (never from the bundled files), so a fresh commit shows up on
// the next page load with no redeploy. We use the read client for this because
// the content repo is granted to it as read-only too (writes go through the
// write client in the content API route).

export type ContentKind =
  | "prompts"
  | "research"
  | "decisions"
  | "checklists"
  | "readiness";

export type ContentItem = {
  slug: string;
  kind: ContentKind;
  path: string;
  data: Record<string, unknown>; // front-matter
  body: string; // markdown body
};

function client() {
  // Reading the content repo needs a token that can see it. The read token has
  // it granted read-only; fall back to the write token if only that is set.
  if (process.env.GITHUB_TOKEN_READ) return readClient();
  // Lazy import to avoid a hard dependency when only the read token exists.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { writeClient } = require("./github");
  return writeClient();
}

export async function listContent(kind: ContentKind): Promise<ContentItem[]> {
  const gh = client();
  let entries;
  try {
    const res = await gh.repos.getContent({
      owner: CONTENT_REPO.owner,
      repo: CONTENT_REPO.repo,
      path: `content/${kind}`,
      ref: CONTENT_BRANCH,
    });
    entries = res.data;
  } catch (err: unknown) {
    // Folder may not exist yet (nothing added). Treat as empty.
    if (isNotFound(err)) return [];
    throw err;
  }

  if (!Array.isArray(entries)) return [];

  const items = await Promise.all(
    entries
      .filter((e) => e.type === "file" && e.name.endsWith(".md"))
      .map((e) => getItem(kind, e.name.replace(/\.md$/, ""))),
  );
  return items.filter((i): i is ContentItem => i !== null);
}

export async function getItem(
  kind: ContentKind,
  slug: string,
): Promise<ContentItem | null> {
  const gh = client();
  const path = `content/${kind}/${slug}.md`;
  try {
    const res = await gh.repos.getContent({
      owner: CONTENT_REPO.owner,
      repo: CONTENT_REPO.repo,
      path,
      ref: CONTENT_BRANCH,
    });
    const file = res.data;
    if (Array.isArray(file) || file.type !== "file" || !("content" in file)) {
      return null;
    }
    const raw = Buffer.from(file.content, "base64").toString("utf8");
    const parsed = matter(raw);
    return { slug, kind, path, data: parsed.data, body: parsed.content };
  } catch (err: unknown) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status?: number }).status === 404
  );
}
