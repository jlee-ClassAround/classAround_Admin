"use client";

import { updateUserRole } from "../../_actions/update-user-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserRoleManagerProps {
  userId: string;
  roleId: string | null | undefined;
  availableRoles: string[];
}

const ROLE_LABELS: Record<string, string> = {
  "super-admin": "슈퍼 관리자",
  admin: "관리자",
  student: "일반 사용자",
};

const DEFAULT_ROLE_LABEL = "일반 사용자";

export function UserRoleManager({
  userId,
  roleId,
  availableRoles,
}: UserRoleManagerProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(roleId ?? "none");

  const { mutate: mutateUpdateRole, isPending } = useMutation({
    mutationFn: (nextRole: string) =>
      updateUserRole(userId, nextRole === "none" ? null : nextRole),
  });

  const roleLabel = useMemo(() => {
    if (selectedRole === "none") return DEFAULT_ROLE_LABEL;
    return ROLE_LABELS[selectedRole] ?? selectedRole;
  }, [selectedRole]);

  const badgeVariant = useMemo(() => {
    if (selectedRole === "super-admin") return "default" as const;
    if (selectedRole === "admin") return "secondary" as const;
    return "outline" as const;
  }, [selectedRole]);

  const handleSubmit = () => {
    mutateUpdateRole(selectedRole, {
      onSuccess: () => {
        toast.success("권한을 저장했습니다.");
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "권한 변경 중 오류가 발생했습니다."
        );
      },
    });
  };

  const shouldDisableControls =
    roleId === "super-admin" && selectedRole === "super-admin";

  const normalizedRoles = useMemo(() => {
    const roles = new Set(availableRoles);
    return ["none", ...roles];
  }, [availableRoles]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="space-y-2 flex-[3]">
            <h2 className="text-lg font-semibold">권한 관리</h2>
            <p className="text-sm text-muted-foreground">
              슈퍼 관리자만 접근할 수 있는 영역입니다.
            </p>
          </div>
          <div className="space-y-4 flex-[2]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                권한 선택
              </label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={shouldDisableControls || isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="권한을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {normalizedRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "none"
                        ? DEFAULT_ROLE_LABEL
                        : ROLE_LABELS[role] ?? role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full md:w-fit"
              onClick={handleSubmit}
              disabled={isPending || shouldDisableControls}
            >
              저장
            </Button>
            {shouldDisableControls ? (
              <p className="text-xs text-muted-foreground">
                슈퍼 관리자의 권한은 변경할 수 없습니다.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                권한을 저장하면 사용자의 접근 권한이 즉시 반영됩니다.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
