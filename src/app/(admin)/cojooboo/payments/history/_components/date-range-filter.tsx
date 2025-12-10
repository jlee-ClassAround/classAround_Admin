"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function DateRangeFilter({ date, onDateChange }: DateRangeFilterProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PPP", { locale: ko })} -{" "}
                  {format(date.to, "PPP", { locale: ko })}
                </>
              ) : (
                format(date.from, "PPP", { locale: ko })
              )
            ) : (
              <span>기간 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
