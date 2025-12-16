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

export function AdminRoutes({ currentRole }: { currentRole?: string }) {
    const pathname = usePathname();

    const visibleMenuGroups = adminMenuGroups.filter((group) => {
        if (group.onlySuperAdmin && currentRole !== 'superadmin') return false;
        return true;
    });

    return (
        <>
            {visibleMenuGroups.map((group) => {
                const isGroupActive = pathname.includes(`/${group.prefix}`);

                return (
                    <Collapsible
                        key={group.prefix}
                        defaultOpen={isGroupActive}
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupContent>
                                {/* 그룹 헤더 */}
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="font-bold">
                                        <group.icon className="w-4 h-4 mr-2" />
                                        <span>{group.title}</span>
                                        <ChevronDown
                                            className={cn(
                                                'ml-auto transition-transform duration-200',
                                                'group-data-[state=open]/collapsible:rotate-180'
                                            )}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    {group.menus.map((menu) => {
                                        // 정확한 경로 매칭으로 수정
                                        const isMenuActive = pathname === menu.href;

                                        /* 서브메뉴가 없는 단일 메뉴 */
                                        if (!menu.subMenus || menu.subMenus.length === 0) {
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
                                                                    'text-foreground',
                                                                    isMenuActive && 'font-bold'
                                                                )}
                                                            >
                                                                {menu.label}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        }

                                        /* 서브메뉴가 있는 카테고리 메뉴 */
                                        const hasActiveChild = menu.subMenus?.some(
                                            (sub) =>
                                                pathname === sub.href ||
                                                pathname.startsWith(sub.href || '') ||
                                                sub.subMenus?.some(
                                                    (child) =>
                                                        pathname === child.href ||
                                                        pathname.startsWith(child.href)
                                                )
                                        );

                                        return (
                                            <Collapsible
                                                key={menu.href}
                                                defaultOpen={hasActiveChild}
                                                className="ml-2 group/submenu"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton>
                                                            <menu.icon
                                                                className={cn(
                                                                    'w-4 h-4 mr-2',
                                                                    hasActiveChild && 'text-primary'
                                                                )}
                                                            />
                                                            <span
                                                                className={cn(
                                                                    'text-foreground',
                                                                    hasActiveChild && 'font-bold'
                                                                )}
                                                            >
                                                                {menu.label}
                                                            </span>
                                                            <ChevronDown
                                                                className={cn(
                                                                    'ml-auto transition-transform duration-200',
                                                                    'group-data-[state=open]/submenu:rotate-180'
                                                                )}
                                                            />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {menu.subMenus.map((sub) => {
                                                                const children = sub.subMenus ?? [];
                                                                const hasChildren =
                                                                    children.length > 0;
                                                                const isSubActive =
                                                                    pathname === sub.href;

                                                                return (
                                                                    <SidebarMenuSubItem
                                                                        key={sub.href || sub.label}
                                                                    >
                                                                        {hasChildren ? (
                                                                            /* sub가 카테고리(접힘)인 경우 */
                                                                            <Collapsible className="group/subsubmenu">
                                                                                <CollapsibleTrigger
                                                                                    asChild
                                                                                >
                                                                                    <SidebarMenuSubButton>
                                                                                        <span
                                                                                            className={cn(
                                                                                                'text-foreground',
                                                                                                isSubActive &&
                                                                                                    'font-bold'
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                sub.label
                                                                                            }
                                                                                        </span>
                                                                                        <ChevronDown
                                                                                            className={cn(
                                                                                                'ml-auto w-3 h-3 transition-transform duration-200',
                                                                                                'group-data-[state=open]/subsubmenu:rotate-180'
                                                                                            )}
                                                                                        />
                                                                                    </SidebarMenuSubButton>
                                                                                </CollapsibleTrigger>

                                                                                <CollapsibleContent>
                                                                                    <SidebarMenuSub className="ml-3 mt-1">
                                                                                        {children.map(
                                                                                            (
                                                                                                child
                                                                                            ) => {
                                                                                                const isChildActive =
                                                                                                    pathname ===
                                                                                                    child.href;

                                                                                                return (
                                                                                                    <SidebarMenuSubItem
                                                                                                        key={
                                                                                                            child.href
                                                                                                        }
                                                                                                    >
                                                                                                        <SidebarMenuSubButton
                                                                                                            asChild
                                                                                                        >
                                                                                                            <Link
                                                                                                                href={
                                                                                                                    child.href
                                                                                                                }
                                                                                                            >
                                                                                                                <span
                                                                                                                    className={cn(
                                                                                                                        'text-foreground',
                                                                                                                        isChildActive &&
                                                                                                                            'font-bold'
                                                                                                                    )}
                                                                                                                >
                                                                                                                    {
                                                                                                                        child.label
                                                                                                                    }
                                                                                                                </span>
                                                                                                            </Link>
                                                                                                        </SidebarMenuSubButton>
                                                                                                    </SidebarMenuSubItem>
                                                                                                );
                                                                                            }
                                                                                        )}
                                                                                    </SidebarMenuSub>
                                                                                </CollapsibleContent>
                                                                            </Collapsible>
                                                                        ) : (
                                                                            /* sub가 링크인 경우 */
                                                                            <SidebarMenuSubButton
                                                                                asChild
                                                                            >
                                                                                <Link
                                                                                    href={sub.href}
                                                                                >
                                                                                    <span
                                                                                        className={cn(
                                                                                            'text-foreground',
                                                                                            isSubActive &&
                                                                                                'font-bold'
                                                                                        )}
                                                                                    >
                                                                                        {sub.label}
                                                                                    </span>
                                                                                </Link>
                                                                            </SidebarMenuSubButton>
                                                                        )}
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
