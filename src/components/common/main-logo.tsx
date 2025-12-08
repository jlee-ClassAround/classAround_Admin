import lightLogo from "@/../public/global/logo__black.svg";
import darkLogo from "@/../public/global/logo__white.svg";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  theme?: "dark" | "light";
  width?: string;
  symbol?: boolean;
}

export function MainLogo({
  theme,
  width = "140",
  symbol = false,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  if (isNaN(Number(width))) {
    return null;
  }

  return (
    <div className="flex gap-x-1 items-center">
      <div
        {...rest}
        className={cn("relative", `w-[${width}px]`, rest.className)}
      >
        <Image
          width={140}
          height={60}
          src={theme === "light" ? lightLogo : darkLogo}
          alt="Main Logo"
          className="w-auto h-auto"
        />
      </div>
    </div>
  );
}
