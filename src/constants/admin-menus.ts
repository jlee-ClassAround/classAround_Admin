// src/constants-menus.ts
import type { ComponentType } from 'react';
import {
    Bitcoin,
    Shapes,
    Gauge,
    BookOpenText,
    MonitorPlay,
    BookText,
    BadgeCheckIcon,
    Tickets,
    GraduationCap,
    SquareLibrary,
    ShoppingCart,
    Users,
    Bell,
    HelpCircle,
    ImagesIcon,
    Settings,
} from 'lucide-react';

/* ---------- 타입 ---------- */
export interface AdminSubMenu {
    label: string;
    href: string;
    onlySuperAdmin?: boolean;
}

export interface AdminMenu {
    label: string;
    icon: ComponentType<{ className?: string }>;
    href: string;
    subMenus: AdminSubMenu[];
}

export interface AdminMenuGroup {
    title: string;
    prefix: string;
    icon: ComponentType<{ className?: string }>;
    menus: AdminMenu[];
}

/* ---------- 기본 메뉴 ---------- */
export const baseAdminMenus: AdminMenu[] = [
    {
        label: '강의 관리',
        icon: BookOpenText,
        href: '/courses',
        subMenus: [
            { label: '모든 강의', href: '/courses/all' },
            { label: '강의 카테고리', href: '/courses/categories' },
            { label: '강의 등록 관리', href: '/courses/enrollments' },
        ],
    },
    {
        label: '무료 강의 관리',
        icon: MonitorPlay,
        href: '/free-courses',
        subMenus: [
            { label: '전체', href: '/free-courses/all' },
            { label: '카테고리', href: '/free-courses/categories' },
        ],
    },
    {
        label: '전자책 관리',
        icon: BookText,
        href: '/ebooks',
        subMenus: [
            { label: '모든 전자책', href: '/ebooks/all' },
            { label: '전자책 카테고리', href: '/ebooks/categories' },
        ],
    },
    {
        label: '상품 배지 관리',
        icon: BadgeCheckIcon,
        href: '/product-badges',
        subMenus: [{ label: '전체', href: '/product-badges/all' }],
    },
    {
        label: '쿠폰 관리',
        icon: Tickets,
        href: '/coupons',
        subMenus: [{ label: '전체 쿠폰', href: '/coupons/all' }],
    },
    {
        label: '강사 관리',
        icon: GraduationCap,
        href: '/teachers',
        subMenus: [
            { label: '전체 강사', href: '/teachers/all' },
            { label: '강사 카테고리', href: '/teachers/categories' },
        ],
    },
    {
        label: '컬럼',
        icon: SquareLibrary,
        href: '/posts',
        subMenus: [{ label: '전체 컬럼', href: '/posts' }],
    },
    {
        label: '결제관리',
        icon: ShoppingCart,
        href: '/orders',
        subMenus: [
            { label: '결제 내역', href: '/toss-customers' },
            { label: '강의별 결제내역', href: '/lecture-payments' },
        ],
    },
    {
        label: '사용자 관리',
        icon: Users,
        href: '/users',
        subMenus: [
            { label: '전체 사용자', href: '/users/all' },
            { label: '관리자 목록', href: '/userss', onlySuperAdmin: true },
        ],
    },
    {
        label: '공지사항',
        icon: Bell,
        href: '/notices',
        subMenus: [{ label: '전체 공지사항', href: '/notices/all' }],
    },
    {
        label: '자주 묻는 질문',
        icon: HelpCircle,
        href: '/faqs',
        subMenus: [
            { label: '전체 자주 묻는 질문', href: '/faqs/all' },
            { label: '카테고리', href: '/faqs/categories' },
        ],
    },
    {
        label: '배너 관리',
        icon: ImagesIcon,
        href: '/banners',
        subMenus: [{ label: '메인 슬라이드', href: '/banners/hero-sliders' }],
    },
    {
        label: '사이트 설정',
        icon: Settings,
        href: '/settings',
        subMenus: [
            { label: '기본', href: '/settings/basic' },
            { label: '개인정보처리방침', href: '/settings/terms/privacy-policy' },
            { label: '서비스 이용약관', href: '/settings/terms/terms-of-use' },
            { label: '환불 정책', href: '/settings/terms/refund-policy' },
        ],
    },
];

/* ---------- prefix 변환 ---------- */
function withPrefix(prefix: string, menus: AdminMenu[]): AdminMenu[] {
    return menus.map((menu) => ({
        ...menu,
        href: `/${prefix}${menu.href}`,
        subMenus: menu.subMenus.map((sub) => ({
            ...sub,
            href: `/${prefix}${sub.href}`,
        })),
    }));
}

/* ---------- 대시보드 메뉴 추가 ---------- */
function addDashboard(prefix: string): AdminMenu {
    return {
        label: '대시보드',
        icon: Gauge,
        href: `/${prefix}`,
        subMenus: [],
    };
}

/* ---------- 브랜드 메뉴 그룹 ---------- */
export const adminMenuGroups: AdminMenuGroup[] = [
    {
        title: '코주부 스쿨',
        prefix: 'cojooboo',
        icon: Bitcoin,
        menus: [addDashboard('cojooboo'), ...withPrefix('cojooboo', baseAdminMenus)],
    },
    {
        title: '아이비 클래스',
        prefix: 'ivy',
        icon: Shapes,
        menus: [addDashboard('ivy'), ...withPrefix('ivy', baseAdminMenus)],
    },
];
