import { getCachedSiteSetting } from "@/queries/global/site-setting";
import ProductForm from "./_components/product-form";

export default async function ProductSettingsPage() {
  const siteSetting = await getCachedSiteSetting();

  return <ProductForm initialData={siteSetting} />;
}
