'use client'

import { useId } from 'react'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Switch } from '@/components/shared/switch'
import { Skeleton } from '@/components/ui/skeleton'
import type { NotificationCategory } from '@/types'
import { usePreferencesQuery, useUpdatePreferences } from '../notification.queries'
import { CATEGORY_HELP, CATEGORY_LABEL, CATEGORY_NOTE, CATEGORY_ORDER } from '../notification.view'

type SwitchRowProps = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  locked?: boolean
  lockedReason?: string
}

// One switch with its name and its state in words ("On", "Off", "Always on"), so colour is never the
// only signal.
function SwitchRow({ id, label, checked, onChange, locked, lockedReason }: SwitchRowProps) {
  const state = locked ? 'Always on' : checked ? 'On' : 'Off'
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <span id={`${id}-label`} className="text-sm font-medium">
          {label}
          <span className="font-normal text-muted-foreground"> · {state}</span>
        </span>
        {locked && lockedReason && (
          <span id={`${id}-hint`} className="text-xs text-muted-foreground">
            {lockedReason}
          </span>
        )}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        labelledBy={`${id}-label`}
        describedBy={locked && lockedReason ? `${id}-hint` : undefined}
        locked={locked}
      />
    </div>
  )
}

// "Notifications" on the profile page: for each group, whether it reaches you in the app and by email.
// A switch saves as soon as it is flipped and goes back if the server refuses. A group whose
// notifications are all mandatory shows its in-app switch fixed on, with the reason.
export function NotificationPreferences() {
  const prefix = useId()
  const query = usePreferencesQuery()
  const update = useUpdatePreferences()

  if (query.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <output className="sr-only">Loading your notification settings</output>
        {CATEGORY_ORDER.map((category) => (
          <Skeleton key={category} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }
  if (query.isError) return <ListErrorState onRetry={() => query.refetch()} />

  const preferences = query.data

  function change(category: NotificationCategory, field: 'inApp' | 'email', value: boolean) {
    update.mutate({ [category]: { [field]: value } })
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {CATEGORY_ORDER.map((category) => {
          const preference = preferences[category]
          const id = `${prefix}-${category}`
          const note = CATEGORY_NOTE[category]
          return (
            <li key={category} className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold">{CATEGORY_LABEL[category]}</h3>
                <p className="text-sm text-muted-foreground">{CATEGORY_HELP[category]}</p>
                {note && <p className="text-sm text-muted-foreground">{note}</p>}
              </div>
              <SwitchRow
                id={`${id}-app`}
                label="In the app"
                checked={preference.inApp}
                locked={preference.inAppLocked}
                lockedReason="Always on so you never miss it."
                onChange={(value) => change(category, 'inApp', value)}
              />
              <SwitchRow
                id={`${id}-email`}
                label="By email"
                checked={preference.email}
                onChange={(value) => change(category, 'email', value)}
              />
            </li>
          )
        })}
      </ul>
      <p className="text-sm text-muted-foreground">
        Email goes to the address on your account, and only for the most important updates in a
        group. An emergency alert from an administrator is always emailed.
      </p>
    </>
  )
}
