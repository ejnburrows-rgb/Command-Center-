"use client";
import {useState} from "react";
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
import type {LifecycleStageSpec, StudioProjectItem} from "./lifecycle-force-graph";

export type MilestoneTimelinePoint = {
 nodeId: string;
 stageIdx: number;
 code: string;
 stageTitle: string;
 timelineTick: string;
 horizontalLabel: string;
 dueDate: string;
 milestone: string;
 firmRole: string;
 completionPct: number;
 cumulativeProgression: number;
 targetBenchmark: number;
 statusLabel: "Completed" | "In Progress" | "Upcoming";
 statusColor: string;
 tasksCompleted: string;
 Cartilla: number;
 LANY: number;
 NBOHub: number;
};

export default function RechartsMilestoneTimeline({
 project,
 stages,
 selectedStageId,
 timelineData,
 isStageCheckDone,
 onSelectStage,
 onToggleCheck,
 onCopyPrompt,
 copiedKey
}:{
 project: StudioProjectItem;
 stages: LifecycleStageSpec[];
 selectedStageId: string;
 timelineData: MilestoneTimelinePoint[];
 isStageCheckDone: (checkId: string, idx: number, stageIdx: number) => boolean;
 onSelectStage: (stageId: string) => void;
 onToggleCheck: (stageId: string, checkId: string, idx: number, stageIdx: number) => void;
 onCopyPrompt: (key: string, prompt: string) => void;
 copiedKey: string;
}) {
 const [viewMode, setViewMode] = useState<"progression" | "gantt" | "compare">("progression");

 const activeStageIdx = Math.max(
  0,
  stages.findIndex(s => s.id === selectedStageId)
 );
 const activeStage = stages[activeStageIdx] || stages[0];
 const activePoint = timelineData[activeStageIdx] || timelineData[0];

 return (
  <section
   className="panel recharts-timeline-panel"
   aria-label="Horizontal Recharts Milestone and Status Progression Timeline"
  >
   {/* Header + View Switcher */}
   <div className="lifecycle-canvas-top">
    <div>
     <span className="hq-stage-code">
      RECHARTS HORIZONTAL MILESTONE TIMELINE · DUE DATES &amp; STATUS PROGRESSION
     </span>
     <h2>
      {project.name} — At-a-Glance Milestones, Due Dates &amp; Progression
     </h2>
    </div>

    <div className="recharts-mode-switch" role="group" aria-label="Recharts timeline view mode">
     <button
      type="button"
      className={"hq-theme-pill " + (viewMode === "progression" ? "active" : "")}
      onClick={() => setViewMode("progression")}
     >
      Horizontal Date &amp; Status Curve
     </button>
     <button
      type="button"
      className={"hq-theme-pill " + (viewMode === "gantt" ? "active" : "")}
      onClick={() => setViewMode("gantt")}
     >
      Horizontal Milestone Bars
     </button>
     <button
      type="button"
      className={"hq-theme-pill " + (viewMode === "compare" ? "active" : "")}
      onClick={() => setViewMode("compare")}
     >
      All Projects Comparison
     </button>
    </div>
   </div>

   {/* Main Recharts Canvas */}
   <div className="recharts-canvas-box" style={{width: "100%", height: 270}}>
    <ResponsiveContainer width="100%" height="100%">
     {viewMode === "progression" ? (
      <ComposedChart
       data={timelineData}
       margin={{top: 16, right: 26, left: -8, bottom: 8}}
       onClick={state => {
        const clicked = (state as any)?.activePayload?.[0]?.payload as MilestoneTimelinePoint | undefined;
        if (clicked?.nodeId) onSelectStage(clicked.nodeId);
       }}
      >
       <defs>
        <linearGradient id="statusProgGrad" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%" stopColor="#4ade80" stopOpacity={0.32} />
         <stop offset="60%" stopColor={project.color} stopOpacity={0.26} />
         <stop offset="100%" stopColor={project.color} stopOpacity={0.05} />
        </linearGradient>
       </defs>
       <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={true} horizontal={true} />
       <XAxis
        dataKey="timelineTick"
        tick={{fill: "var(--ui-text)", fontSize: 11.5, fontWeight: 600}}
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
        cursor={{stroke: project.color, strokeWidth: 1.5, strokeDasharray: "4 4"}}
        content={({active, payload}) => {
         if (!active || !payload?.length) return null;
         const d = payload[0].payload as MilestoneTimelinePoint;
         return (
          <div className="recharts-custom-tooltip">
           <span className="hq-stage-code">
            STAGE {d.code} · DUE {d.dueDate} · {d.statusLabel.toUpperCase()}
           </span>
           <strong>{d.milestone}</strong>
           <div className="recharts-tooltip-row">
            <span>Stage Completion:</span>
            <b>{d.completionPct}% ({d.tasksCompleted})</b>
           </div>
           <div className="recharts-tooltip-row">
            <span>Overall Trajectory:</span>
            <b>{d.cumulativeProgression}%</b>
           </div>
           <small>Click milestone to toggle tasks &amp; copy prompts →</small>
          </div>
         );
        }}
       />
       <ReferenceLine y={100} stroke="rgba(74, 222, 128, 0.3)" strokeDasharray="4 4" />
       <Area
        type="monotone"
        dataKey="cumulativeProgression"
        name="Status Progression Curve"
        stroke={project.color}
        strokeWidth={2.5}
        fill="url(#statusProgGrad)"
       />
       <Bar
        dataKey="completionPct"
        name="Milestone Completion"
        barSize={36}
        radius={[6, 6, 0, 0]}
        style={{cursor: "pointer"}}
       >
        {timelineData.map(entry => {
         const isSel = entry.nodeId === selectedStageId;
         return (
          <Cell
           key={entry.nodeId}
           fill={entry.statusColor}
           fillOpacity={isSel ? 0.95 : 0.68}
           stroke={isSel ? "#ffffff" : entry.statusColor}
           strokeWidth={isSel ? 2 : 1}
          />
         );
        })}
       </Bar>
       <Line
        type="monotone"
        dataKey="targetBenchmark"
        name="Target Schedule"
        stroke="var(--ui-subtle)"
        strokeWidth={1.8}
        strokeDasharray="4 4"
        dot={{r: 4, fill: "var(--ui-panel)", stroke: "var(--ui-subtle)", strokeWidth: 2}}
       />
      </ComposedChart>
     ) : viewMode === "gantt" ? (
      <ComposedChart
       layout="vertical"
       data={timelineData}
       margin={{top: 8, right: 28, left: 12, bottom: 6}}
       onClick={state => {
        const clicked = (state as any)?.activePayload?.[0]?.payload as MilestoneTimelinePoint | undefined;
        if (clicked?.nodeId) onSelectStage(clicked.nodeId);
       }}
      >
       <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" horizontal={true} vertical={true} />
       <XAxis
        type="number"
        domain={[0, 100]}
        tickFormatter={v => `${v}%`}
        tick={{fill: "var(--ui-subtle)", fontSize: 11}}
        axisLine={{stroke: "var(--ui-border)"}}
        tickLine={false}
       />
       <YAxis
        type="category"
        dataKey="horizontalLabel"
        width={215}
        tick={{fill: "var(--ui-text)", fontSize: 11.5, fontWeight: 600}}
        axisLine={{stroke: "var(--ui-border)"}}
        tickLine={false}
       />
       <Tooltip
        cursor={{fill: "rgba(255,255,255,0.04)"}}
        content={({active, payload}) => {
         if (!active || !payload?.length) return null;
         const d = payload[0].payload as MilestoneTimelinePoint;
         return (
          <div className="recharts-custom-tooltip">
           <span className="hq-stage-code">
            STAGE {d.code} · DUE {d.dueDate} · {d.statusLabel.toUpperCase()}
           </span>
           <strong>{d.milestone}</strong>
           <div className="recharts-tooltip-row">
            <span>Status Progression:</span>
            <b>{d.completionPct}% ({d.tasksCompleted})</b>
           </div>
          </div>
         );
        }}
       />
       <Bar
        dataKey="completionPct"
        name="Milestone Progress"
        radius={[0, 6, 6, 0]}
        barSize={20}
        style={{cursor: "pointer"}}
       >
        {timelineData.map(entry => {
         const isSel = entry.nodeId === selectedStageId;
         return (
          <Cell
           key={entry.nodeId}
           fill={entry.statusColor}
           stroke={isSel ? "#ffffff" : "none"}
           strokeWidth={isSel ? 1.5 : 0}
          />
         );
        })}
       </Bar>
       <Line
        type="monotone"
        dataKey="targetBenchmark"
        name="Target Readiness"
        stroke={project.color}
        strokeWidth={2}
        dot={{r: 4, fill: project.color}}
       />
      </ComposedChart>
     ) : (
      <ComposedChart
       data={timelineData}
       margin={{top: 14, right: 24, left: -8, bottom: 6}}
      >
       <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={false} />
       <XAxis
        dataKey="timelineTick"
        tick={{fill: "var(--ui-text)", fontSize: 11}}
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

   {/* Horizontal Milestone Nodes & Due-Date Track (Replaces Static List) */}
   <div className="milestone-date-strip" role="tablist" aria-label="Milestone timeline nodes">
    {timelineData.map(item => {
     const isSel = item.nodeId === selectedStageId;
     return (
      <button
       key={item.nodeId}
       type="button"
       role="tab"
       aria-selected={isSel}
       className={"milestone-chip " + (isSel ? "active" : "")}
       onClick={() => onSelectStage(item.nodeId)}
      >
       <div className="milestone-chip-top">
        <span className="milestone-code" style={{color: item.statusColor}}>
         {item.code} · {item.statusLabel}
        </span>
        <span className="milestone-due">Due {item.dueDate}</span>
       </div>
       <strong>{item.milestone}</strong>
       <div className="lt-bar-track" style={{marginTop: 4}}>
        <div
         className="lt-bar-fill"
         style={{width: `${item.completionPct}%`, background: item.statusColor}}
        />
       </div>
      </button>
     );
    })}
   </div>

   {/* Horizontal Selected Milestone Bar (Interactive Task Pills + 1-Click Prompts, No Static Vertical List) */}
   <div className="recharts-selected-bar">
    <div className="recharts-selected-meta">
     <span className="hq-stage-code" style={{color: activePoint.statusColor}}>
      STAGE {activeStage.code} · DUE {activePoint.dueDate} · {activePoint.statusLabel.toUpperCase()} ({activePoint.completionPct}%)
     </span>
     <strong>{activePoint.milestone}</strong>
    </div>

    {/* Horizontal Interactive Task Pills */}
    <div className="recharts-task-pills" role="group" aria-label="Milestone task toggles">
     {activeStage.checkpoints.map((chk, idx) => {
      const done = isStageCheckDone(chk.id, idx, activeStageIdx);
      return (
       <button
        key={chk.id}
        type="button"
        className={"hq-theme-pill " + (done ? "active" : "")}
        onClick={() => onToggleCheck(activeStage.id, chk.id, idx, activeStageIdx)}
        style={{
         borderColor: done ? "#4ade80" : "var(--ui-border)",
         color: done ? "#4ade80" : "var(--ui-text)"
        }}
       >
        <span>{done ? "✓" : "○"}</span>
        <span>{chk.label}</span>
       </button>
      );
     })}
    </div>

    {/* 1-Click Stage Prompt Copy Buttons */}
    <div className="recharts-prompt-pills">
     {activeStage.readyPrompts.map(rp => (
      <button
       key={rp.id}
       type="button"
       className="btn primary"
       onClick={() => onCopyPrompt(rp.id, rp.prompt)}
      >
       {copiedKey === rp.id ? "✓ Copied Prompt!" : `Copy: ${rp.title}`}
      </button>
     ))}
    </div>
   </div>
  </section>
 );
}
