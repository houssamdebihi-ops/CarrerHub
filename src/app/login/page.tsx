"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@univ.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Login failed");
    const dest = data.user.role === "admin" ? "/admin" : data.user.role === "recruiter" ? "/recruiter" : "/student";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-[#0F2537]">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">Access your CareerHub workspace.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          No account? <Link href="/register" className="text-[#1E3A8A] font-semibold">Register</Link>
        </p>
        <div className="mt-5 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
          Demo: student@univ.edu · recruiter@techcorp.com · admin@careerhub.edu — password123
        </div>
      </div>
    </div>
  );
}
