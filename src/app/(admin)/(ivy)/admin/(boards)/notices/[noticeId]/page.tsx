import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { NoticeForm } from "./_components/notice-form";

interface Props {
  params: Promise<{ noticeId: string }>;
}

export default async function NoticeIdPage({ params }: Props) {
  const { noticeId } = await params;
  const id = Number(noticeId);

  const notice = isNaN(id)
    ? null
    : await db.notice.findUnique({
        where: {
          id,
        },
      });

  return (
    <Card className="p-8">
      <NoticeForm initialData={notice} />
    </Card>
  );
}
