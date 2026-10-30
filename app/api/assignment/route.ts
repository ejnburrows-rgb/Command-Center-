import { NextResponse } from "next/server";
import { github, allPages, errorText } from "@/lib/public-github";
import { serverSnapshot } from "@/lib/server-snapshot";
import { deriveJulesAssignment, julesTaskUrl, julesPullRequestNumber, findJulesTaskPR } from "@/lib/jules-assignment.mjs";

export const dynamic = "force-dynamic";
const repo = "/repos/ejnburrows-rgb/Command-Center-";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const result = await serverSnapshot("nbo-jules-assignment-18-v1", 120_000, async () => {
      const [issueResult, timelineResult, commentsResult] = await Promise.all([
        github(`${repo}/issues/18`),
        github(`${repo}/issues/18/timeline?per_page=100`),
        github(`${repo}/issues/18/comments?per_page=100`),
      ]);
      const issue = issueResult.data;
      const timeline = timelineResult.data;
      const comments = commentsResult.data;
      if (!Array.isArray(timeline) || !Array.isArray(comments)) throw new Error("Jules assignment evidence is incomplete");

      const acceptedTask = comments.find((comment: any) => comment?.user?.login === "google-labs-jules[bot]" && julesTaskUrl(String(comment.body || "")));
      const expectedTaskUrl = acceptedTask ? julesTaskUrl(String(acceptedTask.body || "")) : null;
      const candidates = comments
        .filter((comment: any) => comment?.user?.login === "google-labs-jules[bot]")
        .map((comment: any) => ({ number: julesPullRequestNumber(String(comment.body || ""), expectedTaskUrl), comment }))
        .filter((candidate: any) => Number.isInteger(candidate.number));
      let pullRequest: any = null;
      const linked = candidates[candidates.length - 1];
      if (linked?.number) {
        const { data } = await github(`${repo}/pulls/${linked.number}`);
        pullRequest = data;
      } else if (expectedTaskUrl) {
        // Jules normally records the task URL in its issue acknowledgment and the
        // task ID in the resulting PR description. Require that exact ID to avoid
        // attaching an unrelated Jules PR to this assignment.
        const pullRequests = await allPages<any>(`${repo}/pulls?state=all&sort=updated&direction=desc`);
        pullRequest = findJulesTaskPR(pullRequests, expectedTaskUrl);
      }
      return deriveJulesAssignment({ issue, timeline, comments, pullRequest });
    });
    return NextResponse.json({ ...result.value, fetchedAt: result.fetchedAt, stale: result.stale, error: result.error || null }, { headers });
  } catch (error) {
    return NextResponse.json({ status: "UNKNOWN", sessionStatus: "UNKNOWN", assignedAgent: "UNKNOWN", assignedBy: "UNKNOWN", accepted: false, pullRequest: null, fetchedAt: "", stale: true, error: errorText(error), nextAction: "Refresh the GitHub assignment source. No owner or provider session has been invented." }, { status: 503, headers });
  }
}
