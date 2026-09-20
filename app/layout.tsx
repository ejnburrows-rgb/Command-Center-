import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Private developer command center — live GitHub, repo-as-backend.",
};

// Nav links. Only Today is built in Phase 1; the rest arrive in later phases.
const NAV = [
  { href: "/", label: "Today" },
  { href: "/crm-core/index.html", label: "CRM Core" },
  { href: "/work", label: "Work", soon: true },
  { href: "/prompts", label: "Prompts", soon: true },
  { href: "/research", label: "Research", soon: true },
  { href: "/decisions", label: "Decisions", soon: true },
  { href: "/docs", label: "Docs", soon: true },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-edge bg-panel/60">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-semibold tracking-tight">
                <span className="text-accent">◆</span> Command Center
              </Link>
              <nav className="flex gap-3 text-sm">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={
                      n.soon
                        ? "text-slate-500"
                        : "text-slate-200 hover:text-accent"
                    }
                  >
                    {n.label}
                    {n.soon ? (
                      <span className="ml-1 text-[10px] text-slate-600">soon</span>
                    ) : null}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
