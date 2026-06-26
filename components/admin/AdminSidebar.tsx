"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Kanban,
  Home,
} from "lucide-react";
import { useState } from "react";

const CRM_LINKS = [
  { href: "/admin/crm/funnel", label: "Воронка сделок", icon: Kanban },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [crmOpen, setCrmOpen] = useState(true);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          SHEL<span className="text-accent">BIT</span>
        </Link>
        <p className="mt-1 text-xs text-muted">Админ-панель</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <Home size={16} />
          На сайт
        </Link>

        <div>
          <button
            type="button"
            onClick={() => setCrmOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background/60"
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard size={16} className="text-accent" />
              CRM
            </span>
            <ChevronDown
              size={16}
              className={`text-muted transition-transform ${crmOpen ? "rotate-180" : ""}`}
            />
          </button>

          {crmOpen && (
            <ul className="mt-1 space-y-0.5 pl-2">
              {CRM_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-muted hover:bg-background/60 hover:text-foreground"
                      }`}
                    >
                      <link.icon size={15} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
