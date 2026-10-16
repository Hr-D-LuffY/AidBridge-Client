'use client'

import { useId, useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { BLOCK_REASON_MAX_LENGTH, ROLE_LABEL } from '@/lib/constants'
import { Role, type UserProfile } from '@/types'
import { useBlockUser, useUnblockUser } from '../user.queries'

// What blocking does to the account, in words, for the person about to do it.
const CONSEQUENCE: Record<Role, string> = {
  [Role.VICTIM]:
    'Every request of theirs that is still open is closed, so it leaves the volunteers’ maps, and the volunteers on them are told.',
  [Role.VOLUNTEER]:
    'Requests they already accepted stay as they are. The victims on them can still close their request.',
  [Role.NGO]: 'Their camps and stock stay as they are.',
  [Role.ADMIN]: '',
}

type DialogProps = {
  user: Pick<UserProfile, 'id' | 'name' | 'role'>
  onClose: () => void
}

// Asks before blocking an account, with a reason only admins can read (the blocked person is never shown
// it). Used from the Users list and from an account's own page. Mount it only while it is open, so the
// reason starts empty each time.
export function BlockAccountDialog({ user, onClose }: DialogProps) {
  const reasonId = useId()
  const block = useBlockUser()
  const [reason, setReason] = useState('')

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open && !block.isPending) onClose()
      }}
      title={`Block ${user.name}?`}
      description={`${ROLE_LABEL[user.role]} accounts can no longer sign in once blocked, and a session they have open ends on its next request. ${CONSEQUENCE[user.role]}`}
      confirmLabel="Block account"
      cancelLabel="Do not block"
      pending={block.isPending}
      onConfirm={() =>
        block.mutate(
          { id: user.id, name: user.name, reason: reason.trim() || undefined },
          { onSettled: onClose },
        )
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={reasonId} className="text-sm font-medium">
          Reason <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id={reasonId}
          value={reason}
          rows={3}
          maxLength={BLOCK_REASON_MAX_LENGTH}
          onChange={(event) => setReason(event.target.value)}
          placeholder="For example: fake requests reported by three volunteers."
          className="min-h-20 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
        <p className="text-sm text-muted-foreground">
          Other admins can read this. The person is not shown it.
        </p>
      </div>
    </ConfirmDialog>
  )
}

// Asks before lifting a block.
export function UnblockAccountDialog({ user, onClose }: DialogProps) {
  const unblock = useUnblockUser()

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open && !unblock.isPending) onClose()
      }}
      tone="neutral"
      title={`Unblock ${user.name}?`}
      description="They can sign in and use AidBridge again. Requests that were closed when they were blocked stay closed."
      confirmLabel="Unblock"
      cancelLabel="Keep blocked"
      pending={unblock.isPending}
      onConfirm={() => unblock.mutate({ id: user.id, name: user.name }, { onSettled: onClose })}
    />
  )
}
