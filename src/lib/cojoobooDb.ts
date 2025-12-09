import 'server-only';

import { PrismaClient as CojoobooPrisma } from '@/generated/cojooboo';

declare global {
    var cojoobooPrisma: CojoobooPrisma | undefined;
}

export const cojoobooDb = globalThis.cojoobooPrisma ?? new CojoobooPrisma();

if (process.env.NODE_ENV !== 'production') globalThis.cojoobooPrisma = cojoobooDb;
