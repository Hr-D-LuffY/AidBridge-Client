import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the overview: greeting, four numbers, then two lists beside three link cards.
export default function NgoOverviewLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <output className="sr-only">Loading your overview</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['one', 'two', 'three', 'four'].map((id) => (
          <Skeleton key={id} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          {['one', 'two', 'three'].map((id) => (
            <Skeleton key={id} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
