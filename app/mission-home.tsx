"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import type {Project,Work,Section} from "./hub-data";
import {useJobs} from "./evidence-panels";
import {usePins} from "./project-preferences";
import {External} from "./hub-ui";
import {projectPath} from "./route-paths";
import {usePremium,visibleInWorkspace,workspaceLabels} from "./premium-preferences";
import GretelCommander from "./gretel-commander";
import {fetchTutorSource,unavailableTutorSource,type TutorSource} from "@/lib/tutor-source.mjs";

type State="owner"|"proof"|"draft"|"verified"|"active";
type Filter="all"|State;
type Panel="inspector"|"decisions"|"blocked"|"memory";
type RecordItem={
 id:string;title:string;project:string;slug:string;state:State;
 source:string;proof?:string;updatedAt?:string;summary:string;next:string;
 missing:string[];agent?:string;kind:string;number?:number;
};
const color:Record<State,string>={owner:"violet",proof:"amber",draft:"amber",verified:"teal",active:"slate"};
const label:Record<State,string>={owner:"NEEDS YOU",proof:"MISSING PROOF",draft:"DRAFT · NOT DONE",verified:"VERIFIED",active:"OPEN WORK"};
const tabs:{key:Panel;label:string}[]=[{key:"inspector",label:"Inspector"},{key:"decisions",label:"Needs You"},{key:"blocked",label:"Evidence gaps"},{key:"memory",label:"Memory"}];
const fmt=(input?:string)=>{if(!input)return "Not reported";const d=new Date(input);return Number.isFinite(d.getTime())?d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Not reported"};
const alertText=(n:number|undefined)=>n===1?"1 missing item":(n||0)+" missing items";
export const BOT_MICRO_PR_PATTERN=/^(🧹|⚡|🧪)/;
function fromWork(p:Project,w:Work):RecordItem{
 const draft=w.kind==="pr"&&Boolean(w.draft);
 return {id:p.slug+"/"+w.kind+"/"+w.number,number:w.number,title:w.title,project:p.name,slug:p.slug,
 state:draft?"draft":"active",source:w.url,updatedAt:w.updatedAt,kind:w.kind==="pr"?"Pull request":"Issue",missing:[],
 summary:draft?"A code change is proposed, but its pull request remains a draft. A draft is not a finished delivery.":w.kind==="pr"?"A code change is open for review. Its successful release has not been verified.":"An open issue remains in the project work queue.",
 next:draft?"Have the coding agent finish and test the draft, then attach proof.":"Open the GitHub record to review the latest evidenced work."};
}
export default function MissionHome({projects,busy}:{projects:Project[];busy:boolean;onOpen:(s:string)=>void;onSection:(s:Section)=>void}){
 const jobs=useJobs();
 const pins=usePins();
 const {workspace}=usePremium();
 const [tutorSource,setTutorSource]=useState<TutorSource>(()=>unavailableTutorSource("Refreshing Tutor PR #1073 head…"));
 useEffect(()=>{
  let active=true;
  fetchTutorSource(fetch).then(res=>{if(active)setTutorSource(res);}).catch(()=>{});
  return ()=>{active=false;};
 },[]);
 const cartilla=projects.find(p=>p.slug==="cartilla-de-gretel");
 const tutorPr=cartilla?.items.find(w=>w.kind==="pr"&&w.number===1073);
 const navigationPr=cartilla?.items.find(w=>w.kind==="pr"&&w.number===1203);
 const otherReview=cartilla?.items.find(w=>w.kind==="pr"&&!w.draft&&w.number!==1073);
 const reviewPr=navigationPr||otherReview;
 const tutorJob=jobs.jobs?.find(j=>j.id===1073);
 const dynamicTutorSha=tutorJob?.headSha||tutorSource.headSha||null;
 const dynamicTutorShaShort=dynamicTutorSha?dynamicTutorSha.slice(0,10):"UNAVAILABLE";
 const cartillaReady=Boolean(cartilla?.accessible&&!cartilla?.stale&&!cartilla?.limited);
 const productAuthorized=(jobs.execution?.mode==="PRODUCT_DEVELOPMENT"||jobs.execution?.mode==="TUTOR_1073_ONLY")&&!jobs.loading&&!jobs.stale&&!jobs.error;
 const scopeKnown=!!jobs.execution&&!jobs.loading&&!jobs.stale&&!jobs.error;
 // The current #877 owner directive outranks historical Tutor/PR headings.
 // A new model conversation never grants permission to launch product work.
 const priorities=productAuthorized?[
  {id:"tutor",step:"01 · AUTHORIZED PRODUCT TASK",title:tutorPr?.title||"Gretel Tutor — Lecciones 1–3",
   state:cartillaReady?(tutorPr?.draft?"DRAFT · NOT INTEGRATED":"RECHECK CURRENT PR"):"SOURCE REFRESHING",
   detail:"Reuse the existing Tutor branch. Verify one real Lesson 1 interaction, not a rebuilt project.",
   url:tutorPr?.url||"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073"},
  {id:"review",step:jobs.execution?.mode==="TUTOR_1073_ONLY"?"02 · PRESERVED BACKLOG":"02 · UNFINISHED PR",
   title:jobs.execution?.mode==="TUTOR_1073_ONLY"?"Other Cartilla activities — paused":reviewPr?.title||"Review pending integration work",
   state:jobs.execution?.mode==="TUTOR_1073_ONLY"?"PARKED · NOT AUTHORIZED NOW":cartillaReady?(reviewPr?.draft?"DRAFT · OPEN":"OPEN PR · NOT DEPLOYED"):"SOURCE REFRESHING",
   detail:jobs.execution?.mode==="TUTOR_1073_ONLY"?"Navigation, games, artwork and teacher lanes are preserved, not authorized for active work.":"Inspect exact revision and prior proof before new testing, merges or another agent.",
   url:jobs.execution?.mode==="TUTOR_1073_ONLY"?"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877":reviewPr?.url||"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pulls"},
  {id:"queue",step:"03 · AUTHORITATIVE NEXT STEP",title:"Cartilla execution queue · #877",
   state:"CURRENT OWNER SCOPE",detail:jobs.execution?.nextStep||"Read the authorized next action in the current issue.",
   url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877"},
 ]:[
  {id:"queue",step:"01 · CURRENT AUTHORIZATION",title:scopeKnown&&jobs.execution?.mode==="ORGANIZATION_ONLY"?"Organization only — product work paused":"Work authorization cannot be verified",
   state:scopeKnown?"OWNER DIRECTIVE":"SOURCE UNKNOWN · NO DISPATCH",
   detail:scopeKnown?jobs.execution!.nextStep:"No new jobs or new agents until the current #877 owner scope can be read.",
   url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877"},
  {id:"review",step:"02 · SAFE CONTINUITY",title:"Resume saved work, not a fresh interpretation",
   state:"NO DUPLICATE ASSIGNMENTS",
   detail:"Keep existing branch, objective and verified evidence. Model usage and live worker status are UNKNOWN without provider records.",
   url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877"},
  {id:"tutor",step:"03 · PRESERVED BACKLOG",title:tutorPr?.title||"Gretel Tutor — existing PR #1073",
   state:"PARKED · NOT AUTHORIZED NOW",
   detail:"Tutor stays intact for a later explicit product-development resumption; no replacement worker or rebuild.",
   url:tutorPr?.url||"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073"},
 ];
 const playbackProof=jobs.media?.find(p=>p.type==="video");

 const [filter,setFilter]=useState<Filter>("all");
 const [query,setQuery]=useState("");
 const [scope,setScope]=useState("cartilla-de-gretel");
 const [hideBotMicroPrs,setHideBotMicroPrs]=useState(true);
 const [expandBotMicroPrs,setExpandBotMicroPrs]=useState(false);
 const [panel,setPanel]=useState<Panel>("inspector");
 const [selected,setSelected]=useState("");
 const [copied,setCopied]=useState<"yes"|"error"|"">("");
 const [headerCopied,setHeaderCopied]=useState<"yes"|"error"|"">("");
 const [viewMode,setViewMode]=useState<"overview_studio"|"overview_only"|"studio_only">("overview_studio");
 const [techDetails,setTechDetails]=useState<boolean>(false);
 const [optionCCopied,setOptionCCopied]=useState<boolean>(false);
 const [mobileInspect,setMobileInspect]=useState(false);
 const available=projects.filter(p=>p.accessible&&!p.stale&&!p.limited&&p.prs!==null&&p.issues!==null&&p.drafts!==null);
 const fullyLoaded=!busy&&projects.length>0&&available.length===projects.length;
 const dataValid=!jobs.loading&&!jobs.error&&!jobs.stale;
 const all=useMemo(()=>{
  const work=projects.flatMap(p=>p.items.map(w=>fromWork(p,w)));
  const reports:RecordItem[]=(jobs.jobs||[]).map(j=>({
    id:"job/"+j.id,title:j.title,project:"La Cartilla de Gretel",slug:"cartilla-de-gretel",
    state:j.status==="VERIFIED"?(j.missingEvidence?.length?"proof":"verified"):"proof",
    source:j.sourceUrl,proof:j.proofUrl,updatedAt:j.updatedAt,kind:"Agent job report",
    missing:j.missingEvidence||[],summary:j.status==="VERIFIED"?"The source reports verified work; review linked acceptance evidence.":"Reported work is not verified as delivered.",
    next:j.id===1073?"Verify the exact combined Tutor build and actual phone-width Lección 1 behavior; real-device speech is still unverified. Do not merge or release.":j.id===1203?"Repair the Piano bookmark overwrite on the existing PR, rerun its focused checks, then review before merge.":j.missingEvidence?.length?"Obtain the missing acceptance proof for this Cartilla item; continue unrelated eligible work.":"Review the canonical job and require acceptance proof before approval."}));
  const approvals:RecordItem[]=(jobs.approvals||[]).map(a=>({
    id:"approval/"+a.id,title:a.title,project:a.project,slug:"",
    state:"owner",source:a.sourceUrl,proof:a.proofUrl,updatedAt:a.updatedAt,
    kind:"Owner approval",missing:[],summary:"A source-qualified owner decision is awaiting review.",
    next:"Inspect the visual proof and decision context before granting approval."}));
  const priority:Record<State,number>={owner:5,proof:4,draft:3,active:2,verified:1};
  return [...approvals,...reports,...work].sort((a,b)=>priority[b.state]-priority[a.state]||String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
 },[projects,jobs.jobs,jobs.approvals]);
 const scopedItems=all.filter(item=>visibleInWorkspace(workspace,item.state)&&(filter==="all"||item.state===filter)&&(scope==="all"||item.slug===scope)&&[item.title,item.project,item.kind,item.id].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
 const botMicroPrItems=scopedItems.filter(item=>item.kind==="Pull request"&&BOT_MICRO_PR_PATTERN.test(item.title.trim()));
 const visible=hideBotMicroPrs&&!expandBotMicroPrs?scopedItems.filter(item=>!(item.kind==="Pull request"&&BOT_MICRO_PR_PATTERN.test(item.title.trim()))):scopedItems;
 const selectedItem=visible.find(x=>x.id===selected)||visible[0]||null;
 const blocked=all.filter(x=>x.state==="proof");
 const decisions=all.filter(x=>x.state==="owner");
 const drafts=fullyLoaded?projects.reduce((sum,p)=>sum+(p.drafts||0),0):null;
 const pinned=projects.filter(p=>pins.value.includes(p.slug));
 const tiles=[
  {key:"owner" as Filter,name:"NEEDS YOUR DECISION",value:dataValid?decisions.length:null,desc:"Proof-qualified approvals",tone:"violet"},
  {key:"proof" as Filter,name:"UNVERIFIED · NEEDS PROOF",value:dataValid?blocked.length:null,desc:"Cartilla evidence gaps, not global blockers",tone:"amber"},
  {key:"draft" as Filter,name:"DRAFT PRs · NOT DONE",value:drafts,desc:"Across accessible repositories",tone:"amber"},
  {key:"verified" as Filter,name:"VERIFIED JOB REPORTS",value:dataValid?jobs.jobs.filter(j=>j.status==="VERIFIED"&&!j.missingEvidence?.length).length:null,desc:"Canonical job evidence only",tone:"teal"}
 ];
 function choose(f:Filter){setFilter(f);setPanel("inspector");document.getElementById("mission-work")?.scrollIntoView({block:"nearest",behavior:"smooth"});}
 async function copyHeaderHandoff(){
  const handoff=[
   "CARTILLA DE GRETEL — EVIDENCE-GROUNDED AGENT HANDOFF",
   "Canonical Authority: https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877 ("+(jobs.execution?.mode||"TUTOR_1073_ONLY")+")",
   "Active Tutor PR #1073: https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073 (Current Head SHA: "+(dynamicTutorSha||"UNAVAILABLE — fetch from GitHub")+")",
   "Completed Work — DO NOT TOUCH OR RE-IMPLEMENT: Merged #1204 (Elephant/Sheep RGBA motion), Merged #1205 (51-file 300-DPI scan crops), Deployed #1079 (Live Mariposas-P at c670ff04).",
   "Active Peer Work: Cartilla Docs PR #1218 (operating instructions review), NBO Issue #18 (Jules task FAILED at 3:36 AM; read-only review, do not relaunch).",
   "Live Session: UNKNOWN | Remaining Model Credits: UNKNOWN",
   "Single Next Action: Complete review/merge of Docs PR #1218, then execute real-phone microphone/audio acceptance on PR #1073 Lección 1 without replacing the approved Tutor architecture."
  ].join("\n");
  try{await navigator.clipboard.writeText(handoff);setHeaderCopied("yes");}catch{setHeaderCopied("error");}
 }
 async function copyOptionCPrompt() {
  const text = [
   "# CODING AGENT IMPLEMENTATION BRIEF — NBO COMMAND CENTER 2.0 (OPTION C)",
   "Target: ejnburrows-rgb/Command-Center- (feat/nbo-command-center-2-cartilla-first-20261030)",
   "Directive: TUTOR_1073_ONLY per Cartilla issue #877",
   "Status: Option C Mind Graph + Cartilla Visual Studio (5 Tabs) Integrated",
   "Next Action: Phone microphone verification for Tutor PR #1073",
  ].join("\n");
  try {
   await navigator.clipboard.writeText(text);
   setOptionCCopied(true);
   setTimeout(() => setOptionCCopied(false), 2000);
  } catch {}
 }
 async function copyPrompt(item:RecordItem){
  // The current owner directive has priority over historical PR/issue titles.
  // Copying a backlog card must not become an unauthorized new agent assignment.
  const productCopyPaused=item.slug==="lany-books-web"||(item.slug==="cartilla-de-gretel"&&(!productAuthorized||item.id!=="cartilla-de-gretel/pr/1073"));
  const prompt=(productCopyPaused?[
    "NOT AUTHORIZED FOR THIS TASK — do not implement, dispatch, or restart this product work.",
    "Project: "+item.project,
    "Existing record (context only): "+item.source,
    "Current authority: https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877",
    "Current authorized scope: "+(jobs.execution?.nextStep||"Not verified; do not dispatch."),
    "Check open PRs and assignments first. Do not create duplicate agents, branches, tasks or handoffs.",
    "Preserve other Cartilla and LANY tasks; only Tutor #1073 is currently authorized by #877."
  ]:[
    "Review and complete this AI software development task using the project's AGENTS.md and applicable findings.md.",
    "Project: "+item.project,"Task: "+item.title,"Canonical source: "+item.source,
    "Current state: "+label[item.state],"Observed: "+item.summary,"Required next action: "+item.next,
    ...item.missing.map(s=>"Missing evidence: "+s),
    "Do not call it complete without actual tests, proof links, screenshots where visual, and a clear READY TO PUSH assessment."
  ]).join("\n");
  try{await navigator.clipboard.writeText(prompt);setCopied("yes")}catch{setCopied("error")}
 }
 return <div className="mission-home" data-workspace={workspace} data-visual-reference="nbo-premium-workspace">
  <div className="mission-center">
      <section className="cartilla-command-deck" aria-label="Cartilla-first 10-second command header">
    {/* Top Header: Maestra Gretel Avatar, Project Switcher, View Switcher & Tech Details Toggle */}
    <div className="cartilla-command-top">
      <div className="cartilla-brand-row">
        <img
          src="/gretel-approved-master.png"
          alt="Maestra Gretel Approved Art"
          className="gretel-avatar-hero"
          width={40}
          height={40}
        />
        <div className="cartilla-brand-text">
          <h2>★ La Cartilla de Gretel</h2>
          <small>Authoritative Headquarters · Queue #877 (TUTOR_1073_ONLY)</small>
        </div>
      </div>

      <div className="cartilla-switcher" role="group" aria-label="Project Switcher Bar">
        <button type="button" className={scope==="cartilla-de-gretel"?"active":""} aria-pressed={scope==="cartilla-de-gretel"} onClick={()=>setScope("cartilla-de-gretel")}>
          ★ La Cartilla de Gretel (Active)
        </button>
        <button type="button" className={scope==="Command-Center-"?"active":""} aria-pressed={scope==="Command-Center-"} onClick={()=>setScope("Command-Center-")}>
          NBO Operations Hub (1 Fix Ready)
        </button>
        <button type="button" className={scope==="lany-books-web"?"active":""} aria-pressed={scope==="lany-books-web"} onClick={()=>setScope("lany-books-web")}>
          LANY Books (Paused)
        </button>
        <button type="button" className={scope==="all"?"active":""} aria-pressed={scope==="all"} onClick={()=>setScope("all")}>
          All 8 Projects
        </button>
      </div>

      <div className="cartilla-view-controls">
        <div className="view-mode-pill-group" role="group" aria-label="Option C View Switcher">
          <button
            type="button"
            className={"view-pill" + (viewMode === "overview_studio" ? " active" : "")}
            onClick={() => setViewMode("overview_studio")}
            title="Overview Deck + Cartilla Visual Studio"
          >
            Show Overview + Visual Studio
          </button>
          <button
            type="button"
            className={"view-pill" + (viewMode === "overview_only" ? " active" : "")}
            onClick={() => setViewMode("overview_only")}
            title="10-Second Executive Overview Only"
          >
            10-Sec Overview Only
          </button>
          <button
            type="button"
            className={"view-pill" + (viewMode === "studio_only" ? " active" : "")}
            onClick={() => setViewMode("studio_only")}
            title="Cartilla Visual Studio Only"
          >
            Visual Studio Only
          </button>
        </div>

        <button
          type="button"
          className={"tech-details-toggle" + (techDetails ? " tech-on" : "")}
          onClick={() => setTechDetails(!techDetails)}
          aria-pressed={techDetails}
          title={techDetails ? "Switch to Plain-English Owner View" : "Show technical commit hashes and paths"}
        >
          {techDetails ? "Tech Details: ON" : "Simple Owner View"}
        </button>
      </div>
    </div>

    {/* 4-Color Traffic-Light Legend Strip */}
    <div className="cartilla-legend-strip" role="note" aria-label="4-Color Traffic-Light System">
      <span className="legend-item"><span className="legend-dot dot-green" /> 🟢 Done & Verified</span>
      <span className="legend-item"><span className="legend-dot dot-orange" /> 🟠 In Progress / Needs Check</span>
      <span className="legend-item"><span className="legend-dot dot-red" /> 🔴 Blocker / Needs Fix</span>
      <span className="legend-item"><span className="legend-dot dot-gray" /> ⚪ Safely Paused</span>
      <div className="mission-fresh-compact">
        <span className="mission-datalight" />
        <span>{busy ? "Checking GitHub…" : fullyLoaded ? "GITHUB LIVE" : "CACHED GITHUB DATA"}</span>
        <small>Live Session: UNKNOWN · Credits: UNKNOWN</small>
      </div>
    </div>

    {/* Three Color-Coded Quick Action Buttons */}
    <div className="cartilla-quick-actions" role="group" aria-label="Three Quick Actions">
      <div className="quick-action-group">
        <span className="quick-action-label">1. Open Working Preview (Live Butterfly Game)</span>
        <div className="quick-action-links">
          <a
            href="https://cartilla-de-gretel.vercel.app/cartilla/juego/mariposas-p"
            target="_blank"
            rel="noopener noreferrer"
            className="qa-btn qa-preview"
          >
            🟢 Live Mariposas c670ff04 ↗
          </a>
          <Link href="/art-inventory" className="qa-btn qa-studio">
            Cartilla Visual Studio (5 Tabs) →
          </Link>
        </div>
      </div>

      <div className="quick-action-group">
        <span className="quick-action-label">2. Open Relevant GitHub Work (Active Tutor PR #1073)</span>
        <div className="quick-action-links">
          <a
            href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073"
            target="_blank"
            rel="noopener noreferrer"
            className="qa-btn qa-tutor"
          >
            🟠 Active Tutor PR #1073 {techDetails ? `(${dynamicTutorShaShort})` : ""} ↗
          </a>
          <a
            href="https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877"
            target="_blank"
            rel="noopener noreferrer"
            className="qa-btn"
          >
            Queue #877 ↗
          </a>
        </div>
      </div>

      <div className="quick-action-group">
        <span className="quick-action-label">3. Copy Agent Handoff</span>
        <div className="quick-action-links">
          <button
            type="button"
            onClick={() => void copyHeaderHandoff()}
            className="qa-btn qa-copy"
            title="Copy single unified handoff prompt"
          >
            {headerCopied === "yes" ? "✓ Copied Unified Handoff" : headerCopied === "error" ? "Clipboard unavailable" : "🔵 Copy Agent Handoff 📋"}
          </button>
          <button
            type="button"
            onClick={() => void copyOptionCPrompt()}
            className="qa-btn qa-copy-option-c"
            title="Copy Option C implementation brief"
          >
            {optionCCopied ? "✓ Copied Option C Prompt" : "Copy Option C Prompt 📋"}
          </button>
        </div>
      </div>
    </div>

    {/* 4 Color-Coded Visual Hero Cards Above the Fold */}
    <div className="cartilla-status-grid" aria-label="Four Primary Status Cards">
      {/* 1. NOW (Orange): Maestra Gretel Tutor Lesson 1 */}
      <article className="status-card status-now">
        <div className="status-card-head">
          <span className="status-badge badge-orange">🟠 NOW</span>
          <small>{techDetails ? `PR #1073 · ${dynamicTutorShaShort}` : "Lesson 1 Qualification"}</small>
        </div>
        <div className="hero-card-content">
          <img src="/gretel-approved-master.png" alt="" className="hero-thumb" width={38} height={38} />
          <div>
            <h3>Maestra Gretel Tutor (Lesson 1)</h3>
            <p>
              {techDetails
                ? `PR #1073 (head ${dynamicTutorShaShort}) · StubEars synthetic test passed · Awaiting physical phone mic check. Live Session: UNKNOWN.`
                : "Interactive speech qualification for Lesson 1 · Synthetic verification passed · Needs real phone microphone test before review."}
            </p>
          </div>
        </div>
        {/* 7-Step Verification Dots */}
        <div className="hero-verification-steps">
          <span className="hero-step-label">Step 2 of 7: Needs real phone mic test</span>
          <div className="verification-dots" aria-label="7-Step Verification Progress">
            <span className="v-dot dot-done" title="Step 1: PR #1073 Code Implementation Complete" />
            <span className="v-dot dot-active" title="Step 2: Real Phone Mic Acceptance (Active Step)" />
            <span className="v-dot dot-pending" title="Step 3: Synthetic StubEars Passed" />
            <span className="v-dot dot-pending" title="Step 4: Student Path Qualification" />
            <span className="v-dot dot-pending" title="Step 5: Peer Review & Branch Protection" />
            <span className="v-dot dot-pending" title="Step 6: Assembly Release Verification" />
            <span className="v-dot dot-pending" title="Step 7: Owner Release Sign-off" />
          </div>
        </div>
      </article>

      {/* 2. NEXT (Blue): Merge Rules Update, Then Phone Test */}
      <article className="status-card status-next">
        <div className="status-card-head">
          <span className="status-badge badge-blue">🔵 NEXT</span>
          <small>2-Step Checklist</small>
        </div>
        <h3>Merge Rules Update, Then Phone Test</h3>
        <ol className="hero-numbered-checklist">
          <li>
            <b>Approve PR #28 & #1218:</b> Command Center repair + Cartilla AGENTS.md rules update.
          </li>
          <li>
            <b>Test Lesson 1 Tutor on Real Phone:</b> Physical microphone audio qualification.
          </li>
        </ol>
      </article>

      {/* 3. BLOCKERS (Red): 3 Real Blockers Only */}
      <article className="status-card status-blockers">
        <div className="status-card-head">
          <span className="status-badge badge-red">🔴 BLOCKERS</span>
          <small>3 Genuine Blockers Only</small>
        </div>
        <h3>Confirmed Evidence & Source Blockers</h3>
        <ul className="hero-blockers-list">
          <li>
            <b>Voice:</b> 3 robot-voice leaks (<code>speechSynthesis</code>) & 151 clips to match (#769).
          </li>
          <li>
            <b>Workbook:</b> Pages 36 & 37 missing paper scans + 2 stale bee motion SVGs.
          </li>
          <li>
            <b>Tutor:</b> Real phone microphone check needed before review or merge.
          </li>
        </ul>
      </article>

      {/* 4. PROGRESS (Green): Visual Fill Bars */}
      <article className="status-card status-progress">
        <div className="status-card-head">
          <span className="status-badge badge-green">🟢 PROGRESS</span>
          <small>Verified Delivery Breakdown</small>
        </div>
        <h3>Verified Delivery Breakdown</h3>
        <div className="hero-progress-bars">
          <div className="progress-bar-row">
            <div className="progress-bar-labels">
              <span>Workbook Pages</span>
              <strong>88/90 (98%)</strong>
            </div>
            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: "98%" }} />
            </div>
          </div>
          <div className="progress-bar-row">
            <div className="progress-bar-labels">
              <span>Book Illustrations</span>
              <strong>318/330 (96%)</strong>
            </div>
            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: "96%" }} />
            </div>
          </div>
          <div className="progress-bar-row">
            <div className="progress-bar-labels">
              <span>Approved Word Voice MP3s</span>
              <strong>162/199 (81%)</strong>
            </div>
            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: "81%" }} />
            </div>
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 10, color: "#86efac" }}>
          <b>Live:</b> <code>Mariposas-P</code> @ <code>c670ff04</code> · <b>Main:</b> #1204 motion, #1205 crops.
        </p>
      </article>
    </div>
   </section>
   <header className="mission-heading">
    <div><p className="mission-eyebrow"><span className="mission-pulse"/> NBO / SOFTWARE OPERATIONS</p>
    <h1>{workspace==="overview"?"Your development":workspace==="coding"?"Build and":workspace==="review"?"Review before":"One task."} <span>{workspace==="overview"?"workspace":workspace==="coding"?"ship":workspace==="review"?"release":"Full focus."}</span></h1>
    <p className="mission-description">{workspace==="overview"?"Your projects and AI work, clearly organized in one place.":workspace==="coding"?"Track the actual issues and pull requests being built.":workspace==="review"?"Inspect evidence gaps and decisions before approving results.":"See one task at a time, with its context and next action."}</p></div>
   </header>
   <section className="mission-now" aria-label="Three Cartilla actions from GitHub">
    <div className="mission-now-heading"><div><p className="mission-eyebrow">LA CARTILLA DE GRETEL · CURRENT PRIORITIES</p><h2>Three things that matter now</h2></div><span>{jobs.fetchedAt&&!jobs.stale?"Queue checked "+fmt(jobs.fetchedAt):"Showing verified GitHub links · queue status pending"}</span></div>
    <div className="mission-now-grid">{priorities.map(p=><a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className={"mission-now-card mission-now-"+p.id}><small>{p.step}</small><strong>{p.title}</strong><span className="mission-now-state">{p.state}</span><p>{p.detail}</p><b>OPEN ACTUAL GITHUB RECORD ↗</b></a>)}</div>
    {playbackProof&&<div className="mission-proof-reel"><div className="mission-proof-video"><video src={playbackProof.src} controls playsInline preload="metadata" aria-label={"Recorded Cartilla proof from pull request "+playbackProof.prNumber}/></div><div className="mission-proof-description"><strong>Real recorded evidence · PR #{playbackProof.prNumber}</strong><p>This is a versioned GitHub recording of the linked change, not a live-agent feed or proof that the full application is deployed.</p><a href={playbackProof.sourceUrl} target="_blank" rel="noopener noreferrer">Inspect recording in GitHub ↗</a></div></div>}
   </section>
   {workspace!=="overview"&&<div className="workspace-banner"><strong>{workspaceLabels[workspace]} workspace</strong><span>{workspace==="coding"?"Showing only open issues and code changes.":workspace==="review"?"Only work awaiting proof or owner decisions.":"Select the next task and examine its evidence without distracting metrics."}</span></div>}
   <GretelCommander project={projects.find(p=>p.slug==="cartilla-de-gretel")} jobs={jobs.jobs||[]} approvals={jobs.approvals||[]} loading={busy||Boolean(jobs.loading)||Boolean(jobs.error)} stale={Boolean(jobs.stale)||Boolean(jobs.error)} fetchedAt={jobs.fetchedAt} execution={jobs.execution}/>
   <div className="mission-metrics" aria-label="Actionable delivery statistics">
    {tiles.map(t=><button key={t.key} type="button" className={"mission-metric mission-tone-"+t.tone+(filter===t.key?" chosen":"")} onClick={()=>choose(t.key)} aria-pressed={filter===t.key}>
     <span>{t.name}</span><strong>{t.value===null?"—":t.value}</strong><small>{t.value===null?"Source incomplete":t.desc}</small>
    </button>)}
   </div>
   <section className="mission-panel mission-work" id="mission-work">
    <div className="mission-panel-head">
      <div><p className="mission-eyebrow">01 / OPERATIONS QUEUE</p><h2>What still needs work</h2><p>Select a task to inspect what happened and what to do next.</p></div>
      <span className="mission-panel-count">{dataValid&&fullyLoaded?visible.length+" matching items":"Partial source"}</span>
    </div>
    <div className="mission-filterbar" role="group" aria-label="Filter work queue">
     {([{key:"all",name:"All work"},{key:"owner",name:"Needs You"},{key:"proof",name:"Missing proof"},{key:"draft",name:"Draft PRs"},{key:"verified",name:"Verified"}] as {key:Filter;name:string}[]).map(f=><button key={f.key} type="button" onClick={()=>setFilter(f.key)} aria-pressed={filter===f.key} className={filter===f.key?"active":""}>{f.name}</button>)}
     <label className="bot-filter-toggle">
      <input type="checkbox" checked={hideBotMicroPrs} onChange={e=>{setHideBotMicroPrs(e.target.checked);if(e.target.checked)setExpandBotMicroPrs(false);}}/>
      <span>Hide unapproved bot micro-PRs</span>
     </label>
    </div>
    <div className="mission-worktools">
      <label className="mission-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a project, PR or task" aria-label="Find a project, pull request or task"/></label>
      <select value={scope} onChange={e=>setScope(e.target.value)} aria-label="Filter by repository"><option value="all">All repositories</option>{projects.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
    </div>
    {hideBotMicroPrs&&botMicroPrItems.length>0&&<div className="bot-pr-summary-row">
      <span>🤖 <b>{botMicroPrItems.length} automated code-health micro-PRs</b> matching <code>/^(🧹|⚡|🧪)/</code> (#19–#24, #29–#44) collapsed to keep focus on Cartilla & owner priorities.</span>
      <button type="button" onClick={()=>setExpandBotMicroPrs(v=>!v)} aria-expanded={expandBotMicroPrs}>{expandBotMicroPrs?"Collapse bot micro-PRs ▴":`Show ${botMicroPrItems.length} bot micro-PRs ▾`}</button>
    </div>}
    <div className="mission-tablehead"><span>WORK ITEM</span><span>PROJECT</span><span>STATE</span><span>UPDATED</span></div>
    <div className="mission-tasklist">
      {visible.slice(0,40).map(item=><button key={item.id} type="button" className={"mission-task"+(selectedItem?.id===item.id?" selected":"")} onClick={()=>{setSelected(item.id);setPanel("inspector");setCopied("");setMobileInspect(true)}} aria-pressed={selectedItem?.id===item.id}>
       <span className="mission-task-title"><b>{item.title}</b><small>{item.kind} · {item.id}</small></span>
       <span className="mission-task-project">{item.project}</span>
       <span className={"mission-status mission-tone-"+color[item.state]}>{label[item.state]}</span>
       <span className="mission-task-time">{fmt(item.updatedAt)}</span>
      </button>)}
      {!visible.length&&<p className="mission-empty">{busy||jobs.loading?"Loading source records…":"No records match these filters."}</p>}
    </div>
    {visible.length>40&&<p className="mission-footnote">Showing first 40 matching entries. Use search or project filters to narrow the queue.</p>}
    <div className="mission-panel-bottom"><span>Open PRs and draft changes are not completed releases.</span>{workspace==="focus"&&visible.length>1&&<button className="focus-next" type="button" onClick={()=>{const index=visible.findIndex(x=>x.id===selectedItem?.id);setSelected(visible[(index+1)%visible.length].id);setPanel("inspector");setMobileInspect(true)}}>Next task →</button>}<Link href="/github">Explore GitHub Intelligence ↗</Link></div>
   </section>
   <div className="mission-lower">
    <section className="mission-panel mission-projects"><div className="mission-panel-head"><div><p className="mission-eyebrow">02 / ACTIVE REPOSITORIES</p><h2>Your projects</h2></div><Link href="/projects">View all ↗</Link></div>
     <div className="mission-project-grid">{(pinned.length?pinned:projects).slice(0,4).map(p=><Link href={projectPath(p.slug)} key={p.slug} className="mission-project"><span className="mission-repo-icon">▣</span><strong>{p.name}</strong><small>{p.stale||p.limited?"Partial source":p.issues===null?"Unavailable":p.issues+" issues · "+(p.prs??"—")+" PRs"}</small><span>OPEN PROJECT →</span></Link>)}</div>
     {!projects.length&&<p className="mission-empty">Loading GitHub projects…</p>}
    </section>
    <section className="mission-panel mission-history"><div className="mission-panel-head"><div><p className="mission-eyebrow">03 / RECENT CHANGES</p><h2>Updated work</h2></div></div>
     {all.filter(i=>i.kind==="Pull request"||i.kind==="Issue").sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,4).map(x=><article key={x.id}><span className="mission-history-dot"/><div><External href={x.source}>{x.title}</External><p>{x.project} · {fmt(x.updatedAt)}</p></div></article>)}
     <Link href="/github" className="mission-history-link">View GitHub activity →</Link>
    </section>
   </div>
  </div>
  {mobileInspect&&<button type="button" className="mission-rail-shade" aria-label="Close inspector" onClick={()=>setMobileInspect(false)}/>}
  <aside className={"mission-inspector"+(mobileInspect?" mission-inspector-open":"")} aria-label="Intelligence and task inspector">
    <button className="mission-rail-close" type="button" onClick={()=>setMobileInspect(false)} aria-label="Close task inspector">×</button>
    <div className="mission-inspector-tabs" role="group" aria-label="Inspector sections">
      {tabs.map(t=><button type="button" key={t.key} onClick={()=>{setPanel(t.key);setCopied("")}} aria-pressed={panel===t.key}>{t.label}</button>)}
    </div>
    {panel==="inspector"&&<div className="mission-inspector-content">
      <p className="mission-eyebrow">TASK INSPECTOR / LIVE EVIDENCE</p>
      {selectedItem?<><div className={"mission-status mission-tone-"+color[selectedItem.state]}>{label[selectedItem.state]}</div>
       <h2>{selectedItem.title}</h2><p className="mission-inspector-meta">{selectedItem.project} · {selectedItem.kind}</p>
       <div className="mission-inspector-block"><h3>WHAT WE KNOW</h3><p>{selectedItem.summary}</p></div>
       <div className="mission-inspector-block"><h3>NEXT ELIGIBLE ACTION · {selectedItem.project}</h3><p>{selectedItem.next}</p></div>
       {selectedItem.missing.length>0&&<div className="mission-inspector-block mission-missing"><h3>MISSING PROOF · {alertText(selectedItem.missing.length)}</h3>{selectedItem.missing.map(m=><p key={m}>• {m}</p>)}</div>}
       <div className="mission-inspector-actions"><External href={selectedItem.source}>Open source ↗</External>{selectedItem.proof&&<External href={selectedItem.proof}>View proof ↗</External>}
        <button type="button" onClick={()=>void copyPrompt(selectedItem)}>{copied==="yes"?"✓ Handoff copied":copied==="error"?"Copy unavailable":"Copy corrective AI handoff"}</button></div>
       <p className="mission-inspector-note">Record updated {fmt(selectedItem.updatedAt)}. {selectedItem.kind==="Agent job report"||selectedItem.kind==="Owner approval"?(dataValid?"Current evidence snapshot.":"Evidence snapshot stale or unavailable."):(projects.some(p=>p.slug===selectedItem.slug&&p.accessible&&!p.stale&&!p.limited)?"Current GitHub source snapshot.":"GitHub source stale or unavailable.")} Missing proof limits acceptance of this item only; other eligible work may continue. No merge, deployment or AI task is launched by this panel.</p>
      </>:<p className="mission-empty">Choose a work item to inspect verified source records.</p>}
    </div>}
    {panel==="decisions"&&<div className="mission-inspector-content"><p className="mission-eyebrow">OWNER CHECKPOINT</p><h2>Needs your decision</h2>{!dataValid?<p className="mission-empty">Approval source unavailable or refreshing.</p>:decisions.length?decisions.map(d=><button key={d.id} className="mission-minirow" onClick={()=>{setSelected(d.id);setPanel("inspector");setMobileInspect(true)}}>{d.title}<small>{d.project} · Review proof</small></button>):<p className="mission-empty">No decisions with qualified evidence are waiting.</p>}<p className="mission-inspector-note">Draft or unverified jobs do not qualify for owner approval.</p></div>}
    {panel==="blocked"&&<div className="mission-inspector-content"><p className="mission-eyebrow">EVIDENCE GAPS</p><h2>Unverified work · not a global block</h2>{!dataValid?<p className="mission-empty">Job evidence unavailable or refreshing.</p>:blocked.length?blocked.map(x=><button key={x.id} className="mission-minirow" onClick={()=>{setSelected(x.id);setPanel("inspector");setMobileInspect(true)}}>{x.title}<small>{alertText(x.missing.length)} · {x.project}</small></button>):<p className="mission-empty">No unverified job reports in the source feed.</p>}<Link href="/evidence" className="mission-inspector-cta">Open all evidence →</Link></div>}
    {panel==="memory"&&<div className="mission-inspector-content"><p className="mission-eyebrow">OBSIDIAN-STYLE KNOWLEDGE</p><h2>Human authority. Machine findings.</h2><p className="mission-inspector-meta">The owner decides. AI agents document evidence.</p><div className="mission-memory-links"><Link href="/knowledge">▤ Knowledge & Memory →</Link><External href="https://github.com/ejnburrows-rgb/Command-Center-/blob/main/knowledge/AGENT.md">↳ AGENT.md source</External><External href="https://github.com/ejnburrows-rgb/Command-Center-/tree/main/knowledge/Machine">↳ Verified findings</External></div><p className="mission-inspector-note">Private documents require your GitHub sign-in; they are not leaked to anonymous viewers.</p></div>}
    <div className="mission-inspector-bottom"><span className="mission-datalight"/><div><strong>GITHUB-BACKED SOURCES</strong><small>{fullyLoaded?"All tracked sources current":"Some sources unavailable or stale"} · {dataValid?"Evidence fetched":"Evidence status unknown"}</small></div></div>
  </aside>
  <nav className="mission-mobile-dock" aria-label="Mobile shortcuts"><Link href="/ai-operations">◈<span>AI Ops</span></Link><Link href="/projects">▣<span>Projects</span></Link><Link href="/evidence">✓<span>Proof</span></Link><Link href="/knowledge">▤<span>Memory</span></Link></nav>
 </div>;
}
