import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminButton() {
  return (
    <Button
      asChild
      variant="outline"
      className="fixed top-[50%] right-5 translate-y-[50%] z-50 shadow-lg h-auto"
    >
      <Link href="/admin">
        관리자
        <br />
        페이지
      </Link>
    </Button>
  );
}
