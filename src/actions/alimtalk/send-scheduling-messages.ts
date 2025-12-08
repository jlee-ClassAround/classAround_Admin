"use server";

interface Props {
  phone: string;
  username: string;
  courseName: string;
  courseDate: string;
  productTime: Date;
  roomLink: string;
  roomCode: string;
}

export const sendSchedulingMessages = async ({
  phone,
  username,
  courseName,
  courseDate,
  productTime,
  roomLink,
  roomCode,
}: Props) => {
  try {
    const formattedDate = productTime.toISOString().split("T")[0];

    const response = await fetch(
      "https://d38ldy8f24hzxx.cloudfront.net/external/schedule/cojooboo1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "#{lecture}": courseName,
          "#{phone}": phone,
          "#{productTime}": formattedDate,
          "#{profile}": "49527fc3b4d8bc2c722db8adc79bfce42c658ad4",
          "#{고객명}": username,
          "#{강좌명}": courseName,
          "#{강의시간}": courseDate,
          "#{입장코드}": roomCode,
          "#{링크명}": roomLink,
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
