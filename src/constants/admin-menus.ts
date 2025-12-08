import type { ComponentType } from "react";
import {
  BadgeCheckIcon,
  Bell,
  BookOpenText,
  BookText,
  GraduationCap,
  HelpCircle,
  ImagesIcon,
  MailSearchIcon,
  MonitorPlay,
  Settings,
  ShoppingCart,
  SquareLibrary,
  Tickets,
  Users,
} from "lucide-react";

interface AdminSubMenu {
  label: string;
  href: string;
  onlySuperAdmin?: boolean;
}

interface AdminMenu {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  subMenus: AdminSubMenu[];
}

export const adminRoutes: AdminMenu[] = [
  {
    label: "강의 관리",
    icon: BookOpenText,
    href: "/admin/courses",
    subMenus: [
      {
        label: "모든 강의",
        href: "/admin/courses/all",
      },
      {
        label: "강의 카테고리",
        href: "/admin/courses/categories",
      },
      {
        label: "강의 등록 관리",
        href: "/admin/courses/enrollments",
      },
    ],
  },
  {
    label: "무료 강의 관리",
    icon: MonitorPlay,
    href: "/admin/free-courses",
    subMenus: [
      {
        label: "전체",
        href: "/admin/free-courses/all",
      },
      {
        label: "카테고리",
        href: "/admin/free-courses/categories",
      },
    ],
  },
  {
    label: "전자책 관리",
    icon: BookText,
    href: "/admin/ebooks",
    subMenus: [
      {
        label: "모든 전자책",
        href: "/admin/ebooks/all",
      },
      {
        label: "전자책 카테고리",
        href: "/admin/ebooks/categories",
      },
    ],
  },
  {
    label: "상품 배지 관리",
    icon: BadgeCheckIcon,
    href: "/admin/product-badges",
    subMenus: [
      {
        label: "전체",
        href: "/admin/product-badges/all",
      },
    ],
  },
  {
    label: "쿠폰 관리",
    icon: Tickets,
    href: "/admin/coupons",
    subMenus: [
      {
        label: "전체 쿠폰",
        href: "/admin/coupons/all",
      },
    ],
  },
  {
    label: "강사 관리",
    icon: GraduationCap,
    href: "/admin/teachers",
    subMenus: [
      {
        label: "전체 강사",
        href: "/admin/teachers/all",
      },
      {
        label: "강사 카테고리",
        href: "/admin/teachers/categories",
      },
    ],
  },
  {
    label: "컬럼",
    icon: SquareLibrary,
    href: "/admin/posts",
    subMenus: [
      {
        label: "전체 컬럼",
        href: "/admin/posts",
      },
    ],
  },
  {
    label: "결제관리",
    icon: ShoppingCart,
    href: "/admin/orders",
    subMenus: [
      {
        href: "/admin/toss-customers",
        label: "결제 내역",
      },
      // {
      //   href: "/admin/payments",
      //   label: "결제 내역",
      // },
      // {
      //   href: "/admin/direct-deposit",
      //   label: "직접 계좌이체 관리",
      // },
    ],
  },
  {
    label: "사용자 관리",
    icon: Users,
    href: "/admin/users",
    subMenus: [
      {
        label: "전체 사용자",
        href: "/admin/users/all",
      },
      {
        label: "관리자 목록",
        href: "/admin/users/admins",
        onlySuperAdmin: true,
      },
    ],
  },
  {
    label: "공지사항",
    icon: Bell,
    href: "/admin/notices",
    subMenus: [
      {
        label: "전체 공지사항",
        href: "/admin/notices/all",
      },
    ],
  },
  {
    label: "자주 묻는 질문",
    icon: HelpCircle,
    href: "/admin/faqs",
    subMenus: [
      {
        label: "전체 자주 묻는 질문",
        href: "/admin/faqs/all",
      },
      {
        label: "카테고리",
        href: "/admin/faqs/categories",
      },
    ],
  },
  // {
  //   label: "게시판 관리",
  //   icon: TableOfContents,
  //   href: "/admin/boards",
  //   subMenus: [
  //     {
  //       label: "이벤트",
  //       href: "/admin/boards/events",
  //     },
  //     {
  //       label: "수강후기",
  //       href: "/admin/boards/reviews",
  //     },
  //     {
  //       label: "수익인증",
  //       href: "/admin/boards/revenues",
  //     },
  //   ],
  // },
  {
    label: "배너 관리",
    icon: ImagesIcon,
    href: "/admin/banners",
    subMenus: [
      {
        label: "메인 슬라이드",
        href: "/admin/banners/hero-sliders",
      },
    ],
  },
  {
    label: "사이트 설정",
    icon: Settings,
    href: "/admin/settings",
    subMenus: [
      {
        label: "기본",
        href: "/admin/settings/basic",
      },
      {
        label: "개인정보처리방침",
        href: "/admin/settings/terms/privacy-policy",
      },
      {
        label: "서비스 이용약관",
        href: "/admin/settings/terms/terms-of-use",
      },
      {
        label: "환불 정책",
        href: "/admin/settings/terms/refund-policy",
      },
    ],
  },
];
