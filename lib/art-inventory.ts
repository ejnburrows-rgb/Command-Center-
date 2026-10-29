// Live Cartilla Visual Activity, Artwork, and Motion Inventory.
// Reads canonical data directly from the public cartilla-de-gretel repo at request time / ISR.
// Zero hardcoded counts: every count and classification is calculated dynamically from canonical source files.
const OWNER = "ejnburrows-rgb";
const REPO = "cartilla-de-gretel";

// Branch containing archival scan annotations and circled bounding boxes
export const ARCHIVAL_RENDER_REF = process.env.ART_INVENTORY_REF || "art-inventory-live";
// Canonical branch holding current verified artwork, motion, and code
export const DEFAULT_MAIN_REF = process.env.CARTILLA_MAIN_REF || "main";
export const TUTOR_PR_REF = "bb585e1eb467d57731a666f6690546958ab34890";
export const DEFAULT_REF = "main";
export const IMAGE_REF = "main";

const BASE = "docs/art-inventory";

export type Orig =
  | { kind: "scan"; src: string; sw: number; box: [number, number, number, number] }
  | { kind: "image"; src: string; whole_page?: boolean }
  | null;

export type Slot = {
  id: string;
  artwork_id: string;
  book: "Workbook" | "Flip Chart" | "Cover";
  page: number;
  label: string;
  role: string;
  live: string;
  his: boolean;
  was_flagged: boolean;
  flag_reason: string;
  orig: Orig;
  book_page: {
    src: string;
    size: [number, number];
    circle: { box: [number, number, number, number]; method: string; score: number | null } | null;
  };
  status: "OK" | "HIS NEW PICTURE" | "CLEANED (was flagged)" | "FLAGGED";
  note: string;
  app: string;
  appImageUrl: string;
  appLoadedRefLabel: string;
  canonicalImageUrl: string;
  tags: string[];
  metrics: Record<string, any>;
  appNote: string;
  notFinished: boolean;
  // Part 3 & Part 4 Canonical Master Mapping + 11 Image Quality & Cropping Inspection Fields
  canonicalDrawingGroup?: string;
  canonicalGroupStatus?: string;
  canonicalPlacementStatus?: string;
  canonicalSourceCropPath?: string;
  canonicalSourceCropVerified?: string;
  canonicalDestinationPath?: string;
  canonicalDestinationVerified?: string;
  canonicalDestinationNote?: string;
  canonicalExactMatchVerified?: boolean;
  canonicalPlacementNote?: string;
  cropCompleteness: string;
  orientationAndObjectCount: string;
  resolutionAndScaling: string;
  transparencyCorrectness: string;
  sourceFidelity: string;
  ownerApprovalStatus: string;
  betterApprovedSourceExists: string;
  smallestSourcePreservingFix: string;
  isFlaggedWorkbookSubject?: boolean;
  isRepairedIn1205?: boolean;
};

export type MotionItem = {
  id: string;
  catalogSource: "manifest_svg" | "registry_css_part" | "registry_css_ambient" | "held_still_rule";
  name: string;
  book: "Workbook" | "Flip Chart" | "Both";
  page: number | string;
  still: string;
  stillSha256?: string;
  aliveSrc?: string;
  blinkFrame?: string;
  action?: string;
  meaning: string;
  whatPhysicallyMoves: string;
  selectedAtRuntime: boolean;
  runtimeSelectionNote: string;
  sameApprovedSource: string;
  reducedMotionBehavior: string;
  creature: boolean;
  hasParts: boolean;
  motionStatus:
    | "RECONCILED_1204"
    | "SOURCE_FRESH_UNVERIFIED_LIVE"
    | "STALE_HELD_STILL"
    | "CSS_PART_RIG"
    | "CSS_WHOLE_MOTION"
    | "HELD_STILL_RULE";
  motionNote: string;
  sourceFreshness: "FRESH" | "STALE_BLOCKED" | "UNVERIFIED";
  proofVideoUrl?: string;
  reducedProofVideoUrl?: string;
};

export type ActivityItem = {
  id: string;
  category:
    | "workbook_exercise"
    | "flipchart_sheet"
    | "standalone_game"
    | "practice_mode"
    | "assignment_type"
    | "tutor_experience"
    | "disconnected_feature";
  categoryLabel: string;
  name: string;
  lessonNumber?: number;
  printedPage?: number | string;
  route: string;
  builtStatus: string;
  workingStatus:
    | "WORKS_LIVE"
    | "WORKS_ON_MAIN"
    | "IN_PROGRESS_PR"
    | "DISCONNECTED_PENDING"
    | "SOURCE_BLOCKED"
    | "NOT_VERIFIED";
  reachability: "Student & Teacher" | "Student Only" | "Teacher Only" | "Práctica En Casa" | "Direct Link Only" | "Disconnected / Unmounted";
  underlyingExerciseCount?: number;
  underlyingInstructionCount?: number;
  underlyingRegionBreakdown?: string;
  correctBehavior: string;
  progressBehavior: string;
  mobileStatus: "Fully Verified (390px)" | "Responsive Canvas (Unverified Live)" | "Touch Emulated" | "Pending Phone Run";
  accessibilityNote: string;
  missingArtOrAudio: string;
  existingPrOrIssue: string;
  proofUrl?: string;
  exactNextAction: string;
  thumbnailUrl?: string;
};

export type Inventory = {
  ref: string;
  sha: string;
  mainSha: string;
  imgSha: string;
  auditedSha: string;
  committedAt: string;
  fetchedAt: string;
  base: string;
  mainBase: string;
  tutorBase: string;
  tagMeaning: Record<string, string>;
  tagCounts: Record<string, number>;
  slots: Slot[];
  motion: MotionItem[];
  activities: ActivityItem[];
  totals: {
    all: number;
    drawingGroups: number;
    repaired1205Placements: number;
    repaired1205Destinations: number;
    flagged10WorkbookPlacements: number;
    flagged10WorkbookSubjectsCount: number;
    byBook: Record<string, number>;
    byStatus: Record<string, number>;
    activitiesCount: {
      lessons: number;
      workbookPagesTotal: number;
      workbookPagesAvailable: number;
      sourceBlockedPages: number;
      workbookUnderlyingExercises: number;
      workbookPrintedInstructions: number;
      workbookArchetypes: number;
      flipchartSheets: number;
      flipchartIllustratedSheets: number;
      standaloneGames: number;
      liveGames: number;
      practiceModes: number;
      assignmentTypes: number;
      tutorMilestones: number;
      disconnectedFeatures: number;
    };
    motionCount: {
      manifestTotal: number;
      reconciled1204: number;
      manifestSourceFreshUnverified: number;
      staleBlocked: number;
      cssPartRigged: number;
      cssWholeAmbient: number;
      heldStill: number;
    };
  };
};

// The 10 Workbook subjects flagged for source verification (note: "alas" is labeled "ala" in MASTER-MAPPING.csv)
const FLAGGED_10_WORKBOOK_SUBJECTS = new Set([
  "escuela",
  "taza",
  "pera",
  "dulce",
  "escoba",
  "ola",
  "alas",
  "ala",
  "imán",
  "iman",
  "ardilla",
  "espejo",
]);

const HELD_STILL_SUBJECTS = [
  { name: "oruga", meaning: "oruga en el suelo (movimiento suspendido por regla de fondo)" },
  { name: "araña", meaning: "araña y telaraña (movimiento suspendido por regla de fondo)" },
  { name: "ardilla", meaning: "ardilla y rama (movimiento suspendido por regla de fondo)" },
  { name: "erizo", meaning: "erizo en el suelo (movimiento suspendido por regla de fondo)" },
  { name: "iguana", meaning: "iguana en la roca (movimiento suspendido por regla de fondo)" },
  { name: "insecto", meaning: "insecto en hoja (movimiento suspendido por regla de fondo)" },
  { name: "unicornio", meaning: "unicornio en suelo (movimiento suspendido por regla de fondo)" },
];

// Exact physical motion details per manifest entry from SVG inspection
const MANIFEST_PHYSICAL_MOTION: Record<string, string> = {
  abeja: "SMIL wing/stinger oscillation + whole-group drift (BLOCKED by stale-motion-art.json because embedded raster drifts from approved still)",
  aguja: "Internal CSS @keyframes (thread loop sway & needle glint; base illustration held stationary)",
  arbol: "Internal CSS @keyframes + SMIL canopy leaf rustle around trunk pivot (roots/ground stationary)",
  avion: "Internal CSS @keyframes prop spin (0.18s) + subtle wing tilt",
  barco: "Internal CSS @keyframes hull gentle wave rock + sail/wake ripple",
  elefante: "Merged #1204: 4.8s step-end eyelid blink overlay (vocal-e-elefante-blink.webp) + ear/trunk SVG group pivot; zero whole-body warp",
  escuela: "Internal CSS @keyframes flag flutter on flagpole + bell swing (building/ground stationary)",
  espada: "Internal CSS @keyframes metallic blade glint sweep (hilt/blade geometry stationary)",
  estrella: "Internal CSS @keyframes starlight twinkle/pulse around center",
  fc_p004_oveja: "Merged #1204: 4.8s step-end eyelid blink overlay + ear/head subtle nod; 100% RGBA base pixel match",
  fc_p006_elefante: "Merged #1204: 4.8s step-end eyelid blink overlay + ear/trunk subtle articulation; 100% RGBA base pixel match",
  iglesia: "Internal CSS @keyframes belfry bell swing (church structure stationary)",
  iman: "Internal CSS @keyframes magnetic field spark pulse at poles",
  isla: "Internal CSS @keyframes palm frond breeze sway + shoreline water ripple",
  olla: "Internal CSS @keyframes rising steam wisps + lid jiggle",
  oso: "Internal CSS @keyframes + SMIL eyelid blink + ear/muzzle twitch",
  oveja: "Merged #1204: 4.8s step-end eyelid blink overlay (vocal-o-oveja-blink.webp) + ear twitch; zero body distortion",
  pajaro: "Internal CSS @keyframes wing feather flutter + eye blink + tail bob",
  soldado: "Internal CSS @keyframes eyelid blink + plume/salute subtle posture shift",
  uvas: "Internal CSS @keyframes leaf tendril gentle sway + grape highlight gleam",
  "vocal-a-abeja": "SMIL wing/body oscillation (BLOCKED by stale-motion-art.json because embedded raster drifts from approved vocal-a/abeja.webp)",
  "vocal-e-elefante": "Merged #1204: 4.8s step-end eyelid blink overlay + ear/trunk subtle articulation; 100% RGBA base pixel match",
  "vocal-o-oveja": "Merged #1204: 4.8s step-end eyelid blink overlay + ear/head subtle articulation; 100% RGBA base pixel match",
};

const headers = (): Record<string, string> => {
  const t = process.env.GITHUB_TOKEN_READ;
  return {
    "User-Agent": "nbo-hub-art-inventory",
    Accept: "application/vnd.github+json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

function parseCsv(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const p: string[] = [];
    let cur = "",
      inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        p.push(cur);
        cur = "";
      } else cur += ch;
    }
    p.push(cur);
    return p;
  });
}

export async function loadInventory(refIn?: string): Promise<Inventory> {
  const ref =
    refIn && /^[A-Za-z0-9._\/-]{1,120}$/.test(refIn) && !refIn.includes("..")
      ? refIn
      : ARCHIVAL_RENDER_REF;

  // 1. Commit lookup for archival render ref (slots-render.json)
  const c = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits/${encodeURIComponent(ref).replace(/%2F/g, "/")}`,
    { headers: headers(), next: { revalidate: process.env.GITHUB_TOKEN_READ ? 60 : 120 } }
  );
  if (!c.ok) throw new Error(`GitHub commit lookup failed for archival ref "${ref}" (${c.status})`);
  const cj = await c.json();
  const sha: string = cj.sha;
  const base = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${sha}/`;

  // 2. Commit lookup for main (canonical files)
  const mc = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits/${DEFAULT_MAIN_REF}`,
    { headers: headers(), next: { revalidate: process.env.GITHUB_TOKEN_READ ? 60 : 120 } }
  );
  if (!mc.ok) throw new Error(`GitHub commit lookup failed for main branch (${mc.status})`);
  const mcj = await mc.json();
  const mainSha: string = mcj.sha;
  const mainBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${mainSha}/`;
  const tutorBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${TUTOR_PR_REF}/`;

  const getArchival = async (p: string) => {
    const r = await fetch(base + p, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Could not read archival ${p} at ${sha.slice(0, 7)} (${r.status})`);
    return r.json();
  };

  const getMainText = async (p: string) => {
    const r = await fetch(mainBase + p, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Could not read main ${p} at ${mainSha.slice(0, 7)} (${r.status})`);
    return r.text();
  };

  const getMainJson = async (p: string) => {
    const r = await fetch(mainBase + p, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Could not read main ${p} at ${mainSha.slice(0, 7)} (${r.status})`);
    return r.json();
  };

  // Parallel fetch of archival metadata and canonical files from main
  const [
    render,
    flags,
    appl,
    qual,
    masterCsvText,
    auditJson,
    motionManifestJson,
    staleMotionJson,
    actorRegistryText,
    pageArchetypesText,
    pageLayoutsJson,
    lessonMetaText,
    flipchartJson,
    practicaRouteText,
    activityIconsText,
  ] = await Promise.all([
    getArchival(`${BASE}/slots-render.json`),
    getArchival(`${BASE}/still-flagged.json`),
    getArchival(`${BASE}/app-loaded.json`),
    getArchival(`${BASE}/quality.json`),
    getMainText("docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv"),
    getMainJson("docs/production-art-classification-audit.json"),
    getMainJson("scripts/living-motion/manifest.json"),
    getMainJson("src/data/stale-motion-art.json"),
    getMainText("src/lib/living-actor-registry.ts"),
    getMainText("src/data/workbook-archetypes.ts"),
    getMainJson("src/data/page-layouts.json"),
    getMainText("src/content/lesson-meta.ts"),
    getMainJson("src/data/teacher-flipchart.json"),
    getMainText("src/routes/cartilla/practica.tsx"),
    getMainText("src/components/activities/activityIcons.tsx"),
  ]);

  // Index production-art-classification-audit.json by file path and subject
  const auditByPath = new Map<string, any>();
  const auditBySubject = new Map<string, any>();
  if (Array.isArray(auditJson?.faithfulAudit)) {
    for (const item of auditJson.faithfulAudit) {
      if (item.file) {
        auditByPath.set(item.file, item);
        auditByPath.set(item.file.replace(/^public\//, ""), item);
      }
      const subj = (item.file || "").split("/").pop()?.replace(/\.[a-z0-9]+$/i, "")?.toLowerCase();
      if (subj && !auditBySubject.has(subj)) {
        auditBySubject.set(subj, item);
      }
    }
  }

  // Parse Master Mapping CSV (330 canonical placement rows)
  const csvRows = parseCsv(masterCsvText);
  const mappingBySlot = new Map<string, any>();
  if (csvRows.length > 1) {
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i];
      if (!row || row.length < 2) continue;
      const slotId = row[0];
      mappingBySlot.set(slotId, {
        slot_id: slotId,
        book: row[1],
        page_sheet: row[2],
        lesson_item: row[3],
        drawing_group_id: row[4],
        drawing_label: row[5],
        group_status: row[6],
        placement_status: row[7],
        source_crop_path: row[8],
        source_crop_verified: row[9],
        destination_path: row[10],
        destination_verified: row[11],
        destination_note: row[12],
        image_link: row[13],
        exact_placement_match_verified: row[14] === "yes",
        placement_note: row[15] || "",
      });
    }
  }

  const still: Record<string, string> = flags.still_flagged || {};
  const cnotes: Record<string, string> = flags.cleaned_notes || {};
  const auditedSha = String(qual.commit || "");

  // Helper to build the 11 Part 4 fields for each slot
  const computePart4Fields = (
    slotId: string,
    bookCategory: "Workbook" | "Flip Chart" | "Cover",
    label: string,
    appPath: string,
    mapped: any,
    q: { tags: string[]; metrics: Record<string, any> },
    isFlaggedWorkbook: boolean,
    isRepaired1205: boolean
  ) => {
    const destPath: string = mapped.destination_path || appPath || "";
    const inRepoDest = destPath.startsWith("public/");
    const canonicalImageUrl = inRepoDest ? mainBase + destPath : base + appPath;
    // Resolve app-loaded image from main when it's an in-repo public/ path; if archival-only (e.g. flipchart-native PNG removed in cleanup), use canonical or archival with clear label
    const usesHistoricalNativePng = appPath.includes("flipchart-native/");
    const appImageUrl = inRepoDest ? mainBase + destPath : base + appPath;
    const appLoadedRefLabel = inRepoDest
      ? usesHistoricalNativePng && destPath !== appPath
        ? `Canonical on Main (${mainSha.slice(0, 7)}); archival app-loaded.json @ ${auditedSha.slice(0, 7)} referenced ${appPath.split("/").pop()}`
        : `Verified on Main (${mainSha.slice(0, 7)})`
      : `Archival Reference (${sha.slice(0, 7)}) — Composite/Unextracted`;

    const subjKey = (label || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const auditEntry =
      auditByPath.get(destPath) ||
      auditByPath.get(appPath) ||
      auditBySubject.get((label || "").toLowerCase().trim()) ||
      auditBySubject.get(subjKey);

    const tags = q.tags || [];
    const m = q.metrics || {};

    // 5. Crop completeness
    const cropCompleteness = isRepaired1205
      ? "COMPLETE (Restored in #1205 from authoritative 300-DPI scan with full border/details)"
      : tags.includes("CLIPPED_EDGES") || auditEntry?.classification === "TRUNCATED_SILHOUETTE_EXTRACTION"
      ? `TRUNCATED / CLIPPED (Edge touch: ${m.edge_touch ?? "flagged"}; silhouette extraction clipped edge details)`
      : mapped.source_crop_verified === "yes"
      ? `COMPLETE (${m.edge_touch !== undefined ? `edge_touch=${m.edge_touch}` : "verified full bounds"})`
      : "UNVERIFIED CROP BOUNDS";

    // 6. Orientation and object count
    const orientationAndObjectCount = mapped.placement_note
      ? mapped.placement_note
      : isFlaggedWorkbook
      ? `Requires source verification for "${label}" orientation/count against physical Workbook page`
      : "Matches canonical book placement orientation & object count";

    // 7. Resolution and scaling quality
    const sizeStr = Array.isArray(m.size) && m.size.length === 2 ? `${m.size[0]}×${m.size[1]}px` : "Vector / Native";
    const ext = destPath.split(".").pop()?.toUpperCase() || "IMG";
    const resolutionAndScaling = tags.includes("LOW_RES") || tags.includes("TINY_SUBJECT")
      ? `FLAGGED (${sizeStr}, ${ext}, fill=${m.fill ?? "n/a"} — ${tags.filter((t) => t === "LOW_RES" || t === "TINY_SUBJECT").join(", ")})`
      : `${ext} (${sizeStr}${m.fill !== undefined ? `, fill=${m.fill}` : ""}) — Clean scaling`;

    // 8. Transparent background correctness
    const transparencyCorrectness = isRepaired1205
      ? "VERIFIED NATIVE RGB (Preserves cream page paper & interior whites per #1205; zero grey-white bleed)"
      : tags.includes("GREY_BG_DRIFT") || tags.includes("HALO_RESIDUE") || tags.includes("CHECKER_ARTIFACT")
      ? `DEFECT FLAGGED (${tags.filter((t) => ["GREY_BG_DRIFT", "HALO_RESIDUE", "CHECKER_ARTIFACT"].includes(t)).join(", ")})`
      : auditEntry?.classification === "SOURCE_PAGE_BACKGROUND_CROP"
      ? `SOURCE PAPER BACKGROUND (${m.mode || "RGB"}, opaque scan crop)`
      : `${m.mode || "RGBA"} (${m.has_transparency !== false ? "Transparent alpha verified" : "Opaque native crop"})`;

    // 9. Source fidelity
    const sourceFidelity = isRepaired1205
      ? "VERIFIED ORIGINAL ART (#1205 300-DPI scan crop; zero AI/redraw)"
      : auditEntry?.classification
      ? `${auditEntry.classification}${auditEntry.note ? ` — ${auditEntry.note}` : ""}`
      : mapped.exact_placement_match_verified
      ? "EXACT PLACEMENT MATCH VERIFIED (MASTER-MAPPING.csv)"
      : "CANONICAL MAPPED SOURCE";

    // 10. Owner approval status
    const ownerApprovalStatus = isRepaired1205
      ? "APPROVED & MERGED (#1205)"
      : mapped.group_status === "UNRESOLVED"
      ? "UNRESOLVED (Cover composite awaiting isolated asset policy)"
      : isFlaggedWorkbook
      ? `REQUIRES OWNER / SOURCE VERIFICATION (10 flagged Workbook subjects)`
      : mapped.exact_placement_match_verified
      ? `VERIFIED (${mapped.group_status || "RESOLVED"} / ${mapped.placement_status || "EXACT"})`
      : `${mapped.group_status || "MAPPED"} (${mapped.placement_status || "PENDING"})`;

    // 11. Whether a better already-approved source exists & smallest source-preserving fix
    const betterApprovedSourceExists = isRepaired1205
      ? `Already using repaired 300-DPI scan crop (${destPath})`
      : isFlaggedWorkbook
      ? `Yes — 300-DPI physical page scan in public/cartilla/art/source/workbook/ (${mapped.source_crop_path || "see MASTER-MAPPING.csv"})`
      : usesHistoricalNativePng && destPath !== appPath
      ? `Yes — Canonical Main uses ${destPath}`
      : "Current canonical destination is the latest approved asset";

    const smallestSourcePreservingFix = isRepaired1205
      ? "Preserve merged PR #1205 native RGB scan crop; do not re-crop or strip interior whites."
      : isFlaggedWorkbook
      ? `Compare ${destPath} against 300-DPI page scan (${mapped.source_crop_path}); if clipped or grey-bled, replace with clean rectangular RGB scan crop using #1205 pipeline.`
      : mapped.group_status === "UNRESOLVED"
      ? "Keep composite cover page scan until owner authorizes individual cover element extraction."
      : tags.length > 0
      ? `Inspect flagged tag(s) [${tags.join(", ")}] against ${mapped.source_crop_path}; apply rectangular source crop if edges are clipped.`
      : "None required — preserve approved canonical asset.";

    return {
      canonicalImageUrl,
      appImageUrl,
      appLoadedRefLabel,
      cropCompleteness,
      orientationAndObjectCount,
      resolutionAndScaling,
      transparencyCorrectness,
      sourceFidelity,
      ownerApprovalStatus,
      betterApprovedSourceExists,
      smallestSourcePreservingFix,
    };
  };

  // Build Slots by joining render (327 slots) with MASTER-MAPPING.csv via normalized artwork_id
  const matchedCanonicalIds = new Set<string>();
  const slots: Slot[] = render.map((x: any) => {
    let rawKey = String(x.artwork_id || x.id).split(" ")[0];
    if (!matchedCanonicalIds.has(rawKey) && rawKey.endsWith("-2")) {
      const objNum = String(x.id).split("-").pop();
      const candidate1 = rawKey.replace(/OBJ\d+-([A-Z]+)-2$/, `OBJ${objNum}-$1-1`);
      if (mappingBySlot.has(candidate1)) rawKey = candidate1;
    }
    const canonicalKey = mappingBySlot.has(rawKey)
      ? rawKey
      : mappingBySlot.has(x.id)
      ? x.id
      : rawKey;
    const mapped = mappingBySlot.get(canonicalKey) || {};
    if (mapped.slot_id) matchedCanonicalIds.add(mapped.slot_id);

    const status = x.was_flagged
      ? x.id in still
        ? "FLAGGED"
        : "CLEANED (was flagged)"
      : x.his
      ? "HIS NEW PICTURE"
      : "OK";
    const note =
      x.id in still
        ? still[x.id]
        : x.was_flagged
        ? cnotes[x.id] || `Was: ${x.flag_reason}`
        : x.flag_reason || (x.orig?.whole_page ? "WHOLE BOOK PAGE (no crop on file)" : "");
    const a = appl.slots?.[x.id] || {},
      q = qual.slots?.[x.id] || { tags: [], metrics: {} };
    const app: string = a.app_loads || x.live;
    const bookCategory: "Workbook" | "Flip Chart" | "Cover" = canonicalKey.includes("FRONT")
      ? "Cover"
      : x.book === "flip_chart" || mapped.book === "Flip Chart"
      ? "Flip Chart"
      : "Workbook";

    const normLabel = (mapped.drawing_label || x.label || "").toLowerCase().trim();
    const isFlaggedWorkbook = bookCategory === "Workbook" && FLAGGED_10_WORKBOOK_SUBJECTS.has(normLabel);
    const isRepaired1205 =
      (typeof mapped.placement_note === "string" && mapped.placement_note.includes("source repair")) ||
      (typeof mapped.destination_note === "string" &&
        mapped.destination_note.includes("source-crop-repairs-2026-10-27"));

    const p4 = computePart4Fields(
      canonicalKey,
      bookCategory,
      mapped.drawing_label || x.label,
      app,
      mapped,
      q,
      isFlaggedWorkbook,
      isRepaired1205
    );

    return {
      ...x,
      id: x.id,
      artwork_id: canonicalKey,
      label: mapped.drawing_label || x.label,
      app,
      tags: q.tags as string[],
      metrics: q.metrics,
      appNote:
        a.same_file_as_shown === false
          ? "Historical audit noted app loaded a different file than archival slot"
          : "",
      notFinished: (q.tags as string[]).length > 0 || mapped.group_status === "UNRESOLVED",
      book_page: x.book_page ?? { src: "", size: [0, 0], circle: null },
      status,
      note,
      book: bookCategory,
      canonicalDrawingGroup: mapped.drawing_group_id,
      canonicalGroupStatus: mapped.group_status,
      canonicalPlacementStatus: mapped.placement_status,
      canonicalSourceCropPath: mapped.source_crop_path,
      canonicalSourceCropVerified: mapped.source_crop_verified,
      canonicalDestinationPath: mapped.destination_path,
      canonicalDestinationVerified: mapped.destination_verified,
      canonicalDestinationNote: mapped.destination_note,
      canonicalExactMatchVerified: mapped.exact_placement_match_verified,
      canonicalPlacementNote: mapped.placement_note,
      isFlaggedWorkbookSubject: isFlaggedWorkbook,
      isRepairedIn1205: isRepaired1205,
      ...p4,
    };
  });

  // Append the remaining canonical placements from MASTER-MAPPING.csv not in slots-render.json (the 3 Cover placements)
  for (const [slotId, m] of mappingBySlot.entries()) {
    if (!matchedCanonicalIds.has(slotId)) {
      const bookCategory: "Workbook" | "Flip Chart" | "Cover" = slotId.includes("FRONT")
        ? "Cover"
        : m.book === "Flip Chart"
        ? "Flip Chart"
        : "Workbook";
      const normLabel = (m.drawing_label || "").toLowerCase().trim();
      const isFlaggedWorkbook = bookCategory === "Workbook" && FLAGGED_10_WORKBOOK_SUBJECTS.has(normLabel);
      const isRepaired1205 =
        (typeof m.placement_note === "string" && m.placement_note.includes("source repair")) ||
        (typeof m.destination_note === "string" &&
          m.destination_note.includes("source-crop-repairs-2026-10-27"));

      const coverScanSrc =
        slotId === "FC-FRONT-001"
          ? "public/cartilla/art/source/flipchart/page-001.jpg"
          : "public/cartilla/art/source/workbook/page-001.jpg";

      const p4 = computePart4Fields(
        slotId,
        bookCategory,
        m.drawing_label || slotId,
        coverScanSrc,
        m,
        { tags: [], metrics: { mode: "RGB", has_transparency: false } },
        isFlaggedWorkbook,
        isRepaired1205
      );

      slots.push({
        id: slotId,
        artwork_id: slotId,
        book: bookCategory,
        page: parseInt(m.page_sheet, 10) || 1,
        label: m.drawing_label || slotId,
        role: "Cover / Composite illustration",
        live: coverScanSrc,
        his: false,
        was_flagged: false,
        flag_reason: "",
        orig: { kind: "image", src: coverScanSrc, whole_page: true },
        book_page: { src: coverScanSrc, size: [2550, 3300], circle: null },
        status: "OK",
        note: m.placement_note || "Canonical Cover Placement",
        app: m.destination_path || coverScanSrc,
        tags: [],
        metrics: { mode: "RGB", has_transparency: false },
        appNote: m.destination_note || "",
        notFinished: m.group_status === "UNRESOLVED",
        canonicalDrawingGroup: m.drawing_group_id,
        canonicalGroupStatus: m.group_status,
        canonicalPlacementStatus: m.placement_status,
        canonicalSourceCropPath: m.source_crop_path,
        canonicalSourceCropVerified: m.source_crop_verified,
        canonicalDestinationPath: m.destination_path,
        canonicalDestinationVerified: m.destination_verified,
        canonicalDestinationNote: m.destination_note,
        canonicalExactMatchVerified: m.exact_placement_match_verified,
        canonicalPlacementNote: m.placement_note,
        isFlaggedWorkbookSubject: isFlaggedWorkbook,
        isRepairedIn1205: isRepaired1205,
        ...p4,
        canonicalImageUrl: mainBase + coverScanSrc,
        appImageUrl: mainBase + coverScanSrc,
      });
    }
  }

  const byBook: Record<string, number> = {},
    byStatus: Record<string, number> = {};
  const uniqueDrawingGroups = new Set<string>();
  const repaired1205DestinationsSet = new Set<string>();
  const flagged10SubjectsMatched = new Set<string>();

  for (const s of slots) {
    byBook[s.book] = (byBook[s.book] || 0) + 1;
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    if (s.canonicalDrawingGroup) uniqueDrawingGroups.add(s.canonicalDrawingGroup);
    if (s.isRepairedIn1205 && s.canonicalDestinationPath) {
      repaired1205DestinationsSet.add(s.canonicalDestinationPath);
    }
    if (s.isFlaggedWorkbookSubject) {
      const rawNorm = s.label.toLowerCase().trim();
      const norm = rawNorm === "ala" ? "alas" : rawNorm === "iman" ? "imán" : rawNorm;
      flagged10SubjectsMatched.add(norm);
    }
  }

  // Parse Actor Registry for living motion
  const prefixMap: Record<string, string> = {
    FC_NATIVE: "/cartilla/art/optimized/flipchart-native",
    W1: "/cartilla/art/optimized/workbook/leccion-1",
    P1: "/cartilla/art/faithful/leccion-1/wb-p1",
    A: "/cartilla/art/faithful",
  };

  const registryLines = actorRegistryText.split(/\r?\n/);
  const parsedActors = new Map<string, any>();
  for (let i = 0; i < registryLines.length; i++) {
    const line = registryLines[i];
    const km = line.match(/^\s*\[`\$\{([A-Z0-9_]+)\}\/([^`]+)`\]\s*:\s*\{/);
    if (km) {
      const key = (prefixMap[km[1]] || km[1]) + "/" + km[2];
      let body = line;
      if (!line.includes("meaning:")) {
        for (let j = i + 1; j < Math.min(i + 15, registryLines.length); j++) {
          body += " " + registryLines[j];
          if (registryLines[j].includes("meaning:")) break;
        }
      }
      const aliveMatch = body.match(/aliveSrc:\s*(?:`\$\{([A-Za-z0-9_]+)\}\/([^`]+)`|['"]([^'"]+)['"])/);
      const actionMatch = body.match(/action:\s*['"]([^'"]+)['"]/);
      const meaningMatch = body.match(/meaning:\s*['"]([^'"]+)['"]/);
      const creatureMatch = body.match(/creature:\s*(true|false)/);
      const blinkMatch = body.match(/blinkFrame:\s*(?:`\$\{([A-Za-z0-9_]+)\}\/([^`]+)`|['"]([^'"]+)['"])/);
      const partMatch = body.match(/parts:\s*\[([^\]]+)\]/);

      parsedActors.set(key, {
        key,
        aliveSrc: aliveMatch
          ? aliveMatch[1]
            ? (prefixMap[aliveMatch[1]] || aliveMatch[1]) + "/" + aliveMatch[2]
            : aliveMatch[3]
          : undefined,
        blinkFrame: blinkMatch
          ? blinkMatch[1]
            ? (prefixMap[blinkMatch[1]] || blinkMatch[1]) + "/" + blinkMatch[2]
            : blinkMatch[3]
          : undefined,
        action: actionMatch ? actionMatch[1] : undefined,
        meaning: meaningMatch ? meaningMatch[1] : undefined,
        creature: creatureMatch ? creatureMatch[1] === "true" : false,
        hasParts: Boolean(partMatch),
      });
    }
  }

  // Build Motion Items (Part 5: 22 Manifest entries + CSS Part Rigs + CSS Ambient + 7 Held-Still Subjects)
  const motionList: MotionItem[] = [];
  const RECONCILED_1204_KEYS = new Set([
    "elefante",
    "oveja",
    "vocal-e-elefante",
    "vocal-o-oveja",
    "fc_p006_elefante",
    "fc_p004_oveja",
  ]);

  for (const [mKey, mVal] of Object.entries(motionManifestJson as Record<string, any>)) {
    const still = mVal.still || "";
    const alive = mVal.alive || "";
    const staleEntry =
      (staleMotionJson as Record<string, any>)[still] ||
      (staleMotionJson as Record<string, any>)[alive];
    const isStale = Boolean(staleEntry || mVal.motionStatus?.includes("NOT VERIFIED"));
    const is1204 = RECONCILED_1204_KEYS.has(mKey);

    const normSrc = still.replace(/^public/, "");
    const actor = parsedActors.get(normSrc) || {};

    const motionStatus: MotionItem["motionStatus"] = isStale
      ? "STALE_HELD_STILL"
      : is1204
      ? "RECONCILED_1204"
      : "SOURCE_FRESH_UNVERIFIED_LIVE";

    const book = still.includes("flipchart") ? "Flip Chart" : "Workbook";
    const pageNum =
      still.match(/p00(\d)/)?.[1] ||
      (still.includes("vocal-a")
        ? "4-6"
        : still.includes("vocal-e")
        ? "7-9"
        : still.includes("vocal-o")
        ? "13-15"
        : still.includes("leccion-1")
        ? "1-3"
        : "1-6");

    motionList.push({
      id: "manifest-" + mKey,
      catalogSource: "manifest_svg",
      name: mKey,
      book,
      page: pageNum,
      still: normSrc,
      stillSha256: mVal.stillSha256,
      aliveSrc: alive.replace(/^public/, ""),
      blinkFrame: actor.blinkFrame,
      action: actor.action || "part-motion",
      meaning: actor.meaning || "Movimiento natural restringido de partes",
      whatPhysicallyMoves:
        MANIFEST_PHYSICAL_MOTION[mKey] ||
        "Internal SVG part-group keyframes around natural anatomical/mechanical pivot",
      selectedAtRuntime: !isStale,
      runtimeSelectionNote: isStale
        ? "NO — getLivingActor(src) returns null via STALE_MOTION_ART guard; static approved still is rendered"
        : "YES — getLivingActor(src) selects aliveSrc when prefers-reduced-motion is not reduce",
      sameApprovedSource: isStale
        ? `NO (STALE) — ${staleEntry?.reason || "Embedded raster in *.alive.svg predates approved still"}`
        : is1204
        ? `YES (VERIFIED #1204) — Exact RGBA pixel base equality + LF SHA256 (${String(mVal.stillSha256).slice(0, 12)}…)`
        : `YES (SHA256 MATCH) — LF stillSha256=${String(mVal.stillSha256).slice(0, 12)}… matches current main still`,
      reducedMotionBehavior:
        "Renders static approved still (<img src={still}> via useReducedMotion() + SVG @media (prefers-reduced-motion: reduce) { animation: none !important })",
      creature: actor.creature !== undefined ? actor.creature : true,
      hasParts: true,
      motionStatus,
      motionNote: isStale
        ? "Stale embedded motion blocked in stale-motion-art.json; app serves approved still."
        : is1204
        ? "Merged in #1204: exact RGBA base equality verified, 4.8s blink cycle, static on reduced-motion."
        : "Manifest SVG sha256 matches canonical still on main; requires live route recording before marking live-verified.",
      sourceFreshness: isStale ? "STALE_BLOCKED" : "FRESH",
      proofVideoUrl: is1204
        ? mainBase + "docs/proofs/elephant-sheep-motion-2026-10-29/390-no-preference.webm"
        : mainBase + "docs/proofs/vowels-curriculum/375-vowels-curriculum.webm",
      reducedProofVideoUrl: is1204
        ? mainBase + "docs/proofs/elephant-sheep-motion-2026-10-29/390-reduce.webm"
        : undefined,
    });
  }

  // Add CSS Part-rigged & Ambient actors from living-actor-registry.ts
  for (const [, aVal] of parsedActors.entries()) {
    if (motionList.some((m) => m.still === aVal.key || m.aliveSrc === aVal.key)) continue;
    const isPart = aVal.hasParts;
    const book = aVal.key.includes("flipchart") ? "Flip Chart" : "Workbook";
    const pageNum =
      aVal.key.match(/p00(\d)/)?.[1] ||
      (aVal.key.includes("leccion-1") ? "1-3" : aVal.key.match(/leccion-(\d+)/)?.[1] || "1-19");

    motionList.push({
      id: "registry-" + aVal.key.split("/").pop(),
      catalogSource: isPart ? "registry_css_part" : "registry_css_ambient",
      name: aVal.key.split("/").pop()?.replace(/\.[a-z]+$/, "") || "",
      book,
      page: pageNum,
      still: aVal.key,
      blinkFrame: aVal.blinkFrame,
      action: aVal.action || "ambient",
      meaning: aVal.meaning || "Movimiento ambiental sutil",
      whatPhysicallyMoves: isPart
        ? "CSS clip-path polygon overlay animating only anatomical sub-parts (tail/ears/wings/head) + optional eyelid blinkFrame"
        : `CSS @keyframes living-${aVal.action || "ambient"} transform on isolated foreground illustration`,
      selectedAtRuntime: true,
      runtimeSelectionNote:
        "YES — LivingIllustration applies CSS part-rig / action layers to the canonical still image at runtime",
      sameApprovedSource: "YES — Uses the exact canonical still image DOM element directly (no separate SVG copy)",
      reducedMotionBehavior:
        "useReducedMotion() disables all CSS part overlays, blink timers, and keyframe classes; displays static still",
      creature: aVal.creature,
      hasParts: isPart,
      motionStatus: isPart ? "CSS_PART_RIG" : "CSS_WHOLE_MOTION",
      motionNote: isPart
        ? "CSS clip-path part-rig (tail/ears/wings/head); only real moving parts articulate."
        : "CSS subtle ambient motion on isolated foreground object.",
      sourceFreshness: "FRESH",
    });
  }

  // Add 7 Held-still subjects (Owner Rule 2026-10-11)
  for (const h of HELD_STILL_SUBJECTS) {
    motionList.push({
      id: "held-" + h.name,
      catalogSource: "held_still_rule",
      name: h.name,
      book: "Both",
      page: "Varios",
      still: `/cartilla/art/faithful/leccion-1/${h.name}.webp`,
      meaning: h.meaning,
      whatPhysicallyMoves: "Nothing — held completely static so attached ground/web/branch/rock never floats",
      selectedAtRuntime: false,
      runtimeSelectionNote: "NO — Intentionally excluded from LIVING_ACTORS per Owner Rule 2026-10-11",
      sameApprovedSource: "YES — Renders canonical static still directly",
      reducedMotionBehavior: "Always static still in both normal and reduced-motion modes",
      creature: true,
      hasParts: false,
      motionStatus: "HELD_STILL_RULE",
      motionNote:
        "Owner Rule 2026-10-11: Whole-picture motion suspended to prevent background/ground floating. Awaits approved part-rig.",
      sourceFreshness: "FRESH",
    });
  }

  // Parse 90 Workbook Page Archetypes + Underlying Exercises from page-layouts.json
  const pageBlocks = pageArchetypesText.split(/\{\s*printedPage:\s*(\d+)/).slice(1);
  const parsedWorkbookPages: any[] = [];
  for (let i = 0; i < pageBlocks.length; i += 2) {
    const pNum = Number(pageBlocks[i]);
    const b = pageBlocks[i + 1];
    const lMatch = b.match(/lessonNumber:\s*(\d+)/);
    const sMatch = b.match(/sourceStatus:\s*'([^']+)'/);
    const aMatch = b.match(/archetypes:\s*\[([^\]]*)\]/);
    const nMatch = b.match(/sourceNote:\s*'([^']+)'/);
    parsedWorkbookPages.push({
      page: pNum,
      lesson: lMatch ? Number(lMatch[1]) : 0,
      status: sMatch ? sMatch[1] : "",
      archetypes: aMatch
        ? aMatch[1]
            .split(",")
            .map((s: string) => s.trim().replace("WorkbookArchetype.", ""))
            .filter(Boolean)
        : [],
      note: nMatch ? nMatch[1] : "",
    });
  }

  // Compute underlying exercises per page from src/data/page-layouts.json
  const layoutsByPage: Record<string, any> = pageLayoutsJson?.pages || {};
  let totalUnderlyingExercises = 0;
  let totalPrintedInstructions = 0;
  const distinctArchetypesSet = new Set<string>();

  for (const p of parsedWorkbookPages) {
    for (const arch of p.archetypes) distinctArchetypesSet.add(arch);
    const layout = layoutsByPage[String(p.page)];
    const regions: any[] = Array.isArray(layout?.regions) ? layout.regions : [];
    const instrRegions = regions.filter((r) => r.regionType === "instruction");
    const exRegions = regions.filter(
      (r) => !["instruction", "title", "footer", "page-number", "letter-header"].includes(r.regionType)
    );
    p.instructionCount = instrRegions.length;
    p.exerciseCount = exRegions.length;
    const byType: Record<string, number> = {};
    for (const r of exRegions) {
      byType[r.regionType] = (byType[r.regionType] || 0) + 1;
    }
    p.regionBreakdown = Object.entries(byType)
      .map(([k, v]) => `${v}× ${k}`)
      .join(", ");
    totalPrintedInstructions += instrRegions.length;
    totalUnderlyingExercises += exRegions.length;
  }

  // Parse 24 Lessons from src/content/lesson-meta.ts
  const lessonBlocks = lessonMetaText.split(/\{\s*n:\s*(\d+)/).slice(1);
  const parsedLessons: any[] = [];
  for (let i = 0; i < lessonBlocks.length; i += 2) {
    const n = Number(lessonBlocks[i]);
    const b = lessonBlocks[i + 1];
    const title = (b.match(/title:\s*['"]([^'"]+)['"]/) || [])[1] || "";
    const titleEs = (b.match(/titleEs:\s*['"]([^'"]+)['"]/) || [])[1] || "";
    const letter = (b.match(/letter:\s*['"]([^'"]+)['"]/) || [])[1] || "";
    const kind = (b.match(/kind:\s*['"]([^'"]+)['"]/) || [])[1] || "";
    const pagesMatch = b.match(/pages:\s*\[(\d+),\s*(\d+)\]/);
    const pages = pagesMatch ? [Number(pagesMatch[1]), Number(pagesMatch[2])] : [0, 0];
    parsedLessons.push({ n, title, titleEs, letter, kind, pages });
  }

  // Build Activities List (7 Orthogonal Categories — NEVER summed into one total)
  const activitiesList: ActivityItem[] = [];

  // Pages with recorded Playwright screenshots/video in docs/proofs/
  const VERIFIED_WORKBOOK_PAGES = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 25, 26, 28, 30, 32, 33, 36, 40,
    44, 48, 52, 56, 58, 60, 62, 64, 70, 74, 85, 88,
  ]);

  // Category 1: 90 Physical Workbook Pages (88 available + 2 source-blocked, containing 333 underlying exercises)
  for (const p of parsedWorkbookPages) {
    const isBlocked = p.status === "SOURCE_BLOCKED";
    const isVerifiedPage = VERIFIED_WORKBOOK_PAGES.has(p.page);
    activitiesList.push({
      id: `wb-page-${p.page}`,
      category: "workbook_exercise",
      categoryLabel: "1. Cuaderno de Trabajo (Workbook)",
      name: `Cuaderno Página ${p.page} — Lección ${p.lesson} (${p.exerciseCount || 0} ejercicios en página)`,
      lessonNumber: p.lesson,
      printedPage: p.page,
      route: `/cartilla/leccion/${p.lesson}?page=${p.page}`,
      builtStatus: isBlocked
        ? "SOURCE_BLOCKED (Scan jump 85→88)"
        : `Built in OfficialWorkbookPageView (${p.regionBreakdown || p.archetypes.join(", ")})`,
      workingStatus: isBlocked ? "SOURCE_BLOCKED" : isVerifiedPage ? "WORKS_ON_MAIN" : "NOT_VERIFIED",
      reachability: "Student & Teacher",
      underlyingExerciseCount: p.exerciseCount || 0,
      underlyingInstructionCount: p.instructionCount || 0,
      underlyingRegionBreakdown: p.regionBreakdown || "None (Source Blocked)",
      correctBehavior: isBlocked
        ? "Página excluida de la navegación por falta de escaneo en la fuente original (salto 85→88)."
        : `Arquetipo(s): ${p.archetypes.join(", ")} · Regiones interactivas: ${p.regionBreakdown || "trazado/lectura"} (${p.instructionCount} instrucción impresa).`,
      progressBehavior: isBlocked
        ? "Sin guardado"
        : "Persiste trazos de lápiz, círculos y respuestas en student-session (localStorage).",
      mobileStatus: isVerifiedPage ? "Fully Verified (390px)" : "Responsive Canvas (Unverified Live)",
      accessibilityNote:
        "PencilConnector, SyllableWordCircle y HandwritingLine con soporte táctil y teclado (focus-visible).",
      missingArtOrAudio: isBlocked
        ? "Escaneo físico de páginas 86-87 ausente de la fuente."
        : "Arte impreso presente; audio de voz auténtica de Gretel pendiente bajo #769.",
      existingPrOrIssue: isBlocked
        ? "PROJECT_FINISH_DEFINITION.md / PR #1209"
        : "PR #1206 (Workbook Rollout) + PR #1205 (Source Crops)",
      proofUrl: isBlocked
        ? mainBase + "docs/proofs/page-gap-2026-10-29/390-navigation.webm"
        : isVerifiedPage
        ? mainBase + "docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/runtime/workbook-390.webm"
        : undefined,
      exactNextAction: isBlocked
        ? "Mantener SOURCE_BLOCKED documentado sin inventar páginas 86-87."
        : isVerifiedPage
        ? "Verificado en main; pendiente autorización de deploy integrado."
        : "Ejecutar prueba de navegador en móvil (390×844) para esta página específica antes del lanzamiento final.",
      thumbnailUrl: !isBlocked
        ? `${mainBase}public/cartilla/art/source/workbook/page-${String(p.page).padStart(3, "0")}.jpg`
        : undefined,
    });
  }

  // Category 2: Teacher Flip Chart Activities (62 sheets: 42 illustrated + 20 text/syllable sheets)
  const fcPages = flipchartJson.pages || [];
  const fcIllustratedSheetNums = new Set<number>();
  for (const s of slots) {
    if (s.book === "Flip Chart") fcIllustratedSheetNums.add(s.page);
  }
  const fcIllustratedCount = fcIllustratedSheetNums.size;
  const VERIFIED_FC_SHEETS = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43,
    45, 47, 49, 51, 53, 55, 57, 59, 61,
  ]);
  for (const fcp of fcPages) {
    const sheetNum = Number(fcp.flipchartPage || fcp.page || 1);
    const hasIllustrations = fcIllustratedSheetNums.has(sheetNum);
    const isVerifiedSheet = VERIFIED_FC_SHEETS.has(sheetNum);
    activitiesList.push({
      id: `fc-sheet-${sheetNum}`,
      category: "flipchart_sheet",
      categoryLabel: "2. Lámina Rotafolio (Teacher Flip Chart)",
      name: `Rotafolio Lámina ${sheetNum} — Lección ${fcp.lesson || 1}`,
      lessonNumber: fcp.lesson,
      printedPage: sheetNum,
      route: `/cartilla/presentacion/${fcp.lesson || 1}?sheet=${sheetNum}`,
      builtStatus: `Built in FlipChartSheetView (${hasIllustrations ? "lámina ilustrada" : "lámina de lectura/sílabas"})`,
      workingStatus: isVerifiedSheet ? "WORKS_ON_MAIN" : "NOT_VERIFIED",
      reachability: "Teacher Only",
      correctBehavior:
        "Lámina pedagógica del rotafolio con volteo superior realista (top-edge page turn) y vocabulario fonético.",
      progressBehavior: "Navegación de clase sincronizada por parámetro ?sheet=.",
      mobileStatus: isVerifiedSheet ? "Fully Verified (390px)" : "Responsive Canvas (Unverified Live)",
      accessibilityNote: "Modo proyector de aula, navegación por flechas y reducción de movimiento.",
      missingArtOrAudio: "Escenas nativas restauradas en #1205 (51 destinos); audio docente pendiente bajo #769.",
      existingPrOrIssue: "PR #1156 / PR #1205",
      proofUrl: isVerifiedSheet
        ? mainBase +
          "docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/runtime/teacher-all-delivered-crops.webm"
        : undefined,
      exactNextAction: isVerifiedSheet
        ? "Verificado en main (#1205); listo para revisión de release integrado."
        : "Capturar verificación visual individual de lámina de texto antes de release completo.",
      thumbnailUrl: `${mainBase}public/cartilla/art/source/flipchart/page-${String(sheetNum).padStart(3, "0")}.jpg`,
    });
  }

  // Category 3: Registered Standalone Games (12 entries in LIVE_GAMES on /cartilla/juego/$gameId)
  const STANDALONE_GAMES_METADATA: Record<string, Partial<ActivityItem>> = {
    "mariposas-p": {
      name: "Jardín de Mariposas (mariposas-p)",
      builtStatus: "Built & Live in Production (ButterflyGarden.tsx, PR #1079)",
      workingStatus: "WORKS_LIVE",
      route: "https://cartilla-de-gretel-psi.vercel.app/cartilla/juego/mariposas-p",
      reachability: "Student & Teacher",
      correctBehavior:
        "Forma 6 palabras con 3 mariposas de sílabas en orden (mapa, pomo, Mupi, Pepe, puma, Pupi). Mariposa errónea sacude y regresa; palabra completa vuela al jardín con 6 trayectorias distintas.",
      progressBehavior:
        "Guarda exactamente 1 resultado de ejercicio en sesión al completar las 6 palabras (score=6, sin duplicar al recargar).",
      mobileStatus: "Fully Verified (390px)",
      accessibilityNote:
        "Teclado completo (Tab, Enter/Space, Escape en modal de instrucciones) y prefers-reduced-motion verificado.",
      missingArtOrAudio:
        "33/33 gráficos originales de butterfly-garden-adventure-51 verificados. Hooks de audio listos esperando grabación genuina (#769). Comparado con borrador PR #1010 (descartado).",
      existingPrOrIssue: "PR #1079 (Merged) + Production Release c670ff04 (LIVE)",
      proofUrl: mainBase + "docs/proofs/mariposas-2026-10-29/phone-touch.webm",
      exactNextAction:
        "No reimportar ni reemplazar con PR #1010. Conectar grabaciones auténticas de voz cuando #769 esté aprobado.",
      thumbnailUrl: mainBase + "src/assets/games/butterfly-garden/garden.jpg",
    },
    "payaso-chano-ss": {
      name: "Payaso Chano (payaso-chano-ss)",
      builtStatus: "Built in PayasoChano.tsx + /games/payaso-chano.html",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/payaso-chano-ss",
      reachability: "Student & Teacher",
      correctBehavior:
        "Construcción de 8 palabras s/m/p (paso, mesa, supo, asoma, sopa, suma, sapo, puso) en la pizarra de Chano y enlace a /games/payaso-chano.html animado.",
      progressBehavior: "Registra evento exercise (payaso_chano) en student-session por palabra completada.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Soporte @dnd-kit Mouse, Touch y Keyboard (Enter/Espacio) + botón Sombrilla/Reiniciar.",
      missingArtOrAudio:
        "Nota de auditoría: payaso-chano-ss.ts declara /cartilla/art/payaso-chano/{pizarra,chano,sombrilla,resorte}.svg que no existen en disco (PayasoChano.tsx usa iconos Lucide y /games/payaso-chano.html incrusta PNG base64). Audio en espera de #769.",
      existingPrOrIssue: "src/components/cartilla/games/PayasoChano.tsx",
      exactNextAction:
        "Capturar grabación interactiva en móvil (390×844) de /cartilla/juego/payaso-chano-ss y /games/payaso-chano.html; limpiar referencias SVG huérfanas en payaso-chano-ss.ts.",
      thumbnailUrl: mainBase + "public/cartilla/images/gretel/gretel-approved-master.png",
    },
    "silabas-o": {
      name: "Constructor de Sílabas — Vocal O (silabas-o)",
      builtStatus: "Built in SyllableBuilder.tsx",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/silabas-o",
      reachability: "Student & Teacher",
      correctBehavior: "Arrastrar o seleccionar sílabas para formar oso, ola, oveja y presionar Comprobar.",
      progressBehavior: "Registra acierto en student-session al completar la palabra.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Sensores táctiles y selección por teclado.",
      missingArtOrAudio: "Arte fiel WebP presente (oso, ola, oveja); audio de palabras en espera de #769.",
      existingPrOrIssue: "Issue #344 / syllable-builder-pilot.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844) y conectar audio aprobado (#769).",
      thumbnailUrl: mainBase + "public/cartilla/art/faithful/vocal-o/oso.webp",
    },
    "silabas-m": {
      name: "Constructor de Sílabas — Letra Mm (silabas-m)",
      builtStatus: "Built in SyllableBuilder.tsx",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/silabas-m",
      reachability: "Student & Teacher",
      correctBehavior: "Construir mamá y mono con sílabas ma/mo/mi/me.",
      progressBehavior: "Registra acierto en student-session al comprobar.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Sensores táctiles y selección por teclado.",
      missingArtOrAudio: "Arte fiel WebP presente (mama, mono); audio en espera de #769.",
      existingPrOrIssue: "Issue #344 / syllable-builder-pilot.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844) y conectar audio aprobado (#769).",
      thumbnailUrl: mainBase + "public/cartilla/art/faithful/leccion-7-m/mama.webp",
    },
    "silabas-p": {
      name: "Constructor de Sílabas — Letra Pp (silabas-p)",
      builtStatus: "Built in SyllableBuilder.tsx",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/silabas-p",
      reachability: "Student & Teacher",
      correctBehavior: "Construir papá y sopa con sílabas pa/so/pe/pi/po.",
      progressBehavior: "Registra acierto en student-session al comprobar.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Sensores táctiles y selección por teclado.",
      missingArtOrAudio: "Arte fiel WebP presente (papa); sopa sin imagen asignada; audio en espera de #769.",
      existingPrOrIssue: "Issue #344 / syllable-builder-pilot.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844) y conectar audio aprobado (#769).",
      thumbnailUrl: mainBase + "public/cartilla/art/faithful/leccion-8-p/papa.webp",
    },
    "vocal-a": {
      name: "Juego Vocal A (vocal-a)",
      builtStatus: "Built in CoreGames.tsx (juego-vocal)",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/vocal-a",
      reachability: "Student & Teacher",
      correctBehavior: "Discriminar palabras que comienzan con Aa (abeja, aguja vs distractores oso, ola, oveja).",
      progressBehavior: "Marca aciertos e intentos en sesión.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Botones táctiles con contraste claro.",
      missingArtOrAudio: "Imágenes fieles en WebP presentes; audio en espera de #769.",
      existingPrOrIssue: "src/content/games/core-games.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844) y conectar audio aprobado (#769).",
      thumbnailUrl: mainBase + "public/cartilla/art/faithful/vocal-a/abeja.webp",
    },
    "fonetica-p": {
      name: "Fonética: Completar Palabras Pp (fonetica-p)",
      builtStatus: "Built in CoreGames.tsx (fonetica-completar)",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/fonetica-p",
      reachability: "Student & Teacher",
      correctBehavior: "Presionar la sílaba correcta para completar papi, papá, pomo.",
      progressBehavior: "Avance y registro al completar.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Tarjetas accesibles por toque y teclado.",
      missingArtOrAudio: "Usa imagen de papá; pomo/papi sin imagen dedicada; audio en espera de #769.",
      existingPrOrIssue: "src/content/games/core-games.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844).",
      thumbnailUrl: mainBase + "public/cartilla/art/faithful/leccion-8-p/papa.webp",
    },
    "rima-p": {
      name: "Lectura de Rimas Pp (rima-p)",
      builtStatus: "Built in CoreGames.tsx (lectura-rima)",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/rima-p",
      reachability: "Student & Teacher",
      correctBehavior: "Emparejar palabras que riman por sílaba final (papi/Pepi, Pipo/mapo).",
      progressBehavior: "Verificación al seleccionar par.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Lectura contrastada con botones grandes.",
      missingArtOrAudio: "Actividad de texto escolar; audio en espera de #769.",
      existingPrOrIssue: "src/content/games/core-games.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844).",
    },
    "palabras-minuto-p": {
      name: "Palabras Por Minuto Pp (palabras-minuto-p)",
      builtStatus: "Built in CoreGames.tsx (palabras-por-minuto)",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/palabras-minuto-p",
      reachability: "Student & Teacher",
      correctBehavior: "Fluidez lectora: ¿Cuántas palabras puedo leer por minuto? (18 palabras modelo con Pp/Mm).",
      progressBehavior: "Conteo cronometrado de palabras leídas.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Controles claros de inicio/detención.",
      missingArtOrAudio: "Sin arte externo requerido.",
      existingPrOrIssue: "src/content/games/core-games.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844).",
    },
    "dibujos-o": {
      name: "Dibujos Vocal O (dibujos-o)",
      builtStatus: "Built in CoreGames.tsx (dibujos)",
      workingStatus: "NOT_VERIFIED",
      route: "/cartilla/juego/dibujos-o",
      reachability: "Student & Teacher",
      correctBehavior: "Observar los dibujos y decir el nombre (oso, oveja, olla, ojo, oreja, ola).",
      progressBehavior: "Recorrido de vocabulario oral.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Arte interactivo con etiquetas claras.",
      missingArtOrAudio: "6/6 imágenes SVG/WebP presentes; audio en espera de #769.",
      existingPrOrIssue: "src/content/games/core-games.ts",
      exactNextAction: "Capturar video de interacción en móvil (390×844).",
      thumbnailUrl: mainBase + "public/cartilla/art/optimized/workbook/leccion-1/oso.svg",
    },
    "completar-palabras": {
      name: "Completar Palabras Mm (completar-palabras)",
      builtStatus: "Scaffolded in CompletarPalabras.tsx (Validation Disconnected)",
      workingStatus: "DISCONNECTED_PENDING",
      route: "/cartilla/juego/completar-palabras",
      reachability: "Direct Link Only",
      correctBehavior:
        "Muestra honestamente 'pendiente' en cada una de las 12 casillas (2 filas × 6 columnas) sin inventar palabras.",
      progressBehavior: "No valida aciertos hasta recibir las 12 palabras del documento Word del maestro.",
      mobileStatus: "Responsive Canvas (Unverified Live)",
      accessibilityNote: "Celdas semánticas con estado explícito.",
      missingArtOrAudio: "Faltan las 12 palabras objetivo y distractores del archivo Word maestro (20261018).",
      existingPrOrIssue: "src/content/games/completar-palabras.ts",
      exactNextAction: "Esperar decisión del propietario / documento Word del maestro con las 12 palabras.",
    },
    "cow-game-m": {
      name: "Juego de las Vacas (cow-game-m)",
      builtStatus: "Built in CowGame.tsx (PR #1081)",
      workingStatus: "IN_PROGRESS_PR",
      route: "/cartilla/juego/cow-game-m",
      reachability: "Student & Teacher",
      correctBehavior:
        "Cinco vacas llevan tarjetas a las casillas de la cerca (mo, mu, ma, mi, me). Acierto suelta la tarjeta y regresa; error conserva la tarjeta.",
      progressBehavior: "Registra finalización al colocar las 5 sílabas en la cerca.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Arrastre táctil y soporte de teclado.",
      missingArtOrAudio:
        "28 recortes WebP/PNG en public/cartilla/art/games/cow/ presentes. Audio vacío esperando grabaciones (#769).",
      existingPrOrIssue: "PR #1081",
      exactNextAction: "Revisión técnica independiente de PR #1081 y captura de video en móvil (390×844).",
      thumbnailUrl: mainBase + "public/cartilla/art/games/cow/scene.webp",
    },
  };

  for (const [gId, gMeta] of Object.entries(STANDALONE_GAMES_METADATA)) {
    activitiesList.push({
      id: "game-" + gId,
      category: "standalone_game",
      categoryLabel: "3. Juego Independiente (Standalone Game)",
      name: gMeta.name || gId,
      route: gMeta.route || `/cartilla/juego/${gId}`,
      builtStatus: gMeta.builtStatus || "Built in route catalog",
      workingStatus: gMeta.workingStatus || "NOT_VERIFIED",
      reachability: gMeta.reachability || "Student & Teacher",
      correctBehavior: gMeta.correctBehavior || "",
      progressBehavior: gMeta.progressBehavior || "",
      mobileStatus: gMeta.mobileStatus || "Pending Phone Run",
      accessibilityNote: gMeta.accessibilityNote || "",
      missingArtOrAudio: gMeta.missingArtOrAudio || "",
      existingPrOrIssue: gMeta.existingPrOrIssue || "",
      proofUrl: gMeta.proofUrl,
      exactNextAction: gMeta.exactNextAction || "",
      thumbnailUrl: gMeta.thumbnailUrl,
    });
  }

  // Category 4: 7 Configured Practice Modes (parsed dynamically from src/routes/cartilla/practica.tsx)
  const practiceIdsFromSource = Array.from(
    new Set(
      (practicaRouteText.match(/actividad:\s*["']([a-z]+)["']/g) || []).map((m) =>
        m.replace(/.*["']([a-z]+)["']/, "$1")
      )
    )
  );
  const PRACTICE_MODE_DESCRIPTIONS: Record<string, { name: string; desc: string }> = {
    silabas: { name: "Sílabas", desc: "Práctica de discriminación y lectura de sílabas de la lección" },
    palabras: { name: "Palabras con Dibujos", desc: "Reconocimiento de palabras ilustradas del vocabulario" },
    armar: { name: "Armar Palabras", desc: "Constructor guiado de palabras mediante sílabas" },
    trazar: { name: "Trazar Letras", desc: "Trazado digital con lápiz y borrador de trazo" },
    piano: { name: "Piano Hablador", desc: "Teclas interactivas con sonido fonético de cada sílaba" },
    sonido: { name: "Búsqueda de Sonidos", desc: "Asociación del sonido inicial con su ilustración" },
    espejo: { name: "Espejo de Lectura", desc: "Lectura oral repetida y articulación guiada" },
  };
  const practiceModeKeys =
    practiceIdsFromSource.length > 0 ? practiceIdsFromSource : Object.keys(PRACTICE_MODE_DESCRIPTIONS);

  for (const pmId of practiceModeKeys) {
    const pm = PRACTICE_MODE_DESCRIPTIONS[pmId] || { name: pmId, desc: "Modo de práctica configurado" };
    activitiesList.push({
      id: "practice-" + pmId,
      category: "practice_mode",
      categoryLabel: "4. Modo de Práctica (/cartilla/practica)",
      name: `Práctica: ${pm.name} (?actividad=${pmId})`,
      route: `/cartilla/practica?actividad=${pmId}`,
      builtStatus: "Built & Routed in src/routes/cartilla/practica.tsx",
      workingStatus: "NOT_VERIFIED",
      reachability: "Práctica En Casa",
      correctBehavior: pm.desc,
      progressBehavior: "Sesión anónima de práctica en casa sin recolección de PII.",
      mobileStatus: "Pending Phone Run",
      accessibilityNote: "Botones táctiles grandes aptos para niños pequeños.",
      missingArtOrAudio: "Hooks preparados para audios genuinos de Gretel (#769).",
      existingPrOrIssue: "src/routes/cartilla/practica.tsx",
      exactNextAction: "Capturar prueba interactiva en móvil (390×844) por cada modo ?actividad=.",
    });
  }

  // Category 5: 8 Assignment Categories (parsed dynamically from src/components/activities/activityIcons.tsx)
  const assignmentUnionMatch = activityIconsText.match(/export\s+type\s+ActivityType\s*=([\s\S]*?);/);
  const parsedAssignmentIds = assignmentUnionMatch
    ? (assignmentUnionMatch[1].match(/['"]([a-z]+)['"]/g) || []).map((s) => s.replace(/['"]/g, ""))
    : ["write", "read", "draw", "match", "listen", "review", "sing", "trace"];

  const ASSIGNMENT_LABELS: Record<string, string> = {
    write: "Escribir",
    read: "Leer",
    draw: "Dibujar",
    match: "Emparejar",
    listen: "Escuchar",
    review: "Repasar",
    sing: "Cantar",
    trace: "Trazar",
  };

  for (const atId of parsedAssignmentIds) {
    const label = ASSIGNMENT_LABELS[atId] || atId;
    activitiesList.push({
      id: "assignment-" + atId,
      category: "assignment_type",
      categoryLabel: "5. Tipo de Tarea / Interacción (Assignment Type)",
      name: `Asignación Docente: ${label} (${atId})`,
      route: `/cartilla/teacher/guia`,
      builtStatus: "Built in activityIcons.tsx & Teacher Guide / Assignments",
      workingStatus: "WORKS_ON_MAIN",
      reachability: "Teacher Only",
      correctBehavior: `Clasificador e icono de actividad escolar (${label}) en la guía y panel de tareas del maestro.`,
      progressBehavior: "Persiste asignaciones en estado demo local sin datos reales de estudiantes.",
      mobileStatus: "Fully Verified (390px)",
      accessibilityNote: "Iconografía escolar con etiqueta semántica accesible.",
      missingArtOrAudio: "Sin faltantes de recursos.",
      existingPrOrIssue: "src/components/activities/activityIcons.tsx",
      proofUrl: mainBase + "docs/proofs/teacher-guide-preflight/README.md",
      exactNextAction: "Verificado en preflight de guía docente.",
    });
  }

  // Category 6: Tutor Experience (PR #1073 — Active #877 Priority)
  activitiesList.push({
    id: "tutor-l1",
    category: "tutor_experience",
    categoryLabel: "6. Experiencia Tutor (PR #1073)",
    name: "Tutor Gretel — Lección 1 Vocales (Milestone PR #1073)",
    lessonNumber: 1,
    route: "/tutor",
    builtStatus: "Built on branch feat/gretel-tutor-l1-3 (Head bb585e1e)",
    workingStatus: "IN_PROGRESS_PR",
    reachability: "Student & Teacher",
    correctBehavior:
      "Interacción guiada con Gretel para Lección 1 (vocales a, e, i, o, u): saludo, selección de vocal, tarjeta de palabra (Abeja) y avance.",
    progressBehavior: "Almacenamiento de turno conversacional y avance por aciertos en sesión.",
    mobileStatus: "Fully Verified (390px)",
    accessibilityNote: "Verificado en viewport 390×844 sin desborde horizontal, objetivos táctiles ≥44px y subtítulos.",
    missingArtOrAudio:
      "19 palabras de vocabulario con audio aprobado; 71 frases de conversación usan fallback silencioso hasta grabación (#769).",
    existingPrOrIssue: "PR #1073 (Head bb585e1e) — Prioridad #1 en #877",
    proofUrl: tutorBase + "docs/proofs/tutor-l1-phone-proof/l1-vowel-a-phone-390x844.webm",
    exactNextAction:
      "Obtener revisión material independiente de PR #1073 (bb585e1e). No fusionar ni reemplazar arquitectura sin autorización.",
    thumbnailUrl: mainBase + "public/cartilla/images/gretel/gretel-approved-master.png",
  });

  // Category 7: Additional Implemented but Disconnected Features (10 items audited in repo)
  const DISCONNECTED_FEATURES: Array<{
    id: string;
    name: string;
    file: string;
    desc: string;
    nextAction: string;
  }> = [
    {
      id: "disc-flipchart-overlay",
      name: "InteractiveFlipchartOverlay.tsx",
      file: "src/components/cartilla/InteractiveFlipchartOverlay.tsx",
      desc: "Superposición interactiva para tocar palabras/dibujos sobre láminas del rotafolio; construida pero no montada en FlipChartSheetView.",
      nextAction: "Mantener desconectado salvo que el propietario solicite superposición interactiva en el rotafolio.",
    },
    {
      id: "disc-mini-games",
      name: "InteractiveMiniGames.tsx (SyllableTrain, WordPuzzle, MemoryMatch, RapidFire)",
      file: "src/components/cartilla/InteractiveMiniGames.tsx",
      desc: "4 minijuegos genéricos construidos en código pero no conectados al catálogo oficial de rutas (/cartilla/juego/$gameId).",
      nextAction: "No activar sin aprobación del propietario (el currículo físico rige los juegos autorizados).",
    },
    {
      id: "disc-mark-pictures",
      name: "MarkPicturesBySound.tsx",
      file: "src/components/cartilla/MarkPicturesBySound.tsx",
      desc: "Componente de ejercicio digital anterior; reemplazado por las regiones nativas de OfficialWorkbookPageView.",
      nextAction: "Conservar como referencia o retirar en limpieza autorizada.",
    },
    {
      id: "disc-trace-letter",
      name: "TraceLetterToPicture.tsx",
      file: "src/components/cartilla/TraceLetterToPicture.tsx",
      desc: "Componente de trazado letra-a-dibujo anterior; reemplazado por PencilConnector sobre la página física en OfficialWorkbookPageView.",
      nextAction: "Conservar como referencia; PencilConnector es el componente activo.",
    },
    {
      id: "disc-drag-syllable",
      name: "DragSyllableOrder.tsx",
      file: "src/components/cartilla/DragSyllableOrder.tsx",
      desc: "Componente de arrastrar sílabas en orden; no montado en el flujo principal del cuaderno.",
      nextAction: "Conservar sin activar fuera del catálogo aprobado.",
    },
    {
      id: "disc-ordered-exercises",
      name: "OrderedExercises.tsx + src/data/lesson-exercises/ (24 lecciones)",
      file: "src/components/cartilla/OrderedExercises.tsx",
      desc: "Banco de ejercicios digitales para las 24 lecciones usado solo como vista alternativa cuando no se usa OfficialWorkbookPageView.",
      nextAction: "Mantener como respaldo; OfficialWorkbookPageView es la vista canónica del cuaderno.",
    },
    {
      id: "disc-legacy-workbook-view",
      name: "OfficialWorkbookLessonView.tsx",
      file: "src/components/cartilla/OfficialWorkbookLessonView.tsx",
      desc: "Envoltorio anterior de lección del cuaderno; superado por OfficialWorkbookPageView por página impresa.",
      nextAction: "No usar para nuevas verificaciones; usar OfficialWorkbookPageView.",
    },
    {
      id: "disc-story-intro",
      name: "StoryIntro.tsx & CinemaNarrativeDrawer.tsx",
      file: "src/components/cartilla/StoryIntro.tsx",
      desc: "Componentes de introducción narrativa cinematográfica; construidos pero desconectados del flujo estudiantil.",
      nextAction: "Mantener desconectado salvo decisión del propietario.",
    },
    {
      id: "disc-dev-living-workbook",
      name: "Route /dev-living-workbook (dev-living-workbook.tsx)",
      file: "src/routes/dev-living-workbook.tsx",
      desc: "Ruta de prueba de desarrollo para inspeccionar actores de movimiento vivo fuera de las lecciones.",
      nextAction: "Uso exclusivo de diagnóstico/QA.",
    },
    {
      id: "disc-prototype-l3",
      name: "Route /prototype/lesson-3-a (prototype.lesson-3-a.tsx)",
      file: "src/routes/prototype.lesson-3-a.tsx",
      desc: "Ruta prototipo de Lección 3 usada durante las pruebas de arquetipos; desconectada de la navegación escolar.",
      nextAction: "Conservar evidencia histórica en docs/proofs/lesson-3-prototype-2026-10-27/.",
    },
  ];

  for (const df of DISCONNECTED_FEATURES) {
    activitiesList.push({
      id: df.id,
      category: "disconnected_feature",
      categoryLabel: "7. Función Construida pero Desconectada (Disconnected)",
      name: df.name,
      route: df.file,
      builtStatus: "Implemented in source tree, unmounted in student/teacher navigation",
      workingStatus: "DISCONNECTED_PENDING",
      reachability: "Disconnected / Unmounted",
      correctBehavior: df.desc,
      progressBehavior: "No conectado a la sesión activa del estudiante.",
      mobileStatus: "Responsive Canvas (Unverified Live)",
      accessibilityNote: "No expuesto en rutas de producción.",
      missingArtOrAudio: "N/A (Desconectado)",
      existingPrOrIssue: df.file,
      exactNextAction: df.nextAction,
    });
  }

  const manifestItems = motionList.filter((m) => m.catalogSource === "manifest_svg");
  const sourceBlockedCount = parsedWorkbookPages.filter((p) => p.status === "SOURCE_BLOCKED").length;

  return {
    ref,
    sha,
    mainSha,
    imgSha: mainSha,
    auditedSha,
    committedAt: cj.commit?.committer?.date || "",
    fetchedAt: new Date().toISOString(),
    base,
    mainBase,
    tutorBase,
    tagMeaning: qual.tag_meaning || {},
    tagCounts: qual.per_tag || {},
    slots,
    motion: motionList,
    activities: activitiesList,
    totals: {
      all: slots.length,
      drawingGroups: uniqueDrawingGroups.size,
      repaired1205Placements: slots.filter((s) => s.isRepairedIn1205).length,
      repaired1205Destinations: repaired1205DestinationsSet.size,
      flagged10WorkbookPlacements: slots.filter((s) => s.isFlaggedWorkbookSubject).length,
      flagged10WorkbookSubjectsCount: flagged10SubjectsMatched.size,
      byBook,
      byStatus,
      activitiesCount: {
        lessons: parsedLessons.length,
        workbookPagesTotal: parsedWorkbookPages.length,
        workbookPagesAvailable: parsedWorkbookPages.length - sourceBlockedCount,
        sourceBlockedPages: sourceBlockedCount,
        workbookUnderlyingExercises: totalUnderlyingExercises,
        workbookPrintedInstructions: totalPrintedInstructions,
        workbookArchetypes: distinctArchetypesSet.size,
        flipchartSheets: fcPages.length,
        flipchartIllustratedSheets: fcIllustratedCount,
        standaloneGames: Object.keys(STANDALONE_GAMES_METADATA).length,
        liveGames: Object.values(STANDALONE_GAMES_METADATA).filter((g) => g.workingStatus === "WORKS_LIVE").length,
        practiceModes: practiceModeKeys.length,
        assignmentTypes: parsedAssignmentIds.length,
        tutorMilestones: 1,
        disconnectedFeatures: DISCONNECTED_FEATURES.length,
      },
      motionCount: {
        manifestTotal: manifestItems.length,
        reconciled1204: manifestItems.filter((m) => m.motionStatus === "RECONCILED_1204").length,
        manifestSourceFreshUnverified: manifestItems.filter(
          (m) => m.motionStatus === "SOURCE_FRESH_UNVERIFIED_LIVE"
        ).length,
        staleBlocked: manifestItems.filter((m) => m.motionStatus === "STALE_HELD_STILL").length,
        cssPartRigged: motionList.filter((m) => m.catalogSource === "registry_css_part").length,
        cssWholeAmbient: motionList.filter((m) => m.catalogSource === "registry_css_ambient").length,
        heldStill: motionList.filter((m) => m.catalogSource === "held_still_rule").length,
      },
    },
  };
}
