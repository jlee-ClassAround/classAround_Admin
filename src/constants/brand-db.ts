import { cojoobooDb } from '@/lib/cojoobooDb';
import { ivyDb } from '@/lib/ivyDb';

export function brandDb(prefix: string) {
    switch (prefix) {
        case 'cojooboo':
            return cojoobooDb;
        case 'ivy':
            return ivyDb;
        default:
            throw new Error(`Unknown brand prefix: ${prefix}`);
    }
}
