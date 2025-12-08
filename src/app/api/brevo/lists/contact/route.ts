import { addContactToList } from "@/actions/brevo/add-contact-to-list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listId, email } = body;

    const response = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/add`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY!,
        },
        body: JSON.stringify({
          emails: [email],
        }),
      }
    );
    const data = await response.json();
    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to add contact to list", { status: 500 });
  }
}
