import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import { notFound } from 'next/navigation';
import UserForm from './_components/user-form';

interface Props {
    params: Promise<{
        userId: string;
    }>;
}

export default async function AdminUserIdPage({ params }: Props) {
    const { userId } = await params;

    const user = await ivyDb.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) return notFound();

    return (
        <Card className="p-8">
            <UserForm initialData={user} />
        </Card>
    );
}
