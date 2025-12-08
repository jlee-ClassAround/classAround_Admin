import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Container({
  children,
  className,
  ...props
}: Props & ComponentProps<"div">) {
  return (
    <div className={cn("fit-container", className)} {...props}>
      {children}
    </div>
  );
}
