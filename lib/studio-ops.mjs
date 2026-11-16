/** Read-only project brief generated strictly from the existing /api/hub GitHub snapshots. */
export function summarizeOps(query, projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return 'GitHub project evidence is unavailable. No project status can be confirmed. Open /overview to retry. This is not an autonomous coding agent.';
  }
  const q = String(query || '').toLowerCase();
  const aliases = {
    'cartilla-de-gretel': ['cartilla', 'gretel', 'workbook', 'flip chart'],
    'lany-books-web': ['lany', 'storefront', 'bookstore'],
    'Command-Center-': ['command center', 'operations hub', 'nbo', 'agent studio'],
  };
  const named = projects.filter(p => {
    const matches = [p.name, p.slug, ...(aliases[p.slug] || [])];
    return matches.some(x => typeof x === 'string' && x.length > 2 && q.includes(x.toLowerCase()));
  });
  const chosen = named.length ? named : projects;
  const out = chosen.slice(0, 8).map(p => {
    const label = String(p.name || p.slug || 'Unnamed repository');
    if (p.accessible === false || (p.issues == null && p.prs == null)) {
      return `${label}\nSource unavailable or stale; counts cannot be confirmed.\n${p.url || ''}`.trim();
    }
    const issues = Number.isFinite(p.issues) ? `${p.issues} open issues` : 'issue count unknown';
    const prs = Number.isFinite(p.prs) ? `${p.prs} open pull requests` : 'PR count unknown';
    const freshness = p.stale ? 'STALE snapshot — verify before acting' : `Snapshot ${p.fetchedAt || 'time unknown'}`;
    const items = Array.isArray(p.items) ? p.items.slice(0, 4).map(i => `• #${i.number} ${i.title} (${i.kind === 'pr' ? 'PR' : 'issue'})${i.url ? ` — ${i.url}` : ''}`).join('\n') : '';
    return `${label}\n${issues} · ${prs}\n${freshness}${items ? `\nRecent work:\n${items}` : ''}\n${p.url || ''}`.trim();
  });
  return `READ-ONLY GITHUB EVIDENCE\n\n${out.join('\n\n')}\n\nThis is not an autonomous coding agent. It reports the existing public GitHub feed without inventing worker activity. Open Project Operations for the full task board.`;
}
