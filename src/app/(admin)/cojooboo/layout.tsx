import '../cojooboo_globals.css'; // cojooboo 전용 css
import { ReactNode } from 'react';

export default function cojoobooLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
