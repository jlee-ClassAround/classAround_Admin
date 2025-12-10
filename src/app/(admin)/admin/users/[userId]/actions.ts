'use server';

import { caDb } from '@/lib/caDb';

import { UserDataSchema } from '@/validations/schemas';
import { getIsSuperAdmin } from '@/utils/auth/is-super-admin';
import { getIsAdmin } from '@/lib/is-admin';

async function ensureSuperAdminPrivileges() {
    const isSuperAdmin = await getIsSuperAdmin();
    if (!isSuperAdmin) {
        throw new Error('Unauthorized');
    }
}

function normalizeRoleId(roleId: string | null | undefined) {
    if (!roleId || roleId === 'none') {
        return null;
    }

    return roleId;
}

export async function updateUserRole(userId: string, nextRoleId: string | null) {
    await ensureSuperAdminPrivileges();

    const targetUser = await caDb.user.findUnique({
        where: { id: userId },
        select: { id: true, roleId: true },
    });

    if (!targetUser) {
        throw new Error('User not found');
    }

    const normalizedNextRoleId = normalizeRoleId(nextRoleId);

    if (targetUser.roleId === 'super-admin' && normalizedNextRoleId !== 'super-admin') {
        throw new Error('슈퍼 관리자의 권한은 변경할 수 없습니다.');
    }

    if (targetUser.roleId === normalizedNextRoleId) {
        return true;
    }

    const availableRoles = await caDb.role
        .findMany({
            select: { id: true },
        })
        .then((roles) => roles.map((role) => role.id));

    if (normalizedNextRoleId && !availableRoles.includes(normalizedNextRoleId)) {
        throw new Error('지원하지 않는 권한입니다.');
    }

    await caDb.user.update({
        where: { id: userId },
        data: {
            roleId: normalizedNextRoleId ?? '',
        },
    });

    return true;
}

export async function updateUser(userId: string, values: UserDataSchema) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await caDb.user.update({
        where: { id: userId },
        data: values,
    });

    return true;
}

export async function deleteUsers(userIds: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const targetUsers = await caDb.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, roleId: true },
    });

    if (!targetUsers.length) {
        throw new Error('삭제할 사용자를 찾을 수 없습니다.');
    }

    const hasSuperAdmin = targetUsers.some((user) => user.roleId === 'superadmin');

    if (hasSuperAdmin) {
        throw new Error('슈퍼 관리자 계정은 삭제할 수 없습니다.');
    }

    await caDb.user.deleteMany({
        where: { id: { in: userIds } },
    });
}
