"use client";

import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { ComponentProps } from "react";
import { toast } from "sonner";

interface Props extends ComponentProps<"div"> {
  copyText?: string | null;
  successMessage: string;
  className?: string;
}

export const AdminCopyButton = ({
  copyText,
  successMessage,
  className,
  ...props
}: Props) => {
  if (!copyText) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 hover:bg-foreground/5 cursor-pointer rounded p-1 transition-colors group select-none",
        className
      )}
      onClick={() => {
        if (copyText) {
          navigator.clipboard.writeText(copyText);
          toast.info(successMessage);
        }
      }}
      {...props}
    >
      <div className="text-xs truncate">{copyText}</div>
      <button
        type="button"
        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <Copy className="size-3" />
      </button>
    </div>
  );
};
