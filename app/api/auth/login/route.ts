import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Укажите логин и пароль" }, { status: 400 });
  }

  const user = verifyUser(username, password);
  if (!user) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.name = user.name;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({
    ok: true,
    user: { username: user.username, name: user.name, role: user.role },
  });
}
