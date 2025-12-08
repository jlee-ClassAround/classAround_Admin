import { sendAlimtalk } from "@/actions/alimtalk/send-alimtalk";
import { sendSchedulingMessages } from "@/actions/alimtalk/send-scheduling-messages";
import { postTracking } from "@/actions/tracking/post-tracking";
import { db } from "@/lib/db";
import { getIsLoggedIn } from "@/utils/auth/is-logged-in";
import { dateFormat, normalizeKRPhoneNumber } from "@/utils/formats";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ freeCourseId: string }> }
) {
  try {
    const isLoggedIn = await getIsLoggedIn();
    if (!isLoggedIn) {
      return NextResponse.json({
        error: "로그인을 해야 신청할 수 있습니다.",
        status: 401,
      });
    }

    const cookieStore = await cookies();
    const trkId = cookieStore.get("trkId")?.value;

    const { userId } = isLoggedIn;
    const { freeCourseId } = await params;

    // 강의 정보 검사
    const course = await db.freeCourse.findUnique({
      where: {
        id: freeCourseId,
      },
      select: {
        title: true,
        endDate: true,
        location: true,
        kakaoRoomLink: true,
        kakaoRoomPassword: true,

        webhookUrl: true,
        kakaoTemplateId: true,
        kajabiTagId: true,
      },
    });
    if (!course) {
      return new NextResponse("Not Found Course", { status: 404 });
    }

    // 이미 신청했는지 검사
    const checkApplied = await db.applyCourse.findUnique({
      where: {
        userId_freeCourseId: {
          userId,
          freeCourseId,
        },
      },
      select: {
        id: true,
      },
    });
    if (checkApplied) {
      return new NextResponse("이미 신청하셨습니다.", { status: 400 });
    }

    let userData;
    userData = await db.$transaction(async (tx) => {
      await tx.applyCourse.create({
        data: {
          userId,
          freeCourseId,
        },
        select: {
          id: true,
        },
      });
      userData = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          optedIn: true,
        },
        select: {
          username: true,
          phone: true,
          kajabiContactId: true,
        },
      });
      return userData;
    });

    // 신청 완료 후 유저에게 알림 전송
    if (
      userData.phone &&
      userData.username &&
      course.endDate &&
      course.kakaoRoomLink &&
      course.kakaoRoomPassword
    ) {
      const formattedPhone = normalizeKRPhoneNumber(userData.phone);

      await sendSchedulingMessages({
        phone: formattedPhone,
        username: userData.username,
        courseName: course.title,
        courseDate: course.endDate ? dateFormat(course.endDate) : "",
        productTime: course.endDate,
        roomLink: course.kakaoRoomLink,
        roomCode: course.kakaoRoomPassword,
      });
    }

    // 트래킹 전송
    if (trkId) {
      const formattedPhone = normalizeKRPhoneNumber(userData.phone || "");
      await postTracking({
        userId,
        parameterName: trkId,
        username: userData?.username || "",
        nickname: userData?.username || "",
        phone: formattedPhone,
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (e) {
    console.log("[COURSE_APPLY_ERROR]", e);
    return NextResponse.json({ error: "Internal Server Error", status: 500 });
  }
}
