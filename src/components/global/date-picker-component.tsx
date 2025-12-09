"use client";

import { cn } from "@/lib/utils";
import { ko } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  value: Date | null | undefined;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePickerComponent({
  value,
  onChange,
  disabled = false,
  className,
  placeholder,
}: Props) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      dateFormat="yyyy년 MM월 dd일 aa h:mm"
      dateFormatCalendar="yyyy년 MM월"
      timeFormat="aa h:mm"
      timeCaption="시간"
      locale={ko}
      placeholderText={placeholder}
      disabled={disabled}
      className={cn(
        "text-sm font-medium border rounded-md py-2 px-3 outline-none placeholder:text-sm w-full",
        disabled && "text-gray-400",
        className
      )}
    />
  );
}
