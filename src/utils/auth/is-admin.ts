import { db } from "../../lib/db";
import { getSession } from "../../lib/session";

export const getIsAdmin = async () => {
  try {
    const session = await getSession();
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        roleId: true,
      },
    });

    return Boolean(
      user?.roleId && (user.roleId === "admin" || user.roleId === "super-admin")
    );
  } catch {
    return false;
  }
};
