"use client";
import {useEffect,useMemo,useState} from "react";
import {prompts as builtInPrompts} from "./hub-data";
import {copyText} from "./hub-ui";

export type PromptItem = {
 id: string;
 title: string;
 category: string;
 project: string;
 summary: string;
 prompt: string;
};

type LibraryApiItem = {
 id: string;
 title: string;
 category: string;
 project: string;
 summary: string;
 path: string;
 prompt: string;
};

const CUSTOM_KEY = "nbo-custom-prompts";

type StageFilterId =
 | "All"
 | "Start & Spec"
 | "AI Behavior (00–16)"
 | "Build & CRM"
 | "Cartilla Games & Art"
 | "Quality & Backups"
 | "My Saved Prompts";

const STAGE_FILTERS: {id: StageFilterId; label: string; short: string}[] = [
 {id: "All", label: "All Prompts", short: "ALL"},
 {id: "Start & Spec", label: "1. Start & Spec", short: "SPEC"},
 {id: "AI Behavior (00–16)", label: "2. AI Behavior (00–16)", short: "CORE 00-16"},
 {id: "Build & CRM", label: "3. Build & Architecture", short: "BUILD"},
 {id: "Cartilla Games & Art", label: "4. Cartilla Games & Art", short: "CARTILLA"},
 {id: "Quality & Backups", label: "5. QA, Security & Backups", short: "QA & SEC"},
 {id: "My Saved Prompts", label: "6. My Saved Prompts", short: "SAVED"}
];

function mapToStageFilter(item: PromptItem & {path?: string; isCustom?: boolean}): StageFilterId {
 if (item.isCustom) return "My Saved Prompts";
 const cat = item.category.toLowerCase();
 const title = item.title.toLowerCase();
 const path = (item.path || "").toLowerCase();
 if (cat.includes("00–16") || path.includes("ai-behavior-library")) return "AI Behavior (00–16)";
 if (cat.includes("cartilla") || item.project.includes("Gretel") || title.includes("juego") || title.includes("gretel") || title.includes("workbook")) {
  return "Cartilla Games & Art";
 }
 if (
  cat.includes("quality") ||
  cat.includes("backup") ||
  cat.includes("checklist") ||
  title.includes("backup") ||
  title.includes("security") ||
  title.includes("qa") ||
  title.includes("review") ||
  title.includes("test")
 ) {
  return "Quality & Backups";
 }
 if (
  title.includes("spec") ||
  title.includes("interview") ||
  title.includes("kickoff") ||
  title.includes("before code") ||
  title.includes("pre-prompt") ||
  cat.includes("decision")
 ) {
  return "Start & Spec";
 }
 return "Build & CRM";
}

function readCustom(): PromptItem[] {
 if (typeof window === "undefined") return [];
 try {
  const raw = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  return Array.isArray(raw) ? raw.filter(x => x && typeof x.id === "string" && typeof x.prompt === "string") : [];
 } catch {
  return [];
 }
}

export default function PromptLibrary() {
 const [stageFilter, setStageFilter] = useState<StageFilterId>("All");
 const [projectFilter, setProjectFilter] = useState("All");
 const [query, setQuery] = useState("");
 const [copied, setCopied] = useState("");
 const [custom, setCustom] = useState<PromptItem[]>([]);
 const [serverItems, setServerItems] = useState<LibraryApiItem[]>([]);
 const [loadingLibrary, setLoadingLibrary] = useState(true);
 const [selectedId, setSelectedId] = useState<string>("");
 const [showComposer, setShowComposer] = useState(false);
 const [draft, setDraft] = useState({
  title: "",
  category: "My Saved Prompts",
  project: "All projects",
  summary: "",
  prompt: ""
 });

 useEffect(() => {
  setCustom(readCustom());
  let active = true;
  fetch("/api/library", {cache: "no-store"})
   .then(r => r.json())
   .then(data => {
    if (!active) return;
    if (Array.isArray(data?.items)) {
     setServerItems(data.items);
    }
    setLoadingLibrary(false);
   })
   .catch(() => {
    if (active) setLoadingLibrary(false);
   });
  return () => {
   active = false;
  };
 }, []);

 function saveCustom(next: PromptItem[]) {
  setCustom(next);
  try {
   localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {}
 }

 const allItems = useMemo(() => {
  const seen = new Set<string>();
  const combined: (PromptItem & {path?: string; isCustom?: boolean; stageGroup?: StageFilterId})[] = [];

  for (const c of custom) {
   seen.add(c.id);
   const item = {...c, isCustom: true};
   combined.push({...item, stageGroup: mapToStageFilter(item)});
  }
  for (const s of serverItems) {
   if (seen.has(s.id)) continue;
   seen.add(s.id);
   const item = {
    id: s.id,
    title: s.title,
    category: s.category,
    project: s.project,
    summary: s.summary,
    prompt: s.prompt,
    path: s.path
   };
   combined.push({...item, stageGroup: mapToStageFilter(item)});
  }
  for (const b of builtInPrompts) {
   const id = "builtin-" + b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
   if (seen.has(id)) continue;
   seen.add(id);
   const item: PromptItem = {
    id,
    title: b.name,
    category: b.cat,
    project: "All projects",
    summary: b.desc,
    prompt: b.text
   };
   combined.push({...item, stageGroup: mapToStageFilter(item)});
  }
  return combined;
 }, [custom, serverItems]);

 const projects = useMemo(
  () => ["All", ...Array.from(new Set(allItems.map(p => p.project))).sort()],
  [allItems]
 );

 const filtered = useMemo(() => {
  const s = query.trim().toLowerCase();
  return allItems.filter(
   p =>
    (stageFilter === "All" || p.stageGroup === stageFilter) &&
    (projectFilter === "All" || p.project === projectFilter) &&
    (!s ||
     `${p.title} ${p.summary} ${p.project} ${p.category} ${p.prompt} ${p.path || ""}`
      .toLowerCase()
      .includes(s))
  );
 }, [allItems, stageFilter, projectFilter, query]);

 const selectedItem = useMemo(() => {
  if (!filtered.length) return null;
  return filtered.find(i => i.id === selectedId) || filtered[0];
 }, [filtered, selectedId]);

 async function copy(id: string, text: string) {
  if (await copyText(text)) {
   setCopied(id);
   setTimeout(() => setCopied(""), 1800);
  }
 }

 function addPrompt() {
  if (!draft.title.trim() || !draft.prompt.trim()) return;
  const newItem: PromptItem = {
   id: "custom-" + Date.now(),
   title: draft.title.trim(),
   category: draft.category.trim() || "My Saved Prompts",
   project: draft.project.trim() || "All projects",
   summary: draft.summary.trim() || "Saved in your personal browser prompt library.",
   prompt: draft.prompt.trim()
  };
  saveCustom([newItem, ...custom]);
  setSelectedId(newItem.id);
  setDraft({
   title: "",
   category: "My Saved Prompts",
   project: "All projects",
   summary: "",
   prompt: ""
  });
  setShowComposer(false);
 }

 return (
  <div className="section lib-studio">
   {/* Compact Studio Header */}
   <div className="lib-studio-header">
    <div>
     <p className="eyebrow">FULL-STACK AI FIRM INSTRUCTION DECK</p>
     <h1>Master Prompt &amp; Knowledge Library</h1>
     <p className="lib-studio-sub">
      {loadingLibrary
       ? "Indexing markdown files from /content/..."
       : `${allItems.length} total instructions (${serverItems.length} loaded from /content/) organized into 6 Full-Stack AI stages.`}
     </p>
    </div>
    <div className="lib-studio-header-actions">
     <button
      type="button"
      className={"btn " + (showComposer ? "primary" : "")}
      onClick={() => setShowComposer(!showComposer)}
     >
      {showComposer ? "Close Composer" : "+ New Saved Prompt"}
     </button>
    </div>
   </div>

   {/* Collapsible New Prompt Composer */}
   {showComposer && (
    <section className="panel lib-composer-drawer" aria-label="Save custom prompt">
     <div className="panel-head">
      <div>
       <p className="eyebrow">CUSTOM INSTRUCTION</p>
       <h2>Save or Customize a Prompt</h2>
      </div>
     </div>
     <div className="prompt-builder">
      <input
       value={draft.title}
       onChange={e => setDraft({...draft, title: e.target.value})}
       placeholder="Prompt title (e.g., My Cartilla Lesson Audit)"
       aria-label="Prompt title"
      />
      <input
       value={draft.project}
       onChange={e => setDraft({...draft, project: e.target.value})}
       placeholder="Project (e.g., La Cartilla de Gretel)"
       aria-label="Project"
      />
      <input
       value={draft.summary}
       onChange={e => setDraft({...draft, summary: e.target.value})}
       placeholder="When should you use this prompt?"
       aria-label="Plain-English summary"
      />
      <textarea
       value={draft.prompt}
       onChange={e => setDraft({...draft, prompt: e.target.value})}
       rows={5}
       placeholder="Paste or write the exact instruction for Claude, Codex, Jules, or Gemini..."
       aria-label="Prompt text"
      />
      <div className="row-actions">
       <button className="btn primary" type="button" onClick={addPrompt}>
        Save to My Library
       </button>
       <button className="btn" type="button" onClick={() => setShowComposer(false)}>
        Cancel
       </button>
      </div>
     </div>
    </section>
   )}

   {/* Top Filter Strip — Un-crowded IDE Tabs + Instant Search */}
   <div className="lib-toolbar">
    <div className="lib-stage-tabs" role="tablist" aria-label="Prompt stage categories">
     {STAGE_FILTERS.map(f => {
      const count = f.id === "All" ? allItems.length : allItems.filter(i => i.stageGroup === f.id).length;
      return (
       <button
        key={f.id}
        type="button"
        role="tab"
        aria-selected={stageFilter === f.id}
        className={"lib-stage-tab " + (stageFilter === f.id ? "active" : "")}
        onClick={() => setStageFilter(f.id)}
       >
        <span>{f.label}</span>
        <small>{count}</small>
       </button>
      );
     })}
    </div>

    <div className="lib-search-row">
     <input
      className="lib-search-input"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search 98+ prompts (e.g., 04_ANTI_AGREEMENT, mariposas, backup, interview, QA)..."
      aria-label="Search prompts"
     />
     <select
      className="lib-project-select"
      value={projectFilter}
      onChange={e => setProjectFilter(e.target.value)}
      aria-label="Filter by project"
     >
      {projects.map(p => (
       <option key={p} value={p}>
        {p === "All" ? "All Projects" : p}
       </option>
      ))}
     </select>
     {(query || stageFilter !== "All" || projectFilter !== "All") && (
      <button
       type="button"
       className="btn"
       onClick={() => {
        setQuery("");
        setStageFilter("All");
        setProjectFilter("All");
       }}
      >
       Reset ({filtered.length})
      </button>
     )}
    </div>
   </div>

   {/* Un-Crowded Two-Pane IDE Master-Detail Split View */}
   <div className="lib-split-workspace">
    {/* Left Pane: High-Density File Explorer List */}
    <aside className="lib-list-pane" aria-label="Prompt list">
     <div className="lib-pane-bar">
      <span>EXPLORER · {filtered.length} PROMPTS</span>
      <span>1-CLICK COPY</span>
     </div>
     <div className="lib-rows-scroll">
      {filtered.map(item => {
       const isSelected = selectedItem?.id === item.id;
       const shortStage = STAGE_FILTERS.find(s => s.id === item.stageGroup)?.short || "PROMPT";
       return (
        <div
         key={item.id}
         className={"lib-compact-row " + (isSelected ? "selected" : "")}
         onClick={() => setSelectedId(item.id)}
         role="button"
         tabIndex={0}
         onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
           e.preventDefault();
           setSelectedId(item.id);
          }
         }}
        >
         <div className="lib-row-main">
          <span className="lib-row-badge">{shortStage}</span>
          <div className="lib-row-titles">
           <strong>{item.title}</strong>
           <small>{item.project} · {item.category}</small>
          </div>
         </div>
         <button
          type="button"
          className={"lib-row-copy " + (copied === item.id ? "copied" : "")}
          onClick={e => {
           e.stopPropagation();
           copy(item.id, item.prompt);
          }}
          title="Copy prompt immediately"
         >
          {copied === item.id ? "✓ Copied" : "Copy"}
         </button>
        </div>
       );
      })}
      {!filtered.length && (
       <div className="lib-empty">
        <p>No prompts match &ldquo;{query}&rdquo;.</p>
        <button className="btn" type="button" onClick={() => {setQuery(""); setStageFilter("All"); setProjectFilter("All");}}>
         Show all {allItems.length} prompts
        </button>
       </div>
      )}
     </div>
    </aside>

    {/* Right Pane: Syntax-Styled IDE Code / Prompt Reader */}
    <section className="lib-reader-pane" aria-label="Selected prompt inspector">
     {selectedItem ? (
      <>
       <div className="lib-reader-header">
        <div>
         <div className="lib-reader-badges">
          <span className="hq-stage-code">{selectedItem.category}</span>
          <span className="lib-path-tag">{selectedItem.project}</span>
          {selectedItem.path && <code className="lib-file-path">{selectedItem.path}</code>}
         </div>
         <h2>{selectedItem.title}</h2>
        </div>
        <div className="lib-reader-actions">
         <button
          type="button"
          className="btn primary"
          onClick={() => copy(selectedItem.id, selectedItem.prompt)}
         >
          {copied === selectedItem.id ? "✓ Copied to Clipboard!" : "Copy Prompt"}
         </button>
         <button
          type="button"
          className="btn"
          onClick={() => {
           setDraft({
            title: selectedItem.title + " (Custom)",
            category: selectedItem.category,
            project: selectedItem.project,
            summary: selectedItem.summary,
            prompt: selectedItem.prompt
           });
           setShowComposer(true);
          }}
         >
          Customize Copy
         </button>
         {selectedItem.isCustom && (
          <button
           type="button"
           className="btn"
           onClick={() => saveCustom(custom.filter(x => x.id !== selectedItem.id))}
          >
           Delete
          </button>
         )}
        </div>
       </div>

       <div className="lib-when-box">
        <span>WHEN TO USE THIS</span>
        <p>{selectedItem.summary}</p>
       </div>

       <div className="lib-editor-window">
        <div className="lib-editor-statusbar">
         <span>PROMPT SOURCE · MARKDOWN</span>
         <span>
          {selectedItem.prompt.split("\n").length} lines · {selectedItem.prompt.length} chars
         </span>
        </div>
        <pre className="lib-editor-code">{selectedItem.prompt}</pre>
       </div>
      </>
     ) : (
      <div className="lib-empty">Select any prompt on the left to inspect and copy.</div>
     )}
    </section>
   </div>
  </div>
 );
}