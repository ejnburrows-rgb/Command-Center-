"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import type {Project} from "./hub-data";
import {projectPath} from "./route-paths";
import {copyText,External} from "./hub-ui";
import {usePremium,paletteLabels,type Palette} from "./premium-preferences";
import LifecycleForceGraph, {
 type ForceGraphNode,
 type LifecycleStageSpec
} from "./lifecycle-force-graph";
import RechartsMilestoneTimeline from "./recharts-milestone-timeline";
import DailyFocusWidget from "./daily-focus-widget";
import ProjectProgressBar, {computeProjectTaskMetrics} from "./project-progress-bar";
import {
 LIFECYCLE_NODES,
 STUDIO_PROJECTS,
 buildMilestoneTimelineData
} from "./best-practices";

type MainCardSpec = {
 slug: string;
 title: string;
 shortRole: string;
 stageIndex: number; // 1..6
 stageLabel: string;
 progressPct: number;
 accentColor: string;
 sparkline: number[];
 statusLine: string;
 scopeRule: string;
 nextAiPrompt: string;
 quickLinks: {label: string; href: string}[];
};

const MAIN_SPECS: MainCardSpec[] = [
 {
  slug: "cartilla-de-gretel",
  title: "La Cartilla de Gretel",
  shortRole: "Spanish Early-Literacy App & AI Tutor",
  stageIndex: 4,
  stageLabel: "FINISH · 04 Visual & Mobile QA",
  progressPct: 68,
  accentColor: "#7aa2f7",
  sparkline: [32, 45, 52, 60, 64, 68, 72],
  statusLine: "Workbook & games active · PR #877 locked to TUTOR_1073_ONLY",
  scopeRule: "Owner Rule: Merge only AI Tutor #1073 fix (TUTOR_1073_ONLY).",
  nextAiPrompt: `You are working on La Cartilla de Gretel for Emilio José.
STRICT OWNER RULE (PR #877):
- Scope is locked to TUTOR_1073_ONLY. Do NOT bundle unrelated refactors or layout changes.
- Verify the AI Tutor fix works on phone (390x844) and desktop (1440x900).
- Report back in plain English: WORKS / DOES NOT WORK / NOT VERIFIED / NEXT.`,
  quickLinks: [
   {label: "Art Inventory", href: "/art-inventory"},
   {label: "Project View", href: projectPath("cartilla-de-gretel")}
  ]
 },
 {
  slug: "lany-books-web",
  title: "LANY Books",
  shortRole: "Publishing Storefront & Digital Catalog",
  stageIndex: 3,
  stageLabel: "BUILD · 03 Core Build",
  progressPct: 52,
  accentColor: "#cba6f7",
  sparkline: [20, 28, 35, 42, 48, 50, 52],
  statusLine: "Storefront structure ready · Prioritizing next book release page",
  scopeRule: "Next milestone: Visual mobile storefront & catalog verification.",
  nextAiPrompt: `You are working on LANY Books (lany-books-web) for Emilio José.
Inspect the current main branch and summarize in plain English:
1. Which book pages and storefront flows are live-verified.
2. Any broken images or mobile layout issues (390px).
3. The single highest-value improvement to finish next.`,
  quickLinks: [
   {label: "Lifecycle Web", href: "/best-practices"},
   {label: "Project View", href: projectPath("lany-books-web")}
  ]
 },
 {
  slug: "Command-Center-",
  title: "NBO Operations Hub",
  shortRole: "Personal AI Studio Headquarters",
  stageIndex: 6,
  stageLabel: "MAINTAIN · 06 Studio Active",
  progressPct: 92,
  accentColor: "#4ade80",
  sparkline: [50, 62, 70, 78, 85, 90, 92],
  statusLine: "Daily Focus Widget, Recharts Timeline & D3 Force Graph active",
  scopeRule: "All 8 repositories connected with read-only GitHub verification.",
  nextAiPrompt: `Read AGENTS.md and CLAUDE.md first.
Keep all status updates for Emilio José in plain English without engineering jargon:
1. State what currently works with real proof.
2. Propose one bounded deliverable with clear visual acceptance criteria.
3. Wait for owner approval before merging or deploying.`,
  quickLinks: [
   {label: "98 Prompts", href: "/prompts"},
   {label: "Lifecycle Web", href: "/best-practices"}
  ]
 }
];

const PALETTE_SWATCHES: Record<Palette, string> = {
 blue: "#7aa2f7",
 purple: "#cba6f7",
 teal: "#8be9fd",
 mono: "#5ea2ef"
};

const WEB_STATE_KEY = "nbo-lifecycle-web-v1";
const SYNC_EVENT = "nbo-lifecycle-sync";

export default function PlainEnglishHQ({
 projects,
 loading,
 busy
}:{
 projects:Project[];
 loading?:boolean;
 busy?:boolean;
 onOpen?:(s:string)=>void;
 onSection?:(t:any)=>void;
 refresh?:()=>void;
}) {
 const isSyncing = Boolean(loading || busy);
 const {palette, setPalette, appearance, setAppearance} = usePremium();
 const [copiedSlug, setCopiedSlug] = useState<string>("");
 const [selectedProject, setSelectedProject] = useState<string>("cartilla-de-gretel");
 const [selectedStageId, setSelectedStageId] = useState<string>("stage-04");
 const [inspectedNode, setInspectedNode] = useState<ForceGraphNode | null>(null);
 const [webChecks, setWebChecks] = useState<Record<string, boolean>>({});
 const [showAllProjects, setShowAllProjects] = useState(false);

 useEffect(() => {
  function loadState() {
   try {
    const saved = JSON.parse(localStorage.getItem(WEB_STATE_KEY) || "{}");
    if (saved && typeof saved === "object") setWebChecks(saved);
   } catch {}
  }
  loadState();
  window.addEventListener(SYNC_EVENT, loadState);
  window.addEventListener("storage", loadState);
  return () => {
   window.removeEventListener(SYNC_EVENT, loadState);
   window.removeEventListener("storage", loadState);
  };
 }, []);

 const projectMap = new Map(projects.map(p => [p.slug.toLowerCase(), p]));
 const mainSlugs = new Set(MAIN_SPECS.map(s => s.slug.toLowerCase()));
 const otherProjects = projects.filter(p => !mainSlugs.has(p.slug.toLowerCase()));
 const activeProjSpec = STUDIO_PROJECTS.find(p => p.slug === selectedProject) || STUDIO_PROJECTS[0];

 function isCheckDoneForProject(projSlug: string, checkId: string, idx: number, stageIdx: number) {
  const key = `${projSlug}:${checkId}`;
  if (key in webChecks) return !!webChecks[key];
  const proj = STUDIO_PROJECTS.find(p => p.slug === projSlug) || STUDIO_PROJECTS[0];
  const defaultStagePct = proj.defaultPct[stageIdx] || 0;
  const defaultChecks = Math.round((defaultStagePct / 100) * 3);
  return idx < defaultChecks;
 }

 function isStageCheckDone(checkId: string, idx: number, stageIdx: number) {
  return isCheckDoneForProject(selectedProject, checkId, idx, stageIdx);
 }

 function getNodeProgressForProject(projSlug: string, stage: LifecycleStageSpec, stageIdx: number) {
  const doneCount = stage.checkpoints.filter((c, i) =>
   isCheckDoneForProject(projSlug, c.id, i, stageIdx)
  ).length;
  const total = stage.checkpoints.length;
  const pct = Math.round((doneCount / total) * 100);
  return {doneCount, total, pct};
 }

 function handleSelectGraphNode(node: ForceGraphNode) {
  setInspectedNode(node);
  if (node.projectSlug) setSelectedProject(node.projectSlug);
  if (node.stageId) setSelectedStageId(node.stageId);
 }

 function handleToggleTask(
  projSlug: string,
  stageId: string,
  checkId: string,
  chkIdx: number,
  stageIdx: number
 ) {
  setSelectedProject(projSlug);
  setSelectedStageId(stageId);
  const key = `${projSlug}:${checkId}`;
  const current = isCheckDoneForProject(projSlug, checkId, chkIdx, stageIdx);
  const next = {...webChecks, [key]: !current};
  setWebChecks(next);
  try {
   localStorage.setItem(WEB_STATE_KEY, JSON.stringify(next));
   window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {}
 }

 async function handleCopy(key: string, text: string) {
  if (await copyText(text)) {
   setCopiedSlug(key);
   setTimeout(() => setCopiedSlug(""), 2000);
  }
 }

 const timelineData = useMemo(() => {
  return buildMilestoneTimelineData(
   activeProjSpec,
   LIFECYCLE_NODES,
   getNodeProgressForProject
  );
 }, [selectedProject, webChecks, activeProjSpec]);

 return (
  <section className="hq-studio" aria-label="Minimalist Visual Command Center">
   {/* Minimalist Single-Line Studio Bar */}
   <div className="hq-minimal-topbar">
    <div className="hq-minimal-title">
     <span className="hq-ide-dot" />
     <strong>NBO Visual Command Center</strong>
     <span className="hq-minimal-meta">
      {isSyncing ? "Syncing..." : `${projects.length} repos · 98 prompts`}
     </span>
    </div>

    <div className="hq-minimal-controls">
     <div className="hq-theme-dots" role="group" aria-label="IDE Theme">
      {(["blue", "purple", "teal", "mono"] as Palette[]).map(p => (
       <button
        key={p}
        type="button"
        className={"hq-theme-pill " + (palette === p ? "active" : "")}
        onClick={() => setPalette(p)}
        aria-pressed={palette === p}
        title={paletteLabels[p]}
       >
        <i style={{background: PALETTE_SWATCHES[p]}} />
        <span>{paletteLabels[p]}</span>
       </button>
      ))}
      <button
       type="button"
       className="hq-theme-pill"
       onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")}
      >
       <span>{appearance === "dark" ? "☾" : "☀"}</span>
      </button>
     </div>
     <div className="hq-minimal-nav">
      <Link className="btn primary" href="/best-practices">Lifecycle &amp; Timeline</Link>
      <Link className="btn" href="/prompts">Prompts (98)</Link>
      <Link className="btn" href="/art-inventory">Art Inventory</Link>
     </div>
    </div>
   </div>

   {/* 1. DAILY FOCUS DASHBOARD WIDGET — Single Summary View of High-Priority Next Actions Across All Projects */}
   <DailyFocusWidget
    studioProjects={STUDIO_PROJECTS}
    stages={LIFECYCLE_NODES}
    liveProjects={projects}
    selectedProject={selectedProject}
    isCheckDoneForProject={isCheckDoneForProject}
    onSelectProjectStage={(projSlug, stageId) => {
     setSelectedProject(projSlug);
     setSelectedStageId(stageId);
    }}
    onToggleTask={handleToggleTask}
    onCopyPrompt={handleCopy}
    copiedKey={copiedSlug}
   />

   {/* 2. VISUAL GRAPH 1: Horizontal Recharts Milestone, Due-Date & Status Progression Timeline */}
   <RechartsMilestoneTimeline
    project={activeProjSpec}
    stages={LIFECYCLE_NODES}
    selectedStageId={selectedStageId}
    timelineData={timelineData}
    isStageCheckDone={isStageCheckDone}
    onSelectStage={stageId => setSelectedStageId(stageId)}
    onToggleCheck={(stageId, checkId, idx, stageIdx) =>
     handleToggleTask(selectedProject, stageId, checkId, idx, stageIdx)
    }
    onCopyPrompt={handleCopy}
    copiedKey={copiedSlug}
   />

   {/* 3. VISUAL GRAPH 2: Interactive D3.js Force-Directed Lifecycle & Business Operations Web */}
   <div className="hq-timeline-card">
    <div className="hq-card-bar">
     <div>
      <span className="hq-stage-code">D3.JS FORCE-DIRECTED LIFECYCLE &amp; OPERATIONS WEB</span>
      <h2>
       {inspectedNode
        ? `${inspectedNode.fullTitle} — ${inspectedNode.subtitle}`
        : "Projects as central nodes with interconnected stages & tasks branching out"}
      </h2>
     </div>
     <Link className="btn" href="/best-practices">Open Full Lifecycle Workspace →</Link>
    </div>

    <LifecycleForceGraph
     projects={STUDIO_PROJECTS}
     stages={LIFECYCLE_NODES}
     selectedProject={selectedProject}
     selectedNodeId={selectedStageId}
     isCheckDoneForProject={isCheckDoneForProject}
     getNodeProgressForProject={getNodeProgressForProject}
     onSelectNode={handleSelectGraphNode}
     onToggleTask={handleToggleTask}
    />
   </div>

   {/* 4. VISUAL GRAPH 3: 3 Minimalist Project Cards with Live Task-Driven Progress Bars, Radial Donut Charts & Sparklines */}
   <div className="hq-main-grid">
    {MAIN_SPECS.map(spec => {
     const live = projectMap.get(spec.slug.toLowerCase());
     const openPrs = live?.prs ?? "—";
     const openIssues = live?.issues ?? "—";
     const taskMetrics = computeProjectTaskMetrics(spec.slug, webChecks, spec.accentColor);
     const livePct = taskMetrics.overallPct;
     const radius = 24;
     const circumference = 2 * Math.PI * radius;
     const dashOffset = circumference - (livePct / 100) * circumference;

     return (
      <article className="hq-visual-card" key={spec.slug}>
       <div className="hq-visual-top">
        <div className="hq-radial-wrap" aria-label={`${livePct}% lifecycle completion`}>
         <svg width="62" height="62" viewBox="0 0 62 62">
          <circle
           cx="31"
           cy="31"
           r={radius}
           fill="none"
           stroke="var(--ui-border)"
           strokeWidth="5"
          />
          <circle
           cx="31"
           cy="31"
           r={radius}
           fill="none"
           stroke={spec.accentColor}
           strokeWidth="5"
           strokeLinecap="round"
           strokeDasharray={circumference}
           strokeDashoffset={dashOffset}
           transform="rotate(-90 31 31)"
          />
          <text
           x="31"
           y="35"
           textAnchor="middle"
           fill="var(--ui-text)"
           fontSize="12"
           fontWeight="750"
           fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
           {livePct}%
          </text>
         </svg>
        </div>

        <div className="hq-visual-titles">
         <span className="hq-stage-code" style={{color: spec.accentColor}}>
          {taskMetrics.phaseLabel} · Stage {taskMetrics.activeStage.code}
         </span>
         <h3>{spec.title}</h3>
         <p>{spec.shortRole}</p>
        </div>

        <div className="hq-sparkline-box" title="Stage progression momentum">
         <svg width="58" height="32" viewBox="0 0 58 32" aria-hidden="true">
          {spec.sparkline.map((val, i) => {
           const bh = Math.max(4, Math.round((val / 100) * 28));
           return (
            <rect
             key={i}
             x={i * 8}
             y={30 - bh}
             width="5"
             height={bh}
             rx="1.5"
             fill={i === spec.sparkline.length - 1 ? spec.accentColor : "var(--ui-border)"}
            />
           );
          })}
         </svg>
         <small>{openPrs} PRs · {openIssues} Issues</small>
        </div>
       </div>

       {/* Interactive, Lightweight Task-Driven Progress Bar */}
       <ProjectProgressBar slug={spec.slug} accentColor={spec.accentColor} />

       <div className="hq-visual-status">
        <p>{spec.statusLine}</p>
        <small>{spec.scopeRule}</small>
       </div>

       <div className="hq-visual-actions">
        <button
         type="button"
         className="btn primary"
         onClick={() => handleCopy(spec.slug, spec.nextAiPrompt)}
        >
         {copiedSlug === spec.slug ? "✓ Copied!" : "Copy next AI instruction"}
        </button>
        {spec.quickLinks.map(l => (
         <Link key={l.label} href={l.href} className="btn">
          {l.label}
         </Link>
        ))}
       </div>
      </article>
     );
    })}
   </div>

   {otherProjects.length > 0 && (
    <div className="hq-more-projects">
     <button
      type="button"
      className="btn"
      onClick={() => setShowAllProjects(!showAllProjects)}
      aria-expanded={showAllProjects}
     >
      {showAllProjects
       ? `Hide other ${otherProjects.length} repositories`
       : `+ View ${otherProjects.length} more repositories (OTTO CRM, Art Vault, Business Hub...)`}
     </button>
     {showAllProjects && (
      <div className="hq-secondary-grid">
       {otherProjects.map(p => (
        <div className="hq-mini-card" key={p.slug} style={{flexDirection: "column", alignItems: "stretch", gap: 10}}>
         <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10}}>
          <div>
           <strong>{p.name}</strong>
           <small style={{display: "block"}}>
            {p.updatedAt ? p.updatedAt.slice(0, 10) : "Unknown"} · {p.prs ?? "—"} PRs
           </small>
          </div>
          <div className="hq-mini-actions">
           <Link className="btn" href={projectPath(p.slug)}>Open</Link>
           <External className="btn" href={p.url}>GitHub</External>
          </div>
         </div>
         <ProjectProgressBar slug={p.slug} compact={true} />
        </div>
       ))}
      </div>
     )}
    </div>
   )}
  </section>
 );
}
