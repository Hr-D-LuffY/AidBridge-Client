import type { MapLegendItem, MapPlace } from '@/components/shared/places-map-canvas'
import { formatDistance } from '@/lib/format'
import { distanceBetween, fromGeoPoint, type LatLng } from '@/lib/geo'
import { type FullTask, TaskStatus } from '@/types'

// How a task being worked is shown on the volunteer's map: a violet flag at the person's exact spot (the
// task is accepted, so the position is the real one), with the straight-line distance from where the
// volunteer is now.

export const TASK_MAP_LEGEND: MapLegendItem = { label: 'Your task', tone: 'task' }

export function getTaskPosition(task: FullTask): LatLng {
  return fromGeoPoint(task.sosRequest.location)
}

// Metres in a straight line from `origin` to the person, or null before the volunteer's position is known.
export function getTaskDistance(task: FullTask, origin: LatLng | null): number | null {
  return origin ? distanceBetween(origin, getTaskPosition(task)) : null
}

export function toTaskMapPlace(task: FullTask, origin: LatLng | null): MapPlace {
  const { sosRequest: sos } = task
  const distance = getTaskDistance(task, origin)
  return {
    id: `task-${task.id}`,
    name: sos.victim.name,
    position: getTaskPosition(task),
    tone: 'task',
    glyph: 'flag',
    href: `/volunteer/tasks/${task.id}`,
    rows: [
      { label: 'Your task', value: sos.victim.name },
      ...(sos.address ? [{ label: 'Address', value: sos.address }] : []),
      ...(distance !== null
        ? [{ label: 'Distance', value: `${formatDistance(distance)} from you` }]
        : []),
    ],
    status: {
      label: task.status === TaskStatus.ON_THE_WAY ? 'You are on the way' : 'Accepted, not set off',
      tone: 'task',
    },
  }
}
