import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import { TermsForm } from './_components/terms-form';

export default async function PrivacyPolicyPage() {
    const termsOfUse = await ivyDb.terms.findUnique({
        where: {
            id: 2,
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">서비스 이용약관</h1>
            </div>
            <Card className="p-8">
                <TermsForm initialData={termsOfUse} />
            </Card>
        </div>
    );
}
