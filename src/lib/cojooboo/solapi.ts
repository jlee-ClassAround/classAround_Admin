import { SolapiMessageService } from 'solapi';

export const solapi = new SolapiMessageService(
    process.env.SOLAPI_API_KEY!,
    process.env.SOLAPI_API_SECRET!
);

export function sendKakaoAlimtalk({
    templateId,
    sendDatas,
}: {
    templateId: string;
    sendDatas: {
        to: string;
        username?: string;
    }[];
}) {
    solapi.send(
        sendDatas.map((data) => ({
            to: data.to,
            from: process.env.SOLAPI_FROM_NUMBER!,
            kakaoOptions: {
                pfId: process.env.KAKAO_CHANNEL_PFID!,
                templateId,
                variables: {
                    '#{name}': data.username || '고객',
                },
            },
        }))
    );
}
