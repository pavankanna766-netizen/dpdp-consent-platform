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

export const serverEnv = {
  supabaseServiceRoleKey: required(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY"
  ),
};