import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobPostings, users, companies } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const { error, status } = await requireRole("admin");
  if (error) return NextResponse.json({ error }, { status });

  const [counts] = await db
    .select({
      students: sql<number>`count(*) filter (where ${users.role} = 'student')::int`,
      recruiters: sql<number>`count(*) filter (where ${users.role} = 'recruiter')::int`,
      pendingVerification: sql<number>`count(*) filter (where ${users.verified} = false)::int`,
    })
    .from(users);

  const [jobs] = await db
    .select({
      total: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) filter (where ${jobPostings.status} = 'approved')::int`,
      pending: sql<number>`count(*) filter (where ${jobPostings.status} = 'pending')::int`,
    })
    .from(jobPostings);

  const [apps] = await db
    .select({
      total: sql<number>`count(*)::int`,
      hired: sql<number>`count(*) filter (where ${applications.stage} = 'hired')::int`,
      interview: sql<number>`count(*) filter (where ${applications.stage} = 'interview')::int`,
      avgMatch: sql<number>`coalesce(round(avg(${applications.matchScore})),0)::int`,
    })
    .from(applications);

  const byStage = await db
    .select({ stage: applications.stage, count: sql<number>`count(*)::int` })
    .from(applications)
    .groupBy(applications.stage);

  const topCompanies = await db
    .select({ name: companies.name, count: sql<number>`count(${jobPostings.id})::int` })
    .from(companies)
    .leftJoin(jobPostings, sql`${jobPostings.companyId} = ${companies.id}`)
    .groupBy(companies.name)
    .orderBy(sql`count(${jobPostings.id}) desc`)
    .limit(5);

  const byContract = await db
    .select({ type: jobPostings.contractType, count: sql<number>`count(*)::int` })
    .from(jobPostings)
    .groupBy(jobPostings.contractType);

  const placementRate = apps.total ? Math.round((apps.hired / apps.total) * 100) : 0;

  return NextResponse.json({ counts, jobs, apps, byStage, topCompanies, byContract, placementRate });
}
