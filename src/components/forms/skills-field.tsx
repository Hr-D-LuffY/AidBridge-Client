'use client'

import { SkillPicker } from '@/components/shared/skill-chips'
import { MAX_REQUIRED_SKILLS } from '@/lib/skills'
import type { Skill } from '@/types/enums'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

// "Special help needed" on a request: optional, never required, at most 4.
export function SkillsField({ label, hint }: { label: string; hint?: string }) {
  const field = useFieldContext<Skill[]>()
  const error = getFieldError(field)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">
          {label} <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <SkillPicker
        legend={label}
        value={field.state.value}
        onChange={field.handleChange}
        onBlur={field.handleBlur}
        max={MAX_REQUIRED_SKILLS}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
