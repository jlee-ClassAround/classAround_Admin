import Image from "next/image";
import kakaoImage from "@/../public/kakao/kakao-chanel-icon-square.svg";

export function KakaoFloatingButton() {
  return (
    <div className="fixed bottom-4 md:bottom-8 right-4 md:right-10 z-10">
      <a
        href="http://pf.kakao.com/_SxlAnG"
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        className="flex flex-col items-center gap-y-2 hover:-translate-y-1 transition-transform"
      >
        <Image
          width={72}
          height={72}
          src={kakaoImage}
          alt="카카오 채널 아이콘"
          draggable={false}
          className="rounded-xl shadow-lg size-16 md:size-[72px] select-none"
        />
        <span className="text-sm md:text-base font-semibold text-gray-600 [text-shadow:_0_2px_4px_rgb(0_0_0_/_20%)] select-none">
          고객센터 문의
        </span>
      </a>
    </div>
  );
}
