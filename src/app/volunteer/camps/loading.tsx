import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, then a card per camp with its stock.
export default function MyCampsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading your camps</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {['one', 'two'].map((id) => (
          <Skeleton key={id} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
