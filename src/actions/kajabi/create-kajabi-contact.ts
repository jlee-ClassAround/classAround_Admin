"use server";

import { normalizeKRPhoneNumber } from "@/utils/formats";
import { getKajabiToken } from "./get-kajabi-token";

interface Props {
  email: string;
  name: string;
  phone: string;
}

export async function createKajabiContact({ email, name, phone }: Props) {
  const kajabiBody = {
    data: {
      type: "contacts",
      attributes: {
        name: name,
        email: email,
        phone_number: normalizeKRPhoneNumber(phone),
        subscribed: true,
        // business_number: "string",
        // address_line_1: "string",
        // address_line_2: "string",
        // address_city: "string",
        // address_state: "string",
        // address_country: "string",
        // external_user_id: "string",
        // address_zip: "string",
        // custom_1: "string",
        // custom_2: "string",
        // custom_3: "string",
      },
      relationships: {
        site: {
          data: {
            id: process.env.KAJABI_SITE_ID,
            type: "sites",
          },
        },
      },
    },
  };

  const token = await getKajabiToken();

  const response = await fetch(`https://app.kajabi.com/api/v1/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(kajabiBody),
  });

  const { data, errors } = await response.json();
  if (data) {
    return {
      success: true,
      contactId: data.id,
    };
  } else {
    return {
      success: false,
    };
  }
}
