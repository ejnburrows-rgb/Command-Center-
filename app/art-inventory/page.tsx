import { loadInventory } from "../../lib/art-inventory";
import InventoryView from "./inventory-view";
import ArtInventoryShell from "./art-inventory-shell";
export const dynamic = "force-dynamic";
export const metadata = { title: "Cartilla Visual Studio — Lessons, Artwork, Motion, Audio & Games" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
    slot?: string;
    book?: string;
    f?: string;
    tab?: "lessons" | "activities" | "artwork" | "motion" | "audio" | "games";
  }>;
}) {
  const { ref, slot, book, f, tab } = await searchParams;
  try {
    const inv = await loadInventory(ref);
    return (
      <ArtInventoryShell>
        <InventoryView
          inv={inv}
          openSlot={slot}
          initBook={book}
          initFilter={f}
          initTab={(tab === "lessons" || tab === "activities") ? "lessons" : (tab || "lessons")}
        />
      </ArtInventoryShell>
    );
  } catch (e) {
    return (
      <main style={{ padding: 20, font: "18px system-ui", background: "#fbf6e8", minHeight: "100vh" }}>
        <h1 style={{ color: "#b33" }}>Art & Activity Inventory could not load</h1>
        <p>{String((e as Error).message)}</p>
        <p style={{ color: "#666" }}>Failed to retrieve canonical Cartilla data from GitHub. Nothing is shown rather than a guess.</p>
        <a href="/" style={{ display: "inline-block", marginTop: 12, padding: "8px 14px", background: "#1c1a14", color: "#fbf6e8", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>← Return to NBO Overview</a>
      </main>
    );
  }
}
