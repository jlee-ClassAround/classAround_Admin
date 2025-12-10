"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export interface CourseOption {
  id: string;
  title: string;
}

interface CourseFilterProps {
  courseOptions: CourseOption[];
}

export function CourseFilter({ courseOptions }: CourseFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCourseId = searchParams.get("courseId") || "ALL";

  const onCourseChange = (courseId: string) => {
    const params = new URLSearchParams(searchParams);
    if (courseId === "ALL") {
      params.delete("courseId");
    } else {
      params.set("courseId", courseId);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentCourseId} onValueChange={onCourseChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="강의 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">전체 강의</SelectItem>
        {courseOptions.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
