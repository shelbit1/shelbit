"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      const from = searchParams.get("from") || "/admin/crm/funnel";
      router.push(from);
      router.refresh();
    } catch {
      setError("Не удалось выполнить вход");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(47,174,102,0.18) 0%, transparent 55%)",
        }}
      />

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/60 text-accent">
            <Lock size={20} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Вход в CRM</h1>
            <p className="text-sm text-muted">SHELBIT — административная панель</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm text-muted">
              Логин
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-accent/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-accent/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
