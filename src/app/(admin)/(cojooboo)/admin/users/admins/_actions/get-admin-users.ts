"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { SortingState } from "@tanstack/react-table";

interface GetAdminUsersParams {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

const ADMIN_ROLE_IDS = ["admin", "super-admin"];

export async function getAdminUsers({
  currentPage = 1,
  pageSize = 50,
  search = "",
  sort = "createdAt",
  order = "desc",
}: GetAdminUsersParams) {
  const filters: Prisma.UserWhereInput[] = [
    {
      roleId: {
        in: ADMIN_ROLE_IDS,
      },
    },
  ];

  if (search) {
    filters.push({
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const whereClause =
    filters.length > 1 ? { AND: filters } : filters.at(0) ?? {};

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [sort]: order,
  };

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const serverSorting: SortingState = [{ id: sort, desc: order === "desc" }];

  return {
    users,
    totalCount,
    totalPages,
    serverSorting,
  };
}
