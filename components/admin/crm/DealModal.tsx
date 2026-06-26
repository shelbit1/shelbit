"use client";

import { useCallback, useEffect, useState } from "react";
import { X, MessageSquare, Clock, History, CheckSquare, Trash2 } from "lucide-react";
import type { Deal, DealComment, DealHistoryEntry, DealTask } from "@/types/crm";
import { formatDate, formatRub, getStageMeta } from "@/lib/crm/stages";

type DealModalProps = {
  dealId: number;
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export function DealModal({ dealId, isAdmin, onClose, onUpdated, onDeleted }: DealModalProps) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [history, setHistory] = useState<DealHistoryEntry[]>([]);
  const [comments, setComments] = useState<DealComment[]>([]);
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [tab, setTab] = useState<"info" | "history" | "comments" | "tasks">("info");
  const [commentText, setCommentText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/crm/deals/${dealId}`);
    if (!res.ok) return;
    const data = await res.json();
    setDeal(data.deal);
    setHistory(data.history);
    setComments(data.comments);
    setTasks(data.tasks);
  }, [dealId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await fetch(`/api/crm/deals/${dealId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentText }),
    });
    setCommentText("");
    await load();
    onUpdated();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await fetch(`/api/crm/deals/${dealId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        dueDate: taskDue ? new Date(taskDue).toISOString() : null,
      }),
    });
    setTaskTitle("");
    setTaskDue("");
    await load();
    onUpdated();
  }

  async function toggleTask(taskId: number, completed: boolean) {
    await fetch(`/api/crm/deals/${dealId}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed }),
    });
    await load();
  }

  async function deleteDeal() {
    if (!confirm(`Удалить сделку «${deal?.title}»? Это действие необратимо.`)) {
      return;
    }

    const res = await fetch(`/api/crm/deals/${dealId}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted();
      onClose();
    }
  }

  if (!deal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="rounded-xl bg-surface px-6 py-4 text-muted">Загрузка...</div>
      </div>
    );
  }

  const stageMeta = getStageMeta(deal.stage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{deal.title}</h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: stageMeta.bgColor, color: stageMeta.color }}
              >
                {stageMeta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{deal.address}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={deleteDeal}
                className="rounded-lg border border-red-500/40 p-2 text-red-400 transition-colors hover:bg-red-500/10"
                title="Удалить сделку"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border p-2 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border px-6">
          {(
            [
              ["info", "Информация"],
              ["history", "История"],
              ["comments", "Комментарии"],
              ["tasks", "Задачи"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`border-b-2 px-3 py-3 text-sm transition-colors ${
                tab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "info" && (
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Стоимость", formatRub(deal.price)],
                ["Доходность", deal.yieldPercent ? `${deal.yieldPercent}%` : "—"],
                ["Окупаемость", deal.paybackYears ? `${deal.paybackYears} лет` : "—"],
                ["Площадь", deal.areaSqm ? `${deal.areaSqm} м²` : "—"],
                ["Арендаторы", deal.tenants ?? "—"],
                ["Собственник", deal.owner ?? "—"],
                ["Менеджер", deal.managerName],
                ["Регион", deal.region ?? "—"],
                ["Тип объекта", deal.objectType ?? "—"],
                ["Приоритет", deal.priority],
                ["Вероятность закрытия", `${deal.closeProbability}%`],
                ["Создан", formatDate(deal.createdAt)],
                ["Крайний срок", deal.deadline ? formatDate(deal.deadline) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-background/40 p-3">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === "history" && (
            <ul className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-background/40 p-4 text-sm"
                >
                  <div className="flex items-center gap-2 text-muted">
                    <History size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                    <span>·</span>
                    <span>{item.userName}</span>
                  </div>
                  <p className="mt-2">{item.detail ?? item.action}</p>
                  {item.fromStage && item.toStage && (
                    <p className="mt-1 text-xs text-muted">
                      {getStageMeta(item.fromStage as Deal["stage"]).label} →{" "}
                      {getStageMeta(item.toStage as Deal["stage"]).label}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {tab === "comments" && (
            <div className="space-y-4">
              <form onSubmit={addComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background"
                >
                  Отправить
                </button>
              </form>
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border border-border bg-background/40 p-4 text-sm"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                      <MessageSquare size={13} />
                      {c.userName} · {formatDate(c.createdAt)}
                    </div>
                    {c.body}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-4">
              <form onSubmit={addTask} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Название задачи"
                  className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm"
                />
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background"
                >
                  Добавить
                </button>
              </form>
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={(e) => toggleTask(t.id, e.target.checked)}
                    />
                    <div className="flex-1">
                      <p className={t.completed ? "text-muted line-through" : ""}>{t.title}</p>
                      {t.dueDate && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <Clock size={12} />
                          до {formatDate(t.dueDate)}
                        </p>
                      )}
                    </div>
                    <CheckSquare size={16} className="text-muted" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
