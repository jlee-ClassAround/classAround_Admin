'use client';

import { Loader2 } from 'lucide-react';

export function LoadingOverlay({ show }: { show: boolean }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-lg">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-gray-700">동기화 중입니다...</p>
            </div>
        </div>
    );
}
