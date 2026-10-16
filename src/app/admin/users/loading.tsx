import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title with its button, the role chips, then the table.
export default function UsersLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the users</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-96 max-w-full rounded-full" />
      <DataTableSkeleton columns={5} />
    </div>
  )
}
