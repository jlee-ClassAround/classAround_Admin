import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";

export async function UserLogin(userId: string, redirectUrl?: string) {
  const session = await getSession();
  session.id = userId;
  await session.save();

  if (redirectUrl) {
    return redirect(redirectUrl);
  }
}
