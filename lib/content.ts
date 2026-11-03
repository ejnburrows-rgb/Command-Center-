import matter from "gray-matter";
import { Octokit } from "@octokit/rest";
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

const ALLOWED_KINDS = new Set<string>([
  "prompts",
  "research",
  "decisions",
  "checklists",
  "readiness",
]);

export function isValidKind(kind: string): kind is ContentKind {
  return ALLOWED_KINDS.has(kind);
}

export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  if (slug.includes("\\") || slug.includes("\0")) return false;

  const parts = slug.split("/");
  for (const part of parts) {
    if (part === "" || part === "." || part === "..") return false;
  }
  return true;
}

function client(clientOverride?: Octokit): Octokit {
  if (clientOverride) return clientOverride;
  // Reading the content repo needs a token that can see it. The read token has
  // it granted read-only; fall back to the write token if only that is set.
  if (process.env.GITHUB_TOKEN_READ) return readClient();
  // Lazy import to avoid a hard dependency when only the read token exists.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { writeClient } = require("./github");
  return writeClient();
}

async function collectMarkdownSlugs(
  gh: Octokit,
  kind: ContentKind,
  dirPath: string,
  basePath: string,
): Promise<string[]> {
  let entries;
  try {
    const res = await gh.repos.getContent({
      owner: CONTENT_REPO.owner,
      repo: CONTENT_REPO.repo,
      path: dirPath,
      ref: CONTENT_BRANCH,
    });
    entries = res.data;
  } catch (err: unknown) {
    if (isNotFound(err)) return [];
    throw err;
  }

  if (!Array.isArray(entries)) return [];

  const slugs: string[] = [];

  for (const entry of entries) {
    if (entry.type === "file" && entry.name.endsWith(".md")) {
      const relativePath = entry.path.startsWith(basePath + "/")
        ? entry.path.slice(basePath.length + 1)
        : entry.name;
      const slug = relativePath.replace(/\.md$/, "");
      if (isValidSlug(slug)) {
        slugs.push(slug);
      }
    } else if (entry.type === "dir") {
      const nestedSlugs = await collectMarkdownSlugs(
        gh,
        kind,
        entry.path,
        basePath,
      );
      slugs.push(...nestedSlugs);
    }
  }

  return slugs;
}

export async function listContent(
  kind: ContentKind,
  clientOverride?: Octokit,
): Promise<ContentItem[]> {
  if (!isValidKind(kind)) {
    throw new Error(`Invalid content kind: "${kind}"`);
  }

  const gh = client(clientOverride);
  const basePath = `content/${kind}`;
  const rawSlugs = await collectMarkdownSlugs(gh, kind, basePath, basePath);

  const uniqueSlugs = Array.from(new Set(rawSlugs));

  const items = await Promise.all(
    uniqueSlugs.map((slug) => getItem(kind, slug, clientOverride)),
  );
  return items.filter((i): i is ContentItem => i !== null);
}

export async function getItem(
  kind: ContentKind,
  slug: string,
  clientOverride?: Octokit,
): Promise<ContentItem | null> {
  if (!isValidKind(kind)) {
    throw new Error(`Invalid content kind: "${kind}"`);
  }
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid or unsafe slug: "${slug}"`);
  }

  const gh = client(clientOverride);
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
