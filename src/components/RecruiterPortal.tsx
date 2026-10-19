"use client";

import { useCallback, useEffect, useState } from "react";
import { KanbanSquare, PlusCircle, CalendarClock, Mail, GraduationCap, FileText } from "lucide-react";

type Job = { id: number; title: string; status: string; location: string; contractType: string; requiredSkills: string[] };
type App = {
  id: number; jobId: number; stage: string; matchScore: number; jobTitle: string;
  studentName: string; studentEmail: string; university: string; skills: string[];
  cvUrl: string; interviewAt: string | null;
};

const STAGES = ["submitted", "screening", "interview", "offer", "hired", "rejected"] as const;
const STAGE_LABEL: Record<string, string> = {
  submitted: "Submitted", screening: "Screening", interview: "Interview",
  offer: "Offer", hired: "Hired", rejected: "Rejected",
};

export default function RecruiterPortal({ name }: { name: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [tab, setTab] = useState<"ats" | "post">("ats");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [form, setForm] = useState({
    title: "", description: "", location: "", contractType: "Internship",
    salaryMin: "", salaryMax: "", requiredSkills: "", remote: false,
  });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [j, a] = await Promise.all([
      fetch("/api/jobs?mine=true").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ]);
    setJobs(j.jobs ?? []);
    setApps(a.applications ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function move(id: number, stage: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  async function schedule(id: number) {
    const when = prompt("Interview date/time (YYYY-MM-DD HH:MM)");
    if (!when) return;
    const d = new Date(when.replace(" ", "T"));
    if (isNaN(d.getTime())) return setMsg("Invalid date format.");
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewAt: d.toISOString(), stage: "interview" }),
    });
    setMsg("Interview scheduled and candidate notified.");
    load();
  }

  async function postJob(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("Posting submitted — pending career-center approval.");
      setForm({ title: "", description: "", location: "", contractType: "Internship", salaryMin: "", salaryMax: "", requiredSkills: "", remote: false });
      setTab("ats");
      load();
    } else setMsg("Unable to create posting.");
  }

  const visible = jobFilter === "all" ? apps : apps.filter((a) => String(a.jobId) === jobFilter);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2537]">Recruiter portal</h1>
          <p className="text-sm text-slate-500 mt-1">{name} · applicant tracking &amp; job publication</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("ats")} className={tab === "ats" ? "btn-primary" : "btn-ghost"}>
            <span className="inline-flex items-center gap-2"><KanbanSquare size={15} /> ATS board</span>
          </button>
          <button onClick={() => setTab("post")} className={tab === "post" ? "btn-primary" : "btn-ghost"}>
            <span className="inline-flex items-center gap-2"><PlusCircle size={15} /> Post a role</span>
          </button>
        </div>
      </div>

      {msg && <div className="mt-4 rounded-lg bg-blue-50 border border-[#1E3A8A]/30 px-4 py-2 text-sm text-[#1E3A8A]">{msg}</div>}

      {tab === "post" ? (
        <form onSubmit={postJob} className="card p-6 mt-6 max-w-3xl space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Job title</label>
              <input className="input mt-1" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Contract type</label>
              <select className="input mt-1" value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}>
                {["Internship", "Full-time", "Part-time", "Apprenticeship", "Contract"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Salary min</label>
              <input className="input mt-1" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            </div>
            <div>
              <label className="label">Salary max</label>
              <input className="input mt-1" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Required skills (comma separated)</label>
            <input className="input mt-1" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input mt-1 h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} /> Remote position
          </label>
          <button className="btn-primary">Submit for approval</button>
        </form>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="label">Filter by posting</label>
            <select className="input max-w-sm" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
              <option value="all">All postings ({jobs.length})</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} — {j.status}</option>)}
            </select>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => {
              const col = visible.filter((a) => a.stage === stage);
              return (
                <div key={stage} className="rounded-xl bg-slate-100/70 border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#0F2537]">{STAGE_LABEL[stage]}</p>
                    <span className="text-xs text-slate-500">{col.length}</span>
                  </div>
                  <div className="space-y-3">
                    {col.map((a) => (
                      <div key={a.id} className="card p-3">
                        <p className="font-semibold text-sm text-[#0F2537]">{a.studentName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={11} /> {a.studentEmail}</p>
                        {a.university && <p className="text-[11px] text-slate-500 flex items-center gap-1"><GraduationCap size={11} /> {a.university}</p>}
                        <p className="text-[11px] text-slate-400 mt-1">{a.jobTitle}</p>
                        <p className="mt-2 inline-block rounded-full bg-blue-50 text-[#1E3A8A] px-2 py-0.5 text-[11px] font-bold">{a.matchScore}% match</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {a.skills.slice(0, 4).map((s) => (
                            <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{s}</span>
                          ))}
                        </div>
                        {a.cvUrl && (
                          <a href={a.cvUrl} className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#1E3A8A] font-semibold">
                            <FileText size={11} /> View CV
                          </a>
                        )}
                        <select
                          className="input mt-2 text-xs py-1"
                          value={a.stage}
                          onChange={(e) => move(a.id, e.target.value)}
                        >
                          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                        </select>
                        <button onClick={() => schedule(a.id)} className="mt-2 w-full btn-ghost text-xs flex items-center justify-center gap-1">
                          <CalendarClock size={12} /> Schedule
                        </button>
                        {a.interviewAt && (
                          <p className="mt-1 text-[10px] text-slate-500">{new Date(a.interviewAt).toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                    {!col.length && <p className="text-[11px] text-slate-400 text-center py-4">Empty</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
