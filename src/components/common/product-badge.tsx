import { cn } from "@/lib/utils";

interface Props {
  label: string;
  backgroundColor: string;
  textColor: string;
  className?: string;
}

export function ProductBadge({
  label,
  backgroundColor,
  textColor,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "text-xs font-bold py-1 px-2 rounded-sm leading-tight",
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {label}
    </div>
  );
}
