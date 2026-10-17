'use client'

import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  // The ids of the text that names the switch and explains it, so a screen reader reads both.
  labelledBy: string
  describedBy?: string
  // Waiting for a save: the switch cannot be flipped again yet.
  pending?: boolean
  // Fixed on or off by a rule (not by the user): it looks fixed and cannot be flipped.
  locked?: boolean
}

// An on/off switch (`role="switch"`). The caller shows the state in words next to it, because the colour
// and the knob position alone are not enough.
export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
  pending = false,
  locked = false,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={pending || locked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:h-11',
        pending && 'cursor-wait opacity-70',
        locked && 'cursor-not-allowed opacity-60',
        checked ? 'border-primary bg-primary' : 'border-input bg-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute size-5 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  )
}
