"use client";

import { useCheckScroll } from "@/hooks/use-check-scroll";
import { cn } from "@/lib/utils";
import { User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainLogo } from "@/components/common/main-logo";
import { SearchInput } from "@/components/common/search-input";

interface Props {
  firstNavs: {
    label: string;
    href: string;
  }[];
  isLoggedIn:
    | {
        userId: string;
      }
    | boolean;
  username: string | null;
}

export function HeaderRowSecond({ firstNavs, isLoggedIn, username }: Props) {
  const pathname = usePathname();
  const isScrolled = useCheckScroll();

  return (
    <div
      className={cn(
        "py-6 border-b border-transparent transition-colors",
        isScrolled && "border-secondary"
      )}
    >
      <div className="fit-container flex items-center justify-between">
        <Link href="/">
          <MainLogo className="w-[120px] md:w-[172px]" theme="dark" />
        </Link>
        <nav className="md:text-xl hidden lg:block">
          <ul className="flex items-center gap-x-10">
            {firstNavs.map((nav) => {
              const isActive = pathname.startsWith(nav.href);
              return (
                <li key={nav.href}>
                  <Link
                    href={nav.href}
                    className={cn(
                      "text-nowrap text-foreground/80 hover:text-primary transition-colors",
                      isActive && "font-bold text-foreground"
                    )}
                  >
                    {nav.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-x-10">
          <SearchInput className="hidden lg:block" />
          {!isLoggedIn ? (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-x-2 hover:text-primary transition-colors",
                pathname.startsWith("/login") && "text-primary"
              )}
            >
              <User2 className="size-6" />
              <span>로그인 / 회원가입</span>
            </Link>
          ) : (
            <Link
              href="/mypage"
              className={cn(
                "flex items-center gap-x-2",
                pathname.startsWith("/mypage") && "text-primary"
              )}
            >
              <User2 className="size-6" />
              <div>
                <span className="font-semibold">{username || "고객"}</span>님
                강의실
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
