import { Card } from "@/components/ui/card";
import { CategoryList } from "./_components/category-list";
import { CategoryForm } from "./_components/category-form";
import { getCategories } from "@/actions/categories/get-categories";

export default async function CourseCategories() {
  const categories = await getCategories({ type: "FREE_COURSE" });

  return (
    <Card className="p-8">
      <div className="text-xl font-semibold mb-3">카테고리 관리</div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2">
          <CategoryForm />
        </div>
        <div className="col-span-3">
          <CategoryList categories={categories} />
        </div>
      </div>
    </Card>
  );
}
