import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import StudentDashboard from "@/components/StudentDashboard";

export default async function StudentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect(session.role === "admin" ? "/admin" : "/recruiter");
  return <StudentDashboard name={session.fullName} />;
}
