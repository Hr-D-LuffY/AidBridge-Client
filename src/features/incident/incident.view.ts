import { DisasterType, Priority } from '@/types'

// The words for the enums an incident carries. A plain module on purpose: server pages read it too.

export const DISASTER_LABEL: Record<DisasterType, string> = {
  [DisasterType.FLOOD]: 'Flood',
  [DisasterType.EARTHQUAKE]: 'Earthquake',
  [DisasterType.FIRE]: 'Fire',
  [DisasterType.CYCLONE]: 'Cyclone',
  [DisasterType.LANDSLIDE]: 'Landslide',
  [DisasterType.OTHER]: 'Other',
}

export const DISASTER_OPTIONS = Object.values(DisasterType).map((value) => ({
  value,
  label: DISASTER_LABEL[value],
}))

export const PRIORITY_OPTIONS = [
  { value: Priority.CRITICAL, label: 'Critical' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.LOW, label: 'Low' },
] as const
