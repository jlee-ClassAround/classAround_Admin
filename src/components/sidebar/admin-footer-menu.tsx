'use client';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUp, CircleUser, LogOut, UserRoundPen } from 'lucide-react';
import { UserLogout } from '@/utils/auth/user-logout';
import { useRouter } from 'next/navigation';

export function AdminFooterMenu() {
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
                        {/* 로그아웃 */}
                        <DropdownMenuItem asChild>
                            <button onClick={UserLogout} className="flex w-full items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span>로그아웃</span>
                            </button>
                        </DropdownMenuItem>

                        {/* 개인정보 수정 */}
                        <DropdownMenuItem asChild>
                            <button
                                onClick={() => router.push(`/admin/users/edit`)}
                                className="flex w-full items-center gap-2"
                            >
                                <UserRoundPen className="w-4 h-4" />
                                <span>개인정보 수정</span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
