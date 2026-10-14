import { Skeleton } from '@/components/ui/skeleton'

// Generic loading state for a signed-in page: a title, one line of help and a few cards. The area
// loading.tsx files use it for every page that has no skeleton of its own. Pages with a particular
// shape (a table, a form, a map) get their own loading.tsx next to them.
export function PageSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
