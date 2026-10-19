"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, LayoutDashboard, Search, Building2, ShieldCheck } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

export default function NavBar({ session }: { session: SessionUser | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: "/jobs", label: "Job Directory", icon: <Search size={16} /> },
  ];
  if (session?.role === "student")
    links.push({ href: "/student", label: "My Dashboard", icon: <LayoutDashboard size={16} /> });
  if (session?.role === "recruiter")
    links.push({ href: "/recruiter", label: "Recruiter Portal", icon: <Building2 size={16} /> });
  if (session?.role === "admin")
    links.push({ href: "/admin", label: "Admin Console", icon: <ShieldCheck size={16} /> });

  return (
    <header className="bg-[#0F2537] text-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="bg-[#1E3A8A] rounded-lg p-1.5">
            <GraduationCap size={18} />
          </span>
          <span className="hidden sm:inline">University CareerHub</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 transition"
            >
              {l.icon}
              <span className="hidden md:inline">{l.label}</span>
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="hidden lg:flex flex-col leading-tight text-right">
                <span className="text-xs font-semibold">{session.fullName}</span>
                <span className="text-[10px] uppercase text-slate-400">{session.role}</span>
              </span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-white/10">
                Sign in
              </Link>
              <Link href="/register" className="bg-[#1E3A8A] px-3 py-2 rounded-lg font-semibold">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
