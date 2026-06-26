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
  const { title, dueDate } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Укажите название задачи" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const database = getDb();

  const result = database
    .prepare(
      `INSERT INTO deal_tasks (deal_id, title, due_date, assignee_name, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(dealId, title.trim(), dueDate ?? null, session.name ?? "—", now);

  database
    .prepare(
      `INSERT INTO deal_history (deal_id, user_id, user_name, action, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      dealId,
      session.userId,
      session.name ?? "—",
      "task_created",
      `Создана задача: ${title.trim()}`,
      now
    );

  return NextResponse.json({
    task: {
      id: Number(result.lastInsertRowid),
      dealId,
      title: title.trim(),
      dueDate: dueDate ?? null,
      completed: false,
      assigneeName: session.name ?? "—",
      createdAt: now,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dealId = Number(params.id);
  const { taskId, completed } = await request.json();
  getDb()
    .prepare("UPDATE deal_tasks SET completed = ? WHERE id = ? AND deal_id = ?")
    .run(completed ? 1 : 0, taskId, dealId);

  return NextResponse.json({ ok: true });
}
