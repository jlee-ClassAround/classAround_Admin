"use server";

import { getIsAdmin } from "@/utils/auth/is-admin";
import { getCachedKajabiToken, getKajabiToken } from "./get-kajabi-token";

export interface KajabiTags {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
    };
    relationships: {
      site: {
        data: {
          id: string;
          type: string;
        };
      };
    };
  }[];
  links: {
    self: string;
    current: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export async function getKajabiTags({
  page = 1,
  size = 30,
}: {
  page?: number;
  size?: number;
}): Promise<KajabiTags> {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return {
        data: [],
        links: {
          self: "",
          current: "",
        },
      };
    }

    const token = await getKajabiToken();

    const response = await fetch(
      `https://app.kajabi.com/api/v1/contact_tags?page[number]=${page}&page[size]=${size}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return {
      data: [],
      links: {
        self: "",
        current: "",
      },
    };
  }
}
