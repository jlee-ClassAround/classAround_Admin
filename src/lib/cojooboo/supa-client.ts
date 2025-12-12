import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_COJOOBOO_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_COJOOBOO_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export default supabase;
