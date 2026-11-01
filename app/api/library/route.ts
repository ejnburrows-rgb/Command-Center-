import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type LibraryFileItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  folder: string;
  project: string;
  tags: string[];
  summary: string;
  body: string;
  sourcePath: string;
  updatedAt: string;
};

function walkMarkdownFiles(dir: string, baseDir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(full, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(path.relative(baseDir, full).replace(/\\/g, "/"));
    }
  }
  return results;
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function classifyItem(relPath: string, title: string, rawCategory?: string, rawProject?: string): { category: string; project: string } {
  const lowerPath = relPath.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const project =
    rawProject && rawProject !== "global"
      ? rawProject
      : lowerTitle.includes("gretel") ||
          lowerTitle.includes("cartilla") ||
          lowerTitle.includes("mariposas") ||
          lowerTitle.includes("payaso") ||
          lowerTitle.includes("fonética") ||
          lowerTitle.includes("fon-tica") ||
          lowerTitle.includes("sílabas") ||
          lowerTitle.includes("rima") ||
          lowerTitle.includes("vocal") ||
          lowerTitle.includes("dibujos") ||
          lowerPath.includes("gretel")
        ? "La Cartilla de Gretel"
        : lowerTitle.includes("crm") || lowerTitle.includes("diaflow") || lowerTitle.includes("supabase")
          ? "CRM & Operations"
          : "All Projects";

  if (lowerPath.includes("ai-behavior-library/")) {
    return { category: "AI Behavior Library (00–16)", project };
  }
  if (lowerPath.startsWith("decisions/") || lowerPath.startsWith("checklists/") || lowerPath.startsWith("research/")) {
    return { category: "Decisions & Checklists", project };
  }
  if (
    project === "La Cartilla de Gretel" ||
    /^[0-8][ab]?[-.]/.test(path.basename(lowerPath)) ||
    lowerPath.includes("big-prompt-") ||
    lowerPath.includes("prompt-0") ||
    lowerPath.includes("prompt-1") ||
    lowerPath.includes("prompt-2") ||
    lowerPath.includes("prompt-3") ||
    lowerPath.includes("prompt-a") ||
    lowerPath.includes("prompt-b") ||
    lowerPath.includes("prompt-c") ||
    lowerPath.includes("kids-slideshow")
  ) {
    return { category: "Cartilla Games & Art", project: "La Cartilla de Gretel" };
  }
  if (
    lowerTitle.includes("kickoff") ||
    lowerTitle.includes("spec") ||
    lowerTitle.includes("interview") ||
    lowerTitle.includes("phase 1") ||
    lowerTitle.includes("phase 2") ||
    lowerTitle.includes("claudemd") ||
    lowerTitle.includes("claude.md") ||
    lowerTitle.includes("onboarding") ||
    lowerTitle.includes("session opener") ||
    lowerTitle.includes("realignment")
  ) {
    return { category: "Start & Plan (Phase A)", project };
  }
  if (
    lowerTitle.includes("review") ||
    lowerTitle.includes("verification") ||
    lowerTitle.includes("backup") ||
    lowerTitle.includes("security") ||
    lowerTitle.includes("secrets") ||
    lowerTitle.includes("deploy") ||
    lowerTitle.includes("protection") ||
    lowerTitle.includes("definition of done") ||
    lowerTitle.includes("qa")
  ) {
    return { category: "Review, Release & Backups (Phase C)", project };
  }
  if (
    lowerTitle.includes("director") ||
    lowerTitle.includes("master prompt") ||
    lowerTitle.includes("context block") ||
    lowerTitle.includes("accountability") ||
    lowerTitle.includes("standing instruction") ||
    rawCategory?.toLowerCase() === "operating"
  ) {
    return { category: "Director & Operating Rules", project };
  }
  return { category: "Build & CRM (Phase B)", project };
}

function extractSummary(body: string, frontMatterContext?: string): string {
  if (frontMatterContext && typeof frontMatterContext === "string" && frontMatterContext.trim()) {
    return frontMatterContext.trim();
  }
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#") && !l.startsWith("```") && !l.startsWith("---"));
  const firstMeaningful = lines[0] || "Reusable NBO instruction from the repository library.";
  return firstMeaningful.length > 180 ? firstMeaningful.slice(0, 177) + "…" : firstMeaningful;
}

export async function GET() {
  try {
    const contentRoot = path.join(process.cwd(), "content");
    const relFiles = walkMarkdownFiles(contentRoot, contentRoot).sort((a, b) => a.localeCompare(b));
    const files: LibraryFileItem[] = relFiles.map((relPath) => {
      const fullPath = path.join(contentRoot, relPath);
      const raw = fs.readFileSync(fullPath, "utf8");
      const parsed = matter(raw);
      const data = parsed.data || {};
      const body = parsed.content.trim();
      const baseSlug = path.basename(relPath, ".md");
      const headingMatch = body.match(/^#\s+(.+)$/m);
      const rawTitle =
        typeof data.title === "string" && data.title.trim()
          ? data.title.trim()
          : headingMatch
            ? headingMatch[1].trim()
            : humanizeSlug(baseSlug);

      const folder = path.dirname(relPath);
      const { category, project } = classifyItem(
        relPath,
        rawTitle,
        typeof data.category === "string" ? data.category : undefined,
        typeof data.project === "string" ? data.project : undefined
      );
      const tags = Array.isArray(data.tags)
        ? data.tags.map((t) => String(t))
        : typeof data.category === "string"
          ? [data.category]
          : [];
      const updatedRaw = data.updated || data.date || data.created;
      const updatedAt =
        updatedRaw instanceof Date
          ? updatedRaw.toISOString().slice(0, 10)
          : typeof updatedRaw === "string"
            ? updatedRaw
            : "Repository canon";

      return {
        id: relPath,
        slug: baseSlug,
        title: rawTitle,
        category,
        folder,
        project,
        tags,
        summary: extractSummary(body, typeof data.context === "string" ? data.context : undefined),
        body,
        sourcePath: `content/${relPath}`,
        updatedAt,
      };
    });

    return NextResponse.json({
      configured: true,
      count: files.length,
      files,
    });
  } catch (err) {
    return NextResponse.json(
      {
        configured: false,
        files: [],
        error: err instanceof Error ? err.message : "Could not load repository content library",
      },
      { status: 200 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Cloud uploads are disabled without user authentication" },
    { status: 405 }
  );
}
