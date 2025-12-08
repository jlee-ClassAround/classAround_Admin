"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface Props {
  endDate: Date;
  color?: "white" | "black";
}

export function CountdownDisplay({ endDate, color = "black" }: Props) {
  const timeLeft = useCountdown(endDate);
  if (!timeLeft)
    return (
      <div
        className={cn(
          "w-full text-center text-gray-500 font-medium bg-gray-100 p-2 rounded-md",
          color === "white" && "bg-gray-600 text-gray-200"
        )}
      >
        신청이 마감되었습니다 😭
      </div>
    );
  const countNumberStyle =
    "md:py-1 md:px-2 md:rounded-md md:bg-red-100 text-sm leading-tight font-bold text-red-500 text-nowrap";

  return (
    <div className="flex items-center gap-1">
      {timeLeft.days > 0 && (
        <span className={countNumberStyle}>{timeLeft.days}일</span>
      )}
      <span className={countNumberStyle}>
        {String(timeLeft.hours).padStart(2, "0")}시간
      </span>
      <span className={countNumberStyle}>
        {String(timeLeft.minutes).padStart(2, "0")}분
      </span>
      <span className={countNumberStyle}>
        {String(timeLeft.seconds).padStart(2, "0")}초
      </span>
      <span
        className={cn("text-sm font-bold", color === "white" && "text-white")}
      >
        후에 마감됩니다!
      </span>
    </div>
  );
}
