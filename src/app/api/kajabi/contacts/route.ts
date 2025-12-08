import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const kajabiData = {
      data: {
        type: "contacts",
        attributes: {
          name: "John Doe",
          email: "testman1@gmail.com",
          phone_number: "01012341234",
          // business_number: "1234567890",
          // subscribed: true,
          address_line_1: "서울시 강남구 역삼동",
          address_line_2: "123-123",
          address_city: "Seoul",
          address_state: "Seoul",
          address_country: "Korea, Republic of",
          // external_user_id: "1234567890",
          // address_zip: "12345",
          custom_1: "커스텀 값 1", //전자책페이지
          custom_2: "커스텀 값 2", //랜딩
          custom_3: "커스텀 값 3", //레벨업코스
          custom_4: "커스텀 값 4", //시간
        },
        relationships: {
          site: {
            data: {
              id: "2147606664",
              type: "sites",
            },
          },
        },
      },
    };

    const response = await fetch("https://app.kajabi.com/api/v1/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.KAJABI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(kajabiData),
    });

    const data = await response.json();
    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating contact in Kajabi:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
