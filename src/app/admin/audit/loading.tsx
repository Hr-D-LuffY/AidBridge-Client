import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the filter box, then the table.
export default function AuditLogLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the audit log</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl sm:h-24" />
      <DataTableSkeleton columns={5} />
    </div>
  )
}
