import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the period bar, then the report sheet.
export default function AdminReportsLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the report</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-28 rounded-2xl lg:h-24" />
      <Skeleton className="h-[44rem] rounded-2xl" />
    </div>
  )
}
