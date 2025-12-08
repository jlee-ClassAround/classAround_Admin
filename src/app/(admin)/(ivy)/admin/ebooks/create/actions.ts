"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, { message: "제목은 필수 입력 항목입니다." });

export async function createEbook(_: any, formData: FormData) {
  const title = formData.get("title");

  const result = titleSchema.safeParse(title);

  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().formErrors,
    };
  }

  const ebook = await db.ebook.create({
    data: {
      title: result.data,
    },
    select: {
      id: true,
    },
  });

  return redirect(`/admin/ebooks/${ebook.id}`);
}
