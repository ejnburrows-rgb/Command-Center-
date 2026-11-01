"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import * as d3 from "d3";

export type ForceGraphNode = d3.SimulationNodeDatum & {
 id: string;
 kind: "project" | "stage" | "task";
 label: string;
 fullTitle: string;
 subtitle: string;
 projectSlug: string;
 projectName: string;
 stageId?: string;
 stageCode?: string;
 stageIdx?: number;
 checkId?: string;
 checkIdx?: number;
 dueDate?: string;
 pct?: number;
 done?: boolean;
 color: string;
 radius: number;
};

export type ForceGraphLink = d3.SimulationLinkDatum<ForceGraphNode> & {
 id: string;
 kind: "inter-project" | "project-stage" | "stage-task";
 sourceId: string;
 targetId: string;
 color: string;
};

export type LifecycleStageSpec = {
 id: string;
 code: string;
 title: string;
 subtitle: string;
 firmRole: string;
 angleDeg: number;
 targetPct: number;
 plainWhy: string;
 checkpoints: {id: string; short: string; label: string}[];
 readyPrompts: {id: string; title: string; when: string; prompt: string}[];
 libraryKeywords: string[];
};

export type StudioProjectItem = {
 slug: string;
 shortName: string;
 name: string;
 color: string;
 category: string;
 defaultPct: number[];
 dueDates: string[];
 milestones: string[];
};

export default function LifecycleForceGraph({
 projects,
 stages,
 selectedProject,
 selectedNodeId,
 isCheckDoneForProject,
 getNodeProgressForProject,
 onSelectNode,
 onToggleTask
}:{
 projects: StudioProjectItem[];
 stages: LifecycleStageSpec[];
 selectedProject: string;
 selectedNodeId: string;
 isCheckDoneForProject: (projSlug: string, checkId: string, idx: number, stageIdx: number) => boolean;
 getNodeProgressForProject: (projSlug: string, stage: LifecycleStageSpec, stageIdx: number) => {doneCount: number; total: number; pct: number};
 onSelectNode: (node: ForceGraphNode) => void;
 onToggleTask: (projSlug: string, stageId: string, checkId: string, chkIdx: number, stageIdx: number) => void;
}) {
 const svgRef = useRef<SVGSVGElement | null>(null);
 const zoomGroupRef = useRef<SVGGElement | null>(null);
 const simRef = useRef<d3.Simulation<ForceGraphNode, ForceGraphLink> | null>(null);

 const [scopeMode, setScopeMode] = useState<"ecosystem" | "focused">("ecosystem");
 const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
 const [, setTickVersion] = useState(0);

 // Build nodes and links with Projects as central hubs and Stages/Tasks branching out
 const {nodes, links} = useMemo(() => {
  const nodeList: ForceGraphNode[] = [];
  const linkList: ForceGraphLink[] = [];

  const visibleProjects =
   scopeMode === "focused"
    ? projects.filter(p => p.slug === selectedProject)
    : projects;

  const W = 920;
  const H = 540;
  const CX = W / 2;
  const CY = H / 2;

  visibleProjects.forEach((proj, pIdx) => {
   const isPrimary = proj.slug === selectedProject;
   // Position central project hubs across the canvas
   const angle = -Math.PI / 2 + (pIdx * 2 * Math.PI) / Math.max(1, visibleProjects.length);
   const hubDist = scopeMode === "focused" ? 0 : isPrimary ? 0 : 185;
   const startX = CX + Math.cos(angle) * hubDist;
   const startY = CY + Math.sin(angle) * hubDist;

   // Calculate overall project completion
   let projDone = 0;
   let projTotal = 0;
   stages.forEach((st, sIdx) => {
    const prog = getNodeProgressForProject(proj.slug, st, sIdx);
    projDone += prog.doneCount;
    projTotal += prog.total;
   });
   const projPct = projTotal ? Math.round((projDone / projTotal) * 100) : 0;

   const projNodeId = `project:${proj.slug}`;
   nodeList.push({
    id: projNodeId,
    kind: "project",
    label: proj.shortName,
    fullTitle: proj.name,
    subtitle: `${proj.category} · ${projPct}% Complete`,
    projectSlug: proj.slug,
    projectName: proj.name,
    pct: projPct,
    color: proj.color,
    radius: isPrimary ? 34 : 26,
    x: startX,
    y: startY
   });

   // Branching Lifecycle Stages & Tasks around the Selected Project
   // And key active task branches around secondary projects so the entire web feels interconnected
   if (isPrimary || scopeMode === "focused") {
    stages.forEach((st, sIdx) => {
     const sAngle = (st.angleDeg * Math.PI) / 180;
     const prog = getNodeProgressForProject(proj.slug, st, sIdx);
     const stageNodeId = st.id;
     const sx = startX + Math.cos(sAngle) * 135;
     const sy = startY + Math.sin(sAngle) * 135;

     nodeList.push({
      id: stageNodeId,
      kind: "stage",
      label: `${st.code} ${st.title}`,
      fullTitle: `${st.code} · ${st.title}`,
      subtitle: proj.milestones[sIdx] || st.subtitle,
      projectSlug: proj.slug,
      projectName: proj.name,
      stageId: st.id,
      stageCode: st.code,
      stageIdx: sIdx,
      dueDate: proj.dueDates[sIdx] || "TBD",
      pct: prog.pct,
      done: prog.doneCount === prog.total,
      color: prog.doneCount === prog.total ? "#4ade80" : proj.color,
      radius: 22,
      x: sx,
      y: sy
     });

     linkList.push({
      id: `link-${projNodeId}-${stageNodeId}`,
      kind: "project-stage",
      source: projNodeId,
      target: stageNodeId,
      sourceId: projNodeId,
      targetId: stageNodeId,
      color: proj.color
     });

     // Branching Tasks out from each Stage node
     st.checkpoints.forEach((chk, cIdx) => {
      const tAngle = sAngle + (cIdx - 1) * 0.28;
      const tx = sx + Math.cos(tAngle) * 78;
      const ty = sy + Math.sin(tAngle) * 78;
      const checked = isCheckDoneForProject(proj.slug, chk.id, cIdx, sIdx);
      const taskNodeId = `task:${proj.slug}:${chk.id}`;

      nodeList.push({
       id: taskNodeId,
       kind: "task",
       label: chk.short,
       fullTitle: chk.label,
       subtitle: `${proj.shortName} · Stage ${st.code} Task`,
       projectSlug: proj.slug,
       projectName: proj.name,
       stageId: st.id,
       stageCode: st.code,
       stageIdx: sIdx,
       checkId: chk.id,
       checkIdx: cIdx,
       dueDate: proj.dueDates[sIdx] || "TBD",
       done: checked,
       color: checked ? "#4ade80" : proj.color,
       radius: 11,
       x: tx,
       y: ty
      });

      linkList.push({
       id: `link-${stageNodeId}-${taskNodeId}`,
       kind: "stage-task",
       source: stageNodeId,
       target: taskNodeId,
       sourceId: stageNodeId,
       targetId: taskNodeId,
       color: checked ? "#4ade80" : proj.color
      });
     });
    });
   } else {
    // For secondary projects in Ecosystem mode, branch out their top 3 active milestone tasks
    [0, 2, 3].forEach((sIdx, branchIdx) => {
     const st = stages[sIdx];
     if (!st) return;
     const chk = st.checkpoints[0];
     const bAngle = angle + (branchIdx - 1) * 0.45;
     const tx = startX + Math.cos(bAngle) * 74;
     const ty = startY + Math.sin(bAngle) * 74;
     const checked = isCheckDoneForProject(proj.slug, chk.id, 0, sIdx);
     const taskNodeId = `task:${proj.slug}:${chk.id}`;

     nodeList.push({
      id: taskNodeId,
      kind: "task",
      label: `${st.code} ${chk.short}`,
      fullTitle: `${proj.name}: ${proj.milestones[sIdx] || chk.label}`,
      subtitle: `Due ${proj.dueDates[sIdx] || "TBD"} · ${st.title}`,
      projectSlug: proj.slug,
      projectName: proj.name,
      stageId: st.id,
      stageCode: st.code,
      stageIdx: sIdx,
      checkId: chk.id,
      checkIdx: 0,
      dueDate: proj.dueDates[sIdx] || "TBD",
      done: checked,
      color: checked ? "#4ade80" : proj.color,
      radius: 11,
      x: tx,
      y: ty
     });

     linkList.push({
      id: `link-${projNodeId}-${taskNodeId}`,
      kind: "stage-task",
      source: projNodeId,
      target: taskNodeId,
      sourceId: projNodeId,
      targetId: taskNodeId,
      color: checked ? "#4ade80" : proj.color
     });
    });
   }
  });

  // Inter-project central links in Ecosystem view
  if (scopeMode === "ecosystem") {
   const primaryHubId = `project:${selectedProject}`;
   projects.forEach(p => {
    if (p.slug !== selectedProject) {
     linkList.push({
      id: `inter-${primaryHubId}-project:${p.slug}`,
      kind: "inter-project",
      source: primaryHubId,
      target: `project:${p.slug}`,
      sourceId: primaryHubId,
      targetId: `project:${p.slug}`,
      color: p.color
     });
    }
   });
  }

  return {nodes: nodeList, links: linkList};
 }, [projects, stages, selectedProject, scopeMode, webCheckTrigger(isCheckDoneForProject, projects, stages)]);

 // Run D3 forceSimulation + attach d3.zoom and d3.drag
 useEffect(() => {
  const W = 920;
  const H = 540;
  const CX = W / 2;
  const CY = H / 2;

  const simulation = d3
   .forceSimulation<ForceGraphNode>(nodes)
   .force(
    "link",
    d3
     .forceLink<ForceGraphNode, ForceGraphLink>(links)
     .id(d => d.id)
     .distance(l => {
      if (l.kind === "inter-project") return 210;
      if (l.kind === "project-stage") return 118;
      return 64;
     })
     .strength(l => {
      if (l.kind === "inter-project") return 0.18;
      if (l.kind === "project-stage") return 0.65;
      return 0.8;
     })
   )
   .force(
    "charge",
    d3.forceManyBody<ForceGraphNode>().strength(d => {
      if (d.kind === "project") return -420;
      if (d.kind === "stage") return -220;
      return -85;
     })
   )
   .force("center", d3.forceCenter(CX, CY).strength(0.08))
   .force(
    "collide",
    d3.forceCollide<ForceGraphNode>().radius(d => d.radius + 12).iterations(2)
   )
   .alpha(0.9)
   .alphaDecay(0.028);

  simulation.on("tick", () => {
   for (const n of nodes) {
    n.x = Math.max(48, Math.min(W - 48, n.x ?? CX));
    n.y = Math.max(40, Math.min(H - 40, n.y ?? CY));
   }
   setTickVersion(v => v + 1);
  });

  simRef.current = simulation;

  // Attach d3.zoom to SVG
  if (svgRef.current && zoomGroupRef.current) {
   const svgSel = d3.select(svgRef.current);
   const gSel = d3.select(zoomGroupRef.current);
   const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.65, 2.2])
    .on("zoom", event => {
     gSel.attr("transform", event.transform.toString());
    });
   svgSel.call(zoomBehavior);
  }

  return () => {
   simulation.stop();
  };
 }, [nodes, links]);

 function reheatPhysics() {
  if (!simRef.current) return;
  for (const n of simRef.current.nodes()) {
   n.fx = null;
   n.fy = null;
  }
  if (svgRef.current && zoomGroupRef.current) {
   d3.select(zoomGroupRef.current).attr("transform", "translate(0,0) scale(1)");
  }
  simRef.current.alpha(0.95).restart();
 }

 // Pointer drag handlers connected to D3 simulation
 const dragState = useRef<{node: ForceGraphNode; moved: boolean; sx: number; sy: number} | null>(null);

 function onNodePointerDown(node: ForceGraphNode, e: React.PointerEvent) {
  e.stopPropagation();
  if (!simRef.current) return;
  (e.currentTarget as Element).setPointerCapture(e.pointerId);
  dragState.current = {node, moved: false, sx: e.clientX, sy: e.clientY};
  node.fx = node.x;
  node.fy = node.y;
  simRef.current.alphaTarget(0.3).restart();
 }

 function onCanvasPointerMove(e: React.PointerEvent<SVGSVGElement>) {
  const st = dragState.current;
  if (!st || !svgRef.current) return;
  if (Math.hypot(e.clientX - st.sx, e.clientY - st.sy) > 4) {
   st.moved = true;
  }
  const rect = svgRef.current.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const nx = ((e.clientX - rect.left) / rect.width) * 920;
  const ny = ((e.clientY - rect.top) / rect.height) * 540;
  st.node.fx = Math.max(48, Math.min(920 - 48, nx));
  st.node.fy = Math.max(40, Math.min(540 - 40, ny));
 }

 function onCanvasPointerUp() {
  const st = dragState.current;
  if (!st || !simRef.current) return;
  const wasClick = !st.moved;
  const clickedNode = st.node;
  st.node.fx = null;
  st.node.fy = null;
  dragState.current = null;
  simRef.current.alphaTarget(0);

  if (wasClick) {
   onSelectNode(clickedNode);
   if (
    clickedNode.kind === "task" &&
    clickedNode.stageId &&
    clickedNode.checkId !== undefined &&
    clickedNode.checkIdx !== undefined &&
    clickedNode.stageIdx !== undefined
   ) {
    onToggleTask(
     clickedNode.projectSlug,
     clickedNode.stageId,
     clickedNode.checkId,
     clickedNode.checkIdx,
     clickedNode.stageIdx
    );
   }
  }
 }

 // Connected neighborhood highlight set
 const neighborSet = useMemo(() => {
  const focusId = hoveredNodeId || selectedNodeId;
  if (!focusId) return null;
  const set = new Set<string>([focusId]);
  for (const l of links) {
   if (l.sourceId === focusId) set.add(l.targetId);
   if (l.targetId === focusId) set.add(l.sourceId);
  }
  return set;
 }, [hoveredNodeId, selectedNodeId, links]);

 return (
  <div className="d3-force-container">
   {/* Top Controls Bar */}
   <div className="d3-force-toolbar">
    <div className="d3-force-filters" role="group" aria-label="D3 Graph Topology Mode">
     <button
      type="button"
      className={"hq-theme-pill " + (scopeMode === "ecosystem" ? "active" : "")}
      onClick={() => setScopeMode("ecosystem")}
     >
      ● All Projects &amp; Branching Tasks Web
     </button>
     <button
      type="button"
      className={"hq-theme-pill " + (scopeMode === "focused" ? "active" : "")}
      onClick={() => setScopeMode("focused")}
     >
      ◎ Focused Single-Project Tree
     </button>
    </div>

    <div className="d3-force-actions">
     <span className="hq-minimal-meta">Drag any node · Scroll to zoom · Click to inspect</span>
     <button type="button" className="hq-theme-pill" onClick={reheatPhysics}>
      ↻ Pulse D3 Force Simulation
     </button>
    </div>
   </div>

   {/* D3 Force-Directed SVG Network */}
   <div className="lifecycle-svg-wrap">
    <svg
     ref={svgRef}
     viewBox="0 0 920 540"
     className="lifecycle-svg d3-force-svg"
     role="img"
     aria-label="Interactive D3.js force-directed project lifecycle graph"
     onPointerMove={onCanvasPointerMove}
     onPointerUp={onCanvasPointerUp}
     onPointerLeave={onCanvasPointerUp}
    >
     <defs>
      <radialGradient id="d3NetworkGlow" cx="50%" cy="50%" r="50%">
       <stop offset="0%" stopColor="rgba(var(--ui-accent-rgb), 0.18)" />
       <stop offset="100%" stopColor="rgba(var(--ui-accent-rgb), 0)" />
      </radialGradient>
     </defs>

     <g ref={zoomGroupRef}>
      {/* Background reference rings for visual depth */}
      <circle cx={460} cy={270} r={220} className="radial-orbit-ring outer" />
      <circle cx={460} cy={270} r={140} className="radial-orbit-ring middle" />
      <circle cx={460} cy={270} r={180} fill="url(#d3NetworkGlow)" />

      {/* 1. Force-Directed Links */}
      {links.map(link => {
       const src = typeof link.source === "object" ? (link.source as ForceGraphNode) : nodes.find(n => n.id === link.sourceId);
       const tgt = typeof link.target === "object" ? (link.target as ForceGraphNode) : nodes.find(n => n.id === link.targetId);
       if (!src || !tgt) return null;
       const x1 = src.x ?? 460;
       const y1 = src.y ?? 270;
       const x2 = tgt.x ?? 460;
       const y2 = tgt.y ?? 270;

       const isHighlighted =
        neighborSet && neighborSet.has(link.sourceId) && neighborSet.has(link.targetId);
       const isDimmed = hoveredNodeId && neighborSet && !isHighlighted;

       if (link.kind === "project-stage") {
        const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
        const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
        return (
         <path
          key={link.id}
          d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
          fill="none"
          stroke={isHighlighted ? link.color : "var(--ui-border)"}
          strokeWidth={isHighlighted ? 2.6 : 1.8}
          opacity={isDimmed ? 0.2 : 0.9}
         />
        );
       }

       return (
        <line
         key={link.id}
         x1={x1}
         y1={y1}
         x2={x2}
         y2={y2}
         stroke={isHighlighted ? link.color : "var(--ui-border)"}
         strokeWidth={
          link.kind === "inter-project" ? 2 : isHighlighted ? 2.2 : 1.3
         }
         strokeDasharray={link.kind === "inter-project" ? "5 5" : undefined}
         opacity={isDimmed ? 0.18 : link.kind === "inter-project" ? 0.65 : 0.85}
        />
       );
      })}

      {/* 2. Force-Directed Nodes (Projects as Central Hubs, Stages & Tasks Branching Out) */}
      {nodes.map(node => {
       const nx = node.x ?? 460;
       const ny = node.y ?? 270;
       const isSelected =
        node.id === selectedNodeId ||
        node.stageId === selectedNodeId ||
        (node.kind === "project" && node.projectSlug === selectedProject);
       const isHovered = node.id === hoveredNodeId;
       const isDimmed = hoveredNodeId && neighborSet && !neighborSet.has(node.id);

       if (node.kind === "project") {
        const isPrimary = node.projectSlug === selectedProject;
        const r = node.radius;
        const circ = 2 * Math.PI * r;
        const offset = circ - ((node.pct || 0) / 100) * circ;
        return (
         <g
          key={node.id}
          className={"web-center-hub " + (isPrimary ? "primary" : "")}
          transform={`translate(${nx}, ${ny})`}
          opacity={isDimmed ? 0.3 : 1}
          onPointerEnter={() => setHoveredNodeId(node.id)}
          onPointerLeave={() => setHoveredNodeId(null)}
          onPointerDown={e => onNodePointerDown(node, e)}
          style={{cursor: "grab"}}
         >
          {isPrimary && (
           <circle r={r + 10} fill={node.color} opacity={0.18} />
          )}
          <circle
           r={r}
           fill="var(--ui-panel)"
           stroke="var(--ui-border)"
           strokeWidth="3"
          />
          <circle
           r={r}
           fill="none"
           stroke={node.color}
           strokeWidth={isPrimary ? "4" : "3"}
           strokeLinecap="round"
           strokeDasharray={circ}
           strokeDashoffset={offset}
           transform="rotate(-90)"
          />
          <text
           y={-5}
           textAnchor="middle"
           fontSize={isPrimary ? "11" : "9.5"}
           fontWeight="800"
           fill="var(--ui-text)"
          >
           {node.label}
          </text>
          <text
           y={10}
           textAnchor="middle"
           fontSize="9.5"
           fontWeight="700"
           fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
           fill={node.color}
          >
           {node.pct}%
          </text>
         </g>
        );
       }

       if (node.kind === "stage") {
        const r = node.radius;
        const circ = 2 * Math.PI * r;
        const offset = circ - ((node.pct || 0) / 100) * circ;
        const isStageSel = node.id === selectedNodeId;
        return (
         <g
          key={node.id}
          className={"web-stage-node " + (isStageSel ? "selected" : "")}
          transform={`translate(${nx}, ${ny})`}
          opacity={isDimmed ? 0.3 : 1}
          onPointerEnter={() => setHoveredNodeId(node.id)}
          onPointerLeave={() => setHoveredNodeId(null)}
          onPointerDown={e => onNodePointerDown(node, e)}
          style={{cursor: "grab"}}
         >
          {isStageSel && (
           <circle r={r + 7} fill={node.color} opacity={0.2} />
          )}
          <circle
           r={r}
           fill={isStageSel ? "var(--ui-raised)" : "var(--ui-panel)"}
           stroke="var(--ui-border)"
           strokeWidth="2.5"
          />
          <circle
           r={r}
           fill="none"
           stroke={node.color}
           strokeWidth="3"
           strokeLinecap="round"
           strokeDasharray={circ}
           strokeDashoffset={offset}
           transform="rotate(-90)"
          />
          <text
           y={-3}
           textAnchor="middle"
           fontSize="9.5"
           fontWeight="700"
           fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
           fill={node.color}
          >
           {node.stageCode}
          </text>
          <text
           y={9}
           textAnchor="middle"
           fontSize="8.5"
           fontWeight="700"
           fill="var(--ui-text)"
          >
           {node.label.split(" ")[1] || node.label}
          </text>
         </g>
        );
       }

       // Task Node branching out
       return (
        <g
         key={node.id}
         className={"radial-task-node " + (node.done ? "done" : "")}
         transform={`translate(${nx}, ${ny})`}
         opacity={isDimmed ? 0.25 : 1}
         onPointerEnter={() => setHoveredNodeId(node.id)}
         onPointerLeave={() => setHoveredNodeId(null)}
         onPointerDown={e => onNodePointerDown(node, e)}
         style={{cursor: "grab"}}
        >
         <circle
          r={node.radius}
          fill={node.done ? "#4ade80" : "var(--ui-panel)"}
          stroke={isHovered || isSelected ? "#ffffff" : node.color}
          strokeWidth="2"
         />
         <text
          y={3.5}
          textAnchor="middle"
          fontSize="9"
          fontWeight="800"
          fill={node.done ? "#0b0e14" : "var(--ui-text)"}
         >
          {node.done ? "✓" : "•"}
         </text>
         <text
          y={node.radius + 12}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight={isHovered ? "700" : "600"}
          fill={node.done ? "#4ade80" : "var(--ui-text)"}
         >
          {node.label}
         </text>
        </g>
       );
      })}
     </g>
    </svg>
   </div>
  </div>
 );
}

function webCheckTrigger(
 isCheckDone: (projSlug: string, checkId: string, idx: number, stageIdx: number) => boolean,
 projects: StudioProjectItem[],
 stages: LifecycleStageSpec[]
) {
 return projects
  .map(p =>
   stages
    .map((s, si) => s.checkpoints.map((c, ci) => (isCheckDone(p.slug, c.id, ci, si) ? "1" : "0")).join(""))
    .join("")
  )
  .join("|");
}
