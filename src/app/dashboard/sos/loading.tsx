import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: header with the action, the search and filter box, then the cards.
export default function MySosLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading your requests</output>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-5 w-32" />
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
