import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { PartialCourseModal } from './partial-course-modal';
import { Eye, SquarePen, Trash } from 'lucide-react';
import Link from 'next/link';
import { PartialCourseDeleteButton } from './partial-course-delete-button';

interface Props {
    courseId: string;
    title: string;
}

export default async function PartialCourseForm({ courseId, title }: Props) {
    const partialCourses = await cojoobooDb.partialCourse.findMany({
        where: { mainId: courseId },
        select: {
            id: true,
            title: true,
            originalPrice: true,
            createdAt: true,
            isHidden: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card className="p-6 mt-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between border-b pb-5">
                    <h2 className="text-lg font-semibold">분할 결제 옵션 목록</h2>
                    <PartialCourseModal
                        mode="create"
                        courseId={courseId}
                        courseTitle={title}
                        trigger={<Button>분할 결제 추가</Button>}
                    />
                </div>

                {/* 테이블 */}
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-2 text-center">제목</th>
                                <th className="p-2 text-center">가격</th>
                                <th className="p-2 text-center">생성일</th>
                                <th className="p-2 text-center">액션</th>
                            </tr>
                        </thead>

                        <tbody>
                            {partialCourses.map((item) => (
                                <tr key={item.id} className="border-b">
                                    {/* 제목 */}
                                    <td className="p-2">{item.title}</td>

                                    {/* 가격 */}
                                    <td className="p-2 text-center">
                                        {item.originalPrice
                                            ? item.originalPrice.toLocaleString() + '원'
                                            : '-'}
                                    </td>

                                    {/* 생성일 */}
                                    <td className="p-2 text-center">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>

                                    {/* 액션 영역 */}
                                    <td className="p-2 text-right  flex items-center justify-center">
                                        {/* 수정 버튼 → SquarePen 모달 */}
                                        <PartialCourseModal
                                            mode="edit"
                                            courseId={courseId}
                                            initialData={item}
                                            trigger={
                                                <Button variant="ghost" size="icon">
                                                    <SquarePen className="w-4 h-4" />
                                                </Button>
                                            }
                                        />

                                        {/* 삭제 버튼 → Trash */}
                                        <PartialCourseDeleteButton id={item.id} />

                                        <Button variant="ghost" size="icon" asChild>
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_COJOOBOO_APP_URL}/partial-courses/${item.id}`}
                                            >
                                                <Eye className="size-4" />
                                                <span className="sr-only">미리보기</span>
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {partialCourses.length === 0 && (
                    <p className="text-gray-500 mt-4">아직 생성된 옵션이 없습니다.</p>
                )}
            </Card>
        </div>
    );
}
