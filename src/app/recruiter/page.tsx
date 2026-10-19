import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RecruiterPortal from "@/components/RecruiterPortal";

export default async function RecruiterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "recruiter") redirect(session.role === "admin" ? "/admin" : "/student");
  return <RecruiterPortal name={session.fullName} />;
}
