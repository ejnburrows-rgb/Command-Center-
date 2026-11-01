"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {Project} from "./hub-data";
import {projectPath} from "./route-paths";
import {copyText,External} from "./hub-ui";
import {usePremium,paletteLabels,type Palette} from "./premium-preferences";
import LifecycleForceGraph, {
 type ForceGraphNode,
 type LifecycleStageSpec,
 type StudioProjectItem
} from "./lifecycle-force-graph";
import {LIFECYCLE_NODES} from "./best-practices";

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
  stageLabel: "04 · Visual & Mobile QA",
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
  stageLabel: "03 · Core Build",
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
  stageLabel: "06 · Studio Active",
  progressPct: 92,
  accentColor: "#4ade80",
  sparkline: [50, 62, 70, 78, 85, 90, 92],
  statusLine: "98 prompts indexed · D3 Force Graph & Recharts Timeline active",
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

const HOME_PROJECTS: StudioProjectItem[] = [
 {
  slug: "cartilla-de-gretel",
  shortName: "Cartilla",
  name: "La Cartilla de Gretel",
  color: "#7aa2f7",
  category: "EdTech · Literacy",
  defaultPct: [100, 100, 100, 67, 33, 0],
  dueDates: ["Oct 20", "Oct 26", "Nov 02", "Nov 08", "Nov 14", "Nov 20"],
  milestones: [
   "Workbook & Game Spec Locked",
   "Shared Canon & #877 Scope Rule",
   "8 Phonics Games & Audio Engine",
   "390px Phone & Art Inventory QA",
   "Tutor API Key & Privacy Audit",
   "Parent/Student Production Launch"
  ]
 },
 {
  slug: "lany-books-web",
  shortName: "LANY Books",
  name: "LANY Books",
  color: "#cba6f7",
  category: "Publishing · Commerce",
  defaultPct: [100, 100, 67, 33, 0, 0],
  dueDates: ["Oct 24", "Oct 30", "Nov 07", "Nov 15", "Nov 22", "Nov 30"],
  milestones: [
   "Catalog & Reader Journey Spec",
   "Storefront Repo & Brand Rules",
   "Book Showcase & Checkout Flow",
   "Mobile Reader & Cover Image QA",
   "Payment & Customer Data Guard",
   "Public Catalog Release"
  ]
 },
 {
  slug: "Command-Center-",
  shortName: "NBO Hub",
  name: "NBO Operations Hub",
  color: "#4ade80",
  category: "AI Studio · Control",
  defaultPct: [100, 100, 100, 100, 100, 67],
  dueDates: ["Oct 18", "Oct 22", "Oct 28", "Nov 01", "Nov 04", "Nov 06"],
  milestones: [
   "Plain-English Studio Architecture",
   "CLAUDE.md & 98 Library Prompts",
   "D3 Force Graph & Recharts Timeline",
   "Desktop IDE Themes & Mobile QA",
   "Read-Only GitHub & JSON Backup",
   "Owner Release Sign-Off"
  ]
 },
 {
  slug: "otto-crm",
  shortName: "OTTO CRM",
  name: "OTTO CRM",
  color: "#8be9fd",
  category: "Automation · CRM",
  defaultPct: [100, 67, 33, 0, 0, 0],
  dueDates: ["Nov 01", "Nov 09", "Nov 18", "Nov 25", "Dec 02", "Dec 10"],
  milestones: [
   "Lead & Pipeline Blueprint",
   "Diaflow & Repo Architecture",
   "Contact & Automation Core",
   "Mobile Pipeline View QA",
   "Customer Data Encryption Check",
   "Live CRM Rollout"
  ]
 },
 {
  slug: "art-vault",
  shortName: "Art Vault",
  name: "Art & Media Vault",
  color: "#f59e0b",
  category: "Creative · Assets",
  defaultPct: [100, 100, 67, 67, 33, 0],
  dueDates: ["Oct 22", "Oct 29", "Nov 05", "Nov 12", "Nov 19", "Nov 26"],
  milestones: [
   "Illustration & Audio Taxonomy",
   "Canonical Asset Branch Rules",
   "Visual Inventory & Tagging",
   "10 Flagged Workbook Subjects QA",
   "Asset Backup & Checksum Gate",
   "Production CDN Sync"
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
  try {
   const saved = JSON.parse(localStorage.getItem(WEB_STATE_KEY) || "{}");
   if (saved && typeof saved === "object") setWebChecks(saved);
  } catch {}
 }, []);

 const projectMap = new Map(projects.map(p => [p.slug.toLowerCase(), p]));
 const mainSlugs = new Set(MAIN_SPECS.map(s => s.slug.toLowerCase()));
 const otherProjects = projects.filter(p => !mainSlugs.has(p.slug.toLowerCase()));
 const selectedStage = LIFECYCLE_NODES.find(s => s.id === selectedStageId) || LIFECYCLE_NODES[3];
 const activeProjSpec = HOME_PROJECTS.find(p => p.slug === selectedProject) || HOME_PROJECTS[0];

 function isCheckDoneForProject(projSlug: string, checkId: string, idx: number, stageIdx: number) {
  const key = `${projSlug}:${checkId}`;
  if (key in webChecks) return !!webChecks[key];
  const proj = HOME_PROJECTS.find(p => p.slug === projSlug) || HOME_PROJECTS[0];
  const defaultStagePct = proj.defaultPct[stageIdx] || 0;
  const defaultChecks = Math.round((defaultStagePct / 100) * 3);
  return idx < defaultChecks;
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
  } catch {}
 }

 async function handleCopy(key: string, text: string) {
  if (await copyText(text)) {
   setCopiedSlug(key);
   setTimeout(() => setCopiedSlug(""), 2000);
  }
 }

 const activePromptObj = selectedStage.readyPrompts[0];

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

   {/* VISUAL GRAPH 1: Interactive D3.js Force-Directed Lifecycle & Business Operations Web */}
   <div className="hq-timeline-card">
    <div className="hq-card-bar">
     <div>
      <span className="hq-stage-code">D3.JS FORCE-DIRECTED LIFECYCLE &amp; OPERATIONS WEB</span>
      <h2>Projects as central nodes with interconnected stages &amp; tasks branching out</h2>
     </div>
     <Link className="btn" href="/best-practices">Open Full Lifecycle Inspector &amp; Recharts Timeline →</Link>
    </div>

    <LifecycleForceGraph
     projects={HOME_PROJECTS}
     stages={LIFECYCLE_NODES}
     selectedProject={selectedProject}
     selectedNodeId={selectedStageId}
     isCheckDoneForProject={isCheckDoneForProject}
     getNodeProgressForProject={getNodeProgressForProject}
     onSelectNode={handleSelectGraphNode}
     onToggleTask={handleToggleTask}
    />

    {/* Live Node Details & 1-Click Prompt Bar under D3 Force Graph */}
    <div className="hq-timeline-promptbar">
     <div className="hq-timeline-prompt-info">
      <span className="hq-stage-code">
       {inspectedNode
        ? `${inspectedNode.kind.toUpperCase()} SELECTED · ${inspectedNode.fullTitle}`
        : `${activeProjSpec.name.toUpperCase()} · STAGE ${selectedStage.code} (${selectedStage.title.toUpperCase()})`}
      </span>
      <p>
       {inspectedNode
        ? `${inspectedNode.subtitle}${inspectedNode.dueDate ? ` · Due ${inspectedNode.dueDate}` : ""}`
        : selectedStage.plainWhy}
      </p>
     </div>
     <div className="hq-timeline-prompt-actions">
      <button
       type="button"
       className="btn primary"
       onClick={() => handleCopy("tl-" + selectedStage.code, activePromptObj.prompt)}
      >
       {copiedSlug === "tl-" + selectedStage.code
        ? "✓ Copied Stage Prompt!"
        : `Copy Stage ${selectedStage.code} Ready-to-Start Prompt`}
      </button>
     </div>
    </div>
   </div>

   {/* VISUAL GRAPH 2: 3 Minimalist Project Cards with Radial Donut Charts & Activity Sparklines */}
   <div className="hq-main-grid">
    {MAIN_SPECS.map(spec => {
     const live = projectMap.get(spec.slug.toLowerCase());
     const openPrs = live?.prs ?? "—";
     const openIssues = live?.issues ?? "—";
     const radius = 24;
     const circumference = 2 * Math.PI * radius;
     const dashOffset = circumference - (spec.progressPct / 100) * circumference;

     return (
      <article className="hq-visual-card" key={spec.slug}>
       <div className="hq-visual-top">
        <div className="hq-radial-wrap" aria-label={`${spec.progressPct}% lifecycle completion`}>
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
           {spec.progressPct}%
          </text>
         </svg>
        </div>

        <div className="hq-visual-titles">
         <span className="hq-stage-code" style={{color: spec.accentColor}}>
          {spec.stageLabel}
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
        <div className="hq-mini-card" key={p.slug}>
         <div>
          <strong>{p.name}</strong>
          <small>
           {p.updatedAt ? p.updatedAt.slice(0, 10) : "Unknown"} · {p.prs ?? "—"} PRs
          </small>
         </div>
         <div className="hq-mini-actions">
          <Link className="btn" href={projectPath(p.slug)}>Open</Link>
          <External className="btn" href={p.url}>GitHub</External>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   )}
  </section>
 );
}
