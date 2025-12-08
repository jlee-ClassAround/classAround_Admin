import { getCachedSiteSetting } from "@/queries/global/site-setting";
import AccountForm from "./_components/account-form";

export default async function AccountInfoPage() {
  const siteSetting = await getCachedSiteSetting();

  return <AccountForm initialData={siteSetting} />;
}
