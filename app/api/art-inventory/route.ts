import { NextResponse } from "next/server";
import { loadInventory } from "@/lib/art-inventory";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref") || undefined;
    const inv = await loadInventory(ref);
    return NextResponse.json(inv);
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
