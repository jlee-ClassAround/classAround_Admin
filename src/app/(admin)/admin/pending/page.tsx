import { Button } from '@/components/ui/button';
import { caDb } from '@/lib/caDb';
import { approveAdminAction, rejectAdminAction } from './actions';
import { RejectButton } from './reject-button';

export default async function PendingUsersPage() {
    const users = await caDb.user.findMany({
        where: { roleId: '-' },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            username: true,
            userId: true,
            email: true,
            phone: true,
            createdAt: true,
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">관리자 승인 대기</h1>
                <p className="text-sm text-gray-500">
                    아직 관리자 권한이 부여되지 않은 계정 목록입니다.
                </p>
            </div>

            {users.length === 0 && (
                <div className="rounded border bg-white p-6 text-center text-gray-500">
                    승인 대기 중인 계정이 없습니다.
                </div>
            )}

            {users.length > 0 && (
                <div className="overflow-hidden rounded-lg border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-center">이름</th>
                                <th className="px-4 py-3 text-center">아이디</th>
                                <th className="px-4 py-3 text-center">이메일</th>
                                <th className="px-4 py-3 text-center">전화번호</th>
                                <th className="px-4 py-3 text-center">신청일</th>
                                <th className="px-4 py-3 text-center">처리</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center font-medium">
                                        {user.username}
                                    </td>
                                    <td className="px-4 py-3 text-center">{user.userId}</td>
                                    <td className="px-4 py-3 text-center">{user.email}</td>
                                    <td className="px-4 py-3 text-center">{user.phone}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* 승인 */}
                                            <form action={approveAdminAction}>
                                                <input
                                                    type="hidden"
                                                    name="userId"
                                                    value={user.id}
                                                />
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    승인
                                                </Button>
                                            </form>

                                            {/* 거절 */}
                                            <RejectButton
                                                userId={user.id}
                                                action={rejectAdminAction}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
