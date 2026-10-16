'use client'

import { Ban, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { Role, type UserProfile } from '@/types'
import { BlockAccountDialog, UnblockAccountDialog } from './block-dialogs'

// Blocking an account from its own page (the Users list has the same buttons on each row): for a scammer
// or anyone who must be kept off the platform without deleting their record. A blocked person cannot sign
// in, and a session they have open ends on its next request. Admin accounts cannot be blocked (the
// backend refuses), so the panel says so instead of offering the button.
export function BlockAccountPanel({ user }: { user: UserProfile }) {
  const [blocking, setBlocking] = useState(false)
  const [unblocking, setUnblocking] = useState(false)

  if (user.role === Role.ADMIN) {
    return (
      <section className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground sm:p-6">
        Admin accounts cannot be blocked.
      </section>
    )
  }

  if (user.isBlocked) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-destructive/40 bg-destructive-soft p-4 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Ban aria-hidden="true" className="size-5 text-destructive" />
            This account is blocked
          </h2>
          <p className="text-sm">
            {user.blockedAt ? `Blocked on ${formatDateTime(user.blockedAt)}. ` : ''}
            They cannot sign in, and nothing they had open can be used.
          </p>
          {user.blockReason && (
            <p className="rounded-xl bg-card p-3 text-sm">
              <span className="text-muted-foreground">Reason: </span>
              {user.blockReason}
            </p>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 bg-card px-4"
            onClick={() => setUnblocking(true)}
          >
            <ShieldCheck aria-hidden="true" />
            Unblock
          </Button>
        </div>
        {unblocking && <UnblockAccountDialog user={user} onClose={() => setUnblocking(false)} />}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-semibold">Block this account</h2>
        <p className="text-sm text-muted-foreground">
          For someone who is misusing AidBridge, such as a scammer. They are signed out, cannot sign
          in again, and the account is kept so you can unblock it later.
        </p>
      </div>
      <div>
        <Button
          type="button"
          variant="destructive"
          className="h-11 gap-2 px-4"
          onClick={() => setBlocking(true)}
        >
          <Ban aria-hidden="true" />
          Block account
        </Button>
      </div>
      {blocking && <BlockAccountDialog user={user} onClose={() => setBlocking(false)} />}
    </section>
  )
}
