// types/common.ts
export type BrandType = 'cojooboo' | 'ivy';

// 공통 User 타입
export interface CommonUser {
    id: string;
    username: string | null;
    email: string | null;
    phone: string | null;
    createdAt: Date;
}

// 공통 Order 타입
export interface CommonOrder {
    id: string;
    orderName: string;
    finalPrice: number;
    paymentStatus: string;
    createdAt: Date;
    user: {
        username: string | null;
    } | null;
}

// 공통 Course 타입
export interface CommonCourse {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    originalPrice: number | null;
    discountedPrice: number | null;
    isPublished: boolean;
}

// 공통 통계 타입
export interface DashboardStats {
    totalUsers: number;
    todayUsers: number;
    totalRevenue: number;
    totalOrders: number;
}
