import { Card } from "@/components/ui/card";
import { DataTable } from "../_components/data-table";
import { DataTablePagination } from "../_components/data-table-pagination";
import { columns } from "./columns";
import { getKajabiTags } from "@/actions/kajabi/get-kajabi-tags";

interface Props {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}

export default async function KajabiTags({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  // const { data, links } = await getKajabiTags({ page });
  // const tags = data?.map((item: any) => ({
  //   id: item.id,
  //   name: item.attributes.name,
  // }));

  // let kajabiUrl;
  // try {
  //   if (links.last) {
  //     kajabiUrl = new URL(links.last);
  //   } else {
  //     kajabiUrl = new URL(links.current);
  //   }
  // } catch {
  //   kajabiUrl = null;
  // }
  // const lastPage = kajabiUrl?.searchParams.get("page[number]");

  return (
    <div className="space-y-5">
      {/* <div className="flex flex-col gap-y-1">
        <h1 className="text-xl font-semibold">카자비 태그</h1>
        <p className="text-sm text-gray-500">
          태그 생성은 카자비에 접속하여 직접 생성해야 합니다.
        </p>
      </div>
      <Card className="p-8 space-y-4">
        <DataTable
          columns={columns}
          data={tags || []}
          searchKey="name"
          searchPlaceholder="태그명을 검색해보세요."
        />
        <DataTablePagination
          currentPage={Number(page)}
          totalPages={Number(lastPage) || 1}
        />
      </Card> */}
    </div>
  );
}
