'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await loginAction({ userId, password });
        if (res?.success) router.push('/');
        else alert(res.error);
    };

    return (
        <div className="w-full max-w-md">
            <Card className="shadow-xl border border-gray-200">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        관리자 로그인
                    </CardTitle>
                    <CardDescription>관리자 ID와 비밀번호를 입력해주세요.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">아이디</label>
                            <Input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="아이디 입력"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">비밀번호</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full text-base py-5">
                            로그인
                        </Button>
                        <div className="flex gap-2 mt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-1/2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => router.push('/signup')}
                            >
                                가입하기
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-1/2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => router.push('/first')}
                            >
                                최초등록 하기
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
