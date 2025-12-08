// lib/db-context.ts
import { ivyDb } from './ivyDb';
import { cojoobooDb } from './cojoobooDb';

export type TenantType = 'ivy' | 'cojooboo';

export function getDb(tenant: TenantType) {
    return tenant === 'ivy' ? ivyDb : cojoobooDb;
}

export function getTenantFromPath(path: string): TenantType {
    if (path.startsWith('/ivy')) return 'ivy';
    if (path.startsWith('/cojooboo')) return 'cojooboo';
    return 'ivy'; // default
}
