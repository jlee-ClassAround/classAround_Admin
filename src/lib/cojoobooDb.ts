import 'server-only';

import { PrismaClient } from '@/generated/cojooboo'; // ← cojooboo 출력 경로

declare global {
    var prisma: PrismaClient | undefined;
}

export const cojoobooDb = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = cojoobooDb;
