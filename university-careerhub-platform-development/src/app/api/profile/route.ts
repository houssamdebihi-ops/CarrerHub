import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const { error, status, session } = await requireRole("student");
  if (error || !session) return NextResponse.json({ error }, { status });
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.id)).limit(1);
  return NextResponse.json({ profile: profile ?? null });
}

export async function PUT(req: Request) {
  const { error, status, session } = await requireRole("student");
  if (error || !session) return NextResponse.json({ error }, { status });
  const b = await req.json().catch(() => ({}));
  const skills: string[] = Array.isArray(b.skills)
    ? b.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
    : String(b.skills ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const values = {
    headline: String(b.headline ?? ""),
    bio: String(b.bio ?? ""),
    university: String(b.university ?? ""),
    degree: String(b.degree ?? ""),
    graduationYear: b.graduationYear ? Number(b.graduationYear) : null,
    gpa: String(b.gpa ?? ""),
    location: String(b.location ?? ""),
    phone: String(b.phone ?? ""),
    skills,
    cvUrl: String(b.cvUrl ?? ""),
    transcriptUrl: String(b.transcriptUrl ?? ""),
    portfolioUrl: String(b.portfolioUrl ?? ""),
    updatedAt: new Date(),
  };

  const existing = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.id)).limit(1);
  if (existing.length) {
    await db.update(studentProfiles).set(values).where(eq(studentProfiles.userId, session.id));
  } else {
    await db.insert(studentProfiles).values({ userId: session.id, ...values });
  }
  return NextResponse.json({ ok: true });
}
