'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { adminMenuGroups } from '@/constants/admin-menus';

export function AdminRoutes() {
    const pathname = usePathname();

    return (
        <>
            {adminMenuGroups.map((group) => {
                const isGroupActive = pathname.includes(`/${group.prefix}`);

                return (
                    <Collapsible
                        key={group.prefix}
                        defaultOpen={isGroupActive}
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupContent>
                                {/* ------------------------------
                    그룹 헤더 (코주부 / 아이비)
                ------------------------------ */}
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="font-bold">
                                        <group.icon className="w-4 h-4 mr-2" />
                                        <span>{group.title}</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    {group.menus.map((menu) => {
                                        const isMenuActive =
                                            pathname === menu.href ||
                                            pathname.startsWith(menu.href);

                                        /** -----------------------------------------
                     * 1) 대시보드 메뉴 (subMenus 없음 → 단일 버튼)
                     ----------------------------------------- */
                                        if (menu.subMenus.length === 0) {
                                            return (
                                                <SidebarMenuItem key={menu.href} className="ml-2">
                                                    <SidebarMenuButton asChild>
                                                        <Link href={menu.href}>
                                                            <menu.icon
                                                                className={cn(
                                                                    'w-4 h-4 mr-2',
                                                                    isMenuActive && 'text-primary'
                                                                )}
                                                            />
                                                            <span
                                                                className={cn(
                                                                    isMenuActive &&
                                                                        'font-semibold text-primary'
                                                                )}
                                                            >
                                                                {menu.label}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        }

                                        /** -----------------------------------------
                     * 2) 일반 카테고리 메뉴 (접힘 기능 포함)
                     ----------------------------------------- */
                                        return (
                                            <Collapsible
                                                key={menu.href}
                                                defaultOpen={isMenuActive}
                                                className="ml-2 group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton>
                                                            <menu.icon
                                                                className={cn(
                                                                    'w-4 h-4 mr-2',
                                                                    isMenuActive && 'text-primary'
                                                                )}
                                                            />
                                                            <span
                                                                className={cn(
                                                                    isMenuActive &&
                                                                        'font-semibold text-primary'
                                                                )}
                                                            >
                                                                {menu.label}
                                                            </span>
                                                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {menu.subMenus.map((sub) => {
                                                                const isSubActive =
                                                                    pathname === sub.href;

                                                                return (
                                                                    <SidebarMenuSubItem
                                                                        key={sub.href}
                                                                    >
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                        >
                                                                            <Link href={sub.href}>
                                                                                <span
                                                                                    className={cn(
                                                                                        isSubActive &&
                                                                                            'text-primary font-semibold'
                                                                                    )}
                                                                                >
                                                                                    {sub.label}
                                                                                </span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                );
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    })}
                                </CollapsibleContent>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </Collapsible>
                );
            })}
        </>
    );
}
