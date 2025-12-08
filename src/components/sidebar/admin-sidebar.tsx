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

export async function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" className="light bg-background z-20">
            <SidebarHeader>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="gap-0">
                <AdminRoutes />
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <AdminFooterMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
