"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { adminRoutes } from "@/constants/admin-menus";
import { cn } from "@/lib/utils";
import { ChevronDown, Gauge } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminRoutesProps {
  isSuperAdmin: boolean;
}

export function AdminRoutes({ isSuperAdmin }: AdminRoutesProps) {
  const pathname = usePathname();
  const isDashboardPage = pathname === "/admin";

  return (
    <>
      <SidebarGroup>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/admin">
              <Gauge className={cn(isDashboardPage && "text-primary")} />
              <span className={cn(isDashboardPage && "font-semibold")}>
                대시보드
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroup>
      {adminRoutes.map((menu) => {
        const isActive = pathname?.startsWith(menu.href);
        const visibleSubMenus = menu.subMenus.filter((subMenu) => {
          if (subMenu.onlySuperAdmin) {
            return isSuperAdmin;
          }

          return true;
        });

        if (visibleSubMenus.length === 0) {
          return null;
        }

        return (
          <Collapsible
            key={menu.href}
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <menu.icon className={cn(isActive && "text-primary")} />
                      <span className={cn(isActive && "font-semibold")}>
                        {menu.label}
                      </span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {visibleSubMenus.map((subMenu) => {
                        const isActive = pathname?.startsWith(subMenu.href);

                        return (
                          <SidebarMenuSubItem key={subMenu.href}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subMenu.href}>
                                <span
                                  className={cn(isActive && "text-primary")}
                                >
                                  {subMenu.label}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </SidebarGroupContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </>
  );
}
