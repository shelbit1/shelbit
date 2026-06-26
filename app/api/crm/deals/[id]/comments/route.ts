import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dealId = Number(params.id);
  const { body } = await request.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Пустой комментарий" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const database = getDb();

  const result = database
    .prepare(
      `INSERT INTO deal_comments (deal_id, user_id, user_name, body, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(dealId, session.userId, session.name ?? "—", body.trim(), now);

  database
    .prepare(
      `INSERT INTO deal_history (deal_id, user_id, user_name, action, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(dealId, session.userId, session.name ?? "—", "comment_added", "Добавлен комментарий", now);

  return NextResponse.json({
    comment: {
      id: Number(result.lastInsertRowid),
      dealId,
      userName: session.name ?? "—",
      body: body.trim(),
      createdAt: now,
    },
  });
}
