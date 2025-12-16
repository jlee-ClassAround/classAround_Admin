import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';

// import { getIsSuperAdmin } from '@/utils/auth/is-super-admin';
import { AdminFooterMenu } from './admin-footer-menu';
import { AdminRoutes } from './admin-routes';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import Image from 'next/image';

export async function AdminSidebar() {
    const session = await getSession();
    const roleId = session?.roleId;
    console.log(roleId);
    return (
        <Sidebar collapsible="icon" className="light bg-background z-20">
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={120}
                        height={10}
                        className="cursor-pointer object-contain"
                    />
                </Link>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="gap-0">
                <AdminRoutes currentRole={roleId} />
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <AdminFooterMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
