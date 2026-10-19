"use client";

import { useEffect, useState } from "react";
import { FileText, Bell, UserCircle2, ListChecks, Save } from "lucide-react";

type Profile = {
  headline: string | null; bio: string | null; university: string | null; degree: string | null;
  graduationYear: number | null; gpa: string | null; location: string | null; phone: string | null;
  skills: string[]; cvUrl: string | null; transcriptUrl: string | null; portfolioUrl: string | null;
};
type App = {
  id: number; stage: string; matchScore: number; jobTitle: string; companyName: string;
  location: string; interviewAt: string | null; createdAt: string;
};
type Notif = { id: number; title: string; body: string; createdAt: string };

const STAGE_COLORS: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  screening: "bg-amber-100 text-amber-800",
  interview: "bg-blue-100 text-[#1E3A8A]",
  offer: "bg-violet-100 text-violet-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const EMPTY: Profile = {
  headline: "", bio: "", university: "", degree: "", graduationYear: null, gpa: "",
  location: "", phone: "", skills: [], cvUrl: "", transcriptUrl: "", portfolioUrl: "",
};

export default function StudentDashboard({ name }: { name: string }) {
  const [tab, setTab] = useState<"overview" | "profile" | "documents">("overview");
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [skillsText, setSkillsText] = useState("");
  const [apps, setApps] = useState<App[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    (async () => {
      const [p, a, n] = await Promise.all([
        fetch("/api/profile").then((r) => r.json()),
        fetch("/api/applications").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
      ]);
      if (p.profile) {
        setProfile({ ...EMPTY, ...p.profile });
        setSkillsText((p.profile.skills ?? []).join(", "));
      }
      setApps(a.applications ?? []);
      setNotifs(n.notifications ?? []);
    })();
  }, []);

  async function save() {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, skills: skillsText }),
    });
    setSaved(res.ok ? "Profile saved." : "Save failed.");
    setTimeout(() => setSaved(""), 3000);
  }

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  const stats = [
    { label: "Applications", value: apps.length },
    { label: "Interviews", value: apps.filter((a) => a.stage === "interview").length },
    { label: "Offers / hired", value: apps.filter((a) => ["offer", "hired"].includes(a.stage)).length },
    { label: "Avg. match", value: `${apps.length ? Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length) : 0}%` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0F2537]">Welcome back, {name.split(" ")[0]}</h1>
      <p className="text-sm text-slate-500 mt-1">Manage your portfolio, documents and live applications.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">{s.label}</p>
            <p className="text-3xl font-extrabold text-[#0F2537] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-200">
        {([["overview", "Applications", ListChecks], ["profile", "Profile", UserCircle2], ["documents", "Documents", FileText]] as const).map(
          ([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
                tab === k ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent text-slate-500"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ),
        )}
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {tab === "overview" && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Position</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Match</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Interview</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-semibold text-[#0F2537]">{a.jobTitle}</td>
                      <td className="px-5 py-3 text-slate-500">{a.companyName}</td>
                      <td className="px-5 py-3">{a.matchScore}%</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STAGE_COLORS[a.stage]}`}>{a.stage}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {a.interviewAt ? new Date(a.interviewAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {!apps.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No applications yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === "profile" && (
            <div className="card p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Headline" value={profile.headline ?? ""} onChange={(v) => set("headline", v)} />
                <Field label="Location" value={profile.location ?? ""} onChange={(v) => set("location", v)} />
                <Field label="University" value={profile.university ?? ""} onChange={(v) => set("university", v)} />
                <Field label="Degree" value={profile.degree ?? ""} onChange={(v) => set("degree", v)} />
                <Field label="Graduation year" value={String(profile.graduationYear ?? "")} onChange={(v) => set("graduationYear", v ? Number(v) : null)} />
                <Field label="GPA" value={profile.gpa ?? ""} onChange={(v) => set("gpa", v)} />
                <Field label="Phone" value={profile.phone ?? ""} onChange={(v) => set("phone", v)} />
                <Field label="Portfolio URL" value={profile.portfolioUrl ?? ""} onChange={(v) => set("portfolioUrl", v)} />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input mt-1 h-28" value={profile.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
              </div>
              <div>
                <label className="label">Skill tags (comma separated)</label>
                <input className="input mt-1" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-2">
                  {skillsText.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="rounded-full bg-blue-50 text-[#1E3A8A] px-2.5 py-1 text-xs font-semibold">{s}</span>
                  ))}
                </div>
              </div>
              <button onClick={save} className="btn-primary inline-flex items-center gap-2"><Save size={15} /> Save profile</button>
              {saved && <span className="ml-3 text-sm text-emerald-600">{saved}</span>}
            </div>
          )}

          {tab === "documents" && (
            <div className="card p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Link or upload your PDF/Word CV, academic transcript and certificates into the secure repository.
              </p>
              <Field label="CV / Resume URL (PDF or Word)" value={profile.cvUrl ?? ""} onChange={(v) => set("cvUrl", v)} />
              <Field label="Academic transcript URL" value={profile.transcriptUrl ?? ""} onChange={(v) => set("transcriptUrl", v)} />
              <div>
                <label className="label">Upload file (demo)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="input mt-1"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) set("cvUrl", `/uploads/${f.name}`);
                  }}
                />
              </div>
              <button onClick={save} className="btn-primary inline-flex items-center gap-2"><Save size={15} /> Save documents</button>
              {saved && <span className="ml-3 text-sm text-emerald-600">{saved}</span>}
            </div>
          )}
        </div>

        <aside className="card p-5 h-fit">
          <p className="font-bold text-[#0F2537] flex items-center gap-2"><Bell size={16} /> Notifications</p>
          <ul className="mt-4 space-y-3">
            {notifs.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-[#0F2537]">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
              </li>
            ))}
            {!notifs.length && <li className="text-sm text-slate-500">No alerts yet.</li>}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
