"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-y-10 bg-primary/10">
      <h1 className="text-9xl font-bold text-primary">Error</h1>
      <p className="text-2xl font-bold">오류가 발생했습니다.</p>
      <Button size="lg" className="h-14 text-lg font-semibold" asChild>
        <Link href="/">메인으로 돌아가기</Link>
      </Button>
    </div>
  );
}
