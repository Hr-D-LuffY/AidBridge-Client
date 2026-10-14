import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the page: title and help line, then the request form.
export default function VolunteerRequestLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}
