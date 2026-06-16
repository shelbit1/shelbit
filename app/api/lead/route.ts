import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("BITRIX24_WEBHOOK_URL is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let body: { name?: string; phone?: string; email?: string; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, comment } = body;

  // Формируем поля лида для Bitrix24 CRM
  const fields: Record<string, unknown> = {
    TITLE: `Заявка с сайта SHELBIT${name ? ` — ${name}` : ""}`,
    SOURCE_ID: "WEB",
  };

  if (name) fields.NAME = name;
  if (phone) fields.PHONE = [{ VALUE: phone, VALUE_TYPE: "WORK" }];
  if (email) fields.EMAIL = [{ VALUE: email, VALUE_TYPE: "WORK" }];
  if (comment) fields.COMMENTS = comment;

  try {
    const b24Res = await fetch(`${webhookUrl}/crm.lead.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });

    const data = (await b24Res.json()) as { result?: number; error?: string };

    if (!b24Res.ok || data.error) {
      console.error("Bitrix24 error:", data);
      return NextResponse.json(
        { error: "Bitrix24 rejected the request", detail: data.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, leadId: data.result });
  } catch (err) {
    console.error("Failed to reach Bitrix24:", err);
    return NextResponse.json(
      { error: "Failed to reach Bitrix24" },
      { status: 502 }
    );
  }
}
