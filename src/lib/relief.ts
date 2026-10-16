import { ReliefCategory } from '@/types/enums'

// The words for the six kinds of relief. A plain module on purpose: Server Components (the NGO
// overview) read them too, and they cannot call a function that lives in a 'use client' file.
export const RELIEF_LABEL: Record<ReliefCategory, string> = {
  [ReliefCategory.FOOD]: 'Food',
  [ReliefCategory.MEDICINE]: 'Medicine',
  [ReliefCategory.SHELTER]: 'Shelter',
  [ReliefCategory.WATER]: 'Water',
  [ReliefCategory.CLOTHING]: 'Clothing',
  [ReliefCategory.OTHER]: 'Other',
}

export function getReliefLabel(category: ReliefCategory) {
  return RELIEF_LABEL[category] ?? category
}
