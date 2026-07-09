function required(
  value: string | undefined,
  name: string
) {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`
    );
  }

  return value;
}

export const env = {
  nextPublicSupabaseUrl: required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ),

  nextPublicSupabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),

  nextPublicPrivyStackApi: required(
    process.env.NEXT_PUBLIC_PRIVYSTACK_API_URL,
    "NEXT_PUBLIC_PRIVYSTACK_API_URL"
  ),

  nextPublicTemplateToken: required(
    process.env.NEXT_PUBLIC_PRIVYSTACK_TEMPLATE_TOKEN,
    "NEXT_PUBLIC_PRIVYSTACK_TEMPLATE_TOKEN"
  ),
};