"use server";

import { db } from "@/lib/db";
import { PostSchema } from "@/validations/schemas";

export async function createPost(data: PostSchema) {
  await db.post.create({
    data,
  });
}

export async function updatePost(id: number, data: PostSchema) {
  await db.post.update({
    where: { id },
    data,
  });
}

export async function deletePost(id: number) {
  await db.post.delete({
    where: { id },
  });
}

export async function deleteManyPost(ids: number[]) {
  await db.post.deleteMany({
    where: { id: { in: ids } },
  });
}
