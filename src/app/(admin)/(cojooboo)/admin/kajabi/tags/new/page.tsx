"use client";

import { useActionState } from "react";
import { createTag } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewTagPage() {
  const [state, action, isLoading] = useActionState(createTag, null);

  return (
    <div className="max-w-[460px] mx-auto space-y-5">
      <h1 className="text-xl font-semibold">태그 만들기</h1>
      <Card className="p-8">
        <form action={action} className="space-y-3">
          <Input
            name="name"
            placeholder="태그명을 입력해주세요."
            disabled={isLoading}
          />
          {state?.error && (
            <p className="text-red-500 text-xs">{state.error}</p>
          )}

          <Button type="submit" disabled={isLoading}>
            생성
          </Button>
        </form>
      </Card>
    </div>
  );
}
