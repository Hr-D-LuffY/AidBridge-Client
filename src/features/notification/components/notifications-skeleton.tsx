import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the notifications page: title, the filter chips, then a few cards.
export function NotificationsSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <output className="sr-only">Loading notifications</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-9 w-48 rounded-full" />
      <div className="flex flex-col gap-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
