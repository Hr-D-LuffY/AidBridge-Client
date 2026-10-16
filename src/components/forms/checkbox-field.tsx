'use client'

import { useId } from 'react'
import { useFieldContext } from './form-context'

type CheckboxFieldProps = {
  label: string
  // What switching it on does, in one line.
  hint?: string
}

// A yes/no choice bound to the surrounding form field. The whole row is the click target (44 px tall),
// and the label says what the box means, so it never relies on the tick alone.
export function CheckboxField({ label, hint }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>()
  const id = useId()

  return (
    <label
      htmlFor={id}
      className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-input p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-sidebar-accent has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
    >
      <input
        id={id}
        name={field.name}
        type="checkbox"
        checked={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      </span>
    </label>
  )
}
