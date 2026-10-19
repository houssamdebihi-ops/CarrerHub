import Link from "next/link";
import {
  UserCircle2, Building2, KanbanSquare, Sparkles, ShieldCheck, FolderLock,
  CalendarClock, Search, Lock, BarChart3, ArrowRight,
} from "lucide-react";

const MODULES = [
  { icon: UserCircle2, title: "Student Portfolio & Profiles", desc: "Digital profiles with CV uploads, transcript links and skill tagging." },
  { icon: Building2, title: "Corporate Recruiter Portal", desc: "Secure onboarding and dashboards for companies and HR managers." },
  { icon: KanbanSquare, title: "Applicant Tracking System", desc: "Kanban workflow from submission through screening to hiring." },
  { icon: Sparkles, title: "Skill-Matching Engine", desc: "Algorithmic scoring of candidate skills against job requirements." },
  { icon: ShieldCheck, title: "University Admin Dashboard", desc: "Career-center moderation of listings and student verification." },
  { icon: FolderLock, title: "Document & CV Repository", desc: "Centralized storage for resumes, cover letters and certificates." },
  { icon: CalendarClock, title: "Interview Scheduling", desc: "Automated dashboard and email-style alerts for status updates." },
  { icon: Search, title: "Advanced Filtering Directory", desc: "Filter by location, contract type, remote status and skills." },
  { icon: Lock, title: "Role-Based Access Control", desc: "Granular student / recruiter / administrator permissions." },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Placement metrics and recruitment funnel statistics." },
];

export default function Home() {
  return (
    <div>
      <section className="bg-[#0F2537] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest bg-[#1E3A8A] px-3 py-1 rounded-full">
              Enterprise Edition · Team 06
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
              University CareerHub
            </h1>
            <p className="mt-2 text-xl text-slate-300 font-medium">
              Student Internships &amp; Jobs Platform
            </p>
            <p className="mt-5 text-slate-400 max-w-xl">
              One governed platform connecting students and graduates with corporate recruiters —
              profiles, skill matching, applicant tracking, interview scheduling and placement analytics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary inline-flex items-center gap-2">
                Create an account <ArrowRight size={16} />
              </Link>
              <Link href="/jobs" className="btn-ghost">Browse opportunities</Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Demo accounts (password123): admin@careerhub.edu · recruiter@techcorp.com · student@univ.edu
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["10", "Functional modules"],
              ["3", "RBAC role levels"],
              ["6", "ATS pipeline stages"],
              ["100%", "Responsive UI"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-3xl font-extrabold text-white">{n}</p>
                <p className="text-sm text-slate-400 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#0F2537]">Platform modules</h2>
        <p className="text-slate-500 mt-1">The complete functional scope delivered across the project lifecycle.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.title} className="card p-6">
              <span className="inline-flex rounded-lg bg-slate-100 p-2.5 text-[#1E3A8A]">
                <m.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-[#0F2537]">{m.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
