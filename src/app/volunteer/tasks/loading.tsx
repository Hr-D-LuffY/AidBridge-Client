import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, tasks in progress, then the history with its filter.
export default function TasksLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <output className="sr-only">Loading your tasks</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 lg:grid-cols-2">
          {['one', 'two'].map((id) => (
            <Skeleton key={id} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-80 max-w-full rounded-full" />
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
