"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, ShieldCheck, Users, CheckCircle2, XCircle } from "lucide-react";

type Analytics = {
  counts: { students: number; recruiters: number; pendingVerification: number };
  jobs: { total: number; approved: number; pending: number };
  apps: { total: number; hired: number; interview: number; avgMatch: number };
  byStage: { stage: string; count: number }[];
  topCompanies: { name: string; count: number }[];
  byContract: { type: string; count: number }[];
  placementRate: number;
};
type Job = { id: number; title: string; companyName: string; status: string; location: string; contractType: string };
type User = { id: number; fullName: string; email: string; role: string; verified: boolean };

export default function AdminConsole() {
  const [tab, setTab] = useState<"analytics" | "moderation" | "users">("analytics");
  const [data, setData] = useState<Analytics | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const load = useCallback(async () => {
    const [a, j, u] = await Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/jobs?status=all").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setData(a);
    setJobs(j.jobs ?? []);
    setUsers(u.users ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function moderate(payload: Record<string, unknown>) {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    load();
  }

  const maxStage = Math.max(1, ...(data?.byStage.map((s) => s.count) ?? [1]));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0F2537]">University administrator console</h1>
      <p className="text-sm text-slate-500 mt-1">Career-center moderation, account verification and placement reporting.</p>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {([["analytics", "Analytics", BarChart3], ["moderation", "Listing moderation", ShieldCheck], ["users", "Accounts", Users]] as const).map(
          ([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
                tab === k ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent text-slate-500"}`}>
              <Icon size={15} /> {label}
            </button>
          ),
        )}
      </div>

      {tab === "analytics" && data && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Students", data.counts.students],
              ["Recruiters", data.counts.recruiters],
              ["Active listings", data.jobs.approved],
              ["Placement rate", `${data.placementRate}%`],
              ["Applications", data.apps.total],
              ["Interviews", data.apps.interview],
              ["Hired", data.apps.hired],
              ["Avg. match score", `${data.apps.avgMatch}%`],
            ].map(([l, v]) => (
              <div key={String(l)} className="card p-5">
                <p className="text-xs uppercase font-bold text-slate-400">{l}</p>
                <p className="text-3xl font-extrabold text-[#0F2537] mt-1">{v}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <p className="font-bold text-[#0F2537]">Recruitment funnel</p>
              <div className="mt-4 space-y-3">
                {data.byStage.map((s) => (
                  <div key={s.stage}>
                    <div className="flex justify-between text-xs text-slate-500 capitalize"><span>{s.stage}</span><span>{s.count}</span></div>
                    <div className="h-2.5 bg-slate-100 rounded-full mt-1">
                      <div className="h-2.5 rounded-full bg-[#1E3A8A]" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <p className="font-bold text-[#0F2537]">Top partner companies</p>
              <ul className="mt-4 space-y-2 text-sm">
                {data.topCompanies.map((c) => (
                  <li key={c.name} className="flex justify-between border-b border-slate-100 pb-2">
                    <span>{c.name}</span><span className="font-semibold text-[#1E3A8A]">{c.count} listings</span>
                  </li>
                ))}
              </ul>
              <p className="font-bold text-[#0F2537] mt-6">Contract mix</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.byContract.map((c) => (
                  <span key={c.type} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{c.type}: {c.count}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "moderation" && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Company</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-[#0F2537]">{j.title}</td>
                  <td className="px-5 py-3 text-slate-500">{j.companyName}</td>
                  <td className="px-5 py-3 text-slate-500">{j.contractType} · {j.location}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{j.status}</span></td>
                  <td className="px-5 py-3 flex gap-2">
                    <button className="btn-primary text-xs" onClick={() => moderate({ type: "job", id: j.id, status: "approved" })}>Approve</button>
                    <button className="btn-ghost text-xs" onClick={() => moderate({ type: "job", id: j.id, status: "rejected" })}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Verified</th><th className="px-5 py-3">Action</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-[#0F2537]">{u.fullName}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3 capitalize">{u.role}</td>
                  <td className="px-5 py-3">
                    {u.verified ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-500" />}
                  </td>
                  <td className="px-5 py-3">
                    <button className="btn-ghost text-xs" onClick={() => moderate({ type: "user", id: u.id, verified: !u.verified })}>
                      {u.verified ? "Revoke" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
