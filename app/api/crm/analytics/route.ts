import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb, mapDealRow } from "@/lib/db";
import { getStageMeta, STAGES } from "@/lib/crm/stages";
import type { DealStage } from "@/types/crm";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const database = getDb();
  const rows = database
    .prepare(
      `SELECT d.*, (SELECT COUNT(*) FROM deal_comments c WHERE c.deal_id = d.id) as comment_count FROM deals d`
    )
    .all() as Parameters<typeof mapDealRow>[0][];

  const deals = rows.map(mapDealRow);
  const totalCount = deals.length;
  const totalValue = deals.reduce((s, d) => s + d.price, 0);
  const avgYield =
    deals.filter((d) => d.yieldPercent).reduce((s, d) => s + (d.yieldPercent ?? 0), 0) /
    (deals.filter((d) => d.yieldPercent).length || 1);

  const funnelStages: DealStage[] = [
    "new",
    "review",
    "negotiation",
    "contract",
    "payment",
    "closed",
  ];

  const stageCounts = funnelStages.map((stage) => ({
    stage,
    label: getStageMeta(stage).label,
    count: deals.filter((d) => d.stage === stage).length,
  }));

  const conversions = funnelStages.slice(0, -1).map((stage, i) => {
    const current = stageCounts[i].count;
    const next = stageCounts[i + 1].count;
    return {
      from: getStageMeta(stage).label,
      to: getStageMeta(funnelStages[i + 1]).label,
      rate: current ? Math.round((next / current) * 100) : 0,
    };
  });

  const managerStats = Object.values(
    deals.reduce<
      Record<string, { name: string; count: number; closed: number; total: number }>
    >((acc, deal) => {
      if (!acc[deal.managerName]) {
        acc[deal.managerName] = { name: deal.managerName, count: 0, closed: 0, total: 0 };
      }
      acc[deal.managerName].count += 1;
      acc[deal.managerName].total += deal.price;
      if (deal.stage === "closed") acc[deal.managerName].closed += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.closed - a.closed);

  const rejections = deals
    .filter((d) => d.stage === "rejected")
    .reduce<Record<string, number>>((acc, d) => {
      const reason = d.rejectionReason ?? "Не указана";
      acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    }, {});

  const now = Date.now();
  const slaAlerts = deals
    .filter((d) => !["closed", "rejected"].includes(d.stage))
    .map((deal) => {
      const meta = STAGES.find((s) => s.id === deal.stage);
      const daysOnStage =
        (now - new Date(deal.stageChangedAt).getTime()) / (1000 * 60 * 60 * 24);
      const overdueTask = database
        .prepare(
          `SELECT COUNT(*) as c FROM deal_tasks
           WHERE deal_id = ? AND completed = 0 AND due_date < ?`
        )
        .get(deal.id, new Date().toISOString()) as { c: number };

      return {
        dealId: deal.id,
        title: deal.title,
        stage: deal.stage,
        daysOnStage: Math.floor(daysOnStage),
        slaExceeded: meta ? daysOnStage > meta.slaDays : false,
        overdueTasks: overdueTask.c,
      };
    })
    .filter((a) => a.slaExceeded || a.overdueTasks > 0);

  return NextResponse.json({
    totalCount,
    totalValue,
    avgCheck: totalCount ? totalValue / totalCount : 0,
    avgYield,
    stageCounts,
    conversions,
    managerStats,
    rejections,
    slaAlerts,
    forecastValue: deals
      .filter((d) => !["closed", "rejected"].includes(d.stage))
      .reduce((s, d) => s + d.price * (d.closeProbability / 100), 0),
  });
}
