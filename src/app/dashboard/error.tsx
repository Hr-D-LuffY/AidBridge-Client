'use client'

import { AreaError } from '@/components/shared/area-views'

// Errors inside the dashboard area keep the sidebar and top bar, so the user can navigate away.
export default function VictimError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <AreaError homeHref="/dashboard" retry={retry} />
}
