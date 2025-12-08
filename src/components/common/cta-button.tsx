import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  label: string;
  link: string;
  className?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  accent?: boolean;
  iconColor?: "white" | "black";
}

export function CTAButton({
  label,
  link,
  className,
  target = "_self",
  accent = false,
  iconColor = "white",
}: Props) {
  return (
    <Link
      href={link}
      target={target}
      className={cn(
        "py-1 md:py-1.5 pl-6 md:pl-7 lg:pl-8 pr-1 md:pr-1.5",
        "rounded-full bg-foreground flex items-center gap-x-6 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <span className="md:text-lg lg:text-xl font-semibold text-background text-nowrap">
        {label}
      </span>
      <div
        className={cn(
          "bg-background text-foreground rounded-full size-8 md:size-10 lg:size-14 flex items-center justify-center ml-auto",
          accent && "bg-primary"
        )}
      >
        <ChevronRight
          className={cn(
            "size-3 md:size-4 stroke-[4px] ml-[2px]",
            iconColor === "black" && "text-background"
          )}
        />
      </div>
    </Link>
  );
}
