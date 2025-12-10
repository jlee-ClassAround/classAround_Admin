import { ivyDb } from '@/lib/ivyDb';
import { EbookForm } from './_components/ebook-form';
import { notFound } from 'next/navigation';
import { getCategories } from '../../_actions/categories/get-categories';

export default async function EbookIdPage({
    params,
}: {
    params: Promise<{ [key: string]: string }>;
}) {
    const { ebookId } = await params;
    const ebook = await ivyDb.ebook.findUnique({
        where: {
            id: ebookId,
        },
        include: {
            detailImages: {
                orderBy: {
                    position: 'asc',
                },
            },
            productBadge: true,
        },
    });
    if (!ebook) return notFound();

    const categories = await getCategories({ type: 'EBOOK' });
    const productBadges = await ivyDb.productBadge.findMany();

    return (
        <>
            <EbookForm ebook={ebook} categories={categories} productBadges={productBadges} />
        </>
    );
}
