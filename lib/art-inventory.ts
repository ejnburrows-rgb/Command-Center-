// Live art inventory. Reads the slot list and flags from the public cartilla-de-gretel repo
// at request time, so the page always matches the repo. Counts are computed here, never typed.
const OWNER = "ejnburrows-rgb";
const REPO = "cartilla-de-gretel";
// Branch shown by default. After the inventory files are merged into the repo's main, change this to "main".
export const DEFAULT_REF = process.env.ART_INVENTORY_REF || "art-inventory-live";
const BASE = "docs/art-inventory";
// Branch holding the pictures the app really loads (the draft). Images are read from its latest commit.
// The draft branch art/owner-arco-elefante-2026-10-22 was merged into main and deleted
// (verified 2026-10-23: 240/241 app-loaded files byte-identical on main, 1 updated, 0 missing),
// so main is now the exact app-loaded source. Override with ART_INVENTORY_IMAGE_REF if the app moves.
export const IMAGE_REF = process.env.ART_INVENTORY_IMAGE_REF || "main";

export type Orig =
  | { kind: "scan"; src: string; sw: number; box: [number, number, number, number] }
  | { kind: "image"; src: string; whole_page?: boolean }
  | null;
export type Slot = {
  id: string; artwork_id: string; book: string; page: number; label: string; role: string; live: string;
  his: boolean; was_flagged: boolean; flag_reason: string; orig: Orig;
  book_page: { src: string; size: [number, number]; circle: { box: [number, number, number, number]; method: string; score: number | null } | null };
  status: "OK" | "HIS NEW PICTURE" | "CLEANED (was flagged)" | "FLAGGED"; note: string;
  app: string; tags: string[]; metrics: Record<string, any>; appNote: string; notFinished: boolean;
};
export type Inventory = {
  ref: string; sha: string; imgSha: string; auditedSha: string; tagMeaning: Record<string, string>; tagCounts: Record<string, number>; committedAt: string; fetchedAt: string; base: string; slots: Slot[];
  totals: { all: number; byBook: Record<string, number>; byStatus: Record<string, number> };
};

const headers = (): Record<string, string> => {
  const t = process.env.GITHUB_TOKEN_READ; // public repo: token only raises the rate limit
  return { "User-Agent": "nbo-hub-art-inventory", Accept: "application/vnd.github+json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

export async function loadInventory(refIn?: string): Promise<Inventory> {
  const ref = refIn && /^[A-Za-z0-9._\/-]{1,120}$/.test(refIn) && !refIn.includes("..") ? refIn : DEFAULT_REF;
  const c = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits/${encodeURIComponent(ref).replace(/%2F/g, "/")}`, { headers: headers(), next: { revalidate: process.env.GITHUB_TOKEN_READ ? 60 : 120 } });
  if (!c.ok) throw new Error(`GitHub commit lookup failed for "${ref}" (${c.status})`);
  const cj = await c.json();
  const sha: string = cj.sha;
  const base = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${sha}/`;
  const get = async (p: string) => {
    const r = await fetch(base + p, { next: { revalidate: 3600 } }); // content at a sha never changes
    if (!r.ok) throw new Error(`Could not read ${p} at ${sha.slice(0, 7)} (${r.status})`);
    return r.json();
  };
  const ic = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits/${IMAGE_REF}`, { headers: headers(), next: { revalidate: process.env.GITHUB_TOKEN_READ ? 60 : 120 } });
  if (!ic.ok) throw new Error(`GitHub commit lookup failed for image branch (${ic.status})`);
  const imgSha: string = (await ic.json()).sha;
  const imgBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${imgSha}/`;
  const [render, flags, appl, qual] = await Promise.all([get(`${BASE}/slots-render.json`), get(`${BASE}/still-flagged.json`), get(`${BASE}/app-loaded.json`), get(`${BASE}/quality.json`)]);
  const still: Record<string, string> = flags.still_flagged || {};
  const cnotes: Record<string, string> = flags.cleaned_notes || {};
  const slots: Slot[] = render.map((x: any) => {
    const status = x.was_flagged ? (x.id in still ? "FLAGGED" : "CLEANED (was flagged)") : x.his ? "HIS NEW PICTURE" : "OK";
    const note = x.id in still ? still[x.id] : x.was_flagged ? cnotes[x.id] || `Was: ${x.flag_reason}` : x.flag_reason || (x.orig?.whole_page ? "WHOLE BOOK PAGE (no crop on file)" : "");
    const a = appl.slots?.[x.id] || {}, q = qual.slots?.[x.id] || { tags: [], metrics: {} };
    const app: string = a.app_loads || x.live;
    return { ...x, app, tags: q.tags as string[], metrics: q.metrics, appNote: a.same_file_as_shown === false ? "App loads a different file than the canonical one" : "", notFinished: (q.tags as string[]).length > 0, book_page: x.book_page ?? { src: "", size: [0, 0], circle: null }, status, note, book: x.book === "flip_chart" ? "Flip Chart" : "Workbook" };
  });
  const byBook: Record<string, number> = {}, byStatus: Record<string, number> = {};
  for (const s of slots) { byBook[s.book] = (byBook[s.book] || 0) + 1; byStatus[s.status] = (byStatus[s.status] || 0) + 1; }
  const sum = Object.values(byStatus).reduce((a, b) => a + b, 0);
  if (sum !== slots.length || Object.values(byBook).reduce((a, b) => a + b, 0) !== slots.length) throw new Error("Inventory totals do not add up");
  return { ref, sha, committedAt: cj.commit?.committer?.date || "", fetchedAt: new Date().toISOString(), base: imgBase, imgSha, auditedSha: String(qual.commit || ""), tagMeaning: qual.tag_meaning || {}, tagCounts: qual.per_tag || {}, slots, totals: { all: slots.length, byBook, byStatus } };
}
