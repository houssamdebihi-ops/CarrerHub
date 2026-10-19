import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "careerhub-team06-dev-secret-key-change-me",
);

export type Role = "student" | "recruiter" | "admin";
export type SessionUser = { id: number; email: string; role: Role; fullName: string };

export async function createToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSession(user: SessionUser) {
  const token = await createToken(user);
  const store = await cookies();
  store.set("ch_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete("ch_token");
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get("ch_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      role: payload.role as Role,
      fullName: String(payload.fullName),
    };
  } catch {
    return null;
  }
}

/** RBAC middleware helper for API route handlers. */
export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized", status: 401 as const, session: null };
  if (roles.length && !roles.includes(session.role)) {
    return { error: "Forbidden", status: 403 as const, session: null };
  }
  const [row] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!row) return { error: "Unauthorized", status: 401 as const, session: null };
  return { error: null, status: 200 as const, session };
}

/** Skill-matching engine: weighted overlap between candidate & job skills. */
export function matchScore(candidate: string[], required: string[]) {
  if (!required.length) return 50;
  const c = candidate.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const r = required.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hits = r.filter((s) => c.some((x) => x === s || x.includes(s) || s.includes(x)));
  return Math.round((hits.length / r.length) * 100);
}
