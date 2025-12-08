"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserDataSchema, userDataSchema } from "@/validations/schemas";
import { User } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateUser } from "../../_actions/update-user";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Props {
  initialData: User;
}

export default function UserForm({ initialData }: Props) {
  const router = useRouter();
  const { mutate: mutateUpdateUser, isPending } = useMutation({
    mutationFn: (values: UserDataSchema) => updateUser(initialData.id, values),
  });

  const form = useForm<UserDataSchema>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      ...initialData,
      username: initialData.username ?? "",
      email: initialData.email ?? "",
      phone: initialData.phone ?? "",
      nickname: initialData.nickname ?? "",
    },
  });

  const onSubmit = (values: UserDataSchema) => {
    mutateUpdateUser(values, {
      onSuccess: () => {
        toast.success("정상적으로 처리되었습니다.");
        router.push("/admin/users/all");
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        toast.error("오류가 발생했습니다.");
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전화번호</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            저장
          </Button>
        </div>
      </form>
    </Form>
  );
}
