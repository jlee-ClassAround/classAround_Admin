import { db } from "@/lib/db";
import { EbookForm } from "./_components/ebook-form";
import { notFound } from "next/navigation";
import { getCategories } from "@/actions/categories/get-categories";

export default async function EbookIdPage({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}) {
  const { ebookId } = await params;
  const ebook = await db.ebook.findUnique({
    where: {
      id: ebookId,
    },
    include: {
      detailImages: true,
      productBadge: true,
    },
  });
  if (!ebook) return notFound();

  const categories = await getCategories({ type: "EBOOK" });
  const productBadges = await db.productBadge.findMany();

  return (
    <>
      <EbookForm
        ebook={ebook}
        categories={categories}
        productBadges={productBadges}
      />
    </>
  );
}
