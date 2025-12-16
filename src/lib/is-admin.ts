import { caDb } from '@/lib/caDb';
import { getSession } from './session';

export const getIsAdmin = async () => {
    try {
        const session = await getSession();
        const user = await caDb.user.findUnique({
            where: {
                id: session.id,
            },
            select: {
                roleId: true,
            },
        });

        return Boolean(user?.roleId && (user.roleId === 'admin' || user.roleId === 'superadmin'));
    } catch {
        return false;
    }
    return true;
};
