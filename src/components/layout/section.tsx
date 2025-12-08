import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  children,
  className,
  ...props
}: Props & ComponentProps<"section">) {
  return (
    <section
      className={cn(className, "py-10 md:py-20 space-y-3 md:space-y-5")}
      {...props}
    >
      {children}
    </section>
  );
}
