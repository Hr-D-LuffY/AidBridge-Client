import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: back link and title, two badges, then the request beside the actions.
export default function NearbyRequestLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the request</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  )
}
