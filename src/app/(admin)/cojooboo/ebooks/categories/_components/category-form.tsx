"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createCategory } from "../actions";

export function CategoryForm() {
  const [state, action, isPending] = useActionState(createCategory, null);
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    }
    if (state?.success === false) {
      toast.error(state?.message);
    }
  }, [state]);

  return (
    <div>
      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <Input
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder={"카테고리 이름"}
          />
          <p className="text-sm text-red-500">{state?.error?.name}</p>
        </div>
        <Textarea
          name="description"
          disabled={isPending}
          placeholder={"카테고리 설명"}
        />
        <Button variant="secondary" disabled={isPending}>
          만들기
        </Button>
      </form>
    </div>
  );
}
