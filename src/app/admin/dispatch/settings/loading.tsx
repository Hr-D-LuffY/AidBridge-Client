import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title, the on/off hero, then the step cards beside the preview.
export default function DispatchSettingsLoading() {
  return (
    <div aria-busy="true" className="flex max-w-6xl flex-col gap-6">
      <output className="sr-only">Loading the dispatch settings</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-44 rounded-3xl" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex flex-col gap-5">
          {['one', 'two', 'three'].map((id) => (
            <Skeleton key={id} className="h-56 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[34rem] rounded-2xl" />
      </div>
    </div>
  )
}
