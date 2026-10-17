const OBJECT_ID = /^[0-9a-f]{24}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

// Checks for values read from a URL, which anyone can hand-edit. A bad value means "no filter" instead of
// reaching the backend as a 400.

export function asObjectId(value: string | undefined): string | undefined {
  return value && OBJECT_ID.test(value) ? value : undefined
}

// A real calendar date (yyyy-mm-dd), so ?from=2026-13-45 is dropped.
export function asDate(value: string | undefined): string | undefined {
  if (!value || !DATE.test(value)) return undefined
  return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? undefined : value
}

// A comma list ("pending,assigned") reduced to the values that are allowed, once each, in the allowed order.
export function asList<T extends string>(allowed: readonly T[], value: string | undefined): T[] {
  const wanted = new Set((value ?? '').split(','))
  return allowed.filter((option) => wanted.has(option))
}
