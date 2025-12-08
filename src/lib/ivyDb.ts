import 'server-only';
import { PrismaClient } from '@/generated/ivy'; // ← ivy 출력 경로

declare global {
    var ivyPrisma: PrismaClient | undefined;
}

export const ivyDb =
    globalThis.ivyPrisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : [],
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.ivyPrisma = ivyDb;
}
