export interface DashboardStats {
    totalUsers: number;
    todayUsers: number;
    totalRevenue: number;
    totalOrders: number;
}

export interface CommonUser {
    id: string;
    username: string | null;
    email: string | null;
    phone: string | null;
    createdAt: Date;
}

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

export interface CommonCourse {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    originalPrice: number | null;
    discountedPrice: number | null;
    isPublished: boolean;
}
