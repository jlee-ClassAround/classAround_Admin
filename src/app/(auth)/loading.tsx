import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-neutral-800 text-neutral-100">
      <Loader2 className="size-20 animate-spin text-primary stroke-[2px]" />
    </div>
  );
}
