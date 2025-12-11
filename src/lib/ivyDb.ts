import 'server-only';
import { PrismaClient as IvyPrisma } from '@prisma/ivy-client';

declare global {
    var ivyPrisma: IvyPrisma | undefined;
}

export const ivyDb = globalThis.ivyPrisma ?? new IvyPrisma();

if (process.env.NODE_ENV !== 'production') globalThis.ivyPrisma = ivyDb;
