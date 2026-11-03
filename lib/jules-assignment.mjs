const BOT = "google-labs-jules[bot]";
const TASK_URL = /https:\/\/jules\.google(?:\.com)?\/task\/(\d+)/i;
const PR_URL = /https:\/\/github\.com\/ejnburrows-rgb\/Command-Center-\/pull\/(\d+)/i;

/** @param {unknown} value */
function iso(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
}

/** @param {string} body */
export function julesTaskUrl(body) {
  return body.match(TASK_URL)?.[0] || null;
}

/** @param {string} body @param {string | null} expectedTaskUrl */
export function julesPullRequestNumber(body, expectedTaskUrl) {
  const expectedTaskId = expectedTaskUrl?.match(TASK_URL)?.[1];
  const commentTaskId = body.match(TASK_URL)?.[1];
  const prNumber = body.match(PR_URL)?.[1];
  return expectedTaskId && commentTaskId === expectedTaskId && prNumber ? Number(prNumber) : null;
}

/** @param {Array<Record<string, any>>} pullRequests @param {string | null} expectedTaskUrl */
export function findJulesTaskPR(pullRequests, expectedTaskUrl) {
  const taskId = expectedTaskUrl?.match(TASK_URL)?.[1];
  if (!taskId) return null;
  const taskIdPattern = new RegExp(`\\b${taskId}\\b`);
  return [...pullRequests]
    .filter((pullRequest) => taskIdPattern.test(String(pullRequest?.body || "")))
    .sort((a, b) => Date.parse(b.updated_at || "") - Date.parse(a.updated_at || ""))[0] || null;
}

/**
 * Only a task URL in an official Jules bot comment proves acceptance.
 * A label, issue author, or unrelated bot comment is not enough.
 * @param {Record<string, any>} input
 */
export function deriveJulesAssignment(input) {
  const { issue, timeline = [], comments = [], pullRequest = null, fetchedAt = null, stale = false, error = null } = input;
  if (!issue || error) {
    return {
      issueUrl: "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
      title: issue?.title || "NBO Jules task ownership",
      status: "UNKNOWN",
      sessionStatus: "UNKNOWN",
      assignedAgent: "UNKNOWN",
      assignedBy: "UNKNOWN",
      requestedBy: "UNKNOWN",
      assignedThrough: "UNKNOWN",
      assignmentSource: "GitHub issue #18",
      assignmentUrl: "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
      assignmentAt: null,
      accepted: false,
      taskUrl: null,
      acceptedAt: null,
      acceptanceUrl: null,
      latestOutcome: "UNKNOWN",
      latestEventAt: null,
      latestEventUrl: null,
      pullRequest: null,
      fetchedAt,
      stale: Boolean(stale),
      error: error || "Assignment source is unavailable.",
      nextAction: "Refresh the GitHub source. Do not infer an owner or session while the source is unknown.",
    };
  }

  const label = (issue.labels || []).some((item) => (typeof item === "string" ? item : item?.name) === "jules");
  const labelEvent = timeline
    .filter((event) => event?.event === "labeled" && (event?.label?.name || event?.label) === "jules")
    .map((event) => ({ ...event, at: iso(event.created_at) }))
    .filter((event) => event.at)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .at(-1);

  const official = comments
    .filter((comment) => comment?.user?.login === BOT)
    .map((comment) => ({ ...comment, at: iso(comment.created_at || comment.updated_at), taskUrl: julesTaskUrl(comment.body || "") }))
    .filter((comment) => comment.at)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const acceptedComment = official.find((comment) => comment.taskUrl) || null;
  const latest = official.at(-1) || null;
  const failed = Boolean(latest && /unexpected error|wasn't able to complete|was not able to complete|could not complete|unable to complete/i.test(latest.body || ""));
  const taskUrl = acceptedComment?.taskUrl || null;
  const prComment = [...official].reverse().find((comment) => julesPullRequestNumber(comment.body || "", taskUrl)) || null;
  const commentPrNumber = prComment ? julesPullRequestNumber(prComment.body, taskUrl) : null;
  const bodyLinkedPr = pullRequest && findJulesTaskPR([pullRequest], taskUrl);
  const prNumber = commentPrNumber || bodyLinkedPr?.number || null;
  const pr = prNumber && pullRequest?.number === prNumber ? pullRequest : null;
  const accepted = Boolean(acceptedComment);

  // The latest official provider outcome takes precedence over historical acceptance.
  // Keep acceptance as a separate fact; a failed task is never shown as active.
  let status = "REQUESTED / UNASSIGNED";
  if (label) status = "DISPATCHED — ACCEPTANCE NOT VERIFIED";
  if (accepted) status = "ACCEPTED — LIVE SESSION STATUS UNKNOWN";
  if (failed) status = "FAILED — PROVIDER REPORTED TASK FAILURE";
  else if (pr?.merged_at) status = "MERGED — PRODUCTION NOT VERIFIED";
  else if (pr?.state === "open" && pr?.draft) status = "DRAFT PR — NOT REVIEW-READY";
  else if (pr?.state === "open") status = "REVIEW-READY — PR OPEN";
  else if (pr?.state === "closed") status = "PR CLOSED — NOT MERGED";

  let nextAction = "No verified agent owns this issue. Check the existing authorization before assigning work.";
  if (label && !accepted) nextAction = "Wait for an official Jules bot task link. A label alone does not prove acceptance.";
  if (accepted) nextAction = "Check the existing Jules task with provider access. Its live session state is UNKNOWN here; do not create a duplicate task.";
  if (failed) nextAction = "Jules reported that the existing task failed. Preserve its earlier acceptance as history; the live session is UNKNOWN. Review the existing task evidence with provider access. Do not resume or dispatch from this Board.";
  else if (pr?.state === "open" && pr?.draft) nextAction = "The task-linked PR is still a draft. Review its current branch and checks; this Board cannot verify a live Jules session.";
  else if (pr?.state === "open") nextAction = "Review the linked PR and its current checks. An open PR is not merged or live.";
  else if (pr?.merged_at) nextAction = "Verify the exact production deployment commit before calling this task live.";

  const result = {
    issueUrl: issue.html_url || "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
    title: issue.title || "NBO Jules task ownership",
    status,
    sessionStatus: "UNKNOWN",
    assignedAgent: failed && accepted ? "Jules · accepted earlier; latest outcome FAILED" : accepted ? "Jules · accepted; session UNKNOWN" : label ? "Jules — acceptance not verified" : "UNASSIGNED",
    assignedBy: labelEvent?.actor?.login || (label ? "UNKNOWN" : "UNASSIGNED"),
    requestedBy: issue.user?.login || "UNKNOWN",
    assignedThrough: labelEvent?.performed_via_github_app?.name || "GitHub issue label",
    assignmentSource: label ? "GitHub issue #18 · jules label" : "GitHub issue #18",
    assignmentUrl: issue.html_url || "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
    assignmentAt: labelEvent?.at || iso(issue.created_at),
    accepted,
    taskUrl,
    acceptedAt: acceptedComment?.at || null,
    acceptanceUrl: acceptedComment?.html_url || null,
    latestOutcome: failed ? "JULES FAILED TO COMPLETE THE TASK" : latest ? "OFFICIAL JULES UPDATE" : "NO OFFICIAL JULES UPDATE",
    latestEventAt: latest?.at || iso(issue.updated_at),
    latestEventUrl: latest?.html_url || issue.html_url || null,
    pullRequest: pr ? {
      number: pr.number,
      title: pr.title || `Pull request #${pr.number}`,
      url: pr.html_url,
      state: pr.merged_at ? "MERGED" : pr.state === "open" ? (pr.draft ? "DRAFT · NOT REVIEW-READY" : "OPEN · REVIEW REQUIRED") : "CLOSED · NOT MERGED",
      headSha: pr.head?.sha || null,
      mergedAt: iso(pr.merged_at),
    } : null,
    fetchedAt,
    stale: Boolean(stale),
    error: null,
    nextAction,
  };
  return result;
}
