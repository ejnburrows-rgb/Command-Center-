"use client";
import {useEffect,useMemo,useState} from "react";
import {LIFECYCLE_NODES,STUDIO_PROJECTS} from "./best-practices";
import type {StudioProjectItem} from "./lifecycle-force-graph";

const WEB_STATE_KEY = "nbo-lifecycle-web-v1";
const SYNC_EVENT = "nbo-lifecycle-sync";

const FALLBACK_PROJECT_DEFAULTS: Record<string, {color: string; defaultPct: number[]}> = {
 "cartilla-de-gretel": {color: "#7aa2f7", defaultPct: [100, 100, 100, 67, 33, 0]},
 "lany-books-web": {color: "#cba6f7", defaultPct: [100, 100, 67, 33, 0, 0]},
 "command-center-": {color: "#4ade80", defaultPct: [100, 100, 100, 100, 100, 67]},
 "otto-crm": {color: "#8be9fd", defaultPct: [100, 67, 33, 0, 0, 0]},
 "otto": {color: "#8be9fd", defaultPct: [100, 67, 33, 0, 0, 0]},
 "art-vault": {color: "#f59e0b", defaultPct: [100, 100, 67, 67, 33, 0]},
 "vault": {color: "#f59e0b", defaultPct: [100, 100, 67, 67, 33, 0]},
 "business-hub": {color: "#38bdf8", defaultPct: [100, 67, 33, 33, 0, 0]},
 "nbo-": {color: "#a78bfa", defaultPct: [100, 100, 67, 33, 0, 0]}
};

export function resolveStudioProjectConfig(slug: string, accentOverride?: string): StudioProjectItem {
 const found = STUDIO_PROJECTS.find(p => p.slug.toLowerCase() === slug.toLowerCase());
 if (found) {
  return accentOverride ? {...found, color: accentOverride} : found;
 }
 const fb = FALLBACK_PROJECT_DEFAULTS[slug.toLowerCase()] || {
  color: accentOverride || "#7aa2f7",
  defaultPct: [100, 67, 33, 0, 0, 0]
 };
 return {
  slug,
  shortName: slug,
  name: slug,
  color: accentOverride || fb.color,
  category: "Repository",
  defaultPct: fb.defaultPct,
  dueDates: ["Oct 20", "Oct 27", "Nov 04", "Nov 11", "Nov 18", "Nov 25"],
  milestones: LIFECYCLE_NODES.map(n => n.subtitle)
 };
}

export function computeProjectTaskMetrics(
 slug: string,
 webChecks: Record<string, boolean>,
 accentOverride?: string
) {
 const config = resolveStudioProjectConfig(slug, accentOverride);
 let completedTasks = 0;
 let totalTasks = 0;

 const stagesSummary = LIFECYCLE_NODES.map((stage, stageIdx) => {
  const defaultStagePct = config.defaultPct[stageIdx] ?? 0;
  const defaultChecks = Math.round((defaultStagePct / 100) * stage.checkpoints.length);

  const tasks = stage.checkpoints.map((chk, chkIdx) => {
   const key = `${config.slug}:${chk.id}`;
   const altKey = `${slug}:${chk.id}`;
   const done =
    key in webChecks
     ? !!webChecks[key]
     : altKey in webChecks
     ? !!webChecks[altKey]
     : chkIdx < defaultChecks;
   totalTasks += 1;
   if (done) completedTasks += 1;
   return {
    id: chk.id,
    short: chk.short,
    label: chk.label,
    done,
    chkIdx,
    stageIdx
   };
  });

  const stageDoneCount = tasks.filter(t => t.done).length;
  const stagePct = Math.round((stageDoneCount / tasks.length) * 100);
  return {
   stageId: stage.id,
   code: stage.code,
   title: stage.title,
   stageDoneCount,
   stageTotal: tasks.length,
   stagePct,
   tasks
  };
 });

 const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
 const activeStage =
  stagesSummary.find(s => s.stagePct < 100) || stagesSummary[stagesSummary.length - 1];

 const phaseLabel =
  overallPct === 100
   ? "MAINTAIN · Complete"
   : activeStage.code === "01" || activeStage.code === "02"
   ? "START · Planning"
   : activeStage.code === "03"
   ? "BUILD · Execution"
   : "FINISH · QA & Launch";

 return {
  config,
  completedTasks,
  totalTasks,
  overallPct,
  phaseLabel,
  activeStage,
  stagesSummary
 };
}

export default function ProjectProgressBar({
 slug,
 accentColor,
 compact = false
}:{
 slug: string;
 accentColor?: string;
 compact?: boolean;
}) {
 const [webChecks, setWebChecks] = useState<Record<string, boolean>>({});
 const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

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

 const metrics = useMemo(
  () => computeProjectTaskMetrics(slug, webChecks, accentColor),
  [slug, webChecks, accentColor]
 );

 const focusedStage = useMemo(() => {
  if (!expandedStageId) return null;
  return (
   metrics.stagesSummary.find(s => s.stageId === expandedStageId) || metrics.activeStage
  );
 }, [expandedStageId, metrics]);

 function handleToggleTask(checkId: string, currentDone: boolean) {
  const canonicalSlug = metrics.config.slug;
  const key = `${canonicalSlug}:${checkId}`;
  const next = {...webChecks, [key]: !currentDone};
  setWebChecks(next);
  try {
   localStorage.setItem(WEB_STATE_KEY, JSON.stringify(next));
   window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {}
 }

 const barColor = metrics.overallPct === 100 ? "#4ade80" : metrics.config.color;

 return (
  <div
   className={"project-progress-component " + (compact ? "compact" : "")}
   aria-label={`Project task completion progress: ${metrics.overallPct}%`}
  >
   {/* Top Row: Phase Label + Task Ratio + Completion Percentage */}
   <div className="ppb-header">
    <div className="ppb-meta">
     <span className="ppb-phase-dot" style={{background: barColor}} />
     <span className="ppb-phase-text">{metrics.phaseLabel}</span>
     <span className="ppb-task-count">
      ({metrics.completedTasks}/{metrics.totalTasks} tasks)
     </span>
    </div>

    <div className="ppb-right">
     <strong className="ppb-pct-value" style={{color: barColor}}>
      {metrics.overallPct}%
     </strong>
     <button
      type="button"
      className="ppb-expand-btn"
      onClick={e => {
       e.preventDefault();
       e.stopPropagation();
       setExpandedStageId(
        expandedStageId ? null : metrics.activeStage.stageId
       );
      }}
      aria-expanded={Boolean(expandedStageId)}
      title="Toggle interactive task checklist"
     >
      {expandedStageId ? "Hide tasks ▴" : "Tasks ▾"}
     </button>
    </div>
   </div>

   {/* Primary Smooth Fill Track */}
   <div
    className="ppb-track"
    role="progressbar"
    aria-valuenow={metrics.overallPct}
    aria-valuemin={0}
    aria-valuemax={100}
    onClick={e => {
     e.preventDefault();
     e.stopPropagation();
     setExpandedStageId(expandedStageId ? null : metrics.activeStage.stageId);
    }}
   >
    <div
     className="ppb-fill"
     style={{
      width: `${metrics.overallPct}%`,
      background: barColor
     }}
    />
   </div>

   {/* Interactive 6-Stage Micro-Segments (Click any segment to inspect/toggle its tasks) */}
   {!compact && (
    <div className="ppb-segments" role="group" aria-label="Lifecycle stage progress segments">
     {metrics.stagesSummary.map(st => {
      const isSelected = expandedStageId === st.stageId;
      const segColor =
       st.stagePct === 100
        ? "#4ade80"
        : st.stagePct > 0
        ? metrics.config.color
        : "var(--ui-border)";
      return (
       <button
        key={st.stageId}
        type="button"
        className={"ppb-seg-btn " + (isSelected ? "selected" : "")}
        onClick={e => {
         e.preventDefault();
         e.stopPropagation();
         setExpandedStageId(isSelected ? null : st.stageId);
        }}
        title={`Stage ${st.code} · ${st.title}: ${st.stagePct}% (${st.stageDoneCount}/${st.stageTotal} tasks)`}
       >
        <span className="ppb-seg-bar">
         <i style={{width: `${st.stagePct}%`, background: segColor}} />
        </span>
        <small>{st.code}</small>
       </button>
      );
     })}
    </div>
   )}

   {/* Interactive Inline Task Drawer (Toggles real task completion right inside the card) */}
   {focusedStage && (
    <div
     className="ppb-task-drawer"
     onClick={e => {
      e.stopPropagation();
     }}
    >
     <div className="ppb-drawer-top">
      <span>
       STAGE {focusedStage.code} · {focusedStage.title.toUpperCase()} ({focusedStage.stagePct}%)
      </span>
      <div className="ppb-stage-switcher">
       {metrics.stagesSummary.map(s => (
        <button
         key={s.stageId}
         type="button"
         className={"ppb-mini-tab " + (s.stageId === focusedStage.stageId ? "active" : "")}
         onClick={() => setExpandedStageId(s.stageId)}
        >
         {s.code}
        </button>
       ))}
      </div>
     </div>

     <div className="ppb-task-pills">
      {focusedStage.tasks.map(t => (
       <button
        key={t.id}
        type="button"
        className={"ppb-task-pill " + (t.done ? "done" : "")}
        onClick={() => handleToggleTask(t.id, t.done)}
       >
        <span className="ppb-check-icon">{t.done ? "✓" : "○"}</span>
        <span>{t.label}</span>
       </button>
      ))}
     </div>
    </div>
   )}
  </div>
 );
}
