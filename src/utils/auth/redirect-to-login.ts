import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const redirectToLogin = async () => {
  const headersList = await headers();
  const referer = headersList.get("referer");
  const url = referer ? new URL(referer) : null;
  const pathname = url ? url?.pathname : "";
  const query = url ? url?.search : "";

  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const origin = `${protocol}://${host}`;

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("redirect", `${pathname}${query}`);
  return redirect(loginUrl.toString());
};
