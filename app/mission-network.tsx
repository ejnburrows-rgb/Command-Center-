"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project, Work } from "./hub-data";
import type { Job, Approval, Execution } from "./evidence-panels";
import type { JulesAssignmentEvidence } from "@/lib/jules-assignment-contract";

const CW = 1580, CH = 1280, CX = CW / 2, CY = CH / 2;
const PROJECT_RADIUS = 275, WORK_RADIUS = 515, DETAIL_RADIUS = 705, PAGE_SIZE = 5;
type NodeKind = "project" | "work" | "assignment" | "evidence" | "deployment";
export type SemanticTone = "green" | "orange" | "red" | "gray";

type Node = {
  id: string;
  x: number;
  y: number;
  kind: NodeKind;
  tone?: SemanticTone;
  project: Project;
  work?: Work;
  index?: number;
  angle: number;
  parentId?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  url?: string;
  freshness?: string;
};

type Point = { x: number; y: number };
const fmt = (raw?: string | null) =>
  raw && !Number.isNaN(Date.parse(raw)) ? new Date(raw).toLocaleString() : "Unknown";
const workKey = (p: Project, w: Work) => p.slug + "/" + w.kind + "/" + w.number;
const bounded = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function path(a: Point, b: Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const start = { x: a.x + dx * 0.23, y: a.y + dy * 0.23 };
  const end = { x: b.x - dx * 0.23, y: b.y - dy * 0.23 };
  return "M " + a.x + " " + a.y + " C " + start.x + " " + start.y + " " + end.x + " " + end.y + " " + b.x + " " + b.y;
}

export function projectFreshness(p: Project) {
  if (!p.accessible) return "SOURCE UNAVAILABLE";
  if (p.stale || p.limited) return "STALE OR PARTIAL SNAPSHOT" + (p.fetchedAt ? " · Last observed " + fmt(p.fetchedAt) : "");
  return "SNAPSHOT OBSERVED " + (p.fetchedAt ? fmt(p.fetchedAt) : "TIME UNKNOWN") + " (cached TTL)";
}

export function workStatus(w: Work, assignment?: JulesAssignmentEvidence | null) {
  if (w.kind === "issue" && w.number === 18 && assignment) {
    if (assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || "")) return "FAILED ASSIGNMENT · DO NOT RESUME BLINDLY";
    if (assignment.status) return assignment.status;
  }
  return w.kind === "pr" ? (w.draft ? "DRAFT · NOT INTEGRATED" : "OPEN PR · NOT VERIFIED LIVE") : "OPEN ISSUE · NOT COMPLETE";
}

export function resolveProjectTone(p: Project, assignment?: JulesAssignmentEvidence | null): SemanticTone {
  if (!p.accessible || p.stale || p.limited) return "gray";
  if (p.slug === "Command-Center-" && assignment && (assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || ""))) return "red";
  if (p.slug === "cartilla-de-gretel") return "orange";
  if ((p.prs || 0) > 0 || (p.issues || 0) > 0) return "orange";
  return "gray";
}

export function resolveWorkTone(p: Project, w: Work, assignment?: JulesAssignmentEvidence | null): SemanticTone {
  const isFailedJules = p.slug === "Command-Center-" && w.kind === "issue" && w.number === 18 && Boolean(assignment && (assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || "")));
  if (isFailedJules) return "red";
  if (p.slug === "cartilla-de-gretel" && w.kind === "pr" && w.number === 1073) return "orange";
  if (w.kind === "pr") return w.draft ? "gray" : "orange";
  return "orange";
}

function taskHandoff(p: Project, w: Work, assignment?: JulesAssignmentEvidence | null, jobs?: Job[], execution?: Execution) {
  const sourceOK = p.accessible && !p.stale && !p.limited;
  const isJules18 = p.slug === "Command-Center-" && w.kind === "issue" && w.number === 18;
  const julesFailed = isJules18 && Boolean(assignment && (assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || "") || assignment.error));
  const jobMatch = p.slug === "cartilla-de-gretel" ? jobs?.find((j) => j.id === w.number) : undefined;
  const agentLine = isJules18
    ? assignment && !assignment.stale && !assignment.error
      ? `${assignment.assignedAgent || "Jules"} · Assigned by ${assignment.assignedBy || "UNKNOWN"} · Latest outcome: ${assignment.latestOutcome || "UNKNOWN"} · Live session: UNKNOWN`
      : "Jules assignment status UNKNOWN / STALE — inspect GitHub issue #18 before acting."
    : p.slug === "cartilla-de-gretel" && w.number === 1073
    ? "Codex (existing Gretel Tutor branch owner per #877) · Live session UNKNOWN without provider telemetry"
    : "UNKNOWN unless current authenticated provider evidence confirms assignment.";
  const proofLine = jobMatch?.proofUrl || "None linked in current snapshot — verify PR/issue comments directly.";
  return [
    (julesFailed ? "FAILED ASSIGNMENT (INSPECT ONLY — DO NOT DISPATCH DUPLICATE) — " : "EXISTING TASK — ") + w.title,
    "PROJECT: " + p.name + " (" + p.url + ")",
    "SOURCE RECORD: " + w.url,
    "GITHUB STATUS: " + workStatus(w, isJules18 ? assignment : null),
    "LAST SOURCE UPDATE: " + (w.updatedAt || "UNKNOWN"),
    "PROJECT DATA FRESHNESS: " + (sourceOK ? "Cached GitHub snapshot observed " + fmt(p.fetchedAt) + " (not freshly verified live execution)" : "STALE OR PARTIAL — INSPECT ONLY"),
    "AGENT / OWNER: " + agentLine,
    "LINKED EVIDENCE: " + proofLine,
    "DEPLOYMENT STATE: Build age & deployed commit UNKNOWN without live deployment telemetry.",
    ...(p.slug === "cartilla-de-gretel" ? ["CARTILLA AUTHORITY (#877): " + (execution?.nextStep || "Inspect #877 before any product work.")] : []),
    "",
    "MISSION: " + (julesFailed ? "Do NOT suggest or start this failed Jules task as active work. Inspect the existing task evidence only; do not resume or dispatch from this Board." : "Continue this exact existing work without starting a duplicate agent or branch."),
    "1. Inspect the latest repository main, existing issue/PR head, AGENTS.md, task owner, linked proof, and any assigned agent session.",
    "2. Confirm the latest owner-authorized scope. For Cartilla, issue #877 governs work; other product lanes must not be silently resumed.",
    "3. If authorized, make only the smallest targeted repair needed. Do not duplicate work or initiate unrelated tests, services or agents.",
    "4. Prove actual behavior with focused tests and phone/browser evidence as applicable, retaining previous valid results.",
    "5. Respect independent review, merge protections and separate production permission. Never infer a provider is running from a GitHub label.",
    "RETURN: Owner | Latest SHA | Change | Proof | Open blocker | Single next executable action.",
  ].join("\n");
}

function buildConnectedNodes(
  activeNode: Node,
  assignment?: JulesAssignmentEvidence | null,
  jobs?: Job[],
  approvals?: Approval[],
  execution?: Execution
): Node[] {
  const p = activeNode.project;
  const isJulesRepo = p.slug === "Command-Center-";
  const isCartilla = p.slug === "cartilla-de-gretel";
  const details: Node[] = [];
  const baseAngle = activeNode.angle;

  if (isJulesRepo && assignment) {
    const isFailed = assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || "") || Boolean(assignment.error);
    details.push({
      id: "node-assignment-18",
      parentId: activeNode.id,
      kind: "assignment",
      /* kind:"assignment" */
      tone: isFailed ? "red" : "orange",
      project: p,
      angle: baseAngle - 0.22,
      x: CX + Math.cos(baseAngle - 0.22) * DETAIL_RADIUS,
      y: CY + Math.sin(baseAngle - 0.22) * DETAIL_RADIUS,
      title: "Jules Bot Task #18",
      subtitle: isFailed
        ? "Assignment classified FAILED (stopped at 3:36 AM without finishing). Do NOT dispatch duplicate."
        : "Automated Jules assignment under review. Live session UNKNOWN.",
      status: assignment.status || "UNKNOWN",
      url: "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
      freshness: assignment.fetchedAt ? "Snapshot " + fmt(assignment.fetchedAt) : "Telemetry UNKNOWN",
    });
  }

  if (isCartilla) {
    details.push({
      id: "node-cartilla-evidence",
      parentId: activeNode.id,
      kind: "evidence",
      /* kind:"evidence" */
      tone: "orange",
      project: p,
      angle: baseAngle - 0.24,
      x: CX + Math.cos(baseAngle - 0.24) * DETAIL_RADIUS,
      y: CY + Math.sin(baseAngle - 0.24) * DETAIL_RADIUS,
      title: "Gretel Tutor L1 Evidence (#1073)",
      subtitle: "Dynamic head SHA from GitHub · StubEars synthetic test passed · Awaiting physical phone microphone verification",
      status: "PR #1073 (In Progress)",
      url: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073",
      freshness: "Governed by Cartilla issue #877 directive TUTOR_1073_ONLY",
    });

    details.push({
      id: "node-cartilla-deployment",
      parentId: activeNode.id,
      kind: "deployment",
      /* kind:"deployment" */
      tone: "green",
      project: p,
      angle: baseAngle + 0.24,
      x: CX + Math.cos(baseAngle + 0.24) * DETAIL_RADIUS,
      y: CY + Math.sin(baseAngle + 0.24) * DETAIL_RADIUS,
      title: "Jardín de Mariposas Live",
      subtitle: "Verified production release at commit c670ff04 (PR #1079). Touch & sound qualified.",
      status: "DEPLOYED LIVE",
      url: "https://cartilla-de-gretel.vercel.app/cartilla/juego/mariposas-p",
      freshness: "Verified 2026-10-29 · Production route active",
    });
  }

  return details;
}

export type MindGraphNode = {
  id: string;
  step: number;
  column: 1 | 2 | 3;
  x: number;
  y: number;
  title: string;
  subtitle: string;
  tone: "green" | "orange" | "red" | "gray";
  dateBadge: string;
  agentBadge: string;
  sourceUrl?: string;
  evidenceSummary: string;
  nextAction: string;
};

export const OPTION_C_MIND_NODES: MindGraphNode[] = [
  {
    id: "merged-assets",
    step: 1,
    column: 1,
    x: 140,
    y: 110,
    title: "162 Word MP3s & 51 Art Crops",
    subtitle: "Workbook & Flip-Chart Assets",
    tone: "green",
    dateBadge: "Oct 28–29 · Merged",
    agentBadge: "Merged #503/#1205",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1205",
    evidenceSummary: "162 approved Candidate B MP3s (#503) + 51 300-DPI book crops (#1205) + Elephant/Sheep RGBA motion (#1204) merged on main.",
    nextAction: "Preserve merged assets without regression or recreation.",
  },
  {
    id: "mariposas-live",
    step: 2,
    column: 1,
    x: 140,
    y: 280,
    title: "Butterfly Game (Mariposas-P)",
    subtitle: "Touch & Audio Verified Live",
    tone: "green",
    dateBadge: "Oct 29 · Deployed",
    agentBadge: "Verified Live #1079",
    sourceUrl: "https://cartilla-de-gretel.vercel.app/cartilla/juego/mariposas-p",
    evidenceSummary: "Production deployment at commit c670ff04. Playwright mobile touch passed. Approved by owner for standalone play.",
    nextAction: "Maintain live route; do not roll back or overwrite with speculative full release.",
  },
  {
    id: "jules-stopped",
    step: 3,
    column: 2,
    x: 375,
    y: 95,
    title: "Jules Bot Task #18 (Stopped)",
    subtitle: "3:36 AM failure classified",
    tone: "red",
    dateBadge: "Oct 30 · Stopped",
    agentBadge: "Jules (Issue #18)",
    sourceUrl: "https://github.com/ejnburrows-rgb/Command-Center-/issues/18",
    evidenceSummary: "NBO Issue #18 stopped without finishing. No PR was pushed. Live session UNKNOWN. Classified as FAILED per 11-point evidence standard.",
    nextAction: "Do NOT resume or relaunch blindly. Repair is verified and ready in Command Center PR #28.",
  },
  {
    id: "command-center-pr28",
    step: 4,
    column: 2,
    x: 580,
    y: 95,
    title: "Approve Command Center PR #28",
    subtitle: "Backend repair ready to merge",
    tone: "orange",
    dateBadge: "Oct 30 · Ready",
    agentBadge: "Codex",
    sourceUrl: "https://github.com/ejnburrows-rgb/Command-Center-/pull/28",
    evidenceSummary: "Command Center PR #28 preserves 97-test verified fixes, dynamic Tutor head SHA resolution, and Jules FAILED classification.",
    nextAction: "Owner review & merge sign-off for PR #28.",
  },
  {
    id: "cartilla-rules-pr1218",
    step: 4,
    column: 2,
    x: 375,
    y: 245,
    title: "Approve Cartilla Docs PR #1218",
    subtitle: "Operating rules update",
    tone: "orange",
    dateBadge: "NOW · Step 1",
    agentBadge: "Documentation",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1218",
    evidenceSummary: "Cartilla Docs PR #1218 updates AGENTS.md rules with latest owner directives and single-task finish contract.",
    nextAction: "Review and merge PR #1218 ahead of real-device phone audio qualification.",
  },
  {
    id: "tutor-l1-1073",
    step: 5,
    column: 2,
    x: 580,
    y: 245,
    title: "Maestra Gretel Tutor (L1 #1073)",
    subtitle: "Awaiting real phone mic test",
    tone: "orange",
    dateBadge: "NOW · Active Step",
    agentBadge: "Codex",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073",
    evidenceSummary: "StubEars synthetic tests passed. Dynamic head SHA from GitHub. Live session UNKNOWN. Real phone microphone interaction pending.",
    nextAction: "Execute real-device microphone test on phone viewport (390×844) without cloud LLM substitution.",
  },
  {
    id: "voice-alignment-769",
    step: 6,
    column: 3,
    x: 805,
    y: 100,
    title: "Align 151 Gretel Clips (#769)",
    subtitle: "Remove 3 Robot-Voice Leaks",
    tone: "red",
    dateBadge: "NEXT · Voice Blocker",
    agentBadge: "Audio Specialist",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/769",
    evidenceSummary: "151 clean original segments recovered from Gretel_558674_Original.m4a awaiting alignment. 3 active window.speechSynthesis robot-voice leaks on main.",
    nextAction: "Align authentic phrase recordings and replace 3 browser robot TTS leaks.",
  },
  {
    id: "workbook-pages-36-37",
    step: 7,
    column: 3,
    x: 805,
    y: 225,
    title: "Supply Pages 36 & 37 Scans",
    subtitle: "Workbook Lessons 10 & 11",
    tone: "red",
    dateBadge: "NEXT · Scan Blocker",
    agentBadge: "Human Scans Needed",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
    evidenceSummary: "Workbook pages 36 & 37 (Lessons 10 & 11) have physical scan jump 85→88 in the authoritative paper book. Excluded from student navigation.",
    nextAction: "Provide high-resolution physical book scans for pages 36 & 37 without inventing text.",
  },
  {
    id: "parked-games-lany",
    step: 8,
    column: 3,
    x: 805,
    y: 345,
    title: "Unpause Games & LANY Books",
    subtitle: "Piano, Cow Game, LANY Web",
    tone: "gray",
    dateBadge: "PARKED · Scope Gate",
    agentBadge: "On Hold per #877",
    sourceUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
    evidenceSummary: "Piano Hablador, Vaca Lechera, and LANY Books are safely paused per owner directive TUTOR_1073_ONLY.",
    nextAction: "Resume remaining games and LANY Books only after Lesson 1 Tutor qualification completes.",
  },
];

export const OPTION_C_TIMELINE_STEPS = [
  { step: 1, tone: "green", nodeId: "merged-assets", label: "DELIVERED", desc: "Oct 28–29: 162 Word MP3s (#503) + 51 Art Crops (#1205) + 6 Blinks (#1204)" },
  { step: 2, tone: "green", nodeId: "mariposas-live", label: "DELIVERED", desc: "Oct 29: Butterfly Game (Mariposas) Deployed Live (#1079)" },
  { step: 3, tone: "red", nodeId: "jules-stopped", label: "HAPPENING NOW", desc: "Oct 30, 3:36 AM: Jules Task #18 Stopped (Fix Ready in PR #28)" },
  { step: 4, tone: "orange", nodeId: "command-center-pr28", label: "HAPPENING NOW", desc: "NOW Step 1: Approve PR #28 (Command Center) & PR #1218 (Rules)" },
  { step: 5, tone: "orange", nodeId: "tutor-l1-1073", label: "HAPPENING NOW", desc: "NOW Step 2: Test Maestra Gretel Tutor (L1 #1073) on Real Phone Mic" },
  { step: 6, tone: "red", nodeId: "voice-alignment-769", label: "NEXT UP", desc: "Align 151 Gretel Voice Clips (#769) & Remove 3 Robot-Voice Leaks" },
  { step: 7, tone: "red", nodeId: "workbook-pages-36-37", label: "NEXT UP", desc: "Supply Paper Scans for Workbook Pages 36 & 37" },
  { step: 8, tone: "gray", nodeId: "parked-games-lany", label: "PARKED", desc: "Unpause Remaining Games & LANY Books After Tutor L1" },
];

export default function MissionNetwork({
  projects,
  selectedProjectSlug,
  onSelectProject,
  jobs = [],
  approvals = [],
  execution,
  assignment,
}: {
  projects: Project[];
  selectedProjectSlug?: string;
  onSelectProject: (slug: string) => void;
  jobs?: Job[];
  approvals?: Approval[];
  execution?: Execution;
  assignment?: JulesAssignmentEvidence | null;
}) {
  const [sizeMode, setSizeMode] = useState<"retract" | "big" | "xl">("big");
  const [selectedMindNode, setSelectedMindNode] = useState<string>("tutor-l1-1073");
  const [selectedStep, setSelectedStep] = useState<number>(5);
  const [viewType, setViewType] = useState<"mind_graph" | "repo_cluster">("mind_graph");
  const [copiedHandoff, setCopiedHandoff] = useState(false);

  // Repo Cluster State
  const [focus, setFocus] = useState("");
  const [selectedWork, setSelectedWork] = useState("");
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(0.55);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; pan: Point } | null>(null);

  const expanded = sizeMode !== "retract";
  const selectedProject = projects.find((p) => p.slug === focus);
  const isExpanded = Boolean(selectedProject);

  const repoNodes: Node[] = useMemo(() => {
    return projects.map((project, i) => {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(projects.length, 1);
      return {
        id: project.slug,
        x: CX + Math.cos(a) * PROJECT_RADIUS,
        y: CY + Math.sin(a) * PROJECT_RADIUS,
        kind: "project",
        project,
        index: i,
        angle: a,
      };
    });
  }, [projects]);

  const activeNode = repoNodes.find((n) => n.id === focus);
  const sourceWork = selectedProject?.items || [];
  const maxPages = Math.max(1, Math.ceil(sourceWork.length / PAGE_SIZE));
  const safePage = bounded(page, 0, maxPages - 1);
  const slice = sourceWork.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const workNodes: Node[] = activeNode
    ? slice.map((work, i) => {
        const base = activeNode.angle;
        const spread = slice.length === 1 ? 0 : (i / (slice.length - 1) - 0.5) * 0.96;
        const angle = base + spread;
        return {
          id: workKey(activeNode.project, work),
          project: activeNode.project,
          work,
          kind: "work",
          angle,
          x: CX + Math.cos(angle) * WORK_RADIUS,
          y: CY + Math.sin(angle) * WORK_RADIUS,
        };
      })
    : [];

  const detailNodes: Node[] = useMemo(() => {
    if (!activeNode) return [];
    return buildConnectedNodes(activeNode, assignment, jobs, approvals, execution);
  }, [activeNode, assignment, jobs, approvals, execution]);

  const chosen = workNodes.find((n) => n.id === selectedWork) || detailNodes.find((n) => n.id === selectedWork);
  const prompt = chosen?.work ? taskHandoff(chosen.project,chosen.work, assignment, jobs, execution) : "";

  function expand(n: Node) {
    const isClosing = focus === n.id;
    onSelectProject(n.id);
    setFocus(isClosing?"":n.id);
    setPage(0);
    setSelectedWork("");
    setCopied(false);
    setPromptOpen(false);
    if (!isClosing) {
      setPan({
        x: -Math.cos(n.angle) * 145,
        y: -Math.sin(n.angle) * 115,
      });
    } else setPan({ x: 0, y: 0 });
  }

  function collapseAll() {
    setFocus("");
    setSelectedWork("");
    setPage(0);
    setPan({ x: 0, y: 0 });
  }

  function switchPage(next: number) {
    setPage(next);
    setSelectedWork("");
    setCopied(false);
    setPromptOpen(false);
  }

  function startPan(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button,textarea,a")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function movePan(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (d?.id === e.pointerId) {
      setPan({ x: d.pan.x + e.clientX - d.x, y: d.pan.y + e.clientY - d.y });
    }
  }

  function stopPan(e: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === e.pointerId) drag.current = null;
  }

  async function copy() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const activeNodeData = useMemo(() => {
    return OPTION_C_MIND_NODES.find((n) => n.id === selectedMindNode) || OPTION_C_MIND_NODES[5];
  }, [selectedMindNode]);

  async function copyNodeEvidence(node: MindGraphNode) {
    const text = [
      `NBO MIND GRAPH CHECKPOINT — ${node.title}`,
      `Status: ${node.tone.toUpperCase()} · Timeline: ${node.dateBadge} · Owner: ${node.agentBadge}`,
      `Source: ${node.sourceUrl || "N/A"}`,
      `Evidence: ${node.evidenceSummary}`,
      `Next Action: ${node.nextAction}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHandoff(true);
      setTimeout(() => setCopiedHandoff(false), 2500);
    } catch {}
  }

  return (
    <section className={"mind-graph-container size-" + sizeMode} aria-label="Interactive Mind Graph & Project Timeline">
      {/* Retracted Mode: 1-Line Color-Coded Summary Strip */}
      {sizeMode === "retract" ? (
        <div className="mind-graph-retracted-bar">
          <div className="retracted-counts">
            <span className="count-pill tone-green">🟢 2 Verified</span>
            <span className="count-pill tone-orange">🟠 3 Active</span>
            <span className="count-pill tone-red">🔴 3 Blockers</span>
            <span className="count-pill tone-gray">⚪ 1 Parked</span>
          </div>
          <button
            type="button"
            className="mind-size-btn open-btn"
            onClick={() => setSizeMode("big")}
            aria-expanded={expanded}
            aria-label="Open Mind Graph & Timeline"
          >
            [+ Open Mind Graph & Timeline]
          </button>
        </div>
      ) : (
        <div className="mind-graph-full-deck">
          {/* Header & Size Controls */}
          <div className="mind-graph-toolbar">
            <div className="mind-toolbar-left">
              <strong>INTERACTIVE MIND GRAPH & PROJECT TIMELINE</strong>
              <span>
                3 Visual Time-Zones · 9 Color-Coded Nodes · Integrated 8-Step Project Timeline
              </span>
            </div>
            <div className="mind-toolbar-right">
              <div className="size-button-group" role="group" aria-label="Mind Graph size modes">
                <button
                  type="button"
                  className="size-btn"
                  onClick={() => setSizeMode("retract")}
                  title="Collapse to summary strip"
                >
                  Retract
                </button>
                <button
                  type="button"
                  className={"size-btn" + (sizeMode === "big" ? " active" : "")}
                  onClick={() => setSizeMode("big")}
                  title="Default 450px canvas"
                >
                  Big View
                </button>
                <button
                  type="button"
                  className={"size-btn" + (sizeMode === "xl" ? " active" : "")}
                  onClick={() => setSizeMode("xl")}
                  title="Expand to 600px command wall"
                >
                  Expand XL
                </button>
              </div>
              <div className="view-switch-pills" role="group" aria-label="Network View Modes" style={{ display: "inline-flex", gap: 4, marginLeft: 8 }}>
                <button
                  type="button"
                  className={"size-btn" + (viewType === "mind_graph" ? " active" : "")}
                  onClick={() => setViewType("mind_graph")}
                  style={{ background: viewType === "mind_graph" ? "#3b82f6" : "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}
                >
                  Mind Graph
                </button>
                <button
                  type="button"
                  className={"size-btn" + (viewType === "repo_cluster" ? " active" : "")}
                  onClick={() => setViewType("repo_cluster")}
                  style={{ background: viewType === "repo_cluster" ? "#3b82f6" : "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}
                >
                  Repo Network
                </button>
              </div>
            </div>
          </div>

          {/* Semantic State Legend Strip */}
          <div className="mind-legend-strip" role="note" aria-label="Semantic State Legend" style={{ display: "flex", gap: 12, padding: "6px 14px", background: "#0f172a", borderBottom: "1px solid #334155", fontSize: 11, flexWrap: "wrap" }}>
            <span style={{ color: "#4ade80", fontWeight: 700 }}>● Green (Verified Complete)</span>
            <span style={{ color: "#fb923c", fontWeight: 700 }}>● Orange (In Progress / Needs Review)</span>
            <span style={{ color: "#f87171", fontWeight: 700 }}>● Red (Confirmed Blocker)</span>
            <span style={{ color: "#94a3b8", fontWeight: 700 }}>● Gray (Paused / Draft / Unverified)</span>
          </div>

          {/* View 1: Option C Mind Graph Canvas & Timeline */}
          {viewType === "mind_graph" && (
            <>
              {/* 960×430 SVG Mind Graph Canvas */}
              <div className={"mind-canvas-viewport" + (sizeMode === "xl" ? " viewport-xl" : "")}>
                <svg
                  className="mind-svg-canvas"
                  viewBox="0 0 960 430"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="Mind Graph time-zone map"
                >
                  <defs>
                    <linearGradient id="edge-delivered" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#22c55e" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#3b82f6" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="edge-active" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#eab308" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="edge-blocker" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#f97316" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* 3 Visual Time-Zone Columns */}
                  <g className="time-zone-columns" aria-hidden="true">
                    <rect x="10" y="8" width="235" height="414" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                    <text x="22" y="28" fill="#4ade80" fontSize="10" fontWeight="800" letterSpacing="0.08em">
                      PAST · VERIFIED & DELIVERED
                    </text>

                    <rect x="255" y="8" width="450" height="414" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                    <text x="270" y="28" fill="#fb923c" fontSize="10" fontWeight="800" letterSpacing="0.08em">
                      HAPPENING NOW · ACTIVE HEADQUARTERS
                    </text>

                    <rect x="715" y="8" width="235" height="414" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                    <text x="727" y="28" fill="#f87171" fontSize="10" fontWeight="800" letterSpacing="0.08em">
                      READY FIXES & FUTURE QUEUE
                    </text>
                  </g>

                  {/* Connecting Edges */}
                  <g className="mind-edges" aria-hidden="true">
                    <path d="M 235 110 C 290 110, 310 95, 375 95" stroke="url(#edge-active)" strokeWidth="2" fill="none" strokeDasharray="4 3" />
                    <path d="M 485 95 L 530 95" stroke="#f97316" strokeWidth="2" fill="none" />
                    <path d="M 235 280 C 290 280, 310 245, 375 245" stroke="url(#edge-delivered)" strokeWidth="2" fill="none" />
                    <path d="M 485 245 L 530 245" stroke="#f97316" strokeWidth="2.5" fill="none" />
                    <path d="M 690 95 C 740 95, 750 100, 805 100" stroke="url(#edge-blocker)" strokeWidth="2" fill="none" />
                    <path d="M 690 245 C 740 245, 750 225, 805 225" stroke="url(#edge-blocker)" strokeWidth="2" fill="none" />
                    <path d="M 690 245 C 740 245, 750 345, 805 345" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                  </g>

                  {/* 9 Interactive Mind Graph Nodes */}
                  <g className="mind-nodes">
                    {OPTION_C_MIND_NODES.map((node) => {
                      const isNodeActive = selectedMindNode === node.id;
                      const isNodeStepActive = selectedStep === node.step;
                      return (
                        <g
                          key={node.id}
                          className={"mind-node-group tone-" + node.tone + (isNodeActive ? " active" : "")}
                          transform={`translate(${node.x - 55}, ${node.y - 30})`}
                          onClick={() => {
                            setSelectedMindNode(node.id);
                            setSelectedStep(node.step);
                          }}
                          style={{ cursor: "pointer" }}
                          role="button"
                          tabIndex={0}
                          aria-label={node.title + " (" + node.tone + ")"}
                          aria-pressed={isNodeActive}
                        >
                          <rect
                            x="0"
                            y="0"
                            width="110"
                            height="60"
                            rx="8"
                            className="node-box"
                            strokeWidth={isNodeActive || isNodeStepActive ? "3" : "1.5"}
                          />
                          <text x="6" y="12" className="node-date-badge" fill="#94a3b8" fontSize="8" fontWeight="700">
                            {node.dateBadge}
                          </text>
                          <text x="6" y="26" className="node-title" fill="#f8fafc" fontSize="9.5" fontWeight="800">
                            {node.title.length > 17 ? node.title.slice(0, 16) + "…" : node.title}
                          </text>
                          <text x="6" y="38" className="node-subtitle" fill="#cbd5e1" fontSize="8">
                            {node.subtitle.length > 20 ? node.subtitle.slice(0, 19) + "…" : node.subtitle}
                          </text>
                          <text x="6" y="52" className="node-agent-badge" fill="#38bdf8" fontSize="7.5" fontWeight="700">
                            {node.agentBadge.length > 18 ? node.agentBadge.slice(0, 17) + "…" : node.agentBadge}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Integrated 8-Step Interactive Project Timeline Track */}
              <div className="mind-timeline-track" role="region" aria-label="8-Step Interactive Project Timeline">
                <div className="timeline-track-header">
                  <strong>8-STEP VERIFIED PROJECT TIMELINE TRACK</strong>
                  <span className="timeline-active-step-chip">
                    Step {selectedStep} of 8: {OPTION_C_TIMELINE_STEPS.find((s) => s.step === selectedStep)?.label}
                  </span>
                </div>
                <div className="timeline-steps-grid">
                  {OPTION_C_TIMELINE_STEPS.map((s) => {
                    const isStepActive = selectedStep === s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        className={"timeline-step-btn tone-" + s.tone + (isStepActive ? " chosen" : "")}
                        onClick={() => {
                          setSelectedStep(s.step);
                          setSelectedMindNode(s.nodeId);
                        }}
                        aria-pressed={isStepActive}
                      >
                        <span className="step-num">{s.step}</span>
                        <div className="step-content">
                          <strong className="step-label">{s.label}</strong>
                          <span className="step-desc">{s.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Evidence & Next Action Card */}
              <div className={"mind-evidence-card tone-" + activeNodeData.tone}>
                <div className="evidence-head">
                  <div className="evidence-title-group">
                    <span className={"evidence-badge badge-" + activeNodeData.tone}>
                      {activeNodeData.tone.toUpperCase()} · STEP {activeNodeData.step}
                    </span>
                    <h3>{activeNodeData.title}</h3>
                    <small>Timeline: {activeNodeData.dateBadge} · Owner: {activeNodeData.agentBadge}</small>
                  </div>
                  <div className="evidence-actions">
                    {activeNodeData.sourceUrl && (
                      <a
                        href={activeNodeData.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-link-btn"
                      >
                        Open Source Record ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void copyNodeEvidence(activeNodeData)}
                      className="evidence-copy-btn"
                    >
                      {copiedHandoff ? "✓ Evidence Copied" : "Copy Evidence 📋"}
                    </button>
                  </div>
                </div>
                <div className="evidence-body">
                  <div className="evidence-section">
                    <strong>Observed Evidence:</strong>
                    <p>{activeNodeData.evidenceSummary}</p>
                  </div>
                  <div className="evidence-section">
                    <strong>Single Required Next Action:</strong>
                    <p>{activeNodeData.nextAction}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Collapsible Vertical Tree List (< 640px) */}
              <div className="network-mobile-tree" role="region" aria-label="Mobile Mind Graph list">
                <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#fff" }}>Project Milestones & Node Status</h4>
                {OPTION_C_MIND_NODES.map((node) => (
                  <div
                    key={"mobile-" + node.id}
                    className={"tree-project-node tone-" + node.tone + (selectedMindNode === node.id ? " expanded chosen" : "")}
                    onClick={() => {
                      setSelectedMindNode(node.id);
                      setSelectedStep(node.step);
                    }}
                  >
                    <div className="tree-project-btn">
                      <span className={"tree-dot dot-" + node.tone} aria-hidden="true" />
                      <div className="tree-project-info">
                        <strong>{node.title}</strong>
                        <small>{node.dateBadge} · {node.agentBadge}</small>
                      </div>
                      <span className="tree-chevron" aria-hidden="true">
                        {selectedMindNode === node.id ? "▾" : "▸"}
                      </span>
                    </div>
                    {selectedMindNode === node.id && (
                      <div className="tree-children">
                        <p style={{ margin: "4px 0", fontSize: 11, color: "#cbd5e1" }}>{node.evidenceSummary}</p>
                        <p style={{ margin: "4px 0", fontSize: 11, color: "#93c5fd" }}><b>Next:</b> {node.nextAction}</p>
                        {node.sourceUrl && (
                          <a href={node.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#86efac", fontWeight: 700 }}>
                            Open Record ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* View 2: Repo Cluster & Task Drilldown Canvas */}
          {viewType === "repo_cluster" && (
            <div className="network-cluster-shell">
              <div className="network-toolbar">
                <div className="network-buttons">
                  <button type="button" onClick={() => setZoom(z=>bounded(z - 0.1, 0.35, 1.35))}>Zoom out</button>
                  <button type="button" onClick={() => setZoom(z=>bounded(z + 0.1, 0.35, 1.35))}>Zoom in</button>
                  <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(0.55); }}>Fit</button>
                  <button type="button" onClick={() => setFullscreen(v=>!v)} aria-pressed={fullscreen}>{fullscreen ? "Close full map" : "Expand map"}</button>
                  {isExpanded && <button type="button" onClick={collapseAll}>Collapse</button>}
                </div>
              </div>

              <div
                className={"network-viewport" + (fullscreen ? " network-fullscreen" : "")}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={stopPan}
                onPointerCancel={stopPan}
                role="region"
                aria-label="Pan the graph with a finger or mouse. Use zoom buttons to enlarge. Select project nodes to open related tasks."
              >
                <div className="network-stage" style={{ transform: "translate(-50%, -50%) translate(" + pan.x + "px, " + pan.y + "px) scale(" + zoom + ")" }}>
                  <svg className="network-edges" viewBox={"0 0 " + CW + " " + CH} aria-hidden="true">
                    <defs>
                      <linearGradient id="network-edge-color" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#65c5e9" />
                        <stop offset="1" stopColor="#b49afc" />
                      </linearGradient>
                    </defs>
                    {repoNodes.map((n) => (
                      <path key={n.id} d={path({ x: CX, y: CY }, n)} className={focus === n.id ? "network-edge-active" : "network-edge"} stroke={focus === n.id ? "url(#network-edge-color)" : "#56647e"} />
                    ))}
                    {workNodes.map((n) => (
                      <path key={n.id} d={path(activeNode!, n)} className={selectedWork === n.id ? "network-edge-active" : "network-edge-task"} stroke={selectedWork === n.id ? "#8aedd7" : "#6194b2"} />
                    ))}
                    {detailNodes.map((n) => (
                      <path key={n.id} d={path(activeNode!, n)} className={selectedWork === n.id ? "network-edge-active" : "network-edge-meta"} stroke={selectedWork === n.id ? "#f59e0b" : "#475569"} strokeDasharray="5 3" />
                    ))}
                  </svg>

                  <div className="network-hub" style={{ left: CX, top: CY }}>
                    <b>NBO</b>
                    <small>OPERATIONS HUB</small>
                    <span>{projects.length} connected repos</span>
                  </div>

                  {repoNodes.map((n) => {
                    const expanded = focus === n.id;
                    const { project } = n;
                    const freshLabel = projectFreshness(project);
                    return (
                      <button
                        type="button"
                        key={n.id}
                        style={{ left: n.x, top: n.y }}
                        className={"network-project" + (expanded ? " expanded" : "")}
                        onClick={() => expand(n)}
                        aria-expanded={expanded}
                        aria-label={(expanded ? "Collapse " : "Expand ") + project.name + " tasks"}
                      >
                        <span className="network-project-top">
                          <i aria-hidden="true">{expanded ? "−" : "+"}</i>
                          <small>{freshLabel}</small>
                        </span>
                        <strong>{project.name}</strong>
                        <span>{project.stale || project.limited ? "Source partial · inspect only" : (project.prs ?? "—") + " PRs · " + (project.issues ?? "—") + " issues"}</span>
                      </button>
                    );
                  })}

                  {workNodes.map((n) => {
                    const item = n.work!;
                    const isFailedJules = n.project.slug === "Command-Center-" && item.kind === "issue" && item.number === 18 && Boolean(assignment && (assignment.status?.startsWith("FAILED") || /FAILED/i.test(assignment.latestOutcome || "")));
                    return (
                      <button
                        type="button"
                        key={n.id}
                        style={{ left: n.x, top: n.y }}
                        className={"network-work" + (selectedWork === n.id ? " chosen" : "") + (item.draft ? " draft" : "") + (isFailedJules ? " failed" : "")}
                        aria-pressed={selectedWork === n.id}
                        onClick={() => {
                          setSelectedWork(n.id);
                          setCopied(false);
                          setPromptOpen(false);
                        }}
                      >
                        <small>{item.kind === "pr" ? "PULL REQUEST" : "ISSUE"} #{item.number}{item.draft ? " · DRAFT" : ""}{isFailedJules ? " · FAILED" : ""}</small>
                        <strong title={item.title}>{item.title}</strong>
                        <span>{isFailedJules ? "Failed assignment · do not dispatch" : item.kind === "pr" ? "Review code / proof" : "Open work · not complete"}</span>
                      </button>
                    );
                  })}

                  {detailNodes.map((n) => {
                    return (
                      <button
                        type="button"
                        key={n.id}
                        style={{ left: n.x, top: n.y }}
                        className={"network-work network-detail network-" + n.kind + (selectedWork === n.id ? " chosen" : "")}
                        aria-pressed={selectedWork === n.id}
                        onClick={() => {
                          setSelectedWork(n.id);
                          setCopied(false);
                          setPromptOpen(false);
                        }}
                      >
                        <small>{n.kind.toUpperCase()} · {n.status}</small>
                        <strong title={n.title}>{n.title}</strong>
                        <span>{n.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="network-below">
                <div className="network-legend">
                  <span><i className="network-key repo" /> Projects</span>
                  <span><i className="network-key task" /> Issues & PRs</span>
                  <span><i className="network-key draft" /> Draft / failed</span>
                  <span><i className="network-key meta" /> Assignment · Evidence · Deployment</span>
                </div>
                <p>Tap a project to expand or collapse its actual issues, PRs, agent assignments, verification evidence, and deployment status. Data reflects cached GitHub snapshots unless live-verified.</p>
              </div>

              {selectedProject && isExpanded && (
                <div className="network-project-inspector">
                  <div>
                    <small>EXPANDED PROJECT · {projectFreshness(selectedProject)}</small>
                    <strong>{selectedProject.name}</strong>
                    <p>{selectedProject.stale || selectedProject.limited ? "Partial/stale GitHub data; do not treat cached or unavailable information as freshly verified." : `${sourceWork.length} loaded issue/PR records plus connected assignment, evidence, and deployment nodes. Cached snapshot from ${fmt(selectedProject.fetchedAt)} — not a live agent execution stream.`}</p>
                  </div>
                  {maxPages > 1 && (
                    <div className="network-pagination">
                      <button type="button" disabled={safePage === 0} onClick={() => switchPage(safePage - 1)}>Previous tasks</button>
                      <span>{safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, sourceWork.length)} of {sourceWork.length}</span>
                      <button type="button" disabled={safePage === maxPages - 1} onClick={() => switchPage(safePage + 1)}>More tasks →</button>
                    </div>
                  )}
                  {!sourceWork.length && <p>No open issue/PR records are loaded for this project; this does not prove the repository is finished.</p>}
                </div>
              )}

              {chosen?.work && (
                <div className="network-work-inspector" aria-live="polite">
                  <div>
                    <small>SELECTED TASK · {workStatus(chosen.work, chosen.project.slug === "Command-Center-" && chosen.work.number === 18 ? assignment : null)}</small>
                    <h3>{chosen.work.title}</h3>
                    <p>{chosen.project.name} · Last source update {fmt(chosen.work.updatedAt)} · {projectFreshness(chosen.project)} · Agent activity UNKNOWN without provider evidence.</p>
                  </div>
                  <div className="network-task-actions">
                    <button type="button" className="next-mission-copy" onClick={() => void copy()}>{copied ? "Copied — ready to paste" : "Copy task handoff"}</button>
                    <button type="button" onClick={() => setPromptOpen((v) => !v)}>{promptOpen ? "Hide full handoff" : "Read full handoff"}</button>
                    <a href={chosen.work.url} target="_blank" rel="noopener noreferrer">Evidence source</a>
                  </div>
                  {promptOpen && <textarea aria-label="Full next agent handoff" readOnly value={prompt} rows={12} />}
                </div>
              )}

              {chosen && !chosen.work && (
                <div className="network-work-inspector" aria-live="polite">
                  <div>
                    <small>CONNECTED {chosen.kind.toUpperCase()} NODE · {chosen.status}</small>
                    <h3>{chosen.title}</h3>
                    <p>{chosen.project.name} · {chosen.subtitle} · Freshness: {chosen.freshness}. Cached or unverified state is never reported as freshly verified live execution.</p>
                  </div>
                  <div className="network-task-actions">
                    {chosen.url && <a href={chosen.url} target="_blank" rel="noopener noreferrer">Inspect source record ↗</a>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
