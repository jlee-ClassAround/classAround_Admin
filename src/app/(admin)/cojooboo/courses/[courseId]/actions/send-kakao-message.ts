'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { sendKakaoAlimtalk } from '@/lib/cojooboo/solapi';

export async function sendKakaoMessageAction({
    templateId,
    sendDatas,
}: {
    templateId: string;
    sendDatas: {
        to: string;
        username?: string;
    }[];
}) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }

    try {
        await sendKakaoAlimtalk({
            templateId,
            sendDatas,
        });

        return { success: true };
    } catch (error) {
        console.error('[SEND_KAKAO_ERROR]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}
