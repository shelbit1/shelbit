import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { defaultSession, sessionOptions, type SessionData } from "@/lib/session";
import type { UserRole } from "@/types/crm";

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export async function requireAuth(options?: { roles?: UserRole[] }) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  if (options?.roles && session.role && !options.roles.includes(session.role)) {
    return null;
  }

  return session;
}

export async function clearSession() {
  const session = await getSession();
  Object.assign(session, defaultSession);
  await session.save();
}
