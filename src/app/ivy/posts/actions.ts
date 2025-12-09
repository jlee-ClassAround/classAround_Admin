'use server';

import { ivyDb } from '@/lib/ivyDb';
import { PostSchema } from '@/lib/ivy/schemas';

export async function createPost(data: PostSchema) {
    await ivyDb.post.create({
        data,
    });
}

export async function updatePost(id: number, data: PostSchema) {
    await ivyDb.post.update({
        where: { id },
        data,
    });
}

export async function deletePost(id: number) {
    await ivyDb.post.delete({
        where: { id },
    });
}

export async function deleteManyPost(ids: number[]) {
    await ivyDb.post.deleteMany({
        where: { id: { in: ids } },
    });
}
