import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { TaskDetailView } from '@/features/task/components/task-detail-view'
import { taskKeys } from '@/features/task/task.keys'
import { getTask, getTaskPage } from '@/features/task/task.server'
import { findTaskByRequest, hasFullSos } from '@/features/task/task.view'
import { isApiError } from '@/lib/api/errors'
import { MAX_PAGE_SIZE } from '@/lib/constants'
import { makeQueryClient } from '@/lib/query-client'
import type { Task } from '@/types'

export const metadata: Metadata = { title: 'Task' }

type PageProps = { params: Promise<{ id: string }> }

// The id is the task's (GET /tasks/:id). A chat notification only knows the request, so an id that is no
// task of this volunteer is looked up as a request id among their newest tasks, and the page moves to the
// task's own address. Anything else, a task that belongs to someone else, or one that is not in the full
// view (declined or cancelled before it was accepted) shows the area's "not found" page.
export default async function TaskPage({ params }: PageProps) {
  const { id } = await params

  let task: Task
  try {
    task = await getTask(id)
  } catch (error) {
    if (!isApiError(error) || ![400, 403, 404].includes(error.status)) throw error
    const page = await getTaskPage({ limit: MAX_PAGE_SIZE })
    const byRequest = findTaskByRequest(page.items, id)
    if (!byRequest) notFound()
    redirect(`/volunteer/tasks/${byRequest.id}`)
  }
  if (!hasFullSos(task)) notFound()

  const queryClient = makeQueryClient()
  queryClient.setQueryData(taskKeys.detail(id), task)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetailView id={id} />
    </HydrationBoundary>
  )
}
