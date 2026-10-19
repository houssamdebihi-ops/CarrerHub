import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { users, studentProfiles, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "recruiter", "admin"]),
  companyName: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { fullName, email, password, role, companyName } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role,
      verified: role !== "student",
    })
    .returning();

  if (role === "student") {
    await db.insert(studentProfiles).values({ userId: user.id });
  }
  if (role === "recruiter") {
    await db.insert(companies).values({ ownerId: user.id, name: companyName || `${fullName} Corp` });
  }

  await setSession({ id: user.id, email: user.email, role: role, fullName: user.fullName });
  return NextResponse.json({ user: { id: user.id, email: user.email, role, fullName: user.fullName } });
}
