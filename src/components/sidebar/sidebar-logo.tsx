// @/components/sidebar/sidebar-logo.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <Link href="/" className="flex items-center justify-center gap-2">
            {isCollapsed ? (
                // 접혔을 때 보여줄 작은 아이콘
                <Image
                    src="/classaround_favicon.png" // 또는 작은 로고 파일명
                    alt="Icon"
                    width={25}
                    height={25}
                    className="cursor-pointer object-contain"
                />
            ) : (
                // 펼쳐졌을 때 보여줄 큰 로고
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={120}
                    height={30}
                    className="cursor-pointer object-contain"
                />
            )}
        </Link>
    );
}
