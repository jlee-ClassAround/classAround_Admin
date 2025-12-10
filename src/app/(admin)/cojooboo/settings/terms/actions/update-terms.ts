'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { TermsSchema } from '@/lib/cojooboo/schemas';
import { revalidatePath } from 'next/cache';

interface Props {
    id: number;
    values: TermsSchema;
}

export async function updateTerms({ id, values }: Props) {
    await cojoobooDb.terms.upsert({
        where: { id },
        update: values,
        create: {
            id,
            ...values,
        },
    });

    revalidatePath('/cojooboo/settings/terms');

    revalidatePath('/terms-of-use');
    revalidatePath('/privacy-policy');
    revalidatePath('/refund-policy');
}
