import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { FaqForm } from "./_components/faq-form";
import { getCategories } from "@/actions/categories/get-categories";

interface Props {
  params: Promise<{ faqId: string }>;
}

export default async function FaqIdPage({ params }: Props) {
  const { faqId } = await params;
  const id = Number(faqId);

  const faq = isNaN(id)
    ? null
    : await db.faq.findUnique({
        where: {
          id,
        },
      });

  const categories = await getCategories({ type: "FAQ" });

  return (
    <Card className="p-8">
      <FaqForm initialData={faq} categories={categories} />
    </Card>
  );
}
