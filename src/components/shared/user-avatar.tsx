import { cn } from '@/lib/utils'

type UserAvatarProps = {
  name: string
  // Pixel size of the circle.
  size?: number
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

// The person's initials in a circle. Accounts have no photo, so there is never an image to load.
// Decorative: the name is always written out as text next to it. Plain markup with no hooks.
export function UserAvatar({ name, size = 32, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        // Initials grow with a big avatar. Small ones keep the text-xs below.
        fontSize: size >= 48 ? Math.round(size * 0.36) : undefined,
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground ring-1 ring-border select-none',
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
