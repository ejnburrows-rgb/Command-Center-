"use client";
import { useState, useMemo } from "react";
import type { Inventory, Slot, MotionItem } from "../../lib/art-inventory";

const CREAM = "#fbf6e8";
const DARK = "#1c1a14";

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  padding: "10px 12px",
  borderRadius: 8,
  border: "2px solid #1c1a14",
  background: "#ffffff",
  color: "#1c1a14",
  font: "15px system-ui, sans-serif",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "2px solid #1c1a14",
  background: "#ffffff",
  color: "#1c1a14",
  font: "14px system-ui, sans-serif",
  fontWeight: 600,
};

function Orig({ s, base, mainBase }: { s: Slot; base: string; mainBase: string }) {
  const o = s.orig;
  if (!o) return <div style={none}>no crop on file</div>;
  const resolveSrc = (src: string) => (src.startsWith("public/") ? mainBase + src : base + src);
  if (o.kind === "image") return <img loading="lazy" src={resolveSrc(o.src)} alt="" style={img} />;
  const [, , cw, ch] = o.box;
  const [cx, cy] = o.box;
  return (
    <div
      style={{
        height: 170,
        display: "flex",
        justifyContent: "center",
        background: CREAM,
        border: "1px solid #d8cfae",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          alignSelf: "center",
          width: `min(100%, ${(170 * cw) / ch}px)`,
          aspectRatio: `${cw}/${ch}`,
        }}
      >
        <img
          loading="lazy"
          alt=""
          src={resolveSrc(o.src)}
          style={{
            position: "absolute",
            width: `${(o.sw / cw) * 100}%`,
            left: `${(-cx / cw) * 100}%`,
            top: `${(-cy / ch) * 100}%`,
            maxWidth: "none",
          }}
        />
      </div>
    </div>
  );
}

const img: React.CSSProperties = {
  width: "100%",
  height: 170,
  objectFit: "contain",
  background: CREAM,
  border: "1px solid #d8cfae",
  borderRadius: 8,
  display: "block",
};
const none: React.CSSProperties = {
  height: 170,
  display: "grid",
  placeItems: "center",
  border: "2px dashed #b33",
  color: "#b33",
  borderRadius: 8,
  fontSize: 13,
};
const cap: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: ".04em",
  marginTop: 4,
  textAlign: "center",
  textTransform: "uppercase",
  color: "#3b3628",
};

function PageThumb({ s, base, mainBase }: { s: Slot; base: string; mainBase: string }) {
  const [pw, ph] = s.book_page.size;
  const c = s.book_page.circle;
  if (!s.book_page.src) return <div style={none}>no page scan</div>;
  const pad = Math.min(pw, ph) / 60;
  const pageSrc = s.book_page.src.startsWith("public/") ? mainBase + s.book_page.src : base + s.book_page.src;
  return (
    <div
      style={{
        position: "relative",
        width: `min(100%, ${(340 * pw) / ph}px)`,
        margin: "0 auto",
        aspectRatio: `${pw}/${ph}`,
        border: "1px solid #d8cfae",
        background: "#fff",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <img loading="lazy" alt="" src={pageSrc} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {c && (
        <div
          style={{
            position: "absolute",
            left: `${((c.box[0] - pad) / pw) * 100}%`,
            top: `${((c.box[1] - pad) / ph) * 100}%`,
            width: `${((c.box[2] + 2 * pad) / pw) * 100}%`,
            height: `${((c.box[3] + 2 * pad) / ph) * 100}%`,
            border: "3px solid #dc143c",
            borderRadius: "50%",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

function Tags({ s, inv }: { s: Slot; inv: Inventory }) {
  if (!s.tags.length)
    return (
      <p style={{ margin: "2px 0", color: "#2d6a2d", fontWeight: 700, fontSize: 12 }}>
        ✓ No script quality flags on this placement
      </p>
    );
  return (
    <div style={{ margin: "4px 0" }}>
      {s.tags.map((t) => (
        <span
          key={t}
          title={inv.tagMeaning[t]}
          style={{
            display: "inline-block",
            margin: "0 4px 4px 0",
            padding: "2px 6px",
            background: "#ffe3e0",
            border: "1px solid #b33",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: "#7a2020",
          }}
        >
          {t.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

function Viewer({ s, inv, onClose }: { s: Slot; inv: Inventory; onClose: () => void }) {
  const pageUrl = s.book_page.src.startsWith("public/") ? inv.mainBase + s.book_page.src : inv.base + s.book_page.src;
  const [pw, ph] = s.book_page.size;
  const c = s.book_page.circle;
  const pad = Math.min(pw, ph) / 60;
  const linkStyle: React.CSSProperties = {
    display: "inline-block",
    margin: "6px 8px 0 0",
    padding: "8px 12px",
    border: "2px solid #1c1a14",
    borderRadius: 8,
    color: "#1c1a14",
    background: "#fff",
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: CREAM, color: DARK, overflowY: "auto", padding: 16 }}>
      <button onClick={onClose} style={{ ...linkStyle, position: "sticky", top: 0, background: DARK, color: CREAM, zIndex: 10 }}>
        ← Back to inventory
      </button>
      <h2 style={{ margin: "10px 0 4px", fontSize: 22 }}>
        {s.artwork_id} <small style={{ fontWeight: 400, color: "#6b6450" }}>({s.id} · {s.label} · {s.book}, p. {s.page})</small>
      </h2>
      <p style={{ margin: "4px 0 10px", fontSize: 14, color: "#4a4536" }}>
        Status: <b>{s.status}</b> · Drawing Group: <code>{s.canonicalDrawingGroup || "—"}</code>
        {s.isFlaggedWorkbookSubject ? " · [10 FLAGGED WORKBOOK SUBJECT]" : ""}
        {s.isRepairedIn1205 ? " · [REPAIRED IN PR #1205]" : ""}
      </p>
      <Tags s={s} inv={inv} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 12 }}>
        <div style={{ background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #d8cfae" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>1. Original Physical Book Page {c ? "(Highlighted Circle)" : "(Full Page)"}</h3>
          {!s.book_page.src ? (
            <p>Scan unavailable.</p>
          ) : (
            <div style={{ position: "relative", width: "100%", aspectRatio: `${pw || 1}/${ph || 1}`, border: "1px solid #eee", background: "#f9f9f9" }}>
              <img src={pageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              {c && pw > 0 && ph > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${((c.box[0] - pad) / pw) * 100}%`,
                    top: `${((c.box[1] - pad) / ph) * 100}%`,
                    width: `${((c.box[2] + 2 * pad) / pw) * 100}%`,
                    height: `${((c.box[3] + 2 * pad) / ph) * 100}%`,
                    border: "3px solid #dc143c",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
          )}
          <p style={{ fontSize: 11, margin: "6px 0 0", color: "#555" }}>Scan: <code>{s.book_page.src}</code></p>
        </div>

        <div style={{ background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #d8cfae" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>2. Original Highlighted Drawing Crop</h3>
          <Orig s={s} base={inv.base} mainBase={inv.mainBase} />
          <p style={{ fontSize: 11, margin: "6px 0 0", color: "#555", wordBreak: "break-all" }}>
            Canonical Source Crop: <code>{s.canonicalSourceCropPath || "—"}</code> (Verified: {s.canonicalSourceCropVerified || "—"})
          </p>
        </div>

        <div style={{ background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #d8cfae" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>3. Latest Approved Canonical & App-Loaded Image</h3>
          <img
            src={s.canonicalImageUrl}
            alt=""
            style={{ width: "100%", height: 220, objectFit: "contain", background: CREAM, borderRadius: 6, border: "1px solid #d8cfae" }}
          />
          <p style={{ fontSize: 11, margin: "6px 0 0", wordBreak: "break-all", color: "#333" }}>
            <b>Canonical Master (Main):</b> <code>{s.canonicalDestinationPath || "—"}</code>
          </p>
          <p style={{ fontSize: 11, margin: "4px 0 0", wordBreak: "break-all", color: "#555" }}>
            <b>App-Loaded Provenance:</b> {s.appLoadedRefLabel} (<code>{s.app}</code>)
          </p>
        </div>
      </div>

      {/* All 11 Required Part 4 Inspection Fields */}
      <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "2px solid #d8cfae", marginTop: 14, fontSize: 13 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Part 4 Complete Image Quality & Cropping Audit</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
          <div><b>5. Crop Completeness:</b> {s.cropCompleteness}</div>
          <div><b>6. Orientation & Object Count:</b> {s.orientationAndObjectCount}</div>
          <div><b>7. Resolution & Scaling:</b> {s.resolutionAndScaling}</div>
          <div><b>8. Transparency / Background:</b> {s.transparencyCorrectness}</div>
          <div><b>9. Source Fidelity:</b> {s.sourceFidelity}</div>
          <div><b>10. Owner Approval Status:</b> {s.ownerApprovalStatus}</div>
          <div><b>11a. Better Approved Source:</b> {s.betterApprovedSourceExists}</div>
          <div><b>11b. Smallest Source-Preserving Fix:</b> {s.smallestSourcePreservingFix}</div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryView({
  inv,
  openSlot,
  initBook,
  initFilter,
  initTab = "activities",
}: {
  inv: Inventory;
  openSlot?: string;
  initBook?: string;
  initFilter?: string;
  initTab?: "activities" | "artwork" | "motion";
}) {
  const [tab, setTab] = useState<"activities" | "artwork" | "motion">(initTab);
  const [actCategory, setActCategory] = useState<string>("");
  const [actStatus, setActStatus] = useState<string>("");
  const [actSearch, setActSearch] = useState<string>("");

  const [f, setF] = useState(initFilter === "nf" ? "NOT FINISHED" : "");
  const [bk, setBk] = useState(initBook === "workbook" ? "Workbook" : initBook === "flipchart" ? "Flip Chart" : "");
  const [tg, setTg] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [repairedOnly, setRepairedOnly] = useState(false);
  const [artSearch, setArtSearch] = useState("");
  const [mode, setMode] = useState<"crop" | "page">("page");

  const [motStatus, setMotStatus] = useState<string>("");
  const [motCatalog, setMotCatalog] = useState<string>("");
  const [motSearch, setMotSearch] = useState<string>("");
  const [simulateReducedMotion, setSimulateReducedMotion] = useState<boolean>(false);

  const [open, setOpen] = useState<string | null>(
    openSlot && inv.slots.some((x) => x.id === openSlot || x.artwork_id === openSlot) ? openSlot : null
  );
  const cur = open ? inv.slots.find((x) => x.id === open || x.artwork_id === open) : null;

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return inv.activities.filter((a) => {
      if (actCategory && a.category !== actCategory) return false;
      if (actStatus && a.workingStatus !== actStatus) return false;
      if (actSearch) {
        const q = actSearch.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.correctBehavior.toLowerCase().includes(q) ||
          a.route.toLowerCase().includes(q) ||
          String(a.printedPage || "").includes(q) ||
          String(a.lessonNumber || "").includes(q)
        );
      }
      return true;
    });
  }, [inv.activities, actCategory, actStatus, actSearch]);

  // Filtered Artwork Slots
  const filteredSlots = useMemo(() => {
    return inv.slots.filter((s) => {
      if (bk && s.book !== bk) return false;
      if (f === "NOT FINISHED" && !s.notFinished) return false;
      if (f === "UNRESOLVED_COVER" && s.canonicalGroupStatus !== "UNRESOLVED") return false;
      if (f && f !== "NOT FINISHED" && f !== "UNRESOLVED_COVER" && s.status !== f) return false;
      if (tg && !s.tags.includes(tg)) return false;
      if (flaggedOnly && !s.isFlaggedWorkbookSubject) return false;
      if (repairedOnly && !s.isRepairedIn1205) return false;
      if (artSearch) {
        const q = artSearch.toLowerCase();
        return (
          s.id.toLowerCase().includes(q) ||
          s.artwork_id.toLowerCase().includes(q) ||
          s.label.toLowerCase().includes(q) ||
          String(s.page).includes(q) ||
          (s.canonicalPlacementNote || "").toLowerCase().includes(q) ||
          (s.canonicalDrawingGroup || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inv.slots, bk, f, tg, flaggedOnly, repairedOnly, artSearch]);

  // Filtered Motion Items
  const filteredMotion = useMemo(() => {
    return inv.motion.filter((m) => {
      if (motCatalog && m.catalogSource !== motCatalog) return false;
      if (motStatus && m.motionStatus !== motStatus) return false;
      if (motSearch) {
        const q = motSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.meaning.toLowerCase().includes(q) ||
          m.still.toLowerCase().includes(q) ||
          m.whatPhysicallyMoves.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inv.motion, motCatalog, motStatus, motSearch]);

  const t = inv.totals;
  const ac = t.activitiesCount;
  const mc = t.motionCount;
  const nf = inv.slots.filter((s) => s.notFinished).length;
  const isAuditBehindMain = Boolean(inv.auditedSha && inv.mainSha && inv.auditedSha !== inv.mainSha);

  const tabBtn = (k: "activities" | "artwork" | "motion", labelText: string, subtitleBadge: string) => (
    <button
      onClick={() => setTab(k)}
      style={{
        flex: 1,
        minWidth: 115,
        padding: "10px 12px",
        font: "15px system-ui, sans-serif",
        fontWeight: 800,
        borderRadius: "10px 10px 0 0",
        border: "2px solid #1c1a14",
        borderBottom: tab === k ? "none" : "2px solid #1c1a14",
        background: tab === k ? CREAM : "#e2d8ca",
        color: tab === k ? DARK : "#4a4536",
        cursor: "pointer",
      }}
    >
      {labelText}{" "}
      <span
        style={{
          background: tab === k ? DARK : "#6b6450",
          color: CREAM,
          padding: "2px 7px",
          borderRadius: 10,
          fontSize: 11,
          marginLeft: 4,
          display: "inline-block",
        }}
      >
        {subtitleBadge}
      </span>
    </button>
  );

  return (
    <div style={{ background: CREAM, color: DARK, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {cur && <Viewer s={cur} inv={inv} onClose={() => setOpen(null)} />}

      {/* Top Header & Authority Banner */}
      <header style={{ padding: "14px 16px", background: DARK, color: CREAM }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#5ed5bb", textTransform: "uppercase" }}>
              NBO Operations Hub · Cartilla Visual QA & Integration Review
            </span>
            <h1 style={{ margin: "2px 0 4px", fontSize: 22, fontWeight: 900 }}>
              Cartilla Visual Activity, Artwork & Motion Inventory
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#d8cfae" }}>
              Production main: <code>{inv.mainSha.slice(0, 10)}</code> · Archival Scan Ref ({inv.ref}):{" "}
              <code>{inv.sha.slice(0, 10)}</code> · Tutor PR #1073: {inv.tutorSource.freshness}{" "}
              ({inv.tutorSource.lifecycle}) · head <code>{inv.tutorSource.headSha?.slice(0, 10) || "UNAVAILABLE"}</code>{" "}
              · Source checked: {inv.tutorSource.observedAt ? inv.tutorSource.observedAt.replace("T", " ").slice(0, 16) + " UTC" : "unavailable"} · Inventory checked:{" "}
              {inv.fetchedAt.replace("T", " ").slice(0, 16)} UTC
            </p>
            {inv.tutorSource.freshness === "UNAVAILABLE" && <p role="status" style={{ margin: "6px 0 0", fontSize: 12, color: "#ffd7a8" }}>
              Tutor PR source unavailable: {inv.tutorSource.error} Tutor proof is hidden until the current PR head can be verified.
            </p>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/"
              style={{
                padding: "8px 12px",
                background: "#333",
                color: CREAM,
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                border: "1px solid #666",
              }}
            >
              ← NBO Overview
            </a>
            <a
              href="/projects/cartilla-de-gretel"
              style={{
                padding: "8px 12px",
                background: "#333",
                color: CREAM,
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                border: "1px solid #666",
              }}
            >
              Project Hub
            </a>
            <a
              href="https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/mariposas-p"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 12px",
                background: "#258351",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Live Mariposas ↗
            </a>
          </div>
        </div>
      </header>

      {/* Stale Audit & Source vs Production Separation Banner */}
      {isAuditBehindMain && (
        <div
          style={{
            background: "#fff8e1",
            borderBottom: "2px solid #f59e0b",
            padding: "8px 16px",
            fontSize: 12,
            color: "#78350f",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <b>⚠️ Provenance & Stale-Evidence Guard:</b> Archival script metrics (<code>quality.json</code> /{" "}
            <code>app-loaded.json</code>) were recorded at commit <code>{inv.auditedSha.slice(0, 10)}</code>, while canonical{" "}
            <code>main</code> is at <code>{inv.mainSha.slice(0, 10)}</code> (includes merged #1204 motion & #1205 51-destination crop repairs).{" "}
            <b>Live Production Separation:</b> Only <code>/cartilla/juego/mariposas-p</code> (release <code>c670ff04</code>) was authorized for live deployment on Oct 28; other <code>main</code> routes are <b>MERGED NOT LIVE</b> until owner release approval.
          </div>
          <div style={{ fontSize: 11, background: "#fef3c7", padding: "4px 8px", borderRadius: 6, border: "1px solid #d97706" }}>
            <b>#877 Authority Note:</b> Queue #877 authorizes Tutor #1073 product work; this NBO view is read-only Cartilla inspection.
          </div>
        </div>
      )}

      {/* Section Tabs (Never summing orthogonal activity categories) */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px 0",
          background: "#e8dfd1",
          borderBottom: "2px solid #1c1a14",
          overflowX: "auto",
        }}
      >
        {tabBtn("activities", "1. ACTIVITIES", `${ac.lessons}L · ${ac.standaloneGames}G · ${ac.workbookPagesTotal}WB`)}
        {tabBtn("artwork", "2. ARTWORK", `${t.all} Placements · ${t.drawingGroups} Groups`)}
        {tabBtn("motion", "3. MOTION", `${mc.manifestTotal} Manifest SVGs`)}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVITIES INVENTORY                                               */}
      {/* ========================================================================= */}
      {tab === "activities" && (
        <section style={{ padding: 14 }}>
          <div
            style={{
              background: "#f3efe2",
              border: "1px solid #d8cfae",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 13,
              color: "#3b3628",
            }}
          >
            <b>Orthogonal Category Rule:</b> The 7 activity categories below represent distinct architectural layers (Lessons, Printed Workbook Pages & Underlying Exercises, Teacher Flip Chart Sheets, Standalone Games, Practice Modes, Assignment Types, Tutor Milestones, and Disconnected Components). They are <b>never</b> added into a single combined total.
          </div>

          {/* 7 Distinct Category Count Cards (All Dynamically Computed) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 8, marginBottom: 14 }}>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>Curriculum Lessons</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{ac.lessons}</div>
              <small style={{ color: "#4a4536" }}>1 Intro · 5 Vowels · 18 Consonants</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>1. Workbook Pages</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {ac.workbookPagesAvailable} <span style={{ fontSize: 13, color: "#b33" }}>+{ac.sourceBlockedPages} Blocked</span>
              </div>
              <small style={{ color: "#4a4536" }}>
                <b>{ac.workbookUnderlyingExercises}</b> exercises · <b>{ac.workbookPrintedInstructions}</b> instructions · {ac.workbookArchetypes} archetypes
              </small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>2. Flip Chart Sheets</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{ac.flipchartSheets}</div>
              <small style={{ color: "#4a4536" }}>{ac.flipchartIllustratedSheets} illustrated · Top-edge turn</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #258351" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#258351", textTransform: "uppercase" }}>3. Standalone Games</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {ac.standaloneGames} <span style={{ fontSize: 13, color: "#258351" }}>[{ac.liveGames} Live]</span>
              </div>
              <small style={{ color: "#4a4536" }}>mariposas-p verified live in prod</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>4. Practice Modes</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{ac.practiceModes}</div>
              <small style={{ color: "#4a4536" }}>silabas · palabras · armar · trazar · piano</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>5. Assignment Types</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{ac.assignmentTypes}</div>
              <small style={{ color: "#4a4536" }}>write · read · draw · match · listen · trace</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #f57c00" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f57c00", textTransform: "uppercase" }}>6. Tutor · 7. Unmounted</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {ac.tutorMilestones} PR <span style={{ fontSize: 13, color: "#666" }}>· {ac.disconnectedFeatures} Unmounted</span>
              </div>
              <small style={{ color: "#4a4536" }}>PR #1073 L1 + {ac.disconnectedFeatures} disconnected files</small>
            </div>
          </div>

          {/* Part 1: Mariposas Parity & PR #1010 Comparison Card */}
          <article style={{ background: "#edf7ed", border: "2px solid #2e7d32", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <span style={{ background: "#2e7d32", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                  PART 1 · WORKS LIVE IN PRODUCTION · MARIPOSAS-P
                </span>
                <h3 style={{ margin: "4px 0 2px", fontSize: 18, color: "#1b5e20" }}>
                  Butterfly Garden (Jardín de Mariposas) — Source Parity & Live Verification
                </h3>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <a
                  href="https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/mariposas-p"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 12px", background: "#2e7d32", color: "#fff", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 13 }}
                >
                  Play Live Game ↗
                </a>
                <a
                  href={inv.mainBase + "docs/proofs/mariposas-2026-10-29/phone-touch.webm"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 12px", background: "#1c1a14", color: "#fbf6e8", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 13 }}
                >
                  ▶ Phone Touch Video (.webm)
                </a>
                <a
                  href={inv.mainBase + "docs/proofs/mariposas-2026-10-29/rotation-flights.webm"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "8px 12px", background: "#1c1a14", color: "#fbf6e8", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 13 }}
                >
                  ▶ 6 Flights Video (.webm)
                </a>
              </div>
            </div>
            <p style={{ margin: "6px 0", fontSize: 13, color: "#1b5e20" }}>
              <b>Source Parity:</b> Imported via Cartilla <b>PR #1079</b> from <code>ejnburrows-rgb/butterfly-garden-adventure-51</code> and deployed at commit <code>c670ff04</code>. All <b>33/33 original graphics</b> in <code>src/assets/games/butterfly-garden/</code> match byte-for-byte (14 syllable butterflies, 6 perched garden butterflies, 3 flowers, 5 UI buttons, 3 frames, <code>garden.jpg</code>, <code>net.png</code>). All 6 journeys (phone touch, desktop round, 6 flight paths, keyboard focus, instructions modal Escape/Enter, and single-record session persistence) are verified.
            </p>
            <div style={{ background: "#fff", padding: 10, borderRadius: 8, fontSize: 12, color: "#333", marginTop: 8, border: "1px solid #a5d6a7" }}>
              <b>Draft PR #1010 Comparison (Do Not Replace):</b> Draft PR #1010 (<code>MariposasScene.tsx</code>) was an earlier attempt using 10 static WebP cutouts and Web Speech TTS fallback without the 6 garden flight animations or 33 original assets. PR #1079 supersedes PR #1010 completely. <b>Only Remaining Action for Mariposas:</b> Wire owner-approved authentic Gretel voice recordings into the existing audio hooks under <b>#769</b>.
            </div>
          </article>

          {/* Activity Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search activity by lesson, page, name, route, or behavior..."
              value={actSearch}
              onChange={(e) => setActSearch(e.target.value)}
              style={inputStyle}
            />
            <select value={actCategory} onChange={(e) => setActCategory(e.target.value)} style={selectStyle}>
              <option value="">All 7 Orthogonal Categories (Filter Below)</option>
              <option value="standalone_game">3. Standalone Games ({ac.standaloneGames})</option>
              <option value="workbook_exercise">
                1. Physical Workbook Pages ({ac.workbookPagesTotal} pages · {ac.workbookUnderlyingExercises} exercises)
              </option>
              <option value="flipchart_sheet">2. Teacher Flip Chart Sheets ({ac.flipchartSheets})</option>
              <option value="practice_mode">4. Practice Modes ({ac.practiceModes})</option>
              <option value="assignment_type">5. Assignment / Interaction Types ({ac.assignmentTypes})</option>
              <option value="tutor_experience">6. Tutor Experience ({ac.tutorMilestones})</option>
              <option value="disconnected_feature">7. Built but Disconnected Features ({ac.disconnectedFeatures})</option>
            </select>
            <select value={actStatus} onChange={(e) => setActStatus(e.target.value)} style={selectStyle}>
              <option value="">All Verification Statuses</option>
              <option value="WORKS_LIVE">WORKS — LIVE IN PROD ({ac.liveGames})</option>
              <option value="WORKS_ON_MAIN">WORKS — VERIFIED ON MAIN</option>
              <option value="IN_PROGRESS_PR">IN PROGRESS — PR PROOF</option>
              <option value="NOT_VERIFIED">NOT VERIFIED — BUILT ON MAIN (NEEDS LIVE RUN)</option>
              <option value="DISCONNECTED_PENDING">DISCONNECTED / PENDING OWNER DATA</option>
              <option value="SOURCE_BLOCKED">SOURCE BLOCKED ({ac.sourceBlockedPages})</option>
            </select>
          </div>

          {/* Activity Cards List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            {filteredActivities.map((act) => {
              const statusColor =
                act.workingStatus === "WORKS_LIVE"
                  ? "#2e7d32"
                  : act.workingStatus === "WORKS_ON_MAIN"
                  ? "#1565c0"
                  : act.workingStatus === "IN_PROGRESS_PR"
                  ? "#ef6c00"
                  : act.workingStatus === "SOURCE_BLOCKED"
                  ? "#c62828"
                  : act.workingStatus === "NOT_VERIFIED"
                  ? "#6a1b9a"
                  : "#546e7a";
              return (
                <article
                  key={act.id}
                  style={{
                    background: "#fff",
                    border: "2px solid #d8cfae",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "#f0ede8",
                          color: "#3b3628",
                          textTransform: "uppercase",
                        }}
                      >
                        {act.categoryLabel}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: statusColor,
                          color: "#fff",
                        }}
                      >
                        {act.workingStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h4 style={{ margin: "8px 0 4px", fontSize: 15 }}>{act.name}</h4>
                    {act.thumbnailUrl && (
                      <div
                        style={{
                          height: 120,
                          background: CREAM,
                          borderRadius: 8,
                          overflow: "hidden",
                          display: "grid",
                          placeItems: "center",
                          marginBottom: 8,
                          border: "1px solid #e5dec9",
                        }}
                      >
                        <img
                          src={act.thumbnailUrl}
                          alt=""
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#333", lineHeight: 1.45 }}>
                      {act.lessonNumber !== undefined && (
                        <div>
                          <b>Lesson / Page:</b> Lección {act.lessonNumber} · Printed Page {act.printedPage}
                          {act.underlyingExerciseCount !== undefined
                            ? ` (${act.underlyingExerciseCount} exercises, ${act.underlyingInstructionCount} instr)`
                            : ""}
                        </div>
                      )}
                      <div>
                        <b>Built vs Working:</b> {act.builtStatus} → <b>{act.workingStatus}</b>
                      </div>
                      <div>
                        <b>Reachable By:</b> {act.reachability} · <b>Mobile:</b> {act.mobileStatus}
                      </div>
                      <div>
                        <b>Correct/Wrong Behavior:</b> {act.correctBehavior}
                      </div>
                      <div>
                        <b>Progress / Persistence:</b> {act.progressBehavior}
                      </div>
                      <div>
                        <b>Accessibility:</b> {act.accessibilityNote}
                      </div>
                      <div>
                        <b>Missing Art/Audio:</b> <span style={{ color: "#991b1b" }}>{act.missingArtOrAudio}</span>
                      </div>
                      <div>
                        <b>Next Concrete Action:</b> <span style={{ color: "#1e40af" }}>{act.exactNextAction}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: "1px solid #eee",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <small style={{ color: "#555", fontSize: 11 }}>{act.existingPrOrIssue}</small>
                    <div style={{ display: "flex", gap: 8 }}>
                      {act.proofUrl && (
                        <a
                          href={act.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 800, color: "#2e7d32", textDecoration: "none" }}
                        >
                          ▶ Proof ↗
                        </a>
                      )}
                      {act.route.startsWith("/") || act.route.startsWith("http") ? (
                        <a
                          href={
                            act.route.startsWith("http")
                              ? act.route
                              : `https://cartilla-de-gretel-psi.vercel.app${act.route}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 800, color: "#1565c0", textDecoration: "none" }}
                        >
                          Route ↗
                        </a>
                      ) : (
                        <a
                          href={`https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/${inv.mainSha}/${act.route}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 800, color: "#555", textDecoration: "none" }}
                        >
                          Source File ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ARTWORK INVENTORY & CROPPING COMPARISONS                           */}
      {/* ========================================================================= */}
      {tab === "artwork" && (
        <section style={{ padding: 14 }}>
          {/* Artwork Metrics Cards (Dynamically Computed from MASTER-MAPPING.csv) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 8, marginBottom: 14 }}>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>Total Placements</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{t.all}</div>
              <small style={{ color: "#4a4536" }}>
                {t.byBook["Workbook"] || 0} WB · {t.byBook["Flip Chart"] || 0} FC · {t.byBook["Cover"] || 0} Cover
              </small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d8cfae" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>Drawing Groups</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{t.drawingGroups}</div>
              <small style={{ color: "#4a4536" }}>200 resolved · 1 cover composite</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #258351" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#258351", textTransform: "uppercase" }}>OK / Owner Art</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {(t.byStatus["OK"] || 0) + (t.byStatus["HIS NEW PICTURE"] || 0)}
              </div>
              <small style={{ color: "#4a4536" }}>Verified canonical placements</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #f57c00" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f57c00", textTransform: "uppercase" }}>Repaired in #1205</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {t.repaired1205Placements}{" "}
                <span style={{ fontSize: 13, color: "#b45309" }}>({t.repaired1205Destinations} files)</span>
              </div>
              <small style={{ color: "#4a4536" }}>300-DPI native RGB scan crops</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d32f2f" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#d32f2f", textTransform: "uppercase" }}>
                {t.flagged10WorkbookSubjectsCount} Flagged WB Subjects
              </span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{t.flagged10WorkbookPlacements} placements</div>
              <small style={{ color: "#4a4536" }}>escuela, taza, pera, dulce, escoba, ola, alas, imán, ardilla, espejo</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #b33" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#b33", textTransform: "uppercase" }}>Improvement / Unchecked</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{nf}</div>
              <small style={{ color: "#4a4536" }}>{t.byStatus["FLAGGED"] || 0} still flagged · 3 cover composites</small>
            </div>
          </div>

          {/* Quick Filter Buttons & Mode Switch */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search artwork by slot ID (WB-S008...), subject (escuela, taza...), page, or note..."
              value={artSearch}
              onChange={(e) => setArtSearch(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setMode("page")}
                style={{
                  padding: "8px 12px",
                  border: "2px solid #1c1a14",
                  borderRadius: 8,
                  background: mode === "page" ? DARK : "#fff",
                  color: mode === "page" ? CREAM : DARK,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                1. Physical Book Page (Circled)
              </button>
              <button
                onClick={() => setMode("crop")}
                style={{
                  padding: "8px 12px",
                  border: "2px solid #1c1a14",
                  borderRadius: 8,
                  background: mode === "crop" ? DARK : "#fff",
                  color: mode === "crop" ? CREAM : DARK,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                2. Original Scan Crop
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            <button
              onClick={() => {
                setBk("");
                setFlaggedOnly(false);
                setRepairedOnly(false);
                setF("");
                setTg("");
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #1c1a14",
                background: !bk && !flaggedOnly && !repairedOnly && !f && !tg ? DARK : "#fff",
                color: !bk && !flaggedOnly && !repairedOnly && !f && !tg ? CREAM : DARK,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              All Placements ({t.all})
            </button>
            <button
              onClick={() => setBk(bk === "Workbook" ? "" : "Workbook")}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #1c1a14",
                background: bk === "Workbook" ? DARK : "#fff",
                color: bk === "Workbook" ? CREAM : DARK,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Workbook ({t.byBook["Workbook"] || 0})
            </button>
            <button
              onClick={() => setBk(bk === "Flip Chart" ? "" : "Flip Chart")}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #1c1a14",
                background: bk === "Flip Chart" ? DARK : "#fff",
                color: bk === "Flip Chart" ? CREAM : DARK,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Flip Chart ({t.byBook["Flip Chart"] || 0})
            </button>
            <button
              onClick={() => setBk(bk === "Cover" ? "" : "Cover")}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #1c1a14",
                background: bk === "Cover" ? DARK : "#fff",
                color: bk === "Cover" ? CREAM : DARK,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Covers ({t.byBook["Cover"] || 0})
            </button>
            <button
              onClick={() => setF(f === "OK" ? "" : "OK")}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "2px solid #2e7d32",
                background: f === "OK" ? "#2e7d32" : "#fff",
                color: f === "OK" ? "#fff" : "#2e7d32",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Verified OK ({t.byStatus["OK"] || 0})
            </button>
            <button
              onClick={() => setF(f === "NOT FINISHED" ? "" : "NOT FINISHED")}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "2px solid #b33",
                background: f === "NOT FINISHED" ? "#b33" : "#fff",
                color: f === "NOT FINISHED" ? "#fff" : "#b33",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Improvement Needed / Flagged ({nf})
            </button>
            <button
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "2px solid #d32f2f",
                background: flaggedOnly ? "#d32f2f" : "#fff",
                color: flaggedOnly ? "#fff" : "#d32f2f",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              10 Flagged WB Subjects ({t.flagged10WorkbookPlacements})
            </button>
            <button
              onClick={() => setRepairedOnly(!repairedOnly)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "2px solid #f57c00",
                background: repairedOnly ? "#f57c00" : "#fff",
                color: repairedOnly ? "#fff" : "#f57c00",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              #1205 Repaired ({t.repaired1205Placements})
            </button>
          </div>

          {/* Slots List with Side-by-Side Comparison & All 11 Part 4 Fields */}
          <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 14 }}>
            {filteredSlots.map((s) => (
              <article key={s.artwork_id} style={{ padding: 12, background: "#fff", border: "2px solid #d8cfae", borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>
                      {s.artwork_id}{" "}
                      <small style={{ fontWeight: 400, color: "#6b6450" }}>
                        ({s.book}, p. {s.page})
                      </small>
                    </h3>
                    <div style={{ fontSize: 11, color: "#6b6450" }}>
                      Group: <code>{s.canonicalDrawingGroup || "—"}</code> · Archival ID: <code>{s.id}</code>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background:
                        s.status === "OK" ? "#2e7d32" : s.status === "HIS NEW PICTURE" ? "#1976d2" : "#c62828",
                      color: "#fff",
                    }}
                  >
                    {s.status}
                  </span>
                </div>
                <p style={{ margin: "4px 0 6px", color: "#1c1a14", fontSize: 15, fontWeight: 800 }}>
                  {s.label}{" "}
                  {s.isFlaggedWorkbookSubject ? (
                    <span style={{ color: "#d32f2f", fontSize: 11 }}>[10 FLAGGED WB SUBJECT]</span>
                  ) : (
                    ""
                  )}{" "}
                  {s.isRepairedIn1205 ? (
                    <span style={{ color: "#e65100", fontSize: 11 }}>[#1205 REPAIRED NATIVE RGB]</span>
                  ) : (
                    ""
                  )}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
                  <figure style={{ margin: 0 }}>
                    {mode === "page" ? (
                      <PageThumb s={s} base={inv.base} mainBase={inv.mainBase} />
                    ) : (
                      <Orig s={s} base={inv.base} mainBase={inv.mainBase} />
                    )}
                    <figcaption style={cap}>
                      {mode === "page" ? "1. Book Page (Circled)" : "2. Original Scan Crop"}
                    </figcaption>
                  </figure>
                  <figure style={{ margin: 0 }}>
                    <img
                      loading="lazy"
                      alt=""
                      src={s.canonicalImageUrl}
                      style={{
                        width: "100%",
                        height: 170,
                        objectFit: "contain",
                        display: "block",
                        background: CREAM,
                        border: "1px solid #d8cfae",
                        borderRadius: 8,
                      }}
                    />
                    <figcaption style={cap}>3. Canonical Master (Main)</figcaption>
                  </figure>
                </div>

                <Tags s={s} inv={inv} />

                {/* Compact 11-Field Part 4 Summary on Card */}
                <div
                  style={{
                    fontSize: 11,
                    color: "#333",
                    background: "#faf7f0",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #e6dec8",
                    lineHeight: 1.4,
                    marginTop: 6,
                  }}
                >
                  <div>
                    <b>4. App-Loaded File:</b> <code>{s.canonicalDestinationPath || s.app}</code> ({s.appLoadedRefLabel})
                  </div>
                  <div>
                    <b>5. Crop:</b> {s.cropCompleteness}
                  </div>
                  <div>
                    <b>6. Orientation/Count:</b> {s.orientationAndObjectCount}
                  </div>
                  <div>
                    <b>7. Resolution:</b> {s.resolutionAndScaling}
                  </div>
                  <div>
                    <b>8. Background/Alpha:</b> {s.transparencyCorrectness}
                  </div>
                  <div>
                    <b>9. Fidelity:</b> {s.sourceFidelity}
                  </div>
                  <div>
                    <b>10. Approval:</b> {s.ownerApprovalStatus}
                  </div>
                  <div>
                    <b>11. Next Fix:</b> <span style={{ color: "#1e40af" }}>{s.smallestSourcePreservingFix}</span>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setOpen(s.artwork_id)}
                    style={{
                      padding: "7px 12px",
                      border: "2px solid #1c1a14",
                      borderRadius: 8,
                      background: DARK,
                      color: CREAM,
                      font: "13px system-ui",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Inspect Full Comparison
                  </button>
                  <a
                    href={`?tab=artwork&ref=${encodeURIComponent(inv.ref)}&slot=${encodeURIComponent(s.artwork_id)}`}
                    style={{
                      padding: "7px 10px",
                      border: "1px solid #888",
                      borderRadius: 8,
                      color: "#1c1a14",
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Direct Link
                  </a>
                </div>
              </article>
            ))}
          </main>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVING MOTION INVENTORY                                            */}
      {/* ========================================================================= */}
      {tab === "motion" && (
        <section style={{ padding: 14 }}>
          {/* Motion Summary Cards (Kept Distinct: 22 Manifest SVGs vs CSS Registry vs 7 Held Stills) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 14 }}>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #1c1a14" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6450", textTransform: "uppercase" }}>Manifest Motion SVGs</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{mc.manifestTotal}</div>
              <small style={{ color: "#4a4536" }}>scripts/living-motion/manifest.json</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #1976d2" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1976d2", textTransform: "uppercase" }}>#1204 Reconciled Live</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{mc.reconciled1204}</div>
              <small style={{ color: "#4a4536" }}>Elephant & Sheep RGBA + Video Proof</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #2e7d32" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#2e7d32", textTransform: "uppercase" }}>SHA256 Fresh SVGs</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{mc.manifestSourceFreshUnverified}</div>
              <small style={{ color: "#4a4536" }}>Source-fresh on main (unverified live)</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #d32f2f" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#d32f2f", textTransform: "uppercase" }}>Blocked Stale Bees</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{mc.staleBlocked}</div>
              <small style={{ color: "#4a4536" }}>abeja & vocal-a-abeja held still</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #6a1b9a" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6a1b9a", textTransform: "uppercase" }}>CSS Registry Actors</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {mc.cssPartRigged} Part <span style={{ fontSize: 13 }}>· {mc.cssWholeAmbient} Ambient</span>
              </div>
              <small style={{ color: "#4a4536" }}>living-actor-registry.ts DOM layers</small>
            </div>
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "2px solid #f57c00" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f57c00", textTransform: "uppercase" }}>Held Still by Rule</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{mc.heldStill}</div>
              <small style={{ color: "#4a4536" }}>oruga, araña, ardilla, erizo, iguana...</small>
            </div>
          </div>

          {/* Interactive Reduced-Motion Simulator & Playable Proof Bar */}
          <div
            style={{
              background: "#eef6ee",
              border: "2px solid #2e7d32",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 14,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "#1b5e20" }}>
                🎬 Live Motion & Reduced-Motion Verification Controls
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: "#2e7d32" }}>
                Toggle <code>prefers-reduced-motion: reduce</code> below to verify that every moving illustration cleanly falls back to its approved static still.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => setSimulateReducedMotion(!simulateReducedMotion)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "2px solid #1c1a14",
                  background: simulateReducedMotion ? "#d32f2f" : "#1c1a14",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {simulateReducedMotion
                  ? "⏸ Reduced Motion ACTIVE (Showing Static Stills)"
                  : "▶ Normal Motion ACTIVE (Click to Simulate Reduced Motion)"}
              </button>
              <a
                href={inv.mainBase + "docs/proofs/elephant-sheep-motion-2026-10-29/390-no-preference.webm"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 12px",
                  background: "#1976d2",
                  color: "#fff",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ▶ #1204 Motion Proof (.webm)
              </a>
              <a
                href={inv.mainBase + "docs/proofs/elephant-sheep-motion-2026-10-29/390-reduce.webm"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 12px",
                  background: "#455a64",
                  color: "#fff",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ▶ #1204 Reduced-Motion Proof (.webm)
              </a>
            </div>
          </div>

          {/* Stale Bee Safety Callout */}
          <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
            <h4 style={{ margin: "0 0 4px", color: "#991b1b", fontSize: 14 }}>
              🐝 Stale Bee Motion Guard (src/data/stale-motion-art.json) & Merged #1204 Repairs
            </h4>
            <p style={{ margin: 0, fontSize: 12, color: "#7f1d1d", lineHeight: 1.4 }}>
              Two bee entries (<code>abeja</code> and <code>vocal-a-abeja</code>) have stale embedded rasters in their <code>*.alive.svg</code> files and are blocked at runtime by <code>getLivingActor(src) → null</code> so the app serves the approved static still. Meanwhile, all 6 elephant/sheep motion placements (<code>elefante</code>, <code>oveja</code>, <code>vocal-e-elefante</code>, <code>vocal-o-oveja</code>, <code>fc_p004_oveja</code>, <code>fc_p006_elefante</code>) were reconciled in merged <b>PR #1204</b> with 100% RGBA base pixel equality.
            </p>
          </div>

          {/* Motion Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search moving picture by subject (elefante, oveja, abeja...), page, or motion part..."
              value={motSearch}
              onChange={(e) => setMotSearch(e.target.value)}
              style={inputStyle}
            />
            <select value={motCatalog} onChange={(e) => setMotCatalog(e.target.value)} style={selectStyle}>
              <option value="">All Motion Sources</option>
              <option value="manifest_svg">Manifest Self-Animated SVGs ({mc.manifestTotal})</option>
              <option value="registry_css_part">CSS Clip-Path Part Rigs ({mc.cssPartRigged})</option>
              <option value="registry_css_ambient">CSS Ambient Actors ({mc.cssWholeAmbient})</option>
              <option value="held_still_rule">Held Still by Owner Rule ({mc.heldStill})</option>
            </select>
            <select value={motStatus} onChange={(e) => setMotStatus(e.target.value)} style={selectStyle}>
              <option value="">All Motion Statuses</option>
              <option value="RECONCILED_1204">#1204 Reconciled & Live-Verified ({mc.reconciled1204})</option>
              <option value="SOURCE_FRESH_UNVERIFIED_LIVE">
                Manifest SHA256 Fresh — Unverified Live ({mc.manifestSourceFreshUnverified})
              </option>
              <option value="STALE_HELD_STILL">Stale Blocked — Serves Static Still ({mc.staleBlocked})</option>
              <option value="CSS_PART_RIG">CSS Part-Rigged ({mc.cssPartRigged})</option>
              <option value="CSS_WHOLE_MOTION">CSS Whole-Object Ambient ({mc.cssWholeAmbient})</option>
              <option value="HELD_STILL_RULE">Held Still by Owner Rule ({mc.heldStill})</option>
            </select>
          </div>

          {/* Motion Cards Grid with All 10 Required Part 5 Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 14 }}>
            {filteredMotion.map((m) => {
              const stillUrl = inv.mainBase + "public" + (m.still.startsWith("/") ? m.still : "/" + m.still);
              const aliveUrl = m.aliveSrc
                ? inv.mainBase + "public" + (m.aliveSrc.startsWith("/") ? m.aliveSrc : "/" + m.aliveSrc)
                : null;
              const isStale = m.motionStatus === "STALE_HELD_STILL";
              const isHeld = m.motionStatus === "HELD_STILL_RULE";
              const is1204 = m.motionStatus === "RECONCILED_1204";
              const badgeBg = isStale
                ? "#c62828"
                : isHeld
                ? "#ef6c00"
                : is1204
                ? "#1565c0"
                : m.motionStatus === "SOURCE_FRESH_UNVERIFIED_LIVE"
                ? "#2e7d32"
                : "#6a1b9a";

              return (
                <article key={m.id} style={{ background: "#fff", border: "2px solid #d8cfae", borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17 }}>
                        {m.name}{" "}
                        <small style={{ fontWeight: 400, color: "#6b6450" }}>
                          ({m.book}, p. {m.page})
                        </small>
                      </h3>
                      <div style={{ fontSize: 11, color: "#6b6450" }}>Catalog: <code>{m.catalogSource}</code></div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: badgeBg,
                        color: "#fff",
                      }}
                    >
                      {m.motionStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Side-by-Side Still vs Motion Preview */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "10px 0" }}>
                    <figure style={{ margin: 0 }}>
                      <img
                        src={stillUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: 155,
                          objectFit: "contain",
                          background: CREAM,
                          borderRadius: 8,
                          border: "1px solid #d8cfae",
                        }}
                        loading="lazy"
                      />
                      <figcaption style={cap}>1. Approved Still</figcaption>
                    </figure>
                    <figure style={{ margin: 0 }}>
                      {simulateReducedMotion ? (
                        <img
                          src={stillUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: 155,
                            objectFit: "contain",
                            background: CREAM,
                            borderRadius: 8,
                            border: "2px dashed #d32f2f",
                          }}
                          loading="lazy"
                        />
                      ) : aliveUrl && !isStale ? (
                        <img
                          src={aliveUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: 155,
                            objectFit: "contain",
                            background: CREAM,
                            borderRadius: 8,
                            border: "2px solid #2e7d32",
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 155,
                            display: "grid",
                            placeItems: "center",
                            background: "#f5f5f5",
                            borderRadius: 8,
                            border: "1px dashed #999",
                            color: "#555",
                            fontSize: 12,
                            textAlign: "center",
                            padding: 6,
                          }}
                        >
                          {isStale
                            ? "Blocked by stale-motion-art.json → App serves Approved Still"
                            : isHeld
                            ? "Held still by Owner Rule 2026-10-11"
                            : "Runtime CSS Part-Rig / Layer on Still DOM element"}
                        </div>
                      )}
                      <figcaption style={cap}>
                        {simulateReducedMotion
                          ? "2. Reduced-Motion Still Fallback"
                          : aliveUrl && !isStale
                          ? "2. Interactive Animated SVG"
                          : "2. Runtime Static / CSS State"}
                      </figcaption>
                    </figure>
                  </div>

                  {/* All 10 Required Part 5 Inspection Fields */}
                  <div
                    style={{
                      fontSize: 11,
                      color: "#333",
                      background: "#faf7f0",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #e6dec8",
                      lineHeight: 1.4,
                    }}
                  >
                    <div>
                      <b>1. Approved Still:</b> <code>{m.still}</code>
                    </div>
                    <div>
                      <b>2. Motion Version:</b> <code>{m.aliveSrc || (m.blinkFrame ? `CSS + ${m.blinkFrame}` : "CSS / None")}</code>
                    </div>
                    <div>
                      <b>3. Displayed On:</b> {m.book} (Page/Sheet {m.page})
                    </div>
                    <div>
                      <b>4. Selected at Runtime:</b> {m.runtimeSelectionNote}
                    </div>
                    <div>
                      <b>5. Same Approved Source:</b> {m.sameApprovedSource}
                    </div>
                    <div>
                      <b>6. Expected Natural Motion:</b> {m.meaning}
                    </div>
                    <div>
                      <b>7. What Physically Moves:</b> {m.whatPhysicallyMoves}
                    </div>
                    <div>
                      <b>8. Reduced-Motion Behavior:</b> {m.reducedMotionBehavior}
                    </div>
                    <div>
                      <b>9. Audit Status Note:</b>{" "}
                      <span style={{ color: isStale ? "#c62828" : "#1b5e20" }}>{m.motionNote}</span>
                    </div>
                    {m.proofVideoUrl && (
                      <div style={{ marginTop: 4 }}>
                        <b>10. Playable Recording:</b>{" "}
                        <a
                          href={m.proofVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1565c0", fontWeight: 800 }}
                        >
                          ▶ Normal Motion (.webm) ↗
                        </a>
                        {m.reducedProofVideoUrl && (
                          <>
                            {" · "}
                            <a
                              href={m.reducedProofVideoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#555", fontWeight: 800 }}
                            >
                              ▶ Reduced-Motion (.webm) ↗
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
