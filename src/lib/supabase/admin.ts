import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/config/server-env";

import { env } from "@/config/env";

export const supabaseAdmin =
  createClient(
    env.nextPublicSupabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );