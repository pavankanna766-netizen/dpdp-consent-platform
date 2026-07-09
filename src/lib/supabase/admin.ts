import { createClient } from "@supabase/supabase-js";

import { env } from "@/config/env";

export const supabaseAdmin =
  createClient(
    env.nextPublicSupabaseUrl,
    env.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );