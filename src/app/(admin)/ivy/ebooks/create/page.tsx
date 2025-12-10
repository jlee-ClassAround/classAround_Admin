"use client";

import { useActionState } from "react";
import { createEbook } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EbookCreatePage() {
  const [state, action, isLoading] = useActionState(createEbook, null);

  return (
    <div className="space-y-5 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">전자책 생성</h1>
      <Card className="p-8">
        <form action={action} className="flex flex-col gap-y-4 items-start">
          <div className="w-full space-y-2">
            <Input name="title" placeholder="제목" disabled={isLoading} />
            {state?.error && (
              <p className="text-red-500 text-xs">{state?.error}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            생성
          </Button>
        </form>
      </Card>
    </div>
  );
}
