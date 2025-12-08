"use client";

import { IGetCategories } from "@/actions/categories/get-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, XCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCategory, updateCategory } from "../actions";

interface Props {
  categories: IGetCategories[];
}

export function CategoryList({ categories }: Props) {
  const [editCategory, setEditCategory] = useState<{ id: string } | null>(null);
  const toggleEdit = (categoryId: string) =>
    setEditCategory(
      editCategory?.id === categoryId ? null : { id: categoryId }
    );
  const [state, action, isPending] = useActionState(updateCategory, null);
  const [error, setError] = useState<{ name?: string[] } | null>(null);

  useEffect(() => {
    if (state?.success) {
      setEditCategory(null);
    }
    if (state?.error) {
      setError(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [editCategory]);

  const onDelete = async (categoryId: string) => {
    try {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      const response = await deleteCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
    } catch (e: any) {
      console.log(e);
      toast.error(`${e?.message || "오류가 발생했습니다."}`);
    }
  };

  return (
    <div className="border rounded-md p-5 flex flex-col gap-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="px-4 py-2 rounded-md bg-slate-100 flex items-start justify-between"
        >
          {editCategory?.id === cat.id ? (
            <form
              action={action.bind(cat.id)}
              className="flex items-start gap-1"
            >
              <input
                name="categoryId"
                type="text"
                defaultValue={cat.id}
                hidden
                required
              />
              <div className="space-y-2">
                <div className="space-y-1">
                  <Input
                    name="name"
                    type="text"
                    defaultValue={cat.name}
                    required
                    disabled={isPending}
                    placeholder={"카테고리 이름"}
                  />
                  {error?.name?.map((error) => (
                    <p className="text-sm text-red-500">{error}</p>
                  ))}
                </div>
                <Textarea
                  name="description"
                  defaultValue={cat.description || ""}
                  disabled={isPending}
                  placeholder={"카테고리 설명"}
                />
              </div>
              <Button
                variant="ghost"
                disabled={isPending}
                className="border bg-white"
              >
                수정
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-1 relative py-1.5">
              <span className="font-medium">{cat.name}</span>
              {cat._count.teachers > 0 && (
                <span className="text-xs bg-primary rounded-full flex items-center justify-center aspect-square text-white size-5">
                  {cat._count.teachers}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleEdit(cat.id)}
            >
              {editCategory?.id === cat.id ? <XCircle /> : <Edit />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(cat.id)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
