"use server";

import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, { message: "태그명은 필수 입력 항목입니다." });

export async function createTag(_: any, formData: FormData) {
  const name = formData.get("name");

  const result = nameSchema.safeParse(name);
  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().formErrors,
    };
  }

  // 태그 생성

  return { success: true };
}
