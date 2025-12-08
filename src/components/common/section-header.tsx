import Image from "next/image";
import { cn } from "@/lib/utils";

import whiteSymbol from "@/../public/global/logo-symbol__white.svg";

interface Props {
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  icon?: boolean;
  badge?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  align = "left",
  icon = false,
  badge,
  size = "lg",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-y-1",
        align === "center" && "items-center",
        align === "right" && "items-end",
        className
      )}
    >
      {badge && (
        <div className="text-primary md:text-lg font-semibold">{badge}</div>
      )}
      <div className="flex items-center gap-x-2">
        {icon && (
          <Image
            width={32}
            height={32}
            src={whiteSymbol}
            alt="Company Symbol"
            draggable={false}
            className={cn(
              "size-6 md:size-8 select-none",
              size === "sm" && "size-5 md:size-6"
            )}
          />
        )}
        <h2
          className={cn(
            "text-2xl md:text-3xl lg:text-[56px] !leading-snug font-nexonWarhaven whitespace-pre-line break-keep",
            size === "sm" && "text-lg md:text-xl lg:text-2xl"
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p
          className={cn(
            "md:text-lg lg:text-2xl text-foreground/70 whitespace-pre-line break-keep",
            align === "center" && "text-center",
            align === "right" && "text-right"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
