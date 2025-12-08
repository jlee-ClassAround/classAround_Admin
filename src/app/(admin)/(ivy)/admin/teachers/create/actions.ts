"use server";

import { db } from "@/lib/db";
import { teacherSchema } from "@/validations/schemas";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function createTeacherAction(_: any, formData: FormData) {
  const data = Object.fromEntries(formData);

  const result = teacherSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const teacher = await db.teacher.create({
    data: {
      name: result.data.name,
    },
    select: {
      id: true,
    },
  });

  revalidateTag("main-teachers");
  revalidateTag("teachers");

  return redirect(`/admin/teachers/${teacher.id}`);
}
