'use client'

import { AreaError } from '@/components/shared/area-views'

// Errors inside the volunteer area keep the sidebar and top bar, so the user can navigate away.
export default function VolunteerError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <AreaError homeHref="/volunteer" retry={retry} />
}
