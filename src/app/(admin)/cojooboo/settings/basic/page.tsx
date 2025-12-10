import { Card } from '@/components/ui/card';
import { SettingForm } from './_components/setting-form';
import { cojoobooDb } from '@/lib/cojoobooDb';

export default async function BasicSettingsPage() {
    const siteSetting = await cojoobooDb.siteSetting.findUnique({
        where: {
            id: 1,
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">사이트 기본 설정</h1>
            </div>
            <SettingForm initialData={siteSetting} />
        </div>
    );
}
