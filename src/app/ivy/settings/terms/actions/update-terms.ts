'use server';

import { ivyDb } from '@/lib/ivyDb';
import { TermsSchema } from '@/lib/ivy/schemas';
import { revalidatePath } from 'next/cache';

interface Props {
    id: number;
    values: TermsSchema;
}

export async function updateTerms({ id, values }: Props) {
    await ivyDb.terms.upsert({
        where: { id },
        update: values,
        create: {
            id,
            ...values,
        },
    });

    revalidatePath('/ivy/settings/terms');

    revalidatePath('/terms-of-use');
    revalidatePath('/privacy-policy');
    revalidatePath('/refund-policy');
}
