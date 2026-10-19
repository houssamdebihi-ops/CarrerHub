import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSession, type Role } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const session = { id: user.id, email: user.email, role: user.role as Role, fullName: user.fullName };
  await setSession(session);
  return NextResponse.json({ user: session });
}
