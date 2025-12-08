import { db } from "@/lib/db";
import { SettingForm } from "./_components/setting-form";

export default async function BasicSettingsPage() {
  const siteSetting = await db.siteSetting.findUnique({
    where: {
      id: 1,
    },
  });

  return <SettingForm initialData={siteSetting} />;
}
