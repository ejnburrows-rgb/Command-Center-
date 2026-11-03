"use client";
import { useEffect, useState } from "react";
import type { JulesAssignmentEvidence } from "@/lib/jules-assignment-contract";

function when(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "UNKNOWN";
}

export default function JulesAssignment() {
  const [data, setData] = useState<JulesAssignmentEvidence | null>(null);
  const [busy, setBusy] = useState(true);
  async function refresh() {
    setBusy(true);
    try {
      const response = await fetch("/api/assignment", { cache: "no-store" });
      const next = await response.json();
      setData(next);
    } catch {
      setData({ status: "UNKNOWN", sessionStatus: "UNKNOWN", assignedAgent: "UNKNOWN", assignedBy: "UNKNOWN", stale: true, error: "GitHub assignment evidence could not be refreshed.", nextAction: "Refresh the source before relying on the last known status." });
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { void refresh(); }, []);

  const sourceUrl = data?.issueUrl || "https://github.com/ejnburrows-rgb/Command-Center-/issues/18";
  return <section className="jules-assignment" aria-labelledby="jules-assignment-title">
    <div className="jules-assignment-head">
      <div><p className="jules-assignment-kicker">TASK OWNERSHIP · REAL GITHUB EVIDENCE</p><h2 id="jules-assignment-title">Who owns the existing Jules task?</h2></div>
      <button type="button" onClick={() => void refresh()} disabled={busy}>{busy ? "Refreshing…" : "Refresh evidence"}</button>
    </div>
    <div className="jules-assignment-state" data-stale={Boolean(data?.stale)}>
      <strong>{busy && !data ? "CHECKING SOURCE" : data?.status || "UNKNOWN"}</strong>
      <span>{data?.stale ? "STALE · LAST VERIFIED SOURCE SHOWN" : data?.fetchedAt ? `Verified from GitHub · ${when(data.fetchedAt)}` : "Source time UNKNOWN"}</span>
    </div>
    {data?.error && <p className="jules-assignment-warning">GitHub could not verify the current state: {data.error}</p>}
    <dl className="jules-assignment-grid">
      <div><dt>Task</dt><dd><a href={sourceUrl} target="_blank" rel="noreferrer">NBO issue #18 ↗</a></dd></div>
      <div><dt>Assigned by</dt><dd>{data?.assignedBy || "UNKNOWN"}</dd></div>
      <div><dt>Assigned agent</dt><dd>{data?.assignedAgent || "UNKNOWN"}</dd></div>
      <div><dt>Requested by</dt><dd>{data?.requestedBy || "UNKNOWN"}</dd></div>
      <div><dt>Assignment recorded through</dt><dd>{data?.assignedThrough || "UNKNOWN"}</dd></div>
      <div><dt>Assignment source</dt><dd>{data?.assignmentSource || "UNKNOWN"}</dd></div>
      <div><dt>Assignment observed</dt><dd>{when(data?.assignmentAt)}</dd></div>
      <div><dt>Accepted by provider</dt><dd>{data?.accepted ? "YES · official Jules bot" : "NOT VERIFIED"}{data?.acceptedAt && <> · {when(data.acceptedAt)}</>}</dd></div>
      <div><dt>Live session</dt><dd>UNKNOWN · direct Jules session access is unavailable here</dd></div>
      <div><dt>Latest Jules update</dt><dd>{data?.latestOutcome || "UNKNOWN"}{data?.latestEventAt && <> · {when(data.latestEventAt)}</>}</dd></div>
      <div><dt>Completion PR</dt><dd>{data?.pullRequest ? <a href={data.pullRequest.url} target="_blank" rel="noreferrer">#{data.pullRequest.number} · {data.pullRequest.state} ↗</a> : "No task-linked completion PR found"}</dd></div>
    </dl>
    <div className="jules-assignment-next"><div><strong>Next accountable step</strong><p>{data?.nextAction || "Wait for the source check to finish."}</p></div><div className="jules-assignment-links">
      {data?.taskUrl && <a href={data.taskUrl} target="_blank" rel="noreferrer">Open existing Jules task ↗</a>}
      {data?.acceptanceUrl && <a href={data.acceptanceUrl} target="_blank" rel="noreferrer">View acceptance evidence ↗</a>}
      {data?.latestEventUrl && <a href={data.latestEventUrl} target="_blank" rel="noreferrer">View latest update ↗</a>}
    </div></div>
  </section>;
}
