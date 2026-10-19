import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies, studentProfiles } from "@/db/schema";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { getSession, matchScore, requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const location = url.searchParams.get("location")?.trim();
  const contractType = url.searchParams.get("contractType")?.trim();
  const skills = (url.searchParams.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const remote = url.searchParams.get("remote") === "true";
  const mine = url.searchParams.get("mine") === "true";
  const statusFilter = url.searchParams.get("status");

  const session = await getSession();
  const where: SQL[] = [];
  if (mine && session) {
    where.push(eq(jobPostings.recruiterId, session.id));
  } else if (statusFilter && session?.role === "admin") {
    if (statusFilter !== "all") where.push(eq(jobPostings.status, statusFilter));
  } else {
    where.push(eq(jobPostings.status, "approved"));
  }
  if (q) {
    const cond = or(ilike(jobPostings.title, `%${q}%`), ilike(jobPostings.description, `%${q}%`));
    if (cond) where.push(cond);
  }
  if (location) where.push(ilike(jobPostings.location, `%${location}%`));
  if (contractType && contractType !== "all") where.push(eq(jobPostings.contractType, contractType));
  if (remote) where.push(eq(jobPostings.remote, true));

  const rows = await db
    .select({ job: jobPostings, company: companies })
    .from(jobPostings)
    .leftJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(jobPostings.createdAt))
    .limit(200);

  let candidateSkills: string[] = [];
  if (session?.role === "student") {
    const [p] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.id)).limit(1);
    candidateSkills = p?.skills ?? [];
  }

  let jobs = rows.map((r) => ({
    ...r.job,
    companyName: r.company?.name ?? "Unknown",
    industry: r.company?.industry ?? "",
    matchScore: candidateSkills.length ? matchScore(candidateSkills, r.job.requiredSkills) : null,
  }));

  if (skills.length) {
    jobs = jobs.filter((j) =>
      skills.every((s) => j.requiredSkills.some((rs) => rs.toLowerCase().includes(s))),
    );
  }

  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const { error, status, session } = await requireRole("recruiter");
  if (error || !session) return NextResponse.json({ error }, { status });
  const b = await req.json().catch(() => ({}));
  if (!b.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const [company] = await db.select().from(companies).where(eq(companies.ownerId, session.id)).limit(1);
  if (!company) return NextResponse.json({ error: "Company profile missing" }, { status: 400 });

  const requiredSkills: string[] = String(b.requiredSkills ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const [job] = await db
    .insert(jobPostings)
    .values({
      companyId: company.id,
      recruiterId: session.id,
      title: String(b.title),
      description: String(b.description ?? ""),
      location: String(b.location ?? ""),
      remote: Boolean(b.remote),
      contractType: String(b.contractType ?? "Internship"),
      salaryMin: b.salaryMin ? Number(b.salaryMin) : null,
      salaryMax: b.salaryMax ? Number(b.salaryMax) : null,
      requiredSkills,
      status: "pending",
    })
    .returning();
  return NextResponse.json({ job });
}
