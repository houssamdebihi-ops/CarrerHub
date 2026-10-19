import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "University CareerHub — Student Internships & Jobs Platform",
  description:
    "Enterprise platform bridging university students and corporate recruiters. Developed by Team 06.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="min-h-screen antialiased flex flex-col">
        <NavBar session={session} />
        <main className="flex-1">{children}</main>
        <footer className="bg-[#0F2537] text-slate-300 mt-16">
          <div className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3 text-sm">
            <div>
              <p className="text-white font-bold text-base">University CareerHub</p>
              <p className="mt-2 text-slate-400">
                Enterprise internship &amp; recruitment platform for universities and corporate partners.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold">Team 06</p>
              <ul className="mt-2 space-y-1 text-slate-400">
                <li>SAIDI Hania — Team Leader</li>
                <li>ANEB Kaouther</li>
                <li>DEBIHI Houssam Sadjed</li>
                <li>KAHLERRAS Houd</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold">Modules</p>
              <p className="mt-2 text-slate-400">
                Profiles · Recruiter Portal · ATS · Skill Matching · Admin · Documents · Scheduling ·
                Search · RBAC · Analytics
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} University CareerHub · 6-month enterprise project lifecycle
          </div>
        </footer>
      </body>
    </html>
  );
}
