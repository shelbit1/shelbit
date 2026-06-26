"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Search,
  BarChart3,
  Kanban,
  MessageSquare,
  AlertTriangle,
  GripVertical,
  Plus,
} from "lucide-react";
import type { Deal, DealStage } from "@/types/crm";
import {
  STAGES,
  FUNNEL_STAGES,
  formatDate,
  formatRub,
  getStageMeta,
} from "@/lib/crm/stages";
import { DealModal } from "./DealModal";
import { CreateDealModal } from "./CreateDealModal";

type StageStat = {
  stage: string;
  label: string;
  color: string;
  count: number;
  total: number;
  avgCheck: number;
  percent: number;
};

type FunnelItem = { stage: string; label: string; count: number };

type Analytics = {
  totalCount: number;
  totalValue: number;
  avgCheck: number;
  avgYield: number;
  forecastValue: number;
  conversions: { from: string; to: string; rate: number }[];
  managerStats: { name: string; count: number; closed: number; total: number }[];
  rejections: Record<string, number>;
  slaAlerts: {
    dealId: number;
    title: string;
    stage: string;
    daysOnStage: number;
    slaExceeded: boolean;
    overdueTasks: number;
  }[];
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

function DealCardContent({ deal, onClick }: { deal: Deal; onClick?: () => void }) {
  const overdue =
    deal.deadline && new Date(deal.deadline) < new Date() && deal.stage !== "closed";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-border bg-background/70 p-3 text-sm shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{deal.title}</p>
          <p className="mt-0.5 text-xs text-muted">{deal.address}</p>
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
            deal.priority === "high"
              ? "bg-red-500/15 text-red-400"
              : deal.priority === "medium"
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-white/5 text-muted"
          }`}
        >
          {PRIORITY_LABELS[deal.priority]}
        </span>
      </div>

      <p className="mt-2 font-medium text-accent">{formatRub(deal.price)}</p>

      <div className="mt-2 space-y-1 text-xs text-muted">
        <p>Менеджер: {deal.managerName}</p>
        <p>Создан: {formatDate(deal.createdAt)}</p>
        {deal.deadline && (
          <p className={overdue ? "text-red-400" : ""}>
            Следующее действие: {formatDate(deal.deadline)}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={12} />
          {deal.commentCount}
        </span>
        <span>{getStageMeta(deal.stage).label}</span>
      </div>
    </div>
  );
}

function DraggableDealCard({
  deal,
  onOpen,
}: {
  deal: Deal;
  onOpen: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `deal-${deal.id}`,
    data: { dealId: deal.id, stage: deal.stage },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        className="absolute left-1 top-3 z-10 cursor-grab text-muted active:cursor-grabbing"
        {...listeners}
        {...attributes}
        aria-label="Перетащить"
      >
        <GripVertical size={14} />
      </button>
      <div className="pl-4">
        <DealCardContent deal={deal} onClick={() => onOpen(deal.id)} />
      </div>
    </div>
  );
}

function StageColumn({
  stageId,
  label,
  color,
  deals,
  onOpen,
}: {
  stageId: DealStage;
  label: string;
  color: string;
  deals: Deal[];
  onOpen: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div
        className="mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium"
        style={{ color, background: `${color}18` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
        <span className="ml-auto text-xs opacity-80">{deals.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[420px] flex-1 space-y-3 rounded-xl border p-2 transition-colors ${
          isOver ? "border-accent/50 bg-accent/5" : "border-border bg-surface/40"
        }`}
      >
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export function FunnelDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stageStats, setStageStats] = useState<StageStat[]>([]);
  const [funnel, setFunnel] = useState<FunnelItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    managers: string[];
    regions: string[];
    objectTypes: string[];
  }>({ managers: [], regions: [], objectTypes: [] });
  const [summary, setSummary] = useState({ totalCount: 0, totalValue: 0, forecastValue: 0 });
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tab, setTab] = useState<"kanban" | "analytics">("kanban");
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [manager, setManager] = useState("");
  const [region, setRegion] = useState("");
  const [objectType, setObjectType] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadDeals = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (manager) params.set("manager", manager);
    if (region) params.set("region", region);
    if (objectType) params.set("objectType", objectType);
    if (stage) params.set("stage", stage);
    if (priority) params.set("priority", priority);

    const res = await fetch(`/api/crm/deals?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setDeals(data.deals);
    setStageStats(data.stages);
    setFunnel(data.funnel);
    setSummary(data.summary);
    setFilterOptions(data.filters);
  }, [q, manager, region, objectType, stage, priority]);

  const loadAnalytics = useCallback(async () => {
    const res = await fetch("/api/crm/analytics");
    if (!res.ok) return;
    setAnalytics(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "admin") setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDeals(), loadAnalytics()]).finally(() => setLoading(false));
  }, [loadDeals, loadAnalytics]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    for (const s of STAGES) map[s.id] = [];
    for (const deal of deals) {
      if (!map[deal.stage]) map[deal.stage] = [];
      map[deal.stage].push(deal);
    }
    return map;
  }, [deals]);

  async function moveDeal(dealId: number, newStage: DealStage) {
    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (res.ok) {
      await Promise.all([loadDeals(), loadAnalytics()]);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const dealId = Number(String(active.id).replace("deal-", ""));
    const fromStage = active.data.current?.stage as DealStage;
    const toStage = over.id as DealStage;

    if (fromStage !== toStage && STAGES.some((s) => s.id === toStage)) {
      moveDeal(dealId, toStage);
    }
  }

  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="border-b border-border bg-surface/50 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Воронка сделок</h1>
            <p className="text-sm text-muted">
              {summary.totalCount} объектов · {formatRub(summary.totalValue)} · прогноз{" "}
              {formatRub(summary.forecastValue)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
            >
              <Plus size={16} />
              Новая сделка
            </button>

            <div className="flex rounded-xl border border-border bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setTab("kanban")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                tab === "kanban" ? "bg-accent text-background" : "text-muted"
              }`}
            >
              <Kanban size={16} />
              Канбан
            </button>
            <button
              type="button"
              onClick={() => setTab("analytics")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                tab === "analytics" ? "bg-accent text-background" : "text-muted"
              }`}
            >
              <BarChart3 size={16} />
              Аналитика
            </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск: адрес, название, собственник, арендатор..."
              className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm"
            />
          </div>

          <select
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <option value="">Менеджер</option>
            {filterOptions.managers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <option value="">Регион</option>
            {filterOptions.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={objectType}
            onChange={(e) => setObjectType(e.target.value)}
            className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <option value="">Тип объекта</option>
            {filterOptions.objectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <option value="">Статус</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <option value="">Приоритет</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-muted">Загрузка...</div>
      ) : tab === "analytics" && analytics ? (
        <div className="grid flex-1 gap-4 p-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="font-display text-lg font-semibold">Общие показатели</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <dt className="text-muted">Объектов</dt>
                <dd className="text-xl font-bold">{analytics.totalCount}</dd>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <dt className="text-muted">Общая стоимость</dt>
                <dd className="text-xl font-bold">{formatRub(analytics.totalValue)}</dd>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <dt className="text-muted">Средний чек</dt>
                <dd className="text-xl font-bold">{formatRub(analytics.avgCheck)}</dd>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <dt className="text-muted">Средняя доходность</dt>
                <dd className="text-xl font-bold">{analytics.avgYield.toFixed(1)}%</dd>
              </div>
              <div className="col-span-2 rounded-xl border border-border bg-background/40 p-3">
                <dt className="text-muted">Прогнозируемый денежный поток</dt>
                <dd className="text-xl font-bold text-accent">
                  {formatRub(analytics.forecastValue)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="font-display text-lg font-semibold">Конверсия между этапами</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {analytics.conversions.map((c) => (
                <li
                  key={`${c.from}-${c.to}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
                >
                  <span>
                    {c.from} → {c.to}
                  </span>
                  <span className="font-semibold text-accent">{c.rate}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="font-display text-lg font-semibold">Менеджеры</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {analytics.managerStats.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
                >
                  <span>{m.name}</span>
                  <span className="text-muted">
                    {m.closed} закрыто / {m.count} всего
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="font-display text-lg font-semibold">Уведомления и SLA</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {analytics.slaAlerts.length === 0 ? (
                <li className="text-muted">Нет просроченных объектов</li>
              ) : (
                analytics.slaAlerts.map((a) => (
                  <li
                    key={a.dealId}
                    className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>
                      {a.title}: {a.daysOnStage} дн. на этапе
                      {a.overdueTasks > 0 ? ` · ${a.overdueTasks} просроч. задач` : ""}
                    </span>
                  </li>
                ))
              )}
            </ul>

            {Object.keys(analytics.rejections).length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold">Причины отказов</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {Object.entries(analytics.rejections).map(([reason, count]) => (
                    <li key={reason}>
                      {reason}: {count}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Воронка слева */}
          <aside className="hidden w-56 shrink-0 border-r border-border bg-surface/30 p-4 xl:block">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Воронка</h2>
            <ul className="mt-4 space-y-3">
              {funnel.map((item, i) => (
                <li key={item.stage}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${(item.count / maxFunnel) * 100}%` }}
                    />
                  </div>
                  {i < funnel.length - 1 && (
                    <p className="my-1 text-center text-xs text-muted">↓</p>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Верхняя панель этапов */}
            <div className="overflow-x-auto border-b border-border p-4">
              <div className="flex min-w-max gap-3">
                {stageStats.map((stat) => (
                  <div
                    key={stat.stage}
                    className="w-52 rounded-xl border border-border bg-surface/70 p-4"
                    style={{ borderTopColor: stat.color, borderTopWidth: 3 }}
                  >
                    <p className="text-sm font-medium" style={{ color: stat.color }}>
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted">объектов</p>
                    <p className="mt-2 text-sm font-medium">{formatRub(stat.total)}</p>
                    <p className="text-xs text-muted">
                      ср. чек {formatRub(stat.avgCheck)} · {stat.percent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Канбан */}
            <DndContext
              sensors={sensors}
              onDragStart={(e) => {
                const dealId = Number(String(e.active.id).replace("deal-", ""));
                setActiveDeal(deals.find((d) => d.id === dealId) ?? null);
              }}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 overflow-x-auto p-4">
                <div className="flex min-w-max gap-4">
                  {STAGES.map((stageMeta) => (
                    <StageColumn
                      key={stageMeta.id}
                      stageId={stageMeta.id}
                      label={stageMeta.label}
                      color={stageMeta.color}
                      deals={dealsByStage[stageMeta.id] ?? []}
                      onOpen={setSelectedDealId}
                    />
                  ))}
                </div>
              </div>

              <DragOverlay>
                {activeDeal ? (
                  <div className="w-72 opacity-90">
                    <DealCardContent deal={activeDeal} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      )}

      {selectedDealId && (
        <DealModal
          dealId={selectedDealId}
          isAdmin={isAdmin}
          onClose={() => setSelectedDealId(null)}
          onUpdated={() => {
            loadDeals();
            loadAnalytics();
          }}
          onDeleted={() => {
            loadDeals();
            loadAnalytics();
          }}
        />
      )}

      {showCreate && (
        <CreateDealModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            loadDeals();
            loadAnalytics();
          }}
        />
      )}
    </div>
  );
}
