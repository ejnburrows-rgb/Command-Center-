"use client";
import { useState } from "react";
import type { Inventory, Slot } from "../../lib/art-inventory";
const CREAM = "#fbf6e8";
function Orig({ s, base }: { s: Slot; base: string }) {
  const o = s.orig;
  if (!o) return <div style={none}>no image</div>;
  if (o.kind === "image") return <img loading="lazy" src={base + o.src} alt="" style={img} />;
  const [, , cw, ch] = o.box; const [cx, cy] = o.box;
  return (
    <div style={{ height: 170, display: "flex", justifyContent: "center", background: CREAM, border: "1px solid #d8cfae", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ position: "relative", overflow: "hidden", alignSelf: "center", width: `min(100%, ${(170 * cw) / ch}px)`, aspectRatio: `${cw}/${ch}` }}>
        <img loading="lazy" alt="" src={base + o.src} style={{ position: "absolute", width: `${(o.sw / cw) * 100}%`, left: `${(-cx / cw) * 100}%`, top: `${(-cy / ch) * 100}%`, maxWidth: "none" }} />
      </div>
    </div>
  );
}
const img: React.CSSProperties = { width: "100%", height: 170, objectFit: "contain", background: CREAM, border: "1px solid #d8cfae", borderRadius: 8, display: "block" };
const none: React.CSSProperties = { height: 170, display: "grid", placeItems: "center", border: "2px dashed #b33", color: "#b33", borderRadius: 8 };
const cap: React.CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: ".05em", marginTop: 4, textAlign: "center" };
function PageThumb({ s, base }: { s: Slot; base: string }) {
  const [pw, ph] = s.book_page.size; const c = s.book_page.circle;
  if (!s.book_page.src) return <div style={none}>no page</div>;
  const pad = Math.min(pw, ph) / 60;
  return (
    <div style={{ position: "relative", width: `min(100%, ${(340 * pw) / ph}px)`, margin: "0 auto", aspectRatio: `${pw}/${ph}`, border: "1px solid #d8cfae", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
      <img loading="lazy" alt="" src={base + s.book_page.src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {c && <div style={{ position: "absolute", left: `${((c.box[0] - pad) / pw) * 100}%`, top: `${((c.box[1] - pad) / ph) * 100}%`, width: `${((c.box[2] + 2 * pad) / pw) * 100}%`, height: `${((c.box[3] + 2 * pad) / ph) * 100}%`, border: "3px solid #dc143c", borderRadius: "50%", boxSizing: "border-box" }} />}
    </div>
  );
}
function Tags({ s, inv }: { s: Slot; inv: Inventory }) {
  if (!s.tags.length) return <p style={{ margin: "2px 0", color: "#2d6a2d", fontWeight: 700 }}>No problems found by the script</p>;
  return <div style={{ margin: "4px 0" }}>{s.tags.map((t) => <span key={t} title={inv.tagMeaning[t]} style={{ display: "inline-block", margin: "0 6px 6px 0", padding: "4px 8px", background: "#ffe3e0", border: "2px solid #b33", borderRadius: 8, fontSize: 14, fontWeight: 700 }}>{t.replace(/_/g, " ")}</span>)}<div style={{ fontSize: 14, color: "#7a2020" }}>{s.tags.map((t) => inv.tagMeaning[t]).filter(Boolean).join(" | ")}</div></div>;
}
function Viewer({ s, inv, onClose }: { s: Slot; inv: Inventory; onClose: () => void }) {
  const pageUrl = inv.base + s.book_page.src, liveUrl = inv.base + s.app;
  const [pw, ph] = s.book_page.size; const c = s.book_page.circle;
  const pad = Math.min(pw, ph) / 60;
  const link: React.CSSProperties = { display: "inline-block", margin: "6px 8px 0 0", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, color: "#1c1a14", background: "#fff", font: "16px system-ui", textDecoration: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: CREAM, overflowY: "auto", padding: 12 }}>
      <button onClick={onClose} style={{ ...link, position: "sticky", top: 0, background: "#1c1a14", color: CREAM }}>Close</button>
      <h2 style={{ margin: "8px 0 0", fontSize: 22 }}>{s.id} <small style={{ fontWeight: 400 }}>{s.label}</small></h2>
      <p style={{ margin: "2px 0 8px", fontWeight: 700 }}>{s.status}{s.note ? ": " + s.note : ""}</p>
      <Tags s={s} inv={inv} />
      <p style={{ fontSize: 13, wordBreak: "break-all" }}>File: {s.app}</p>
      <h3 style={{ margin: "10px 0 4px" }}>1. REAL BOOK PAGE{c ? " (this picture circled)" : " (circle not available for this slot)"}</h3>
      {!s.book_page.src ? <p>Book page not available at this commit.</p> : <div style={{ position: "relative", width: `min(100%, ${(640 * pw) / ph}px)`, margin: "0 auto", aspectRatio: `${pw}/${ph}`, border: "1px solid #d8cfae", background: "#fff" }}>
        <img src={pageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {c && <div style={{ position: "absolute", left: `${((c.box[0] - pad) / pw) * 100}%`, top: `${((c.box[1] - pad) / ph) * 100}%`, width: `${((c.box[2] + 2 * pad) / pw) * 100}%`, height: `${((c.box[3] + 2 * pad) / ph) * 100}%`, border: "4px solid #dc143c", borderRadius: "50%", boxSizing: "border-box" }} />}
      </div>}
      {s.book_page.src && <a style={link} href={pageUrl} target="_blank" rel="noreferrer">Open book page image</a>}
      <h3 style={{ margin: "14px 0 4px" }}>2. APP NOW (the exact file the app loads)</h3>
      <div style={{ maxWidth: 700, margin: "0 auto" }}><img src={liveUrl} alt="" style={{ width: "100%", height: "auto", display: "block", background: CREAM, border: "1px solid #d8cfae" }} /></div>
      <a style={link} href={liveUrl} target="_blank" rel="noreferrer">Open current repo image</a>
      <p style={{ fontSize: 14, color: "#4a4536" }}>Read live from commit {inv.sha.slice(0, 10)} on {inv.ref}. The book page is the real scan the picture comes from.</p>
    </div>
  );
}
export default function InventoryView({ inv, openSlot, initBook, initFilter }: { inv: Inventory; openSlot?: string; initBook?: string; initFilter?: string }) {
  const [f, setF] = useState(initFilter === "nf" ? "NOT FINISHED" : "");
  const [bk, setBk] = useState(initBook === "workbook" ? "Workbook" : initBook === "flipchart" ? "Flip Chart" : "");
  const [tg, setTg] = useState("");
  const [mode, setMode] = useState<"crop" | "page">("page");
  const [open, setOpen] = useState<string | null>(openSlot && inv.slots.some((x) => x.id === openSlot) ? openSlot : null);
  const cur = open ? inv.slots.find((x) => x.id === open) : null;
  const shown = inv.slots.filter((s) => (!bk || s.book === bk) && (f === "NOT FINISHED" ? s.notFinished : !f || s.status === f) && (!tg || s.tags.includes(tg)));
  const nf = inv.slots.filter((s) => s.notFinished).length;
  const t = inv.totals;
  return (
    <div style={{ background: CREAM, color: "#1c1a14", font: "18px/1.35 system-ui,sans-serif", minHeight: "100vh" }}>
      {cur && <Viewer s={cur} inv={inv} onClose={() => setOpen(null)} />}
      <header style={{ padding: 16, background: "#1c1a14", color: CREAM }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26 }}>Cartilla art inventory</h1>
        <div>LIVE from the repo. Pictures: latest draft commit <code>{inv.imgSha.slice(0, 10)}</code>. Data commit <code>{inv.sha.slice(0, 10)}</code>, committed {inv.committedAt.replace("T", " ").slice(0, 16)} UTC. Read {inv.fetchedAt.replace("T", " ").slice(0, 16)} UTC.</div>
      </header>
      <section style={{ padding: "14px 16px", background: "#fff8dc", borderBottom: "2px solid #1c1a14" }}>
        <span style={{ fontSize: 34, fontWeight: 800 }}>{t.all}</span> slots | Flip Chart {t.byBook["Flip Chart"]} | Workbook {t.byBook["Workbook"]}<br />
        OK {t.byStatus["OK"] || 0} | His new pictures {t.byStatus["HIS NEW PICTURE"] || 0} | Cleaned {t.byStatus["CLEANED (was flagged)"] || 0} | Flagged {t.byStatus["FLAGGED"] || 0}
        <p style={{ fontSize: 15, color: "#4a4536" }}>Counted by the page code from the slot list in the repo at the commit above, one row per slot. It reloads from the repo on every visit, so it cannot drift. Showing: {shown.length}.</p>
      </section>
      <div style={{ padding: "10px 12px 0", display: "flex", gap: 8 }}>
        {([["page", "Real book page vs repo"], ["crop", "Close-up crop vs repo"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{ font: "16px system-ui", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, background: mode === k ? "#1c1a14" : "#fff", color: mode === k ? CREAM : "#1c1a14" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[["", "All", t.all], ["NOT FINISHED", "NOT FINISHED", nf], ...Object.entries(t.byStatus).map(([k, v]) => [k, k, v])].map(([k, l, n]) => (
          <button key={String(k)} onClick={() => setF(String(k))} style={{ font: "16px system-ui", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, background: f === k ? "#1c1a14" : "#fff", color: f === k ? CREAM : "#1c1a14" }}>{l} <b>{n}</b></button>
        ))}
      </div>
      <div style={{ padding: "0 12px 4px", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[["", "Both books"], ["Workbook", "Workbook"], ["Flip Chart", "Flip chart"]].map(([k, l]) => (
          <button key={k} onClick={() => setBk(k)} style={{ font: "16px system-ui", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, background: bk === k ? "#1c1a14" : "#fff", color: bk === k ? CREAM : "#1c1a14" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "6px 12px 10px" }}>
        <b>Problem marks (script-detected, tap to filter):</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {Object.entries(inv.tagCounts).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
            <button key={k} title={inv.tagMeaning[k]} onClick={() => setTg(tg === k ? "" : k)} style={{ font: "14px system-ui", padding: "6px 8px", border: "2px solid #b33", borderRadius: 8, background: tg === k ? "#b33" : "#ffe3e0", color: tg === k ? "#fff" : "#7a2020" }}>{k.replace(/_/g, " ")} <b>{n}</b></button>
          ))}
        </div>
        <p style={{ fontSize: 14, color: "#4a4536", margin: "6px 0 0" }}>Marks were computed by script on commit <code>{inv.auditedSha.slice(0, 10)}</code>. {inv.auditedSha && inv.auditedSha !== inv.imgSha ? <b style={{ color: "#b33" }}>The picture branch has moved on to {inv.imgSha.slice(0, 10)}; marks for newer files are NOT VERIFIED until re-run.</b> : "Pictures shown are from the same commit."}</p>
      </div>
      <main>
        {shown.map((s) => (
          <article key={s.id} style={{ margin: 12, padding: 12, background: "#fff", border: "2px solid #d8cfae", borderRadius: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>{s.id} <small style={{ fontWeight: 400, color: "#6b6450" }}>{s.book}, book page {s.page}</small></h3>
            <p style={{ margin: "2px 0", color: "#4a4536", fontSize: 15 }}>{s.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
              <figure style={{ margin: 0 }}>{mode === "page" ? <PageThumb s={s} base={inv.base} /> : <Orig s={s} base={inv.base} />}<figcaption style={cap}>{mode === "page" ? `REAL BOOK PAGE (circled)` : "ORIGINAL BOOK"}</figcaption></figure>
              <figure style={{ margin: 0 }}><img loading="lazy" alt="" src={inv.base + s.app} style={{ width: "100%", height: "auto", display: "block", background: CREAM, border: "1px solid #d8cfae", borderRadius: 8 }} /><figcaption style={cap}>APP NOW</figcaption></figure>
            </div>
            <p style={{ margin: "4px 0", fontWeight: 700 }}>{s.status}</p>
            <Tags s={s} inv={inv} />
            {s.note && <p style={{ margin: 0, fontSize: 15 }}>{s.note}</p>}
            <div>
              <button onClick={() => setOpen(s.id)} style={{ margin: "8px 8px 0 0", padding: "10px 14px", border: "2px solid #1c1a14", borderRadius: 10, background: "#1c1a14", color: CREAM, font: "16px system-ui" }}>Book page vs repo</button>
              <a href={`?ref=${encodeURIComponent(inv.ref)}&slot=${encodeURIComponent(s.id)}`} style={{ display: "inline-block", margin: "8px 8px 0 0", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, color: "#1c1a14", font: "16px system-ui", textDecoration: "none" }}>Link to this slot</a>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
