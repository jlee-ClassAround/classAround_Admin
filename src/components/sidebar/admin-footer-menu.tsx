'use client';

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUp, CircleUser, House, LogOut, UserRoundPen } from 'lucide-react';
import { UserLogout } from '@/utils/auth/user-logout';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';

export function AdminFooterMenu() {
    const sidebar = useSidebar();
    const router = useRouter();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton>
                            <CircleUser />
                            <span>계정</span>
                            <ChevronUp className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                        <DropdownMenuItem asChild></DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <button onClick={UserLogout} className="w-full">
                                <LogOut />
                                <span>로그아웃</span>
                            </button>
                            <button onClick={() => router.push(`/admin/edit`)} className="w-full">
                                <UserRoundPen />
                                <span>개인정보 수정</span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
