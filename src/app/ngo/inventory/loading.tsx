import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title with its button, the filter card, then the stock table.
export default function InventoryLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading your stock</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-44 rounded-2xl" />
      <DataTableSkeleton columns={5} />
    </div>
  )
}
