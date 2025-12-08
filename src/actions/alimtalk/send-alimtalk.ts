"use server";

interface Props {
  sendType: "payment-confirm" | "free-course-apply";
  phone: string;
  templateCode?: string;
  username: string;
  courseName: string;
  courseDate?: string;
  location?: string;
  roomLink?: string;
  roomCode?: string;
}

export const sendAlimtalk = async ({
  sendType,
  phone,
  templateCode,
  username,
  courseName,
  courseDate,
  location,
  roomLink,
  roomCode,
}: Props) => {
  try {
    const response = await fetch(
      "https://d38ldy8f24hzxx.cloudfront.net/external/kakaoSend/instant",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "#{profile}": "49527fc3b4d8bc2c722db8adc79bfce42c658ad4",
          "#{lecture}": courseName,
          "#{강좌명}": courseName,
          "#{고객명}": username,
          "#{phone}": phone,
          ...(sendType === "payment-confirm" && {
            "#{templateCode}": "cjb_buy",
            "#{링크명}": roomLink,
            "#{입장코드}": roomCode,
          }),
          ...(sendType === "free-course-apply" && {
            "#{templateCode}": "cjb_free_comp",
            "#{장소}": location,
            "#{링크명}": roomLink,
            "#{입장코드}": roomCode,
            "#{강의시간}": courseDate,
          }),
        }),
      }
    );
    if (!response.ok) {
      console.log(response);
      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
};
