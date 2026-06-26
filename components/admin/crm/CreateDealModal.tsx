"use client";

import { useState } from "react";
import { X } from "lucide-react";

type CreateDealModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:border-accent/50";

export function CreateDealModal({ onClose, onCreated }: CreateDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    region: "",
    objectType: "ГАБ",
    priority: "medium",
    tenants: "",
    owner: "",
    deadline: "",
    yieldPercent: "",
    paybackYears: "",
    areaSqm: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          address: form.address.trim(),
          price: Number(form.price.replace(/\s/g, "")),
          region: form.region.trim() || null,
          objectType: form.objectType || null,
          priority: form.priority,
          tenants: form.tenants.trim() || null,
          owner: form.owner.trim() || null,
          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : null,
          yieldPercent: form.yieldPercent ? Number(form.yieldPercent) : null,
          paybackYears: form.paybackYears ? Number(form.paybackYears) : null,
          areaSqm: form.areaSqm ? Number(form.areaSqm) : null,
          stage: "new",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось создать сделку");
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-bold">Новая сделка</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto p-6">
          <div>
            <label className="mb-1 block text-xs text-muted">Название *</label>
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Пятёрочка"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Адрес *</label>
            <input
              required
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="г. Тула, ул. Советская, 12"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Стоимость, ₽ *</label>
              <input
                required
                type="number"
                min={0}
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="25000000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Регион</label>
              <input
                className={inputClass}
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Тип объекта</label>
              <select
                className={inputClass}
                value={form.objectType}
                onChange={(e) => setForm({ ...form, objectType: e.target.value })}
              >
                <option value="ГАБ">ГАБ</option>
                <option value="Земля">Земля</option>
                <option value="Стройка">Стройка</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Приоритет</label>
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Арендатор</label>
              <input
                className={inputClass}
                value={form.tenants}
                onChange={(e) => setForm({ ...form, tenants: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Собственник</label>
              <input
                className={inputClass}
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Крайний срок</label>
            <input
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
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
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Создание..." : "Создать сделку"}
          </button>
        </form>
      </div>
    </div>
  );
}
