import {
  BookOpenTextIcon,
  Heart,
  LucideVerified,
  PlayCircle,
  Settings,
  Ticket,
  Wallet,
} from "lucide-react";

export const mypageMenus = [
  {
    label: "내 강의실",
    href: "/mypage/studyroom",
    icon: PlayCircle,
  },
  {
    label: "무료 강의",
    href: "/mypage/free-courses",
    icon: LucideVerified,
  },
  {
    label: "전자책",
    href: "/mypage/ebooks",
    icon: BookOpenTextIcon,
  },
  // {
  //   label: "찜목록",
  //   href: "/mypage/favorite",
  //   icon: Heart,
  // },
  {
    label: "쿠폰목록",
    href: "/mypage/coupon",
    icon: Ticket,
  },
  {
    label: "구매내역",
    href: "/mypage/orders",
    icon: Wallet,
  },
  {
    label: "회원정보관리",
    href: "/mypage/info",
    icon: Settings,
  },
];
