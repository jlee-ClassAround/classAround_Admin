import { db } from "@/lib/db";
import CouponForm from "./_components/coupon-form";
import { Card } from "@/components/ui/card";

interface Props {
  params: Promise<{
    couponId: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function CouponIdPage({ params, searchParams }: Props) {
  const { couponId } = await params;
  const { search } = await searchParams;

  const coupon = await db.coupon.findUnique({
    where: {
      id: couponId,
    },
    include: {
      courses: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const courses = await db.course.findMany({
    where: {
      title: {
        contains: search,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <Card className="p-8">
      <CouponForm couponData={coupon} courses={courses} />
    </Card>
  );
}
