import SettingNavbar from "./_components/setting-navbar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold">설정</h1>
      <SettingNavbar />
      {children}
    </div>
  );
}
