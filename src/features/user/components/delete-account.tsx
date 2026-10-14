'use client'

import { Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { useDeleteAccount } from '../user.queries'

// Deleting is a soft delete on the backend: the account can no longer log in and its email stays
// taken. It is refused (409) while a request the user is part of, as the victim or as the volunteer, is
// still unfinished. The dialog says why and what to do instead of closing on a toast.
export function DeleteAccount() {
  const remove = useDeleteAccount()
  const [open, setOpen] = useState(false)

  const blocked = isApiError(remove.error) && remove.error.isConflict

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="h-11 w-fit gap-2 px-5"
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        Delete my account
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (remove.isPending) return
          setOpen(next)
          if (!next) remove.reset()
        }}
        title="Delete your account?"
        description="You will be signed out everywhere and will not be able to log in again. This cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Keep my account"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      >
        {remove.isError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex flex-col gap-1">
              <p>{getErrorMessage(remove.error)}</p>
              {blocked && (
                <p className="text-muted-foreground">
                  A request you are part of is still open. Close it, or wait until it is finished,
                  then try again.
                </p>
              )}
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
