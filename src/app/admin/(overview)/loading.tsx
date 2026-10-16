import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the overview: greeting, the period bar, then the first design's numbers and charts.
export default function AdminOverviewLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <output className="sr-only">Loading the overview</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-28 rounded-2xl lg:h-24" />
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {['one', 'two', 'three', 'four', 'five', 'six'].map((id) => (
            <Skeleton key={id} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
