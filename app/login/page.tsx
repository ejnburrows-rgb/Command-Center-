"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setup = params.get("setup") === "1";
  const from = params.get("from") || "/";
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace(from);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Incorrect passphrase.");
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-1 text-lg font-semibold">
        <span className="text-accent">◆</span> Command Center
      </h1>
      <p className="mb-6 text-sm text-slate-400">Enter your passphrase.</p>

      {setup ? (
        <p className="mb-4 rounded-md border border-amber-700/50 bg-amber-950/40 p-3 text-sm text-amber-200">
          No passphrase is configured yet. Set the{" "}
          <code className="text-amber-100">PORTAL_PASSPHRASE</code> environment
          variable, then reload.
        </p>
      ) : null}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Passphrase"
          autoFocus
          className="w-full rounded-md border border-edge bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-ink disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
