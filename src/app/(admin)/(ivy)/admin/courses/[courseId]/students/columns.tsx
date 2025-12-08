"use client";

import { EnrolledUser } from "@/actions/users/get-enrolled-users";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { dateFormat, dateTimeFormat } from "@/utils/formats";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Edit, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEnrollment } from "./_actions/delete-enrollment";

export const columns: ColumnDef<EnrolledUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "username",
    meta: {
      label: "이름",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이름" />
    ),
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="max-w-[300px] truncate">
          <Link href={`/admin/users/${data.id}`} className="hover:text-primary">
            {data.username}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    meta: {
      label: "이메일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
    cell: ({ row }) => row.original.email,
  },

  {
    accessorKey: "phone",
    meta: {
      label: "연락처",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="연락처" />
    ),
    cell: ({ row }) => row.original.phone,
  },

  {
    accessorKey: "enrollment.createdAt",
    meta: {
      label: "등록일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="등록일" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.enrollment.createdAt;
      return (
        <div className="text-xs text-muted-foreground">
          {dateFormat(createdAt)}
        </div>
      );
    },
  },

  {
    accessorKey: "enrollment.endDate",
    meta: {
      label: "만료일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="만료일" />
    ),
    cell: ({ row }) => {
      const endDate = row.original.enrollment.endDate;
      return (
        <div className="text-xs text-muted-foreground">
          {endDate ? dateTimeFormat(endDate) : "무제한"}
        </div>
      );
    },
  },

  {
    accessorKey: "progress",
    meta: {
      label: "진행률",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="진행률" />
    ),
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div className="flex items-center gap-x-2">
          <span className="text-xs font-medium">{progress}%</span>
          <Progress value={progress} className="w-[140px]" />
        </div>
      );
    },
  },
  {
    accessorKey: "courseOption.name",
    meta: {
      label: "옵션",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="강의옵션" />
    ),
    cell: ({ row }) => {
      const data = row.original.courseOption;
      return <div className="">{data?.name || "없음"}</div>;
    },
  },

  {
    id: "actions",
    size: 20,
    header: ({ table }) => <ActionHeader table={table} />,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionHeader({ table }: { table: Table<EnrolledUser> }) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;
  const userDatas = selectedRows.map((row) => row.original);

  const handleSendKakaoMessage = async () => {
    try {
      if (!templateId) {
        toast.error("템플릿 ID를 입력해주세요.");
        return;
      }

      setIsLoading(true);
      await fetch("/api/solapi/send-messages", {
        method: "POST",
        body: JSON.stringify({
          templateId,
          sendDatas: userDatas.map((user) => ({
            to: user.phone!,
            username: user.username,
          })),
        }),
      });

      toast.success("알림톡 발송 요청 완료");
      setOpen(false);
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="size-8 relative"
              disabled={selectedRowLength === 0}
            >
              <span className="sr-only">전체 메뉴 열기</span>
              <MoreHorizontal />
              {selectedRowLength > 0 && (
                <div className="absolute -top-1 -right-1 size-4 text-[11px] bg-primary rounded-full text-white aspect-square flex items-center justify-center">
                  {selectedRowLength}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>전체 설정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={true} onClick={() => {}}>
              이메일 보내기 {"(준비중)"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => setOpen(true)}
            >
              카카오 알림톡 보내기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 카카오 알림톡 모달 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림톡 보내기</DialogTitle>
            <DialogDescription>
              선택한 학생들에게 알림톡을 보내시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label>템플릿 ID</Label>
            <Input
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              템플릿 ID는 카카오 알림톡 템플릿 페이지에서 확인할 수 있습니다.
              잘못 입력할 경우 발송되지 않습니다.
              {"(솔라피 링크: https://console.solapi.com/kakao/templates)"}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>

            <Button disabled={isLoading} onClick={handleSendKakaoMessage}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "보내기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionCell({ row }: { row: Row<EnrolledUser> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `정말 ${data.username}님의 수강을 취소하시겠습니까? 삭제된 등록 정보는 되돌릴 수 없습니다. 수강생은 더 이상 강의를 수강할 수 없습니다.`
      )
    )
      return;

    try {
      setIsLoading(true);
      await deleteEnrollment(data.enrollmentId);

      router.refresh();
      toast.success("등록 정보가 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>설정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/users/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              상세보기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
            <Trash2 className="size-4 text-muted-foreground" />
            수강 권한 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
