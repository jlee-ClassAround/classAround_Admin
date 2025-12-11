import 'server-only';
import { PrismaClient as ClassAroundPrisma } from '@prisma/classaround-client';

declare global {
    var caPrisma: ClassAroundPrisma | undefined;
}

export const caDb = globalThis.caPrisma ?? new ClassAroundPrisma();

if (process.env.NODE_ENV !== 'production') globalThis.caPrisma = caDb;
