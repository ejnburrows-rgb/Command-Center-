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
export default function InventoryView({ inv }: { inv: Inventory }) {
  const [f, setF] = useState("");
  const shown = inv.slots.filter((s) => !f || s.status === f);
  const t = inv.totals;
  return (
    <div style={{ background: CREAM, color: "#1c1a14", font: "18px/1.35 system-ui,sans-serif", minHeight: "100vh" }}>
      <header style={{ padding: 16, background: "#1c1a14", color: CREAM }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26 }}>Cartilla art inventory</h1>
        <div>LIVE from the repo. Commit <code>{inv.sha.slice(0, 10)}</code> on <code>{inv.ref}</code>, committed {inv.committedAt.replace("T", " ").slice(0, 16)} UTC. Read {inv.fetchedAt.replace("T", " ").slice(0, 16)} UTC.</div>
      </header>
      <section style={{ padding: "14px 16px", background: "#fff8dc", borderBottom: "2px solid #1c1a14" }}>
        <span style={{ fontSize: 34, fontWeight: 800 }}>{t.all}</span> slots | Flip Chart {t.byBook["Flip Chart"]} | Workbook {t.byBook["Workbook"]}<br />
        OK {t.byStatus["OK"] || 0} | His new pictures {t.byStatus["HIS NEW PICTURE"] || 0} | Cleaned {t.byStatus["CLEANED (was flagged)"] || 0} | Flagged {t.byStatus["FLAGGED"] || 0}
        <p style={{ fontSize: 15, color: "#4a4536" }}>Counted by the page code from the slot list in the repo at the commit above, one row per slot. It reloads from the repo on every visit, so it cannot drift. Showing: {shown.length}.</p>
      </section>
      <div style={{ padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[["", "All", t.all], ...Object.entries(t.byStatus).map(([k, v]) => [k, k, v])].map(([k, l, n]) => (
          <button key={String(k)} onClick={() => setF(String(k))} style={{ font: "16px system-ui", padding: "10px 12px", border: "2px solid #1c1a14", borderRadius: 10, background: f === k ? "#1c1a14" : "#fff", color: f === k ? CREAM : "#1c1a14" }}>{l} <b>{n}</b></button>
        ))}
      </div>
      <main>
        {shown.map((s) => (
          <article key={s.id} style={{ margin: 12, padding: 12, background: "#fff", border: "2px solid #d8cfae", borderRadius: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>{s.id} <small style={{ fontWeight: 400, color: "#6b6450" }}>{s.book}, page {s.page}</small></h3>
            <p style={{ margin: "2px 0", color: "#4a4536", fontSize: 15 }}>{s.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
              <figure style={{ margin: 0 }}><Orig s={s} base={inv.base} /><figcaption style={cap}>ORIGINAL BOOK</figcaption></figure>
              <figure style={{ margin: 0 }}><img loading="lazy" alt="" src={inv.base + s.live} style={img} /><figcaption style={cap}>APP NOW</figcaption></figure>
            </div>
            <p style={{ margin: "4px 0", fontWeight: 700 }}>{s.status}</p>
            {s.note && <p style={{ margin: 0, fontSize: 15 }}>{s.note}</p>}
          </article>
        ))}
      </main>
    </div>
  );
}
