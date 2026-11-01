"use client";
import {useState} from "react";
import Link from "next/link";
import type {Project} from "./hub-data";
import {projectPath} from "./route-paths";
import {copyText,External} from "./hub-ui";
import {usePremium,paletteLabels,type Palette} from "./premium-preferences";

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
  statusLine: "98 prompts indexed · Visual timeline & lifecycle web active",
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

const TIMELINE_STAGES = [
 {
  step: 1,
  code: "01",
  name: "Idea & Spec",
  desc: "AI interviews you & writes a 1-page plan before any code.",
  prompt: `Act as my Senior Product Architect. Do NOT write code yet. Ask me up to 4 plain-English questions to clarify my goal, target user, and visual expectations, then write a 1-page implementation spec.`
 },
 {
  step: 2,
  code: "02",
  name: "Rules & Repo",
  desc: "Load CLAUDE.md / AGENTS.md & reuse existing repo work.",
  prompt: `Read CLAUDE.md and AGENTS.md before touching any file. Inspect the existing repository, open PRs, and branches so we reuse existing work and never create duplicate dashboards.`
 },
 {
  step: 3,
  code: "03",
  name: "Core Build",
  desc: "Build one bounded feature end-to-end with real data.",
  prompt: `Complete one bounded, working feature end-to-end. Keep technical complexity hidden, use real connected data, and verify everything compiles cleanly.`
 },
 {
  step: 4,
  code: "04",
  name: "Visual QA",
  desc: "Verify 390px phone & 1440px desktop screens visually.",
  prompt: `Run a full Visual & Mobile QA pass on both 390x844 phone and 1440x900 desktop viewports. Check for clipped buttons, horizontal overflow, or broken images.`
 },
 {
  step: 5,
  code: "05",
  name: "Security & Backup",
  desc: "Keep API keys server-side & verify JSON backup export.",
  prompt: `Audit this change for security and data safety: confirm zero API keys or private notes are exposed in client code, and confirm user data is backed up.`
 },
 {
  step: 6,
  code: "06",
  name: "Launch Gate",
  desc: "Owner proof checkpoint before merge or live deploy.",
  prompt: `Prepare the Owner Release Checkpoint in plain English: WORKS (with proof) / DOES NOT WORK / NOT VERIFIED / NEXT (one accountable decision for Emilio José).`
 }
];

const PALETTE_SWATCHES: Record<Palette, string> = {
 blue: "#7aa2f7",
 purple: "#cba6f7",
 teal: "#8be9fd",
 mono: "#5ea2ef"
};

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
 const [activeStep, setActiveStep] = useState<number>(4);
 const [showAllProjects, setShowAllProjects] = useState(false);

 const projectMap = new Map(projects.map(p => [p.slug.toLowerCase(), p]));
 const mainSlugs = new Set(MAIN_SPECS.map(s => s.slug.toLowerCase()));
 const otherProjects = projects.filter(p => !mainSlugs.has(p.slug.toLowerCase()));
 const selectedStage = TIMELINE_STAGES.find(s => s.step === activeStep) || TIMELINE_STAGES[3];

 async function handleCopy(key: string, text: string) {
  if (await copyText(text)) {
   setCopiedSlug(key);
   setTimeout(() => setCopiedSlug(""), 2000);
  }
 }

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
      <Link className="btn" href="/best-practices">Lifecycle Web</Link>
      <Link className="btn" href="/prompts">Prompts (98)</Link>
      <Link className="btn" href="/art-inventory">Art Inventory</Link>
     </div>
    </div>
   </div>

   {/* VISUAL GRAPH 1: Project Lifecycle Timeline & Swimlane Formation */}
   <div className="hq-timeline-card">
    <div className="hq-card-bar">
     <div>
      <span className="hq-stage-code">VISUAL PROJECT TIMELINE &amp; STAGE FORMATION</span>
      <h2>Where every project stands from Idea (01) to Launch (06)</h2>
     </div>
     <Link className="btn" href="/best-practices">Open Full Mind-Map Web →</Link>
    </div>

    {/* Horizontal Interactive SVG Timeline Formation */}
    <div className="hq-timeline-svg-wrap">
     <svg
      viewBox="0 0 960 225"
      className="hq-timeline-svg"
      role="img"
      aria-label="Project lifecycle timeline formation across 6 stages"
     >
      {/* Vertical stage guide columns */}
      {TIMELINE_STAGES.map((s, idx) => {
       const x = 190 + idx * 142;
       const isSelected = s.step === activeStep;
       return (
        <g
         key={s.code}
         className="tl-stage-col"
         onClick={() => setActiveStep(s.step)}
         style={{cursor: "pointer"}}
        >
         <line
          x1={x}
          y1={38}
          x2={x}
          y2={205}
          stroke={isSelected ? "var(--ui-accent)" : "var(--ui-border)"}
          strokeWidth={isSelected ? "2" : "1"}
          strokeDasharray={isSelected ? undefined : "3 3"}
         />
         <rect
          x={x - 56}
          y={6}
          width={112}
          height={28}
          rx={6}
          fill={isSelected ? "var(--ui-raised)" : "var(--ui-inset)"}
          stroke={isSelected ? "var(--ui-accent)" : "var(--ui-border)"}
          strokeWidth={isSelected ? "1.8" : "1"}
         />
         <text
          x={x}
          y={24}
          textAnchor="middle"
          fill={isSelected ? "var(--ui-accent)" : "var(--ui-text)"}
          fontSize="11"
          fontWeight="700"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
         >
          {s.code} · {s.name}
         </text>
        </g>
       );
      })}

      {/* Swimlane Tracks for the 3 Core Projects */}
      {MAIN_SPECS.map((proj, rowIdx) => {
       const y = 74 + rowIdx * 52;
       const startX = 190;
       const endX = 190 + (proj.stageIndex - 1) * 142;
       const fullEndX = 190 + 5 * 142;
       return (
        <g key={proj.slug}>
         {/* Project Label on Left */}
         <text
          x={14}
          y={y - 4}
          fill="var(--ui-text)"
          fontSize="12.5"
          fontWeight="700"
         >
          {proj.title}
         </text>
         <text
          x={14}
          y={y + 12}
          fill="var(--ui-muted)"
          fontSize="10.5"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
         >
          {proj.progressPct}% · Stage 0{proj.stageIndex}
         </text>

         {/* Background Full Track */}
         <line
          x1={startX}
          y1={y}
          x2={fullEndX}
          y2={y}
          stroke="var(--ui-border)"
          strokeWidth="6"
          strokeLinecap="round"
         />

         {/* Active Filled Timeline Progress Bar */}
         <line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke={proj.accentColor}
          strokeWidth="6"
          strokeLinecap="round"
         />

         {/* Milestone Nodes along the project's timeline */}
         {TIMELINE_STAGES.map((s, idx) => {
          const cx = 190 + idx * 142;
          const reached = s.step <= proj.stageIndex;
          const isCurrent = s.step === proj.stageIndex;
          return (
           <g
            key={s.code}
            onClick={() => setActiveStep(s.step)}
            style={{cursor: "pointer"}}
           >
            {isCurrent && (
             <circle
              cx={cx}
              cy={y}
              r={12}
              fill={proj.accentColor}
              opacity={0.22}
             />
            )}
            <circle
             cx={cx}
             cy={y}
             r={isCurrent ? 7 : 4.5}
             fill={reached ? proj.accentColor : "var(--ui-panel)"}
             stroke={reached ? proj.accentColor : "var(--ui-border)"}
             strokeWidth="2"
            />
           </g>
          );
         })}
        </g>
       );
      })}
     </svg>
    </div>

    {/* Compact 1-Line Stage Prompt Bar under Timeline */}
    <div className="hq-timeline-promptbar">
     <div className="hq-timeline-prompt-info">
      <span className="hq-stage-code">STAGE {selectedStage.code} · {selectedStage.name.toUpperCase()}</span>
      <p>{selectedStage.desc}</p>
     </div>
     <div className="hq-timeline-prompt-actions">
      <button
       type="button"
       className="btn primary"
       onClick={() => handleCopy("tl-" + selectedStage.code, selectedStage.prompt)}
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
        {/* Radial Progress Ring Graph */}
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

        {/* Mini 7-Bar Momentum Sparkline Graph */}
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

       {/* Single concise status line instead of 3 text paragraphs */}
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

   {/* Optional Compact Drawer for Other 5 Repositories */}
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
