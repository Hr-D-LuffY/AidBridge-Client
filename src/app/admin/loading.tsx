import { PageSkeleton } from '@/components/shared/page-skeleton'

// Fallback for every page in this area without its own loading.tsx. It also lets the shell stream
// before the page runs, so a notFound() in a page renders inside the layout instead of replacing it.
export default function AdminLoading() {
  return <PageSkeleton />
}
