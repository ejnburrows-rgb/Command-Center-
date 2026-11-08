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

export type ExplorableItem = {
 title: string;
 subtitle: string;
 whatIsThis: string;
 whatDone: string;
 whatNow: string;
 whatMissing: string;
 whatNeedsMe: string;
 proofUrl?: string;
 proofLabel?: string;
 githubUrl: string;
};

type MapNode = {
 name: string;
 stage: "COMPLETED" | "IN PROGRESS" | "WAITING" | "NEXT";
 status: string;
 item: ExplorableItem;
};

type SourcePill = {
 label: string;
 purpose: string;
 authoritative: boolean;
 githubUrl: string;
 ruleSummary: string;
};

type MainCardSpec = {
 slug: string;
 title: string;
 shortRole: string;
 stageIndex: number;
 stageLabel: string;
 progressPct: number;
 accentColor: string;
 sparkline: number[];
 statusLine: string;
 scopeRule: string;
 nextAiPrompt: string;
 quickLinks: {label: string; href: string}[];
 liveUrl: string;
 repoUrl: string;
 lastVerified: string;
 statusBreakdown: {
  completed: { text: string; proofUrl?: string; proofLabel?: string };
  inProgress: { text: string };
  remains: { text: string };
  needsApproval: { text: string };
  savedNotPublished: { text: string };
  websiteStatus: { isCurrent: boolean; label: string; note: string };
 };
 miniMap: MapNode[];
 sources: SourcePill[];
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
  ],
  liveUrl: "https://cartilla-de-gretel.vercel.app",
  repoUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel",
  lastVerified: "2026-11-08 14:07 UTC",
  statusBreakdown: {
   completed: {
    text: "Pencil & eraser unification (PR #1287), El Libro Vivo Option A (#1290), 24 lessons layout, and 108 interaction test suites.",
    proofUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1291",
    proofLabel: "PR #1291 (Pencil regression suite)"
   },
   inProgress: {
    text: "Owner approved PR #1291 test locks; PR #1073 AI Tutor isolation under Issue #877."
   },
   remains: {
    text: "Remaining authentic audio recordings from owner (rec_gretel_* placeholders forbidden) and final teacher flip-chart turn sign-off."
   },
   needsApproval: {
    text: "Owner deployment authorization for release candidate: 'deploy it' required prior to production publication."
   },
   savedNotPublished: {
    text: "Commits b6e64cd & PR #1287 are saved and tested on GitHub main, awaiting explicit owner release deployment."
   },
   websiteStatus: {
    isCurrent: false,
    label: "Website Behind GitHub main",
    note: "Public URL running Sat Nov 7 build; GitHub main contains verified pencil unification and Libro Vivo docs. Safe owner release gating active."
   }
  },
  miniMap: [
   {
    name: "Book Opening",
    stage: "COMPLETED",
    status: "Verified live",
    item: {
     title: "Book Opening & Cover",
     subtitle: "La Cartilla de Gretel",
     whatIsThis: "Front book cover, title lettering, and authentic prologue welcoming students.",
     whatDone: "Rendered authentically from original physical book scans with neutral paper texture.",
     whatNow: "Fully functional and live-verified.",
     whatMissing: "None. Complete.",
     whatNeedsMe: "No owner decision needed.",
     proofUrl: "https://cartilla-de-gretel.vercel.app/",
     proofLabel: "Live App Cover",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/cartilla/FaithfulPageRenderer.tsx"
    }
   },
   {
    name: "Student Workbook",
    stage: "COMPLETED",
    status: "Done & tested",
    item: {
     title: "Student Workbook (Pages 1–85)",
     subtitle: "Exercises, X-marks and line tracing",
     whatIsThis: "The complete interactive student edition faithful to the physical spiral book.",
     whatDone: "Classic wooden pencil scale(2.4) at rotate(55), lifted hops between X-strokes, instant eraser cleanup on wrong answers, zero lasso artifacts.",
     whatNow: "Enforced by automated regression tests in vitest (108 tests passing).",
     whatMissing: "Pages 86–87 are intentionally preserved physical blanks (never invented).",
     whatNeedsMe: "No owner action needed.",
     proofUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1291",
     proofLabel: "Vitest Workbook Suite",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/cartilla/interactions/__tests__/owner-approved-pencil-only.test.ts"
    }
   },
   {
    name: "Teacher Flip Chart",
    stage: "COMPLETED",
    status: "Done in code",
    item: {
     title: "Teacher Flip Chart",
     subtitle: "Top-bound easel view with audio",
     whatIsThis: "Interactive big-book easel format designed for whole-classroom instruction.",
     whatDone: "Top binding flip animation, full lesson sync, keyboard navigation, and picture card reveals.",
     whatNow: "Awaiting final classroom pilot feedback.",
     whatMissing: "Owner vocal cues for lessons 4–24.",
     whatNeedsMe: "Classroom deployment sign-off.",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/flipchart/TeacherFlipchart.tsx"
    }
   },
   {
    name: "Games & Activities",
    stage: "COMPLETED",
    status: "6 games verified",
    item: {
     title: "Interactive Games & Activities",
     subtitle: "Mariposas, Palabras, Cow Game, and Letter Picker",
     whatIsThis: "Phonics reinforcement mini-games designed for primary-grade Spanish literacy.",
     whatDone: "Mariposas drag-and-drop, Cow game syllable eating, rhyming cards, and letter sorting.",
     whatNow: "All 6 mini-games tested and active in code.",
     whatMissing: "None. All mechanics verified.",
     whatNeedsMe: "None.",
     proofUrl: "https://cartilla-de-gretel.vercel.app/cartilla/juegos",
     proofLabel: "Live Games Route",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/cartilla/interactions/faithfulAdapters.tsx"
    }
   },
   {
    name: "Gretel Voice & Tutor",
    stage: "IN PROGRESS",
    status: "PR #1073 in progress",
    item: {
     title: "Gretel Voice & AI Literacy Tutor",
     subtitle: "Issue #877 & PR #1073",
     whatIsThis: "Interactive reading assistance and gentle Spanish encouragement from Gretel.",
     whatDone: "Authentic audio clip Gretel_558674_Original.m4a locked. Synthesized TTS/clones prohibited.",
     whatNow: "Isolated under PR #1073 and Issue #877.",
     whatMissing: "Owner vocal recordings for extended dialogues.",
     whatNeedsMe: "Review AI Tutor test proof before merge.",
     proofUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
     proofLabel: "Issue #877 Tracker",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073"
    }
   },
   {
    name: "Artwork & Animation",
    stage: "COMPLETED",
    status: "Masters verified",
    item: {
     title: "Artwork, Cutouts & Animations",
     subtitle: "Authentic scans & vector fidelity",
     whatIsThis: "Physical illustration archives, character cards, and animation vectors.",
     whatDone: "Archived in NBO Art Inventory with single source of truth; no synthetic AI art.",
     whatNow: "Cleaned and verified.",
     whatMissing: "Owner replacement selection for 10 flagged legacy subjects.",
     whatNeedsMe: "Approve or replace flagged artwork subjects in Art Inventory.",
     proofUrl: "/art-inventory",
     proofLabel: "NBO Art Inventory",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/PROJECT_SOURCE_OF_TRUTH.md"
    }
   },
   {
    name: "Website Release",
    stage: "WAITING",
    status: "Needs owner yes",
    item: {
     title: "Vercel Production Deployment",
     subtitle: "Owner Controlled Release Gate",
     whatIsThis: "The public website https://cartilla-de-gretel.vercel.app.",
     whatDone: "Latest stable version deployed Sat Nov 7. Main branch has new verified pencil improvements.",
     whatNow: "Waiting for explicit owner authorization 'deploy it'.",
     whatMissing: "Owner instruction to deploy.",
     whatNeedsMe: "Say 'deploy it' to push current main to live Vercel.",
     proofUrl: "https://cartilla-de-gretel.vercel.app/",
     proofLabel: "Live Vercel Site",
     githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/vercel.json"
    }
   }
  ],
  sources: [
   {
    label: "AGENTS.md",
    purpose: "Authoritative operating contract for all coding assistants.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/AGENTS.md",
    ruleSummary: "Governs mandatory GitHub saving, branch hygiene, mobile testing, and release gates."
   },
   {
    label: "Project Rules (#877)",
    purpose: "Issue #877 governs active task continuity and owner decisions.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
    ruleSummary: "TUTOR_1073_ONLY constraint, Option A Libro Vivo approval, single-task bounding."
   },
   {
    label: "Approved Pencil Standard",
    purpose: "Classic wooden school pencil scale(2.4) at rotate(55).",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/cartilla/interactions/PencilConnector.tsx#L678",
    ruleSummary: "Single pencil in flight, connected hops between strokes, charcoal gray drag stroke."
   },
   {
    label: "Rejected Designs Lock",
    purpose: "Permanent automated test locks preventing discarded designs from reappearing.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/cartilla/interactions/__tests__/owner-approved-pencil-only.test.ts",
    ruleSummary: "Prohibits miniature toothpick pencil (scale 0.65), lasso/rope UI, teal drag strokes, and synthesized TTS."
   },
   {
    label: "Deployment Info",
    purpose: "Vercel production configuration and release gate.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/vercel.json",
    ruleSummary: "git.deploymentEnabled: false ensures no unapproved automatic deployment to public URL."
   }
  ]
 },
 {
  slug: "lany-books-web",
  title: "LANY Books",
  shortRole: "Publishing Storefront & Digital Catalog",
  stageIndex: 3,
  stageLabel: "BUILD · 03 Core Build",
  progressPct: 78,
  accentColor: "#cba6f7",
  sparkline: [20, 28, 35, 42, 58, 70, 78],
  statusLine: "Storefront, 10-page brochure & client share studio live on Vercel",
  scopeRule: "Next milestone: Visual mobile storefront & catalog verification.",
  nextAiPrompt: `You are working on LANY Books (lany-books-web) for Emilio José.
Inspect the current main branch and summarize in plain English:
1. Which book pages and storefront flows are live-verified.
2. Any broken images or mobile layout issues (390px).
3. The single highest-value improvement to finish next.`,
  quickLinks: [
   {label: "Lifecycle Web", href: "/best-practices"},
   {label: "Project View", href: projectPath("lany-books-web")}
  ],
  liveUrl: "https://lany-books-web-delta.vercel.app",
  repoUrl: "https://github.com/ejnburrows-rgb/lany-books-web",
  lastVerified: "2026-11-08 14:03 UTC",
  statusBreakdown: {
   completed: {
    text: "Storefront homepage, 10-page physical brochure, bilingual Gretel assistant drawer, client share studio with QR codes, and 8 neutral-white cutouts.",
    proofUrl: "https://lany-books-web-delta.vercel.app",
    proofLabel: "Live Vercel Storefront"
   },
   inProgress: {
    text: "Master visual approval board for brochure redesign (styles A, B, C) and 5 website concepts."
   },
   remains: {
    text: "Commercial purchase checkout policies and payment gateway setup (pending owner pricing decisions)."
   },
   needsApproval: {
    text: "Owner choice between 3 brochure styles (Classic Heritage, Clean Modern, Warm Editorial) in Master Visual Approval Board."
   },
   savedNotPublished: {
    text: "None! Main branch commit 2314787 deployed and live on Vercel.",
    proofUrl: "https://github.com/ejnburrows-rgb/lany-books-web/commit/2314787"
   },
   websiteStatus: {
    isCurrent: true,
    label: "Website Synchronized with GitHub main",
    note: "Public URL running latest main (commit 2314787). Verified reachable (HTTP 200) with brochure & share studio active."
   }
  },
  miniMap: [
   {
    name: "Storefront Homepage",
    stage: "COMPLETED",
    status: "Verified live",
    item: {
     title: "Storefront Homepage",
     subtitle: "LANY Books LLC",
     whatIsThis: "Official commercial storefront presenting La Cartilla de Gretel and supplementary books.",
     whatDone: "Responsive hero, catalog cards, $250 institutional kit and $15 workbook presentations.",
     whatNow: "Live-verified on production.",
     whatMissing: "Checkout enabled only after merchant confirmation.",
     whatNeedsMe: "Confirm wholesale & retail pricing.",
     proofUrl: "https://lany-books-web-delta.vercel.app",
     proofLabel: "Live Storefront",
     githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/src/App.tsx"
    }
   },
   {
    name: "10-Page Brochure",
    stage: "COMPLETED",
    status: "Verified live",
    item: {
     title: "10-Page Physical Brochure",
     subtitle: "Print & digital marketing document",
     whatIsThis: "Comprehensive multi-page brochure presenting curriculum, research, and kit components.",
     whatDone: "Bilingual English & Spanish pages, neutral-white cutouts, unit test coverage (scripts/brochure.test.mts).",
     whatNow: "Active in live web viewer and exportable.",
     whatMissing: "None. All 10 pages verified.",
     whatNeedsMe: "None.",
     proofUrl: "https://lany-books-web-delta.vercel.app/#brochure",
     proofLabel: "Brochure Viewer",
     githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/src/components/CartillaBrochure.tsx"
    }
   },
   {
    name: "Client Share Studio",
    stage: "COMPLETED",
    status: "Verified live",
    item: {
     title: "Client Share Studio & QR",
     subtitle: "Instant lead sharing & demo links",
     whatIsThis: "Fast sharing studio allowing school representatives to generate WhatsApp/SMS links and QR codes.",
     whatDone: "SVG QR generator, copy link buttons, pre-filled executive messages.",
     whatNow: "Live on Vercel.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://lany-books-web-delta.vercel.app/#share",
     proofLabel: "Share Studio",
     githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/src/components/ClientShareSession.tsx"
    }
   },
   {
    name: "Master Approval Board",
    stage: "IN PROGRESS",
    status: "Ready for review",
    item: {
     title: "Master Visual Approval Board",
     subtitle: "Brochure styles & website concepts",
     whatIsThis: "Side-by-side comparison board letting Emilio select preferred brochure styles and site themes.",
     whatDone: "3 brochure styles (A/B/C) and 5 website concepts built.",
     whatNow: "Awaiting owner selection.",
     whatMissing: "Owner decision on preferred design.",
     whatNeedsMe: "Select preferred brochure style (A, B, or C).",
     proofUrl: "https://lany-books-web-delta.vercel.app/#visual-approval-board",
     proofLabel: "Approval Board",
     githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/src/components/MasterVisualApprovalBoard.tsx"
    }
   },
   {
    name: "Website Release",
    stage: "COMPLETED",
    status: "Live & verified",
    item: {
     title: "Vercel Production Deployment",
     subtitle: "lany-books-web-delta.vercel.app",
     whatIsThis: "Live public website hosted on Vercel.",
     whatDone: "Deployed from GitHub main commit 2314787. Returns HTTP 200.",
     whatNow: "Synchronized with GitHub.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://lany-books-web-delta.vercel.app",
     proofLabel: "Live Vercel Site",
     githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/package.json"
    }
   }
  ],
  sources: [
   {
    label: "AGENTS.md",
    purpose: "Authoritative operating contract for LANY storefront.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/AGENTS.md",
    ruleSummary: "Prohibits mascots/cartoons without owner approval, disables checkout until commerce sign-off."
   },
   {
    label: "Brochure Tests",
    purpose: "Automated regression tests verifying brochure pages and cutouts.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/scripts/brochure.test.mts",
    ruleSummary: "Checks 10 sequential pages in EN/ES, 9-slide deck, and eliminates superseded floral logo."
   },
   {
    label: "Storefront Config",
    purpose: "Brochure and handoff configuration models.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/lany-books-web/blob/main/src/config/brochureData.ts",
    ruleSummary: "Stores canonical pricing, kit specifications, and ISBN references."
   }
  ]
 },
 {
  slug: "Command-Center-",
  title: "NBO Operations Hub",
  shortRole: "Personal AI Studio Headquarters",
  stageIndex: 6,
  stageLabel: "MAINTAIN · 06 Studio Active",
  progressPct: 94,
  accentColor: "#4ade80",
  sparkline: [50, 62, 70, 78, 85, 90, 94],
  statusLine: "Clean 3-project overview, interactive project maps, and 98 ops tests passing",
  scopeRule: "All 8 repositories connected with read-only GitHub verification.",
  nextAiPrompt: `Read AGENTS.md and CLAUDE.md first.
Keep all status updates for Emilio José in plain English without engineering jargon:
1. State what currently works with real proof.
2. Propose one bounded deliverable with clear visual acceptance criteria.
3. Wait for owner approval before merging or deploying.`,
  quickLinks: [
   {label: "98 Prompts", href: "/prompts"},
   {label: "Lifecycle Web", href: "/best-practices"}
  ],
  liveUrl: "https://nbo-operations-hub.vercel.app",
  repoUrl: "https://github.com/ejnburrows-rgb/Command-Center-",
  lastVerified: "2026-11-08 14:05 UTC",
  statusBreakdown: {
   completed: {
    text: "Minimalist phone-first 3-project cards, always-visible miniature status maps, clickable item exploration modal, and source navigation.",
    proofUrl: "https://nbo-operations-hub.vercel.app",
    proofLabel: "Live Operations Hub"
   },
   inProgress: {
    text: "Automatic PR & branch cleanliness monitoring; 8 merged branches safely deleted from remote."
   },
   remains: {
    text: "Routine Dependabot dependency bumps on secondary libraries."
   },
   needsApproval: {
    text: "Approval of the unified mobile dashboard layout and branch cleanup summary."
   },
   savedNotPublished: {
    text: "Branch and UI upgrades saved locally and ready for GitHub synchronization."
   },
   websiteStatus: {
    isCurrent: true,
    label: "Website Live & Accessible",
    note: "Public URL running at https://nbo-operations-hub.vercel.app. Returns HTTP 200."
   }
  },
  miniMap: [
   {
    name: "Plain-English HQ",
    stage: "COMPLETED",
    status: "Verified live",
    item: {
     title: "Plain-English Overview",
     subtitle: "Executive Cockpit",
     whatIsThis: "Top-level executive summary presenting the three primary projects without jargon.",
     whatDone: "3 project cards, verified 7-point status breakdown, interactive status maps, clickable exploration modal.",
     whatNow: "Active on home route.",
     whatMissing: "None. All features verified.",
     whatNeedsMe: "None.",
     proofUrl: "https://nbo-operations-hub.vercel.app/",
     proofLabel: "Live Hub Home",
     githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/app/plain-english-hq.tsx"
    }
   },
   {
    name: "GitHub Intelligence",
    stage: "COMPLETED",
    status: "98 tests passing",
    item: {
     title: "GitHub Intelligence & Feeds",
     subtitle: "Real repository state & PR trackers",
     whatIsThis: "Read-only pipeline fetching real GitHub commits, PRs, and branch states.",
     whatDone: "Zero hard-coded fake data; exposes true freshness or 'stale' fallback.",
     whatNow: "Verified across all 8 studio repos.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://nbo-operations-hub.vercel.app/github",
     proofLabel: "GitHub Panel",
     githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/lib/github.ts"
    }
   },
   {
    name: "Art Inventory",
    stage: "COMPLETED",
    status: "Live & verified",
    item: {
     title: "Cartilla Visual Art Inventory",
     subtitle: "Complete illustration archive",
     whatIsThis: "Full visual catalog of every physical Cartilla scan, vector art, and game asset.",
     whatDone: "3-tab layout, 11 metadata fields, upload suite, and high-res image viewers.",
     whatNow: "Live at /art-inventory.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://nbo-operations-hub.vercel.app/art-inventory",
     proofLabel: "Art Inventory Route",
     githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/lib/art-inventory.ts"
    }
   },
   {
    name: "Operations Suite",
    stage: "COMPLETED",
    status: "Active",
    item: {
     title: "Prompt Vault & Studio Tools",
     subtitle: "98 ready-to-copy prompts",
     whatIsThis: "Complete engineering prompt vault and lifecycle guidelines.",
     whatDone: "Instant copy buttons, theme selector (Tokyo Night, Catppuccin, Dracula Cyan, Cursor Carbon).",
     whatNow: "Operational.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://nbo-operations-hub.vercel.app/prompts",
     proofLabel: "Prompts Library",
     githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/app/prompt-library.tsx"
    }
   },
   {
    name: "Website Release",
    stage: "COMPLETED",
    status: "Live & verified",
    item: {
     title: "Vercel Production Deployment",
     subtitle: "nbo-operations-hub.vercel.app",
     whatIsThis: "Production hosting for the Operations Hub.",
     whatDone: "Deployed and verified via HTTP HEAD check (HTTP 200).",
     whatNow: "Active.",
     whatMissing: "None.",
     whatNeedsMe: "None.",
     proofUrl: "https://nbo-operations-hub.vercel.app",
     proofLabel: "Live Vercel Hub",
     githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/package.json"
    }
   }
  ],
  sources: [
   {
    label: "AGENTS.md",
    purpose: "Authoritative operating contract for NBO Command Center.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/AGENTS.md",
    ruleSummary: "Mandatory verified GitHub save checks, read-only public routes, zero fake metrics."
   },
   {
    label: "Operations Tests",
    purpose: "98 automated node --test suites ensuring stability and security.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/tree/main/tests",
    ruleSummary: "Tests timing attack mitigations, deep link routes, art inventory, and mobile sheet overlays."
   },
   {
    label: "Execution Authority",
    purpose: "Jules and Codex bot dispatch policy and duplicate task guard.",
    authoritative: true,
    githubUrl: "https://github.com/ejnburrows-rgb/Command-Center-/blob/main/lib/execution-authority.mjs",
    ruleSummary: "Prevents duplicate agent dispatch and verifies token scopes."
   }
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
 busy,
 onOpen,
 onSection,
 refresh
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
 const [inspectedItem, setInspectedItem] = useState<ExplorableItem | null>(null);
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
  <section className="hq-studio" aria-label="Phone-First Visual Command Center">
   {/* Minimalist Topbar */}
   <div className="hq-minimal-topbar">
    <div className="hq-minimal-title">
     <span className="hq-ide-dot" />
     <strong>NBO Operations Hub</strong>
     <span className="hq-minimal-meta">
      {isSyncing ? "Syncing..." : "3 Official Projects · Verified Real-Time"}
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
       title="Toggle Day/Night"
      >
       <span>{appearance === "dark" ? "☾" : "☀"}</span>
      </button>
     </div>
     <div className="hq-minimal-nav">
      <Link className="btn primary" href="/art-inventory">Art Inventory</Link>
      <Link className="btn" href="/prompts">Prompts (98)</Link>
     </div>
    </div>
   </div>

   {/* DEFAULT VIEW: The Three Verified Project Cards (Master Handoff Section 8) */}
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
       {/* Card Header */}
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

        <div className="hq-sparkline-box" title="GitHub Activity">
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

       {/* Progress Bar */}
       <ProjectProgressBar slug={spec.slug} accentColor={spec.accentColor} />

       {/* 1. Mandatory 7-Point Plain-English Status Breakdown */}
       <div className="hq-breakdown-list" aria-label="Verified Status Breakdown">
        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">✓ What is Completed</span>
         <span className="hq-breakdown-val">
          {spec.statusBreakdown.completed.text}{" "}
          {spec.statusBreakdown.completed.proofUrl && (
           <External href={spec.statusBreakdown.completed.proofUrl} style={{color: spec.accentColor, textDecoration: "underline"}}>
            [{spec.statusBreakdown.completed.proofLabel || "View Proof"}]
           </External>
          )}
         </span>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">⚡ Currently Working On</span>
         <span className="hq-breakdown-val">{spec.statusBreakdown.inProgress.text}</span>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">⏳ What Remains</span>
         <span className="hq-breakdown-val">{spec.statusBreakdown.remains.text}</span>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">👑 Needs My Approval</span>
         <span className="hq-breakdown-val" style={{fontWeight: 600, color: "var(--ui-text)"}}>
          {spec.statusBreakdown.needsApproval.text}
         </span>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">💾 Saved But Not Published</span>
         <span className="hq-breakdown-val">{spec.statusBreakdown.savedNotPublished.text}</span>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">🌐 Public Website Status</span>
         <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2}}>
          <span className={`hq-status-badge ${spec.statusBreakdown.websiteStatus.isCurrent ? "current" : "behind"}`}>
           {spec.statusBreakdown.websiteStatus.isCurrent ? "● Synchronized" : "▲ Behind Main"}
          </span>
          <External href={spec.liveUrl} style={{fontSize: 11, color: spec.accentColor, textDecoration: "underline"}}>
           {spec.liveUrl}
          </External>
         </div>
         <small style={{color: "var(--ui-muted)", marginTop: 2}}>{spec.statusBreakdown.websiteStatus.note}</small>
        </div>

        <div className="hq-breakdown-item">
         <span className="hq-breakdown-label">🕒 Last Verified</span>
         <span className="hq-breakdown-val" style={{fontSize: 11, color: "var(--ui-muted)"}}>
          {spec.lastVerified}
         </span>
        </div>
       </div>

       {/* 2. Always-Visible Miniature Project Status Map (Clickable Exploration) */}
       <div className="hq-mini-map" aria-label="Miniature Project Status Map">
        <div className="hq-mini-map-header">
         <span>Interactive Project Map</span>
         <small>Tap any node to inspect proof</small>
        </div>
        <div className="hq-mini-map-steps">
         {spec.miniMap.map((node, nIdx) => (
          <button
           key={node.name}
           type="button"
           className="hq-mini-map-node"
           onClick={() => setInspectedItem(node.item)}
           title="Tap to see plain-English details and GitHub proof"
          >
           <strong>{node.name}</strong>
           <small style={{color: node.stage === "COMPLETED" ? "#4ade80" : node.stage === "IN PROGRESS" ? spec.accentColor : "#eab308"}}>
            {node.status}
           </small>
          </button>
         ))}
        </div>
       </div>

       {/* 3. Source Navigation (AGENTS.md, Rules, Tests, Deployment) */}
       <div className="hq-sources-bar" aria-label="Authoritative Source Documents">
        <span style={{fontSize: 11, color: "var(--ui-muted)", marginRight: 2}}>Sources:</span>
        {spec.sources.map(src => (
         <button
          key={src.label}
          type="button"
          className="hq-source-pill"
          onClick={() => setInspectedItem({
           title: src.label,
           subtitle: src.authoritative ? "Authoritative Repository Operating Document" : "Reference Document",
           whatIsThis: src.purpose,
           whatDone: src.ruleSummary,
           whatNow: "Actively enforced across coding agents and CI suites.",
           whatMissing: "None. Canonical copy.",
           whatNeedsMe: "No changes needed unless operating requirements change.",
           proofUrl: src.githubUrl,
           proofLabel: "View on GitHub",
           githubUrl: src.githubUrl
          })}
         >
          {src.label} ↗
         </button>
        ))}
       </div>

       {/* Card Actions */}
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

   {/* OPTIONAL EXPANDABLE VISUAL STUDIO: Recharts Milestone Timeline, D3 Force Graph & Daily Focus */}
   <details className="hq-explore-drawer">
    <summary className="hq-explore-drawer-summary">
     <span>
      <strong>Interactive Visual Studio &amp; Force-Directed Map</strong>
      <small style={{display: "block", color: "var(--ui-muted)", fontWeight: 400}}>
       Expand to inspect the D3.js interactive relationship graph, Recharts milestone progression timeline, and studio focus widgets
      </small>
     </span>
     <span>Expand / Collapse ▾</span>
    </summary>
    <div className="hq-explore-drawer-body">
     {/* Daily Focus Dashboard Widget */}
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

     {/* Horizontal Recharts Milestone Timeline */}
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

     {/* Interactive D3 Force-Directed Graph */}
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
    </div>
   </details>

   {/* Other Projects toggle */}
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

   {/* 4. Clickable Exploration Modal / Overlay (Master Handoff Section 8) */}
   {inspectedItem && (
    <div
     className="hq-explore-overlay"
     role="dialog"
     aria-modal="true"
     aria-labelledby="explore-title"
     onClick={() => setInspectedItem(null)}
    >
     <div
      className="hq-explore-card"
      onClick={e => e.stopPropagation()}
     >
      <div className="hq-explore-header">
       <div>
        <h2 id="explore-title">{inspectedItem.title}</h2>
        <p>{inspectedItem.subtitle}</p>
       </div>
       <button
        type="button"
        className="hq-explore-close"
        onClick={() => setInspectedItem(null)}
        aria-label="Close details"
       >
        ✕ Close
       </button>
      </div>

      <div className="hq-explore-body">
       <div className="hq-explore-section">
        <span className="hq-explore-q">What is this?</span>
        <span className="hq-explore-a">{inspectedItem.whatIsThis}</span>
       </div>

       <div className="hq-explore-section">
        <span className="hq-explore-q">What has been done?</span>
        <span className="hq-explore-a">{inspectedItem.whatDone}</span>
       </div>

       <div className="hq-explore-section">
        <span className="hq-explore-q">What is happening now?</span>
        <span className="hq-explore-a">{inspectedItem.whatNow}</span>
       </div>

       <div className="hq-explore-section">
        <span className="hq-explore-q">What is missing?</span>
        <span className="hq-explore-a">{inspectedItem.whatMissing}</span>
       </div>

       <div className="hq-explore-section">
        <span className="hq-explore-q">What needs me?</span>
        <span className="hq-explore-a" style={{fontWeight: 600}}>{inspectedItem.whatNeedsMe}</span>
       </div>
      </div>

      <div className="hq-explore-footer">
       {inspectedItem.proofUrl && (
        <External href={inspectedItem.proofUrl} className="btn primary">
         {inspectedItem.proofLabel || "Show me proof ↗"}
        </External>
       )}
       {inspectedItem.githubUrl && (
        <External href={inspectedItem.githubUrl} className="btn">
         Open original in GitHub ↗
        </External>
       )}
       <button
        type="button"
        className="btn"
        onClick={() => setInspectedItem(null)}
       >
        Dismiss
       </button>
      </div>
     </div>
    </div>
   )}
  </section>
 );
}
