import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_COJOOBOO_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_COJOOBOO_SUPABASE_ANON_KEY!
);

export default supabase;
