import { getAllWork, pickToday, type WorkItem } from "@/lib/work";
import { hasReadToken } from "@/lib/github";

// Read live on every request — nothing cached, nothing prerendered.
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  if (!hasReadToken()) {
    return (
      <Notice
        title="Almost there"
        body="Set GITHUB_TOKEN_READ (a read-only fine-grained token for your CRM repos) and reload. That's what powers this screen."
      />
    );
  }

  let today: WorkItem | null = null;
  let errors: { repoLabel: string; message: string }[] = [];
  let total = 0;
  try {
    const { items, errors: errs } = await getAllWork();
    today = pickToday(items);
    errors = errs;
    total = items.filter((i) => !i.blocked).length;
  } catch (err: unknown) {
    return (
      <Notice
        title="Couldn't reach GitHub"
        body={err instanceof Error ? err.message : String(err)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-sm uppercase tracking-widest text-slate-500">Today</h1>
        <p className="text-slate-400">Your one highest-priority unblocked item.</p>
      </div>

      {today ? <TodayCard item={today} remaining={total - 1} /> : <AllClear />}

      {errors.length > 0 ? (
        <div className="mt-6 rounded-md border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
          <p className="mb-1 font-medium">Some repos couldn&apos;t be read:</p>
          <ul className="list-disc pl-4">
            {errors.map((e) => (
              <li key={e.repoLabel}>
                <span className="font-medium">{e.repoLabel}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TodayCard({ item, remaining }: { item: WorkItem; remaining: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-edge bg-panel p-6 transition hover:border-accent"
    >
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="rounded bg-ink px-2 py-0.5 text-slate-300">
          {item.repoLabel}
        </span>
        <span className="text-slate-500">
          {item.isPR ? "Pull request" : "Issue"} #{item.number}
        </span>
        {item.priorityRank > 0 ? (
          <span className="rounded bg-accent/20 px-2 py-0.5 text-accent">
            priority
          </span>
        ) : null}
      </div>
      <h2 className="text-lg font-semibold leading-snug">{item.title}</h2>
      {item.labels.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.labels.map((l) => (
            <span
              key={l}
              className="rounded-full border border-edge px-2 py-0.5 text-[11px] text-slate-400"
            >
              {l}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-4 text-xs text-slate-500">
        Updated {new Date(item.updatedAt).toLocaleDateString()} ·{" "}
        {remaining > 0
          ? `${remaining} other open item${remaining === 1 ? "" : "s"} waiting`
          : "nothing else in the queue"}
      </p>
    </a>
  );
}

function AllClear() {
  return (
    <div className="rounded-xl border border-edge bg-panel p-6 text-slate-400">
      <h2 className="text-lg font-semibold text-slate-200">All clear 🎉</h2>
      <p className="mt-1 text-sm">
        No open, unblocked issues or PRs across your repos right now.
      </p>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-edge bg-panel p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
    </div>
  );
}
