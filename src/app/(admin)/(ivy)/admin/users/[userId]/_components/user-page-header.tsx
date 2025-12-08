"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  user: User;
}

export function UserPageHeader({ user }: Props) {
  const pathname = usePathname();

  return (
    <div className="space-y-5 mb-6">
      <div className="flex items-center gap-x-3">
        <Avatar className="size-20">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback>{user.username?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-y-1">
          <h1 className="text-xl font-semibold">{user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-x-5 text-sm font-medium">
        <Link
          href={`/admin/users/${user.id}`}
          className={cn(
            "border-b-2 pb-1 border-transparent transition-colors text-gray-500",
            pathname === `/admin/users/${user.id}` &&
              "border-primary text-black"
          )}
        >
          기본 설정
        </Link>
        <Link
          href={`/admin/users/${user.id}/courses`}
          className={cn(
            "border-b-2 pb-1 border-transparent transition-colors text-gray-500",
            pathname === `/admin/users/${user.id}/courses` &&
              "border-primary text-black"
          )}
        >
          등록된 강의
        </Link>
      </div>
    </div>
  );
}
