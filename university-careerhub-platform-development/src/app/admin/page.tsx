import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminConsole from "@/components/AdminConsole";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect(session.role === "recruiter" ? "/recruiter" : "/student");
  return <AdminConsole />;
}
