import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidSlug,
  isValidKind,
  listContent,
  getItem,
  ContentKind,
} from "./content";

test("isValidSlug rejects directory traversal and invalid paths", () => {
  // Safe slugs
  assert.equal(isValidSlug("director-agent-next-move-only"), true);
  assert.equal(isValidSlug("ai-behavior-library/16_STOP_WHEN_DONE"), true);
  assert.equal(isValidSlug("a/b/c/d_e-f"), true);

  // Unsafe or invalid slugs
  assert.equal(isValidSlug("../auth"), false);
  assert.equal(isValidSlug("ai-behavior-library/../secret"), false);
  assert.equal(isValidSlug(".."), false);
  assert.equal(isValidSlug("."), false);
  assert.equal(isValidSlug("/etc/passwd"), false);
  assert.equal(isValidSlug("ai-behavior-library/"), false);
  assert.equal(isValidSlug("ai//behavior"), false);
  assert.equal(isValidSlug("c:\\windows\\system32"), false);
  assert.equal(isValidSlug("null\0byte"), false);
  assert.equal(isValidSlug(""), false);
});

test("isValidKind validates content kinds strictly", () => {
  assert.equal(isValidKind("prompts"), true);
  assert.equal(isValidKind("research"), true);
  assert.equal(isValidKind("decisions"), true);
  assert.equal(isValidKind("checklists"), true);
  assert.equal(isValidKind("readiness"), true);

  assert.equal(isValidKind("auth"), false);
  assert.equal(isValidKind("users"), false);
  assert.equal(isValidKind(""), false);
});

test("getItem rejects unsafe slug before making network calls", async () => {
  await assert.rejects(
    async () => {
      await getItem("prompts", "../auth");
    },
    {
      name: "Error",
      message: 'Invalid or unsafe slug: "../auth"',
    },
  );
});

test("getItem rejects invalid content kind", async () => {
  await assert.rejects(
    async () => {
      await getItem("invalid_kind" as ContentKind, "some-slug");
    },
    {
      name: "Error",
      message: 'Invalid content kind: "invalid_kind"',
    },
  );
});

test("listContent and getItem discover nested and direct files, handle errors, empty dirs, and duplicates", async (t) => {
  let mockGetContent: (params: {
    owner: string;
    repo: string;
    path: string;
    ref: string;
  }) => Promise<any>;

  const fakeOctokit = {
    repos: {
      getContent: (params: any) => mockGetContent(params),
    },
  } as any;

  await t.test(
    "listContent discovers direct and nested items (e.g. Stop When Done example)",
    async () => {
      mockGetContent = async ({ path }) => {
        if (path === "content/prompts") {
          return {
            data: [
              {
                name: "director-agent-next-move-only.md",
                path: "content/prompts/director-agent-next-move-only.md",
                type: "file",
              },
              {
                name: "ai-behavior-library",
                path: "content/prompts/ai-behavior-library",
                type: "dir",
              },
            ],
          };
        }
        if (path === "content/prompts/ai-behavior-library") {
          return {
            data: [
              {
                name: "16_STOP_WHEN_DONE.md",
                path: "content/prompts/ai-behavior-library/16_STOP_WHEN_DONE.md",
                type: "file",
              },
            ],
          };
        }
        if (path === "content/prompts/director-agent-next-move-only.md") {
          const raw = "---\ntitle: Director Agent\n---\nDirect content body";
          return {
            data: {
              type: "file",
              content: Buffer.from(raw).toString("base64"),
            },
          };
        }
        if (
          path === "content/prompts/ai-behavior-library/16_STOP_WHEN_DONE.md"
        ) {
          const raw =
            "---\ntitle: Stop When Done\n---\nNested Stop When Done body";
          return {
            data: {
              type: "file",
              content: Buffer.from(raw).toString("base64"),
            },
          };
        }
        const err = new Error("Not Found") as any;
        err.status = 404;
        throw err;
      };

      const items = await listContent("prompts", fakeOctokit);

      assert.equal(items.length, 2);

      const direct = items.find(
        (i) => i.slug === "director-agent-next-move-only",
      );
      assert.ok(direct);
      assert.equal(direct.data.title, "Director Agent");
      assert.equal(direct.body, "Direct content body");

      const nested = items.find(
        (i) => i.slug === "ai-behavior-library/16_STOP_WHEN_DONE",
      );
      assert.ok(nested);
      assert.equal(nested.data.title, "Stop When Done");
      assert.equal(nested.body, "Nested Stop When Done body");

      // Verify getItem directly on nested prompt
      const singleNested = await getItem(
        "prompts",
        "ai-behavior-library/16_STOP_WHEN_DONE",
        fakeOctokit,
      );
      assert.ok(singleNested);
      assert.equal(singleNested.data.title, "Stop When Done");
      assert.equal(
        singleNested.path,
        "content/prompts/ai-behavior-library/16_STOP_WHEN_DONE.md",
      );
    },
  );

  await t.test("listContent handles empty folder gracefully (404)", async () => {
    mockGetContent = async () => {
      const err = new Error("Not Found") as any;
      err.status = 404;
      throw err;
    };

    const items = await listContent("checklists", fakeOctokit);
    assert.deepEqual(items, []);
  });

  await t.test(
    "listContent fails visibly on real non-404 API errors",
    async () => {
      mockGetContent = async () => {
        const err = new Error("Internal Server Error") as any;
        err.status = 500;
        throw err;
      };

      await assert.rejects(
        async () => {
          await listContent("prompts", fakeOctokit);
        },
        {
          name: "Error",
          message: "Internal Server Error",
        },
      );
    },
  );

  await t.test("listContent deduplicates duplicate slugs", async () => {
    let callCount = 0;
    mockGetContent = async ({ path }) => {
      if (path === "content/prompts") {
        return {
          data: [
            {
              name: "dup.md",
              path: "content/prompts/dup.md",
              type: "file",
            },
            {
              name: "subfolder",
              path: "content/prompts/subfolder",
              type: "dir",
            },
          ],
        };
      }
      if (path === "content/prompts/subfolder") {
        return {
          data: [
            // Duplicate entry that yields same relative slug
            {
              name: "dup.md",
              path: "content/prompts/dup.md",
              type: "file",
            },
          ],
        };
      }
      if (path === "content/prompts/dup.md") {
        callCount++;
        const raw = "---\ntitle: Duplicate\n---\nDup body";
        return {
          data: {
            type: "file",
            content: Buffer.from(raw).toString("base64"),
          },
        };
      }
      const err = new Error("Not Found") as any;
      err.status = 404;
      throw err;
    };

    const items = await listContent("prompts", fakeOctokit);
    assert.equal(items.length, 1);
    assert.equal(items[0].slug, "dup");
    assert.equal(callCount, 1);
  });
});
