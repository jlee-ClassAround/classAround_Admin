import { AdminSidebar } from "@/app/(admin)/_components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider disableShortcuts>
        <AdminSidebar />
        <div className="relative w-full">
          <div className="sticky top-0 left-0 w-full h-12 z-10 flex items-center px-2 bg-neutral-50 border-b">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          </div>
          <div className="bg-slate-100 h-full">
            <div className="max-w-[1200px] mx-auto px-5 py-10 h-full w-full">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
      <Toaster richColors theme="light" />
    </>
  );
}
