import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobPostings, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

const STAGES = ["submitted", "screening", "interview", "offer", "hired", "rejected"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, status, session } = await requireRole("recruiter", "admin");
  if (error || !session) return NextResponse.json({ error }, { status });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));

  const [row] = await db
    .select({ app: applications, job: jobPostings })
    .from(applications)
    .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
    .where(eq(applications.id, Number(id)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role === "recruiter" && row.job.recruiterId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof b.stage === "string" && STAGES.includes(b.stage)) patch.stage = b.stage;
  if (b.interviewAt) patch.interviewAt = new Date(b.interviewAt);

  await db.update(applications).set(patch).where(eq(applications.id, Number(id)));

  await db.insert(notifications).values({
    userId: row.app.studentId,
    title: b.interviewAt ? "Interview scheduled" : "Application status updated",
    body: b.interviewAt
      ? `Interview for ${row.job.title} on ${new Date(b.interviewAt).toLocaleString()}.`
      : `Your application for ${row.job.title} moved to "${b.stage}".`,
  });

  return NextResponse.json({ ok: true });
}
