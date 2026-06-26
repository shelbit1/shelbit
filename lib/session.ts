import type { SessionOptions } from "iron-session";
import type { UserRole } from "@/types/crm";

export type SessionData = {
  userId?: number;
  username?: string;
  name?: string;
  role?: UserRole;
  isLoggedIn: boolean;
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "dev_session_secret_min_32_chars_long_xx",
  cookieName: "shelbit_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
