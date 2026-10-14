import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: back link and title, then the room card and facts beside the map.
export default function CampLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the relief camp</output>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl lg:h-[34rem]" />
      </div>
    </div>
  )
}
