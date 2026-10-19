import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  const { error, status } = await requireRole("admin");
  if (error) return NextResponse.json({ error }, { status });
  const b = await req.json().catch(() => ({}));

  if (b.type === "job" && b.id) {
    const [job] = await db
      .update(jobPostings)
      .set({ status: String(b.status) })
      .where(eq(jobPostings.id, Number(b.id)))
      .returning();
    if (job) {
      await db.insert(notifications).values({
        userId: job.recruiterId,
        title: `Listing ${job.status}`,
        body: `Your posting "${job.title}" was ${job.status} by the career center.`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (b.type === "user" && b.id) {
    await db.update(users).set({ verified: Boolean(b.verified) }).where(eq(users.id, Number(b.id)));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
