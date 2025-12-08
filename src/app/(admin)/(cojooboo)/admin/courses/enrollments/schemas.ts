import { z } from "zod";

export const enrollFormSchema = z.object({
  courseId: z.string({
    message: "강의를 선택해주세요.",
  }),
  userIds: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      })
    )
    .min(1, {
      message: "사용자를 최소 한 명 이상 선택해주세요.",
    }),
  endDate: z
    .date({
      message: "정확한 날짜를 선택해주세요.",
    })
    .optional(),
});
export type EnrollFormSchema = z.infer<typeof enrollFormSchema>;
