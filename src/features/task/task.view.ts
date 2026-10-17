import { type FullTask, isFullSos, SosStatus, type Task, TaskStatus } from '@/types'

// A task whose request carries the victim's phone and exact position. The backend sends the full
// view for accepted, on-the-way and completed tasks and the limited one for the rest.
export function hasFullSos(task: Task): task is FullTask {
  return isFullSos(task.sosRequest)
}

// Active tasks come from one request per status; this puts them in one list, newest first.
export function mergeActiveTasks(lists: readonly Task[][]): FullTask[] {
  return lists
    .flat()
    .filter(hasFullSos)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// What to call a task in a list: where it is, or whose it is when the address is not shared.
export function getTaskTitle(task: Task): string {
  const { sosRequest } = task
  if (isFullSos(sosRequest)) return sosRequest.address || 'Request without an address'
  return `Request from ${sosRequest.victim.name}`
}

// The request moves with its task (the backend changes both together), so a task step that is shown
// before the server answers shows the request's step too.
export const SOS_STATUS_FOR_TASK = {
  [TaskStatus.ON_THE_WAY]: SosStatus.ON_THE_WAY,
  [TaskStatus.COMPLETED]: SosStatus.RESCUED,
} as const

// A task's own page is opened with its task id (from the task board) or with its request's id (from a
// chat notification, which only knows the request). A volunteer has one task per request, so this finds
// the task of a request among a list of tasks.
export function findTaskByRequest(tasks: readonly Task[], sosId: string): Task | undefined {
  return tasks.find((task) => task.sosRequest.id === sosId)
}
