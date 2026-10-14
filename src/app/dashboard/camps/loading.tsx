import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the location box and radius chips, then the list beside the map.
export default function NearbyCampsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading relief camps</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-9 w-72 rounded-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          {['one', 'two', 'three'].map((id) => (
            <Skeleton key={id} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="order-1 h-80 rounded-2xl lg:order-2 lg:h-[28rem]" />
      </div>
    </div>
  )
}
