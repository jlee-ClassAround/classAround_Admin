import { Card } from "@/components/ui/card";
import { EnrollForm } from "./_components/enroll-form";
import { db } from "@/lib/db";

interface Props {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function EnrollPage({ searchParams }: Props) {
  const { search } = await searchParams;

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  const users = await db.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
    },
    take: 100,
  });

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">수동 등록하기</h1>
      </div>
      <Card className="p-8">
        <EnrollForm courses={courses} users={users} />
      </Card>
    </div>
  );
}
