import "server-only";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface sessionProps {
  id?: string;
}

export async function getSession() {
  return getIronSession<sessionProps>(await cookies(), {
    cookieName: "Session",
    password: process.env.COOKIE_PASSWORD!,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 6,
    },
  });
}
