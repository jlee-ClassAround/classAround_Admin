import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-y-10 bg-neutral-700 text-neutral-100">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <p className="text-2xl font-bold">페이지를 찾을 수 없습니다.</p>
      <Button size="lg" className="h-14 text-lg font-semibold" asChild>
        <Link href="/">메인으로 돌아가기</Link>
      </Button>
    </div>
  );
}
