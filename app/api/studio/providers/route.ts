import { NextResponse } from "next/server";
import { studioAuthorized } from "@/lib/studio-auth";
import { zenzapConfigured } from "@/lib/zenzap";
import { studioProviderIds, studioProviders, providerReady } from "@/lib/studio-providers";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await studioAuthorized())) return NextResponse.json({error:"Sign in required"},{status:401});
  return NextResponse.json({
    providers: studioProviderIds.map(id => ({
      id,
      label: studioProviders[id].label,
      connected: providerReady(id),
      mode: "Server-side API key",
      page: studioProviders[id].page
    })),
    zenzapConnected: zenzapConfigured(),
    history: "Saved on this browser only; cross-device syncing is not available.",
    accountLogin: "External web accounts are not connected to NBO; use official integrations where supported."
  },{headers:{"Cache-Control":"private, no-store"}});
}
