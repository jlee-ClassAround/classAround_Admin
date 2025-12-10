'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { firstRegisterLookupAction } from '../actions';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirstRegisterPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await firstRegisterLookupAction({ phone });

        setLoading(false);

        if (!res?.success) {
            setError(res?.error ?? '알 수 없는 오류');
            return;
        }

        router.push(`/register?id=${res.user.id}`);
    };

    return (
        <div className="w-full max-w-md">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-bold">최초등록</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">핸드폰 번호</label>
                            <Input
                                placeholder="01012345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? '조회 중...' : '회원 조회하기'}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-sm mt-2"
                            onClick={() => router.push('/login')}
                        >
                            로그인으로 돌아가기
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
