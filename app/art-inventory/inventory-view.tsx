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
    <div style={{ position: "relative", width: "100%", aspectRatio: `${pw}/${ph}`, maxHeight: 340, border: "1px solid #d8cfae", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
      <img loading="lazy" alt="" src={base + s.book_page.src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {c && <div style={{ position: "absolute", left: `${((c.box[0] - pad) / pw) * 100}%`, top: `${((c.box[1] - pad) / ph) * 100}%`, width: `${((c.box[2] + 2 * pad) / pw) * 100}%`, height: `${((c.box[3] + 2 * pad) / ph) * 100}%`, border: "3px solid #dc143c", borderRadius: "50%", boxSizing: "border-box" }} />}
    </div>
  );
}
function Viewer({ s, inv, onClose }: { s: Slot; inv: Inventory; onClose: () => void }) {
  const pageUrl = inv.base + s.book_page.src, liveUrl = inv.base + s.live;
  const [pw, ph] = s.book_page.size; const c = s.book_page.circle;
  const pad = Math.min(pw, ph) / 60;
  const link: React.CSSProperties = { display: "inline-block", margin: "6px 8px 0 0", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, color: "#1c1a14", background: "#fff", font: "16px system-ui", textDecoration: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: CREAM, overflowY: "auto", padding: 12 }}>
      <button onClick={onClose} style={{ ...link, position: "sticky", top: 0, background: "#1c1a14", color: CREAM }}>Close</button>
      <h2 style={{ margin: "8px 0 0", fontSize: 22 }}>{s.id} <small style={{ fontWeight: 400 }}>{s.label}</small></h2>
      <p style={{ margin: "2px 0 8px", fontWeight: 700 }}>{s.status}{s.note ? ": " + s.note : ""}</p>
      <h3 style={{ margin: "10px 0 4px" }}>1. REAL BOOK PAGE{c ? " (this picture circled)" : " (circle not available for this slot)"}</h3>
      {!s.book_page.src ? <p>Book page not available at this commit.</p> : <div style={{ position: "relative", width: "100%", maxWidth: 700, aspectRatio: `${pw}/${ph}`, border: "1px solid #d8cfae", background: "#fff" }}>
        <img src={pageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {c && <div style={{ position: "absolute", left: `${((c.box[0] - pad) / pw) * 100}%`, top: `${((c.box[1] - pad) / ph) * 100}%`, width: `${((c.box[2] + 2 * pad) / pw) * 100}%`, height: `${((c.box[3] + 2 * pad) / ph) * 100}%`, border: "4px solid #dc143c", borderRadius: "50%", boxSizing: "border-box" }} />}
      </div>}
      {s.book_page.src && <a style={link} href={pageUrl} target="_blank" rel="noreferrer">Open book page image</a>}
      <h3 style={{ margin: "14px 0 4px" }}>2. CURRENT PICTURE IN THE REPO</h3>
      <div style={{ maxWidth: 700, background: "#fff", border: "1px solid #d8cfae", padding: 8 }}><img src={liveUrl} alt="" style={{ width: "100%", maxHeight: 520, objectFit: "contain", display: "block", background: CREAM }} /></div>
      <a style={link} href={liveUrl} target="_blank" rel="noreferrer">Open current repo image</a>
      <p style={{ fontSize: 14, color: "#4a4536" }}>Read live from commit {inv.sha.slice(0, 10)} on {inv.ref}. The book page is the real scan the picture comes from.</p>
    </div>
  );
}
export default function InventoryView({ inv, openSlot }: { inv: Inventory; openSlot?: string }) {
  const [f, setF] = useState("");
  const [mode, setMode] = useState<"crop" | "page">("page");
  const [open, setOpen] = useState<string | null>(openSlot && inv.slots.some((x) => x.id === openSlot) ? openSlot : null);
  const cur = open ? inv.slots.find((x) => x.id === open) : null;
  const shown = inv.slots.filter((s) => !f || s.status === f);
  const t = inv.totals;
  return (
    <div style={{ background: CREAM, color: "#1c1a14", font: "18px/1.35 system-ui,sans-serif", minHeight: "100vh" }}>
      {cur && <Viewer s={cur} inv={inv} onClose={() => setOpen(null)} />}
      <header style={{ padding: 16, background: "#1c1a14", color: CREAM }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26 }}>Cartilla art inventory</h1>
        <div>LIVE from the repo. Commit <code>{inv.sha.slice(0, 10)}</code> on <code>{inv.ref}</code>, committed {inv.committedAt.replace("T", " ").slice(0, 16)} UTC. Read {inv.fetchedAt.replace("T", " ").slice(0, 16)} UTC.</div>
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
        {[["", "All", t.all], ...Object.entries(t.byStatus).map(([k, v]) => [k, k, v])].map(([k, l, n]) => (
          <button key={String(k)} onClick={() => setF(String(k))} style={{ font: "16px system-ui", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, background: f === k ? "#1c1a14" : "#fff", color: f === k ? CREAM : "#1c1a14" }}>{l} <b>{n}</b></button>
        ))}
      </div>
      <main>
        {shown.map((s) => (
          <article key={s.id} style={{ margin: 12, padding: 12, background: "#fff", border: "2px solid #d8cfae", borderRadius: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>{s.id} <small style={{ fontWeight: 400, color: "#6b6450" }}>{s.book}, book page {s.page}</small></h3>
            <p style={{ margin: "2px 0", color: "#4a4536", fontSize: 15 }}>{s.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
              <figure style={{ margin: 0 }}>{mode === "page" ? <PageThumb s={s} base={inv.base} /> : <Orig s={s} base={inv.base} />}<figcaption style={cap}>{mode === "page" ? `REAL BOOK PAGE (circled)` : "ORIGINAL BOOK"}</figcaption></figure>
              <figure style={{ margin: 0 }}><img loading="lazy" alt="" src={inv.base + s.live} style={img} /><figcaption style={cap}>APP NOW</figcaption></figure>
            </div>
            <p style={{ margin: "4px 0", fontWeight: 700 }}>{s.status}</p>
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
