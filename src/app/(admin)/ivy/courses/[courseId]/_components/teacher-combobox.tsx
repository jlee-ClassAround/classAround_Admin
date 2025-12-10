"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSelectTeachers } from "@/store/use-select-teachers";

interface Props {
  teachers: { name: string; id: string }[];
  disabled?: boolean;
}

export function TeacherCombobox({ teachers, disabled = false }: Props) {
  const [open, setOpen] = React.useState(false);
  const { selectedTeachers, onSelectTeacher, onDeleteTeacher } =
    useSelectTeachers();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between relative"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedTeachers.length > 0
              ? selectedTeachers.map((teacher) => teacher.name).join(", ")
              : "강사를 선택해주세요."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popper-anchor-width] p-0">
        <Command>
          <CommandInput placeholder="강사를 검색해보세요." />
          <CommandList>
            <CommandEmpty>강사가 없습니다.</CommandEmpty>
            <CommandGroup>
              {teachers.map((teacher) => (
                <CommandItem
                  key={teacher.id}
                  onSelect={() => {
                    const isSelected = Boolean(
                      selectedTeachers.find((item) => item.id === teacher.id)
                    );
                    if (isSelected) {
                      onDeleteTeacher(teacher);
                    } else {
                      onSelectTeacher(teacher);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !!selectedTeachers.find(
                        (selectedTeacher) => selectedTeacher.id === teacher.id
                      )
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {teacher.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
