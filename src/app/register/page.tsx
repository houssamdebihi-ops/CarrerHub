"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Registration failed");
    router.push(form.role === "recruiter" ? "/recruiter" : form.role === "admin" ? "/admin" : "/student");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-[#0F2537]">Create your account</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Account type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {["student", "recruiter", "admin"].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => set("role", r)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize ${
                    form.role === r ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "border-slate-300 text-slate-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input mt-1" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </div>
          {form.role === "recruiter" && (
            <div>
              <label className="label">Company name</label>
              <input className="input mt-1" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input mt-1" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" minLength={6} className="input mt-1" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          Already registered? <Link href="/login" className="text-[#1E3A8A] font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
