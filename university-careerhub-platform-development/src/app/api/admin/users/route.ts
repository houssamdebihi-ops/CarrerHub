import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const { error, status } = await requireRole("admin");
  if (error) return NextResponse.json({ error }, { status });
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      verified: users.verified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(200);
  return NextResponse.json({ users: rows });
}
