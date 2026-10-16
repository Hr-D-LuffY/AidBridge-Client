import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: back link and name, then the account card.
export default function UserDetailLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading the account</output>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-64 max-w-full" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}
