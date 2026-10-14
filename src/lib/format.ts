import { format, formatDistanceToNow } from 'date-fns'

// Display formatting shared by the screens. Dates are added with the first screen that shows one.

// 1536 -> "1.5 KB", 10485760 -> "10 MB".
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${units[unit]}`
}

// "3 minutes ago", for lists where the exact time matters less than how fresh it is.
export function formatRelativeTime(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

// "14 Oct 2026"
export function formatDate(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy')
}

// "14 Oct 2026, 3:05 PM"
export function formatDateTime(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy, h:mm a')
}

// 850 -> "850 m", 2611 -> "2.6 km"
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}
