import { TriangleAlert } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/errors'

// A save that failed, in words, next to the control that caused it.
export function ErrorLine({ error }: { error: unknown }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {getErrorMessage(error)}
    </p>
  )
}
