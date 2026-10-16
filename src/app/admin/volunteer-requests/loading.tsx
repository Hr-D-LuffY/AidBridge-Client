import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the filter chips, then the table.
export default function VolunteerRequestsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the volunteer requests</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-80 max-w-full rounded-full" />
      <DataTableSkeleton columns={5} />
    </div>
  )
}
