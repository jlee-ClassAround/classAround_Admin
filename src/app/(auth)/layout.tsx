import { QueryProvider } from '@/providers/query-provider';
import { clashDisplay, freesectation, nexonWarhaven } from '../(admin)/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
                        <div className="min-h-screen flex items-center justify-center bg-gray-100">
                            {children}
                        </div>
                    </div>
                </QueryProvider>
            </body>
        </html>
    );
}
