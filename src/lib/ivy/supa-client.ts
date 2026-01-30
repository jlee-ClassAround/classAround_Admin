import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_IVY_SUPABASE_URL!,
    process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_IVY_SUPABASE_ANON_KEY!
        : process.env.NEXT_PUBLIC_IVY_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export default supabase;
