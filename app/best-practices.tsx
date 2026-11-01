"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {
 ResponsiveContainer,
 ComposedChart,
 Area,
 Bar,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Cell,
 ReferenceLine
} from "recharts";
import {stages} from "./hub-data";
import {copyText} from "./hub-ui";

type StudioProjectSpec = {
 slug: string;
 shortName: string;
 name: string;
 color: string;
 category: string;
 defaultPct: number[];
 dueDates: string[];
 milestones: string[];
};

const STUDIO_PROJECTS: StudioProjectSpec[] = [
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
   "Recharts Timeline & Radial Mind-Map",
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

const CHECKS_KEY = "nbo-checks";
const WEB_STATE_KEY = "nbo-lifecycle-web-v1";
const BRIEFS_KEY = "nbo-project-briefs-v1";
const LESSONS_KEY = "nbo-lessons-learned-v1";

type MasterBrief = {
 projectSlug: string;
 goal: string;
 audience: string;
 mustHave: string;
 outOfScope: string;
 visualCheck: string;
 updatedAt: string;
};

type LessonEntry = {
 id: string;
 project: string;
 rule: string;
 why: string;
 createdAt: string;
};

type WebStageNode = {
 id: string;
 code: string;
 title: string;
 subtitle: string;
 firmRole: string;
 angleDeg: number; // Radial angle in degrees around center
 targetPct: number;
 plainWhy: string;
 checkpoints: {id: string; short: string; label: string}[];
 readyPrompts: {id: string; title: string; when: string; prompt: string}[];
 libraryKeywords: string[];
};

const LIFECYCLE_NODES: WebStageNode[] = [
 {
  id: "stage-01",
  code: "01",
  title: "Idea & Spec",
  subtitle: "Interview & 1-Page Plan",
  firmRole: "Product Architect",
  angleDeg: -90, // Top (12 o'clock)
  targetPct: 100,
  plainWhy: "Have AI interview you first and write a 1-page plain-English spec before touching code.",
  checkpoints: [
   {id: "s1-c1", short: "2-Line Goal", label: "Goal & user stated in 2 plain sentences"},
   {id: "s1-c2", short: "Scope Lock", label: "Scope lock: listed what NOT to touch"},
   {id: "s1-c3", short: "Repo Check", label: "Checked existing GitHub branches & PRs"}
  ],
  readyPrompts: [
   {
    id: "p-interview",
    title: "Let AI Interview Me First",
    when: "Start of any new feature or project",
    prompt: `Act as my Senior Product Architect. Do NOT write code yet.
1. Ask me up to 4 plain-English questions to clarify what I want to build, who will use it, and what "done" looks like visually.
2. Point out any simpler alternatives.
3. Write a 1-page Implementation Spec in plain English for my approval.`
   },
   {
    id: "p-spec-before-code",
    title: "Demand 1-Page Spec Before Code",
    when: "Before allowing AI to edit files",
    prompt: `Before modifying any files, inspect the repository and write a short plain-English Implementation Plan listing the exact visible goal, files to touch, and how we will verify phone (390px) and desktop (1440px).`
   }
  ],
  libraryKeywords: ["interview", "spec", "kickoff", "07_project_kickoff", "15_compare_options"]
 },
 {
  id: "stage-02",
  code: "02",
  title: "Rules & Setup",
  subtitle: "CLAUDE.md & Repo Guard",
  firmRole: "Systems Architect",
  angleDeg: -30, // 2 o'clock
  targetPct: 100,
  plainWhy: "Load CLAUDE.md and anti-agreement rules so AI challenges bad ideas and reuses existing work.",
  checkpoints: [
   {id: "s2-c1", short: "CLAUDE.md", label: "CLAUDE.md & AGENTS.md loaded in session"},
   {id: "s2-c2", short: "Anti-Agree", label: "Anti-agreement rule active (honest critique)"},
   {id: "s2-c3", short: "Reuse Work", label: "Reusing existing repo & open PRs"}
  ],
  readyPrompts: [
   {
    id: "p-project-instructions",
    title: "Load Permanent Studio Rules (00 + 04 Anti-Agreement)",
    when: "First message of a coding session",
    prompt: `Read CLAUDE.md and AGENTS.md first.
1. Do not automatically agree with me—if an idea adds unnecessary complexity, tell me plainly.
2. Reuse existing repositories, components, and open PRs.
3. Keep technical complexity hidden and report in plain English.`
   },
   {
    id: "p-continue-project",
    title: "Resume Project Safely (08_CONTINUE_PROJECT)",
    when: "Returning to a project or switching AI tools",
    prompt: `Inspect git status, latest commits on main, and open PRs. Summarize in plain English what is verified, what is in progress, and the single safest next step.`
   }
  ],
  libraryKeywords: ["00_project_instructions", "04_anti_agreement", "08_continue_project"]
 },
 {
  id: "stage-03",
  code: "03",
  title: "Core Build",
  subtitle: "Features, Games & CRM",
  firmRole: "Full-Stack Developer",
  angleDeg: 30, // 4 o'clock
  targetPct: 85,
  plainWhy: "Build one bounded feature end-to-end with real data and zero broken neighbors.",
  checkpoints: [
   {id: "s3-c1", short: "Bounded Feature", label: "One bounded deliverable built end-to-end"},
   {id: "s3-c2", short: "Real Data", label: "Real data connected (no fake percentages)"},
   {id: "s3-c3", short: "Tests Pass", label: "Automated build & unit tests pass"}
  ],
  readyPrompts: [
   {
    id: "p-do-the-work",
    title: "Execute Bounded Feature End-to-End (05_DO_THE_WORK)",
    when: "After approving the 1-page plan",
    prompt: `Build the approved deliverable end-to-end now. Touch only required files, leave zero dead buttons, and run the build and test suite to verify zero regressions.`
   },
   {
    id: "p-cartilla-canon",
    title: "Cartilla de Gretel — Game Canon & Scope Guard",
    when: "Building or fixing Cartilla lessons/games",
    prompt: `We are working on La Cartilla de Gretel. Respect the shared game canon header and audio/illustration contracts. Keep PR #877 strictly locked to TUTOR_1073_ONLY.`
   }
  ],
  libraryKeywords: ["05_do_the_work", "juego", "shared-canon", "workbook"]
 },
 {
  id: "stage-04",
  code: "04",
  title: "Visual QA",
  subtitle: "Phone 390px & Desktop",
  firmRole: "QA & Design Lead",
  angleDeg: 90, // 6 o'clock
  targetPct: 70,
  plainWhy: "Inspect the live rendered screen on both a 390px phone and 1440px desktop viewport.",
  checkpoints: [
   {id: "s4-c1", short: "1440px Desktop", label: "Desktop (1440×900) clean & uncluttered"},
   {id: "s4-c2", short: "390px Phone", label: "Phone (390×844) zero horizontal overflow"},
   {id: "s4-c3", short: "Interactive QA", label: "All buttons, tabs & copy actions tested"}
  ],
  readyPrompts: [
   {
    id: "p-visual-qa",
    title: "Visual & Mobile QA Audit (390px + 1440px)",
    when: "Right after coding any visual change",
    prompt: `Perform a Visual & Usability QA check on Desktop (1440x900) and Mobile Phone (390x844). Check for horizontal scroll, crowded text, or broken buttons, and report findings in plain English.`
   },
   {
    id: "p-review-work",
    title: "Independent Senior Code & UX Review (10_REVIEW)",
    when: "Before marking a feature complete",
    prompt: `Review the completed work as an independent Senior Reviewer: did we solve Emilio's problem in the simplest, most visual way? List what is proven and what still needs human check.`
   }
  ],
  libraryKeywords: ["visual-qa", "10_review_completed_work", "06_troubleshoot"]
 },
 {
  id: "stage-05",
  code: "05",
  title: "Security & Backup",
  subtitle: "Keys, Privacy & Vault",
  firmRole: "Security Officer",
  angleDeg: 150, // 8 o'clock
  targetPct: 50,
  plainWhy: "Confirm API keys stay server-side and export a verified backup snapshot before release.",
  checkpoints: [
   {id: "s5-c1", short: "Zero Client Keys", label: "Zero secrets or private notes in client bundle"},
   {id: "s5-c2", short: "Safe API Routes", label: "Server API routes validate inputs safely"},
   {id: "s5-c3", short: "JSON Backup", label: "Complete JSON backup exported & verified"}
  ],
  readyPrompts: [
   {
    id: "p-security-audit",
    title: "Plain-English Security & Privacy Gate",
    when: "Before merging any PR or deploying",
    prompt: `Confirm no API keys, tokens, or private owner files are exposed in client-side bundles or git history, and summarize security status in plain English.`
   },
   {
    id: "p-backup-check",
    title: "Verify Backup & Fast Restore Readiness",
    when: "Before major releases or database changes",
    prompt: `Verify all user state, custom prompts, project briefs, and lessons learned are included in our backup export and can be restored cleanly.`
   }
  ],
  libraryKeywords: ["backup", "security", "permanent-production-rules"]
 },
 {
  id: "stage-06",
  code: "06",
  title: "Launch & Handoff",
  subtitle: "Live Proof & Lessons",
  firmRole: "Release Director",
  angleDeg: 210, // 10 o'clock
  targetPct: 35,
  plainWhy: "Report WORKS / DOES NOT WORK / NOT VERIFIED / NEXT and save 1 reusable lesson.",
  checkpoints: [
   {id: "s6-c1", short: "Proof Report", label: "WORKS / DOES NOT WORK / NOT VERIFIED / NEXT reported"},
   {id: "s6-c2", short: "Owner Sign-Off", label: "Explicit owner approval for merge & release"},
   {id: "s6-c3", short: "Lesson Saved", label: "Reusable lesson saved for future projects"}
  ],
  readyPrompts: [
   {
    id: "p-handoff",
    title: "Owner Release Checkpoint (09_HANDOFF + 16_STOP)",
    when: "End of session or pre-release",
    prompt: `Provide a final Owner Checkpoint in plain English: WORKS (with proof) / DOES NOT WORK / NOT VERIFIED / NEXT (one decision for Emilio José). Then stop cleanly.`
   }
  ],
  libraryKeywords: ["09_project_handoff", "16_stop_when_done"]
 }
];

const DEFAULT_BRIEFS: Record<string, MasterBrief> = {
 "cartilla-de-gretel": {
  projectSlug: "cartilla-de-gretel",
  goal: "Interactive Spanish early-literacy workbook, phonics games, audio & AI tutor.",
  audience: "Spanish-speaking children, parents, and early-literacy teachers.",
  mustHave: "Touch-friendly games, accurate Spanish audio, and isolated PR #877 tutor fix.",
  outOfScope: "Do not bundle unrelated UI edits into PR #877 (TUTOR_1073_ONLY).",
  visualCheck: "Verify 390px phone and 1440px desktop views.",
  updatedAt: "2026-11-01"
 },
 "lany-books-web": {
  projectSlug: "lany-books-web",
  goal: "Fast, trustworthy publishing storefront and digital book catalog.",
  audience: "Parents, readers, educators, and book buyers.",
  mustHave: "Clean book showcase pages, fast cover images, and mobile checkout links.",
  outOfScope: "No heavy back-office clutter inside the public storefront.",
  visualCheck: "Verify book cards and checkout on 390px phone and 1440px desktop.",
  updatedAt: "2026-11-01"
 },
 "Command-Center-": {
  projectSlug: "Command-Center-",
  goal: "Minimalist visual AI Studio Headquarters with Recharts timeline graphs, radial mind-map, and 98-prompt library.",
  audience: "Emilio José (creator & product director).",
  mustHave: "Recharts milestone timeline, radial mind-map, and 1-click AI prompts.",
  outOfScope: "No walls of text or invented fake worker percentages.",
  visualCheck: "Verify Overview, Lifecycle Web, and Prompt Library on phone & desktop.",
  updatedAt: "2026-11-01"
 }
};

const DEFAULT_LESSONS: LessonEntry[] = [
 {
  id: "lesson-1",
  project: "La Cartilla de Gretel",
  rule: "Never bundle unrelated layout edits into a bug-fix PR (#877 is locked to TUTOR_1073_ONLY).",
  why: "Keeps review fast and prevents accidental regressions.",
  createdAt: "2026-11-01"
 },
 {
  id: "lesson-2",
  project: "All Projects",
  rule: "Always verify phone (390px) and desktop (1440px) visuals before approving a merge.",
  why: "A passing build never guarantees a clean, usable interface.",
  createdAt: "2026-11-01"
 }
];

type LibraryMiniItem = {
 id: string;
 title: string;
 category: string;
 project: string;
 summary: string;
 prompt: string;
 path: string;
};

// Polar coordinate helper for Radial Mind-Map
function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
 const rad = (angleDeg * Math.PI) / 180;
 return {
  x: Math.round((cx + radius * Math.cos(rad)) * 10) / 10,
  y: Math.round((cy + radius * Math.sin(rad)) * 10) / 10
 };
}

export default function BestPractices() {
 const [selectedProject, setSelectedProject] = useState<string>("cartilla-de-gretel");
 const [selectedNodeId, setSelectedNodeId] = useState<string>("stage-04");
 const [chartMode, setChartMode] = useState<"single" | "compare">("single");
 const [webChecks, setWebChecks] = useState<Record<string, boolean>>({});
 const [done, setDone] = useState<Record<string, boolean>>({});
 const [briefs, setBriefs] = useState<Record<string, MasterBrief>>(DEFAULT_BRIEFS);
 const [lessons, setLessons] = useState<LessonEntry[]>(DEFAULT_LESSONS);
 const [libraryItems, setLibraryItems] = useState<LibraryMiniItem[]>([]);
 const [copiedKey, setCopiedKey] = useState<string>("");
 const [newLesson, setNewLesson] = useState({project: "All Projects", rule: "", why: ""});

 useEffect(() => {
  try {
   const savedChecks = JSON.parse(localStorage.getItem(CHECKS_KEY) || "{}");
   if (savedChecks && typeof savedChecks === "object") setDone(savedChecks);
  } catch {}
  try {
   const savedWeb = JSON.parse(localStorage.getItem(WEB_STATE_KEY) || "{}");
   if (savedWeb && typeof savedWeb === "object") setWebChecks(savedWeb);
  } catch {}
  try {
   const savedBriefs = JSON.parse(localStorage.getItem(BRIEFS_KEY) || "null");
   if (savedBriefs && typeof savedBriefs === "object") {
    setBriefs({...DEFAULT_BRIEFS, ...savedBriefs});
   }
  } catch {}
  try {
   const savedLessons = JSON.parse(localStorage.getItem(LESSONS_KEY) || "null");
   if (Array.isArray(savedLessons) && savedLessons.length > 0) {
    setLessons(savedLessons);
   }
  } catch {}

  fetch("/api/library", {cache: "no-store"})
   .then(r => r.json())
   .then(d => {
    if (Array.isArray(d?.items)) setLibraryItems(d.items);
   })
   .catch(() => {});
 }, []);

 const activeProjectObj =
  STUDIO_PROJECTS.find(p => p.slug === selectedProject) || STUDIO_PROJECTS[0];

 const activeNode =
  LIFECYCLE_NODES.find(n => n.id === selectedNodeId) || LIFECYCLE_NODES[0];

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

 function toggleStageCheck(checkId: string, idx: number, stageIdx: number) {
  const key = `${selectedProject}:${checkId}`;
  const currentVal = isStageCheckDone(checkId, idx, stageIdx);
  const next = {...webChecks, [key]: !currentVal};
  setWebChecks(next);
  try {
   localStorage.setItem(WEB_STATE_KEY, JSON.stringify(next));
  } catch {}
 }

 function getNodeProgressForProject(projSlug: string, node: WebStageNode, stageIdx: number) {
  const doneCount = node.checkpoints.filter((c, i) =>
   isCheckDoneForProject(projSlug, c.id, i, stageIdx)
  ).length;
  const total = node.checkpoints.length;
  const pct = Math.round((doneCount / total) * 100);
  return {doneCount, total, pct};
 }

 function getNodeProgress(node: WebStageNode, stageIdx: number) {
  return getNodeProgressForProject(selectedProject, node, stageIdx);
 }

 const totalWebChecks = LIFECYCLE_NODES.reduce((acc, n) => acc + n.checkpoints.length, 0);
 const completedWebChecks = LIFECYCLE_NODES.reduce(
  (acc, n, idx) => acc + getNodeProgress(n, idx).doneCount,
  0
 );
 const overallPct = Math.round((completedWebChecks / totalWebChecks) * 100);

 // Recharts Milestone & Due-Date Timeline Dataset
 const rechartsTimelineData = useMemo(() => {
  return LIFECYCLE_NODES.map((node, idx) => {
   const {doneCount, total, pct} = getNodeProgress(node, idx);
   const cartillaPct = getNodeProgressForProject("cartilla-de-gretel", node, idx).pct;
   const lanyPct = getNodeProgressForProject("lany-books-web", node, idx).pct;
   const hubPct = getNodeProgressForProject("Command-Center-", node, idx).pct;
   const dueDate = activeProjectObj.dueDates[idx] || "TBD";
   const milestone = activeProjectObj.milestones[idx] || node.subtitle;

   return {
    nodeId: node.id,
    code: node.code,
    stageName: `${node.code} · ${node.title}`,
    axisLabel: `${node.code} ${node.title.split(" ")[0]} (${dueDate})`,
    dueDate,
    milestone,
    firmRole: node.firmRole,
    completionPct: pct,
    targetTrajectory: node.targetPct,
    tasksCompleted: `${doneCount}/${total} tasks`,
    Cartilla: cartillaPct,
    LANY: lanyPct,
    NBOHub: hubPct
   };
  });
 }, [selectedProject, webChecks, activeProjectObj]);

 const matchingLibraryPrompts = useMemo(() => {
  const kw = activeNode.libraryKeywords.map(k => k.toLowerCase());
  return libraryItems
   .filter(item => {
    const hay = `${item.title} ${item.path} ${item.category} ${item.summary}`.toLowerCase();
    return kw.some(k => hay.includes(k));
   })
   .slice(0, 3);
 }, [libraryItems, activeNode]);

 const currentBrief: MasterBrief = briefs[selectedProject] || {
  projectSlug: selectedProject,
  goal: "",
  audience: "",
  mustHave: "",
  outOfScope: "",
  visualCheck: "Verify phone (390px) and desktop (1440px) before approval.",
  updatedAt: new Date().toISOString().slice(0, 10)
 };

 function updateBrief(patch: Partial<MasterBrief>) {
  const nextBrief: MasterBrief = {
   ...currentBrief,
   ...patch,
   projectSlug: selectedProject,
   updatedAt: new Date().toISOString().slice(0, 10)
  };
  const nextAll = {...briefs, [selectedProject]: nextBrief};
  setBriefs(nextAll);
  try {
   localStorage.setItem(BRIEFS_KEY, JSON.stringify(nextAll));
  } catch {}
 }

 function toggleGate(id: string) {
  const next = {...done, [id]: !done[id]};
  setDone(next);
  try {
   localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
  } catch {}
 }

 async function handleCopy(key: string, text: string) {
  if (await copyText(text)) {
   setCopiedKey(key);
   setTimeout(() => setCopiedKey(""), 2000);
  }
 }

 function addLesson() {
  if (!newLesson.rule.trim()) return;
  const entry: LessonEntry = {
   id: "lesson-" + Date.now(),
   project: newLesson.project,
   rule: newLesson.rule.trim(),
   why: newLesson.why.trim() || "Captured in NBO Studio Lifecycle.",
   createdAt: new Date().toISOString().slice(0, 10)
  };
  const next = [entry, ...lessons];
  setLessons(next);
  try {
   localStorage.setItem(LESSONS_KEY, JSON.stringify(next));
  } catch {}
  setNewLesson({project: "All Projects", rule: "", why: ""});
 }

 const generatedKickoffPrompt = `You are working for Emilio José on project "${activeProjectObj.name}".
Read CLAUDE.md and AGENTS.md first.
1. GOAL: ${currentBrief.goal}
2. AUDIENCE: ${currentBrief.audience}
3. MUST WORK: ${currentBrief.mustHave}
4. DO NOT TOUCH: ${currentBrief.outOfScope}
5. VISUAL PROOF: ${currentBrief.visualCheck}`;

 const allGateItems = stages.flatMap(g => g.steps.map((_, i) => `${g.key}-${i}`));
 const completedGates = allGateItems.filter(k => done[k]).length;
 const activeStageIndex = LIFECYCLE_NODES.findIndex(n => n.id === activeNode.id);

 // Radial Mind-Map Center & Orbit Radii
 const CX = 450;
 const CY = 265;
 const STAGE_ORBIT_R = 152;
 const TASK_ORBIT_R = 232;
 const PROJECT_INNER_R = 72;

 return (
  <div className="section lifecycle-studio">
   {/* Minimalist Studio Header + Interconnected Project Switcher */}
   <div className="lifecycle-header">
    <div>
     <span className="hq-stage-code">VISUAL LIFECYCLE TIMELINE &amp; RADIAL MIND-MAP</span>
     <h1>
      {activeProjectObj.name} <span style={{color: activeProjectObj.color}}>· {overallPct}%</span>
     </h1>
    </div>
    <div className="lifecycle-project-bar" role="tablist" aria-label="Select project to track">
     {STUDIO_PROJECTS.map(p => (
      <button
       key={p.slug}
       type="button"
       role="tab"
       aria-selected={selectedProject === p.slug}
       className={"lifecycle-proj-pill " + (selectedProject === p.slug ? "active" : "")}
       onClick={() => setSelectedProject(p.slug)}
      >
       <i
        style={{
         width: 7,
         height: 7,
         borderRadius: "50%",
         background: p.color,
         display: "inline-block",
         marginRight: 6
        }}
       />
       <span>{p.name}</span>
      </button>
     ))}
    </div>
   </div>

   {/* =====================================================================
       1. RECHARTS VISUAL TIMELINE COMPONENT (Milestones, Due Dates & Velocity)
       ===================================================================== */}
   <section className="panel recharts-timeline-panel" aria-label="Recharts Project Milestone and Due Date Timeline">
    <div className="lifecycle-canvas-top">
     <div>
      <span className="hq-stage-code">RECHARTS MILESTONE &amp; DUE-DATE TIMELINE</span>
      <h2>
       {chartMode === "single"
        ? `${activeProjectObj.name} — Milestones & Target Due Dates`
        : "Cross-Project Lifecycle Comparison (Cartilla vs. LANY Books vs. NBO Hub)"}
      </h2>
     </div>
     <div className="recharts-mode-switch" role="group" aria-label="Timeline chart mode">
      <button
       type="button"
       className={"hq-theme-pill " + (chartMode === "single" ? "active" : "")}
       onClick={() => setChartMode("single")}
      >
       Active Project Milestones
      </button>
      <button
       type="button"
       className={"hq-theme-pill " + (chartMode === "compare" ? "active" : "")}
       onClick={() => setChartMode("compare")}
      >
       Compare All Main Projects
      </button>
     </div>
    </div>

    <div className="recharts-canvas-box" style={{width: "100%", height: 245}}>
     <ResponsiveContainer width="100%" height="100%">
      {chartMode === "single" ? (
       <ComposedChart
        data={rechartsTimelineData}
        margin={{top: 14, right: 20, left: -12, bottom: 6}}
        onClick={state => {
         const clickedPayload = (state as any)?.activePayload?.[0]?.payload;
         if (clickedPayload?.nodeId) {
          setSelectedNodeId(clickedPayload.nodeId);
         }
        }}
       >
        <defs>
         <linearGradient id="targetAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={activeProjectObj.color} stopOpacity={0.26} />
          <stop offset="95%" stopColor={activeProjectObj.color} stopOpacity={0.02} />
         </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={false} />
        <XAxis
         dataKey="axisLabel"
         tick={{fill: "var(--ui-muted)", fontSize: 11}}
         axisLine={{stroke: "var(--ui-border)"}}
         tickLine={false}
        />
        <YAxis
         domain={[0, 100]}
         tickFormatter={v => `${v}%`}
         tick={{fill: "var(--ui-subtle)", fontSize: 11}}
         axisLine={false}
         tickLine={false}
        />
        <Tooltip
         cursor={{fill: "rgba(255,255,255,0.04)"}}
         content={({active, payload}) => {
          if (!active || !payload?.length) return null;
          const d = payload[0].payload;
          return (
           <div className="recharts-custom-tooltip">
            <span className="hq-stage-code">{d.stageName} · DUE {d.dueDate}</span>
            <strong>{d.milestone}</strong>
            <div className="recharts-tooltip-row">
             <span>Stage Completion:</span>
             <b>{d.completionPct}% ({d.tasksCompleted})</b>
            </div>
            <div className="recharts-tooltip-row">
             <span>Lead Role:</span>
             <b>{d.firmRole}</b>
            </div>
            <small>Click bar to inspect stage &amp; copy prompts →</small>
           </div>
          );
         }}
        />
        <ReferenceLine y={100} stroke="rgba(74, 222, 128, 0.25)" strokeDasharray="4 4" />
        <Area
         type="monotone"
         dataKey="targetTrajectory"
         name="Target Readiness Curve"
         stroke={activeProjectObj.color}
         strokeWidth={2}
         strokeDasharray="4 4"
         fill="url(#targetAreaGrad)"
        />
        <Bar
         dataKey="completionPct"
         name="Milestone Completion"
         radius={[6, 6, 0, 0]}
         barSize={38}
         style={{cursor: "pointer"}}
        >
         {rechartsTimelineData.map(entry => {
          const isSelected = entry.nodeId === selectedNodeId;
          const fill =
           entry.completionPct === 100
            ? "#4ade80"
            : isSelected
            ? activeProjectObj.color
            : "rgba(122, 162, 247, 0.55)";
          return (
           <Cell
            key={entry.nodeId}
            fill={fill}
            stroke={isSelected ? "#ffffff" : "none"}
            strokeWidth={isSelected ? 1.5 : 0}
           />
          );
         })}
        </Bar>
       </ComposedChart>
      ) : (
       <ComposedChart
        data={rechartsTimelineData}
        margin={{top: 14, right: 20, left: -12, bottom: 6}}
       >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={false} />
        <XAxis
         dataKey="stageName"
         tick={{fill: "var(--ui-muted)", fontSize: 11}}
         axisLine={{stroke: "var(--ui-border)"}}
         tickLine={false}
        />
        <YAxis
         domain={[0, 100]}
         tickFormatter={v => `${v}%`}
         tick={{fill: "var(--ui-subtle)", fontSize: 11}}
         axisLine={false}
         tickLine={false}
        />
        <Tooltip
         contentStyle={{
          background: "var(--ui-panel)",
          border: "1px solid var(--ui-border)",
          borderRadius: 8,
          fontSize: 12
         }}
        />
        <Bar dataKey="Cartilla" name="La Cartilla de Gretel" fill="#7aa2f7" radius={[4, 4, 0, 0]} barSize={18} />
        <Bar dataKey="LANY" name="LANY Books" fill="#cba6f7" radius={[4, 4, 0, 0]} barSize={18} />
        <Line type="monotone" dataKey="NBOHub" name="NBO Operations Hub" stroke="#4ade80" strokeWidth={2.5} dot={{r: 4}} />
       </ComposedChart>
      )}
     </ResponsiveContainer>
    </div>

    {/* Compact Milestone Due-Date Strip under Recharts Timeline */}
    <div className="milestone-date-strip">
     {rechartsTimelineData.map(item => (
      <button
       key={item.nodeId}
       type="button"
       className={"milestone-chip " + (selectedNodeId === item.nodeId ? "active" : "")}
       onClick={() => setSelectedNodeId(item.nodeId)}
      >
       <div className="milestone-chip-top">
        <span className="milestone-code">{item.code}</span>
        <span className="milestone-due">Due {item.dueDate}</span>
       </div>
       <strong>{item.milestone}</strong>
      </button>
     ))}
    </div>
   </section>

   {/* =====================================================================
       2. RADIAL MIND-MAP VISUALIZATION (Projects + Stages + Orbiting Tasks)
       ===================================================================== */}
   <div className="lifecycle-web-layout">
    <section className="lifecycle-web-canvas" aria-label="Interactive Radial Mind-Map Visualization">
     <div className="lifecycle-canvas-top">
      <div>
       <span className="hq-stage-code">RADIAL MIND-MAP · INTERCONNECTED OPERATIONS</span>
       <h2>Click any center project, radial stage, or outer task node</h2>
      </div>
      <span className="lifecycle-progress-pill">
       {completedWebChecks}/{totalWebChecks} tasks verified
      </span>
     </div>

     <div className="lifecycle-svg-wrap">
      <svg
       viewBox="0 0 900 530"
       className="lifecycle-svg"
       role="img"
       aria-label={`Radial mind-map visualization for ${activeProjectObj.name}`}
      >
       <defs>
        <radialGradient id="radialHubGlow" cx="50%" cy="50%" r="50%">
         <stop offset="0%" stopColor={activeProjectObj.color} stopOpacity="0.28" />
         <stop offset="70%" stopColor={activeProjectObj.color} stopOpacity="0.06" />
         <stop offset="100%" stopColor={activeProjectObj.color} stopOpacity="0" />
        </radialGradient>
       </defs>

       {/* Concentric Radial Orbit Guides */}
       <circle cx={CX} cy={CY} r={TASK_ORBIT_R} className="radial-orbit-ring outer" />
       <circle cx={CX} cy={CY} r={STAGE_ORBIT_R} className="radial-orbit-ring middle" />
       <circle cx={CX} cy={CY} r={PROJECT_INNER_R} className="radial-orbit-ring inner" />
       <circle cx={CX} cy={CY} r={135} fill="url(#radialHubGlow)" />

       {/* 1) Radial Spokes & Orbiting Task Satellite Nodes */}
       {LIFECYCLE_NODES.map((node, stageIdx) => {
        const stagePos = polarToCartesian(CX, CY, STAGE_ORBIT_R, node.angleDeg);
        const isSelected = node.id === selectedNodeId;
        const {doneCount, total} = getNodeProgress(node, stageIdx);
        const isStageDone = doneCount === total;

        // Curved spoke from Center Hub (CX, CY) to Stage Node
        const ctrlPos = polarToCartesian(CX, CY, STAGE_ORBIT_R * 0.55, node.angleDeg - 10);
        const spokePath = `M ${CX} ${CY} Q ${ctrlPos.x} ${ctrlPos.y} ${stagePos.x} ${stagePos.y}`;

        return (
         <g key={`radial-branch-${node.id}`}>
          <path
           d={spokePath}
           className={
            "web-spoke " +
            (isSelected ? "active " : "") +
            (isStageDone ? "done " : "")
           }
          />

          {/* 3 Outer Satellite Task Nodes per Stage */}
          {node.checkpoints.map((chk, chkIdx) => {
           const spreadAngle = node.angleDeg + (chkIdx - 1) * 16;
           const taskPos = polarToCartesian(CX, CY, TASK_ORBIT_R, spreadAngle);
           const checked = isStageCheckDone(chk.id, chkIdx, stageIdx);
           const anchor =
            Math.cos((spreadAngle * Math.PI) / 180) > 0.25
             ? "start"
             : Math.cos((spreadAngle * Math.PI) / 180) < -0.25
             ? "end"
             : "middle";
           const labelOffsetX = anchor === "start" ? 13 : anchor === "end" ? -13 : 0;
           const labelOffsetY = anchor === "middle" ? (spreadAngle < 0 ? -13 : 18) : 4;

           return (
            <g
             key={chk.id}
             className={"radial-task-node " + (checked ? "done" : "")}
             onClick={() => {
              setSelectedNodeId(node.id);
              toggleStageCheck(chk.id, chkIdx, stageIdx);
             }}
             style={{cursor: "pointer"}}
            >
             <line
              x1={stagePos.x}
              y1={stagePos.y}
              x2={taskPos.x}
              y2={taskPos.y}
              stroke={checked ? "#4ade80" : isSelected ? activeProjectObj.color : "var(--ui-border)"}
              strokeWidth={checked || isSelected ? "1.6" : "1"}
              strokeDasharray={checked ? undefined : "2 2"}
             />
             <circle
              cx={taskPos.x}
              cy={taskPos.y}
              r={8.5}
              fill={checked ? "#4ade80" : "var(--ui-panel)"}
              stroke={checked ? "#4ade80" : isSelected ? activeProjectObj.color : "var(--ui-border)"}
              strokeWidth="1.8"
             />
             <text
              x={taskPos.x}
              y={taskPos.y + 3.5}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={checked ? "#0b0e14" : "var(--ui-muted)"}
             >
              {checked ? "✓" : chkIdx + 1}
             </text>
             <text
              x={taskPos.x + labelOffsetX}
              y={taskPos.y + labelOffsetY}
              textAnchor={anchor}
              fontSize="10"
              fontWeight={isSelected ? "700" : "500"}
              fill={checked ? "#4ade80" : isSelected ? "var(--ui-text)" : "var(--ui-muted)"}
             >
              {chk.short}
             </text>
            </g>
           );
          })}
         </g>
        );
       })}

       {/* 2) Inner Orbit: 5 Interconnected Business Project Nodes */}
       {STUDIO_PROJECTS.map((proj, pIdx) => {
        const angle = -90 + pIdx * 72;
        const pos = polarToCartesian(CX, CY, PROJECT_INNER_R, angle);
        const isCurrentProj = proj.slug === selectedProject;
        return (
         <g
          key={proj.slug}
          onClick={() => setSelectedProject(proj.slug)}
          style={{cursor: "pointer"}}
         >
          <line
           x1={CX}
           y1={CY}
           x2={pos.x}
           y2={pos.y}
           stroke={isCurrentProj ? proj.color : "var(--ui-border)"}
           strokeWidth={isCurrentProj ? "2" : "1"}
          />
          <circle
           cx={pos.x}
           cy={pos.y}
           r={isCurrentProj ? 14 : 10}
           fill={isCurrentProj ? proj.color : "var(--ui-raised)"}
           stroke={proj.color}
           strokeWidth="2"
          />
          <text
           x={pos.x}
           y={pos.y + (angle > 0 && angle < 180 ? 24 : -16)}
           textAnchor="middle"
           fontSize="9.5"
           fontWeight="700"
           fill={isCurrentProj ? proj.color : "var(--ui-subtle)"}
          >
           {proj.shortName}
          </text>
         </g>
        );
       })}

       {/* 3) Primary Radial Ring: 6 Lifecycle Stage Nodes */}
       {LIFECYCLE_NODES.map((node, idx) => {
        const pos = polarToCartesian(CX, CY, STAGE_ORBIT_R, node.angleDeg);
        const isSelected = node.id === selectedNodeId;
        const {doneCount, total, pct} = getNodeProgress(node, idx);
        const isDone = doneCount === total;
        const ringR = 28;
        const ringCirc = 2 * Math.PI * ringR;
        const ringOffset = ringCirc - (pct / 100) * ringCirc;

        return (
         <g
          key={node.id}
          className={
           "web-stage-node " +
           (isSelected ? "selected " : "") +
           (isDone ? "done " : "")
          }
          onClick={() => setSelectedNodeId(node.id)}
          role="button"
          tabIndex={0}
          aria-label={`${node.code} ${node.title} (${pct}%)`}
          onKeyDown={e => {
           if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedNodeId(node.id);
           }
          }}
         >
          {/* Radial Node Background Circle */}
          <circle
           cx={pos.x}
           cy={pos.y}
           r={ringR}
           fill={isSelected ? "var(--ui-raised)" : "var(--ui-panel)"}
           stroke="var(--ui-border)"
           strokeWidth="3"
          />
          {/* Radial Progress Arc around Stage Node */}
          <circle
           cx={pos.x}
           cy={pos.y}
           r={ringR}
           fill="none"
           stroke={isDone ? "#4ade80" : isSelected ? activeProjectObj.color : "var(--ui-accent)"}
           strokeWidth="3.5"
           strokeLinecap="round"
           strokeDasharray={ringCirc}
           strokeDashoffset={ringOffset}
           transform={`rotate(-90 ${pos.x} ${pos.y})`}
          />
          <text
           x={pos.x}
           y={pos.y - 4}
           textAnchor="middle"
           fontSize="10"
           fontWeight="700"
           fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
           fill={isDone ? "#4ade80" : "var(--ui-accent)"}
          >
           {node.code}
          </text>
          <text
           x={pos.x}
           y={pos.y + 9}
           textAnchor="middle"
           fontSize="9.5"
           fontWeight="700"
           fill="var(--ui-text)"
          >
           {node.title.split(" ")[0]}
          </text>
          <text
           x={pos.x}
           y={pos.y + 20}
           textAnchor="middle"
           fontSize="8.5"
           fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
           fill="var(--ui-muted)"
          >
           {pct}%
          </text>
         </g>
        );
       })}

       {/* 4) Central Project Hub Core */}
       <g className="web-center-hub">
        <circle
         cx={CX}
         cy={CY}
         r={44}
         fill="var(--ui-panel)"
         stroke={activeProjectObj.color}
         strokeWidth="3"
        />
        <text
         x={CX}
         y={CY - 10}
         textAnchor="middle"
         fontSize="8.5"
         fontWeight="700"
         fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
         fill={activeProjectObj.color}
        >
         {activeProjectObj.shortName.toUpperCase()}
        </text>
        <text
         x={CX}
         y={CY + 7}
         textAnchor="middle"
         fontSize="15"
         fontWeight="800"
         fill="var(--ui-text)"
        >
         {overallPct}%
        </text>
        <text
         x={CX}
         y={CY + 21}
         textAnchor="middle"
         fontSize="8"
         fill="var(--ui-muted)"
        >
         {completedWebChecks}/{totalWebChecks} tasks
        </text>
       </g>
      </svg>
     </div>
    </section>

    {/* Right: Minimalist Stage Dock (Checkpoints + 1-Click Prompts) */}
    <aside className="lifecycle-stage-dock" aria-label="Selected stage checkpoints and prompts">
     <div className="dock-header">
      <span className="hq-stage-code">
       STAGE {activeNode.code} · DUE {activeProjectObj.dueDates[activeStageIndex] || "TBD"}
      </span>
      <h2>{activeNode.title}</h2>
      <p>{activeProjectObj.milestones[activeStageIndex] || activeNode.plainWhy}</p>
     </div>

     <div className="dock-section">
      <div className="dock-section-title">
       <span>STAGE TASKS (SYNCED WITH RADIAL MAP)</span>
       <small>Click node or checkbox</small>
      </div>
      <div className="dock-checklist">
       {activeNode.checkpoints.map((c, idx) => {
        const checked = isStageCheckDone(c.id, idx, activeStageIndex);
        return (
         <label key={c.id} className={"dock-check-row " + (checked ? "checked" : "")}>
          <input
           type="checkbox"
           checked={checked}
           onChange={() => toggleStageCheck(c.id, idx, activeStageIndex)}
          />
          <span>{c.label}</span>
         </label>
        );
       })}
      </div>
     </div>

     <div className="dock-section">
      <div className="dock-section-title">
       <span>READY-TO-START PROMPTS</span>
       <Link href="/prompts" style={{fontSize: 11, color: "var(--ui-accent)"}}>All 98 →</Link>
      </div>
      <div className="dock-prompt-list">
       {activeNode.readyPrompts.map(rp => (
        <div key={rp.id} className="dock-lib-row">
         <div>
          <strong>{rp.title}</strong>
          <small>{rp.when}</small>
         </div>
         <button
          type="button"
          className="btn primary"
          onClick={() => handleCopy(rp.id, rp.prompt)}
         >
          {copiedKey === rp.id ? "✓ Copied!" : "Copy"}
         </button>
        </div>
       ))}

       {matchingLibraryPrompts.map(item => (
        <div key={item.id} className="dock-lib-row">
         <div>
          <strong>{item.title}</strong>
          <small>{item.category}</small>
         </div>
         <button
          type="button"
          className="btn"
          onClick={() => handleCopy(item.id, item.prompt)}
         >
          {copiedKey === item.id ? "✓ Copied" : "Copy"}
         </button>
        </div>
       ))}
      </div>
     </div>
    </aside>
   </div>

   {/* Secondary Tools Collapsed by Default */}
   <div className="lifecycle-drawers">
    <details className="hq-tech-drawer">
     <summary>
      <div>
       <span className="hq-stage-code">OPTIONAL TOOL · CUSTOM KICKOFF GENERATOR</span>
       <h2>Guided Master Project Brief Builder ({activeProjectObj.name})</h2>
      </div>
      <span className="btn">Expand Brief Builder ▾</span>
     </summary>
     <div className="hq-tech-drawer-body">
      <div className="hq-brief-grid">
       <div className="hq-brief-form">
        <label>
         <span>1. Goal</span>
         <input value={currentBrief.goal} onChange={e => updateBrief({goal: e.target.value})} />
        </label>
        <label>
         <span>2. Target Audience</span>
         <input value={currentBrief.audience} onChange={e => updateBrief({audience: e.target.value})} />
        </label>
        <label>
         <span>3. Must Work</span>
         <input value={currentBrief.mustHave} onChange={e => updateBrief({mustHave: e.target.value})} />
        </label>
        <label>
         <span>4. Do Not Touch (Scope Lock)</span>
         <input value={currentBrief.outOfScope} onChange={e => updateBrief({outOfScope: e.target.value})} />
        </label>
       </div>
       <div className="hq-brief-output">
        <pre>{generatedKickoffPrompt}</pre>
        <button
         type="button"
         className="btn primary"
         onClick={() => handleCopy("kickoff", generatedKickoffPrompt)}
        >
         {copiedKey === "kickoff" ? "✓ Copied!" : "Copy AI Kickoff Prompt"}
        </button>
       </div>
      </div>
     </div>
    </details>

    <details className="hq-tech-drawer">
     <summary>
      <div>
       <span className="hq-stage-code">OPTIONAL TOOL · RELEASE GATE &amp; LESSONS</span>
       <h2>Release Readiness Gate ({completedGates}/{allGateItems.length}) &amp; Lessons Learned &amp; Reusable Rules</h2>
      </div>
      <span className="btn">Expand Gate &amp; Rules ▾</span>
     </summary>
     <div className="hq-tech-drawer-body">
      <div className="hq-phase-c-grid">
       <section className="panel">
        <div className="panel-head">
         <h2>Release Readiness Gate ({completedGates}/{allGateItems.length})</h2>
        </div>
        <div className="practice-grid">
         {stages.map(g => (
          <div className="practice-card" key={g.key}>
           <p className="eyebrow">{g.name}</p>
           <div className="checks">
            {g.steps.map((item, i) => {
             const k = `${g.key}-${i}`;
             return (
              <label className={"check " + (done[k] ? "done" : "")} key={k}>
               <input type="checkbox" checked={!!done[k]} onChange={() => toggleGate(k)} />
               <span>{item}</span>
              </label>
             );
            })}
           </div>
          </div>
         ))}
        </div>
       </section>

       <section className="panel">
        <div className="panel-head">
         <h2>Lessons Learned &amp; Reusable Rules</h2>
        </div>
        <div className="hq-lesson-form">
         <input
          value={newLesson.rule}
          onChange={e => setNewLesson({...newLesson, rule: e.target.value})}
          placeholder="New rule (e.g., Always verify 390px mobile screen)"
         />
         <button type="button" className="btn primary" onClick={addLesson}>
          Save Rule
         </button>
        </div>
        <div className="hq-lessons-list">
         {lessons.map(l => (
          <article className="hq-lesson-card" key={l.id}>
           <strong>{l.rule}</strong>
           <small>{l.project} · {l.why}</small>
          </article>
         ))}
        </div>
       </section>
      </div>
     </div>
    </details>
   </div>
  </div>
 );
}
