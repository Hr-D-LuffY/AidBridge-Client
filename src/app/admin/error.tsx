'use client'

import { AreaError } from '@/components/shared/area-views'

// Errors inside the admin area keep the sidebar and top bar, so the user can navigate away.
export default function AdminError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <AreaError homeHref="/admin" retry={retry} />
}
