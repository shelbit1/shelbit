import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb, mapDealRow } from "@/lib/db";
import { getStageMeta } from "@/lib/crm/stages";
import type { DealStage } from "@/types/crm";

function buildDealsQuery(session: Awaited<ReturnType<typeof requireAuth>>, searchParams: URLSearchParams) {
  const database = getDb();
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (session?.role === "manager" && session.userId) {
    conditions.push("d.manager_id = @managerId");
    params.managerId = session.userId;
  }

  const manager = searchParams.get("manager");
  if (manager) {
    conditions.push("d.manager_name = @manager");
    params.manager = manager;
  }

  const region = searchParams.get("region");
  if (region) {
    conditions.push("d.region = @region");
    params.region = region;
  }

  const objectType = searchParams.get("objectType");
  if (objectType) {
    conditions.push("d.object_type = @objectType");
    params.objectType = objectType;
  }

  const stage = searchParams.get("stage");
  if (stage) {
    conditions.push("d.stage = @stage");
    params.stage = stage;
  }

  const priority = searchParams.get("priority");
  if (priority) {
    conditions.push("d.priority = @priority");
    params.priority = priority;
  }

  const priceMin = searchParams.get("priceMin");
  if (priceMin) {
    conditions.push("d.price >= @priceMin");
    params.priceMin = Number(priceMin);
  }

  const priceMax = searchParams.get("priceMax");
  if (priceMax) {
    conditions.push("d.price <= @priceMax");
    params.priceMax = Number(priceMax);
  }

  const yieldMin = searchParams.get("yieldMin");
  if (yieldMin) {
    conditions.push("d.yield_percent >= @yieldMin");
    params.yieldMin = Number(yieldMin);
  }

  const q = searchParams.get("q");
  if (q) {
    conditions.push(
      "(d.title LIKE @q OR d.address LIKE @q OR d.owner LIKE @q OR d.tenants LIKE @q)"
    );
    params.q = `%${q}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = database
    .prepare(
      `SELECT d.*, (SELECT COUNT(*) FROM deal_comments c WHERE c.deal_id = d.id) as comment_count
       FROM deals d ${where} ORDER BY d.updated_at DESC`
    )
    .all(params) as Parameters<typeof mapDealRow>[0][];

  return rows.map(mapDealRow);
}

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = buildDealsQuery(session, request.nextUrl.searchParams);
  const totalValue = deals.reduce((sum, d) => sum + d.price, 0);
  const totalCount = deals.length;

  const stageStats = deals.reduce<
    Record<string, { count: number; total: number }>
  >((acc, deal) => {
    if (!acc[deal.stage]) acc[deal.stage] = { count: 0, total: 0 };
    acc[deal.stage].count += 1;
    acc[deal.stage].total += deal.price;
    return acc;
  }, {});

  const stages = Object.entries(stageStats).map(([stage, stat]) => {
    const meta = getStageMeta(stage as DealStage);
    return {
      stage,
      label: meta.label,
      color: meta.color,
      count: stat.count,
      total: stat.total,
      avgCheck: stat.count ? stat.total / stat.count : 0,
      percent: totalCount ? Math.round((stat.count / totalCount) * 100) : 0,
    };
  });

  const funnel = ["new", "review", "negotiation", "contract", "payment", "closed"].map(
    (stage) => ({
      stage,
      label: getStageMeta(stage as DealStage).label,
      count: stageStats[stage]?.count ?? 0,
    })
  );

  const managers = getDb()
    .prepare("SELECT DISTINCT manager_name FROM deals ORDER BY manager_name")
    .all() as { manager_name: string }[];

  const regions = getDb()
    .prepare("SELECT DISTINCT region FROM deals WHERE region IS NOT NULL ORDER BY region")
    .all() as { region: string }[];

  const objectTypes = getDb()
    .prepare(
      "SELECT DISTINCT object_type FROM deals WHERE object_type IS NOT NULL ORDER BY object_type"
    )
    .all() as { object_type: string }[];

  const forecastValue = deals
    .filter((d) => !["closed", "rejected"].includes(d.stage))
    .reduce((sum, d) => sum + d.price * (d.closeProbability / 100), 0);

  return NextResponse.json({
    deals,
    stages,
    funnel,
    summary: {
      totalCount,
      totalValue,
      avgCheck: totalCount ? totalValue / totalCount : 0,
      forecastValue,
    },
    filters: {
      managers: managers.map((m) => m.manager_name),
      regions: regions.map((r) => r.region),
      objectTypes: objectTypes.map((o) => o.object_type),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();
  const database = getDb();

  const result = database
    .prepare(
      `INSERT INTO deals (
        title, address, price, manager_id, manager_name, stage, priority,
        object_type, region, yield_percent, payback_years, area_sqm, tenants,
        owner, deadline, close_probability, created_at, updated_at, stage_changed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      body.title,
      body.address,
      body.price,
      session.userId ?? null,
      session.name ?? session.username ?? "—",
      body.stage ?? "new",
      body.priority ?? "medium",
      body.objectType ?? null,
      body.region ?? null,
      body.yieldPercent ?? null,
      body.paybackYears ?? null,
      body.areaSqm ?? null,
      body.tenants ?? null,
      body.owner ?? null,
      body.deadline ?? null,
      body.closeProbability ?? getStageMeta(body.stage ?? "new").closeProbability,
      now,
      now,
      now
    );

  const dealId = Number(result.lastInsertRowid);

  database
    .prepare(
      `INSERT INTO deal_history (deal_id, user_id, user_name, action, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(dealId, session.userId, session.name ?? "—", "created", "Объект создан", now);

  const row = database
    .prepare(
      `SELECT d.*, 0 as comment_count FROM deals d WHERE d.id = ?`
    )
    .get(dealId) as Parameters<typeof mapDealRow>[0];

  return NextResponse.json({ deal: mapDealRow(row) });
}
