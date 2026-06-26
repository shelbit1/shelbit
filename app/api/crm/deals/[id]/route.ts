import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb, mapDealRow } from "@/lib/db";
import { getStageMeta } from "@/lib/crm/stages";
import type { DealStage } from "@/types/crm";

type RouteParams = { params: { id: string } };

function getDealForSession(id: number, session: NonNullable<Awaited<ReturnType<typeof requireAuth>>>) {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT d.*, (SELECT COUNT(*) FROM deal_comments c WHERE c.deal_id = d.id) as comment_count
       FROM deals d WHERE d.id = ?`
    )
    .get(id) as Parameters<typeof mapDealRow>[0] | undefined;

  if (!row) return null;

  const deal = mapDealRow(row);
  if (session.role === "manager" && deal.managerId !== session.userId) {
    return null;
  }

  return deal;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const deal = getDealForSession(id, session);
  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const database = getDb();

  const history = database
    .prepare(
      `SELECT id, deal_id, user_name, action, detail, from_stage, to_stage, created_at
       FROM deal_history WHERE deal_id = ? ORDER BY created_at DESC`
    )
    .all(id) as {
      id: number;
      deal_id: number;
      user_name: string;
      action: string;
      detail: string | null;
      from_stage: string | null;
      to_stage: string | null;
      created_at: string;
    }[];

  const comments = database
    .prepare(
      `SELECT id, deal_id, user_name, body, created_at
       FROM deal_comments WHERE deal_id = ? ORDER BY created_at DESC`
    )
    .all(id) as {
      id: number;
      deal_id: number;
      user_name: string;
      body: string;
      created_at: string;
    }[];

  const tasks = database
    .prepare(
      `SELECT id, deal_id, title, due_date, completed, assignee_name, created_at
       FROM deal_tasks WHERE deal_id = ? ORDER BY created_at DESC`
    )
    .all(id) as {
      id: number;
      deal_id: number;
      title: string;
      due_date: string | null;
      completed: number;
      assignee_name: string | null;
      created_at: string;
    }[];

  return NextResponse.json({
    deal,
    history: history.map((h) => ({
      id: h.id,
      dealId: h.deal_id,
      userName: h.user_name,
      action: h.action,
      detail: h.detail,
      fromStage: h.from_stage,
      toStage: h.to_stage,
      createdAt: h.created_at,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      dealId: c.deal_id,
      userName: c.user_name,
      body: c.body,
      createdAt: c.created_at,
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      dealId: t.deal_id,
      title: t.title,
      dueDate: t.due_date,
      completed: Boolean(t.completed),
      assigneeName: t.assignee_name,
      createdAt: t.created_at,
    })),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const deal = getDealForSession(id, session);
  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const database = getDb();
  const now = new Date().toISOString();

  if (session.role === "manager" && body.managerId && body.managerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.role !== "admin" && body.managerId && body.managerId !== deal.managerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  database
    .prepare(
      `UPDATE deals SET
        title = COALESCE(?, title),
        address = COALESCE(?, address),
        price = COALESCE(?, price),
        manager_name = COALESCE(?, manager_name),
        manager_id = COALESCE(?, manager_id),
        priority = COALESCE(?, priority),
        object_type = COALESCE(?, object_type),
        region = COALESCE(?, region),
        yield_percent = COALESCE(?, yield_percent),
        payback_years = COALESCE(?, payback_years),
        area_sqm = COALESCE(?, area_sqm),
        tenants = COALESCE(?, tenants),
        owner = COALESCE(?, owner),
        deadline = COALESCE(?, deadline),
        rejection_reason = COALESCE(?, rejection_reason),
        updated_at = ?
      WHERE id = ?`
    )
    .run(
      body.title ?? null,
      body.address ?? null,
      body.price ?? null,
      body.managerName ?? null,
      body.managerId ?? null,
      body.priority ?? null,
      body.objectType ?? null,
      body.region ?? null,
      body.yieldPercent ?? null,
      body.paybackYears ?? null,
      body.areaSqm ?? null,
      body.tenants ?? null,
      body.owner ?? null,
      body.deadline ?? null,
      body.rejectionReason ?? null,
      now,
      id
    );

  if (body.price && body.price !== deal.price) {
    database
      .prepare(
        `INSERT INTO deal_history (deal_id, user_id, user_name, action, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        session.userId,
        session.name ?? "—",
        "price_changed",
        `Цена изменена на ${body.price}`,
        now
      );
  }

  const updated = getDealForSession(id, session);
  return NextResponse.json({ deal: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth({ roles: ["admin"] });
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  getDb().prepare("DELETE FROM deals WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const deal = getDealForSession(id, session);
  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { stage } = (await request.json()) as { stage: DealStage };
  if (!stage || stage === deal.stage) {
    return NextResponse.json({ deal });
  }

  const database = getDb();
  const now = new Date().toISOString();
  const meta = getStageMeta(stage);

  database
    .prepare(
      `UPDATE deals SET stage = ?, close_probability = ?, updated_at = ?, stage_changed_at = ? WHERE id = ?`
    )
    .run(stage, meta.closeProbability, now, now, id);

  database
    .prepare(
      `INSERT INTO deal_history (deal_id, user_id, user_name, action, detail, from_stage, to_stage, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      session.userId,
      session.name ?? "—",
      "stage_changed",
      `Перевёл объект из «${getStageMeta(deal.stage).label}» в «${meta.label}»`,
      deal.stage,
      stage,
      now
    );

  const updated = getDealForSession(id, session);
  return NextResponse.json({ deal: updated });
}
