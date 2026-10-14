'use client'

import { AreaError } from '@/components/shared/area-views'

// Errors inside the ngo area keep the sidebar and top bar, so the user can navigate away.
export default function NgoError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <AreaError homeHref="/ngo" retry={retry} />
}
