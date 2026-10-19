import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, studentProfiles, companies, jobPostings, applications, notifications } from "@/db/schema";
import { matchScore } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function POST() {
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  if (existing[0].c > 0) return NextResponse.json({ ok: true, seeded: false });

  const hash = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({ fullName: "SAIDI Hania", email: "admin@careerhub.edu", passwordHash: hash, role: "admin", verified: true })
    .returning();

  const recruiterRows = await db
    .insert(users)
    .values([
      { fullName: "ANEB Kaouther", email: "recruiter@techcorp.com", passwordHash: hash, role: "recruiter", verified: true },
      { fullName: "Sofia Martin", email: "hr@datawave.io", passwordHash: hash, role: "recruiter", verified: true },
    ])
    .returning();

  const studentRows = await db
    .insert(users)
    .values([
      { fullName: "DEBIHI Houssam Sadjed", email: "student@univ.edu", passwordHash: hash, role: "student", verified: true },
      { fullName: "KAHLERRAS Houd", email: "houd@univ.edu", passwordHash: hash, role: "student", verified: false },
      { fullName: "Lina Bouzid", email: "lina@univ.edu", passwordHash: hash, role: "student", verified: true },
    ])
    .returning();

  await db.insert(studentProfiles).values([
    {
      userId: studentRows[0].id,
      headline: "Final-year Software Engineering student",
      university: "University of Algiers",
      degree: "MSc Software Engineering",
      graduationYear: 2026,
      gpa: "3.8",
      location: "Algiers",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      cvUrl: "https://example.com/cv-houssam.pdf",
    },
    {
      userId: studentRows[1].id,
      headline: "Data Science enthusiast",
      university: "University of Oran",
      degree: "BSc Data Science",
      graduationYear: 2027,
      gpa: "3.5",
      location: "Oran",
      skills: ["Python", "Pandas", "SQL", "Machine Learning"],
    },
    {
      userId: studentRows[2].id,
      headline: "UI/UX Designer & frontend developer",
      university: "University of Constantine",
      degree: "BSc Computer Science",
      graduationYear: 2026,
      location: "Remote",
      skills: ["Figma", "React", "Tailwind CSS", "Accessibility"],
    },
  ]);

  const companyRows = await db
    .insert(companies)
    .values([
      { ownerId: recruiterRows[0].id, name: "TechCorp Solutions", industry: "Software", website: "techcorp.com", size: "500-1000", verified: true },
      { ownerId: recruiterRows[1].id, name: "DataWave Analytics", industry: "Data & AI", website: "datawave.io", size: "50-200", verified: true },
    ])
    .returning();

  const jobs = await db
    .insert(jobPostings)
    .values([
      {
        companyId: companyRows[0].id, recruiterId: recruiterRows[0].id,
        title: "Frontend Developer Intern", location: "Algiers", remote: false, contractType: "Internship",
        salaryMin: 30000, salaryMax: 45000, status: "approved",
        requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
        description: "Join our product team to build enterprise dashboards with React and TypeScript. 6-month internship with conversion opportunity.",
      },
      {
        companyId: companyRows[0].id, recruiterId: recruiterRows[0].id,
        title: "Junior Backend Engineer", location: "Algiers", remote: true, contractType: "Full-time",
        salaryMin: 60000, salaryMax: 85000, status: "approved",
        requiredSkills: ["Node.js", "PostgreSQL", "Docker", "REST API"],
        description: "Design and ship RESTful services powering our enterprise platform.",
      },
      {
        companyId: companyRows[1].id, recruiterId: recruiterRows[1].id,
        title: "Data Analyst Intern", location: "Oran", remote: false, contractType: "Internship",
        salaryMin: 25000, salaryMax: 35000, status: "approved",
        requiredSkills: ["Python", "SQL", "Pandas"],
        description: "Support the analytics team with reporting pipelines and dashboards.",
      },
      {
        companyId: companyRows[1].id, recruiterId: recruiterRows[1].id,
        title: "Machine Learning Apprentice", location: "Remote", remote: true, contractType: "Apprenticeship",
        salaryMin: 40000, salaryMax: 55000, status: "pending",
        requiredSkills: ["Python", "Machine Learning", "TensorFlow"],
        description: "Work alongside senior ML engineers on recommendation models.",
      },
      {
        companyId: companyRows[0].id, recruiterId: recruiterRows[0].id,
        title: "UI/UX Design Intern", location: "Constantine", remote: true, contractType: "Internship",
        salaryMin: 20000, salaryMax: 30000, status: "approved",
        requiredSkills: ["Figma", "Accessibility", "Design Systems"],
        description: "Craft accessible, enterprise-grade interface patterns for our design system.",
      },
    ])
    .returning();

  await db.insert(applications).values([
    { jobId: jobs[0].id, studentId: studentRows[0].id, stage: "interview", matchScore: matchScore(["React", "TypeScript", "Node.js"], jobs[0].requiredSkills), coverLetter: "Excited to contribute to your frontend team." },
    { jobId: jobs[1].id, studentId: studentRows[0].id, stage: "screening", matchScore: 85 },
    { jobId: jobs[2].id, studentId: studentRows[1].id, stage: "submitted", matchScore: 100 },
    { jobId: jobs[4].id, studentId: studentRows[2].id, stage: "hired", matchScore: 66 },
  ]);

  await db.insert(notifications).values([
    { userId: studentRows[0].id, title: "Interview scheduled", body: "TechCorp Solutions invited you to an interview." },
    { userId: admin.id, title: "Moderation queue", body: "1 job posting awaits approval." },
  ]);

  return NextResponse.json({ ok: true, seeded: true });
}
