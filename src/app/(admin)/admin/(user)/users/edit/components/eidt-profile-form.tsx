'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMyProfile } from '../actions';
import { User } from '@/generated/classaround';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditProfileFormProps {
    user: User;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
    const router = useRouter();

    const [username, setUsername] = useState(user.username ?? '');
    const [userId, setUserId] = useState(user.userId ?? '');
    const [email, setEmail] = useState(user.email ?? '');
    const [phone, setPhone] = useState(user.phone ?? '');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await updateMyProfile({
            username,
            userId,
            email,
            phone,
            password,
        });

        setLoading(false);

        if (!res.success) {
            setError(res.error ?? '알 수 없는 오류가 발생했습니다.');
            return;
        }

        alert('수정이 완료되었습니다!');
        router.push('/');
    };

    return (
        <Card className="max-w-lg w-full mx-auto shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">개인정보 수정</CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* 이름 */}
                    <div className="space-y-1.5">
                        <Label>이름</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            readOnly
                        />
                    </div>

                    {/* 아이디 */}
                    <div className="space-y-1.5">
                        <Label>아이디</Label>
                        <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
                    </div>

                    {/* 이메일 */}
                    <div className="space-y-1.5">
                        <Label>이메일</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {/* 전화번호 */}
                    <div className="space-y-1.5">
                        <Label>핸드폰 번호</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    {/* 비밀번호 */}
                    <div className="space-y-1.5">
                        <Label>새 비밀번호</Label>
                        <Input
                            type="password"
                            placeholder="변경 시에만 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <CardFooter className="p-0 pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold hover:bg-primary/90"
                        >
                            {loading ? '저장 중...' : '저장하기'}
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
    );
}
