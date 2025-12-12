import 'server-only';
import { PrismaClient as MySQLPrisma } from '@prisma/mysql-client';

declare global {
    var mysqlPrisma: MySQLPrisma | undefined;
}

export const mysqlDb = globalThis.mysqlPrisma ?? new MySQLPrisma();

if (process.env.NODE_ENV !== 'production') {
    globalThis.mysqlPrisma = mysqlDb;
}
