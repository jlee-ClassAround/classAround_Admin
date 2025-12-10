'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { PostSchema } from '@/lib/cojooboo/schemas';

export async function createPost(data: PostSchema) {
    await cojoobooDb.post.create({
        data,
    });
}

export async function updatePost(id: number, data: PostSchema) {
    await cojoobooDb.post.update({
        where: { id },
        data,
    });
}

export async function deletePost(id: number) {
    await cojoobooDb.post.delete({
        where: { id },
    });
}

export async function deleteManyPost(ids: number[]) {
    await cojoobooDb.post.deleteMany({
        where: { id: { in: ids } },
    });
}
