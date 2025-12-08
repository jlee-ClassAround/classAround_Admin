import { getCategories } from "@/actions/categories/get-categories";
import { Card } from "@/components/ui/card";
import { CategoryForm } from "./_components/category-form";
import { CategoryList } from "./_components/category-list";

export default async function TeacherCategories() {
  const categories = await getCategories({ type: "TEACHER" });

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
