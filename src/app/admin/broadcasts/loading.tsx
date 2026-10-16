import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the composer, then the history.
export default function BroadcastsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <output className="sr-only">Loading the broadcasts</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        {['one', 'two'].map((id) => (
          <Skeleton key={id} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
