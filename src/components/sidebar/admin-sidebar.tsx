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
import { SidebarLogo } from './sidebar-logo';

export async function AdminSidebar() {
    const session = await getSession();
    const roleId = session?.roleId;
    return (
        <Sidebar collapsible="icon" className="light bg-background z-20">
            <SidebarHeader>
                <SidebarLogo />
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
