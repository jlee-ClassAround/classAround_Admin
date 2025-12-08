"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, CircleUser, House, LogOut } from "lucide-react";
import { UserLogout } from "@/utils/auth/user-logout";

export function AdminFooterMenu() {
  const sidebar = useSidebar();

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
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem asChild>
              <button
                onClick={() => {
                  sidebar.setOpenMobile(false);
                  // router.push 사용할 경우 모바일에서 사이드바 푸터 -> 드롭다운 박스 -> 메인으로 가기 클릭시 메인에서 아무것도 클릭이 안됨
                  // router.push("/");
                  window.location.href = "/";
                }}
                className="w-full"
              >
                <House />
                <span className="truncate">메인으로 나가기</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button onClick={UserLogout} className="w-full">
                <LogOut />
                <span>로그아웃</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
