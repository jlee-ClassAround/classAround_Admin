import '../ivy_globals.css'; // ivy 전용 css
import { ReactNode } from 'react';

export default function IvyLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
