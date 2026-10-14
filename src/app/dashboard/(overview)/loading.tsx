import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the overview: greeting, the SOS call to action, three numbers, then recent requests
// beside two link cards.
export default function VictimOverviewLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <output className="sr-only">Loading your overview</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          {['one', 'two', 'three'].map((id) => (
            <Skeleton key={id} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
