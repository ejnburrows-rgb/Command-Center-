"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import type {Project} from "./hub-data";
import {projectPath} from "./route-paths";
import type {LifecycleStageSpec,StudioProjectItem} from "./lifecycle-force-graph";

export type DailyFocusItem = {
 projectSlug: string;
 projectName: string;
 shortName: string;
 category: string;
 color: string;
 lifecyclePhase: "START" | "BUILD" | "FINISH" | "MAINTAIN";
 stageId: string;
 stageCode: string;
 stageTitle: string;
 milestone: string;
 dueDate: string;
 overallPct: number;
 priorityLevel: "HIGH" | "DECISION" | "ACTIVE" | "MAINTAIN";
 priorityLabel: string;
 nextCheckId: string;
 nextCheckIdx: number;
 stageIdx: number;
 nextActionText: string;
 whyItMatters: string;
 scopeGuard?: string;
 aiPrompt: string;
 openPrs: number | string;
 openIssues: number | string;
 quickHref: string;
 quickLabel: string;
 allDone: boolean;
};

const SCOPE_GUARDS: Record<string, string> = {
 "cartilla-de-gretel": "PR #877 locked to TUTOR_1073_ONLY · 10 workbook art subjects flagged",
 "lany-books-web": "Storefront & mobile reader verification required before release",
 "Command-Center-": "Read-only GitHub evidence · Preserve all 96 automated tests",
 "otto-crm": "Diaflow & pipeline blueprint verification before CRM rollout",
 "art-vault": "Canonical asset checksums & 422 Cartilla media references"
};

function mapStageToFourPhase(stageCode: string, overallPct: number): "START" | "BUILD" | "FINISH" | "MAINTAIN" {
 if (overallPct === 100) return "MAINTAIN";
 if (stageCode === "01" || stageCode === "02") return "START";
 if (stageCode === "03") return "BUILD";
 if (stageCode === "04" || stageCode === "05") return "FINISH";
 return "MAINTAIN";
}

export function buildDailyFocusItems(
 studioProjects: StudioProjectItem[],
 stages: LifecycleStageSpec[],
 liveProjects: Project[],
 isCheckDoneForProject: (projSlug: string, checkId: string, idx: number, stageIdx: number) => boolean
): DailyFocusItem[] {
 const liveMap = new Map(liveProjects.map(p => [p.slug.toLowerCase(), p]));

 return studioProjects.map(proj => {
  const live = liveMap.get(proj.slug.toLowerCase());
  let totalChecks = 0;
  let completedChecks = 0;

  let activeStageIdx = stages.length - 1;
  let activeCheckIdx = 0;
  let foundIncomplete = false;

  stages.forEach((st, sIdx) => {
   st.checkpoints.forEach((chk, cIdx) => {
    totalChecks += 1;
    const done = isCheckDoneForProject(proj.slug, chk.id, cIdx, sIdx);
    if (done) {
     completedChecks += 1;
    } else if (!foundIncomplete) {
     foundIncomplete = true;
     activeStageIdx = sIdx;
     activeCheckIdx = cIdx;
    }
   });
  });

  const overallPct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
  const stage = stages[activeStageIdx] || stages[0];
  const check = stage.checkpoints[activeCheckIdx] || stage.checkpoints[0];
  const dueDate = proj.dueDates[activeStageIdx] || "TBD";
  const milestone = proj.milestones[activeStageIdx] || stage.subtitle;
  const lifecyclePhase = mapStageToFourPhase(stage.code, overallPct);

  let priorityLevel: DailyFocusItem["priorityLevel"] = "ACTIVE";
  let priorityLabel = "NEXT ACTION";

  if (!foundIncomplete) {
   priorityLevel = "MAINTAIN";
   priorityLabel = "ALL VERIFIED";
  } else if (proj.slug === "cartilla-de-gretel") {
   priorityLevel = "DECISION";
   priorityLabel = "OWNER DECISION · HIGH";
  } else if (proj.slug === "lany-books-web" || stage.code === "04" || stage.code === "05") {
   priorityLevel = "HIGH";
   priorityLabel = "HIGH PRIORITY";
  } else {
   priorityLevel = "ACTIVE";
   priorityLabel = `${lifecyclePhase} FOCUS`;
  }

  const scopeGuard = SCOPE_GUARDS[proj.slug];
  const stagePrompt = stage.readyPrompts[0]?.prompt || stage.plainWhy;

  const aiPrompt = `You are working on "${proj.name}" for Emilio José.
Read CLAUDE.md and AGENTS.md first.
- LIFECYCLE STAGE: ${lifecyclePhase} (Stage ${stage.code} · ${stage.title})
- CURRENT MILESTONE: ${milestone} (Due ${dueDate})
- IMMEDIATE NEXT ACTION: ${foundIncomplete ? check.label : "Run post-launch maintenance & backup check"}
${scopeGuard ? `- STRICT SCOPE RULE: ${scopeGuard}\n` : ""}- INSTRUCTION:
${stagePrompt}
- Report back in plain English: WORKS (with proof) / DOES NOT WORK / NOT VERIFIED / NEXT.`;

  const quickHref =
   proj.slug === "cartilla-de-gretel" ? "/art-inventory" : projectPath(proj.slug);
  const quickLabel =
   proj.slug === "cartilla-de-gretel" ? "Art Inventory" : "Project View";

  return {
   projectSlug: proj.slug,
   projectName: proj.name,
   shortName: proj.shortName,
   category: proj.category,
   color: proj.color,
   lifecyclePhase,
   stageId: stage.id,
   stageCode: stage.code,
   stageTitle: stage.title,
   milestone,
   dueDate,
   overallPct,
   priorityLevel,
   priorityLabel,
   nextCheckId: check.id,
   nextCheckIdx: activeCheckIdx,
   stageIdx: activeStageIdx,
   nextActionText: foundIncomplete
    ? check.label
    : "All lifecycle tasks complete — ready for owner release sign-off",
   whyItMatters: stage.plainWhy,
   scopeGuard,
   aiPrompt,
   openPrs: live?.prs ?? "—",
   openIssues: live?.issues ?? "—",
   quickHref,
   quickLabel,
   allDone: !foundIncomplete
  };
 });
}

export default function DailyFocusWidget({
 studioProjects,
 stages,
 liveProjects,
 selectedProject,
 isCheckDoneForProject,
 onSelectProjectStage,
 onToggleTask,
 onCopyPrompt,
 copiedKey
}:{
 studioProjects: StudioProjectItem[];
 stages: LifecycleStageSpec[];
 liveProjects: Project[];
 selectedProject: string;
 isCheckDoneForProject: (projSlug: string, checkId: string, idx: number, stageIdx: number) => boolean;
 onSelectProjectStage: (projSlug: string, stageId: string) => void;
 onToggleTask: (projSlug: string, stageId: string, checkId: string, chkIdx: number, stageIdx: number) => void;
 onCopyPrompt: (key: string, text: string) => void;
 copiedKey: string;
}) {
 const [filter, setFilter] = useState<"all" | "priority">("all");

 const focusItems = useMemo(() => {
  return buildDailyFocusItems(studioProjects, stages, liveProjects, isCheckDoneForProject);
 }, [studioProjects, stages, liveProjects, isCheckDoneForProject]);

 const visibleItems = useMemo(() => {
  if (filter === "priority") {
   return focusItems.filter(
    item => item.priorityLevel === "DECISION" || item.priorityLevel === "HIGH"
   );
  }
  return focusItems;
 }, [focusItems, filter]);

 const highPriorityCount = focusItems.filter(
  i => i.priorityLevel === "DECISION" || i.priorityLevel === "HIGH"
 ).length;

 const dailyMasterBriefing = useMemo(() => {
  const lines = focusItems.map(
   (item, idx) =>
    `${idx + 1}. ${item.projectName} [${item.lifecyclePhase} · ${item.overallPct}% · Due ${item.dueDate}]: Next Action -> ${item.nextActionText}${
     item.scopeGuard ? ` (${item.scopeGuard})` : ""
    }`
  );
  return `NBO STUDIO — DAILY FOCUS BRIEFING FOR EMILIO JOSÉ\n` + lines.join("\n");
 }, [focusItems]);

 return (
  <section
   className="panel daily-focus-widget"
   aria-label="Daily Focus — Next Actions Across All Projects"
  >
   {/* Header Bar */}
   <div className="daily-focus-header">
    <div>
     <div className="daily-focus-eyebrow-row">
      <span className="hq-stage-code">DAILY FOCUS · ONE NEXT ACTION PER PROJECT</span>
      <span className="daily-focus-badge">
       {highPriorityCount} High-Priority {highPriorityCount === 1 ? "Item" : "Items"} Today
      </span>
     </div>
     <h2>What Needs Your Attention Today — Across All Projects in One View</h2>
    </div>

    <div className="daily-focus-controls">
     <div className="recharts-mode-switch" role="group" aria-label="Filter Daily Focus items">
      <button
       type="button"
       className={"hq-theme-pill " + (filter === "all" ? "active" : "")}
       onClick={() => setFilter("all")}
      >
       All Projects ({focusItems.length})
      </button>
      <button
       type="button"
       className={"hq-theme-pill " + (filter === "priority" ? "active" : "")}
       onClick={() => setFilter("priority")}
      >
       High Priority Only ({highPriorityCount})
      </button>
     </div>

     <button
      type="button"
      className="btn primary"
      onClick={() => onCopyPrompt("daily-master-briefing", dailyMasterBriefing)}
     >
      {copiedKey === "daily-master-briefing"
       ? "✓ Copied Daily Briefing!"
       : "Copy All Next Actions"}
     </button>
    </div>
   </div>

   {/* Single Summary Rows — Zero Navigation Required */}
   <div className="daily-focus-list" role="list">
    {visibleItems.map(item => {
     const isFocused = item.projectSlug === selectedProject;
     const promptKey = `df-prompt-${item.projectSlug}`;

     return (
      <article
       key={item.projectSlug}
       role="listitem"
       className={
        "daily-focus-row " +
        (isFocused ? "focused " : "") +
        (item.priorityLevel === "DECISION" ? "decision " : "")
       }
       onClick={() => onSelectProjectStage(item.projectSlug, item.stageId)}
      >
       {/* Column 1: Project Identity + 4-Phase Badge + Progress */}
       <div className="df-col-project">
        <div className="df-project-top">
         <span
          className="df-color-dot"
          style={{background: item.color}}
          aria-hidden="true"
         />
         <strong>{item.projectName}</strong>
         <span
          className={"df-phase-pill phase-" + item.lifecyclePhase.toLowerCase()}
          style={{borderColor: item.color, color: item.color}}
         >
          {item.lifecyclePhase} · {item.overallPct}%
         </span>
        </div>
        <div className="df-project-sub">
         <span>
          Stage {item.stageCode}: {item.milestone}
         </span>
         <small>
          Due {item.dueDate}
          {item.openPrs !== "—" ? ` · ${item.openPrs} PRs` : ""}
         </small>
        </div>
       </div>

       {/* Column 2: The Single Next Action + Scope Guard */}
       <div className="df-col-action">
        <div className="df-action-badges">
         <span className={"df-priority-tag prio-" + item.priorityLevel.toLowerCase()}>
          {item.priorityLabel}
         </span>
         {item.scopeGuard && (
          <span className="df-scope-tag">{item.scopeGuard}</span>
         )}
        </div>
        <p className="df-next-action-text">{item.nextActionText}</p>
       </div>

       {/* Column 3: Direct 1-Click Actions (Complete Task, Copy AI Prompt, Open) */}
       <div className="df-col-controls" onClick={e => e.stopPropagation()}>
        {!item.allDone && (
         <button
          type="button"
          className="btn df-complete-btn"
          title="Mark this next action complete and advance to the next task"
          onClick={() =>
           onToggleTask(
            item.projectSlug,
            item.stageId,
            item.nextCheckId,
            item.nextCheckIdx,
            item.stageIdx
           )
          }
         >
          ✓ Complete Next Action
         </button>
        )}

        <button
         type="button"
         className="btn primary"
         onClick={() => onCopyPrompt(promptKey, item.aiPrompt)}
        >
         {copiedKey === promptKey ? "✓ Copied AI Prompt!" : "Copy Next AI Prompt"}
        </button>

        <Link className="btn" href={item.quickHref}>
         {item.quickLabel}
        </Link>
       </div>
      </article>
     );
    })}
   </div>
  </section>
 );
}
