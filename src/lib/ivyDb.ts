import 'server-only';
import { PrismaClient as IvyPrisma } from '@/generated/ivy'; // ← ivy 출력 경로

declare global {
    var ivyPrisma: IvyPrisma | undefined;
}

export const ivyDb = globalThis.ivyPrisma ?? new IvyPrisma();

if (process.env.NODE_ENV !== 'production') globalThis.ivyPrisma = ivyDb;
