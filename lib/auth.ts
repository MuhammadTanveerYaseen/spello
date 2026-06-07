import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "spello-cafe-dev-secret-change-me";
const COOKIE_NAME = "spello_session";

export function signToken() {
  return jwt.sign({ app: "spello-cafe" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function isAuthenticated() {
  const token = await getSessionToken();
  return token ? verifyToken(token) : false;
}
