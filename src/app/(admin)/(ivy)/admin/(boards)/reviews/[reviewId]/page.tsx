import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ReviewForm } from "./_components/review-form";

interface Props {
  params: Promise<{ reviewId: string }>;
}

export default async function ReviewIdPage({ params }: Props) {
  const { reviewId } = await params;
  const id = Number(reviewId);

  const review = isNaN(id)
    ? null
    : await db.review.findUnique({
        where: {
          id,
        },
      });

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <Card className="p-8">
      <ReviewForm initialData={review} users={users} courses={courses} />
    </Card>
  );
}
