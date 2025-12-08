"use client";

import { DatePickerComponent } from "@/components/common/date-picker-component";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { enrollUserInCourse } from "../../actions";
import { enrollFormSchema, EnrollFormSchema } from "../../schemas";
import { getUsersWithPhone } from "../actions";
import { FileUploadModal } from "./file-upload-modal";
import { UserSearchCommand } from "./user-search-command";

interface Props {
  courses: {
    id: string;
    title: string;
  }[];
  users: {
    id: string;
    username: string | null;
    email: string | null;
    phone: string | null;
  }[];
}

export function EnrollForm({ courses, users }: Props) {
  const router = useRouter();
  const [enrolledUsers, setEnrolledUsers] = useState<string[]>([]);

  const form = useForm<EnrollFormSchema>({
    resolver: zodResolver(enrollFormSchema),
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: EnrollFormSchema) => {
    try {
      const result = await enrollUserInCourse(values);

      if (!result.success) {
        setEnrolledUsers(result.data || []);
        const enrolledUsers = result.data?.map((id) => {
          const user = form.getValues("userIds").find((user) => user.id === id);
          if (user) {
            return user;
          }
        });

        toast.error(
          `${enrolledUsers
            ?.map((user) => user?.label)
            .join(", ")} 님은 이미 등록된 수강생입니다.`
        );

        return;
      }

      toast.success("강의 등록에 성공했습니다.");
      router.push("/admin/courses/enrollments");
    } catch {
      toast.error("강의 등록에 실패했습니다.");
    }
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // 전화번호 컬럼 찾기 (phone, 전화번호, 연락처 등의 컬럼명 지원)
          const phoneColumnName = Object.keys(
            jsonData[0] as Record<string, any>
          ).find((key) =>
            ["phone", "전화번호", "연락처", "tel"].includes(key.toLowerCase())
          );

          if (!phoneColumnName) {
            toast.error("전화번호 컬럼을 찾을 수 없습니다.");
            return;
          }

          const phoneArr = jsonData
            .map((row: any) =>
              row[phoneColumnName]
                ?.toString()
                .replace(/[^0-9]/g, "")
                .replace(/^82/, "0")
                .replace(/^1/, "01")
            )
            .filter((phone) => phone !== undefined);

          const users = await getUsersWithPhone(phoneArr);

          // 전화번호로 사용자 매칭
          const matchedUsers = users.map((user) => ({
            id: user.id,
            label: `${user.username || "이름 없음"} (${
              user.phone || "휴대폰 없음"
            }) (${user.email || "이메일 없음"})`,
          }));

          if (matchedUsers.length === 0) {
            toast.error("매칭되는 사용자가 없습니다.");
            return;
          }

          form.setValue("userIds", matchedUsers);
          toast.success(`${matchedUsers.length}명의 사용자를 찾았습니다.`);
        } catch {
          toast.error("파일 처리 중 오류가 발생했습니다.");
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>강의 선택</FormLabel>
              <FormControl>
                <Combobox
                  options={courses.map((course) => ({
                    label: course.title,
                    value: course.id,
                  }))}
                  onChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>등록할 강의를 선택해주세요.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>사용자 선택</FormLabel>
                <FileUploadModal handleFileUpload={handleFileUpload} />
              </div>
              <FormControl>
                <UserSearchCommand
                  options={users.map((user) => ({
                    id: user.id,
                    label: `${user.username || "이름 없음"} (${
                      user.phone || "휴대폰 없음"
                    }) (${user.email || "이메일 없음"})`,
                  }))}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>등록할 사용자를 선택해주세요.</FormDescription>
              <div className="text-sm">선택된 사용자목록</div>
              <div className="flex items-center flex-wrap gap-1">
                {field.value && field.value.length > 0 ? (
                  field.value.map((user) => {
                    const isEnrolled = enrolledUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={cn(
                          "text-xs bg-foreground/5 text-foreground/80 rounded-full py-1 px-1 whitespace-nowrap flex flex-nowrap items-center gap-1 border transition",
                          isEnrolled && "border-red-300 bg-red-50"
                        )}
                      >
                        {user.label}
                        <XIcon
                          className="size-4 cursor-pointer border border-foreground/20 rounded-full p-0.5 hover:bg-foreground/20 transition-colors"
                          onClick={() => {
                            field.onChange(
                              field.value?.filter((val) => val.id !== user.id)
                            );
                          }}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-foreground/50">
                    선택된 사용자가 없습니다.
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block">수강 만료 날짜</FormLabel>
              <FormControl>
                <DatePickerComponent
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  placeholder="수강 만료 날짜를 선택해주세요."
                  className="w-[300px]"
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                선택하지 않으면 제한 없이 수강할 수 있습니다.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : "등록"}
        </Button>
      </form>
    </Form>
  );
}
