import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getIsSuperAdmin } from "@/utils/auth/is-super-admin";
import { notFound } from "next/navigation";
import UserForm from "./_components/user-form";
import { UserRoleManager } from "./_components/user-role-manager";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

export default async function AdminUserIdPage({ params }: Props) {
  const { userId } = await params;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) return notFound();

  const canManageRoles = await getIsSuperAdmin();
  const roles = canManageRoles
    ? await db.role.findMany({
        select: {
          id: true,
        },
        orderBy: {
          id: "asc",
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <UserForm initialData={user} />
      </Card>
      {canManageRoles ? (
        <UserRoleManager
          userId={user.id}
          roleId={user.roleId}
          availableRoles={roles.map((role) => role.id)}
        />
      ) : null}
    </div>
  );
}
