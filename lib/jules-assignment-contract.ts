/** Shared read-only GitHub evidence contract for the assignment panel and task handoffs. */
export type JulesAssignmentEvidence = {
  issueUrl?: string;
  title?: string;
  status: string;
  sessionStatus?: "UNKNOWN" | "ACTIVE" | "PAUSED" | "COMPLETED";
  assignedAgent?: string;
  assignedBy?: string;
  requestedBy?: string;
  assignedThrough?: string;
  assignmentSource?: string;
  assignmentUrl?: string;
  assignmentAt?: string | null;
  accepted?: boolean;
  taskUrl?: string | null;
  acceptedAt?: string | null;
  acceptanceUrl?: string | null;
  latestOutcome?: string;
  latestEventAt?: string | null;
  latestEventUrl?: string | null;
  pullRequest?: { number: number; title: string; url: string; state: string; headSha?: string | null; mergedAt?: string | null } | null;
  fetchedAt?: string;
  stale?: boolean;
  error?: string | null;
  nextAction?: string;
};
