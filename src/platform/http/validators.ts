export function requireEnum<
  const T extends readonly string[]
>(
  value: string | null,
  allowed: T,
  field: string
): T[number] {
  if (
    value === null ||
    !allowed.includes(value)
  ) {
    throw new Error(
      `Invalid ${field}`
    );
  }

  return value as T[number];
}