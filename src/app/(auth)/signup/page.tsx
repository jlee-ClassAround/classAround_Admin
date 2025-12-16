'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupAction } from './actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignupForm {
    username: string;
    phone: string;
    email: string;
    userId: string;
    password: string;
}

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState<SignupForm>({
        username: '',
        phone: '',
        email: '',
        userId: '',
        password: '',
    });

    const onChange = (key: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [key]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await signupAction(form);
        if (res?.success) {
            alert('가입 완료! 관리자 승인 후 로그인 가능합니다.');
            router.push('/login');
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>관리자 회원가입</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Input
                            placeholder="이름"
                            value={form.username}
                            onChange={onChange('username')}
                            required
                        />
                        <Input
                            placeholder="핸드폰번호"
                            value={form.phone}
                            onChange={onChange('phone')}
                            required
                        />
                        <Input
                            placeholder="이메일"
                            value={form.email}
                            onChange={onChange('email')}
                            required
                        />
                        <Input
                            placeholder="아이디"
                            value={form.userId}
                            onChange={onChange('userId')}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={onChange('password')}
                            required
                        />

                        <Button type="submit" className="w-full">
                            가입 신청
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
