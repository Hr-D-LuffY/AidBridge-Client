import { Skill } from '@/types/enums'

// The words for the eight skills, and the limits the backend sets. A plain module on purpose: Server
// Components (the admin user page) read them too, and cannot call functions from a 'use client' file.
export const SKILL_LABEL: Record<Skill, string> = {
  [Skill.MEDICAL]: 'Medical care',
  [Skill.FIRST_AID]: 'First aid',
  [Skill.SEARCH_RESCUE]: 'Search and rescue',
  [Skill.BOAT]: 'Boat handling',
  [Skill.DRIVING]: 'Driving',
  [Skill.FOOD_DISTRIBUTION]: 'Food distribution',
  [Skill.SHELTER_MANAGEMENT]: 'Shelter management',
  [Skill.COUNSELLING]: 'Counselling',
}

export const SKILL_OPTIONS: readonly { value: Skill; label: string }[] = Object.values(Skill).map(
  (value) => ({ value, label: SKILL_LABEL[value] }),
)

export function getSkillLabel(skill: Skill) {
  return SKILL_LABEL[skill] ?? skill
}

// "Medical care, Boat handling", for a sentence.
export function formatSkillList(skills: readonly Skill[]) {
  return skills.map(getSkillLabel).join(', ')
}

// Backend limits (server constants/skills.ts, API.md 3c).
export const MAX_VOLUNTEER_SKILLS = 8
export const MAX_REQUIRED_SKILLS = 4
export const MAX_LANGUAGES = 5
export const LANGUAGE_MIN_LENGTH = 2
export const LANGUAGE_MAX_LENGTH = 30
// "On duty until" must be in the future and at most this far ahead.
export const MAX_DUTY_DAYS = 7
