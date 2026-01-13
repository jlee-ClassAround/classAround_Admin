import { Button } from '@/components/ui/button';
import { caDb } from '@/lib/caDb';
import { approveAdminAction, rejectAdminAction } from './actions';
import { RejectButton } from './_components/reject-button';
import { ApproveButton } from './_components/approve-button';
import { TeacherLinker } from './_components/teacher-linker';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { ivyDb } from '@/lib/ivyDb';

export default async function PendingTeachersPage() {
    const users = await caDb.teacher.findMany({
        where: { isRegist: false },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            createdAt: true,
            brand: true,
            tId: true,
        },
    });
    // 1. 각 브랜드별 강사 풀 미리 가져오기
    const cojoobooTeachers = await cojoobooDb.teacher.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    });

    const ivyTeachers = await ivyDb.teacher.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    });
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">강사 승인 대기</h1>
                <p className="text-sm text-gray-500">
                    아직 권한이 부여되지 않은 강사계정 목록입니다.
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
                                <th className="px-4 py-3 text-center">플랫폼</th>
                                <th className="px-4 py-3 text-center">이메일</th>
                                <th className="px-4 py-3 text-center">전화번호</th>
                                <th className="px-4 py-3 text-center">신청일</th>
                                <th className="px-4 py-3 text-center">강사연결</th>
                                <th className="px-4 py-3 text-center">처리</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => {
                                const options =
                                    user.brand === 'cojooboo' ? cojoobooTeachers : ivyTeachers;
                                return (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-center font-medium">
                                            {user.username}
                                        </td>

                                        <td className="px-4 py-3 text-center">{user.brand}</td>
                                        <td className="px-4 py-3 text-center">{user.email}</td>
                                        <td className="px-4 py-3 text-center">{user.phone}</td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <TeacherLinker
                                                authTeacherId={user.id}
                                                initialTId={user.tId}
                                                options={options}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                {/* 승인 */}
                                                <ApproveButton teacherId={user.id} />

                                                {/* 거절 */}
                                                <RejectButton
                                                    teacherId={user.id}
                                                    action={rejectAdminAction}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
