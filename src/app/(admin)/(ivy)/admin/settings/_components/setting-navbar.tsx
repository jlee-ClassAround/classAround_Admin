"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const settingNavbarItems = [
  {
    label: "기본 설정",
    href: "/admin/settings/basic",
  },
  {
    label: "사업자정보",
    href: "/admin/settings/business",
  },
  {
    label: "상품 설정",
    href: "/admin/settings/product",
  },
  {
    label: "계좌 정보",
    href: "/admin/settings/account",
  },
];

export default function SettingNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      {settingNavbarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-foreground/75 text-sm font-medium hover:text-primary pb-2 border-b-2 border-transparent transition",
              isActive && "text-primary border-b-primary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
