import { getIsAdmin } from "@/utils/auth/is-admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return redirect("/");

  return <div className="light text-foreground bg-background">{children}</div>;
}
