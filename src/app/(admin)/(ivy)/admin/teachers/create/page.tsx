"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEACHER_NAME_PLACEHOLDER } from "@/constants/validate-message";
import { useActionState } from "react";
import { createTeacherAction } from "./actions";

export default function CreateTeacherPage() {
  const [state, action, isPending] = useActionState(createTeacherAction, null);

  return (
    <div className="p-8 rounded-lg border bg-white shadow-sm">
      <h1 className="mb-4">강사 만들기</h1>
      <div>
        <form action={action} className="space-y-3">
          <Input
            name="name"
            type="text"
            placeholder={TEACHER_NAME_PLACEHOLDER}
            required
          />
          {state?.errors?.name?.map((error) => (
            <div key={error} className="text-sm text-red-600">
              {error}
            </div>
          ))}
          <Button disabled={isPending} type="submit">
            만들기
          </Button>
        </form>
      </div>
    </div>
  );
}
