import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TaskDetailView } from '@/features/task/components/task-detail-view'
import { taskKeys } from '@/features/task/task.keys'
import { TASK_LOOKUP_PARAMS } from '@/features/task/task.params'
import { getTaskPage } from '@/features/task/task.server'
import { findTask, hasFullSos } from '@/features/task/task.view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Task' }

type PageProps = { params: Promise<{ id: string }> }

// There is no GET /tasks/:id, so the page reads the volunteer's newest 100 tasks and picks this one
// out. The id is the task's, or the request's (a chat notification links to the request). A task
// that is not in them, is someone else's, or is not in the full view (declined or cancelled before it
// was accepted) shows the area's "not found" page.
export default async function TaskPage({ params }: PageProps) {
  const { id } = await params

  const queryClient = makeQueryClient()
  const page = await queryClient.fetchQuery({
    queryKey: taskKeys.list(TASK_LOOKUP_PARAMS),
    queryFn: () => getTaskPage(TASK_LOOKUP_PARAMS),
  })

  const task = findTask(page.items, id)
  if (!task || !hasFullSos(task)) notFound()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetailView id={id} />
    </HydrationBoundary>
  )
}
