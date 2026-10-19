"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Briefcase, Wifi, Sparkles, Building2, Search } from "lucide-react";

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  remote: boolean;
  contractType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  requiredSkills: string[];
  companyName: string;
  industry: string;
  matchScore: number | null;
};

const CONTRACTS = ["all", "Internship", "Full-time", "Part-time", "Apprenticeship", "Contract"];

export default function JobsPage() {
  const [filters, setFilters] = useState({ q: "", location: "", contractType: "all", skills: "", remote: false });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q: filters.q,
      location: filters.location,
      contractType: filters.contractType,
      skills: filters.skills,
      remote: String(filters.remote),
    });
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function apply(jobId: number) {
    setApplyingId(jobId);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    setApplyingId(null);
    setMessage(res.ok ? "Application submitted successfully." : data.error ?? "Unable to apply (students only).");
    setTimeout(() => setMessage(""), 4000);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0F2537]">Opportunity directory</h1>
      <p className="text-slate-500 text-sm mt-1">Multi-criteria search across approved internships and jobs.</p>

      {message && (
        <div className="mt-4 rounded-lg border border-[#1E3A8A]/30 bg-blue-50 px-4 py-2 text-sm text-[#1E3A8A]">{message}</div>
      )}

      <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="card p-5 h-fit lg:sticky lg:top-24">
          <p className="font-bold text-[#0F2537] flex items-center gap-2"><Search size={16} /> Filters</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Keyword</label>
              <input className="input mt-1" placeholder="e.g. frontend" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input mt-1" placeholder="City" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Contract type</label>
              <select className="input mt-1" value={filters.contractType} onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}>
                {CONTRACTS.map((c) => <option key={c} value={c}>{c === "all" ? "All types" : c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Required skills</label>
              <input className="input mt-1" placeholder="react, sql" value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={filters.remote} onChange={(e) => setFilters({ ...filters, remote: e.target.checked })} />
              Remote only
            </label>
            <button className="btn-ghost w-full" onClick={() => setFilters({ q: "", location: "", contractType: "all", skills: "", remote: false })}>
              Reset filters
            </button>
          </div>
        </aside>

        <section>
          <p className="text-sm text-slate-500 mb-3">{loading ? "Loading…" : `${jobs.length} opportunities found`}</p>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <article key={job.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-[#0F2537]">{job.title}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building2 size={14} /> {job.companyName}
                      {job.industry && <span className="text-slate-400">· {job.industry}</span>}
                    </p>
                  </div>
                  {job.matchScore !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-[#1E3A8A] px-3 py-1 text-xs font-bold">
                      <Sparkles size={13} /> {job.matchScore}% skill match
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-3">{job.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {job.location || "—"}</span>
                  <span className="flex items-center gap-1"><Briefcase size={13} /> {job.contractType}</span>
                  {job.remote && <span className="flex items-center gap-1 text-[#1E3A8A] font-semibold"><Wifi size={13} /> Remote</span>}
                  {job.salaryMin && <span>{job.salaryMin.toLocaleString()} – {job.salaryMax?.toLocaleString()} DZD</span>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
                <div className="mt-5">
                  <button className="btn-primary" onClick={() => apply(job.id)} disabled={applyingId === job.id}>
                    {applyingId === job.id ? "Submitting…" : "Apply now"}
                  </button>
                </div>
              </article>
            ))}
            {!loading && !jobs.length && (
              <div className="card p-10 text-center text-slate-500">No opportunities match your filters.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
