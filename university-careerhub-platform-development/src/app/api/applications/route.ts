import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobPostings, companies, studentProfiles, users, notifications } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { matchScore, requireRole, getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const jobId = new URL(req.url).searchParams.get("jobId");

  if (session.role === "student") {
    const rows = await db
      .select({ app: applications, job: jobPostings, company: companies })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .leftJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(eq(applications.studentId, session.id))
      .orderBy(desc(applications.createdAt));
    return NextResponse.json({
      applications: rows.map((r) => ({
        ...r.app,
        jobTitle: r.job.title,
        companyName: r.company?.name ?? "",
        location: r.job.location,
      })),
    });
  }

  const where = [eq(jobPostings.recruiterId, session.id)];
  if (jobId) where.push(eq(applications.jobId, Number(jobId)));
  const rows = await db
    .select({ app: applications, job: jobPostings, student: users, profile: studentProfiles })
    .from(applications)
    .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
    .innerJoin(users, eq(applications.studentId, users.id))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .where(session.role === "admin" ? (jobId ? eq(applications.jobId, Number(jobId)) : undefined) : and(...where))
    .orderBy(desc(applications.createdAt));

  return NextResponse.json({
    applications: rows.map((r) => ({
      ...r.app,
      jobTitle: r.job.title,
      studentName: r.student.fullName,
      studentEmail: r.student.email,
      university: r.profile?.university ?? "",
      skills: r.profile?.skills ?? [],
      cvUrl: r.profile?.cvUrl ?? "",
    })),
  });
}

export async function POST(req: Request) {
  const { error, status, session } = await requireRole("student");
  if (error || !session) return NextResponse.json({ error }, { status });
  const b = await req.json().catch(() => ({}));
  const jobId = Number(b.jobId);
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const dup = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.studentId, session.id)))
    .limit(1);
  if (dup.length) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.id)).limit(1);
  const score = matchScore(profile?.skills ?? [], job.requiredSkills);

  const [app] = await db
    .insert(applications)
    .values({ jobId, studentId: session.id, coverLetter: String(b.coverLetter ?? ""), matchScore: score })
    .returning();

  await db.insert(notifications).values([
    { userId: session.id, title: "Application submitted", body: `You applied to ${job.title}.` },
    { userId: job.recruiterId, title: "New applicant", body: `${session.fullName} applied to ${job.title}.` },
  ]);

  return NextResponse.json({ application: app });
}
