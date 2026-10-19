// Backend limit on an unassign reason (constants/dispatch.ts MAX_DISPATCH_NOTE_LENGTH).
export const MAX_DISPATCH_NOTE_LENGTH = 500

// "5 min", "2 h", "1 h 30 min". A number that is not valid yet (a half-typed box) reads as a dash.
export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes)) return '–'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

// The distance of each search round: the first distance, then each round widens by `factor`, never past the
// widest. A run that has reached the widest shows it once. Empty when the numbers are not usable yet.
export function getRingRadii(
  start: number,
  factor: number,
  widest: number,
  rounds: number,
): number[] {
  if (![start, factor, widest, rounds].every(Number.isFinite) || start <= 0 || widest <= 0) {
    return []
  }
  const radii: number[] = []
  let radius = start
  for (let round = 0; round < Math.min(Math.max(rounds, 1), 10); round++) {
    const capped = Math.round(Math.min(radius, widest) * 10) / 10
    if (radii.at(-1) !== capped) radii.push(capped)
    radius *= Math.max(factor, 1)
  }
  return radii
}
