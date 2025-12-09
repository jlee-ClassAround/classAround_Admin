import type { Metadata } from 'next';
import './globals.css';

import { cn } from '@/lib/utils';
import { clashDisplay, freesectation, nexonWarhaven } from './fonts';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/sidebar/admin-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
    title: {
        default: '클래스어라운드',
        template: '%s - 클래스어라운드',
    },
    description: '클래스어라운드 관리자',
    icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body
                className={cn(
                    clashDisplay.variable,
                    nexonWarhaven.variable,
                    freesectation.className,
                    'antialiased'
                )}
            >
                <QueryProvider>
                    <div className="light text-foreground bg-background">
                        <SidebarProvider disableShortcuts>
                            <AdminSidebar />
                            <div className="relative w-full">
                                <div className="sticky top-0 left-0 w-full h-12 z-10 flex items-center px-2 bg-neutral-50 border-b">
                                    <div className="md:hidden">
                                        <SidebarTrigger />
                                    </div>
                                </div>
                                <div className="bg-slate-100 h-full">
                                    <div className="max-w-[1200px] mx-auto px-5 py-10 h-full w-full">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </SidebarProvider>
                        <Toaster richColors theme="light" />
                    </div>
                </QueryProvider>
            </body>
        </html>
    );
}
