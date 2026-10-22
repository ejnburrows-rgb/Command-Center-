import { loadInventory } from "../../lib/art-inventory";
import InventoryView from "./inventory-view";
export const dynamic = "force-dynamic";
export const metadata = { title: "Cartilla art inventory" };
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string; slot?: string }> }) {
  const { ref, slot } = await searchParams;
  try {
    const inv = await loadInventory(ref);
    return <InventoryView inv={inv} openSlot={slot} />;
  } catch (e) {
    return <main style={{ padding: 20, font: "18px system-ui", background: "#fbf6e8", minHeight: "100vh" }}><h1>Art inventory could not load</h1><p>{String((e as Error).message)}</p><p>Nothing is shown rather than a guess.</p></main>;
  }
}
