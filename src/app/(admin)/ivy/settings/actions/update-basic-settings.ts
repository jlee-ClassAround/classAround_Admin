'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';
import { SiteSettingSchema } from '@/lib/ivy/schemas';
import { revalidateTag } from 'next/cache';

export const updateBasicSettings = async (values: SiteSettingSchema) => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.siteSetting.upsert({
        where: {
            id: 1,
        },
        update: {
            ...values,
        },
        create: {
            id: 1,
            ...values,
        },
    });

    revalidateTag('site-setting');

    return true;
};
