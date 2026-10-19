'use client'

import {
  Car,
  Check,
  HeartHandshake,
  HeartPulse,
  House,
  LifeBuoy,
  type LucideIcon,
  Ship,
  Soup,
  Stethoscope,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSkillLabel, SKILL_OPTIONS } from '@/lib/skills'
import { cn } from '@/lib/utils'
import { Skill } from '@/types/enums'

// One icon per skill. The label always sits beside it, so the icon never carries the meaning alone.
const SKILL_ICON: Record<Skill, LucideIcon> = {
  [Skill.MEDICAL]: Stethoscope,
  [Skill.FIRST_AID]: HeartPulse,
  [Skill.SEARCH_RESCUE]: LifeBuoy,
  [Skill.BOAT]: Ship,
  [Skill.DRIVING]: Car,
  [Skill.FOOD_DISTRIBUTION]: Soup,
  [Skill.SHELTER_MANAGEMENT]: House,
  [Skill.COUNSELLING]: HeartHandshake,
}

// Skills as small read-only pills.
export function SkillBadges({
  skills,
  className,
}: {
  skills: readonly Skill[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {skills.map((skill) => {
        const Icon = SKILL_ICON[skill] ?? HeartPulse
        return (
          <li key={skill}>
            <Badge variant="outline" className="h-6 gap-1 px-2">
              <Icon aria-hidden="true" />
              {getSkillLabel(skill)}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

// "Special help asked for" with the skills a request wants. Nothing at all when none were asked for.
export function RequestedSkills({
  skills,
  className,
}: {
  skills: readonly Skill[]
  className?: string
}) {
  if (skills.length === 0) return null
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <p className="text-sm text-muted-foreground">Special help asked for</p>
      <SkillBadges skills={skills} />
    </div>
  )
}

const SELECTED = 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
const UNSELECTED = 'border-input bg-card hover:bg-muted'

type SkillPickerProps = {
  legend: string
  value: Skill[]
  onChange: (next: Skill[]) => void
  onBlur?: () => void
  // At most this many can be chosen; the others switch off until one is un-ticked.
  max: number
  disabled?: boolean
}

// Several can be chosen, up to `max`. A tick shows the chosen ones, so the state never relies on colour,
// and the count says why the rest switch off.
export function SkillPicker({ legend, value, onChange, onBlur, max, disabled }: SkillPickerProps) {
  const full = value.length >= max

  function toggle(skill: Skill) {
    // Keep the list in the order of the options so the same choice always sends the same list.
    onChange(
      value.includes(skill)
        ? value.filter((item) => item !== skill)
        : SKILL_OPTIONS.map((option) => option.value).filter(
            (item) => item === skill || value.includes(item),
          ),
    )
    onBlur?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <fieldset disabled={disabled} className="flex min-w-0 flex-wrap gap-2">
        <legend className="sr-only">{legend}</legend>
        {SKILL_OPTIONS.map(({ value: skill, label }) => {
          const selected = value.includes(skill)
          const Icon = SKILL_ICON[skill]
          return (
            <button
              key={skill}
              type="button"
              aria-pressed={selected}
              disabled={!selected && full}
              onClick={() => toggle(skill)}
              className={cn(
                'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                selected ? SELECTED : UNSELECTED,
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
              {selected && <Check aria-hidden="true" className="size-4 text-primary" />}
            </button>
          )
        })}
      </fieldset>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {value.length} of {max} chosen{full ? '. Un-tick one to choose another.' : '.'}
      </p>
    </div>
  )
}
