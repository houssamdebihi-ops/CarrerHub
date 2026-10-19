import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("student"), // student | recruiter | admin
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("users_role_idx").on(t.role)],
);

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 200 }).default(""),
    bio: text("bio").default(""),
    university: varchar("university", { length: 160 }).default(""),
    degree: varchar("degree", { length: 160 }).default(""),
    graduationYear: integer("graduation_year"),
    gpa: varchar("gpa", { length: 10 }).default(""),
    location: varchar("location", { length: 120 }).default(""),
    phone: varchar("phone", { length: 40 }).default(""),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
    cvUrl: text("cv_url").default(""),
    transcriptUrl: text("transcript_url").default(""),
    portfolioUrl: text("portfolio_url").default(""),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("student_profiles_user_idx").on(t.userId)],
);

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  industry: varchar("industry", { length: 120 }).default(""),
  website: varchar("website", { length: 200 }).default(""),
  size: varchar("size", { length: 60 }).default(""),
  about: text("about").default(""),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobPostings = pgTable(
  "job_postings",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    recruiterId: integer("recruiter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    location: varchar("location", { length: 120 }).notNull().default(""),
    remote: boolean("remote").notNull().default(false),
    contractType: varchar("contract_type", { length: 40 }).notNull().default("Internship"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    requiredSkills: jsonb("required_skills").$type<string[]>().notNull().default([]),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | approved | rejected | closed
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("job_status_idx").on(t.status),
    index("job_company_idx").on(t.companyId),
    index("job_contract_idx").on(t.contractType),
  ],
);

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
    studentId: integer("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stage: varchar("stage", { length: 30 }).notNull().default("submitted"), // submitted|screening|interview|offer|hired|rejected
    coverLetter: text("cover_letter").default(""),
    matchScore: integer("match_score").notNull().default(0),
    interviewAt: timestamp("interview_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("app_job_idx").on(t.jobId), index("app_student_idx").on(t.studentId), index("app_stage_idx").on(t.stage)],
);

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 180 }).notNull(),
  kind: varchar("kind", { length: 40 }).notNull().default("cv"),
  url: text("url").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull().default(""),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notif_user_idx").on(t.userId)],
);
