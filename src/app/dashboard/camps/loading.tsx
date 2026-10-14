import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the location box, the big map with its bar, then the camp cards.
export default function NearbyCampsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading relief camps</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-[34rem] rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
