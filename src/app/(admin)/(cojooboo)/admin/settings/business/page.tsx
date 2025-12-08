import { getCachedSiteSetting } from "@/queries/global/site-setting";
import BusinessForm from "./_components/business-form";

export default async function BusinessInfoPage() {
  const siteSetting = await getCachedSiteSetting();

  return <BusinessForm initialData={siteSetting} />;
}
