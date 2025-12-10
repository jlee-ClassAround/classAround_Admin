import 'server-only';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionProps {
    id?: string;
    userId?: string;
    roleId?: string;
}

export async function getSession() {
    return getIronSession<SessionProps>(await cookies(), {
        cookieName: 'Session',
        password: process.env.COOKIE_PASSWORD!,
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * 60 * 6,
        },
    });
}
