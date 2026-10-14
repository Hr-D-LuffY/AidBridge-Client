import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { TasksView } from '@/features/task/components/tasks-view'
import { taskKeys } from '@/features/task/task.keys'
import { parseTaskHistoryParams, toHistoryQuery } from '@/features/task/task.params'
import { getActiveTasks, getTaskPage } from '@/features/task/task.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'My tasks' }

type PageProps = { searchParams: Promise<{ page?: string; status?: string }> }

// The tasks in progress and the first page of the history are fetched here and handed to the client
// view through the query cache, so the first paint already has them. The history's filter and page
// are in the URL, so the page reads them to prefetch the same list the view will ask for.
export default async function TasksPage({ searchParams }: PageProps) {
  const history = toHistoryQuery(parseTaskHistoryParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: taskKeys.active(), queryFn: getActiveTasks }),
    queryClient.prefetchQuery({
      queryKey: taskKeys.list(history),
      queryFn: () => getTaskPage(history),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TasksView />
    </HydrationBoundary>
  )
}
